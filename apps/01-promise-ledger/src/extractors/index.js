import { extractWithGroq } from "./groq.js";
import { extractWithOllama } from "./ollama.js";
import { extractWithRuleBased } from "./rule-based.js";

export function getExtractor(provider = process.env.LLM_PROVIDER || "rule-based") {
  if (provider === "rule-based") return extractWithRuleBased;
  if (provider === "ollama") return extractWithOllama;
  if (provider === "groq") return extractWithGroq;

  throw new Error(`Unsupported extractor provider: ${provider}`);
}

export async function extractPromisesWithProvider(text, options = {}) {
  const provider = options.provider || process.env.LLM_PROVIDER || "rule-based";

  if (provider === "rule-based") {
    return extractWithRuleBased(text, options);
  }

  try {
    const extractor = getExtractor(provider);
    return await extractor(text, options);
  } catch (error) {
    const fallback = await extractWithRuleBased(text, options);
    return {
      ...fallback,
      requestedProvider: provider,
      fallbackReason: error.message || "provider failed",
    };
  }
}
