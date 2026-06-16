import { storageHealth } from "./push-store.js";

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

  const appUrl = process.env.DAILY_VERSE_APP_URL || "/daily-verse/";
  const cron = {
    secretConfigured: Boolean(process.env.CRON_SECRET),
    slots: ["morning", "lunch", "evening"],
  };

  response.status(200).json({
    ok: vapid.configured && storage.ok && (storage.mode === "local" || cron.secretConfigured),
    appUrl,
    vapid,
    storage,
    cron,
  });
}
