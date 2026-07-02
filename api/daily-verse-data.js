import fs from "node:fs/promises";
import path from "node:path";

const DAY_IN_MS = 86_400_000;
const START_DAY = Date.UTC(2026, 0, 1);
const DAILY_LESSON_KEY = "daily-verse-english:daily-lessons";
const HISTORY_LIMIT = 45;
const OPENAI_MODEL = process.env.DAILY_VERSE_OPENAI_MODEL || "gpt-5.4-mini";

const fallbackScriptures = [
  {
    "reference": "잠언 3:5-6",
    "text": "너는 마음을 다하여 여호와를 의뢰하고 네 명철을 의지하지 말라 너는 범사에 그를 인정하라 그리하면 네 길을 지도하시리라",
    "focus": "오늘 결정은 혼자 움켜쥐기보다 하나님께 맡기는 방향으로.",
    "prompt": "일정, 관계, 돈, 선택 중 하나를 떠올리고 내가 통제하려는 부분과 맡길 수 있는 부분을 구분해보세요."
  },
  {
    "reference": "시편 23:1",
    "text": "여호와는 나의 목자시니 내가 부족함이 없으리로다",
    "focus": "부족함을 먼저 세기보다 인도하심을 먼저 기억하는 하루.",
    "prompt": "오늘 필요한 것을 세 가지 적고, 이미 받은 공급도 함께 적어보세요."
  },
  {
    "reference": "마태복음 6:34",
    "text": "그러므로 내일 일을 위하여 염려하지 말라 내일 일은 내일 염려할 것이요 한 날 괴로움은 그 날에 족하니라",
    "focus": "내일의 무게를 오늘 아침에 미리 다 들지 않기.",
    "prompt": "오늘 실제로 할 수 있는 한 가지 행동만 고르고 나머지는 목록 밖으로 잠시 내려놓으세요."
  },
  {
    "reference": "빌립보서 4:6-7",
    "text": "아무 것도 염려하지 말고 오직 모든 일에 기도와 간구로, 너희 구할 것을 감사함으로 하나님께 아뢰라 그리하면 모든 지각에 뛰어난 하나님의 평강이 그리스도 예수 안에서 너희 마음과 생각을 지키시리라",
    "focus": "걱정을 부정하지 않고 기도로 옮기는 연습.",
    "prompt": "걱정 하나를 문장으로 쓰고, 그 옆에 감사 하나를 붙여보세요."
  },
  {
    "reference": "야고보서 1:19",
    "text": "내 사랑하는 형제들아 너희가 알거니와 사람마다 듣기는 속히 하고 말하기는 더디 하며 성내기도 더디 하라",
    "focus": "빨리 듣고, 천천히 말하고, 더 천천히 화내기.",
    "prompt": "오늘 답장을 보내기 전 10초 멈출 대화를 하나 정해두세요."
  },
  {
    "reference": "요한복음 15:5",
    "text": "나는 포도나무요 너희는 가지니 저가 내 안에, 내가 저 안에 있으면 이 사람은 과실을 많이 맺나니 나를 떠나서는 너희가 아무 것도 할 수 없음이라",
    "focus": "성과보다 연결이 먼저라는 감각을 회복하기.",
    "prompt": "오늘의 일과 중 바쁘게 뛰어가기 전에 멈출 2분을 예약해보세요."
  },
  {
    "reference": "이사야 41:10",
    "text": "두려워 말라 내가 너와 함께 함이니라 놀라지 말라 나는 네 하나님이 됨이니라 내가 너를 굳세게 하리라 참으로 너를 도와 주리라 참으로 나의 의로운 오른손으로 너를 붙들리라",
    "focus": "두려움을 숨기는 대신 붙들림을 기억하기.",
    "prompt": "오늘 부담되는 일을 하나 적고, 그 일을 혼자 처리하지 않아도 되는 이유를 적어보세요."
  },
  {
    "reference": "골로새서 3:23",
    "text": "무슨 일을 하든지 마음을 다하여 주께 하듯 하고 사람에게 하듯 하지 말라",
    "focus": "작은 일을 작게 대하지 않는 태도.",
    "prompt": "눈에 띄지 않는 일 하나를 정성껏 끝내고 표시해보세요."
  },
  {
    "reference": "로마서 12:2",
    "text": "너희는 이 세대를 본받지 말고 오직 마음을 새롭게 함으로 변화를 받아 하나님의 선하시고 기뻐하시고 온전하신 뜻이 무엇인지 분별하도록 하라",
    "focus": "흐름에 휩쓸리지 않고 생각의 방향을 새롭게 하기.",
    "prompt": "오늘 반복해서 떠오르는 생각 하나를 더 건강한 문장으로 바꿔보세요."
  },
  {
    "reference": "시편 46:10",
    "text": "이르시기를 너희는 가만히 있어 내가 하나님 됨을 알지어다 내가 열방과 세계 중에서 높임을 받으리라 하시도다",
    "focus": "멈춤도 믿음의 행동이 될 수 있습니다.",
    "prompt": "오늘 알림을 끄고 조용히 있을 5분을 정해보세요."
  }
];

