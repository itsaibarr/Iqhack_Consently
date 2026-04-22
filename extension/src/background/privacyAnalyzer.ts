/**
 * Privacy Policy Analyzer
 *
 * Receives pre-extracted page text (from the content script reading the live DOM)
 * and sends it to OpenRouter for structured plain-language extraction.
 */

export interface PolicyAnalysis {
  appName: string;
  dataCollected: string[];
  sharedWith: string[];
  userRights: string[];
  redFlag: string | null;
  plainSummary: string;
  riskVerdict: "LOW" | "MEDIUM" | "HIGH";
  dpoEmail: string | null;
  source: "ai" | "fallback";
  privacyPolicyUrl?: string;
}

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_MODEL = "nvidia/nemotron-3-super-120b-a12b:free";

const SYSTEM_PROMPT = `You are a privacy policy JSON extractor. You MUST respond with ONLY a raw JSON object. No prose, no markdown, no explanation, no code fences. Your entire response must start with { and end with }.`;

const USER_PROMPT = (appName: string, policyText: string) =>
  `Analyze this privacy policy for "${appName}". Return ONLY this JSON structure:
{"dataCollected":["list of data types collected"],"sharedWith":["list of third parties"],"userRights":["list of user rights"],"redFlag":"most concerning finding or null","plainSummary":"2-3 sentence plain English summary","riskVerdict":"LOW or MEDIUM or HIGH","dpoEmail":"data protection officer or privacy contact email address found in the policy, or null if not found"}

Risk calibration rules:
- Data collected for core service functionality (e.g. billing email, name for login) is LOW sensitivity even if collected in volume.
- Sensitive data categories (biometric, health, financial profiling, precise location, full email inbox access) are HIGH regardless of company size.
- Well-known, regulated companies (Google, Apple, Microsoft, Anthropic, GitHub, Stripe, Meta, Slack, Spotify, Notion, Figma, etc.) have established privacy programs — weigh their data collection as LOWER risk than the same data from an unknown startup.
- Consider both WHAT is collected AND the company's accountability level. An email address from Anthropic is LOW; biometric data from any company is HIGH.
- Only assign HIGH riskVerdict if the data profile is genuinely invasive (multiple sensitive categories, broad sharing, or profiling without clear consent).

Policy text:
${policyText}`;

// ---------------------------------------------------------------------------
// JSON extraction — handles models that wrap JSON in prose
// ---------------------------------------------------------------------------

