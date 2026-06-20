export function getSubscriptionFailureRedirectUrl(
  subscriptionFailed: boolean,
  redirectUrl: string,
): string | undefined {
  const value = redirectUrl.trim();
  if (!subscriptionFailed || !value) return undefined;
  return value;
}
