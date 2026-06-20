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
Browser -> GET /api/subscription-info?shortUuid={shortUuid} -> Remnawave GET /api/sub/{shortUuid}/info
```

The Remnawave API token is read only by `src/routes/api/subscription-info.ts`. Do not expose it as a `VITE_*` variable.

For short subscription URLs such as `/<shortUuid>`, the `shortUuid` is read from
the route and sent to `/api/subscription-info`. On `/`, the server falls back to
the last path segment of `VITE_SUBSCRIPTION_URL`. There is no separate
`REMNAWAVE_SUBSCRIPTION_SHORT_UUID` setting.

## Environment

Required server-side variables:

| Variable | Purpose |
| --- | --- |
| `REMNAWAVE_PANEL_URL` | Base URL of the Remnawave panel, for example `https://panel.example.com`. |
| `REMNAWAVE_API_TOKEN` | Remnawave API token used by the server route. Never expose this to the browser. |

Public UI variables:

| Variable | Purpose |
| --- | --- |
| `VITE_SUBSCRIPTION_URL` | Public subscription URL fallback/template shown, copied, and used for client import buttons on `/`. On `/<shortUuid>`, the visible route replaces the last path segment for copy/import buttons and for `/api/subscription-info?shortUuid=...`. If this value is empty, subscription copy/import buttons are hidden on `/`. |
| `VITE_PAGE_TITLE` | Header/title shown in the UI. Defaults to `Subscription`. |
| `VITE_SUPPORT_URL` | Build-time fallback support link shown as the Telegram/support button if runtime `SUPPORT_URL` is unset. |
| `VITE_SUBSCRIPTION_NOT_FOUND_REDIRECT_URL` | Optional browser redirect URL used when subscription info cannot be loaded. If this value is empty, the page stays open and shows the subscription card with the failed-load state. |
| `VITE_USE_MOCK_SUBSCRIPTION_INFO` | Optional static/demo mode. Set to `true`, `1`, or `yes` to show bundled mock subscription data instead of calling `/api/subscription-info`. Used by the GitHub Pages workflow. |

Optional variables:

| Variable | Purpose |
| --- | --- |
| `SUPPORT_URL` | Runtime support link shown as the Telegram/support button. Preferred for Docker/Dokploy because it is read from the running container environment through `/api/page-config`. If both `SUPPORT_URL` and `VITE_SUPPORT_URL` are empty, the support button is hidden. |
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
SUPPORT_URL=https://t.me/support
VITE_SUBSCRIPTION_NOT_FOUND_REDIRECT_URL=https://example.com/support/subscription-not-found
VITE_USE_MOCK_SUBSCRIPTION_INFO=false
```

## Subscription Load Failure

On page load, the browser requests `/api/subscription-info`; on short routes it
uses `/api/subscription-info?shortUuid=<shortUuid>`. If the request fails because
the subscription cannot be fetched from Remnawave, the page checks
`VITE_SUBSCRIPTION_NOT_FOUND_REDIRECT_URL`.

- If the variable contains a URL, the browser navigates to that URL.
- If the variable is empty or unset, the user remains on the page and the subscription
  card shows the failed-load state.

## GitHub Pages

The repository includes `.github/workflows/pages.yml` for a static GitHub Pages
deployment. The workflow runs on pushes to `main` and on manual dispatch, builds
the app with `npm run build`, and uploads `dist/client` through the official
GitHub Pages artifact/deploy actions.

TanStack Start normally builds a server-rendered app, so the Pages workflow also
runs `node scripts/create-pages-index.mjs` after the build. That script creates
static `index.html`, `404.html`, and `.nojekyll` files in `dist/client` around
the generated client bundle.

GitHub Pages cannot run the TanStack Start server route
`/api/subscription-info`, so the workflow sets:

```bash
VITE_USE_MOCK_SUBSCRIPTION_INFO=true
```

In that mode the page shows bundled demo subscription data and does not call the
server route. Normal non-Pages builds leave this variable unset and continue to
load real Remnawave data through `/api/subscription-info`.

For the repository site `https://intezya.github.io/subscription-page/`, the
workflow also builds assets with the `/subscription-page/` base path. Before the
first deployment, set the repository Pages source to **GitHub Actions** in
GitHub repository settings.

## Docker Image Publishing

The repository includes `.github/workflows/docker.yml` for building and pushing a
Docker image to GitHub Container Registry:

```text
ghcr.io/intezya/subscription-page
```

The workflow runs on pushes to `main`, version tags matching `v*`, and manual
dispatch. It authenticates to `ghcr.io` with the built-in `GITHUB_TOKEN`, so no
registry secret is required. It publishes tags from the branch/tag name, a
`sha-<commit>` tag, and `latest` for the default branch.

The image is built from the root `Dockerfile`. The Docker build sets
`DOCKER_BUILD=true`, which makes `vite.config.ts` produce a Nitro `node-server`
output under `.output`. The runtime image serves that output on `PORT`, defaulting
to `3000`.

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
node_modules/.bin/tsx src/lib/pages-build.test.ts
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
| `Dockerfile` | Multi-stage Node image for the server-rendered subscription page. |
| `.dockerignore` | Keeps local build output and dependencies out of Docker build context. |
| `src/routes/index.tsx` | Main subscription page UI. |
| `src/routes/api/subscription-info.ts` | Server-only Remnawave subscription info proxy. |
| `src/lib/mock-subscription-info.ts` | Static demo subscription data used by GitHub Pages builds. |
| `src/lib/pages-build.ts` | GitHub Pages base path and env-flag helpers. |
| `src/lib/subscription-info.ts` | Normalizes Remnawave response into card data. |
| `src/lib/subscription-redirect.ts` | Decides whether a failed subscription load should redirect the browser. |
| `src/lib/subscription-url.ts` | Extracts `shortUuid` from `VITE_SUBSCRIPTION_URL`. |
| `src/lib/i18n.ts` | UI translations. |
| `src/page-config.ts` | Public page configuration from `VITE_*` env values. |
| `scripts/create-pages-index.mjs` | Creates static Pages entry files around the TanStack Start client bundle. |

## Security Notes

- Keep `REMNAWAVE_API_TOKEN` server-side only.
- Do not prefix secrets with `VITE_`; Vite exposes `VITE_*` variables to browser code.
- The browser calls only `/api/subscription-info`; it never calls Remnawave with the API token.
- The local server route returns normalized card data, not the full Remnawave response.
