import assert from "node:assert/strict";

import { getSubscriptionFailureRedirectUrl } from "./subscription-redirect.ts";

assert.equal(
  getSubscriptionFailureRedirectUrl(true, "https://example.com/fallback"),
  "https://example.com/fallback",
);

assert.equal(getSubscriptionFailureRedirectUrl(true, "   "), undefined);
assert.equal(getSubscriptionFailureRedirectUrl(false, "https://example.com/fallback"), undefined);
