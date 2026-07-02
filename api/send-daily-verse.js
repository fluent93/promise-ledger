import webpush from "web-push";
import { getDailyVersePayload } from "./daily-verse-data.js";
import {
  createSendLock,
  deleteSubscription,
  isStorageConfigured,
  listSubscriptions,
  recordSendLog,
} from "./push-store.js";

const SLOT_INFO = {
  morning: { label: "아침", time: "07:30" },
  lunch: { label: "점심", time: "12:30" },
  evening: { label: "저녁", time: "21:30" },
};
const VALID_SLOTS = new Set(Object.keys(SLOT_INFO));
const SERVICE_TIME_ZONE = "Asia/Seoul";

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

  const now = new Date();
  const dateKey = formatDateInTimeZone(now, SERVICE_TIME_ZONE);
  const triggeredAt = now.toISOString();
  const triggeredAtLocal = formatDateTimeInTimeZone(now, SERVICE_TIME_ZONE);
  const slotInfo = SLOT_INFO[slot];

  try {
    const shouldSend = await createSendLock({ slot, dateKey, triggeredAt });
    if (!shouldSend) {
      const duplicateSummary = {
        event: "daily-verse-send-duplicate-skipped",
        slot,
        dateKey,
        triggeredAt,
        triggeredAtLocal,
      };
      console.log(JSON.stringify(duplicateSummary));
      response.status(200).json({ ok: true, duplicate: true, skipped: true, slot, dateKey, triggeredAtLocal });
      return;
    }

    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || "mailto:hello@example.com",
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY,
    );

    const records = await listSubscriptions();
    const targets = records.filter((record) => record.preferences?.[slot]);
    const payload = await getDailyVersePayload(now, { slot, slotLabel: slotInfo.label, scheduledTime: slotInfo.time });
    const results = await Promise.allSettled(targets.map((record) => sendToRecord(record, payload)));
    const summary = summarize(results);
    const logEntry = {
      event: "daily-verse-send",
      slot,
      slotLabel: slotInfo.label,
      scheduledTime: slotInfo.time,
      dateKey,
      triggeredAt,
      triggeredAtLocal,
      total: records.length,
      targeted: targets.length,
      ...summary,
    };

    await recordSendLog(logEntry);
    console.log(JSON.stringify(logEntry));
    response.status(200).json({ ok: true, ...logEntry });
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

function formatDateInTimeZone(date, timeZone) {
  const parts = getDateTimeParts(date, timeZone);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function formatDateTimeInTimeZone(date, timeZone) {
  const parts = getDateTimeParts(date, timeZone);
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second}`;
}

function getDateTimeParts(date, timeZone) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  return Object.fromEntries(formatter.formatToParts(date).map((part) => [part.type, part.value]));
}
