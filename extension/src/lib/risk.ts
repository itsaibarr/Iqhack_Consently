import { RiskLevel } from "../../../src/lib/constants";
import { ScopeEntry } from "./types";

const RISK_WEIGHTS: Record<RiskLevel, number> = { LOW: 1, MEDIUM: 3, HIGH: 10 };

export function computeOverallRisk(scopes: ScopeEntry[]): RiskLevel {
  if (scopes.length === 0) return "LOW";
  
  // Any single HIGH scope → overall HIGH
  if (scopes.some(s => s.risk === "HIGH")) return "HIGH";
  
  // Weighted sum: 2+ MEDIUM scopes → HIGH
  const score = scopes.reduce((acc, s) => acc + (RISK_WEIGHTS[s.risk] || 0), 0);
  
  if (score >= 6) return "HIGH";
  if (score >= 3) return "MEDIUM";
  return "LOW";
}
