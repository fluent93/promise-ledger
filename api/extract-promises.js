import { createExtractionResponse } from "../apps/01-promise-ledger/server/extract-request.js";

export default async function handler(request, response) {
  response.setHeader("content-type", "application/json; charset=utf-8");

  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const result = await createExtractionResponse(parseBody(request.body));
    response.status(result.statusCode).json(result.body);
  } catch (error) {
    response.status(500).json({ error: error.message || "Internal server error" });
  }
}

function parseBody(body) {
  if (body === undefined || body === null) return {};
  if (Buffer.isBuffer(body)) return parseBody(body.toString("utf8"));
  if (typeof body === "object") return body;
  if (typeof body !== "string") return {};
  if (!body.trim()) return {};
  return JSON.parse(body);
}
