/**
 * Privacy Policy Analyzer
 *
 * Fetches a site's privacy policy and sends it to Gemini for structured
 * plain-language extraction. Background service workers are not subject
 * to CORS, so cross-origin fetches work freely here.
 */

// ---------------------------------------------------------------------------
// Policy URL Discovery
// ---------------------------------------------------------------------------

// Known policy URLs for major sites (avoids the guessing game for demo targets)
// Curated Demo 10 (Reliable policy discovery for these targets)
const KNOWN_POLICY_URLS: Record<string, string> = {
  "github.com":    "https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement",
  "notion.so":     "https://www.notion.so/Privacy-Policy-3468d120cf614d4c9014c09f6adc9091",
  "spotify.com":   "https://www.spotify.com/us/legal/privacy-policy/",
  "instagram.com": "https://privacycenter.instagram.com/policy",
  "tiktok.com":    "https://www.tiktok.com/legal/page/us/privacy-policy/en",
  "vercel.com":    "https://vercel.com/legal/privacy-policy",
  "figma.com":     "https://www.figma.com/legal/privacy/",
  "linkedin.com":  "https://www.linkedin.com/legal/privacy-policy",
  "amazon.com":    "https://www.amazon.com/gp/help/customer/display.html?nodeId=GX7NJQ4ZB8MHFRNJ",
  "discord.com":   "https://discord.com/privacy",
};

// Common path patterns to try for unknown domains, in order of likelihood
const POLICY_PATH_CANDIDATES = [
  "/privacy-policy",
  "/privacy",
  "/legal/privacy",
  "/legal/privacy-policy",
  "/en/privacy",
  "/about/privacy",
  "/policies/privacy",
  "/terms/privacy",
];

// Simple in-memory cache to avoid re-resolution within a single session
const POLICY_URL_CACHE = new Map<string, string | null>();

/**
 * Scrapes the homepage for an <a> tag pointing to a privacy or legal page.
 * Useful for modern SaaS platforms with non-standard legal paths.
 */
async function discoverPolicyUrlFromHomepage(domain: string): Promise<string | null> {
  try {
    const url = `https://${domain}`;
    const res = await fetch(url, { 
      signal: AbortSignal.timeout(3000), // Reduced from 5s
      headers: { "User-Agent": "Mozilla/5.0 (compatible; Consently/1.0)" } 
    });
    if (!res.ok) return null;
    
    const html = await res.text();
    // Basic regex to find hrefs and inner text.
    const regex = /<a\s+(?:[^>]*?\s+)?href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    let match;
    const candidates: { href: string, text: string }[] = [];
    
    while ((match = regex.exec(html)) !== null) {
      const href = match[1];
      const text = match[2].toLowerCase();
      const lowerHref = href.toLowerCase();
      // Look for paths or link text that likely point to a privacy policy
      if ((lowerHref.includes("privacy") || lowerHref.includes("legal") || text.includes("privacy")) && 
          !lowerHref.endsWith(".css") && 
          !lowerHref.endsWith(".js") &&
          !lowerHref.includes("javascript:")) {
        candidates.push({ href, text });
      }
    }

    if (candidates.length === 0) return null;

    // Prefer relative paths or links explicitly containing the domain
    const domainCandidates = candidates.filter(c => !c.href.startsWith("http") || c.href.includes(domain));
    const finalCandidates = domainCandidates.length > 0 ? domainCandidates : candidates;

    // Heavily prefer links that explicitly mention privacy in url or text
    const bestItem = finalCandidates.find(c => c.href.toLowerCase().includes("privacy") || c.text.includes("privacy")) || finalCandidates[0];
    const bestHref = bestItem.href;

    // Resolve relative URL
    if (bestHref.startsWith("http")) {
      return bestHref;
    } else if (bestHref.startsWith("/")) {
      return `https://${domain}${bestHref}`;
    } else {
      return `https://${domain}/${bestHref}`;
    }
  } catch (err) {
    console.error("[Consently] Failed to discover policy from homepage:", err);
    return null;
  }
}

/**
 * Resolves the privacy policy URL for a given domain.
 * Uses the known map first, then tries common paths, and finally scrapes the homepage.
 */
