import { OAuthProvider } from "../lib/types";

export const OAUTH_PATTERNS: Record<Exclude<OAuthProvider, "unknown">, RegExp> = {
  google:    /accounts\.google\.com\/(o\/oauth2|v2\/consent|v3\/signin|signin\/oauth)/,
  github:    /github\.com\/login\/oauth\/authorize/,
  facebook:  /www\.facebook\.com\/dialog\/oauth/,
  microsoft: /login\.microsoftonline\.com\/[^/]+\/oauth2\/(v2\.0\/)?authorize/,
  apple:     /appleid\.apple\.com\/auth\/authorize/,
};

export function detectProvider(url: string): OAuthProvider {
  for (const [provider, pattern] of Object.entries(OAUTH_PATTERNS)) {
    if (pattern.test(url)) {
      return provider as OAuthProvider;
    }
  }
  return "unknown";
}
