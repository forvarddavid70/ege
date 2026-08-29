# Explainer — Google Tag Manager + расширенная Яндекс.Метрика + Google Search Console

> Пояснительная записка к изменению аналитики на сайте репетитора «ЕГЭ Father».
> Читается сверху вниз; блок **Background** можно пропустить, если вы уже знаете, как устроен проект.

## Background

**Для тех, кто видит проект впервые.** Сайт — это приложение на **Next.js 14 (App Router)**.
Страницы (`app/page.tsx`, `app/privacy/page.tsx`) рендерятся на сервере, а интерактивные части
живут в клиентских компонентах (директива `"use client"`). Тексты, контакты и настройки аналитики
хранятся не в коде, а в JSON-файле `data/settings.json` (плюс приоритетный `data/settings.local.json`,
который пишет скрытая админка `/enter`). Функция `getSettings()` в `lib/store.ts` сливает эти источники
с дефолтами из `DEFAULT_SETTINGS`, так что любая страница получает готовый объект `Settings`
(тип описан в `lib/types.ts`).

Аналитика на сайте устроена **приватно по умолчанию**. Есть баннер согласия на cookie
(`components/CookieConsent.tsx`): пока пользователь не нажал «Принять», в `localStorage` нет ключа
`egefather_cookie_consent=accepted`, и счётчики не грузятся вовсе. Компонент `components/Analytics.tsx`
слушает это согласие (через событие `cookie-consent-changed` и `storage`) и только после согласия
вставляет скрипты через `next/script`.

**Что было конкретно до изменения.** `Analytics.tsx` принимал два идентификатора — `yandexMetrikaId`
и `googleAnalyticsId`. Для Google подключался **напрямую GA4** через `gtag.js`
(`https://www.googletagmanager.com/gtag/js?id=G-...`). Яндекс.Метрика инициализировалась минимально:
`{clickmap, trackLinks, accurateTrackBounce}`. Подтверждения прав в Google Search Console не было вовсе.

## Intuition

Пользователь прислал три реальных фрагмента для продакшена и попросил «обновить код под Google
Analytics и Яндекс.Метрику». Ключевая идея изменения — понять, *чем* эти фрагменты являются, и уложить
их в существующую (настраиваемую из админки, приватную до согласия) архитектуру, а не хардкодить в разметку.

> 💡 **Главное наблюдение.** Прислан не GA4-тег, а **контейнер Google Tag Manager** (`GTM-WM7GMQW2`).
> GTM — это «диспетчер тегов»: на сайт ставится один контейнер, а сам GA4, Яндекс, пиксели и т.д.
> настраиваются уже внутри интерфейса GTM. Поэтому прямой `gtag.js` заменяется на загрузчик GTM —
> иначе GA считался бы дважды.

Второй фрагмент — **более полная инициализация Яндекс.Метрики** (`webvisor`, `ecommerce:"dataLayer"`,
`ssr` и т.д.) для счётчика `110584404`. Третий — **не аналитика вообще**, а мета-тег
`google-site-verification` для подтверждения прав в Search Console.

> 💡 **Ключевое различие.** Скрипты аналитики ставят cookie и трекают пользователя → грузим их
> только после согласия. Тег `google-site-verification` ничего не трекает и cookie не ставит — это
> просто «расписка о владении сайтом» для краулера Google. Поэтому он должен присутствовать **всегда**,
> на всех страницах, независимо от согласия. Отсюда разные места: скрипты остаются в `Analytics.tsx`
> (за гейтом согласия), а верификация уезжает в `metadata` лейаута.

На игрушечном примере: заходит краулер Google — он не жмёт «Принять cookie», JS может не исполнять, но
`<meta name="google-site-verification">` в `<head>` он увидит. А обычный посетитель, нажав «Принять»,
получит и Метрику, и контейнер GTM.

## Code

**1. Модель настроек.** Поле `googleAnalyticsId` переименовано в `googleTagManagerId` и добавлено
`googleSiteVerification` — в типе (`lib/types.ts`), дефолтах (`lib/store.ts`), санитайзере API
(`app/api/admin/settings/route.ts`) и полях админки (`components/admin/AdminDashboard.tsx`).

```ts
// lib/types.ts
yandexMetrikaId: string;        // номер счётчика Яндекс.Метрики (только цифры)
googleTagManagerId: string;     // контейнер GTM, напр. «GTM-XXXXXXX»
googleSiteVerification: string; // токен google-site-verification для Search Console
```

