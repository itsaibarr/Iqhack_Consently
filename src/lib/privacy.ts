import { RiskLevel, CompanyRecord } from "./constants";

// ---------------------------------------------------------------------------
// Data Type Sensitivity Weights
// Higher = more sensitive. Checked top-to-bottom (most specific first).
// ---------------------------------------------------------------------------

function getDataTypeWeight(typeName: string): number {
  const lower = typeName.toLowerCase();

  if (lower.includes("biometric") || lower.includes("fingerprint") || lower.includes("face scan")) return 20;
  if (lower.includes("health") || lower.includes("medical") || lower.includes("diagnosis")) return 18;
  if (lower.includes("government id") || lower.includes("national id") || lower.includes("passport") || lower.includes("ssn")) return 15;
  if (lower.includes("financial") || lower.includes("banking") || lower.includes("transaction") || lower.includes("credit card")) return 15;
  if (lower.includes("all your emails") || lower.includes("read emails") || lower.includes("gmail") || lower.includes("inbox")) return 12;
  if (lower.includes("all files") || lower.includes("all your drive") || lower.includes("full drive")) return 12;
  if (lower.includes("precise location") || lower.includes("gps")) return 12;
  if (lower.includes("browsing history") || lower.includes("web history")) return 10;
  if (lower.includes("contact list") || lower.includes("contacts") || lower.includes("address book")) return 8;
  if (lower.includes("social graph") || lower.includes("social network")) return 8;
  if (lower.includes("payment")) return 8;
  if (lower.includes("calendar") || lower.includes("schedule")) return 6;
  if (lower.includes("behavioral") || lower.includes("profiling")) return 6;
  if (lower.includes("phone number") || lower.includes("phone")) return 4;
  if (lower.includes("cookie")) return 4;
  if (lower.includes("ip address") || lower.includes("ip ")) return 4;
  if (lower.includes("location")) return 5;
  if (lower.includes("device")) return 3;
  if (lower.includes("email")) return 2;
  if (lower.includes("name")) return 2;
  if (lower.includes("photo") || lower.includes("avatar") || lower.includes("picture")) return 1;

  return 3; // unknown data type — moderate default
}

// ---------------------------------------------------------------------------
// Company Trust Registry
// < 1.0 = trusted (reduces computed risk). > 1.0 = less trusted (amplifies it).
// ---------------------------------------------------------------------------

const COMPANY_TRUST_REGISTRY: Record<string, number> = {
  // Tier 1 — Global regulated giants (0.5×)
  google: 0.5, alphabet: 0.5, apple: 0.5, microsoft: 0.5,
  amazon: 0.5, aws: 0.5, meta: 0.5, facebook: 0.55, instagram: 0.55,

  // Tier 2 — Known established companies (0.7×)
  anthropic: 0.7, openai: 0.7, github: 0.65, stripe: 0.65,
  slack: 0.7, dropbox: 0.7, netflix: 0.7, spotify: 0.7,
  twitter: 0.7, "x.com": 0.7, linkedin: 0.7, salesforce: 0.7,
  zoom: 0.7, adobe: 0.7, paypal: 0.65, shopify: 0.7,
  hubspot: 0.75, discord: 0.72, reddit: 0.72, twitch: 0.72,
  airbnb: 0.72, uber: 0.72, snapchat: 0.75, tiktok: 0.75,

  // Tier 3 — Smaller but recognised companies (0.85×)
  notion: 0.85, figma: 0.85, vercel: 0.85, linear: 0.85,
  resend: 0.85, supabase: 0.85, cloudflare: 0.8, netlify: 0.85,
  airtable: 0.85, miro: 0.85, canva: 0.85, loom: 0.85,
  typeform: 0.85, intercom: 0.85, sendgrid: 0.85,
};

export function getTrustFactor(companyName: string): number {
  const lower = companyName.toLowerCase();
  if (COMPANY_TRUST_REGISTRY[lower]) return COMPANY_TRUST_REGISTRY[lower];
  for (const [key, factor] of Object.entries(COMPANY_TRUST_REGISTRY)) {
    if (lower.includes(key) || key.includes(lower)) return factor;
  }
  return 1.2; // Unknown company — slight amplification
}

function getSharingMultiplier(partnerCount: number): number {
  if (partnerCount === 0) return 1.0;
  if (partnerCount <= 2) return 1.2;
  if (partnerCount <= 5) return 1.5;
  return 2.0;
}

// ---------------------------------------------------------------------------
// Per-service score (0–100) and risk label
// ---------------------------------------------------------------------------

export function computeServiceScore(company: CompanyRecord): number {
  const dataWeight = company.dataTypes.reduce(
    (sum, dt) => sum + getDataTypeWeight(dt.name),
    0
  );
  const trustFactor = getTrustFactor(company.name);
  const sharingMultiplier = getSharingMultiplier(company.sharedWith?.length ?? 0);
  return Math.min(100, Math.round(dataWeight * trustFactor * sharingMultiplier));
}

export function scoreToRiskLevel(score: number): RiskLevel {
  if (score < 15) return "LOW";
  if (score <= 45) return "MEDIUM";
  return "HIGH";
}

// ---------------------------------------------------------------------------
// Portfolio trust score (0–100)
//
// 75% driven by the top-3 worst-scoring active services.
// 25% driven by breadth (count of high/medium risk services).
// Diminishing returns: 1000 low-risk services stay in the safe zone.
// ---------------------------------------------------------------------------

export function calculateTrustScore(companies: CompanyRecord[]): number {
  const active = companies.filter(c => c.status === "ACTIVE");
  if (active.length === 0) return 100;

  const scores = active.map(c => computeServiceScore(c));

  const top3 = [...scores].sort((a, b) => b - a).slice(0, 3);
  const avgTop3 = top3.reduce((s, n) => s + n, 0) / top3.length;

  const highCount = scores.filter(s => s > 45).length;
  const mediumCount = scores.filter(s => s > 15 && s <= 45).length;
  const breadthPenalty = Math.min(25, highCount * 4 + mediumCount * 1);

  const riskScore = avgTop3 * 0.75 + breadthPenalty;
  return Math.max(0, Math.round(100 - riskScore));
}

// ---------------------------------------------------------------------------
// Node graph sizing
// ---------------------------------------------------------------------------

export function calculateCompanyImpact(company: CompanyRecord): number {
  const score = computeServiceScore(company);
  const sharedWeight = (company.sharedWith?.length || 0) * 3;
  return score + sharedWeight || 10;
}

// ---------------------------------------------------------------------------
// Plain-language data-type descriptions
// ---------------------------------------------------------------------------

export const PLAIN_LANGUAGE_MAP: Record<string, string> = {
  location: "Tracks your real-world movements and visited locations.",
  financial: "Monitors your transactions, spending habits, and payment methods.",
  health: "Collects sensitive physical or mental health information.",
  contacts: "Accesses your address book and social connections.",
  identity: "Uses your government ID, full name, or birth certificate details.",
  behavioral: "Analyzes how you interact with apps and which content you consume.",
  biometric: "Uses fingerprints, face scans, or voice recordings for identification.",
  digital: "Tracks your IP address, device ID, and browser fingerprint.",
  social: "Accesses your social media profiles and connection graphs.",
  email: "Accesses your primary communication channel and contact list.",
  phone: "Monitors your call logs or uses your mobile number for tracking.",
  "academic performance": "Tracks your educational progress and grade history.",
};
