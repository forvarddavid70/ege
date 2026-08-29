import type { Metadata } from "next";
import Link from "next/link";
import { BenzeneRing } from "@/components/chem";
import SiteFooter from "@/components/landing/SiteFooter";
import Analytics from "@/components/Analytics";
import { getSettings } from "@/lib/store";

export const metadata: Metadata = {
  title: "Политика конфиденциальности",
  description:
    "Политика конфиденциальности и обработки персональных данных сайта «ЕГЭ Father», а также сведения об использовании cookie.",
};

export const dynamic = "force-dynamic";

export default async function PrivacyPage() {
  const settings = await getSettings();
  const brand = settings.brandName || "ЕГЭ Father";
  const tutor = settings.tutorName || "";
  const email = settings.email || "";
  const phone = settings.phone || "";
  const analyticsServices = [
    settings.yandexMetrikaId ? "Яндекс.Метрика (ООО «ЯНДЕКС»)" : "",
    settings.googleTagManagerId ? "Google Tag Manager / Google Analytics (Google LLC)" : "",
  ].filter(Boolean);
  const analyticsEnabled = analyticsServices.length > 0;
  const updated = new Date().toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-ink-950">
      <Analytics
        yandexMetrikaId={settings.yandexMetrikaId}
        googleTagManagerId={settings.googleTagManagerId}
      />
      {/* Простая шапка со ссылкой на главную */}
      <header className="sticky top-0 z-40 border-b border-ink-800 bg-ink-950/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
              <BenzeneRing className="h-5 w-5" />
            </span>
            <span className="text-base font-extrabold text-brand-300">{brand}</span>
          </Link>
          <Link href="/" className="text-sm font-medium text-ink-300 transition hover:text-brand-300">
            ← На главную
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
        <p className="eyebrow">Правовая информация</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Политика конфиденциальности
        </h1>
        <p className="mt-3 text-sm text-ink-400">Дата последнего обновления: {updated}</p>

        <div className="prose-invert mt-8 space-y-8 text-ink-200">
          <section className="space-y-3">
            <p>
              Настоящая Политика конфиденциальности (далее — «Политика») определяет порядок обработки
              и защиты персональных данных пользователей сайта{" "}
              <span className="font-medium text-white">«{brand}»</span> (далее — «Сайт») и действует в
              отношении всей информации, которую оператор может получить о пользователе во время
              использования Сайта и его формы заявки.
            </p>
            <p>
              Использование Сайта и отправка заявки означают согласие пользователя с настоящей
              Политикой и условиями обработки его персональных данных в соответствии с Федеральным
              законом от 27.07.2006 № 152-ФЗ «О персональных данных».
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">1. Оператор персональных данных</h2>
            <p>
              Оператором обработки персональных данных является{" "}
              <span className="font-medium text-white">{tutor || "владелец Сайта"}</span> (проект
              «{brand}»).
            </p>
            <ul className="list-disc space-y-1 pl-6 marker:text-brand-400">
              {email && (
                <li>
                  E-mail для обращений: <span className="text-white">{email}</span>
                </li>
              )}
              {phone && (
                <li>
                  Телефон: <span className="text-white">{phone}</span>
                </li>
              )}
            </ul>
            <p className="text-sm text-ink-400">
              Полные реквизиты оператора (ФИО/наименование, ИНН, адрес) указываются оператором и могут
              быть предоставлены по запросу.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">2. Какие данные обрабатываются</h2>
            <p>Через форму заявки на Сайте могут обрабатываться следующие данные, которые вы указываете добровольно:</p>
            <ul className="list-disc space-y-1 pl-6 marker:text-brand-400">
              <li>имя (или то, как к вам обращаться);</li>
              <li>номер телефона;</li>
              <li>адрес электронной почты;</li>
              <li>имя пользователя (ник) в Telegram;</li>
              <li>имя пользователя (ник) или ссылка во ВКонтакте;</li>
              <li>текст сообщения, который вы вводите самостоятельно.</li>
            </ul>
            <p>
              Также автоматически могут собираться технические данные (cookie, обезличенные данные о
              посещениях) — см. раздел 8.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">3. Цели обработки</h2>
            <ul className="list-disc space-y-1 pl-6 marker:text-brand-400">
              <li>обратная связь по вашему обращению и запись на занятия;</li>
              <li>консультирование и согласование удобного времени пробного занятия;</li>
              <li>информирование об услугах в объёме, необходимом для ответа на заявку.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">4. Правовые основания</h2>
            <p>
              Обработка осуществляется на основании согласия субъекта персональных данных, которое вы
              даёте, отмечая соответствующий пункт при отправке формы, а также в целях исполнения
              договора (оказания образовательных услуг), стороной которого является субъект.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">5. Передача данных третьим лицам</h2>
            <p>
              Данные из формы заявки передаются оператору через сервис обмена сообщениями Telegram
              (Telegram Messenger Inc.) — уведомление о новой заявке приходит оператору в Telegram.
              Оператор не продаёт и не передаёт персональные данные третьим лицам для маркетинга.
              Данные могут быть переданы уполномоченным государственным органам по основаниям и в
              порядке, установленным законодательством РФ.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">6. Сроки хранения</h2>
            <p>
              Персональные данные хранятся не дольше, чем этого требуют цели обработки, либо до отзыва
              согласия субъектом персональных данных. После достижения целей обработки или отзыва
              согласия данные удаляются или обезличиваются.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">7. Права субъекта персональных данных</h2>
            <p>Вы имеете право:</p>
            <ul className="list-disc space-y-1 pl-6 marker:text-brand-400">
              <li>получать сведения об обработке ваших данных;</li>
              <li>требовать уточнения, блокирования или уничтожения данных;</li>
              <li>отозвать согласие на обработку персональных данных в любой момент;</li>
              <li>обжаловать действия оператора в уполномоченном органе (Роскомнадзор).</li>
            </ul>
            <p>
              Для реализации своих прав отправьте обращение{" "}
              {email ? (
                <>
                  на e-mail <span className="text-white">{email}</span>
                </>
              ) : (
                "по контактам оператора, указанным на Сайте"
              )}
              .
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">8. Файлы cookie и аналитика</h2>
            <p>
              Сайт использует файлы cookie — небольшие текстовые файлы, сохраняемые в вашем браузере.
              Мы применяем строго необходимые (технические) cookie, обеспечивающие работу Сайта, в том
              числе сохранение сессии в служебном разделе.
            </p>
            {analyticsEnabled ? (
              <>
                <p>
                  С вашего согласия (кнопка «Принять» в баннере cookie) Сайт также использует
                  аналитические cookie следующих сервисов веб-аналитики:{" "}
                  <span className="text-white">{analyticsServices.join(", ")}</span>. Они собирают
                  обезличенные данные о посещениях (страницы, источники переходов, устройство и
                  поведение на Сайте) — это помогает улучшать Сайт. До получения согласия
                  аналитические скрипты не загружаются.
                </p>
                <p>
                  Обработка данных этими сервисами регулируется их собственными политиками. Вы можете
                  отказаться от аналитических cookie, нажав «Отклонить» в баннере или отключив cookie в
                  настройках браузера.
                </p>
              </>
            ) : (
              <p>
                Аналитические и рекламные cookie для профилирования не используются.
              </p>
            )}
            <p>
              Вы можете отключить cookie в настройках браузера, однако это может повлиять на работу
              отдельных функций Сайта.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">9. Изменения Политики</h2>
            <p>
              Оператор вправе вносить изменения в настоящую Политику. Актуальная редакция всегда
              размещается на этой странице с указанием даты последнего обновления.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">10. Контакты</h2>
            <p>
              По вопросам обработки персональных данных вы можете связаться с оператором
              {email ? (
                <>
                  {" "}по e-mail <span className="text-white">{email}</span>
                </>
              ) : null}
              {phone ? (
                <>
                  {" "}или по телефону <span className="text-white">{phone}</span>
                </>
              ) : null}
              .
            </p>
          </section>
        </div>

        <div className="mt-12">
          <Link href="/" className="btn-ghost">
            ← Вернуться на главную
          </Link>
        </div>
      </main>

      <SiteFooter settings={settings} />
    </div>
  );
}
