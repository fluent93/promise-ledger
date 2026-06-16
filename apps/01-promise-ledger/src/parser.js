export function extractPromises(rawText, options = {}) {
  const makeId = options.makeId ?? (() => crypto.randomUUID());
  const now = options.now ? new Date(options.now) : new Date();

  return rawText
    .split(/\n|[.?!]/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => parseLine(line, { makeId, now }))
    .filter(Boolean);
}

function parseLine(line, context) {
  const person = findPerson(line);
  if (!person) return null;

  return {
    id: context.makeId(),
    person,
    text: cleanPromiseText(line, person),
    dueDate: inferDueDate(line, context.now),
    direction: inferDirection(line),
    status: "open",
    source: line,
    createdAt: new Date().toISOString(),
  };
}

function findPerson(line) {
  const koPatterns = [
    /([가-힣A-Za-z0-9]{2,12})이(?:는|가)\s/,
    /([가-힣A-Za-z0-9]{2,12}?)(?:에게|한테|께|이|가|은|는)\s/,
    /([가-힣A-Za-z0-9]{2,12})\s*(?:님|씨)?(?:께|에게|한테)/,
  ];
  const enPatterns = [
    /(?:[Pp]romised|[Rr]emind|[Tt]ell|[Tt]old|[Mm]essage|[Oo]we|[Ss]end|[Ss]hare|[Gg]ive)\s+([A-Z][a-zA-Z]{1,18})\b/,
    /\b([A-Z][a-zA-Z]{1,18})\s+(?:said|will|would|can|should|promised)\b/,
    /\b[Ff]rom\s+([A-Z][a-zA-Z]{1,18})\b/,
    /\b[Tt]o\s+([A-Z][a-zA-Z]{1,18})\b/,
  ];

  for (const pattern of [...koPatterns, ...enPatterns]) {
    const match = line.match(pattern);
    if (match?.[1]) return normalizePerson(match[1]);
  }
  return null;
}

function normalizePerson(person) {
  return person.replace(/(님|씨)$/u, "");
}

function cleanPromiseText(line, person) {
  const escapedPerson = escapeRegExp(person);
  const englishLead = new RegExp(String.raw`\b(?:I\s+)?(?:told|promised|remind|tell|message|owe|send|share|give)\s+${escapedPerson}\b`, "i");
  const personToken = new RegExp(String.raw`\b${escapedPerson}\b`);

  return line
    .replace(englishLead, "")
    .replace(personToken, "")
    .replace(/^(에게|한테|께|이|가|은|는)\s*/u, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function inferDirection(line) {
  const lower = line.toLowerCase();
  const theirsHints = [
    "해준다고",
    "준다고",
    "보내주기로 했",
    "공유해준다고",
    "said",
    "will send me",
    "will share",
    "will give",
    "she will",
    "he will",
    "they will",
    "준대",
    "알려준다고",
    "알려주기로",
  ];
  const mineHints = ["내가", "해드리", "보내주기로 함", "i promised", "i will", "i would", "i owe", "i told", "remind", "tell", "told", "message"];
  if (theirsHints.some((hint) => lower.includes(hint))) return "theirs";
  if (mineHints.some((hint) => lower.includes(hint))) return "mine";
  return "mine";
}

function inferDueDate(line, today) {
  const lower = line.toLowerCase();
  today = new Date(today);
  const day = 24 * 60 * 60 * 1000;

  if (line.includes("오늘") || lower.includes("today")) return toDateInputValue(today);
  if (line.includes("내일") || lower.includes("tomorrow")) return toDateInputValue(new Date(today.getTime() + day));

  const weekdayMap = {
    일요일: 0,
    sunday: 0,
    sun: 0,
    월요일: 1,
    monday: 1,
    mon: 1,
    화요일: 2,
    tuesday: 2,
    tue: 2,
    수요일: 3,
    wednesday: 3,
    wed: 3,
    목요일: 4,
    thursday: 4,
    thu: 4,
    금요일: 5,
    friday: 5,
    fri: 5,
    토요일: 6,
    saturday: 6,
    sat: 6,
  };

  for (const [label, weekday] of Object.entries(weekdayMap)) {
    if (!lower.includes(label)) continue;
    return toDateInputValue(nextWeekday(today, weekday, line.includes("다음 주") || lower.includes("next")));
  }
  return "";
}

function nextWeekday(fromDate, targetWeekday, forceNextWeek = false) {
  const date = new Date(fromDate);
  const currentWeekday = date.getDay();
  let diff = targetWeekday - currentWeekday;
  if (diff <= 0) diff += 7;
  if (forceNextWeek && targetWeekday > currentWeekday) diff += 7;
  date.setDate(date.getDate() + diff);
  return date;
}

function toDateInputValue(date) {
  return date.toISOString().slice(0, 10);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
