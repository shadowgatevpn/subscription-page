import { createFileRoute, notFound, rootRouteId } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Link2,
  Send,
  ChevronDown,
  Copy,
  Download,
  Check,
  Globe,
  Apple,
  Monitor,
  Smartphone,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  getClientSubscriptionUrl,
  getClientSubscriptionNotFoundRedirectUrl,
  getClientSupportUrl,
} from "@/lib/client-page-config";
import { detectOSFromClientHints, type DeviceOS } from "@/lib/device-os";
import { LANGS, TRANSLATIONS, type Translation } from "@/lib/i18n";
import type { LangCode } from "@/lib/i18n";
import { MOCK_SUBSCRIPTION_INFO } from "@/lib/mock-subscription-info";
import type { RuntimePageConfig } from "@/lib/runtime-page-config";
import { readSubscriptionInfoResponse, SubscriptionInfoFetchError } from "@/lib/subscription-fetch";
import type { SubscriptionCardData } from "@/lib/subscription-info";
import { getSubscriptionFailureRedirectUrl } from "@/lib/subscription-redirect";
import { shouldRenderSubscriptionRootNotFound } from "@/lib/subscription-route";
import { getSubscriptionInfoPath, getSubscriptionUrlForShortUuid } from "@/lib/subscription-url";
import { cn } from "@/lib/utils";
import {
  PAGE_TITLE,
  SUBSCRIPTION_NOT_FOUND_REDIRECT_URL,
  SUBSCRIPTION_URL,
  SUPPORT_URL,
  USE_MOCK_SUBSCRIPTION_INFO,
} from "@/page-config";
import { NotFoundComponent } from "./__root";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (shouldRenderSubscriptionRootNotFound(undefined, USE_MOCK_SUBSCRIPTION_INFO)) {
      throw notFound({ routeId: rootRouteId });
    }
  },
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
  component: Index,
});

type OS = DeviceOS;
type Client =
  | "clash-meta"
  | "clash-mi"
  | "clash-verge"
  | "exclave"
  | "flclashx"
  | "happ"
  | "hiddify"
  | "koala-clash"
  | "prizrak-box"
  | "shadowrocket"
  | "stash"
  | "streisand"
  | "v2rayng";
type DownloadOption = { id: string; label: string; href: string };
type ClientGuide = {
  id: Client;
  label: string;
  downloads: DownloadOption[];
  deepLink?: string;
  base64Subscription?: boolean;
  warning?: string;
  manualImport?: string;
  connect?: string;
};

const OS_OPTIONS: { id: OS; label: string; icon: React.ReactNode }[] = [
  { id: "android", label: "Android", icon: <Smartphone className="size-4" /> },
  { id: "ios", label: "iOS", icon: <Apple className="size-4" /> },
  { id: "linux", label: "Linux", icon: <Monitor className="size-4" /> },
  { id: "macos", label: "macOS", icon: <Apple className="size-4" /> },
  { id: "windows", label: "Windows", icon: <Monitor className="size-4" /> },
];

