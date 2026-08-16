import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const AUDIO_KEY_PREFIX = "seinfeld-english:audio:v1";
const MAX_CLIP_BYTES = 1024 * 1024;
const APP_MANIFEST = path.resolve("apps/11-daily-verse-english/audio/clip-manifest.json");

await loadEnvFile(path.resolve(".env.local"));

const sourceDir = path.resolve(process.argv[2] || "");
if (!process.argv[2]) {
  throw new Error("Usage: node scripts/import-seinfeld-clip-batch.js <extracted-batch-directory>");
}

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;
if (!url || !token) throw new Error("UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required");

const sourceManifest = JSON.parse(await fs.readFile(path.join(sourceDir, "clip-manifest.json"), "utf8"));
const entries = Object.entries(sourceManifest.clips || {});
if (!entries.length) throw new Error("The batch manifest contains no clips");

const deployedManifest = { version: 2, clips: {} };
const seenIds = new Set();
for (const [phrase, clip] of entries) {
  const fileName = path.basename(String(clip.file || ""));
  const id = fileName.replace(/\.mp3$/i, "");
  if (!/^[a-z0-9-]{1,80}$/.test(id) || seenIds.has(id)) {
    throw new Error(`Invalid or duplicate clip id: ${id || phrase}`);
  }
  seenIds.add(id);

  const audio = await fs.readFile(path.join(sourceDir, fileName));
  if (!audio.length || audio.length > MAX_CLIP_BYTES) {
    throw new Error(`${fileName} must be between 1 byte and 1 MB`);
  }
  const record = {
    version: 1,
    contentType: "audio/mpeg",
    fileName,
    byteLength: audio.length,
    sha256: crypto.createHash("sha256").update(audio).digest("hex"),
    data: audio.toString("base64"),
  };
  await setRedisValue(`${AUDIO_KEY_PREFIX}:${id}`, JSON.stringify(record), url, token);
  deployedManifest.clips[phrase] = {
    src: `/api/audio-clip?id=${id}`,
    file: `${id}.mp3`,
    episode: clip.episode,
    season: clip.season,
    start: clip.start,
    end: clip.end,
    dialogue: clip.dialogue || [],
    meaning: clip.meaning || "",
    nuance: clip.nuance || "",
    modernUsage: clip.modernUsage || [],
  };
  console.log(`[${deployedManifest.clips[phrase].src}] ${phrase}`);
}

await fs.writeFile(APP_MANIFEST, `${JSON.stringify(deployedManifest, null, 2)}\n`, "utf8");
console.log(`Imported ${entries.length} clips and updated ${path.relative(process.cwd(), APP_MANIFEST)}`);

async function setRedisValue(key, value, redisUrl, redisToken) {
  const endpoint = redisUrl.endsWith("/") ? redisUrl : `${redisUrl}/`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      authorization: `Bearer ${redisToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(["SET", key, value]),
  });
  const payload = await response.json();
  if (!response.ok || payload.error || payload.result !== "OK") {
    throw new Error(payload.error || `Upload failed: ${response.status}`);
  }
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
