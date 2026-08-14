import webpush from "web-push";
import { getDailyExpressionPayload } from "./daily-expression-data.js";
import {
  createSendLock,
  deleteSubscription,
  isStorageConfigured,
  listSubscriptions,
  recordSendLog,
} from "./push-store.js";

const SERVICE_TIME_ZONE = "Asia/Seoul";
const DELIVERY_TIME = "09:30";

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
  try {
    const shouldSend = await createSendLock({ slot: "daily", dateKey, triggeredAt });
    if (!shouldSend) {
      const duplicateSummary = {
        event: "daily-expression-send-duplicate-skipped",
        schedule: DELIVERY_TIME,
        dateKey,
        triggeredAt,
        triggeredAtLocal,
      };
      console.log(JSON.stringify(duplicateSummary));
      response.status(200).json({ ok: true, duplicate: true, skipped: true, dateKey, triggeredAtLocal });
      return;
    }

    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || "mailto:hello@example.com",
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY,
    );

    const records = await listSubscriptions();
    const payload = getDailyExpressionPayload(now, { slotLabel: "아침", scheduledTime: DELIVERY_TIME });
    const results = await Promise.allSettled(records.map((record) => sendToRecord(record, payload)));
    const summary = summarize(results);
    const logEntry = {
      event: "daily-expression-send",
      slot: "daily",
      scheduledTime: DELIVERY_TIME,
      dateKey,
      triggeredAt,
      triggeredAtLocal,
      total: records.length,
      targeted: records.length,
      ...summary,
    };

    await recordSendLog(logEntry);
    console.log(JSON.stringify(logEntry));
    response.status(200).json({ ok: true, ...logEntry });
  } catch (error) {
    response.status(500).json({ error: error.message || "Failed to send push notifications" });
  }
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
