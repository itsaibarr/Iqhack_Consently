// Known DPO / privacy contact emails for common services.
// Source: company privacy pages and GDPR registers.
const DPO_LOOKUP: Record<string, string> = {
  google: "privacy@google.com",
  youtube: "privacy@google.com",
  facebook: "privacy@meta.com",
  instagram: "privacy@meta.com",
  meta: "privacy@meta.com",
  twitter: "privacy@twitter.com",
  x: "privacy@twitter.com",
  microsoft: "msoprivacy@microsoft.com",
  apple: "privacy@apple.com",
  amazon: "privacy@amazon.com",
  spotify: "privacy@spotify.com",
  netflix: "privacy@netflix.com",
  linkedin: "privacy@linkedin.com",
  github: "privacy@github.com",
  dropbox: "privacy@dropbox.com",
  slack: "privacy@slack.com",
  zoom: "privacy@zoom.us",
  tiktok: "privacy@tiktok.com",
  snapchat: "privacy@snap.com",
  uber: "privacy@uber.com",
  airbnb: "privacy@airbnb.com",
  paypal: "privacy@paypal.com",
  stripe: "privacy@stripe.com",
  twitch: "privacy@twitch.tv",
  reddit: "privacy@reddit.com",
  pinterest: "privacy@pinterest.com",
  discord: "privacy@discord.com",
  notion: "privacy@makenotion.com",
  figma: "privacy@figma.com",
  canva: "privacy@canva.com",
  shopify: "privacy@shopify.com",
  salesforce: "privacy@salesforce.com",
};

export function getDpoEmail(companyName: string): string {
  const key = companyName.toLowerCase().replace(/\s+/g, "");
  if (DPO_LOOKUP[key]) return DPO_LOOKUP[key];

  // Best-effort fallback: privacy@companydomain.com
  const domain = key.replace(/[^a-z0-9]/g, "");
  return `privacy@${domain}.com`;
}
