import { FieldValue, Timestamp, getFirestore } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";

const db = getFirestore();

export const supportedWelcomeEmailLocales = ["en", "tr", "es", "fr", "de", "ru", "ar", "zh"] as const;
type WelcomeEmailLocale = (typeof supportedWelcomeEmailLocales)[number];

type WelcomeEmailContent = {
  subject: string;
  preview: string;
  intro: string;
  body: string;
  cta: string;
};

export const welcomeEmailContent: Record<WelcomeEmailLocale, WelcomeEmailContent> = {
  en: {
    subject: "Welcome to My Outlet Guide",
    preview: "Your outlet discovery, favorites, trips, and preferences are ready to sync.",
    intro: "Thanks for joining My Outlet Guide.",
    body: "You can discover real Outlet destinations, save favorites, plan trips, and keep your preferences in sync across the app. Use My Outlet Guide to compare destination details, organize shopping plans, and prepare for Tax Free steps before you travel.",
    cta: "Start discovering outlets",
  },
  tr: {
    subject: "My Outlet Guide’a hoş geldiniz",
    preview: "Outlet keşfi, favorileriniz, gezileriniz ve tercihleriniz senkronize edilmeye hazır.",
    intro: "My Outlet Guide’a katıldığınız için teşekkür ederiz.",
    body: "Gerçek Outlet destinasyonlarını keşfedebilir, favorilerinizi kaydedebilir, gezilerinizi planlayabilir ve tercihlerinizi uygulama içinde senkronize tutabilirsiniz. My Outlet Guide ile destinasyon detaylarını karşılaştırın, alışveriş planlarınızı düzenleyin ve seyahatten önce Tax Free adımlarına hazırlanın.",
    cta: "Outlet keşfine başlayın",
  },
  es: {
    subject: "Te damos la bienvenida a My Outlet Guide",
    preview: "Tu descubrimiento de Outlet, favoritos, viajes y preferencias ya pueden sincronizarse.",
    intro: "Gracias por unirte a My Outlet Guide.",
    body: "Puedes descubrir destinos Outlet reales, guardar favoritos, planificar viajes y mantener tus preferencias sincronizadas en la app. Usa My Outlet Guide para comparar detalles de destinos, organizar planes de compras y preparar los pasos de Tax Free antes de viajar.",
    cta: "Empieza a descubrir outlets",
  },
  fr: {
    subject: "Bienvenue sur My Outlet Guide",
    preview: "Votre découverte Outlet, vos favoris, voyages et préférences sont prêts à être synchronisés.",
    intro: "Merci d’avoir rejoint My Outlet Guide.",
    body: "Vous pouvez découvrir de véritables destinations Outlet, enregistrer vos favoris, planifier vos voyages et garder vos préférences synchronisées dans l’app. Utilisez My Outlet Guide pour comparer les détails des destinations, organiser vos plans shopping et préparer les étapes Tax Free avant le voyage.",
    cta: "Commencer à découvrir les outlets",
  },
  de: {
    subject: "Willkommen bei My Outlet Guide",
    preview: "Outlet-Entdeckung, Favoriten, Reisen und Einstellungen können jetzt synchronisiert werden.",
    intro: "Danke, dass du My Outlet Guide nutzt.",
    body: "Du kannst echte Outlet-Ziele entdecken, Favoriten speichern, Reisen planen und deine Einstellungen in der App synchron halten. Nutze My Outlet Guide, um Zielinformationen zu vergleichen, Shopping-Pläne zu organisieren und Tax Free Schritte vor der Reise vorzubereiten.",
    cta: "Outlets entdecken",
  },
  ru: {
    subject: "Добро пожаловать в My Outlet Guide",
    preview: "Поиск Outlet, избранное, поездки и настройки готовы к синхронизации.",
    intro: "Спасибо, что присоединились к My Outlet Guide.",
    body: "Вы можете находить реальные Outlet-направления, сохранять избранное, планировать поездки и синхронизировать настройки в приложении. Используйте My Outlet Guide, чтобы сравнивать сведения о направлениях, организовывать shopping-планы и подготовиться к шагам Tax Free перед поездкой.",
    cta: "Начать поиск outlets",
  },
  ar: {
    subject: "مرحبا بك في My Outlet Guide",
    preview: "اكتشاف Outlet والمفضلات والرحلات والتفضيلات جاهزة للمزامنة.",
    intro: "شكرا لانضمامك إلى My Outlet Guide.",
    body: "يمكنك اكتشاف وجهات Outlet حقيقية، وحفظ المفضلات، وتخطيط الرحلات، وإبقاء تفضيلاتك متزامنة داخل التطبيق. استخدم My Outlet Guide لمقارنة تفاصيل الوجهات، وتنظيم خطط التسوق، والاستعداد لخطوات Tax Free قبل السفر.",
    cta: "ابدأ اكتشاف outlets",
  },
  zh: {
    subject: "欢迎使用 My Outlet Guide",
    preview: "Outlet 探索、收藏、行程和偏好设置已可同步。",
    intro: "感谢你加入 My Outlet Guide。",
    body: "你可以探索真实的 Outlet 目的地，保存收藏，规划行程，并在应用中同步偏好设置。使用 My Outlet Guide 比较目的地信息，整理购物计划，并在出行前准备 Tax Free 步骤。",
    cta: "开始探索 outlets",
  },
};

function resolveLocale(value: unknown): WelcomeEmailLocale {
  return typeof value === "string" && supportedWelcomeEmailLocales.includes(value as WelcomeEmailLocale)
    ? (value as WelcomeEmailLocale)
    : "en";
}

function htmlEscape(value: string) {
  return value.replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char] ?? char);
}

