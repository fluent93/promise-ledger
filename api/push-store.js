import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const SUBSCRIPTIONS_KEY = "daily-verse-english:subscriptions";
const SEND_LOG_KEY = "seinfeld-english:send-log:v2";
const SEND_LOCK_PREFIX = "daily-verse-english:sent";
const SEND_LOCK_TTL_SECONDS = 60 * 60 * 48;

export function subscriptionId(subscription) {
  return crypto.createHash("sha256").update(subscription.endpoint).digest("hex");
}

export function isStorageConfigured() {
  return Boolean(
    (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) || process.env.LOCAL_PUSH_STORE_FILE,
  );
}

export function storageMode() {
  if (useLocalStore()) return "local";
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) return "upstash";
  return "none";
}

export async function storageHealth() {
  if (!isStorageConfigured()) return { configured: false, mode: "none", ok: false, count: 0 };
  const records = await listSubscriptions();
  return { configured: true, mode: storageMode(), ok: true, count: records.length };
}

export async function saveSubscription(record) {
  const id = subscriptionId(record.subscription);
  const savedRecord = { ...record, id };
  if (useLocalStore()) {
    const store = await readLocalStore();
    store[id] = savedRecord;
    await writeLocalStore(store);
    return id;
  }
  await upstashCommand(["HSET", SUBSCRIPTIONS_KEY, id, JSON.stringify(savedRecord)]);
  return id;
}

export async function deleteSubscription(subscriptionOrEndpoint) {
  const endpoint = typeof subscriptionOrEndpoint === "string" ? subscriptionOrEndpoint : subscriptionOrEndpoint.endpoint;
  const id = crypto.createHash("sha256").update(endpoint).digest("hex");
  if (useLocalStore()) {
    const store = await readLocalStore();
    delete store[id];
    await writeLocalStore(store);
    return;
  }
  await upstashCommand(["HDEL", SUBSCRIPTIONS_KEY, id]);
}

export async function listSubscriptions() {
  if (useLocalStore()) return Object.values(await readLocalStore());

  const result = await upstashCommand(["HGETALL", SUBSCRIPTIONS_KEY]);
  const pairs = Array.isArray(result) ? result : [];
  const records = [];
  for (let index = 0; index < pairs.length; index += 2) {
    try {
      records.push(JSON.parse(pairs[index + 1]));
    } catch {
      // Ignore malformed records so one bad entry does not stop the whole cron run.
    }
  }
  return records;
}

export async function createSendLock({ slot, dateKey, triggeredAt }) {
  if (useLocalStore()) return true;
  const key = sendLockKey(dateKey, slot);
  const result = await upstashCommand([
    "SET",
    key,
    JSON.stringify({ slot, dateKey, triggeredAt }),
    "NX",
    "EX",
    String(SEND_LOCK_TTL_SECONDS),
  ]);
  return result === "OK";
}

export async function releaseSendLock({ slot, dateKey }) {
  if (useLocalStore()) return;
  await upstashCommand(["DEL", sendLockKey(dateKey, slot)]);
}

function sendLockKey(dateKey, slot) {
  return `${SEND_LOCK_PREFIX}:${dateKey}:${slot}`;
}

export async function recordSendLog(entry) {
  if (useLocalStore()) return;
  const record = JSON.stringify({ ...entry, id: `${entry.dateKey}:${entry.slot}:${entry.triggeredAt}` });
  await upstashCommand(["LPUSH", SEND_LOG_KEY, record]);
  await upstashCommand(["LTRIM", SEND_LOG_KEY, "0", "29"]);
}

export async function listSendLogs(limit = 10) {
  if (!isStorageConfigured() || useLocalStore()) return [];
  const result = await upstashCommand(["LRANGE", SEND_LOG_KEY, "0", String(Math.max(0, limit - 1))]);
  const records = Array.isArray(result) ? result : [];
  const logs = [];
  for (const record of records) {
    try {
      logs.push(JSON.parse(record));
    } catch {
      // Ignore malformed log entries.
    }
  }
  return logs;
}

async function upstashCommand(command) {
  if (!isStorageConfigured()) throw new Error("Upstash Redis is not configured");
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const endpoint = url.endsWith("/") ? url : `${url}/`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(command),
  });
  const data = await response.json();
  if (!response.ok || data.error) throw new Error(data.error || `Upstash request failed: ${response.status}`);
  return data.result;
}

function useLocalStore() {
  return Boolean(process.env.LOCAL_PUSH_STORE_FILE);
}

async function readLocalStore() {
  const file = getLocalStorePath();
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return {};
    throw error;
  }
}

async function writeLocalStore(store) {
  const file = getLocalStorePath();
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(store, null, 2), "utf8");
}

function getLocalStorePath() {
  return path.resolve(process.cwd(), process.env.LOCAL_PUSH_STORE_FILE);
}
