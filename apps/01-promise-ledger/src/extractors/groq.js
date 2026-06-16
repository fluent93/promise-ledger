import { randomUUID } from "node:crypto";

const DEFAULT_GROQ_URL = "https://api.groq.com/openai/v1";
const DEFAULT_GROQ_MODEL = "openai/gpt-oss-20b";

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
        required: ["person", "direction", "content", "dueDate", "confidence", "sourceText", "evidence", "language"],
        additionalProperties: false,
      },
    },
  },
  required: ["promises"],
  additionalProperties: false,
};

export async function extractWithGroq(text, options = {}) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not set");

  const baseUrl = process.env.GROQ_BASE_URL || DEFAULT_GROQ_URL;
  const model = process.env.GROQ_MODEL || DEFAULT_GROQ_MODEL;
  const today = toDateOnly(options.now || new Date());

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      messages: [
        { role: "system", content: buildSystemPrompt(today) },
        { role: "user", content: text },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "promise_extraction",
          strict: true,
          schema: responseSchema,
        },
      },
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Groq request failed: ${response.status} ${response.statusText}${detail ? ` - ${detail.slice(0, 240)}` : ""}`);
  }

  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;
  if (!content) throw new Error("Groq response did not include choices[0].message.content");

  const parsed = parseJson(content);
  const promises = Array.isArray(parsed.promises) ? parsed.promises : [];

  return {
    provider: "groq",
    model,
    promises: promises.map(normalizePromise),
  };
}

function buildSystemPrompt(today) {
  return `You extract relationship-centered promises from Korean, English, or mixed chat text.
Return JSON only, matching the schema exactly.
Today is ${today}.

Rules:
- direction "mine" means the user/speaker owes the person something.
- direction "theirs" means the person owes the user/speaker something.
- dueDate must be YYYY-MM-DD when inferable, otherwise an empty string.
- Keep content short and user-readable.
- sourceText must copy the sentence or fragment that caused extraction.
- evidence is a short phrase explaining why this was extracted. Use an empty string if uncertain.
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
    if (!match) throw new Error("Groq response was not valid JSON");
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
