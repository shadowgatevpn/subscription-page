import { createFileRoute } from "@tanstack/react-router";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Subscription — VPN" },
      { name: "description", content: "Manage your VPN subscription, install the client and import your config." },
      { property: "og:title", content: "Subscription — VPN" },
      { property: "og:description", content: "Manage your VPN subscription, install the client and import your config." },
    ],
  }),
  component: Index,
});

const SUBSCRIPTION_URL =
  "https://vpn.example.com/subscription/intezya/abc123def456";

type OS = "android" | "ios" | "macos" | "windows";
type Client = "clash" | "hiddify";

const OS_OPTIONS: { id: OS; label: string; icon: React.ReactNode }[] = [
  { id: "android", label: "Android", icon: <Smartphone className="size-4" /> },
  { id: "ios", label: "iOS", icon: <Apple className="size-4" /> },
  { id: "macos", label: "macOS", icon: <Apple className="size-4" /> },
  { id: "windows", label: "Windows", icon: <Monitor className="size-4" /> },
];

const LANGS = [
  { code: "ru", flag: "🇷🇺", label: "Русский" },
  { code: "en", flag: "🇬🇧", label: "English" },
  { code: "es", flag: "🇪🇸", label: "Español" },
  { code: "de", flag: "🇩🇪", label: "Deutsch" },
];

function copyLink() {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    navigator.clipboard.writeText(SUBSCRIPTION_URL);
  }
  toast.success("Ссылка скопирована");
}

function Index() {
  const [expanded, setExpanded] = useState(false);
  const [os, setOs] = useState<OS>("macos");
  const [client, setClient] = useState<Client>("clash");
  const [lang, setLang] = useState(LANGS[0]);
  const [osOpen, setOsOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 700);
    return () => clearTimeout(t);
  }, []);

  const usedGiB = 1.35;
  const totalGiB = 10;
  const usedPct = (usedGiB / totalGiB) * 100;
  const resetDate = "02.07.2026";
  const tone: "ok" | "warn" | "danger" =
    usedPct >= 95 ? "danger" : usedPct >= 80 ? "warn" : "ok";

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
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "3px 3px",
        }}
      />

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 pb-32 pt-6 sm:px-8 sm:pt-8">
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
              Subscription
            </h1>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <CopyIconButton />
            <IconButton
              ariaLabel="Поддержка в Telegram"
              asLink
              href="https://t.me/"
            >
              <Send className="size-[18px]" />
            </IconButton>
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
          className="group relative overflow-hidden rounded-3xl border border-white/10 bg-card glow-soft transition-all duration-500 hover:border-white/20 hover:glow-strong"
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
                  intezya
                </div>
                <div className="truncate text-sm text-muted-foreground">
                  Истекает через 7 месяцев
                </div>
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
                    <Field label="Пользователь" value="intezya" />
                    <Field
                      label="Статус"
                      value={
                        <span className="inline-flex items-center gap-2">
                          <span className="size-1.5 rounded-full bg-white" />
                          Активна
                        </span>
                      }
                    />
                    <Field label="Окончание" value="02.02.2027" />
                  </div>
                  <div className="mt-6">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Трафик
                        <span className="ml-2 text-xs text-muted-foreground/70">
                          сброс {resetDate}
                        </span>
                      </span>
                      <span className="tabular-nums">
                        <span className="text-foreground">{usedGiB.toFixed(2)} GiB</span>
                        <span className="text-muted-foreground"> / {totalGiB.toFixed(2)} GiB</span>
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${usedPct}%` }}
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
                    {tone !== "ok" && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        {tone === "warn"
                          ? "Использовано более 80% квоты — следите за расходом."
                          : "Квота почти исчерпана — трафик скоро закончится."}
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
            <h2 className="text-xl font-semibold tracking-tight">Установка</h2>
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
          <ClientToggle client={client} setClient={setClient} />

          {/* Timeline */}
          <div className="mt-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={client}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
              >
                {client === "clash" ? (
                  <ClashSteps os={os} />
                ) : (
                  <HiddifySteps os={os} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.section>

        {/* Language pill */}
        <div className="mt-14 flex justify-center sm:mt-16">
          <Popover open={langOpen} onOpenChange={setLangOpen}>
            <PopoverTrigger asChild>
              <button className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm transition-all duration-300 hover:border-white/25 hover:bg-white/10 hover:glow-soft">
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
                  {l.code === lang.code && (
                    <Check className="ml-auto size-4" />
                  )}
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
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        aria-label={ariaLabel}
        className={cls}
      >
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

function CopyIconButton() {
  const [copied, setCopied] = useState(false);
  const onClick = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(SUBSCRIPTION_URL);
    }
    toast.success("Ссылка скопирована");
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };
  return (
    <button
      onClick={onClick}
      aria-label="Скопировать ссылку подписки"
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
      <div className="h-[88px] rounded-3xl skeleton" />
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
}: {
  href: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
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
            className="flex flex-col items-start gap-2 rounded-2xl border border-amber-300/20 bg-amber-300/[0.04] p-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:gap-3"
          >
            <span className="inline-flex items-center gap-2 text-amber-200/90">
              <AlertCircle className="size-4 shrink-0" />
              Не открылось? Похоже, приложение ещё не установлено.
            </span>
            <button
              onClick={() => {
                if (typeof navigator !== "undefined" && navigator.clipboard) {
                  navigator.clipboard.writeText(SUBSCRIPTION_URL);
                }
                toast.success("Ссылка скопирована");
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-foreground transition-colors hover:border-white/25 hover:bg-white/10"
            >
              <Copy className="size-3.5" />
              Скопировать ссылку
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}

function ClientToggle({
  client,
  setClient,
}: {
  client: Client;
  setClient: (c: Client) => void;
}) {
  const items: { id: Client; label: string }[] = [
    { id: "clash", label: "Clash Verge" },
    { id: "hiddify", label: "Hiddify" },
  ];
  return (
    <div className="relative inline-flex rounded-full border border-white/10 bg-white/5 p-1">
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

function ClashSteps({ os }: { os: OS }) {
  const downloads: { id: string; label: string; matchOs: OS[]; href: string }[] = [
    { id: "win", label: "Windows", matchOs: ["windows"], href: "#" },
    { id: "mac-intel", label: "macOS Intel", matchOs: ["macos"], href: "#" },
    { id: "mac-as", label: "macOS Apple Silicon", matchOs: ["macos"], href: "#" },
    { id: "linux", label: "Linux", matchOs: [], href: "#" },
  ];

  return (
    <ol className="space-y-10">
      <Step index={1} title="Скачайте Clash Verge">
        <p>Выберите сборку для вашей платформы.</p>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {downloads.map((d) => (
            <GhostAction
              key={d.id}
              href={d.href}
              active={d.matchOs.includes(os)}
              icon={<Download className="size-4" />}
            >
              {d.label}
            </GhostAction>
          ))}
        </div>
      </Step>
      <Step index={2} title="Смените язык интерфейса">
        <p>
          При необходимости откройте Settings → Language и выберите подходящий
          язык.
        </p>
      </Step>
      <Step index={3} title="Добавьте подписку">
        <p>
          Нажмите кнопку — приложение откроется и импортирует профиль
          автоматически.
        </p>
        <DeepLinkButton
          href={`clash://install-config?url=${encodeURIComponent(SUBSCRIPTION_URL)}`}
          icon={<Download className="size-4" />}
        >
          Добавить подписку
        </DeepLinkButton>
      </Step>
      <Step index={4} title="Не сработало? Импортируйте вручную">
        <p>
          Скопируйте ссылку и вставьте её в Profiles → Import в Clash Verge.
        </p>
        <div>
          <GhostAction onClick={copyLink} icon={<Copy className="size-4" />}>
            Скопировать ссылку
          </GhostAction>
        </div>
      </Step>
      <Step index={5} title="Подключитесь" last>
        <p>Выберите сервер, включите VPN и активируйте TUN Mode.</p>
      </Step>
    </ol>
  );
}