const fallbackExpressions = [
  {
    "phrase": "Can you give me a quick rundown?",
    "meaning": "짧게 요약해서 설명해줄래?",
    "example": [
      {
        "speaker": "A",
        "text": "I missed the first part of the meeting.",
        "translation": "회의 앞부분을 놓쳤어."
      },
      {
        "speaker": "B",
        "text": "Sure. I can give you a quick rundown.",
        "translation": "물론이지. 짧게 요약해줄게."
      }
    ],
    "tip": "회의, 상황 설명, 미드 속 사건 정리 장면에서 자연스럽습니다. summary보다 말맛이 더 구어적입니다."
  },
  {
    "phrase": "Let's take this offline.",
    "meaning": "이건 따로 얘기하자.",
    "example": [
      {
        "speaker": "A",
        "text": "I have a few concerns about the timeline.",
        "translation": "일정에 대해 우려가 좀 있어요."
      },
      {
        "speaker": "B",
        "text": "Good point. Let's take this offline after the call.",
        "translation": "좋은 지적이에요. 통화 끝나고 따로 얘기해요."
      }
    ],
    "tip": "회의 중 모두 앞에서 길게 다루기 어려운 주제를 따로 빼자는 비즈니스 표현입니다."
  },
  {
    "phrase": "I'm not following.",
    "meaning": "잘 못 따라가겠어, 이해가 안 돼.",
    "example": [
      {
        "speaker": "A",
        "text": "The client changed the scope, so the launch date moved.",
        "translation": "고객이 범위를 바꿔서 출시일이 밀렸어요."
      },
      {
        "speaker": "B",
        "text": "I'm not following. Which part changed?",
        "translation": "잘 이해가 안 돼요. 어느 부분이 바뀐 거예요?"
      }
    ],
    "tip": "I don't understand보다 대화 중에 훨씬 자연스럽게 끼어드는 표현입니다."
  },
  {
    "phrase": "I'll keep you posted.",
    "meaning": "진행 상황 계속 알려줄게.",
    "example": [
      {
        "speaker": "A",
        "text": "Let me know what happens with the scheduler.",
        "translation": "스케줄러 어떻게 되는지 알려줘."
      },
      {
        "speaker": "B",
        "text": "Will do. I'll keep you posted.",
        "translation": "그럴게. 계속 업데이트해줄게."
      }
    ],
    "tip": "회사, 병원 예약, 가족 일정 등 거의 모든 상황에서 쓸 수 있는 실용 표현입니다."
  },
  {
    "phrase": "Let's play it by ear.",
    "meaning": "상황 봐가면서 하자.",
    "example": [
      {
        "speaker": "A",
        "text": "Should we book dinner now?",
        "translation": "저녁 예약 지금 할까?"
      },
      {
        "speaker": "B",
        "text": "Let's play it by ear. We may get out late.",
        "translation": "상황 봐가며 하자. 늦게 끝날 수도 있어."
      }
    ],
    "tip": "정확한 계획을 세우기 애매할 때 미국 일상 대화에서 매우 자주 씁니다."
  },
  {
    "phrase": "You lost me.",
    "meaning": "나 놓쳤어, 무슨 말인지 모르겠어.",
    "example": [
      {
        "speaker": "A",
        "text": "After the token refresh, the endpoint checks the bearer header.",
        "translation": "토큰 갱신 후 엔드포인트가 bearer 헤더를 확인해요."
      },
      {
        "speaker": "B",
        "text": "You lost me at token refresh.",
        "translation": "토큰 갱신 얘기부터 못 따라갔어."
      }
    ],
    "tip": "미드에서 자주 들리는 캐주얼한 표현입니다. You lost me at... 패턴도 좋습니다."
  },
  {
    "phrase": "No hard feelings.",
    "meaning": "악감정은 없어, 기분 나쁘게 생각하지 마.",
    "example": [
      {
        "speaker": "A",
        "text": "We decided to go with another vendor.",
        "translation": "다른 업체로 가기로 했어요."
      },
      {
        "speaker": "B",
        "text": "No hard feelings. Thanks for letting me know.",
        "translation": "악감정은 없어요. 알려줘서 고마워요."
      }
    ],
    "tip": "거절, 의견 차이, 어색한 상황 뒤에 관계를 부드럽게 정리할 때 좋습니다."
  },
  {
    "phrase": "Don't get me wrong.",
    "meaning": "오해하진 마.",
    "example": [
      {
        "speaker": "A",
        "text": "Don't get me wrong. I like the idea, but the timing is tricky.",
        "translation": "오해하진 마. 아이디어는 좋은데 타이밍이 좀 까다로워."
      },
      {
        "speaker": "B",
        "text": "That makes sense.",
        "translation": "그 말 이해돼."
      }
    ],
    "tip": "비판이나 반대 의견을 말하기 전에 완충하는 표현입니다."
  }
];

