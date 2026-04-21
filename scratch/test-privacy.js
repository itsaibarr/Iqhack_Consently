import { performance } from "perf_hooks";

const POLICY_PATH_CANDIDATES = [
  "/privacy-policy",
  "/privacy",
  "/legal/privacy",
  "/legal/privacy-policy",
  "/en/privacy",
  "/about/privacy",
  "/policies/privacy",
  "/terms/privacy",
];

async function resolvePolicyUrl(domain) {
  const fetchPromises = POLICY_PATH_CANDIDATES.map(async (path) => {
    const url = `https://${domain}${path}`;
    try {
      const res = await fetch(url, { method: "GET", signal: AbortSignal.timeout(4000) });
      if (res.ok) return url;
      throw new Error("Not ok");
    } catch (err) {
      throw err;
    }
  });

  try {
    return await Promise.any(fetchPromises);
  } catch (err) {
    return null; // ignore fallback for now
  }
}

async function test() {
  const domains = ["v0.dev", "linear.app", "cursor.sh", "github.com"];
  for (const domain of domains) {
    const start = performance.now();
    const url = await resolvePolicyUrl(domain);
    const end = performance.now();
    console.log(`Domain: ${domain}, URL: ${url}, Time: ${end - start}ms`);
  }
}

test();
