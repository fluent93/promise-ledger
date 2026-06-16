import fs from "node:fs";

loadEnvFile(".env.local");

const checks = [
  {
    key: "VAPID_PUBLIC_KEY",
    hint: "Generate with npm run push:keys.",
    validate: (value) => value.length > 20,
  },
  {
    key: "VAPID_PRIVATE_KEY",
    hint: "Generate with npm run push:keys.",
    validate: (value) => value.length > 20,
  },
  {
    key: "VAPID_SUBJECT",
    hint: "Use a contact URI such as mailto:you@example.com.",
    validate: (value) => value.startsWith("mailto:") || value.startsWith("https://"),
  },
  {
    key: "UPSTASH_REDIS_REST_URL",
    hint: "Use the Upstash HTTPS REST URL.",
    validate: (value) => value.startsWith("https://"),
  },
  {
    key: "UPSTASH_REDIS_REST_TOKEN",
    hint: "Use the writable Upstash Token, not the readonly token.",
    validate: (value) => value.length > 10,
  },
  {
    key: "CRON_SECRET",
    hint: "Generate with npm run push:secret.",
    validate: (value) => value.length >= 24,
  },
];

const optional = [
  {
    key: "DAILY_VERSE_APP_URL",
    defaultValue: "/daily-verse/",
    hint: "Use /daily-verse/ unless the production route changes.",
    validate: (value) => value.startsWith("/") || value.startsWith("https://"),
  },
];

const failures = [];

console.log("Daily Verse English production environment check\n");
for (const check of checks) {
  const value = process.env[check.key] || "";
  const present = Boolean(value);
  const valid = present && check.validate(value);
  console.log(`${valid ? "ok" : present ? "invalid" : "missing"} ${check.key}`);
  if (!valid) failures.push({ ...check, present });
}

for (const check of optional) {
  const value = process.env[check.key] || check.defaultValue;
  const valid = check.validate(value);
  console.log(`${valid ? "ok" : "invalid"} ${check.key}=${value}`);
  if (!valid) failures.push({ ...check, present: Boolean(process.env[check.key]) });
}

if (failures.length) {
  console.log("\nFix before production deployment:");
  for (const failure of failures) {
    const label = failure.present ? "invalid" : "missing";
    console.log(`- ${failure.key}: ${label}. ${failure.hint}`);
  }
  console.log("\nSee docs/daily-verse-deploy.md for the launch checklist.");
  process.exit(1);
}

console.log("\nAll required production env vars are present and look valid.");
console.log("After deploying, open /api/push-health and expect ok: true.");

function loadEnvFile(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}
