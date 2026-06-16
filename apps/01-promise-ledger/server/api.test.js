import { extractPromisesWithProvider } from "../src/extractors/index.js";

const result = await extractPromisesWithProvider("민수에게 금요일까지 견적서 보내주기로 함.", {
  provider: "rule-based",
  now: "2026-06-11T12:00:00.000Z",
});

if (result.provider !== "rule-based") {
  throw new Error(`Expected rule-based provider, got ${result.provider}`);
}

if (result.promises.length !== 1 || result.promises[0].person !== "민수") {
  throw new Error("API extractor smoke test failed");
}

console.log("API extractor smoke test passed");
