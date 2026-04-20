import { MOCK_COMPANIES } from "./constants";
import { calculateGlobalPrivacyScore, calculateCompanyImpact } from "./privacy";

console.log("--- Privacy Score Audit ---");
MOCK_COMPANIES.forEach(company => {
  const impact = calculateCompanyImpact(company);
  console.log(`${company.name}: Impact Score = ${impact}`);
});

const globalScore = calculateGlobalPrivacyScore(MOCK_COMPANIES);
console.log(`\nGlobal Privacy Score: ${globalScore}/100`);
