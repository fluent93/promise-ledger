import { listSendLogs, storageHealth } from "./push-store.js";

export default async function handler(request, response) {
  response.setHeader("content-type", "application/json; charset=utf-8");

  if (request.method !== "GET") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  const vapid = {
    publicKey: Boolean(process.env.VAPID_PUBLIC_KEY),
    privateKey: Boolean(process.env.VAPID_PRIVATE_KEY),
    subject: process.env.VAPID_SUBJECT || "",
    configured: Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY),
  };

  let storage;
  try {
    storage = await storageHealth();
  } catch (error) {
    storage = { configured: true, ok: false, error: error.message || "Storage health check failed" };
  }

  let recentSends = [];
  try {
    recentSends = await listSendLogs(10);
  } catch {
    recentSends = [];
  }

  const appUrl = process.env.DAILY_ENGLISH_APP_URL || process.env.DAILY_VERSE_APP_URL || "/daily-verse/";
  const cron = {
    secretConfigured: Boolean(process.env.CRON_SECRET),
    schedule: "09:30 Asia/Seoul",
    endpoint: "/api/send-daily-expression",
    legacyEndpoint: "/api/send-daily-verse-morning",
  };

  response.status(200).json({
    ok: vapid.configured && storage.ok && (storage.mode === "local" || cron.secretConfigured),
    appUrl,
    vapid,
    storage,
    cron,
    recentSends,
    warning:
      storage.ok && storage.count > 0 && recentSends.length === 0
        ? "Subscriptions exist but no send logs yet. Confirm Cloud Scheduler or Vercel cron hits /api/send-daily-expression."
        : undefined,
  });
}
