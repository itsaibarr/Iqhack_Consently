import { RiskLevel } from "../../../src/lib/constants";

export type OAuthProvider = "google" | "github" | "facebook" | "microsoft" | "apple" | "unknown";

export interface ScopeEntry {
  raw: string;
  label: string;          // human-readable, e.g. "Read all your emails"
  category: "identity" | "communication" | "files" | "calendar" | "financial" | "access";
  risk: RiskLevel;
}

export interface ConsentEvent {
  id: string;             // crypto.randomUUID()
  detectedAt: string;     // ISO 8601
  provider: OAuthProvider;
  appDomain: string;      // from redirect_uri, e.g. "notion.so"
  appName: string;        // resolved from domain, e.g. "Notion"
  clientId: string;       // raw client_id param
  scopesRaw: string[];
  scopesTranslated: ScopeEntry[];
  overallRisk: RiskLevel;
  userAction: "granted" | "cancelled" | "detected"; // "detected" if we can't confirm outcome
  userId?: string;        // Tied to dashboard user
  synced: boolean;        // false until API confirms receipt
  privacyPolicyUrl?: string;  // Policy page URL (the tab URL the user analyzed)
  plainSummary?: string;      // Plain-language summary from AI analysis
  sharedWith?: string[];      // Third parties named in the privacy policy
  dpoEmail?: string;          // DPO / privacy contact email extracted from the policy
}

export interface UserSettings {
  stealth_mode: boolean;
  notifications_enabled: boolean;
  alert_frequency: "all" | "high_priority";
  handshake_interval: number;
}

export interface ExtensionState {
  events: ConsentEvent[];
  lastSyncAt: string | null;
  userId: string | null;
  userEmail: string | null;
  settings: UserSettings;
  handshakeComplete?: boolean;
  isDemoMode?: boolean;
}
