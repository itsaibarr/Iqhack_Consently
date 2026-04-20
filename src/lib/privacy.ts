import { CompanyRecord, MOCK_COMPANIES } from "./constants";

/**
 * Weights for different data categories.
 * Reflects the privacy impact of each data type.
 */
const DATA_WEIGHTS: Record<string, number> = {
  PII: 1.0,
  DIGITAL: 1.5,
  SOCIAL: 2.0,
  FINANCIAL: 4.0,
  HEALTH: 4.0,
};

/**
 * Plain language translations for data types.
 * Aimed at the "Asel" persona (18-22 student).
 */
export const PLAIN_LANGUAGE_MAP: Record<string, string> = {
  grades: "Your academic history and performance metrics.",
  activity_log: "A recording of every button you click and page you view.",
  device_id: "Your unique phone/computer identity used for tracking.",
  location: "Your precise real-time coordinates, even in the background.",
  payment_history: "A record of how much you spend and where you shop.",
  national_id: "Your government identity and civil registry data.",
  digital_signature: "The vault keys used to sign legal documents on your behalf.",
  household_data: "Information about who you live with and your family status.",
  delivery_address: "Your physical home or office location.",
  phone_number: "The primary way to contact and identify your account.",
  contacts: "Your entire list of friends and family contact details.",
};

/**
 * Penalty points for risk levels.
 */
const RISK_PENALTY: Record<string, number> = {
  LOW: 2,
  MEDIUM: 5,
  HIGH: 10,
};

/**
 * Calculates a 'Privacy Impact Score' for a single company.
 * Higher score = more privacy exposure.
 * This can be used to determine visual node size.
 */
export function calculateCompanyImpact(company: CompanyRecord): number {
  if (company.status === "REVOKED") return 0;

  // 1. Risk Level Base Penalty
  let impact = RISK_PENALTY[company.risk] || 0;

  // 2. Data Type Penalties
  company.dataTypes.forEach((dt) => {
    impact += DATA_WEIGHTS[dt.category] || 1.0;
  });

  // 3. Sharing Breadth Penalty
  impact += company.sharedWith.length * 0.5;

  return impact;
}

/**
 * Calculates the global Privacy Score (0-100).
 * 100 = Perfect Privacy (no active data sharing).
 * 0 = Extreme Exposure.
 */
export function calculateGlobalPrivacyScore(companies: CompanyRecord[]): number {
  const TOTAL_BASE = 100;
  const totalImpact = companies.reduce((acc, company) => acc + calculateCompanyImpact(company), 0);

  // Scale the impact to fit a 0-100 gauge. 
  // We'll use a dynamic scale factor or a logarithmic dampen so it doesn't hit 0 too fast.
  const score = Math.max(0, TOTAL_BASE - totalImpact);
  
  return Math.round(score);
}
