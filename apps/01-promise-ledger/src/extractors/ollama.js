import { randomUUID } from "node:crypto";

const DEFAULT_OLLAMA_URL = "http://127.0.0.1:11434";
const DEFAULT_OLLAMA_MODEL = "qwen2.5:7b";

const responseSchema = {
  type: "object",
  properties: {
    promises: {
      type: "array",
      items: {
        type: "object",
        properties: {
          person: { type: "string" },
          direction: { type: "string", enum: ["mine", "theirs"] },
          content: { type: "string" },
          dueDate: { type: "string" },
          confidence: { type: "number" },
          sourceText: { type: "string" },
          evidence: { type: "string" },
          language: { type: "string", enum: ["ko", "en", "mixed"] },
        },
        required: ["person", "direction", "content", "dueDate", "confidence", "sourceText", "language"],
      },
    },
  },
  required: ["promises"],
};

export async function extractWithOllama(text, options = {}) {
  const baseUrl = process.env.OLLAMA_BASE_URL || DEFAULT_OLLAMA_URL;
  const model = process.env.OLLAMA_MODEL || DEFAULT_OLLAMA_MODEL;
  const today = toDateOnly(options.now || new Date());

  const response = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      model,
      stream: false,
      format: responseSchema,
      options: { temperature: 0 },
      messages: [
        {
          role: "system",
          content: buildSystemPrompt(today),
        },
        {
          role: "user",
          content: text,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama request failed: ${response.status} ${response.statusText}`);
  }

  const payload = await response.json();
  const content = payload?.message?.content;
  if (!content) throw new Error("Ollama response did not include message.content");

  const parsed = parseJson(content);
  const promises = Array.isArray(parsed.promises) ? parsed.promises : [];

  return {
    provider: "ollama",
    model,
    promises: promises.map(normalizePromise),
  };
}

function buildSystemPrompt(today) {
  return `You extract relationship-centered promises from Korean, English, or mixed chat text.
Return JSON only, matching the provided schema.
Today is ${today}.

Rules:
- direction "mine" means the user/speaker owes the person something.
- direction "theirs" means the person owes the user/speaker something.
- dueDate must be YYYY-MM-DD when inferable, otherwise an empty string.
- status should not be included; the app will set new promises to open.
- Keep content short and user-readable.
- sourceText must copy the sentence or fragment that caused extraction.
- confidence should be 0 to 1. Lower it for ambiguous person, date, or direction.`;
}

function normalizePromise(item) {
  return {
    id: randomUUID(),
    person: cleanString(item.person),
    text: cleanString(item.content),
    dueDate: normalizeDate(item.dueDate),
    direction: item.direction === "theirs" ? "theirs" : "mine",
    status: "open",
    source: cleanString(item.sourceText),
    confidence: clampConfidence(item.confidence),
    evidence: cleanString(item.evidence),
    language: ["ko", "en", "mixed"].includes(item.language) ? item.language : "mixed",
    createdAt: new Date().toISOString(),
  };
}

function parseJson(content) {
  try {
    return JSON.parse(content);
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Ollama response was not valid JSON");
    return JSON.parse(match[0]);
  }
}

function cleanString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeDate(value) {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : "";
}

function clampConfidence(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0.5;
  return Math.max(0, Math.min(1, number));
}

function toDateOnly(value) {
  return new Date(value).toISOString().slice(0, 10);
}
