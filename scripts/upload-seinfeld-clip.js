import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const AUDIO_KEY_PREFIX = "seinfeld-english:audio:v1";
const MAX_CLIP_BYTES = 1024 * 1024;

await loadEnvFile(path.resolve(".env.local"));

const [id, fileName] = process.argv.slice(2);
if (!/^[a-z0-9-]{1,80}$/.test(id || "") || !fileName) {
  throw new Error("Usage: node scripts/upload-seinfeld-clip.js <clip-id> <mp3-path>");
}

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;
if (!url || !token) throw new Error("UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required");

const audio = await fs.readFile(path.resolve(fileName));
if (audio.length > MAX_CLIP_BYTES) throw new Error("Clip must be 1 MB or smaller");

const record = {
  version: 1,
  contentType: "audio/mpeg",
  fileName: path.basename(fileName),
  byteLength: audio.length,
  sha256: crypto.createHash("sha256").update(audio).digest("hex"),
  data: audio.toString("base64"),
};
const redisResponse = await fetch(url, {
  method: "POST",
  headers: {
    authorization: `Bearer ${token}`,
    "content-type": "application/json",
  },
  body: JSON.stringify(["SET", `${AUDIO_KEY_PREFIX}:${id}`, JSON.stringify(record)]),
});
const payload = await redisResponse.json();
if (!redisResponse.ok || payload.error || payload.result !== "OK") {
  throw new Error(payload.error || `Upload failed: ${redisResponse.status}`);
}

console.log(`${id}: uploaded ${audio.length} bytes (${record.sha256.slice(0, 12)})`);

function unquoteEnvValue(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
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
      const value = unquoteEnvValue(trimmed.slice(index + 1).trim());
      if (!process.env[key]) process.env[key] = value;
    }
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}
