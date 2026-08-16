import fs from "node:fs";
import path from "node:path";
import { advancedExpressions } from "../apps/11-daily-verse-english/src/expression-data.js";

const rootDir = process.cwd();
const audioDir = path.join(rootDir, "apps/11-daily-verse-english/audio");
const manifestPath = path.join(audioDir, "clip-manifest.json");

console.log("🔍 Running Audio-First Reverse Pipeline Verification...\n");

let manifest = {};
if (fs.existsSync(manifestPath)) {
  try {
    const raw = fs.readFileSync(manifestPath, "utf8");
    manifest = JSON.parse(raw).clips || {};
  } catch (err) {
    console.error("❌ Failed to parse clip-manifest.json:", err.message);
    process.exit(1);
  }
}

let missingAudioCount = 0;
let missingDialogueCount = 0;

for (let i = 0; i < advancedExpressions.length; i++) {
  const expr = advancedExpressions[i];
  const manifestEntry = manifest[expr.phrase];
  const slug = getSlug(expr.phrase);
  const mp3Path = path.join(audioDir, `${slug}.mp3`);
  const hasLocalMp3 = fs.existsSync(mp3Path);
  const hasManifestSrc = Boolean(manifestEntry?.src || manifestEntry?.file);

  if (!hasLocalMp3) {
    console.warn(`⚠️ [Missing MP3] Index ${i}: "${expr.phrase}" -> Expected local file: audio/${slug}.mp3`);
    missingAudioCount++;
  } else {
    console.log(`✅ [Verified Audio] Index ${i}: "${expr.phrase}" -> audio/${slug}.mp3 (${fs.statSync(mp3Path).size} bytes)`);
  }

  if (!manifestEntry || !Array.isArray(manifestEntry.dialogue) || manifestEntry.dialogue.length < 2) {
    console.warn(`⚠️ [Dialogue Check] "${expr.phrase}" dialogue count: ${manifestEntry?.dialogue?.length || 0}`);
    missingDialogueCount++;
  }
}

console.log("\n----------------------------------------");
console.log(`Total Expressions Configured: ${advancedExpressions.length}`);
console.log(`Verified Audio Files Present: ${advancedExpressions.length - missingAudioCount}/${advancedExpressions.length}`);

if (missingAudioCount > 0) {
  console.log("\n💡 Note: Unverified audio files must be extracted and placed in apps/11-daily-verse-english/audio/");
}

function getSlug(phrase) {
  return phrase
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
