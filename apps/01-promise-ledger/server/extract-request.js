import { extractPromisesWithProvider } from "../src/extractors/index.js";

export async function createExtractionResponse(body = {}) {
  const text = typeof body.text === "string" ? body.text : "";

  if (!text.trim()) {
    return {
      statusCode: 400,
      body: { error: "text is required" },
    };
  }

  const result = await extractPromisesWithProvider(text, {
    locale: body.locale,
    now: body.today || new Date().toISOString(),
    provider: body.provider,
  });

  return {
    statusCode: 200,
    body: result,
  };
}
