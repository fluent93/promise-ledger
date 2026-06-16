import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { createExtractionResponse } from "./extract-request.js";

const port = Number(process.env.PORT || 5173);
const appRoot = fileURLToPath(new URL("../", import.meta.url));

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host}`);

    if (request.method === "POST" && url.pathname === "/api/extract-promises") {
      await handleExtract(request, response);
      return;
    }

    if (request.method === "GET" || request.method === "HEAD") {
      await serveStatic(url.pathname, request.method, response);
      return;
    }

    sendJson(response, 405, { error: "Method not allowed" });
  } catch (error) {
    sendJson(response, 500, { error: error.message || "Internal server error" });
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Promise Ledger running on http://0.0.0.0:${port}`);
  console.log(`Extractor provider: ${process.env.LLM_PROVIDER || "rule-based"}`);
});

async function handleExtract(request, response) {
  const body = await readJson(request);
  const result = await createExtractionResponse(body);
  sendJson(response, result.statusCode, result.body);
}

async function serveStatic(pathname, method, response) {
  const cleanPath = pathname === "/" ? "/index.html" : pathname;
  const normalized = normalize(cleanPath).replace(/^[/\\]+/, "");

  if (normalized.startsWith("..")) {
    sendJson(response, 403, { error: "Forbidden" });
    return;
  }

  const filePath = join(appRoot, normalized);
  const contentType = mimeTypes[extname(filePath)] || "application/octet-stream";

  try {
    const content = await readFile(filePath);
    response.writeHead(200, { "content-type": contentType });
    if (method !== "HEAD") response.end(content);
    else response.end();
  } catch {
    sendJson(response, 404, { error: "Not found" });
  }
}

async function readJson(request) {
  let raw = "";
  for await (const chunk of request) {
    raw += chunk;
    if (raw.length > 100_000) throw new Error("Request body too large");
  }

  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    throw new Error("Invalid JSON body");
  }
}

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(body));
}
