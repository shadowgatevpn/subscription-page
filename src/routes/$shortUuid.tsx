import { createFileRoute } from "@tanstack/react-router";

import { Index } from "./index";
import { PAGE_TITLE } from "@/page-config";

export const Route = createFileRoute("/$shortUuid")({
  head: () => ({
    meta: [
      { title: `${PAGE_TITLE} — VPN` },
      {
        name: "description",
        content: "Manage your VPN subscription, install the client and import your config.",
      },
      { property: "og:title", content: `${PAGE_TITLE} — VPN` },
      {
        property: "og:description",
        content: "Manage your VPN subscription, install the client and import your config.",
      },
    ],
  }),
  component: ShortSubscriptionPage,
});

function ShortSubscriptionPage() {
  const { shortUuid } = Route.useParams();
  return <Index shortUuid={shortUuid} />;
}
