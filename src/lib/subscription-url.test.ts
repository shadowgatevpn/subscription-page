import assert from "node:assert/strict";

import {
  getShortUuidFromSubscriptionInfoRequest,
  getShortUuidFromSubscriptionUrl,
  getSubscriptionInfoPath,
  getSubscriptionUrlForShortUuid,
} from "./subscription-url.ts";

assert.equal(
  getShortUuidFromSubscriptionUrl("https://vpn.example.com/subscription/intezya/abc123def456"),
  "abc123def456",
);

assert.equal(
  getShortUuidFromSubscriptionUrl("https://vpn.example.com/subscription/intezya/abc123def456/"),
  "abc123def456",
);

assert.equal(getShortUuidFromSubscriptionUrl("/subscription/intezya/abc123def456"), "abc123def456");
assert.equal(getShortUuidFromSubscriptionUrl(""), undefined);

assert.equal(
  getShortUuidFromSubscriptionInfoRequest(
    "https://subs.intezya.ru/api/subscription-info?shortUuid=otherUserShortUuid",
    "https://subs.intezya.ru/RUo2sPJ9Tz5tmTNm",
  ),
  "otherUserShortUuid",
);

assert.equal(
  getShortUuidFromSubscriptionInfoRequest(
    "https://subs.intezya.ru/api/subscription-info",
    "https://subs.intezya.ru/RUo2sPJ9Tz5tmTNm",
  ),
  "RUo2sPJ9Tz5tmTNm",
);

assert.equal(
  getSubscriptionInfoPath("otherUserShortUuid"),
  "/api/subscription-info?shortUuid=otherUserShortUuid",
);
assert.equal(getSubscriptionInfoPath(undefined), "/api/subscription-info");

assert.equal(
  getSubscriptionUrlForShortUuid("https://subs.intezya.ru/RUo2sPJ9Tz5tmTNm", "otherUserShortUuid"),
  "https://subs.intezya.ru/otherUserShortUuid",
);

assert.equal(
  getSubscriptionUrlForShortUuid(
    "https://subs.intezya.ru/RUo2sPJ9Tz5tmTNm",
    "otherUserShortUuid",
    "https://subs.intezya.ru",
  ),
  "https://subs.intezya.ru/otherUserShortUuid",
);