export async function getDailyVersePayload(date = new Date(), options = {}) {
  const dateKey = formatDateKey(date);
  const cached = await getCachedLesson(dateKey);
  const lesson = cached || await createDailyLesson(date, dateKey, options);
  return buildPayload(lesson, options, Boolean(cached));
}

export default async function handler(request, response) {
  response.setHeader("content-type", "application/json; charset=utf-8");

  if (request.method !== "GET") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  const url = new URL(request.url || "/", "https://local.invalid");
  const date = parseDate(url.searchParams.get("date"));

  try {
    response.status(200).json(await getDailyVersePayload(date));
  } catch (error) {
    console.error(error);
    response.status(200).json(buildPayload(buildFallbackLesson(date, formatDateKey(date), { reason: error.message }), {}, false));
  }
}

async function createDailyLesson(date, dateKey, options) {
  let lesson = null;
  if (process.env.OPENAI_API_KEY) {
    try {
      const recent = await listRecentLessons(HISTORY_LIMIT);
      lesson = await generateLessonWithOpenAI({ dateKey, slotLabel: options.slotLabel || "", recent });
    } catch (error) {
      console.warn("daily-verse-generation-failed", error.message || error);
    }
  }

  if (!lesson) lesson = buildFallbackLesson(date, dateKey, { reason: process.env.OPENAI_API_KEY ? "generation_failed" : "missing_OPENAI_API_KEY" });
  lesson = normalizeLesson(lesson, dateKey);
  await saveCachedLesson(dateKey, lesson);
  return lesson;
}

function buildPayload(lesson, options = {}, cached = false) {
  const scripture = lesson.scripture;
  const expression = enrichExpression(lesson.expression);
  const slotPrefix = options.slotLabel ? options.slotLabel + " " : "";
  const scheduledSuffix = options.scheduledTime ? " (" + options.scheduledTime + ")" : "";
  return {
    title: slotPrefix + "말씀" + scheduledSuffix + " · " + scripture.reference,
    body: scripture.text + "\n\n" + expression.phrase + " — " + expression.meaning,
    url: process.env.DAILY_VERSE_APP_URL || "/daily-verse/",
    scripture,
    expression,
    slotLabel: options.slotLabel || "",
    scheduledTime: options.scheduledTime || "",
    dateKey: lesson.dateKey,
    generated: Boolean(lesson.generated),
    cached,
    fallback: Boolean(lesson.fallback),
    model: lesson.model || "fallback",
  };
}

async function generateLessonWithOpenAI({ dateKey, slotLabel, recent }) {
  const recentReferences = recent.map((item) => item.scripture?.reference).filter(Boolean).slice(0, HISTORY_LIMIT);
  const recentPhrases = recent.map((item) => item.expression?.phrase).filter(Boolean).slice(0, HISTORY_LIMIT);
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      authorization: "Bearer " + process.env.OPENAI_API_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      input: [
        {
          role: "developer",
          content: "You create one Korean Christian daily Bible-and-English learning card. Return only valid JSON matching the schema. Do not quote real movie or TV lines. Create original natural American English examples that feel like scenes common in shows or films. Use Korean explanations. Prefer variety and avoid recent references and phrases.",
        },
        {
          role: "user",
          content: JSON.stringify({
            dateKey,
            slotLabel,
            recentReferences,
            recentPhrases,
            requirements: [
              "Recommend a Bible passage reference and Korean KRV text when you are confident. Keep the Bible text concise, usually 1-3 verses.",
              "Make the scripture focus practical for today and add one concrete reflection prompt.",
              "Choose a fresh, common American English expression used in everyday conversation, workplace, family, friendship, or dramatic scenes.",
              "Include meaning, two-line dialogue, nuance tip, where-it-fits scene note, 3 reusable patterns, and 4 practice lines.",
              "Do not repeat recentReferences or recentPhrases.",
            ],
          }),
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "daily_verse_english_lesson",
          strict: true,
          schema: lessonSchema(),
        },
      },
      max_output_tokens: 2400,
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error?.message || "OpenAI request failed: " + response.status);
  const text = extractResponseText(data);
  if (!text) throw new Error("OpenAI response did not include text output");
  const lesson = JSON.parse(text);
  return { ...lesson, generated: true, fallback: false, model: data.model || OPENAI_MODEL };
}

