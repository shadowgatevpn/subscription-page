import assert from "node:assert/strict";

import { detectOSFromClientHints } from "./device-os.ts";

assert.equal(
  detectOSFromClientHints({
    userAgent: "Mozilla/5.0 (Linux; Android 14; Pixel 8)",
    platform: "Linux armv8l",
  }),
  "android",
);

assert.equal(
  detectOSFromClientHints({
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
    platform: "iPhone",
  }),
  "ios",
);

assert.equal(
  detectOSFromClientHints({
    userAgent: "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)",
    platform: "MacIntel",
    maxTouchPoints: 5,
  }),
  "ios",
);

assert.equal(
  detectOSFromClientHints({
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0)",
    platform: "MacIntel",
  }),
  "macos",
);

assert.equal(
  detectOSFromClientHints({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    platform: "Win32",
  }),
  "windows",
);

assert.equal(
  detectOSFromClientHints({
    userAgent: "Mozilla/5.0 (X11; Linux x86_64)",
    platform: "Linux x86_64",
  }),
  "linux",
);

assert.equal(detectOSFromClientHints({ userAgent: "Unknown", platform: "" }), null);
