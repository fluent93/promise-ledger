import webpush from "web-push";
import { getDailyVersePayload } from "./daily-verse-data.js";
import { deleteSubscription, isStorageConfigured, listSubscriptions } from "./push-store.js";

const VALID_SLOTS = new Set(["morning", "lunch", "evening"]);

export default async function handler(request, response) {
  response.setHeader("content-type", "application/json; charset=utf-8");

  if (request.method !== "GET" && request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (!assertCronAuthorized(request)) {
    response.status(401).json({ error: "Unauthorized cron request" });
    return;
  }

  const slot = getSlot(request);
  if (!VALID_SLOTS.has(slot)) {
    response.status(400).json({ error: "slot must be morning, lunch, or evening" });
    return;
  }

  if (!isPushConfigured()) {
    response.status(501).json({ error: "Web Push is not configured" });
    return;
  }

  if (!isStorageConfigured()) {
    response.status(501).json({ error: "Push subscription storage is not configured" });
    return;
  }

  try {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || "mailto:hello@example.com",
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY,
    );

    const records = await listSubscriptions();
    const targets = records.filter((record) => record.preferences?.[slot]);
    const payload = getDailyVersePayload(new Date());
    const results = await Promise.allSettled(targets.map((record) => sendToRecord(record, payload)));
    const summary = summarize(results);

    response.status(200).json({ ok: true, slot, total: records.length, targeted: targets.length, ...summary });
  } catch (error) {
    response.status(500).json({ error: error.message || "Failed to send push notifications" });
  }
}

export function createSlotHandler(slot) {
  return (request, response) => {
    request.query = { ...(request.query || {}), slot };
    return handler(request, response);
  };
}

async function sendToRecord(record, payload) {
  try {
    await webpush.sendNotification(record.subscription, JSON.stringify(payload));
    return { ok: true };
  } catch (error) {
    if (error.statusCode === 404 || error.statusCode === 410) {
      await deleteSubscription(record.subscription);
      return { ok: false, removed: true, statusCode: error.statusCode };
    }
    throw error;
  }
}

function summarize(results) {
  return results.reduce(
    (summary, result) => {
      if (result.status === "fulfilled" && result.value.ok) summary.sent += 1;
      else if (result.status === "fulfilled" && result.value.removed) summary.removed += 1;
      else summary.failed += 1;
      return summary;
    },
    { sent: 0, removed: 0, failed: 0 },
  );
}

function getSlot(request) {
  const url = new URL(request.url || "/", "https://local.invalid");
  return request.query?.slot || url.searchParams.get("slot") || "morning";
}

function isPushConfigured() {
  return Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}


function assertCronAuthorized(request) {
  if (!process.env.CRON_SECRET) return true;
  const authorization = getHeader(request, "authorization");
  return authorization === `Bearer ${process.env.CRON_SECRET}`;
}

function getHeader(request, name) {
  if (!request.headers) return "";
  if (typeof request.headers.get === "function") return request.headers.get(name) || "";
  return request.headers[name] || request.headers[name.toLowerCase()] || "";
}