function lessonSchema() {
  return {
    type: "object",
    additionalProperties: false,
    required: ["scripture", "expression"],
    properties: {
      scripture: {
        type: "object",
        additionalProperties: false,
        required: ["reference", "text", "focus", "prompt"],
        properties: {
          reference: { type: "string" },
          text: { type: "string" },
          focus: { type: "string" },
          prompt: { type: "string" },
        },
      },
      expression: {
        type: "object",
        additionalProperties: false,
        required: ["phrase", "meaning", "example", "tip", "scene", "patterns", "drills"],
        properties: {
          phrase: { type: "string" },
          meaning: { type: "string" },
          example: {
            type: "array",
            minItems: 2,
            maxItems: 2,
            items: {
              type: "object",
              additionalProperties: false,
              required: ["speaker", "text", "translation"],
              properties: {
                speaker: { type: "string" },
                text: { type: "string" },
                translation: { type: "string" },
              },
            },
          },
          tip: { type: "string" },
          scene: { type: "string" },
          patterns: { type: "array", minItems: 3, maxItems: 3, items: { type: "string" } },
          drills: { type: "array", minItems: 4, maxItems: 4, items: { type: "string" } },
        },
      },
    },
  };
}

function extractResponseText(data) {
  if (typeof data.output_text === "string") return data.output_text;
  const parts = [];
  for (const item of data.output || []) {
    for (const content of item.content || []) {
      if (content.type === "output_text" && content.text) parts.push(content.text);
    }
  }
  return parts.join("\n").trim();
}

function buildFallbackLesson(date, dateKey, meta = {}) {
  const index = dayIndex(date);
  return normalizeLesson({
    dateKey,
    scripture: fallbackScriptures[index % fallbackScriptures.length],
    expression: fallbackExpressions[(index * 7) % fallbackExpressions.length],
    generated: false,
    fallback: true,
    model: "fallback",
    fallbackReason: meta.reason || "fallback",
  }, dateKey);
}

function normalizeLesson(lesson, dateKey) {
  const fallback = fallbackForDateKey(dateKey);
  return {
    dateKey,
    scripture: {
      reference: clean(lesson.scripture?.reference) || fallback.scripture.reference,
      text: clean(lesson.scripture?.text) || fallback.scripture.text,
      focus: clean(lesson.scripture?.focus) || fallback.scripture.focus,
      prompt: clean(lesson.scripture?.prompt) || fallback.scripture.prompt,
    },
    expression: enrichExpression(lesson.expression || fallback.expression),
    generated: Boolean(lesson.generated),
    fallback: Boolean(lesson.fallback),
    model: lesson.model || "fallback",
    fallbackReason: lesson.fallbackReason || "",
    savedAt: lesson.savedAt || new Date().toISOString(),
  };
}

function fallbackForDateKey(dateKey) {
  const date = parseDate(dateKey);
  const index = dayIndex(date);
  return {
    scripture: fallbackScriptures[index % fallbackScriptures.length],
    expression: fallbackExpressions[(index * 7) % fallbackExpressions.length],
  };
}

function enrichExpression(expression) {
  const phrase = clean(expression.phrase) || "I'll keep you posted.";
  const meaning = clean(expression.meaning) || "진행 상황 계속 알려줄게.";
  const example = Array.isArray(expression.example) && expression.example.length ? expression.example : [
    { speaker: "A", text: "Let me know what happens.", translation: "어떻게 되는지 알려줘." },
    { speaker: "B", text: phrase, translation: meaning },
  ];
  return {
    phrase,
    meaning,
    example: example.slice(0, 2).map((line, index) => ({ speaker: clean(line.speaker) || (index === 0 ? "A" : "B"), text: clean(line.text) || phrase, translation: clean(line.translation) || meaning })),
    tip: clean(expression.tip) || "짧게 주고받는 실제 대화에서 자연스럽게 쓰는 표현입니다.",
    scene: clean(expression.scene) || "미드나 영화의 친구, 가족, 직장 대화처럼 바로 반응해야 하는 장면에 잘 맞습니다.",
    patterns: normalizeStringList(expression.patterns, [phrase, phrase + " What do you think?", "I mean, " + phrase]).slice(0, 3),
    drills: normalizeStringList(expression.drills, ["A: What happened? B: " + phrase, phrase + " + 이유 한 문장 붙이기", "오늘 실제 대화에 맞춰 " + phrase + "로 시작해보기", "같은 뜻을 더 부드럽게 한 번 바꿔 말해보기"]).slice(0, 4),
  };
}