function HiddifySteps({ os }: { os: OS }) {
  const downloads: { id: string; label: string; matchOs: OS[]; href: string }[] = [
    { id: "win", label: "Windows", matchOs: ["windows"], href: "#" },
    { id: "mac", label: "macOS", matchOs: ["macos"], href: "#" },
    { id: "linux", label: "Linux", matchOs: [], href: "#" },
  ];
  return (
    <ol className="space-y-10">
      <Step index={1} title="Скачайте Hiddify">
        <p>Выберите сборку для вашей платформы.</p>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {downloads.map((d) => (
            <GhostAction
              key={d.id}
              href={d.href}
              active={d.matchOs.includes(os)}
              icon={<Download className="size-4" />}
            >
              {d.label}
            </GhostAction>
          ))}
        </div>
        <div className="pt-1">
          <GhostAction onClick={copyLink} icon={<Copy className="size-4" />}>
            Скопировать ссылку
          </GhostAction>
        </div>
      </Step>
      <Step index={2} title="Добавьте подписку">
        <p>Откройте приложение и импортируйте профиль одной кнопкой.</p>
        <DeepLinkButton
          href={`hiddify://install-config?url=${encodeURIComponent(SUBSCRIPTION_URL)}`}
          icon={<Download className="size-4" />}
        >
          Добавить подписку
        </DeepLinkButton>
      </Step>
      <Step index={3} title="Подключитесь" last>
        <p>В приложении выберите сервер и нажмите основную кнопку подключения.</p>
      </Step>
    </ol>
  );
}
