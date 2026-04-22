import { CompanyRecord, ActivityRecord, RiskLevel } from "@/lib/constants";

export type DataTypeCategory = "PII" | "HEALTH" | "FINANCIAL" | "DIGITAL" | "SOCIAL";

export interface DataType {
  name: string;
  category: DataTypeCategory;
}

export type OAuthProvider = "google" | "github" | "facebook" | "microsoft" | "apple" | "unknown";

export interface ScopeEntry {
  raw: string;
  label: string;
  category: "identity" | "communication" | "files" | "calendar" | "financial" | "access";
  risk: RiskLevel;
}

export interface ConsentEvent {
  id: string;
  detectedAt: string;
  provider: OAuthProvider;
  appDomain: string;
  appName: string;
  clientId: string;
  scopesRaw: string[];
  scopesTranslated: ScopeEntry[];
  overallRisk: RiskLevel;
  userAction: "granted" | "cancelled" | "detected";
  userId?: string;
  synced: boolean;
  privacyPolicyUrl?: string;
  plainSummary?: string;
  sharedWith?: string[];
  dpoEmail?: string;
}

export interface DBCompanyRecord {
  id: string;
  name: string;
  category: CompanyRecord["category"];
  risk: CompanyRecord["risk"];
  status: CompanyRecord["status"];
  data_types: { name: string; category: DataTypeCategory }[];
  shared_with: string[];
  connected_at: string;
  description: string | null;
  logo_uid: string | null;
  user_id: string;
  last_accessed?: string | null;
  purpose?: string | null;
  policy_report?: {
    summary: string;
    keyFindings: {
      category: "DATA_RETENTION" | "SHARING" | "RIGHTS" | "SECURITY";
      finding: string;
      impact: "POSITIVE" | "NEUTRAL" | "NEGATIVE";
    }[];
    lastAnalyzed: string;
    policyUrl: string;
    dpoEmail?: string;
  } | null;
}

export interface DBHistoryRecord {
  id: string;
  company_name: string;
  action: ActivityRecord["action"];
  timestamp: string;
  data_types: string[];
  user_id: string;
  reason?: string | null;
}

/**
 * Types for the Force Graph visualization
 */
export interface GraphNode {
  id: string;
  name: string;
  isUser: boolean;
  val: number;
  risk?: RiskLevel;
  // Force Graph computed properties
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number;
  fy?: number;
}

export interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  width?: number;
}
