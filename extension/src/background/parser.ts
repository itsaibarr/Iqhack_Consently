import { ConsentEvent, OAuthProvider } from "../lib/types";
import { translateScope } from "../lib/scopes";
import { computeOverallRisk } from "../lib/risk";
import { getAppNameFromDomain, getBaseDomain } from "../lib/utils";

export function parseOAuthUrl(urlStr: string, provider: OAuthProvider): ConsentEvent | null {
  try {
    const url = new URL(urlStr);
    const params = url.searchParams;

    // Google accountchooser encodes the real OAuth params inside a 'continue' URL.
    // Decode it and merge its params so scope/redirect_uri are always reachable.
    let mergedParams = params;
    const continueRaw = params.get("continue");
    if (continueRaw) {
      try {
        const inner = new URL(decodeURIComponent(continueRaw));
        // Merge inner params on top of outer (outer wins on conflict)
        const combined = new URLSearchParams(inner.searchParams);
        params.forEach((v, k) => combined.set(k, v));
        mergedParams = combined;
      } catch { /* ignore malformed continue URL */ }
    }

    const scopeRaw = mergedParams.get("scope") || mergedParams.get("scopes") || "";
    const clientId = mergedParams.get("client_id") || mergedParams.get("clientid") || "";
    const redirectUri = mergedParams.get("redirect_uri") || mergedParams.get("redirecturi") || "";

    // Extract app domain from redirect_uri
    let appDomain = "unknown";
    try {
      if (redirectUri) {
        const rUrl = new URL(redirectUri);
        appDomain = getBaseDomain(rUrl.hostname);
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
    
    const overallRisk = computeOverallRisk(scopesTranslated, appDomain);

    return {
      id: crypto.randomUUID(),
      detectedAt: new Date().toISOString(),
      provider,
      appDomain,
      appName: getAppNameFromDomain(appDomain),
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
