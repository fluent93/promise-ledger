import { extractPromises } from "../parser.js";

export async function extractWithRuleBased(text, options = {}) {
  return {
    provider: "rule-based",
    promises: extractPromises(text, options),
  };
}
