import { createFileRoute } from "@tanstack/react-router";

import { getRuntimePageConfig } from "@/lib/runtime-page-config";

export const Route = createFileRoute("/api/page-config")({
  server: {
    handlers: {
      GET: async () => {
        return Response.json(getRuntimePageConfig(process.env), {
          headers: {
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});
