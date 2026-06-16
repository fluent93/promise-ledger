import webpush from "web-push";
import { getDailyVersePayload } from "./daily-verse-data.js";

export default async function handler(request, response) {
  response.setHeader("content-type", "application/json; charset=utf-8");

  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (!isPushConfigured()) {
    response.status(501).json({ error: "Web Push is not configured" });
    return;
  }

  try {
    const body = parseBody(request.body);
    const subscription = body?.subscription;
    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      response.status(400).json({ error: "A valid push subscription is required" });
      return;
    }

    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || "mailto:hello@example.com",
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY,
    );

    const payload = getDailyVersePayload(new Date());
    await webpush.sendNotification(subscription, JSON.stringify({
      ...payload,
      title: `테스트 · ${payload.title}`,
    }));
    response.status(200).json({ ok: true });
  } catch (error) {
    response.status(500).json({ error: error.message || "Failed to send test push" });
  }
}

function isPushConfigured() {
  return Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}

function parseBody(body) {
  if (body === undefined || body === null) return {};
  if (Buffer.isBuffer(body)) return parseBody(body.toString("utf8"));
  if (typeof body === "object") return body;
  if (typeof body !== "string") return {};
  if (!body.trim()) return {};
  return JSON.parse(body);
}
