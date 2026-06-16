import { extractPromises } from "./parser.js";
import { parserCases } from "./parser-cases.js";

const NOW = "2026-06-09T12:00:00.000Z";
const failures = [];
const knownGaps = [];
let passed = 0;

for (const testCase of parserCases) {
  const [actual] = extractPromises(testCase.input, {
    makeId: () => testCase.id,
    now: NOW,
  });

  const result = compareCase(testCase, actual);
  if (result.ok) {
    passed += 1;
    continue;
  }

  if (testCase.knownGap) {
    knownGaps.push(result);
  } else {
    failures.push(result);
  }
}

console.log(`Parser cases: ${passed} passed, ${knownGaps.length} known gaps, ${failures.length} failed`);

if (knownGaps.length) {
  console.log("\nKnown gaps:");
  knownGaps.forEach(printResult);
}

if (failures.length) {
  console.log("\nFailures:");
  failures.forEach(printResult);
  process.exitCode = 1;
}

function compareCase(testCase, actual) {
  const mismatches = [];

  if (!actual) {
    return { id: testCase.id, input: testCase.input, actual: null, mismatches: ["no extraction"], ok: false };
  }

  for (const [field, expectedValue] of Object.entries(testCase.expected)) {
    if (actual[field] !== expectedValue) {
      mismatches.push(`${field}: expected ${JSON.stringify(expectedValue)}, got ${JSON.stringify(actual[field])}`);
    }
  }

  return {
    id: testCase.id,
    input: testCase.input,
    actual,
    mismatches,
    ok: mismatches.length === 0,
  };
}

function printResult(result) {
  console.log(`- ${result.id}: ${result.input}`);
  result.mismatches.forEach((mismatch) => console.log(`  ${mismatch}`));
}
