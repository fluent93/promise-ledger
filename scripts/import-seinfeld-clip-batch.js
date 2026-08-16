import crypto from "node:crypto";
import { execSync } from "node:child_process";
import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import os from "node:os";

const AUDIO_KEY_PREFIX = "seinfeld-english:audio:v1";
const MAX_CLIP_BYTES = 1024 * 1024;
const APP_MANIFEST = path.resolve("apps/11-daily-verse-english/audio/clip-manifest.json");

await loadEnvFile(path.resolve(".env.local"));

let inputPath = process.argv[2] ? path.resolve(process.argv[2]) : "";

// Auto-detect zip or folder in Downloads if not specified or missing
if (!inputPath || !existsSync(inputPath)) {
  const homeDownloads = path.join(os.homedir(), "Downloads");
  const candidates = [
    path.join(process.cwd(), ".tmp/seinfeld-clips-batch"),
    path.join(process.cwd(), ".tmp/seinfeld-clips-batch.zip"),
    path.join(homeDownloads, "seinfeld-clips-batch"),
    path.join(homeDownloads, "seinfeld-clips-batch.zip"),
  ];

  const found = candidates.find((c) => existsSync(c));
  if (found) {
    inputPath = found;
    console.log(`🔍 Auto-detected batch file/folder: ${inputPath}`);
  } else {
    throw new Error(
      `Could not find batch files at '${inputPath || ".tmp/seinfeld-clips-batch"}'.\nPlease place 'seinfeld-clips-batch.zip' in your Downloads folder or .tmp/ directory.`
    );
  }
}

// If inputPath is a zip file, unzip it into .tmp/seinfeld-clips-batch
let targetDir = inputPath;
if (inputPath.endsWith(".zip")) {
  targetDir = path.resolve(".tmp/seinfeld-clips-batch");
  await fs.mkdir(targetDir, { recursive: true });
  console.log(`📦 Unzipping ${inputPath} -> ${targetDir}...`);
  execSync(`unzip -o "${inputPath}" -d "${targetDir}"`, { stdio: "inherit" });
}

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;
if (!url || !token) throw new Error("UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required");

const manifestFile = path.join(targetDir, "clip-manifest.json");
if (!existsSync(manifestFile)) {
  throw new Error(`clip-manifest.json not found in ${targetDir}`);
}

const sourceManifest = JSON.parse(await fs.readFile(manifestFile, "utf8"));
const entries = Object.entries(sourceManifest.clips || {});
if (!entries.length) throw new Error("The batch manifest contains no clips");

const deployedManifest = { version: 6, clips: {} };
const seenIds = new Set();
for (const [phrase, clip] of entries) {
  const fileName = path.basename(String(clip.file || ""));
  const id = fileName.replace(/\.mp3$/i, "");
  if (!/^[a-z0-9-]{1,80}$/.test(id) || seenIds.has(id)) {
    throw new Error(`Invalid or duplicate clip id: ${id || phrase}`);
  }
  seenIds.add(id);

  const mp3Path = path.join(targetDir, fileName);
  if (!existsSync(mp3Path)) {
    console.warn(`⚠️ Skipping missing audio file: ${fileName}`);
    continue;
  }

  const audio = await fs.readFile(mp3Path);
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

  // Copy MP3 to local audio directory for offline/local server access
  const localAudioDir = path.resolve("apps/11-daily-verse-english/audio");
  await fs.mkdir(localAudioDir, { recursive: true });
  await fs.writeFile(path.join(localAudioDir, fileName), audio);

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
  console.log(`✅ [Uploaded to DB & Local] ${phrase} -> ${id}.mp3 (${audio.length} bytes)`);
}

await fs.writeFile(APP_MANIFEST, `${JSON.stringify(deployedManifest, null, 2)}\n`, "utf8");
console.log(`\n🎉 Successfully imported ${entries.length} clips to Redis & updated local manifest!`);

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
  const data = await response.json();
  if (!response.ok || data.error || data.result !== "OK") {
    throw new Error(data.error || `Upstash request failed: ${response.status}`);
  }
}

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