async function resolvePolicyUrl(domain: string): Promise<string | null> {
  const cleanDomain = domain.replace(/^www\./, "");

  // Check exact match first, then root domain (strips subdomains like "accounts.spotify.com" → "spotify.com")
  const rootDomain = cleanDomain.split(".").slice(-2).join(".");
  if (KNOWN_POLICY_URLS[cleanDomain]) {
    return KNOWN_POLICY_URLS[cleanDomain];
  }
  if (KNOWN_POLICY_URLS[rootDomain]) {
    return KNOWN_POLICY_URLS[rootDomain];
  }

  if (POLICY_URL_CACHE.has(cleanDomain)) {
    console.log(`[Consently] Using cached policy URL for ${cleanDomain}`);
    return POLICY_URL_CACHE.get(cleanDomain) || null;
  }

  // 1. Scraping the homepage first (much faster + accurate for modern sites)
  console.log(`[Consently] Scraping homepage of ${domain} for privacy link...`);
  const scrapedUrl = await discoverPolicyUrlFromHomepage(domain);
  if (scrapedUrl) {
    POLICY_URL_CACHE.set(cleanDomain, scrapedUrl);
    return scrapedUrl;
  }

  // 2. Fallback: try common paths concurrently
  console.log(`[Consently] Homepage scrape failed for ${domain}, trying common paths...`);
  const fetchPromises = POLICY_PATH_CANDIDATES.map(async (path) => {
    const url = `https://${domain}${path}`;
    // Use GET as HEAD is sometimes blocked or not handled correctly by SPAs.
    // Timeout of 3000ms helps avoid holding up the UI un-necessarily.
    const res = await fetch(url, { method: "GET", signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      return url;
    }
    throw new Error("Not a valid URL");
  });

  try {
    const result = await Promise.any(fetchPromises);
    POLICY_URL_CACHE.set(cleanDomain, result);
    return result;
  } catch {
    console.log(`[Consently] All recovery mechanisms failed for ${domain}`);
    POLICY_URL_CACHE.set(cleanDomain, null);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Policy Text Extraction
// ---------------------------------------------------------------------------

const MAX_POLICY_CHARS = 4000; // Keep prompt small for faster free-tier inference

/**
 * Fetches the policy page and extracts meaningful text content.
 * Strips HTML, scripts, nav, footer boilerplate.
 */
async function fetchPolicyText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      headers: { "User-Agent": "Mozilla/5.0 (compatible; Consently/1.0)" },
    });

    if (!res.ok) return null;

    const html = await res.text();
    const text = extractTextFromHtml(html);
    return text.slice(0, MAX_POLICY_CHARS);
  } catch (err) {
    console.error("[Consently] Failed to fetch policy:", url, err);
    return null;
  }
}

/**
 * Strips HTML tags and normalises whitespace to produce clean plain text.
 * Removes script, style, nav, header, footer blocks first.
 */
function extractTextFromHtml(html: string): string {
  // Remove script/style/nav/header/footer blocks entirely
  const cleaned = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
    // Strip remaining tags
    .replace(/<[^>]+>/g, " ")
    // Decode common HTML entities
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    // Collapse whitespace
    .replace(/\s+/g, " ")
    .trim();

  return cleaned;
}

// ---------------------------------------------------------------------------
// Gemini Analysis
// ---------------------------------------------------------------------------

export interface PolicyAnalysis {
  appName: string;
  dataCollected: string[];  // Plain-language list
  sharedWith: string[];     // Third parties named
  userRights: string[];     // What users can do
  redFlag: string | null;   // Single most alarming finding
  plainSummary: string;     // 2-sentence max plain-language summary
  riskVerdict: "LOW" | "MEDIUM" | "HIGH";
  source: "ai" | "fallback";
  privacyPolicyUrl?: string; // Appended by analyzer after successful fetch
}

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_MODEL = "nvidia/nemotron-3-super-120b-a12b:free";

const ANALYSIS_PROMPT = (appName: string, policyText: string) => `
You are a privacy policy analyst. Analyze the following privacy policy text for "${appName}" and return ONLY a valid JSON object with no markdown, no code fences, no explanation.

Required JSON structure:
{
  "dataCollected": ["string", ...],
  "sharedWith": ["string", ...],
  "userRights": ["string", ...],
  "redFlag": "string or null",
  "plainSummary": "string",
  "riskVerdict": "LOW" | "MEDIUM" | "HIGH"
}

Privacy Policy Text:
${policyText}
`;

async function analyzeWithOpenRouter(
  appName: string,
  policyText: string,
  apiKey: string
): Promise<PolicyAnalysis | null> {
  try {
    const res = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://consently-app.vercel.app",
        "X-Title": "Consently",
      },
      signal: AbortSignal.timeout(30000),
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [{ role: "user", content: ANALYSIS_PROMPT(appName, policyText) }],
        temperature: 0.1,
        max_tokens: 512,
      }),
    });

    if (!res.ok) {
      console.error("[Consently] OpenRouter API error:", res.status, await res.text());
      return null;
    }

    const data = await res.json();
    const rawText: string = data?.choices?.[0]?.message?.content ?? "";

    const jsonStr = rawText.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    const parsed = JSON.parse(jsonStr) as Omit<PolicyAnalysis, "appName" | "source">;
    return { ...parsed, appName, source: "ai" };
  } catch (err) {
    console.error("[Consently] OpenRouter parse error:", err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Full pipeline: resolve policy URL → fetch text → analyze → return findings.
 * Returns null if any step fails (caller should show fallback).
 */
export async function analyzePolicyForDomain(
  domain: string,
  appName: string
): Promise<PolicyAnalysis | null> {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

  if (!apiKey) {
    console.warn("[Consently] No OpenRouter API key set — skipping AI analysis");
    return null;
  }

  console.log(`[Consently] Resolving privacy policy for ${domain}...`);
  const policyUrl = await resolvePolicyUrl(domain);

  if (!policyUrl) {
    console.warn(`[Consently] Could not find privacy policy for ${domain}`);
    return null;
  }

  console.log(`[Consently] Fetching policy from ${policyUrl}...`);
  const policyText = await fetchPolicyText(policyUrl);

  if (!policyText || policyText.length < 200) {
    console.warn(`[Consently] Policy text too short or empty for ${domain}`);
    return null;
  }

  console.log(`[Consently] Analyzing ${policyText.length} chars with OpenRouter...`);
  const analysis = await analyzeWithOpenRouter(appName, policyText, apiKey);

  if (analysis) {
    analysis.privacyPolicyUrl = policyUrl;
    console.log(`[Consently] Analysis complete for ${appName}:`, analysis);
  }

  return analysis;
}
