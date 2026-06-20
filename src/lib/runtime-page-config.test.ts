import assert from "node:assert/strict";

import { getRuntimeSupportUrl } from "./runtime-page-config.ts";

assert.equal(
  getRuntimeSupportUrl({
    SUPPORT_URL: "https://t.me/runtime_support",
    VITE_SUPPORT_URL: "https://t.me/build_support",
  }),
  "https://t.me/runtime_support",
);

assert.equal(
  getRuntimeSupportUrl({
    SUPPORT_URL: " ",
    VITE_SUPPORT_URL: "https://t.me/build_support",
  }),
  "https://t.me/build_support",
);

assert.equal(getRuntimeSupportUrl({ SUPPORT_URL: "", VITE_SUPPORT_URL: "" }), "");
