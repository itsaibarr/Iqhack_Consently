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
  if (!pageText || pageText.length < 200) {
    console.warn("[Consently] Page text too short — not a privacy policy page?");
    return null;
  }

  const dashboardUrl = import.meta.env.VITE_DASHBOARD_URL || "https://consently.vercel.app";
  const proxyUrl = `${dashboardUrl}/api/analyze`;

  console.log(`[Consently] Analyzing ${pageText.length} chars via dashboard proxy for ${appName}...`);

  try {
    const res = await fetch(proxyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(35000),
      body: JSON.stringify({ pageText, appName }),
    });

    if (res.ok) {
      const analysis = await res.json() as PolicyAnalysis;
      if (analysis.dataCollected && analysis.riskVerdict) {
        return { ...analysis, appName };
      }
    }

    if (!res.ok && res.status !== 503) {
      console.error("[Consently] Dashboard proxy error:", res.status, await res.text().catch(() => ""));
    }
  } catch (err) {
    console.warn("[Consently] Dashboard proxy unreachable — using keyword fallback:", err);
  }

  return buildFallback(appName, pageText);
}