function renderText(content: WelcomeEmailContent) {
  return `${content.intro}\n\n${content.body}\n\n${content.cta}`;
}

function renderHtml(content: WelcomeEmailContent) {
  return `<!doctype html><html><body><span style="display:none">${htmlEscape(content.preview)}</span><h1>${htmlEscape(content.subject)}</h1><p>${htmlEscape(content.intro)}</p><p>${htmlEscape(content.body)}</p><p><strong>${htmlEscape(content.cta)}</strong></p></body></html>`;
}

type EmailConfig =
  | { provider: "sendgrid"; apiKey: string; from: string }
  | { provider: "resend"; apiKey: string; from: string }
  | null;

function getEmailConfig(): EmailConfig {
  const provider = process.env.WELCOME_EMAIL_PROVIDER?.toLowerCase();
  const apiKey = process.env.WELCOME_EMAIL_API_KEY;
  const from = process.env.WELCOME_EMAIL_FROM;
  if (!provider || !apiKey || !from) return null;
  if (provider === "sendgrid" || provider === "resend") return { provider, apiKey, from };
  logger.warn("Welcome email provider is unsupported; skipping send.", { provider });
  return null;
}

async function sendEmail(to: string, content: WelcomeEmailContent, config: Exclude<EmailConfig, null>) {
  const html = renderHtml(content);
  const text = renderText(content);
  const request =
    config.provider === "sendgrid"
      ? {
          url: "https://api.sendgrid.com/v3/mail/send",
          init: {
            method: "POST",
            headers: { Authorization: `Bearer ${config.apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({ personalizations: [{ to: [{ email: to }] }], from: { email: config.from }, subject: content.subject, content: [{ type: "text/plain", value: text }, { type: "text/html", value: html }] }),
          },
        }
      : {
          url: "https://api.resend.com/emails",
          init: {
            method: "POST",
            headers: { Authorization: `Bearer ${config.apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({ from: config.from, to: [to], subject: content.subject, html, text }),
          },
        };

  const response = await fetch(request.url, request.init);
  if (!response.ok) throw new Error(`Welcome email provider returned ${response.status}.`);
  return { sent: true, provider: config.provider };
}

const WELCOME_EMAIL_RESERVATION_TTL_MS = 10 * 60 * 1000;

type WelcomeEmailGuardStatus = "sent" | "sending" | "reserved" | "skipped_missing_config" | "failed";

function getTimestampMillis(value: unknown) {
  return value instanceof Timestamp ? value.toMillis() : null;
}

function isRecentGuard(status: unknown, createdAt: unknown, updatedAt: unknown, nowMillis: number) {
  if (status !== "sending" && status !== "reserved") return false;
  const guardMillis = getTimestampMillis(updatedAt) ?? getTimestampMillis(createdAt);
  return guardMillis !== null && nowMillis - guardMillis < WELCOME_EMAIL_RESERVATION_TTL_MS;
}

function safeErrorMessage(error: unknown) {
  return error instanceof Error ? error.message.slice(0, 240) : "Welcome email send failed.";
}

export const sendWelcomeEmail = onCall({ region: "us-central1" }, async (request) => {
  const uid = request.auth?.uid;
  const email = request.auth?.token.email;
  if (!uid || typeof email !== "string" || !email.trim()) {
    throw new HttpsError("unauthenticated", "Sign in is required before sending a welcome email.");
  }

  const locale = resolveLocale(request.data?.locale);
  const config = getEmailConfig();
  const eventRef = db.collection("mailEvents").doc(`welcome_${uid}`);

  if (!config) {
    logger.info("Welcome email config missing; no email was sent.");
    return db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(eventRef);
      const data = snapshot.data();
      if (data?.status === "sent") return { status: "already_sent" };

      transaction.set(
        eventRef,
        {
          type: "welcomeEmail",
          uid,
          locale,
          status: "skipped_missing_config" satisfies WelcomeEmailGuardStatus,
          provider: "not_configured",
          reason: "missing_provider_config",
          checkedAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
      return { status: "skipped_missing_config" };
    });
  }

  const reservation = await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(eventRef);
    const data = snapshot.data();
    const status = data?.status;
    const nowMillis = Date.now();

    if (status === "sent") return { status: "already_sent" };
    if (isRecentGuard(status, data?.createdAt, data?.updatedAt, nowMillis)) return { status: "already_sending" };

    transaction.set(
      eventRef,
      {
        type: "welcomeEmail",
        uid,
        locale,
        status: "sending" satisfies WelcomeEmailGuardStatus,
        provider: config.provider,
        reservedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    return { status: "reserved" };
  });

  if (reservation.status !== "reserved") return reservation;

  try {
    const result = await sendEmail(email.trim(), welcomeEmailContent[locale], config);
    const sentAt = FieldValue.serverTimestamp();
    await eventRef.set(
      {
        status: "sent" satisfies WelcomeEmailGuardStatus,
        sentAt,
        provider: result.provider,
        locale,
        uid,
        metadata: { contentVersion: "phase1b", providerAccepted: true },
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    await db.collection("users").doc(uid).set({ welcomeEmailSentAt: sentAt, preferredLanguage: locale }, { merge: true });
    return { status: "sent" };
  } catch (error) {
    logger.error("Welcome email provider send failed.", { uid, provider: config.provider, error: safeErrorMessage(error) });
    await eventRef.set(
      {
        status: "failed" satisfies WelcomeEmailGuardStatus,
        provider: config.provider,
        failedAt: FieldValue.serverTimestamp(),
        errorCode: "provider_send_failed",
        errorMessage: safeErrorMessage(error),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    throw new HttpsError("internal", "Welcome email could not be sent.");
  }
});