```ts
// app/api/admin/settings/route.ts — оставляем только безопасные символы
next.googleTagManagerId = next.googleTagManagerId.replace(/[^A-Za-z0-9-]/g, "");
next.googleSiteVerification = next.googleSiteVerification.replace(/[^A-Za-z0-9_-]/g, "");
```

**2. Ядро — `components/Analytics.tsx`.** Логика согласия не тронута. Изменилась только «начинка»:
блок GA4 (`gtag.js` + `gtag('config')`) заменён на загрузчик контейнера GTM, а инициализация Метрики
стала полной.

```tsx
// Яндекс.Метрика: расширенная инициализация
ym(${ym},"init",{ssr:true,webvisor:true,clickmap:true,ecommerce:"dataLayer",accurateTrackBounce:true,trackLinks:true});

// Google Tag Manager: один контейнер вместо прямого GA4
<Script id="gtm-loader" strategy="afterInteractive">
  {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
    var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
    j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
    f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm}');`}
</Script>
```

> ⚠️ **Тонкость про `<noscript>`.** И у Метрики, и у GTM есть `<noscript>`-фолбэк для посетителей
> без JS. Но в этой архитектуре `Analytics` — клиентский компонент, который до чтения согласия из
> `localStorage` (а это возможно только с JS) возвращает `null`. Значит для пользователя без JS
> компонент вообще ничего не рендерит, и `<noscript>` не срабатывает. Это не баг, а корректное
> следствие «приватности по умолчанию»: без JS невозможно получить согласие на cookie, поэтому и
> трекать никого нельзя. Тег оставлен для симметрии и совпадения с присланным сниппетом.

**3. Верификация Google — в метаданные лейаута.** `app/layout.tsx` уже грузит `settings` в
`generateMetadata()`, поэтому тег добавляется декларативно и рендерится в `<head>` на всех страницах:

```ts
verification: settings.googleSiteVerification
  ? { google: settings.googleSiteVerification }
  : undefined,
```

**4. Проводка и данные.** `app/page.tsx` и `app/privacy/page.tsx` передают `googleTagManagerId`
вместо `googleAnalyticsId`; на `/privacy` в списке сервисов теперь «Google Tag Manager / Google
Analytics (Google LLC)». Реальные значения прописаны в сид-файле `data/settings.json`, чтобы
заработать сразу:

```json
"yandexMetrikaId": "110584404",
"googleTagManagerId": "GTM-WM7GMQW2",
"googleSiteVerification": "uJp4FyYq8TRf7OudB6jD9P771BJRs-g9QPyZbVtJSXs"
```

## Verification

Автоматически проверено в песочнице:

- `npx tsc --noEmit` — типы проходят (0 ошибок).
- `npm run build` — прод-сборка успешна, все 12 маршрутов собираются.
- Прод-сервер + `curl`: мета-тег `google-site-verification` присутствует в `<head>` и на `/`, и на
  `/privacy`; идентификаторы `110584404` и `GTM-WM7GMQW2` попадают в клиентские пропсы, но самих
  скриптов трекинга до согласия в HTML нет.
- Headless-браузер (Playwright): **до** согласия узлов `#yandex-metrika` и `#gtm-loader` нет;
  **после** программного согласия (как это делает баннер) оба инлайн-скрипта появляются, инициализация
  Метрики содержит `webvisor:true`, а загрузчик GTM — `'GTM-WM7GMQW2'`.

**Ручная проверка (QA):**

1. Откройте сайт в чистом приватном окне → в исходнике `<head>` найдите `google-site-verification`
   (должен быть сразу).
2. Откройте DevTools → Network. До нажатия «Принять» запросов на `mc.yandex.ru` и `googletagmanager.com`
   быть не должно.
3. Нажмите «Принять» в баннере cookie → появятся запросы к `mc.yandex.ru/metrika/tag.js?id=110584404`
   и `googletagmanager.com/gtm.js?id=GTM-WM7GMQW2`.
4. Проверьте `window.dataLayer` в консоли — массив существует; в GTM Preview контейнер `GTM-WM7GMQW2` виден.
5. В Google Search Console → «Подтверждение через HTML-тег» → «Проверить».

## Alternatives

**Альтернатива A. Оставить прямой GA4 (`gtag.js`) и просто добавить поля.**

