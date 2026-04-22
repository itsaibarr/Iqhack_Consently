import { RiskLevel } from "../../../src/lib/constants";
import { getTrustFactor } from "@dashboard/lib/privacy";
import { ScopeEntry } from "./types";

const SCOPE_RISK_WEIGHTS: Record<RiskLevel, number> = { LOW: 1, MEDIUM: 3, HIGH: 10 };

/**
 * Computes per-service risk from OAuth scopes, adjusted by company trust.
 *
 * Key changes from v1:
 * - A single HIGH scope from a known company → MEDIUM (not auto-HIGH)
 * - Two or more HIGH scopes → always HIGH regardless of company
 * - Trust factor from the global registry amplifies or reduces the weighted score
 */
export function computeOverallRisk(scopes: ScopeEntry[], appDomain?: string): RiskLevel {
  if (scopes.length === 0) return "LOW";

  const highScopes = scopes.filter(s => s.risk === "HIGH").length;
  const rawScore = scopes.reduce((acc, s) => acc + (SCOPE_RISK_WEIGHTS[s.risk] || 0), 0);

  // Two or more HIGH-risk scopes are always HIGH regardless of company
  if (highScopes >= 2) return "HIGH";

  const trustFactor = appDomain ? getTrustFactor(appDomain) : 1.2;

  if (highScopes === 1) {
    // Unknown companies (trustFactor >= 1.0) with a HIGH scope → HIGH
    // Known/trusted companies with a single HIGH scope → MEDIUM
    return trustFactor >= 1.0 ? "HIGH" : "MEDIUM";
  }

  // No HIGH scopes — use weighted score adjusted by trust
  const adjustedScore = rawScore * trustFactor;
  if (adjustedScore >= 6) return "HIGH";
  if (adjustedScore >= 2) return "MEDIUM";
  return "LOW";
}