const CLIENTS_BY_OS: Record<OS, ClientGuide[]> = {
  android: [
    {
      id: "flclashx",
      label: "FlClashX",
      deepLink: "flclashx://install-config?url=",
      downloads: [
        {
          id: "apk",
          label: "Скачать APK",
          href: "https://github.com/pluralplay/FlClashX/releases/download/v0.2.1/FlClashX-0.2.1-android-arm64-v8a.apk",
        },
      ],
      connect:
        "Выберите добавленный профиль в разделе Профили. В панели управления нажмите кнопку включения, затем при необходимости выберите сервер в разделе Прокси.",
    },
    {
      id: "clash-meta",
      label: "Clash Meta",
      deepLink: "clashmeta://install-config?name=Remnawave&url=",
      downloads: [
        {
          id: "apk",
          label: "Скачать APK",
          href: "https://github.com/MetaCubeX/ClashMetaForAndroid/releases/download/v2.11.20/cmfa-2.11.20-meta-universal-release.apk",
        },
        {
          id: "fdroid",
          label: "F-Droid",
          href: "https://f-droid.org/packages/com.github.metacubex.clash.meta/",
        },
      ],
      connect:
        "Перейдите в Профили и выберите созданный профиль, затем вернитесь на главный экран и нажмите кнопку подключения.",
    },
    {
      id: "happ",
      label: "Happ",
      deepLink: "happ://add/",
      downloads: [
        {
          id: "google-play",
          label: "Google Play",
          href: "https://play.google.com/store/apps/details?id=com.happproxy",
        },
        {
          id: "apk",
          label: "Скачать APK",
          href: "https://github.com/Happ-proxy/happ-android/releases/latest/download/Happ.apk",
        },
      ],
    },
    {
      id: "v2rayng",
      label: "v2rayNG",
      deepLink: "v2rayng://install-config?name=Remnawave&url=",
      downloads: [
        {
          id: "apk",
          label: "Скачать APK",
          href: "https://github.com/2dust/v2rayNG/releases/download/1.10.31/v2rayNG_1.10.31_universal.apk",
        },
      ],
      connect:
        "Откройте добавленный профиль, выберите сервер и подключитесь с главного экрана приложения.",
    },
    {
      id: "exclave",
      label: "Exclave",
      deepLink: "exclave://subscription?url=",
      downloads: [
        {
          id: "apk",
          label: "Скачать APK",
          href: "https://github.com/dyhkwong/Exclave/releases/download/0.17.4/Exclave-0.17.4-arm64-v8a.apk",
        },
        {
          id: "fdroid",
          label: "F-Droid",
          href: "https://f-droid.org/packages/com.github.dyhkwong.sagernet",
        },
      ],
      connect: "После импорта выберите добавленный профиль и включите подключение в приложении.",
    },
  ],
  ios: [
    {
      id: "happ",
      label: "Happ",
      deepLink: "happ://add/",
      downloads: [
        {
          id: "app-store-ru",
          label: "App Store (RU)",
          href: "https://apps.apple.com/ru/app/happ-proxy-utility-plus/id6746188973",
        },
        {
          id: "app-store-global",
          label: "App Store (Global)",
          href: "https://apps.apple.com/us/app/happ-proxy-utility/id6504287215",
        },
      ],
    },
    {
      id: "stash",
      label: "Stash",
      deepLink: "stash://install-config?url=",
      downloads: [
        {
          id: "app-store",
          label: "App Store",
          href: "https://apps.apple.com/us/app/stash-rule-based-proxy/id1596063349",
        },
      ],
      connect:
        "На главном экране нажмите Start. Разрешите добавление VPN-конфигурации, затем в разделе Policy выберите страну подключения.",
    },
    {
      id: "clash-mi",
      label: "Clash Mi",
      deepLink: "clash://install-config?overwrite=no&name=Remnawave&url=",
      downloads: [
        {
          id: "app-store",
          label: "App Store",
          href: "https://apps.apple.com/us/app/clash-mi/id6744321968",
        },
      ],
      connect:
        "На главной странице нажмите Disconnected, разрешите VPN-конфигурацию и введите пароль устройства.",
    },
  ],
  linux: [
    {
      id: "flclashx",
      label: "FlClashX",
      deepLink: "flclashx://install-config?url=",
      downloads: [
        {
          id: "amd64-deb",
          label: "amd64 .deb",
          href: "https://github.com/pluralplay/FlClashX/releases/download/v0.2.1/FlClashX-0.2.1-linux-amd64.deb",
        },
        {
          id: "amd64-appimage",
          label: "amd64 AppImage",
          href: "https://github.com/pluralplay/FlClashX/releases/download/v0.2.1/FlClashX-0.2.1-linux-amd64.AppImage",
        },
        {
          id: "amd64-rpm",
          label: "amd64 .rpm",
          href: "https://github.com/pluralplay/FlClashX/releases/download/v0.2.1/FlClashX-0.2.1-linux-amd64.rpm",
        },
        {
          id: "arm64-deb",
          label: "arm64 .deb",
          href: "https://github.com/pluralplay/FlClashX/releases/download/v0.2.1/FlClashX-0.2.1-linux-arm64.deb",
        },
      ],
      manualImport:
        "Если подписка не добавилась, скопируйте ссылку. В FlClashX откройте Профили, нажмите +, выберите URL, вставьте ссылку и отправьте форму.",
    },
    {
      id: "koala-clash",
      label: "Koala Clash",
      deepLink: "koala-clash://install-config?url=",
      downloads: [
        {
          id: "amd64-deb",
          label: "amd64 .deb",
          href: "https://github.com/coolcoala/koala-clash/releases/download/1.3.1/Koala.Clash_amd64.deb",
        },
        {
          id: "amd64-rpm",
          label: "x86_64 .rpm",
          href: "https://github.com/coolcoala/koala-clash/releases/download/1.3.1/Koala.Clash_x86_64.rpm",
        },
        {
          id: "arm64-deb",
          label: "arm64 .deb",
          href: "https://github.com/coolcoala/koala-clash/releases/download/1.3.1/Koala.Clash_arm64.deb",
        },
        {
          id: "arm64-rpm",
          label: "aarch64 .rpm",
          href: "https://github.com/coolcoala/koala-clash/releases/download/1.3.1/Koala.Clash_aarch64.rpm",
        },
      ],
      warning:
        "Если вы раньше использовали Clash Verge Rev, удалите его перед установкой Koala Clash.",
      manualImport:
        "Если подписка не добавилась, скопируйте ссылку. В Koala Clash откройте главную страницу, нажмите Add Profile, вставьте ссылку и нажмите Import.",
    },
    {
      id: "prizrak-box",
      label: "Prizrak-Box",
      deepLink: "prizrak-box://install-config?url=",
      downloads: [
        {
          id: "amd64-deb",
          label: "amd64 .deb",
          href: "https://github.com/legiz-ru/Prizrak-Box/releases/download/v1.0.20/linux-amd64.deb",
        },
        {
          id: "amd64-rpm",
          label: "amd64 .rpm",
          href: "https://github.com/legiz-ru/Prizrak-Box/releases/download/v1.0.20/linux-amd64.rpm",
        },
        {
          id: "arm64-deb",
          label: "arm64 .deb",
          href: "https://github.com/legiz-ru/Prizrak-Box/releases/download/v1.0.20/linux-arm64.deb",
        },
        {
          id: "arm64-rpm",
          label: "arm64 .rpm",
          href: "https://github.com/legiz-ru/Prizrak-Box/releases/download/v1.0.20/linux-arm64.rpm",
        },
      ],
      manualImport:
        "Если подписка не добавилась, скопируйте ссылку. В Prizrak-Box откройте Profiles, нажмите +, вставьте ссылку и подтвердите.",
    },
    {
      id: "clash-verge",
      label: "Clash Verge",
      deepLink: "clash://install-config?url=",
      downloads: [
        {
          id: "amd64-deb",
          label: "amd64 .deb",
          href: "https://github.com/clash-verge-rev/clash-verge-rev/releases/download/v2.4.4-rc/Clash.Verge_2.4.4-rc_amd64.deb",
        },
        {
          id: "x86-rpm",
          label: "x86_64 .rpm",
          href: "https://github.com/clash-verge-rev/clash-verge-rev/releases/download/v2.4.4-rc/Clash.Verge-2.4.4-rc-1.x86_64.rpm",
        },
        {
          id: "arm64-deb",
          label: "arm64 .deb",
          href: "https://github.com/clash-verge-rev/clash-verge-rev/releases/download/v2.4.4-rc/Clash.Verge_2.4.4-rc_arm64.deb",
        },
        {
          id: "aarch64-rpm",
          label: "aarch64 .rpm",
          href: "https://github.com/clash-verge-rev/clash-verge-rev/releases/download/v2.4.4-rc/Clash.Verge-2.4.4-rc-1.aarch64.rpm",
        },
      ],
      manualImport:
        "Если подписка не добавилась, скопируйте ссылку. В Clash Verge откройте Profiles, вставьте ссылку в поле импорта и нажмите Import.",
    },
  ],
  macos: [
    {
      id: "happ",
      label: "Happ",
      deepLink: "happ://add/",
      downloads: [
        {
          id: "app-store-ru",
          label: "App Store (RU)",
          href: "https://apps.apple.com/ru/app/happ-proxy-utility-plus/id6746188973",
        },
        {
          id: "app-store-global",
          label: "App Store (Global)",
          href: "https://apps.apple.com/us/app/happ-proxy-utility/id6504287215",
        },
      ],
    },
    {
      id: "koala-clash",
      label: "Koala Clash",
      deepLink: "koala-clash://install-config?url=",
      downloads: [
        {
          id: "mac-as",
          label: "macOS Apple Silicon",
          href: "https://github.com/coolcoala/koala-clash/releases/download/1.3.1/Koala.Clash_arm64.pkg",
        },
        {
          id: "mac-intel",
          label: "macOS Intel",
          href: "https://github.com/coolcoala/koala-clash/releases/download/1.3.1/Koala.Clash_x64.pkg",
        },
      ],
      warning:
        "Если вы раньше использовали Clash Verge Rev, удалите его перед установкой Koala Clash.",
      manualImport:
        "Если подписка не добавилась, скопируйте ссылку. В Koala Clash откройте главную страницу, нажмите Add Profile, вставьте ссылку и нажмите Import.",
    },
    {
      id: "flclashx",
      label: "FlClashX",
      deepLink: "flclashx://install-config?url=",
      downloads: [
        {
          id: "mac-as",
          label: "macOS Apple Silicon",
          href: "https://github.com/pluralplay/FlClashX/releases/download/v0.2.1/FlClashX-0.2.1-macos-arm64.dmg",
        },
        {
          id: "mac-intel",
          label: "macOS Intel",
          href: "https://github.com/pluralplay/FlClashX/releases/download/v0.2.1/FlClashX-0.2.1-macos-amd64.dmg",
        },
      ],
      manualImport:
        "Если подписка не добавилась, скопируйте ссылку. В FlClashX откройте Профили, нажмите +, выберите URL, вставьте ссылку и отправьте форму.",
    },
    {
      id: "prizrak-box",
      label: "Prizrak-Box",
      deepLink: "prizrak-box://install-config?url=",
      downloads: [
        {
          id: "mac-as",
          label: "macOS Apple Silicon",
          href: "https://github.com/legiz-ru/Prizrak-Box/releases/download/v1.0.20/macos-arm64.zip",
        },
        {
          id: "mac-intel",
          label: "macOS Intel",
          href: "https://github.com/legiz-ru/Prizrak-Box/releases/download/v1.0.20/macos-amd64.zip",
        },
      ],
      manualImport:
        "Если подписка не добавилась, скопируйте ссылку. В Prizrak-Box откройте Profiles, нажмите +, вставьте ссылку и подтвердите.",
    },
    {
      id: "clash-verge",
      label: "Clash Verge",
      deepLink: "clash://install-config?url=",
      downloads: [
        {
          id: "mac-intel",
          label: "macOS Intel",
          href: "https://github.com/clash-verge-rev/clash-verge-rev/releases/download/v2.4.4-rc/Clash.Verge_2.4.4-rc_x64.dmg",
        },
        {
          id: "mac-as",
          label: "macOS Apple Silicon",
          href: "https://github.com/clash-verge-rev/clash-verge-rev/releases/download/v2.4.4-rc/Clash.Verge_2.4.4-rc_aarch64.dmg",
        },
      ],
      manualImport:
        "Если подписка не добавилась, скопируйте ссылку. В Clash Verge откройте Profiles, вставьте ссылку в поле импорта и нажмите Import.",
    },
    {
      id: "hiddify",
      label: "Hiddify",
      deepLink: "hiddify://import/",
      downloads: [
        {
          id: "mac",
          label: "macOS",
          href: "https://github.com/hiddify/hiddify-app/releases/download/v2.5.7/Hiddify-MacOS.dmg",
        },
      ],
    },
  ],
  windows: [
    {
      id: "happ",
      label: "Happ",
      deepLink: "happ://add/",
      downloads: [
        {
          id: "win",
          label: "Windows",
          href: "https://github.com/Happ-proxy/happ-desktop/releases/latest/download/setup-Happ.x64.exe",
        },
      ],
    },
    {
      id: "clash-verge",
      label: "Clash Verge",
      deepLink: "clash://install-config?url=",
      downloads: [
        {
          id: "win-x64",
          label: "Windows",
          href: "https://github.com/clash-verge-rev/clash-verge-rev/releases/download/v2.4.4-rc/Clash.Verge_2.4.4-rc_x64-setup.exe",
        },
        {
          id: "win-arm",
          label: "Windows ARM",
          href: "https://github.com/clash-verge-rev/clash-verge-rev/releases/download/v2.4.4-rc/Clash.Verge_2.4.4-rc_arm64-setup.exe",
        },
      ],
      manualImport:
        "Если подписка не добавилась, скопируйте ссылку. В Clash Verge откройте Profiles, вставьте ссылку в поле импорта и нажмите Import.",
    },
    {
      id: "hiddify",
      label: "Hiddify",
      deepLink: "hiddify://import/",
      downloads: [
        {
          id: "win",
          label: "Windows",
          href: "https://github.com/hiddify/hiddify-app/releases/download/v2.5.7/Hiddify-Windows-Setup-x64.exe",
        },
      ],
    },
  ],
};