| Плюсы | Минусы |
| --- | --- |
| Меньше правок в `Analytics.tsx` | Пользователь прислал именно GTM-контейнер, а не GA4-ID |
| GA4 работает «из коробки» без настройки в GTM | Если GTM тоже содержит GA4 → двойной подсчёт |
| — | Нельзя добавлять другие теги без правки кода |

**Альтернатива B. Хардкодить сниппеты прямо в `layout.tsx`/HTML.**

| Плюсы | Минусы |
| --- | --- |
| Максимально дословно к присланному коду | Ломает приватность: скрипты грузятся до согласия на cookie |
| Ничего не надо проводить через настройки | Значения нельзя поменять из админки `/enter` |
| — | Рассинхрон с существующей архитектурой проекта |

Выбран путь через настройки + GTM, потому что он сохраняет «приватность по умолчанию», не хардкодит
идентификаторы и точно соответствует тому, что прислал пользователь.

## Suggested people to talk to

- **acoulbot (infinitas.vine@gmail.com)** — автор исходного лендинга «ЕГЭ Father» и модели
  данных/`Settings`. Лучший человек по вопросам о том, как хранятся настройки, как работает админка
  `/enter` и какие домены/счётчики реально используются в продакшене.

> ℹ️ Практически весь код аналитики и SEO в истории репозитория был написан ИИ (коммиты от «Claude»),
> поэтому «эксперта-человека» именно по `Analytics.tsx` в истории нет — тем важнее ревью со стороны
> владельца проекта.

## Quiz

<details>
<summary>1. Почему <code>gtag.js</code> заменён на загрузчик GTM, а не оставлен рядом?</summary>

- **A)** GTM быстрее — ❌ дело не в скорости.
- **B)** Прислан контейнер GTM, а GA4 внутри него; держать оба → двойной подсчёт GA — ✅ **верно**.
- **C)** `gtag.js` устарел и удалён Google — ❌ он работает.
- **D)** GTM не требует согласия на cookie — ❌ требует, гейт согласия сохранён.
</details>

<details>
<summary>2. Почему <code>google-site-verification</code> живёт в <code>metadata</code> лейаута, а не в <code>Analytics.tsx</code>?</summary>

- **A)** Так меньше кода — ❌ не в этом суть.
- **B)** Это не трекинг и не cookie; тег нужен всегда, в т.ч. до/без согласия, на всех страницах — ✅ **верно**.
- **C)** Next.js запрещает мета-теги в клиентских компонентах — ❌ можно, но неправильно семантически.
- **D)** Чтобы скрыть тег от пользователей — ❌ он публичный по определению.
</details>

<details>
<summary>3. Что произойдёт с <code>&lt;noscript&gt;</code>-фолбэком GTM у посетителя с отключённым JS?</summary>

- **A)** Загрузится iframe GTM — ❌.
- **B)** Ничего: компонент клиентский и без JS вернёт `null`, `<noscript>` не отрендерится — ✅ **верно**, и это ожидаемо.
- **C)** Сайт покажет ошибку — ❌.
- **D)** Сработает серверный рендер скриптов — ❌ компонент не рендерит их на сервере.
</details>

<details>
<summary>4. Зачем идентификаторы прописаны в <code>data/settings.json</code>, а не только в <code>DEFAULT_SETTINGS</code>?</summary>

- **A)** `DEFAULT_SETTINGS` только для типов — ❌ он даёт реальные дефолты.
- **B)** `getSettings()` сливает settings.json поверх дефолтов; в сиде реальные значения → аналитика работает сразу без ручного ввода в админке — ✅ **верно**.
- **C)** JSON быстрее читается — ❌ не про это.
- **D)** Иначе TypeScript не соберётся — ❌ сборка не зависит от значений.
</details>

<details>
<summary>5. Что делает <code>replace(/[^A-Za-z0-9_-]/g, "")</code> для <code>googleSiteVerification</code> в API-роуте?</summary>

- **A)** Переводит в верхний регистр — ❌.
- **B)** Оставляет только буквы/цифры/`_`/`-`, отсекая потенциально опасные символы из значения настройки — ✅ **верно** (защита при выводе в разметку).
- **C)** Проверяет валидность токена у Google — ❌ никаких сетевых запросов.
- **D)** Удаляет пробелы только по краям — ❌ убирает любые «лишние» символы по всей строке.
</details>
