export type NewsItem = {
  id: string;
  title: string;
  date: string; // ISO date (YYYY-MM-DD)
  summary?: string; // короткий анонс для карточки; если пусто, используется начало body
  body: string; // полный текст записи
  imageUrl?: string; // загруженная обложка или внешний URL
  youtubeUrl?: string; // ссылка на ролик YouTube, необязательно
};

export type MaterialItem = {
  id: string;
  title: string; // название материала
  summary: string; // короткая информация — видна на карточке в разделе «Материалы»
  body: string; // полный текст — виден в оверлее по клику на карточку
  youtubeUrl: string; // ссылка на видео YouTube (watch / youtu.be / shorts / embed), необязательно
  date: string; // ISO date (YYYY-MM-DD)
};

export type Course = {
  id: string;
  title: string;
  description: string;
  audience: string; // для кого (например «ЕГЭ», «Школа», «Олимпиады»)
  format: string; // «Индивидуально / онлайн» и т.п.
  price: string; // произвольная строка, например «1 500 ₽ / занятие»
};

export type EgeTask = {
  id: string;
  number: string; // номер задания ЕГЭ, например «34»
  topic: string; // тема, например «Растворы»
  difficulty: "базовый" | "повышенный" | "высокий";
  statement: string; // условие
  solution: string; // разбор
  answer: string; // ответ
};

export type Review = {
  id: string;
  name: string; // имя клиента, например «Мария К.»
  role: string; // кто оставил отзыв, например «11 класс, ЕГЭ» или «мама ученика»
  rating: number; // оценка от 1 до 5
  text: string; // текст отзыва
  date: string; // ISO date (YYYY-MM-DD)
  result: string; // короткий результат-бейдж, напр. «ЕГЭ 94 балла» (может быть пустым)
  avatarUrl: string; // фото автора: путь в public или URL (может быть пустым — тогда инициалы)
};

export type Settings = {
  tutorName: string;
  brandName: string; // бренд, например «ЕГЭ Father»
  avatarUrl: string; // фото/аватар репетитора: путь в public (напр. «/tutor.jpg»), загруженный файл (/uploads/…) или внешний URL
  aboutImages: string[]; // изображения для раздела «О себе»: загруженные PNG (/uploads/…) или внешние URL
  headline: string;
  subheadline: string;
  heroQuote: string; // короткий слоган, например «Скажешь спасибо через полгода»
  about: string;
  telegramUsername: string; // без @
  telegramBotUsername: string; // без @, опционально
  telegramChannel: string; // логин Telegram-канала без @, опционально
  telegramPrefill: string; // текст, который подставится в сообщение
  email: string;
  phone: string;
  experienceYears: string;
  studentsCount: string;
  avgScore: string;
  siteUrl: string; // канонический адрес сайта для SEO (sitemap, Open Graph, JSON-LD). Напр. «https://egefather.ru»
  yandexMetrikaId: string; // номер счётчика Яндекс.Метрики (только цифры), опционально
  googleTagManagerId: string; // идентификатор контейнера Google Tag Manager, напр. «GTM-XXXXXXX», опционально
  googleSiteVerification: string; // токен подтверждения прав в Google Search Console (meta google-site-verification), опционально
};

export type Section = "news" | "courses" | "ege" | "reviews" | "materials";

export type LeadStatus = "new" | "in_progress" | "done";

export type Lead = {
  id: string;
  createdAt: string; // ISO-8601 datetime, когда заявка получена сервером
  name: string;
  phone: string;
  email: string;
  telegram: string;
  vk: string;
  message: string;
  status: LeadStatus;
  autoReplied: boolean; // отправлен ли клиенту автоответ на e-mail
};

export type ContentShape = {
  news: NewsItem[];
  courses: Course[];
  ege: EgeTask[];
  reviews: Review[];
  materials: MaterialItem[];
};
