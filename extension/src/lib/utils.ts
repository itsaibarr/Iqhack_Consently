export function cn(...inputs: (string | boolean | undefined | null)[]) {
  return inputs.filter(Boolean).join(' ');
}

/**
 * Strips common prefixes like www., app., etc. from a domain.
 * e.g. "www.notion.so" -> "notion.so"
 */
export function getBaseDomain(domain: string): string {
  if (!domain || domain === "unknown") return domain;
  return domain.toLowerCase().replace(/^(www\.|app\.|login\.|auth\.|account\.|accounts\.|api\.)/, "");
}

/**
 * Extracts a human-readable application name from a domain.
 * e.g. "www.notion.so" -> "Notion"
 */
export function getAppNameFromDomain(domain: string): string {
  const clean = getBaseDomain(domain);
  if (!clean || clean === "unknown") return "Unknown";

  const parts = clean.split(".");
  const brand = parts[0];

  if (!brand) return "Unknown";
  return brand.charAt(0).toUpperCase() + brand.slice(1);
}
