import { deleteSubscription, isStorageConfigured, saveSubscription } from "./push-store.js";

export default async function handler(request, response) {
  response.setHeader("content-type", "application/json; charset=utf-8");

  if (!isStorageConfigured()) {
    response.status(501).json({ error: "Push subscription storage is not configured" });
    return;
  }

  try {
    const body = parseBody(request.body);
    if (request.method === "POST") {
      const record = normalizeRecord(body);
      const id = await saveSubscription(record);
      response.status(200).json({ ok: true, id });
      return;
    }

    if (request.method === "DELETE") {
      if (!body?.endpoint) throw new Error("endpoint is required");
      await deleteSubscription(body.endpoint);
      response.status(200).json({ ok: true });
      return;
    }

    response.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    response.status(400).json({ error: error.message || "Bad request" });
  }
}

function normalizeRecord(body) {
  const subscription = body?.subscription;
  if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
    throw new Error("A valid push subscription is required");
  }

  return {
    subscription,
    preferences: normalizePreferences(body.preferences),
    timezone: typeof body.timezone === "string" ? body.timezone : "Asia/Seoul",
    userAgent: typeof body.userAgent === "string" ? body.userAgent.slice(0, 300) : "",
    updatedAt: new Date().toISOString(),
  };
}

function normalizePreferences(preferences = {}) {
  return {
    morning: Boolean(preferences.morning),
    lunch: Boolean(preferences.lunch),
    evening: Boolean(preferences.evening),
  };
}

function parseBody(body) {
  if (body === undefined || body === null) return {};
  if (Buffer.isBuffer(body)) return parseBody(body.toString("utf8"));
  if (typeof body === "object") return body;
  if (typeof body !== "string") return {};
  if (!body.trim()) return {};
  return JSON.parse(body);
}
