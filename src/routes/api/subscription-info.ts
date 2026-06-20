import { createFileRoute } from "@tanstack/react-router";

import { normalizeSubscriptionInfo } from "@/lib/subscription-info";
import { getShortUuidFromSubscriptionInfoRequest } from "@/lib/subscription-url";

const REMNAWAVE_REAL_IP_HEADER = "x-remnawave-real-ip";

export const Route = createFileRoute("/api/subscription-info")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const panelUrl = process.env.REMNAWAVE_PANEL_URL?.trim();
        const apiToken = process.env.REMNAWAVE_API_TOKEN?.trim();
        const shortUuid = getShortUuidFromSubscriptionInfoRequest(
          request.url,
          process.env.VITE_SUBSCRIPTION_URL ?? "",
        );

        if (!panelUrl || !apiToken || !shortUuid) {
          return Response.json(
            {
              error:
                "REMNAWAVE_PANEL_URL, REMNAWAVE_API_TOKEN and VITE_SUBSCRIPTION_URL are required",
            },
            { status: 500 },
          );
        }

        const response = await fetch(
          new URL(`/api/sub/${encodeURIComponent(shortUuid)}/info`, panelUrl),
          {
            headers: getRemnawaveHeaders(request, apiToken),
            cache: "no-store",
          },
        );

        if (!response.ok) {
          return Response.json({ error: "Failed to fetch subscription info" }, { status: 502 });
        }

        const payload = await response.json();
        return Response.json(normalizeSubscriptionInfo(payload), {
          headers: {
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});

function getRemnawaveHeaders(request: Request, apiToken: string): Headers {
  const headers = new Headers({
    Authorization: `Bearer ${apiToken}`,
    "user-agent": "Remnawave Subscription Page",
    [REMNAWAVE_REAL_IP_HEADER]: getClientIp(request),
  });

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

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "127.0.0.1";
  }
  return request.headers.get("x-real-ip") ?? "127.0.0.1";
}
