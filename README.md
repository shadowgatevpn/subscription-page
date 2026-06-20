# Subscription Page

Minimal VPN subscription landing page built with TanStack Start, React, Vite, Tailwind CSS, and shadcn-style UI components.

The page is intended to be served as a branded subscription helper:

- show current subscription status and traffic from Remnawave;
- copy or import the subscription link into supported clients;
- provide platform-specific download links;
- keep Remnawave API credentials on the server side only.

## Architecture

The frontend renders the UI from `src/routes/index.tsx`.

Subscription card data is loaded through a local server route:

```text
Browser -> GET /api/subscription-info -> Remnawave GET /api/sub/{shortUuid}/info
```

The Remnawave API token is read only by `src/routes/api/subscription-info.ts`. Do not expose it as a `VITE_*` variable.

The `shortUuid` is derived from the last path segment of `VITE_SUBSCRIPTION_URL`. There is no separate `REMNAWAVE_SUBSCRIPTION_SHORT_UUID` setting.

## Environment

Required server-side variables:

| Variable | Purpose |
| --- | --- |
| `REMNAWAVE_PANEL_URL` | Base URL of the Remnawave panel, for example `https://panel.example.com`. |
| `REMNAWAVE_API_TOKEN` | Remnawave API token used by the server route. Never expose this to the browser. |

Public UI variables:

| Variable | Purpose |
| --- | --- |
| `VITE_SUBSCRIPTION_URL` | Public subscription URL shown, copied, and used for client import buttons. The last path segment is also used as `shortUuid` for `/api/subscription-info`. If this value is empty, subscription copy/import buttons are hidden. |
| `VITE_PAGE_TITLE` | Header/title shown in the UI. Defaults to `Subscription`. |
| `VITE_SUPPORT_URL` | Support link shown as the Telegram/support button. If this value is empty, the support button is hidden. |
| `VITE_SUBSCRIPTION_NOT_FOUND_REDIRECT_URL` | Optional browser redirect URL used when subscription info cannot be loaded. If this value is empty, the page stays open and shows the subscription card with the failed-load state. |

Optional variables:

| Variable | Purpose |
| --- | --- |
| `CADDY_AUTH_API_TOKEN` | Optional `X-Api-Key` header for protected panel access. |
| `CLOUDFLARE_ZERO_TRUST_CLIENT_ID` | Optional Cloudflare Access client id. |
| `CLOUDFLARE_ZERO_TRUST_CLIENT_SECRET` | Optional Cloudflare Access client secret. |
| `EGAMES_COOKIE` | Optional cookie forwarded to the panel. |

Example:

```bash
REMNAWAVE_PANEL_URL=https://panel.example.com
REMNAWAVE_API_TOKEN=remnawave_api_token
VITE_SUBSCRIPTION_URL=https://vpn.example.com/subscription/user/abc123def456
VITE_PAGE_TITLE=Intezya VPN
VITE_SUPPORT_URL=https://t.me/support
VITE_SUBSCRIPTION_NOT_FOUND_REDIRECT_URL=https://example.com/support/subscription-not-found
```

## Subscription Load Failure

On page load, the browser requests `/api/subscription-info`. If the request fails because
the subscription cannot be fetched from Remnawave, the page checks
`VITE_SUBSCRIPTION_NOT_FOUND_REDIRECT_URL`.

- If the variable contains a URL, the browser navigates to that URL.
- If the variable is empty or unset, the user remains on the page and the subscription
  card shows the failed-load state.

## Development

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview a production build:

```bash
npm run preview
```

## Verification

Run lint:

```bash
npm run lint
```

Run focused assertion tests:

```bash
node_modules/.bin/tsx src/lib/i18n.test.ts
node_modules/.bin/tsx src/lib/subscription-info.test.ts
node_modules/.bin/tsx src/lib/subscription-redirect.test.ts
node_modules/.bin/tsx src/lib/subscription-url.test.ts
```

Run TypeScript checking:

```bash
node_modules/.bin/tsc --noEmit
```

## Important Files

| Path | Responsibility |
| --- | --- |
| `src/routes/index.tsx` | Main subscription page UI. |
| `src/routes/api/subscription-info.ts` | Server-only Remnawave subscription info proxy. |
| `src/lib/subscription-info.ts` | Normalizes Remnawave response into card data. |
| `src/lib/subscription-redirect.ts` | Decides whether a failed subscription load should redirect the browser. |
| `src/lib/subscription-url.ts` | Extracts `shortUuid` from `VITE_SUBSCRIPTION_URL`. |
| `src/lib/i18n.ts` | UI translations. |
| `src/page-config.ts` | Public page configuration from `VITE_*` env values. |

## Security Notes

- Keep `REMNAWAVE_API_TOKEN` server-side only.
- Do not prefix secrets with `VITE_`; Vite exposes `VITE_*` variables to browser code.
- The browser calls only `/api/subscription-info`; it never calls Remnawave with the API token.
- The local server route returns normalized card data, not the full Remnawave response.
