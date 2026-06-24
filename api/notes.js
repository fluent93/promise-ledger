import { deleteNote, isNoteStorageConfigured, listNotes, saveNote } from "../lib/note-store.js";

const OWNER_ID_PATTERN = /^[A-Za-z0-9_-]{24,96}$/;
const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export default async function handler(request, response) {
  response.setHeader("content-type", "application/json; charset=utf-8");

  if (!isNoteStorageConfigured()) {
    response.status(501).json({ error: "Note storage is not configured" });
    return;
  }

  try {
    const ownerId = getOwnerId(request);

    if (request.method === "GET") {
      const url = new URL(request.url || "/", "https://local.invalid");
      const query = String(url.searchParams.get("q") || "").trim();
      const limit = clampLimit(url.searchParams.get("limit"));
      const notes = searchNotes(await listNotes(ownerId), query).slice(0, limit);
      response.status(200).json({ ok: true, notes });
      return;
    }

    if (request.method === "POST") {
      const record = normalizeRecord(parseBody(request.body));
      if (!record.note) {
        await deleteNote(ownerId, record.dateKey);
        response.status(200).json({ ok: true, deleted: true, dateKey: record.dateKey });
        return;
      }
      const saved = await saveNote(ownerId, record);
      response.status(200).json({ ok: true, note: saved });
      return;
    }

    response.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    response.status(400).json({ error: error.message || "Bad request" });
  }
}

function normalizeRecord(body) {
  const dateKey = String(body?.dateKey || "").trim();
  if (!DATE_KEY_PATTERN.test(dateKey)) throw new Error("A valid dateKey is required");

  return {
    dateKey,
    note: String(body?.note || "").trim().slice(0, 2000),
    savedAt: typeof body?.savedAt === "string" ? body.savedAt : new Date().toISOString(),
    version: typeof body?.version === "string" ? body.version.slice(0, 20) : "",
    scripture: normalizePair(body?.scripture, ["reference", "text"]),
    expression: normalizePair(body?.expression, ["phrase", "meaning"]),
  };
}

function normalizePair(value, keys) {
  const result = {};
  for (const key of keys) {
    result[key] = typeof value?.[key] === "string" ? value[key].slice(0, 500) : "";
  }
  return result;
}

function searchNotes(notes, query) {
  const normalizedQuery = query.toLocaleLowerCase("ko-KR");
  return notes
    .filter((note) => {
      if (!normalizedQuery) return true;
      return [
        note.dateKey,
        note.note,
        note.scripture?.reference,
        note.scripture?.text,
        note.expression?.phrase,
        note.expression?.meaning,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("ko-KR")
        .includes(normalizedQuery);
    })
    .sort((a, b) => String(b.dateKey || "").localeCompare(String(a.dateKey || "")));
}

function clampLimit(value) {
  const limit = Number.parseInt(value || "100", 10);
  if (!Number.isFinite(limit)) return 100;
  return Math.min(Math.max(limit, 1), 300);
}

function getOwnerId(request) {
  const ownerId = getHeader(request, "x-note-owner");
  if (!OWNER_ID_PATTERN.test(ownerId)) throw new Error("A valid note owner is required");
  return ownerId;
}

function getHeader(request, name) {
  if (!request.headers) return "";
  if (typeof request.headers.get === "function") return request.headers.get(name) || "";
  return request.headers[name] || request.headers[name.toLowerCase()] || "";
}

function parseBody(body) {
  if (body === undefined || body === null) return {};
  if (Buffer.isBuffer(body)) return parseBody(body.toString("utf8"));
  if (typeof body === "object") return body;
  if (typeof body !== "string") return {};
  if (!body.trim()) return {};
  return JSON.parse(body);
}
