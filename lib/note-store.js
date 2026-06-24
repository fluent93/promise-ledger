import fs from "node:fs/promises";
import path from "node:path";

const NOTE_KEY_PREFIX = "daily-verse-english:notes";

export function isNoteStorageConfigured() {
  return Boolean(getLocalNoteStorePath() || (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN));
}

export async function saveNote(ownerId, record) {
  const savedRecord = { ...record, ownerId, updatedAt: new Date().toISOString() };
  if (useLocalStore()) {
    const store = await readLocalStore();
    store[ownerId] = { ...(store[ownerId] || {}), [record.dateKey]: savedRecord };
    await writeLocalStore(store);
    return savedRecord;
  }
  await upstashCommand(["HSET", ownerKey(ownerId), record.dateKey, JSON.stringify(savedRecord)]);
  return savedRecord;
}

export async function deleteNote(ownerId, dateKey) {
  if (useLocalStore()) {
    const store = await readLocalStore();
    if (store[ownerId]) delete store[ownerId][dateKey];
    await writeLocalStore(store);
    return;
  }
  await upstashCommand(["HDEL", ownerKey(ownerId), dateKey]);
}

export async function listNotes(ownerId) {
  if (useLocalStore()) return Object.values((await readLocalStore())[ownerId] || {});

  const result = await upstashCommand(["HGETALL", ownerKey(ownerId)]);
  const pairs = Array.isArray(result) ? result : [];
  const notes = [];
  for (let index = 0; index < pairs.length; index += 2) {
    try {
      notes.push(JSON.parse(pairs[index + 1]));
    } catch {
      // Ignore malformed note records so one bad entry does not hide the rest.
    }
  }
  return notes;
}

async function upstashCommand(command) {
  if (!isNoteStorageConfigured()) throw new Error("Note storage is not configured");
  const response = await fetch(process.env.UPSTASH_REDIS_REST_URL, {
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

function ownerKey(ownerId) {
  return `${NOTE_KEY_PREFIX}:${ownerId}`;
}

function useLocalStore() {
  return Boolean(getLocalNoteStorePath());
}

async function readLocalStore() {
  const file = getLocalNoteStorePath();
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return {};
    throw error;
  }
}

async function writeLocalStore(store) {
  const file = getLocalNoteStorePath();
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(store, null, 2), "utf8");
}

function getLocalNoteStorePath() {
  const explicit = process.env.LOCAL_NOTE_STORE_FILE;
  if (explicit) return path.resolve(process.cwd(), explicit);
  if (process.env.LOCAL_PUSH_STORE_FILE) return path.resolve(process.cwd(), `${process.env.LOCAL_PUSH_STORE_FILE}.notes`);
  return "";
}
