# VPN Subscription Page

Создам одну страницу `/` (заменю placeholder в `src/routes/index.tsx`) в чёрно-белой эстетике с мягким white-glow и плавными анимациями.

## Визуальный стиль

- Фон: глубокий чёрный (`oklch(0.08 0 0)`) с едва заметным радиальным glow вверху.
- Акцент: чистый белый для активных кнопок/иконок, серый (`oklch(0.65 0 0)`) для описаний, тонкие белые бордеры `border-white/10`.
- Скругления: `rounded-2xl` для карточек, `rounded-full` для pill-кнопок и иконок.
- Glow: `box-shadow: 0 0 40px rgba(255,255,255,0.08)` на карточках и hover-state кнопок; усиление на hover до `0.15`.
- Типографика: крупные заголовки, `tracking-tight`. Шрифт — Geist (или системный sans), подключу через `<link>` в `__root.tsx`.
- Анимации: fade-in + slide-up на маунт (stagger по шагам timeline), `transition-all duration-300` на hover, плавное раскрытие карточки/dropdown через `framer-motion` (height + opacity), pulse-glow на статусной точке "Активна".

## Структура страницы

1. **Header** — логотип (моно-иконка щита) + заголовок `Subscription`; справа две круглые icon-кнопки: link (копирование ссылки подписки → toast) и Telegram (внешняя ссылка). Hover: scale 1.05 + glow.
2. **Subscription card** — раскрываемая (collapsible). Свёрнуто: статусная точка с pulse, `intezya`, "Истекает через 7 месяцев", шеврон. Раскрыто: grid с username / статусом / датой `02.02.2027` / прогресс-баром трафика `1.35 / 10.00 GiB` (анимированная заливка).
3. **Установка** — заголовок + OS-селектор (dropdown: Android/iOS/macOS/Windows, по умолчанию macOS). Под ним segmented toggle Clash Verge / Hiddify (animated indicator).
4. **Timeline инструкция** — вертикальная линия слева, круглые шаги с номерами, контент справа. Контент меняется по выбранному клиенту и ОС:
   - **Clash Verge**: скачать (4 варианта-кнопки: Windows / macOS Intel / macOS Apple Silicon / Linux, активные по выбранной ОС), сменить язык, "Добавить подписку" (deep-link), fallback с копированием ссылки, выбрать сервер + TUN Mode.
   - **Hiddify**: скачать (Windows/macOS/Linux), "Добавить подписку", подключиться.
   Stagger-анимация при смене клиента/ОС (motion `AnimatePresence`).
5. **Language pill** внизу по центру — флаг 🇷🇺 + "Русский" + chevron, dropdown вверх.

## UX-улучшения из брифа

- Кнопка копирования ссылки продублирована inline в fallback-шаге timeline, не только в header.
- Dropdown'ы используют `Popover` от shadcn с `z-50` и `sideOffset`, чтобы не пересекались с контентом.
- OS-селектор и набор download-кнопок синхронизированы: выбранная ОС подсвечивается в timeline.

## Технические детали

- Файлы: правка `src/routes/index.tsx` (вся страница) и `src/routes/__root.tsx` (title/description/og + `<link>` шрифта).
- Токены: добавлю в `src/styles.css` под `:root` чёрный фон/белый foreground, `--shadow-glow`, `--gradient-radial`. Использую существующие shadcn-компоненты: `Button`, `Card`, `Collapsible`, `Popover`, `Progress`, `Tabs` (для клиента), `Sonner` (toast копирования).
- Установлю `framer-motion` через `bun add` для анимаций раскрытия/stagger.
- Иконки: `lucide-react` (Shield, Link2, Send, ChevronDown, Copy, Download, Check, Globe).
- Состояние локальное (`useState`): expanded card, OS, client, language. Без бекенда — статичные данные пользователя `intezya`.

## SEO

`<title>Subscription — VPN</title>`, meta description, single H1 "Subscription".