async function getCachedLesson(dateKey) {
  if (!isLessonStorageConfigured()) return null;
  try {
    if (useLocalLessonStore()) {
      const store = await readLocalLessonStore();
      return store[dateKey] || null;
    }
    const result = await upstashCommand(["HGET", DAILY_LESSON_KEY, dateKey]);
    return result ? JSON.parse(result) : null;
  } catch (error) {
    console.warn("daily-verse-cache-read-failed", error.message || error);
    return null;
  }
}

async function saveCachedLesson(dateKey, lesson) {
  if (!isLessonStorageConfigured()) return;
  try {
    const saved = { ...lesson, savedAt: lesson.savedAt || new Date().toISOString() };
    if (useLocalLessonStore()) {
      const store = await readLocalLessonStore();
      store[dateKey] = saved;
      await writeLocalLessonStore(store);
      return;
    }
    await upstashCommand(["HSET", DAILY_LESSON_KEY, dateKey, JSON.stringify(saved)]);
  } catch (error) {
    console.warn("daily-verse-cache-write-failed", error.message || error);
  }
}

async function listRecentLessons(limit) {
  if (!isLessonStorageConfigured()) return [];
  try {
    const lessons = useLocalLessonStore() ? Object.values(await readLocalLessonStore()) : await listUpstashLessons();
    return lessons
      .filter(Boolean)
      .sort((a, b) => String(b.dateKey || "").localeCompare(String(a.dateKey || "")))
      .slice(0, limit);
  } catch (error) {
    console.warn("daily-verse-history-read-failed", error.message || error);
    return [];
  }
}

async function listUpstashLessons() {
  const result = await upstashCommand(["HGETALL", DAILY_LESSON_KEY]);
  const pairs = Array.isArray(result) ? result : [];
  const lessons = [];
  for (let index = 0; index < pairs.length; index += 2) {
    try {
      lessons.push(JSON.parse(pairs[index + 1]));
    } catch {
      // Ignore malformed cached lessons.
    }
  }
  return lessons;
}

async function upstashCommand(command) {
  const response = await fetch(process.env.UPSTASH_REDIS_REST_URL, {
    method: "POST",
    headers: {
      authorization: "Bearer " + process.env.UPSTASH_REDIS_REST_TOKEN,
      "content-type": "application/json",
    },
    body: JSON.stringify(command),
  });
  const data = await response.json();
  if (!response.ok || data.error) throw new Error(data.error || "Upstash request failed: " + response.status);
  return data.result;
}

function isLessonStorageConfigured() {
  return Boolean(getLocalLessonStorePath() || (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN));
}

function useLocalLessonStore() {
  return Boolean(getLocalLessonStorePath());
}

async function readLocalLessonStore() {
  const file = getLocalLessonStorePath();
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return {};
    throw error;
  }
}

async function writeLocalLessonStore(store) {
  const file = getLocalLessonStorePath();
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(store, null, 2), "utf8");
}

function getLocalLessonStorePath() {
  const explicit = process.env.LOCAL_DAILY_VERSE_STORE_FILE;
  if (explicit) return path.resolve(process.cwd(), explicit);
  if (process.env.LOCAL_PUSH_STORE_FILE) return path.resolve(process.cwd(), process.env.LOCAL_PUSH_STORE_FILE + ".lessons");
  return "";
}

function normalizeStringList(value, fallback) {
  const items = Array.isArray(value) ? value.map(clean).filter(Boolean) : [];
  return items.length ? items : fallback;
}


function clean(value) {
  return typeof value === "string" ? value.trim() : "";
}

function parseDate(value) {
  if (!value) return new Date();
  const date = new Date(value + "T00:00:00");
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function formatDateKey(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function dayIndex(date) {
  return Math.floor((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - START_DAY) / DAY_IN_MS);
}
