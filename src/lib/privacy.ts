import { RiskLevel, CompanyRecord } from "./constants";

export const RISK_WEIGHTS: Record<RiskLevel, number> = {
  HIGH: 15,
  MEDIUM: 5,
  LOW: 1,
};

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

/**
 * Calculates a unified trust/privacy score from 0 to 100.
 * Default starting score is 100, which is then reduced by weighted risks.
 * Medium and Low risks are capped to ensure that High Risk audits always 
 * result in a visible score improvement.
 */
export function calculateTrustScore(stats: { high: number; medium: number; low: number }): number {
  const highDeduction = stats.high * RISK_WEIGHTS.HIGH;
  
  // Cap medium deductions at 45 points, low at 25 points.
  // This allows the high-risk audit to always be meaningful.
  const mediumDeduction = Math.min(45, stats.medium * RISK_WEIGHTS.MEDIUM);
  const lowDeduction = Math.min(25, stats.low * RISK_WEIGHTS.LOW);
  
  const pointsToDeduct = highDeduction + mediumDeduction + lowDeduction;
    
  return Math.max(0, 100 - pointsToDeduct);
}

/**
 * Calculates a weight for a company to determine its visual impact (node size).
 */
export function calculateCompanyImpact(company: CompanyRecord): number {
  const riskMultiplier = {
    HIGH: 3,
    MEDIUM: 1.5,
    LOW: 1,
  };
  
  const dataTypeWeight = company.dataTypes.length * 2;
  const sharedWeight = (company.sharedWith?.length || 0) * 3;
  const impact = (dataTypeWeight + sharedWeight) * riskMultiplier[company.risk];
  
  return impact || 10; // Default fallback
}
