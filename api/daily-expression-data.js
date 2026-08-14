import { EXPRESSION_POLICY_VERSION, advancedExpressions } from "../apps/11-daily-verse-english/src/expression-data.js";

const SERVICE_TIME_ZONE = "Asia/Seoul";

export default function handler(request, response) {
  response.setHeader("content-type", "application/json; charset=utf-8");

  if (request.method !== "GET") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const url = new URL(request.url || "/", "https://local.invalid");
    const date = parseRequestedDate(request.query?.date || url.searchParams.get("date"));
    response.status(200).json(getDailyExpressionPayload(date));
  } catch (error) {
    response.status(400).json({ error: error.message || "Invalid date" });
  }
}

export function getDailyExpressionPayload(date = new Date(), options = {}) {
  const dateKey = formatDateInTimeZone(date, SERVICE_TIME_ZONE);
  const expression = getExpressionForDateKey(dateKey);
  const slotPrefix = options.slotLabel ? `${options.slotLabel} 영어` : "오늘의 영어";
  const scheduledSuffix = options.scheduledTime ? ` · ${options.scheduledTime}` : "";

  return {
    title: `${slotPrefix}${scheduledSuffix} · ${expression.phrase}`,
    body: `${expression.meaning}\n${firstExampleLine(expression)}`,
    url: process.env.DAILY_ENGLISH_APP_URL || process.env.DAILY_VERSE_APP_URL || "/daily-verse/",
    expression,
    dateKey,
    source: "curated",
    expressionPolicyVersion: EXPRESSION_POLICY_VERSION,
  };
}

export function getExpressionForDateKey(dateKey) {
  if (!advancedExpressions.length) throw new Error("No English expressions are configured");
  const index = positiveModulo(dayNumber(dateKey) + EXPRESSION_POLICY_VERSION * 13, advancedExpressions.length);
  return advancedExpressions[index];
}

function firstExampleLine(expression) {
  const first = Array.isArray(expression.example) ? expression.example[0] : null;
  return first?.text || String(expression.example || "");
}

function parseRequestedDate(value) {
  if (!value) return new Date();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error("date must use YYYY-MM-DD");
  const date = new Date(`${value}T12:00:00+09:00`);
  if (Number.isNaN(date.getTime())) throw new Error("date must be valid");
  return date;
}

function formatDateInTimeZone(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function dayNumber(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

function positiveModulo(value, divisor) {
  return ((value % divisor) + divisor) % divisor;
}
