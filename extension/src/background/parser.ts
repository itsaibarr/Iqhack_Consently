import { ConsentEvent, OAuthProvider } from "../lib/types";
import { translateScope } from "../lib/scopes";
import { computeOverallRisk } from "../lib/risk";

export function parseOAuthUrl(urlStr: string, provider: OAuthProvider): ConsentEvent | null {
  try {
    const url = new URL(urlStr);
    const params = url.searchParams;

    const scopeRaw = params.get("scope") || params.get("scopes") || "";
    if (!scopeRaw && provider !== "github") return null;

    const clientId = params.get("client_id") || params.get("clientid") || "";
    const redirectUri = params.get("redirect_uri") || params.get("redirecturi") || "";
    
    // Extract app domain from redirect_uri
    let appDomain = "unknown";
    try {
      if (redirectUri) {
        const rUrl = new URL(redirectUri);
        appDomain = rUrl.hostname;
      }
    } catch (e) {}

    // Split and normalize scopes
    const scopesRaw = scopeRaw ? scopeRaw.split(/[ +]/).filter(Boolean) : [];
    const scopesTranslated = scopesRaw.map(translateScope);
    
    const overallRisk = computeOverallRisk(scopesTranslated);

    return {
      id: crypto.randomUUID(),
      detectedAt: new Date().toISOString(),
      provider,
      appDomain,
      appName: appDomain.split(".")[0].charAt(0).toUpperCase() + appDomain.split(".")[0].slice(1), // Simple title case
      clientId,
      scopesRaw,
      scopesTranslated,
      overallRisk,
      userAction: "detected",
      synced: false,
    };
  } catch (e) {
    console.error("Failed to parse OAuth URL", e);
    return null;
  }
}
