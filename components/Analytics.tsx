"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

// Тот же ключ, что использует баннер согласия на cookie (CookieConsent.tsx).
const STORAGE_KEY = "egefather_cookie_consent";
const CONSENT_EVENT = "cookie-consent-changed";

/**
 * Подключает счётчики аналитики — Яндекс.Метрику и Google Tag Manager (GTM).
 *
 * Счётчики загружаются ТОЛЬКО после того, как пользователь принял cookie в
 * баннере согласия: аналитические cookie не являются строго необходимыми, и
 * до согласия мы ничего не грузим. Идентификаторы задаются в админке /enter.
 *
 * GTM — это контейнер: сам GA4, ремаркетинг и прочие теги настраиваются уже
 * внутри интерфейса Google Tag Manager, а на сайте достаточно одного контейнера.
 */
export default function Analytics({
  yandexMetrikaId,
  googleTagManagerId,
}: {
  yandexMetrikaId: string;
  googleTagManagerId: string;
}) {
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    const read = () => {
      try {
        return window.localStorage.getItem(STORAGE_KEY) === "accepted";
      } catch {
        return false;
      }
    };
    setConsented(read());
    // Реагируем на выбор в баннере (в этой же или в соседней вкладке).
    const onChange = () => setConsented(read());
    window.addEventListener(CONSENT_EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(CONSENT_EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  if (!consented) return null;

  // Санитизация значений из настроек — защита от постороннего кода в инлайн-скрипте.
  const ym = (yandexMetrikaId || "").replace(/\D/g, "");
  const gtm = (googleTagManagerId || "").replace(/[^A-Za-z0-9-]/g, "");

  if (!ym && !gtm) return null;

  return (
    <>
      {ym && (
        <>
          <Script id="yandex-metrika" strategy="afterInteractive">
            {`(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,"script","https://mc.yandex.ru/metrika/tag.js?id=${ym}","ym");ym(${ym},"init",{ssr:true,webvisor:true,clickmap:true,ecommerce:"dataLayer",accurateTrackBounce:true,trackLinks:true});`}
          </Script>
          <noscript>
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://mc.yandex.ru/watch/${ym}`}
                style={{ position: "absolute", left: "-9999px" }}
                alt=""
              />
            </div>
          </noscript>
        </>
      )}

      {gtm && (
        <>
          <Script id="gtm-loader" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm}');`}
          </Script>
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtm}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
              title="Google Tag Manager"
            />
          </noscript>
        </>
      )}
    </>
  );
}
