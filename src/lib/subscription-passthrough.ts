const REMNAWAVE_REAL_IP_HEADER = "x-remnawave-real-ip";

const IGNORED_HEADERS = new Set([
  "accept-encoding",
  "alt-svc",
  "authorization",
  "cache-control",
  "cf-access-client-id",
  "cf-access-client-secret",
  "cf-cache-status",
  "cf-ray",
  "connection",
  "content-encoding",
  "content-length",
  "content-security-policy",
  "cross-origin-opener-policy",
  "cross-origin-resource-policy",
  "expires",
  "host",
  "keep-alive",
  "nel",
  "origin-agent-cluster",
  "pragma",
  "proxy-authenticate",
  "proxy-authorization",
  "report-to",
  "server",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "x-api-key",
  "x-forwarded-for",
  "x-forwarded-proto",
  "x-forwarded-scheme",
]);

const BROWSER_USER_AGENT_KEYWORDS = [
  "Mozilla",
  "Chrome",
  "Safari",
  "Firefox",
  "Opera",
  "Edge",
  "TelegramBot",
  "WhatsApp",
];

type SubscriptionPassthroughRequest = {
  shortUuid: string;
  clientType: string | undefined;
};

export function isBrowserUserAgent(userAgent: string | null): boolean {
  if (!userAgent) return false;
  return BROWSER_USER_AGENT_KEYWORDS.some((keyword) => userAgent.includes(keyword));
}

export function getSubscriptionPassthroughRequest(
  request: Request,
): SubscriptionPassthroughRequest | null {
  const url = new URL(request.url);
  const segments = url.pathname.split("/").filter(Boolean);
  const [shortUuid, clientType, extra] = segments;

  if (!shortUuid || extra) return null;
  if (shortUuid === "api" || shortUuid === "assets" || shortUuid === "src") return null;
  if (shortUuid.includes(".")) return null;
  if (isBrowserUserAgent(request.headers.get("user-agent"))) return null;

  try {
    return {
      shortUuid: decodeURIComponent(shortUuid),
      clientType: clientType ? decodeURIComponent(clientType) : undefined,
    };
  } catch {
    return null;
  }
}

export function getUpstreamSubscriptionUrl(
  panelUrl: string,
  shortUuid: string,
  clientType?: string,
): string {
  const encodedShortUuid = encodeURIComponent(shortUuid);
  const encodedClientType = clientType ? `/${encodeURIComponent(clientType)}` : "";
  return new URL(`/api/sub/${encodedShortUuid}${encodedClientType}`, panelUrl).toString();
}

export async function handleSubscriptionPassthrough(request: Request): Promise<Response | null> {
  const subscriptionRequest = getSubscriptionPassthroughRequest(request);
  if (!subscriptionRequest) return null;

  const panelUrl = process.env.REMNAWAVE_PANEL_URL?.trim();
  const apiToken = process.env.REMNAWAVE_API_TOKEN?.trim();

  if (!panelUrl || !apiToken) {
    return Response.json(
      { error: "REMNAWAVE_PANEL_URL and REMNAWAVE_API_TOKEN are required" },
      { status: 500 },
    );
  }

  const upstreamResponse = await fetch(
    getUpstreamSubscriptionUrl(
      panelUrl,
      subscriptionRequest.shortUuid,
      subscriptionRequest.clientType,
    ),
    {
      headers: getRemnawavePassthroughHeaders(request, apiToken),
      cache: "no-store",
    },
  );

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    headers: getPassthroughResponseHeaders(upstreamResponse.headers),
  });
}

function getRemnawavePassthroughHeaders(request: Request, apiToken: string): Headers {
  const headers = new Headers();

  request.headers.forEach((value, key) => {
    if (!IGNORED_HEADERS.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  if (!headers.has("accept")) headers.set("Accept", "*/*");
  if (!headers.has("user-agent")) headers.set("user-agent", "Remnawave Subscription Page");
  headers.set("Authorization", `Bearer ${apiToken}`);
  headers.set(REMNAWAVE_REAL_IP_HEADER, getClientIp(request));

  const caddyAuthApiToken = process.env.CADDY_AUTH_API_TOKEN?.trim();
  if (caddyAuthApiToken) {
    headers.set("X-Api-Key", caddyAuthApiToken);
  }

  const cloudflareAccessClientId = process.env.CLOUDFLARE_ZERO_TRUST_CLIENT_ID?.trim();
  const cloudflareAccessClientSecret = process.env.CLOUDFLARE_ZERO_TRUST_CLIENT_SECRET?.trim();
  if (cloudflareAccessClientId && cloudflareAccessClientSecret) {
    headers.set("CF-Access-Client-Id", cloudflareAccessClientId);
    headers.set("CF-Access-Client-Secret", cloudflareAccessClientSecret);
  }

  const egamesCookie = process.env.EGAMES_COOKIE?.trim();
  if (egamesCookie) {
    headers.set("Cookie", egamesCookie);
  }

  return headers;
}

export function getPassthroughResponseHeaders(responseHeaders: Headers): Headers {
  const headers = new Headers();
  responseHeaders.forEach((value, key) => {
    if (!IGNORED_HEADERS.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  });
  return headers;
}

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "127.0.0.1";
  }
  return request.headers.get("x-real-ip") ?? "127.0.0.1";
}
