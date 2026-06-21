import assert from "node:assert/strict";

import {
  getPassthroughResponseHeaders,
  getSubscriptionPassthroughRequest,
  getUpstreamSubscriptionUrl,
  isBrowserUserAgent,
} from "./subscription-passthrough.ts";

assert.equal(isBrowserUserAgent("Mozilla/5.0 Safari/605.1.15"), true);
assert.equal(isBrowserUserAgent("Happ/4.10.2/ios"), false);

assert.deepEqual(
  getSubscriptionPassthroughRequest(
    new Request("https://subs.example.com/RUo2sPJ9Tz5tmTNm", {
      headers: { "user-agent": "Happ/4.10.2/ios" },
    }),
  ),
  { shortUuid: "RUo2sPJ9Tz5tmTNm", clientType: undefined },
);

assert.deepEqual(
  getSubscriptionPassthroughRequest(
    new Request("https://subs.example.com/RUo2sPJ9Tz5tmTNm/happ", {
      headers: { "user-agent": "Happ/4.10.2/ios" },
    }),
  ),
  { shortUuid: "RUo2sPJ9Tz5tmTNm", clientType: "happ" },
);

assert.equal(
  getSubscriptionPassthroughRequest(
    new Request("https://subs.example.com/RUo2sPJ9Tz5tmTNm", {
      headers: { "user-agent": "Mozilla/5.0" },
    }),
  ),
  null,
);

assert.equal(
  getSubscriptionPassthroughRequest(
    new Request("https://subs.example.com/api/subscription-info?shortUuid=RUo2", {
      headers: { "user-agent": "Happ/4.10.2/ios" },
    }),
  ),
  null,
);

assert.equal(
  getUpstreamSubscriptionUrl("https://panel.example.com/base/", "RUo2sPJ9Tz5tmTNm"),
  "https://panel.example.com/api/sub/RUo2sPJ9Tz5tmTNm",
);

assert.equal(
  getUpstreamSubscriptionUrl("https://panel.example.com", "RUo2sPJ9Tz5tmTNm", "happ"),
  "https://panel.example.com/api/sub/RUo2sPJ9Tz5tmTNm/happ",
);

const upstreamResponseHeaders = new Headers({
  "content-encoding": "br",
  "content-length": "42",
  "content-type": "application/json; charset=utf-8",
  "subscription-userinfo": "upload=0; download=1; total=10; expire=20",
});
const passthroughResponseHeaders = getPassthroughResponseHeaders(upstreamResponseHeaders);

assert.equal(passthroughResponseHeaders.get("content-encoding"), null);
assert.equal(passthroughResponseHeaders.get("content-length"), null);
assert.equal(
  passthroughResponseHeaders.get("subscription-userinfo"),
  "upload=0; download=1; total=10; expire=20",
);
assert.equal(passthroughResponseHeaders.get("content-type"), "application/json; charset=utf-8");
