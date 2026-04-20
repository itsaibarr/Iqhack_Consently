export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";
export type ConsentStatus = "ACTIVE" | "REVOKED" | "PENDING";

export const RISK_CONFIG_MAP = {
  HIGH: { color: "#F44336", label: "High Risk" },
  MEDIUM: { color: "#FFC107", label: "Medium Risk" },
  LOW: { color: "#00FF88", label: "Low Risk" },
};

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
}

export interface ActivityRecord {
  id: string;
  companyName: string;
  action: "GRANTED" | "REVOKED" | "UPDATED";
  timestamp: string;
  dataTypes: string[];
}
