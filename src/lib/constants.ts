export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";
export type ConsentStatus = "ACTIVE" | "REVOKED" | "PENDING";

export const RISK_CONFIG_MAP = {
  HIGH: { color: "#EF4444", label: "High Risk" }, // Updated to Tailwind red-500
  MEDIUM: { color: "#F59E0B", label: "Medium Risk" }, // Updated to Tailwind amber-400
  LOW: { color: "#14A89C", label: "Low Risk" }, // Updated to Consently Teal
};

export interface PrivacyPolicyReport {
  summary: string;
  keyFindings: {
    category: "DATA_RETENTION" | "SHARING" | "RIGHTS" | "SECURITY";
    finding: string;
    impact: "POSITIVE" | "NEUTRAL" | "NEGATIVE";
  }[];
  lastAnalyzed: string;
  policyUrl: string;
  dpoEmail?: string;
}

export interface CompanyRecord {
  id: string;
  name: string;
  category: "EDUCATION" | "GOVERNMENT" | "FINANCIAL" | "CONSUMER" | "HEALTH";
  risk: RiskLevel;
  status: ConsentStatus;
  dataTypes: { name: string; category: "PII" | "HEALTH" | "FINANCIAL" | "DIGITAL" | "SOCIAL" }[];
  sharedWith: string[];
  connectedAt: string;
  lastAccessed: string; // "2 days ago", "1 hour ago", etc.
  purpose: string;      // "academic performance tracking", etc.
  description: string;
  logoUid: string;
  policyReport?: PrivacyPolicyReport;
}

export interface ActivityRecord {
  id: string;
  companyName: string;
  action: "GRANTED" | "REVOKED" | "UPDATED";
  timestamp: string;
  dataTypes: string[];
  reason?: string;
}

// Extension Integration
export const EXTENSION_ID = "kegngnalimkofmfaeefinlljgdhomgon";
export const DASHBOARD_URL = "http://localhost:3000";

// Standard Demo User ID (exists in auth.users)
export const DEMO_USER_ID = "15e1f301-268a-434c-b4d5-8927fd698456";
