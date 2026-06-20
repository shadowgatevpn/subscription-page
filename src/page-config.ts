function envValue(name: string, fallback: string) {
  const env = import.meta.env as Record<string, string | undefined>;
  if (Object.prototype.hasOwnProperty.call(env, name)) {
    return env[name]?.trim() ?? "";
  }
  return fallback;
}

export const PAGE_TITLE = envValue("VITE_PAGE_TITLE", "Subscription") || "Subscription";
export const SUBSCRIPTION_URL = envValue(
  "VITE_SUBSCRIPTION_URL",
  "https://vpn.example.com/subscription/intezya/abc123def456",
);
export const SUPPORT_URL = envValue("VITE_SUPPORT_URL", "https://t.me/");
export const SUBSCRIPTION_NOT_FOUND_REDIRECT_URL = envValue(
  "VITE_SUBSCRIPTION_NOT_FOUND_REDIRECT_URL",
  "",
);
