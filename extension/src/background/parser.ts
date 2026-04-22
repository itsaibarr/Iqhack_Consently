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
    } catch {}

    // Split and normalize scopes
    const scopesRaw = scopeRaw ? scopeRaw.split(/[ +]/).filter(Boolean) : [];
    const scopesTranslated = scopesRaw.map(translateScope);
    
    // Ignore 1st-party logins and unknown apps where we can't analyze a policy
    const PROVIDER_DOMAINS = [
      "google.com",
      "github.com",
      "facebook.com",
      "microsoft.com",
      "microsoftonline.com",
      "live.com",
      "apple.com",
      "okta.com",
      "auth0.com",
      "amazon.com",
      "linkedin.com",
      "twitter.com",
      "x.com",
      "firebaseapp.com",
      "supabase.co"
    ];

    const isProvider = PROVIDER_DOMAINS.some(d => 
      appDomain === d || appDomain.endsWith("." + d)
    );

    if (appDomain === "unknown" || isProvider) {
      console.log(`[Consently] Skipping 1st-party or provider domain: ${appDomain}`);
      return null;
    }
    
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