function copyLink(message: string, subscriptionUrl: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    navigator.clipboard.writeText(subscriptionUrl);
  }
  toast.success(message);
}

export function Index({ shortUuid }: { shortUuid?: string }) {
  const [expanded, setExpanded] = useState(false);
  const [os, setOs] = useState<OS>("macos");
  const [client, setClient] = useState<Client>("clash-verge");
  const [lang, setLang] = useState(LANGS[0]);
  const [osOpen, setOsOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionCardData | null>(null);
  const [subscriptionFailed, setSubscriptionFailed] = useState(false);
  const [subscriptionNotFound, setSubscriptionNotFound] = useState(false);
  const [runtimeConfig, setRuntimeConfig] = useState<RuntimePageConfig | null | undefined>(
    undefined,
  );
  const rootNotFound = shouldRenderSubscriptionRootNotFound(shortUuid, USE_MOCK_SUBSCRIPTION_INFO);
  const t = TRANSLATIONS[lang.code];
  const supportUrl = getClientSupportUrl(runtimeConfig, SUPPORT_URL);
  const runtimeSubscriptionUrl = getClientSubscriptionUrl(runtimeConfig, SUBSCRIPTION_URL);
  const subscriptionNotFoundRedirectUrl = getClientSubscriptionNotFoundRedirectUrl(
    runtimeConfig,
    SUBSCRIPTION_NOT_FOUND_REDIRECT_URL,
  );
  const subscriptionUrl = getSubscriptionUrlForShortUuid(
    runtimeSubscriptionUrl,
    shortUuid,
    typeof window === "undefined" ? undefined : window.location.origin,
  );
  const subscriptionInfoPath = getSubscriptionInfoPath(shortUuid);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 700);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (typeof navigator === "undefined") return;

    const userAgentData = (navigator as Navigator & { userAgentData?: { platform?: string } })
      .userAgentData;
    const detectedOS = detectOSFromClientHints({
      userAgent: navigator.userAgent,
      platform: userAgentData?.platform ?? navigator.platform,
      maxTouchPoints: navigator.maxTouchPoints,
    });

    if (detectedOS) setOs(detectedOS);
  }, []);

  useEffect(() => {
    if (CLIENTS_BY_OS[os].some((it) => it.id === client)) return;
    setClient(CLIENTS_BY_OS[os][0].id);
  }, [client, os]);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/page-config", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed to fetch page config");
        return (await response.json()) as RuntimePageConfig;
      })
      .then((data) => {
        if (cancelled) return;
        setRuntimeConfig(data);
      })
      .catch(() => {
        if (cancelled) return;
        setRuntimeConfig(null);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (rootNotFound) {
      setSubscription(null);
      setSubscriptionFailed(false);
      setSubscriptionNotFound(false);
      return () => {
        cancelled = true;
      };
    }

    if (USE_MOCK_SUBSCRIPTION_INFO) {
      setSubscription(MOCK_SUBSCRIPTION_INFO);
      setSubscriptionFailed(false);
      setSubscriptionNotFound(false);
      return () => {
        cancelled = true;
      };
    }

    if (runtimeConfig === undefined) {
      return () => {
        cancelled = true;
      };
    }

    fetch(subscriptionInfoPath, { cache: "no-store" })
      .then(readSubscriptionInfoResponse)
      .then((data) => {
        if (cancelled) return;
        setSubscription(data);
        setSubscriptionFailed(false);
        setSubscriptionNotFound(false);
      })
      .catch((error) => {
        if (cancelled) return;
        if (error instanceof SubscriptionInfoFetchError && error.status === 404) {
          setSubscription(null);
          setSubscriptionFailed(false);
          setSubscriptionNotFound(true);
          return;
        }
        const redirectUrl = getSubscriptionFailureRedirectUrl(
          true,
          subscriptionNotFoundRedirectUrl,
        );
        if (redirectUrl) {
          window.location.assign(redirectUrl);
          return;
        }
        setSubscriptionFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [rootNotFound, runtimeConfig, subscriptionInfoPath, subscriptionNotFoundRedirectUrl]);

  if (rootNotFound || subscriptionNotFound) {
    return <NotFoundComponent />;
  }

  const usagePercent = subscription?.usagePercent ?? 0;
  const tone: "ok" | "warn" | "danger" =
    usagePercent >= 95 ? "danger" : usagePercent >= 80 ? "warn" : "ok";
  const isActive = subscription?.status === "ACTIVE" && subscription.daysLeft >= 0;
  const subscriptionTitle =
    subscription?.username ??
    (subscriptionFailed ? t.subscriptionFetchFailed : t.subscriptionLoading);
  const subscriptionUserValue =
    subscription?.username ??
    (subscriptionFailed ? t.subscriptionUnavailable : t.subscriptionLoading);
  const subscriptionSummary = subscription
    ? getExpirationText(subscription, t)
    : subscriptionFailed
      ? null
      : t.subscriptionLoading;
  const selectedGuide = CLIENTS_BY_OS[os].find((it) => it.id === client) ?? CLIENTS_BY_OS[os][0];

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] -z-0"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 0%, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-0 opacity-[0.015]"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "3px 3px",
        }}
      />

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 pb-18 pt-6 sm:px-8 sm:pt-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:mb-10"
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/5 glow-soft">
              <Shield className="size-5" />
            </div>
            <h1 className="truncate text-xl font-semibold tracking-tight sm:text-2xl">
              {PAGE_TITLE}
            </h1>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {subscriptionUrl && <CopyIconButton t={t} subscriptionUrl={subscriptionUrl} />}
            {supportUrl && (
              <IconButton ariaLabel={t.supportTelegram} asLink href={supportUrl}>
                <Send className="size-[18px]" />
              </IconButton>
            )}
          </div>
        </motion.header>

        {!loaded && <PageSkeleton />}

        {loaded && (
          <>
            {/* Subscription card */}
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-card glow-soft transition-[border-color,box-shadow] duration-500 hover:border-white/20 hover:glow-strong"
            >
              <button
                onClick={() => setExpanded((v) => !v)}
                aria-expanded={expanded}
                aria-controls="subscription-details"
                className="flex w-full items-center justify-between gap-4 p-5 text-left sm:p-6"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <span className="relative grid size-3 shrink-0 place-items-center">
                    <span className="absolute inset-0 rounded-full bg-white pulse-glow" />
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-base font-medium tracking-tight">
                      {subscriptionTitle}
                    </div>
                    {subscriptionSummary && (
                      <div className="truncate text-sm text-muted-foreground">
                        {subscriptionSummary}
                      </div>
                    )}
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: expanded ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="shrink-0 text-muted-foreground"
                >
                  <ChevronDown className="size-5" />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {expanded && (
                  <motion.div
                    key="details"
                    id="subscription-details"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-white/10 px-5 py-5 sm:px-6">
                      <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
                        <Field label={t.user} value={subscriptionUserValue} />
                        <Field
                          label={t.status}
                          value={
                            <span className="inline-flex items-center gap-2">
                              <span
                                className={cn(
                                  "size-1.5 rounded-full",
                                  isActive ? "bg-white" : "bg-rose-400",
                                )}
                              />
                              {isActive ? t.active : t.inactive}
                            </span>
                          }
                        />
                        <Field
                          label={t.expiresAt}
                          value={
                            subscription
                              ? formatSubscriptionDate(subscription.expiresAt, lang.code)
                              : "—"
                          }
                        />
                      </div>
                      <div className="mt-6">
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{t.traffic}</span>
                          <span className="tabular-nums">
                            <span className="text-foreground">
                              {subscription?.trafficUsed ?? "—"}
                            </span>
                            <span className="text-muted-foreground">
                              {" "}
                              /{" "}
                              {subscription
                                ? subscription.trafficLimitBytes == null
                                  ? t.unlimitedTraffic
                                  : subscription.trafficLimit
                                : "—"}
                            </span>
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${subscription?.usagePercent ?? 0}%` }}
                            transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
                            className={cn(
                              "h-full rounded-full transition-colors duration-500",
                              tone === "ok" && "bg-white",
                              tone === "warn" && "bg-amber-300",
                              tone === "danger" && "bg-rose-400",
                            )}
                            style={{
                              boxShadow:
                                tone === "ok"
                                  ? "0 0 12px rgba(255,255,255,0.6)"
                                  : tone === "warn"
                                    ? "0 0 12px rgba(252,211,77,0.55)"
                                    : "0 0 12px rgba(251,113,133,0.6)",
                            }}
                          />
                        </div>
                        {subscription?.usagePercent != null && tone !== "ok" && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            {tone === "warn" ? t.quotaWarn : t.quotaDanger}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>

            {/* Install */}
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.12 }}
              className="mt-12"
            >
              <div className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:gap-4">
                <h2 className="text-xl font-semibold tracking-tight">{t.installTitle}</h2>
                <Popover open={osOpen} onOpenChange={setOsOpen}>
                  <PopoverTrigger asChild>
                    <button className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm transition-all duration-300 hover:border-white/25 hover:bg-white/10 hover:glow-soft sm:px-4">
                      {OS_OPTIONS.find((o) => o.id === os)?.icon}
                      <span>{OS_OPTIONS.find((o) => o.id === os)?.label}</span>
                      <ChevronDown
                        className={cn(
                          "size-4 text-muted-foreground transition-transform duration-300",
                          osOpen && "rotate-180",
                        )}
                      />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="end"
                    sideOffset={8}
                    className="z-50 w-44 rounded-2xl border-white/10 bg-popover p-1.5 glow-soft"
                  >
                    {OS_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setOs(opt.id);
                          setOsOpen(false);
                        }}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors",
                          os === opt.id
                            ? "bg-white/10 text-foreground"
                            : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                        )}
                      >
                        {opt.icon}
                        {opt.label}
                        {os === opt.id && <Check className="ml-auto size-4" />}
                      </button>
                    ))}
                  </PopoverContent>
                </Popover>
              </div>

              {/* Client toggle */}
              <ClientToggle os={os} client={client} setClient={setClient} />

              {/* Timeline */}
              <div className="mt-10">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${os}-${client}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ClientSteps guide={selectedGuide} subscriptionUrl={subscriptionUrl} t={t} />
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.section>

            {/* Language pill */}
            <div className="pointer-events-none fixed inset-x-0 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-40 flex justify-center px-4 sm:bottom-[calc(1.5rem+env(safe-area-inset-bottom))]">
              <Popover open={langOpen} onOpenChange={setLangOpen}>
                <PopoverTrigger asChild>
                  <button className="pointer-events-auto inline-flex translate-y-4 items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm shadow-2xl backdrop-blur transition-all duration-300 hover:border-white/25 hover:bg-white/10 hover:glow-soft">
                    <Globe className="size-4 text-muted-foreground" />
                    <span className="text-base leading-none">{lang.flag}</span>
                    <span>{lang.label}</span>
                    <ChevronDown
                      className={cn(
                        "size-4 text-muted-foreground transition-transform duration-300",
                        langOpen && "rotate-180",
                      )}
                    />
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  side="top"
                  sideOffset={8}
                  className="z-50 w-44 rounded-2xl border-white/10 bg-popover p-1.5 glow-soft"
                >
                  {LANGS.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLang(l);
                        setLangOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors",
                        l.code === lang.code
                          ? "bg-white/10 text-foreground"
                          : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                      )}
                    >
                      <span className="text-base leading-none">{l.flag}</span>
                      {l.label}
                      {l.code === lang.code && <Check className="ml-auto size-4" />}
                    </button>
                  ))}
                </PopoverContent>
              </Popover>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function IconButton({
  children,
  onClick,
  ariaLabel,
  asLink,
  href,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  ariaLabel: string;
  asLink?: boolean;
  href?: string;
}) {
  const cls =
    "group grid size-10 place-items-center rounded-full border border-white/10 bg-white/5 text-foreground transition-all duration-300 hover:scale-105 hover:border-white/25 hover:bg-white/10 hover:glow-soft active:scale-95";
  if (asLink && href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" aria-label={ariaLabel} className={cls}>
        {children}
      </a>
    );
  }
  return (
    <button onClick={onClick} aria-label={ariaLabel} className={cls}>
      {children}
    </button>
  );
}

function CopyIconButton({ t, subscriptionUrl }: { t: Translation; subscriptionUrl: string }) {
  const [copied, setCopied] = useState(false);
  const onClick = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(subscriptionUrl);
    }
    toast.success(t.copyToast);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };
  return (
    <button
      onClick={onClick}
      aria-label={t.copySubscriptionAria}
      className="group relative grid size-10 place-items-center overflow-hidden rounded-full border border-white/10 bg-white/5 text-foreground transition-all duration-300 hover:scale-105 hover:border-white/25 hover:bg-white/10 hover:glow-soft active:scale-95"
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span
            key="check"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 grid place-items-center"
          >
            <Check className="size-[18px]" />
          </motion.span>
        ) : (
          <motion.span
            key="link"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 grid place-items-center"
          >
            <Link2 className="size-[18px]" />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

function PageSkeleton() {
  return (
    <div aria-hidden className="space-y-12">
      <div className="space-y-6">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <div className="h-7 w-32 rounded-md skeleton" />
          <div className="h-9 w-32 rounded-full skeleton" />
        </div>
        <div className="h-10 w-56 rounded-full skeleton" />
        <div className="space-y-8 pt-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex gap-5">
              <div className="size-9 shrink-0 rounded-full skeleton" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-2/5 rounded-md skeleton" />
                <div className="h-3 w-3/4 rounded-md skeleton" />
                <div className="h-9 w-40 rounded-full skeleton" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DeepLinkButton({
  href,
  children,
  icon,
  t,
}: {
  href: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  t: Translation;
}) {
  const [showFallback, setShowFallback] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const onClick = () => {
    setShowFallback(false);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    const onVisibility = () => {
      if (document.visibilityState === "hidden" && timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
    document.addEventListener("visibilitychange", onVisibility, { once: true });
    timerRef.current = window.setTimeout(() => {
      document.removeEventListener("visibilitychange", onVisibility);
      setShowFallback(true);
      timerRef.current = null;
    }, 1800);
  };

  return (
    <div className="space-y-3">
      <a
        href={href}
        onClick={onClick}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all duration-300 hover:scale-[1.02] hover:glow-strong active:scale-[0.98] sm:w-auto"
      >
        {icon}
        {children}
      </a>
      <AnimatePresence>
        {showFallback && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
            className="flex max-w-sm flex-col items-start gap-2 rounded-2xl border border-amber-300/20 bg-amber-300/[0.04] p-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:gap-3"
          >
            <span className="inline-flex items-center gap-2 text-amber-200/90">
              <AlertCircle className="size-4 shrink-0" />
              {t.appMissing}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}

function getExpirationText(subscription: SubscriptionCardData, t: Translation): string {
  if (subscription.status !== "ACTIVE" || subscription.daysLeft < 0) return t.expired;
  if (subscription.daysLeft === 0) return t.expiresToday;
  return t.expiresInDays.replace("{days}", String(subscription.daysLeft));
}

function formatSubscriptionDate(value: string, lang: LangCode): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const locales: Record<LangCode, string> = {
    ru: "ru-RU",
    en: "en-US",
    es: "es-ES",
    de: "de-DE",
  };

  return new Intl.DateTimeFormat(locales[lang], {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function ClientToggle({
  os,
  client,
  setClient,
}: {
  os: OS;
  client: Client;
  setClient: (c: Client) => void;
}) {
  const items = CLIENTS_BY_OS[os];

  return (
    <div className="relative flex flex-wrap gap-1 rounded-2xl border border-white/10 bg-white/5 p-1 sm:inline-flex sm:rounded-full">
      {items.map((it) => {
        const active = client === it.id;
        return (
          <button
            key={it.id}
            onClick={() => setClient(it.id)}
            className={cn(
              "relative z-10 rounded-full px-5 py-2 text-sm transition-colors duration-300",
              active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {active && (
              <motion.span
                layoutId="client-pill"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
                className="absolute inset-0 -z-10 rounded-full bg-white"
                style={{ boxShadow: "0 0 24px rgba(255,255,255,0.35)" }}
              />
            )}
            {it.label}
          </button>
        );
      })}
    </div>
  );
}

function Step({
  index,
  title,
  children,
  last,
}: {
  index: number;
  title: string;
  children?: React.ReactNode;
  last?: boolean;
}) {
  return (
    <motion.li
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.05 * index }}
      className="relative pl-14"
    >
      {!last && (
        <span
          aria-hidden
          className="absolute left-[18px] top-10 bottom-[-28px] w-px bg-gradient-to-b from-white/15 to-white/0"
        />
      )}
      <span
        aria-hidden
        className="absolute left-0 top-0 grid size-9 place-items-center rounded-full border border-white/10 bg-white/5 text-sm font-medium tabular-nums glow-soft"
      >
        {index}
      </span>
      <h3 className="text-base font-semibold tracking-tight">{title}</h3>
      {children && <div className="mt-3 space-y-3 text-sm text-muted-foreground">{children}</div>}
    </motion.li>
  );
}

function GhostAction({
  children,
  onClick,
  href,
  active,
  icon,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  active?: boolean;
  icon?: React.ReactNode;
}) {
  const cls = cn(
    "inline-flex w-full items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm transition-all duration-300 hover:scale-[1.02] hover:border-white/30 hover:bg-white/10 sm:w-auto sm:justify-start",
    active
      ? "border-white/40 bg-white/10 text-foreground glow-soft"
      : "border-white/10 bg-white/[0.03] text-muted-foreground hover:text-foreground",
  );
  if (href) {
    return (
      <a href={href} className={cls}>
        {icon}
        {children}
      </a>
    );
  }
  return (
    <button onClick={onClick} className={cls}>
      {icon}
      {children}
    </button>
  );
}

function formatSubscriptionDeepLink(guide: ClientGuide, subscriptionUrl: string): string | null {
  if (!guide.deepLink || !subscriptionUrl) return null;

  const value = guide.base64Subscription
    ? btoa(subscriptionUrl)
    : encodeURIComponent(subscriptionUrl);
  return `${guide.deepLink}${value}`;
}

function ClientSteps({
  guide,
  subscriptionUrl,
  t,
}: {
  guide: ClientGuide;
  subscriptionUrl: string;
  t: Translation;
}) {
  const deepLink = formatSubscriptionDeepLink(guide, subscriptionUrl);
  const manualImportText = guide.manualImport ?? t.manualImportBody;
  const connectText = guide.connect ?? t.hiddifyConnectBody;
  const steps: React.ReactNode[] = [];

  steps.push(
    <Step key="download" index={steps.length + 1} title={`${t.clashDownloadTitle}: ${guide.label}`}>
      <p>{t.chooseBuild}</p>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {guide.downloads.map((d) => (
          <GhostAction key={d.id} href={d.href} icon={<Download className="size-4" />}>
            {d.label}
          </GhostAction>
        ))}
      </div>
    </Step>,
  );

  if (guide.warning) {
    steps.push(
      <Step key="warning" index={steps.length + 1} title={t.importantTitle}>
        <p>{guide.warning}</p>
      </Step>,
    );
  }

  steps.push(
    <Step key="add" index={steps.length + 1} title={t.addSubscriptionTitle}>
      <p>{t.clashAddBody}</p>
      {deepLink && (
        <DeepLinkButton href={deepLink} icon={<Download className="size-4" />} t={t}>
          {t.addSubscriptionButton}
        </DeepLinkButton>
      )}
    </Step>,
  );

  steps.push(
    <Step key="manual" index={steps.length + 1} title={t.manualImportTitle}>
      <p>{manualImportText}</p>
      <div>
        {subscriptionUrl && (
          <GhostAction
            onClick={() => copyLink(t.copyToast, subscriptionUrl)}
            icon={<Copy className="size-4" />}
          >
            {t.copyLink}
          </GhostAction>
        )}
      </div>
    </Step>,
  );

  steps.push(
    <Step key="connect" index={steps.length + 1} title={t.connectTitle} last>
      <p>{connectText}</p>
    </Step>,
  );

  return <ol className="space-y-10">{steps}</ol>;
}
