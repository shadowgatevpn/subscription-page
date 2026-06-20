export type DeviceOS = "android" | "ios" | "linux" | "macos" | "windows";

type ClientHints = {
  userAgent?: string;
  platform?: string;
  maxTouchPoints?: number;
};

export function detectOSFromClientHints({
  userAgent = "",
  platform = "",
  maxTouchPoints = 0,
}: ClientHints): DeviceOS | null {
  const ua = userAgent.toLowerCase();
  const platformName = platform.toLowerCase();

  if (ua.includes("android")) return "android";
  if (/iphone|ipad|ipod/.test(ua) || /iphone|ipad|ipod/.test(platformName)) return "ios";
  if (platformName === "macintel" && maxTouchPoints > 1) return "ios";
  if (ua.includes("windows") || platformName.includes("win")) return "windows";
  if (ua.includes("mac os x") || platformName.includes("mac")) return "macos";
  if (ua.includes("linux") || platformName.includes("linux")) return "linux";

  return null;
}
