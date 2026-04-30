import { NextRequest, NextResponse } from "next/server";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_MODEL = "nvidia/nemotron-3-super-120b-a12b:free";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const SYSTEM_PROMPT = `You are a privacy policy JSON extractor. You MUST respond with ONLY a raw JSON object. No prose, no markdown, no explanation, no code fences. Your entire response must start with { and end with }.`;

const buildUserPrompt = (appName: string, policyText: string) =>
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

function extractJson(raw: string): Record<string, unknown> | null {
  const cleaned = raw.replace(/```(?:json)?\s*/g, "").replace(/```\s*/g, "").trim();
  try { return JSON.parse(cleaned); } catch { /* continue */ }
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (match) { try { return JSON.parse(match[0]); } catch { /* continue */ } }
  return null;
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENROUTER_API_KEY not configured on server" },
      { status: 503, headers: corsHeaders }
    );
  }

  let pageText: string;
  let appName: string;
  try {
    const body = await req.json();
    pageText = body.pageText;
    appName = body.appName;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400, headers: corsHeaders });
  }

  if (!pageText || pageText.length < 200) {
    return NextResponse.json(
      { error: "pageText too short — not a privacy policy page" },
      { status: 422, headers: corsHeaders }
    );
  }

  try {
    const res = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://consently.vercel.app",
        "X-Title": "Consently",
      },
      signal: AbortSignal.timeout(30000),
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserPrompt(appName, pageText) },
        ],
        temperature: 0.1,
        max_tokens: 600,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[Analyze] OpenRouter error:", res.status, errText);
      return NextResponse.json(
        { error: `OpenRouter responded ${res.status}` },
        { status: 502, headers: corsHeaders }
      );
    }

    const data = await res.json();
    const rawText: string = data?.choices?.[0]?.message?.content ?? "";
    const parsed = extractJson(rawText);

    if (!parsed || !parsed.dataCollected || !parsed.riskVerdict) {
      return NextResponse.json(
        { error: "AI returned unparseable response", raw: rawText.slice(0, 500) },
        { status: 502, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      {
        dataCollected: parsed.dataCollected,
        sharedWith: parsed.sharedWith ?? [],
        userRights: parsed.userRights ?? [],
        redFlag: parsed.redFlag ?? null,
        plainSummary: parsed.plainSummary ?? `${appName} privacy policy analyzed.`,
        riskVerdict: parsed.riskVerdict,
        dpoEmail: parsed.dpoEmail ?? null,
        appName,
        source: "ai",
      },
      { headers: corsHeaders }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    console.error("[Analyze] Unexpected error:", err);
    return NextResponse.json({ error: message }, { status: 500, headers: corsHeaders });
  }
}