function extractJson(raw: string): Record<string, unknown> | null {
  // 1. Strip code fences
  const cleaned = raw.replace(/```(?:json)?\s*/g, "").replace(/```\s*/g, "").trim();

  // 2. Try direct parse first
  try {
    return JSON.parse(cleaned);
  } catch { /* continue */ }

  // 3. Extract the first top-level {...} block from mixed prose
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch { /* continue */ }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Fallback — build a basic analysis from the page text itself
// ---------------------------------------------------------------------------

function extractEmailFromText(text: string): string | null {
  // 1. Find all emails in the text
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const allEmails = text.match(emailPattern) ?? [];

  if (allEmails.length === 0) return null;

  // 2. Look for specialized privacy keywords near emails or specifically named emails
  const privacyKeywords = ["privacy", "dpo", "data.protection", "compliance", "legal", "gdpr"];
  
  // Strategy A: Return the first email that contains a privacy keyword in its local part (e.g., privacy@...)
  const specificallyNamed = allEmails.find(email => 
    privacyKeywords.some(kw => email.toLowerCase().includes(kw))
  );
  if (specificallyNamed) return specificallyNamed;

  // Strategy B: If no specifically named email, look for emails in context (proximal to privacy keywords in text)
  // This is handled better by AI, but for fallback we take the first email found
  return allEmails[0];
}

function buildFallback(appName: string, pageText: string): PolicyAnalysis {
  const lower = pageText.toLowerCase();

  const dataKeywords = [
    ["email", "Email address"], ["name", "Full name"], ["location", "Location data"],
    ["phone", "Phone number"], ["ip address", "IP address"], ["cookie", "Cookies"],
    ["device", "Device information"], ["payment", "Payment information"],
    ["browsing", "Browsing history"], ["contact", "Contact list"],
  ];
  const dataCollected = dataKeywords
    .filter(([kw]) => lower.includes(kw))
    .map(([, label]) => label);

  const thirdParties = [
    "Google", "Facebook", "Amazon", "Microsoft", "Apple",
    "advertising partners", "analytics providers",
  ];
  const sharedWith = thirdParties.filter(tp => lower.includes(tp.toLowerCase()));

  // Fallback risk: only truly sensitive categories trigger HIGH
  const hasHealth = lower.includes("health") || lower.includes("medical");
  const hasBiometric = lower.includes("biometric") || lower.includes("fingerprint");
  const hasPreciseLocation = lower.includes("precise location") || lower.includes("gps tracking");
  const hasFullEmailAccess = lower.includes("read all") && lower.includes("email");
  const riskVerdict: PolicyAnalysis["riskVerdict"] =
    hasHealth || hasBiometric || hasPreciseLocation || hasFullEmailAccess
      ? "HIGH"
      : dataCollected.length > 7
        ? "MEDIUM"
        : dataCollected.length > 3
          ? "MEDIUM"
          : "LOW";

  return {
    appName,
    dataCollected: dataCollected.length > 0 ? dataCollected : ["General usage data"],
    sharedWith: sharedWith.length > 0 ? sharedWith : ["Third-party service providers"],
    userRights: ["Request data deletion", "Opt out of marketing"],
    redFlag: dataCollected.length > 6 ? "Collects a large number of data categories" : null,
    plainSummary: `${appName} collects ${dataCollected.length || "several types of"} data categories. ${sharedWith.length > 0 ? `Data may be shared with ${sharedWith.join(", ")}.` : "Sharing details were not clearly stated."} Review the full policy for details.`,
    riskVerdict,
    dpoEmail: extractEmailFromText(pageText),
    source: "fallback",
  };
}

/**
 * Sends pre-extracted policy text to OpenRouter for analysis.
 * Falls back to keyword extraction if AI parsing fails.
 */
export async function analyzePageText(
  pageText: string,
  appName: string,
): Promise<PolicyAnalysis | null> {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

  if (!apiKey) {
    console.warn("[Consently] No OpenRouter API key — using fallback analysis");
    return pageText.length >= 200 ? buildFallback(appName, pageText) : null;
  }

  if (!pageText || pageText.length < 200) {
    console.warn("[Consently] Page text too short — not a privacy policy page?");
    return null;
  }

  console.log(`[Consently] Analyzing ${pageText.length} chars with OpenRouter for ${appName}...`);

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
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: USER_PROMPT(appName, pageText) },
        ],
        temperature: 0.1,
        max_tokens: 600,
      }),
    });

    if (!res.ok) {
      console.error("[Consently] OpenRouter API error:", res.status, await res.text());
      return buildFallback(appName, pageText);
    }

    const data = await res.json();
    const rawText: string = data?.choices?.[0]?.message?.content ?? "";

    console.log("[Consently] Raw AI response (first 300):", rawText.slice(0, 300));

    const parsed = extractJson(rawText);

    if (parsed && parsed.dataCollected && parsed.riskVerdict) {
      return {
        dataCollected: parsed.dataCollected as string[],
        sharedWith: (parsed.sharedWith as string[]) || [],
        userRights: (parsed.userRights as string[]) || [],
        redFlag: (parsed.redFlag as string) || null,
        plainSummary: (parsed.plainSummary as string) || `${appName} privacy policy analyzed.`,
        riskVerdict: parsed.riskVerdict as PolicyAnalysis["riskVerdict"],
        dpoEmail: (parsed.dpoEmail as string) || extractEmailFromText(pageText),
        appName,
        source: "ai",
      };
    }

    console.warn("[Consently] AI response did not contain valid structure, using fallback");
    return buildFallback(appName, pageText);
  } catch (err) {
    console.error("[Consently] OpenRouter error:", err);
    return buildFallback(appName, pageText);
  }
}
