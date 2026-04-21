import { analyzePolicyForDomain } from "./extension/src/background/privacyAnalyzer";

async function test() {
  const res = await analyzePolicyForDomain("vitejs.dev", "Vite");
  console.log(res);
}
test();
