import handler from "./extract-promises.js";

const response = createMockResponse();

await handler(
  {
    method: "POST",
    body: {
      provider: "rule-based",
      text: "민수에게 금요일까지 견적서 보내주기로 함.",
      today: "2026-06-11T12:00:00.000Z",
    },
  },
  response,
);

if (response.statusCode !== 200) {
  throw new Error(`Expected 200, got ${response.statusCode}`);
}

if (response.body.provider !== "rule-based") {
  throw new Error(`Expected rule-based provider, got ${response.body.provider}`);
}

if (response.body.promises.length !== 1 || response.body.promises[0].person !== "민수") {
  throw new Error("Vercel API handler smoke test failed");
}

console.log("Vercel API handler smoke test passed");

function createMockResponse() {
  return {
    body: undefined,
    headers: {},
    statusCode: 200,
    setHeader(name, value) {
      this.headers[name.toLowerCase()] = value;
      return this;
    },
    status(statusCode) {
      this.statusCode = statusCode;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}
