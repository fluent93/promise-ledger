import fs from "node:fs/promises";
import { createReadStream, existsSync } from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import webpush from "web-push";

import pushHealthHandler from "../../api/push-health.js";
import pushPublicKeyHandler from "../../api/push-public-key.js";
import pushSubscriptionsHandler from "../../api/push-subscriptions.js";
import pushTestHandler from "../../api/push-test.js";
import sendDailyVerseHandler from "../../api/send-daily-verse.js";
import dailyVerseDataHandler from "../../api/daily-verse-data.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "../..");
const appDir = __dirname;
const port = Number(process.env.PORT || 5174);

await loadEnvFile(path.join(rootDir, ".env.local"));
await ensureLocalPushEnv();

const apiRoutes = new Map([
  ["/api/daily-verse-data", dailyVerseDataHandler],
  ["/api/push-health", pushHealthHandler],
  ["/api/push-public-key", pushPublicKeyHandler],
  ["/api/push-subscriptions", pushSubscriptionsHandler],
  ["/api/push-test", pushTestHandler],
  ["/api/send-daily-verse", sendDailyVerseHandler],
  ["/api/send-daily-verse-morning", withSlot("morning")],
  ["/api/send-daily-verse-lunch", withSlot("lunch")],
  ["/api/send-daily-verse-evening", withSlot("evening")],
]);

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
    if (url.pathname === "/daily-verse") {
      response.writeHead(302, { location: "/daily-verse/" });
      response.end();
      return;
    }
    if (apiRoutes.has(url.pathname)) {
      await handleApi(apiRoutes.get(url.pathname), request, response, url);
      return;
    }
    await serveStatic(normalizeStaticPath(url.pathname), response);
  } catch (error) {
    response.writeHead(500, { "content-type": "application/json; charset=utf-8" });
    response.end(JSON.stringify({ error: error.message || "Internal server error" }));
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Daily Verse English dev server listening on http://localhost:${port}`);
});

function normalizeStaticPath(pathname) {
  if (pathname.startsWith("/daily-verse/")) return pathname.slice("/daily-verse".length) || "/";
  return pathname;
}

function withSlot(slot) {
  return (request, response) => {
    request.query = { ...(request.query || {}), slot };
    return sendDailyVerseHandler(request, response);
  };
}

async function handleApi(handler, request, response, url) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const rawBody = Buffer.concat(chunks).toString("utf8");
  request.body = parseBody(rawBody);
  request.query = Object.fromEntries(url.searchParams.entries());

  const wrapped = {
    setHeader: (...args) => response.setHeader(...args),
    status(code) {
      response.statusCode = code;
      return this;
    },
    json(payload) {
      if (!response.hasHeader("content-type")) response.setHeader("content-type", "application/json; charset=utf-8");
      response.end(JSON.stringify(payload));
    },
  };
  await handler(request, wrapped);
}

async function serveStatic(pathname, response) {
  const safePath = decodeURIComponent(pathname).replace(/^\/+/, "");
  const filePath = path.resolve(appDir, safePath || "index.html");
  if (!filePath.startsWith(appDir)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  const target = existsSync(filePath) && !(await fs.stat(filePath)).isDirectory() ? filePath : path.join(appDir, "index.html");
  response.writeHead(200, { "content-type": contentType(target) });
  createReadStream(target).pipe(response);
}

async function loadEnvFile(file) {
  try {
    const content = await fs.readFile(file, "utf8");
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const index = trimmed.indexOf("=");
      if (index === -1) continue;
      const key = trimmed.slice(0, index).trim();
      const value = trimmed.slice(index + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

async function ensureLocalPushEnv() {
  process.env.LOCAL_PUSH_STORE_FILE ||= ".tmp/daily-verse-subscriptions.json";
  process.env.VAPID_SUBJECT ||= "mailto:local@example.com";
  if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) return;

  const keys = webpush.generateVAPIDKeys();
  process.env.VAPID_PUBLIC_KEY = keys.publicKey;
  process.env.VAPID_PRIVATE_KEY = keys.privateKey;
  const envPath = path.join(rootDir, ".env.local");
  const existing = await fs.readFile(envPath, "utf8").catch(() => "");
  if (!existing.includes("VAPID_PUBLIC_KEY=")) {
    const prefix = existing && !existing.endsWith("\n") ? "\n" : "";
    const lines = [
      `VAPID_PUBLIC_KEY=${keys.publicKey}`,
      `VAPID_PRIVATE_KEY=${keys.privateKey}`,
      `VAPID_SUBJECT=${process.env.VAPID_SUBJECT}`,
      `LOCAL_PUSH_STORE_FILE=${process.env.LOCAL_PUSH_STORE_FILE}`,
      "",
    ];
    await fs.appendFile(envPath, `${prefix}${lines.join("\n")}`, "utf8");
  }
}

function parseBody(rawBody) {
  if (!rawBody) return {};
  try {
    return JSON.parse(rawBody);
  } catch {
    return rawBody;
  }
}

function contentType(file) {
  if (file.endsWith(".html")) return "text/html; charset=utf-8";
  if (file.endsWith(".css")) return "text/css; charset=utf-8";
  if (file.endsWith(".js")) return "text/javascript; charset=utf-8";
  if (file.endsWith(".json")) return "application/json; charset=utf-8";
  if (file.endsWith(".svg")) return "image/svg+xml";
  return "application/octet-stream";
}
