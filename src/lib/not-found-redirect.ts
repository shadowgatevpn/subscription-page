export type RedirectLocation = Pick<Location, "replace">;
export type NotFoundRenderMode = "pending" | "redirect" | "not-found";

export function getNotFoundRedirectUrl(redirectUrl: string): string | undefined {
  const value = redirectUrl.trim();
  return value || undefined;
}

export function getNotFoundRenderMode(
  runtimeConfigLoaded: boolean,
  redirectUrl: string | undefined,
): NotFoundRenderMode {
  if (!runtimeConfigLoaded) return "pending";
  if (redirectUrl) return "redirect";
  return "not-found";
}

export function redirectNotFoundPath(location: RedirectLocation, redirectUrl: string): boolean {
  const value = getNotFoundRedirectUrl(redirectUrl);
  if (!value) return false;
  location.replace(value);
  return true;
}
