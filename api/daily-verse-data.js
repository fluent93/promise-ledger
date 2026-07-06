import fs from "node:fs/promises";
import path from "node:path";
import { EXPRESSION_POLICY_VERSION, advancedExpressions } from "../apps/11-daily-verse-english/src/expression-data.js";

const DAILY_LESSON_KEY = "daily-verse-english:daily-lessons";
const HISTORY_LIMIT = 45;
const OPENAI_MODEL = process.env.DAILY_VERSE_OPENAI_MODEL || "gpt-5.4-mini";
const SCRIPTURE_POLICY_VERSION = 3;
const DISALLOWED_BEGINNER_PHRASES = ["figure out", "keep you posted", "play it by ear"];

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
  },
  {
    "reference": "여호수아 1:9",
    "text": "내가 네게 명한 것이 아니냐 마음을 강하게 하고 담대히 하라 두려워 말며 놀라지 말라 네가 어디로 가든지 네 하나님 여호와가 너와 함께 하느니라 하시니라",
    "focus": "담대함은 상황이 쉬워서가 아니라 함께하심을 믿어서 나옵니다.",
    "prompt": "오늘 피하고 싶은 일 하나를 적고, 첫 행동을 작게 정해보세요."
  },
  {
    "reference": "시편 121:1-2",
    "text": "내가 산을 향하여 눈을 들리라 나의 도움이 어디서 올꼬 나의 도움이 천지를 지으신 여호와에게서로다",
    "focus": "도움을 찾는 시선을 다시 하나님께 돌리는 하루.",
    "prompt": "도움이 필요한 일을 하나 정하고, 사람에게 말하기 전에 짧게 기도해보세요."
  },
  {
    "reference": "이사야 40:31",
    "text": "오직 여호와를 앙망하는 자는 새 힘을 얻으리니 독수리의 날개치며 올라감 같을 것이요 달음박질하여도 곤비치 아니하겠고 걸어가도 피곤치 아니하리로다",
    "focus": "속도를 내기 전에 새 힘을 받는 방향을 선택하기.",
    "prompt": "오늘 무리해서 밀어붙이는 일 하나에 쉼표를 찍어보세요."
  },
  {
    "reference": "미가 6:8",
    "text": "사람아 주께서 선한 것이 무엇임을 네게 보이셨나니 여호와께서 네게 구하시는 것이 오직 공의를 행하며 인자를 사랑하며 겸손히 네 하나님과 함께 행하는 것이 아니냐",
    "focus": "크게 보이는 성취보다 바르게 걷는 태도를 붙들기.",
    "prompt": "오늘 공의, 인자, 겸손 중 하나를 실제 행동으로 옮길 장면을 정해보세요."
  },
  {
    "reference": "마태복음 5:16",
    "text": "이같이 너희 빛을 사람 앞에 비취게 하여 저희로 너희 착한 행실을 보고 하늘에 계신 너희 아버지께 영광을 돌리게 하라",
    "focus": "보이기 위한 선행이 아니라 하나님께 향하게 하는 빛으로 살기.",
    "prompt": "오늘 누군가에게 조용히 도움이 되는 행동 하나를 해보세요."
  },
  {
    "reference": "마태복음 11:28",
    "text": "수고하고 무거운 짐진 자들아 다 내게로 오라 내가 너희를 쉬게 하리라",
    "focus": "무거움을 혼자 들고 버티는 대신 주님께 가지고 가기.",
    "prompt": "오늘 마음에 남은 피로를 한 문장으로 쓰고 기도로 내려놓아보세요."
  },
  {
    "reference": "누가복음 6:31",
    "text": "남에게 대접을 받고자 하는대로 너희도 남을 대접하라",
    "focus": "내가 받고 싶은 존중을 먼저 건네는 연습.",
    "prompt": "오늘 대화 하나에서 내가 원하는 말투를 먼저 사용해보세요."
  },
  {
    "reference": "요한복음 14:27",
    "text": "평안을 너희에게 끼치노니 곧 나의 평안을 너희에게 주노라 내가 너희에게 주는 것은 세상이 주는 것 같지 아니하니라 너희는 마음에 근심도 말고 두려워하지도 말라",
    "focus": "상황이 주는 안정과 주님이 주시는 평안을 구분하기.",
    "prompt": "오늘 불안을 키우는 정보를 하나 줄이고 평안을 선택할 시간을 만들어보세요."
  },
  {
    "reference": "로마서 8:28",
    "text": "우리가 알거니와 하나님을 사랑하는 자 곧 그 뜻대로 부르심을 입은 자들에게는 모든 것이 합력하여 선을 이루느니라",
    "focus": "아직 이해되지 않는 일도 선으로 엮으시는 하나님을 신뢰하기.",
    "prompt": "최근 마음에 걸리는 일을 하나 적고, 지금 보이는 작은 선한 조각을 찾아보세요."
  },
  {
    "reference": "로마서 12:12",
    "text": "소망 중에 즐거워하며 환난 중에 참으며 기도에 항상 힘쓰며",
    "focus": "소망, 인내, 기도를 하루의 리듬으로 삼기.",
    "prompt": "오늘 힘든 순간에 반복할 짧은 기도문을 하나 만들어보세요."
  },
  {
    "reference": "갈라디아서 6:9",
    "text": "우리가 선을 행하되 낙심하지 말지니 피곤하지 아니하면 때가 이르매 거두리라",
    "focus": "당장 보상받지 못해도 선한 일을 멈추지 않기.",
    "prompt": "최근 지친 선한 습관 하나를 오늘만 다시 해보세요."
  },
  {
    "reference": "에베소서 4:32",
    "text": "서로 인자하게 하며 불쌍히 여기며 서로 용서하기를 하나님이 그리스도 안에서 너희를 용서하심과 같이 하라",
    "focus": "용서는 감정을 무시하는 일이 아니라 받은 은혜를 기억하는 일.",
    "prompt": "오늘 마음이 딱딱해지는 사람을 떠올리고, 그를 위한 짧은 기도를 해보세요."
  },
  {
    "reference": "빌립보서 2:3-4",
    "text": "아무 일에든지 다툼이나 허영으로 하지 말고 오직 겸손한 마음으로 각각 자기보다 남을 낫게 여기고 각각 자기 일을 돌아볼뿐더러 또한 각각 다른 사람들의 일을 돌아보아",
    "focus": "내 입장만 크게 만드는 마음에서 한 걸음 물러서기.",
    "prompt": "오늘 회의나 대화에서 다른 사람의 필요를 먼저 묻는 질문을 해보세요."
  },
  {
    "reference": "골로새서 3:15",
    "text": "그리스도의 평강이 너희 마음을 주장하게 하라 평강을 위하여 너희가 한 몸으로 부르심을 받았나니 또한 너희는 감사하는 자가 되라",
    "focus": "마음의 주도권을 불안이 아니라 그리스도의 평강에 맡기기.",
    "prompt": "오늘 마음을 흔드는 생각이 오면 감사 세 가지를 적어보세요."
  },
  {
    "reference": "데살로니가전서 5:16-18",
    "text": "항상 기뻐하라 쉬지 말고 기도하라 범사에 감사하라 이는 그리스도 예수 안에서 너희를 향하신 하나님의 뜻이니라",
    "focus": "기쁨과 기도와 감사는 기분보다 깊은 선택입니다.",
    "prompt": "오늘 감사 하나를 바로 메시지나 메모로 남겨보세요."
  },
  {
    "reference": "디모데후서 1:7",
    "text": "하나님이 우리에게 주신 것은 두려워하는 마음이 아니요 오직 능력과 사랑과 근신하는 마음이니",
    "focus": "두려움 대신 능력, 사랑, 절제의 마음으로 반응하기.",
    "prompt": "오늘 두려움이 올라오는 순간에 사랑으로 할 수 있는 행동을 하나 고르세요."
  },
  {
    "reference": "히브리서 4:16",
    "text": "그러므로 우리가 긍휼하심을 받고 때를 따라 돕는 은혜를 얻기 위하여 은혜의 보좌 앞에 담대히 나아갈 것이니라",
    "focus": "부족함이 기도를 막는 이유가 아니라 은혜 앞으로 가는 이유가 됩니다.",
    "prompt": "오늘 미루던 기도 제목 하나를 솔직한 문장으로 꺼내보세요."
  },
  {
    "reference": "히브리서 10:24",
    "text": "서로 돌아보아 사랑과 선행을 격려하며",
    "focus": "믿음은 혼자 버티는 힘만이 아니라 서로 격려하는 관계입니다.",
    "prompt": "오늘 한 사람에게 짧은 격려 메시지를 보내보세요."
  },
  {
    "reference": "베드로전서 5:7",
    "text": "너희 염려를 다 주께 맡겨 버리라 이는 저가 너희를 권고하심이니라",
    "focus": "염려를 맡길 수 있는 이유는 하나님이 돌보시기 때문입니다.",
    "prompt": "오늘 가장 큰 염려를 적고, 그 옆에 맡긴다는 표시를 해보세요."
  },
  {
    "reference": "요한일서 4:18",
    "text": "사랑 안에 두려움이 없고 온전한 사랑이 두려움을 내어쫓나니 두려움에는 형벌이 있음이라 두려워하는 자는 사랑 안에서 온전히 이루지 못하였느니라",
    "focus": "두려움을 이기는 힘은 더 큰 통제가 아니라 더 온전한 사랑입니다.",
    "prompt": "오늘 두려움으로 미루는 말이나 행동을 사랑의 방식으로 바꿔보세요."
  }
];

const fallbackExpressions = advancedExpressions;
const COMMON_SCRIPTURE_REFERENCES = fallbackScriptures.map((item) => item.reference);

export async function getDailyVersePayload(date = new Date(), options = {}) {
  const dateKey = formatDateKey(date);
  const lessonKey = formatLessonKey(dateKey, options);
  const generationOptions = { ...options, lessonKey };
  const cached = await getCachedLesson(lessonKey);
  const useCache = shouldUseCachedLesson(cached, generationOptions);
  const lesson = useCache ? cached : await createDailyLesson(date, dateKey, generationOptions);
  return buildPayload(lesson, options, useCache);
}

export default async function handler(request, response) {
  response.setHeader("content-type", "application/json; charset=utf-8");

  if (request.method !== "GET") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  const url = new URL(request.url || "/", "https://local.invalid");
  const date = parseDate(url.searchParams.get("date"));
  const slot = clean(url.searchParams.get("slot"));
  const refresh = url.searchParams.get("refresh") === "1";
  const allowFallback = url.searchParams.get("fallback") === "1";

  try {
    response.status(200).json(await getDailyVersePayload(date, { slot, refresh, allowFallback }));
  } catch (error) {
    console.error(error);
    response.status(503).json({
      error: "Daily verse generation failed",
      message: error.message || "OpenAI generation is unavailable",
      dateKey: formatDateKey(date),
      model: OPENAI_MODEL,
      fallback: false,
    });
  }
}

async function createDailyLesson(date, dateKey, options) {
  let lesson = null;
  const lessonKey = options.lessonKey || dateKey;
  const allowFallback = shouldAllowFallback(options);

  if (!process.env.OPENAI_API_KEY) {
    if (!allowFallback) throw new Error("OPENAI_API_KEY is required for daily generated Bible passages");
    lesson = buildFallbackLesson(date, dateKey, { reason: "missing_OPENAI_API_KEY", lessonKey });
  } else {
    try {
      const recent = await listRecentLessons(HISTORY_LIMIT);
      lesson = await generateLessonWithOpenAI({ dateKey, lessonKey, slotLabel: options.slotLabel || "", recent });
    } catch (error) {
      console.warn("daily-verse-generation-failed", error.message || error);
      if (!allowFallback) throw error;
      lesson = buildFallbackLesson(date, dateKey, { reason: "generation_failed", lessonKey });
    }
  }

  lesson = normalizeLesson({ ...lesson, lessonKey }, dateKey);
  await saveCachedLesson(lessonKey, lesson);
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
    lessonKey: lesson.lessonKey || formatLessonKey(lesson.dateKey, options),
    scripturePolicyVersion: lesson.scripturePolicyVersion || SCRIPTURE_POLICY_VERSION,
    expressionPolicyVersion: lesson.expressionPolicyVersion || EXPRESSION_POLICY_VERSION,
    generated: Boolean(lesson.generated),
    cached,
    fallback: Boolean(lesson.fallback),
    model: lesson.model || "fallback",
    fallbackReason: lesson.fallbackReason || "",
  };
}

function shouldUseCachedLesson(cached, options = {}) {
  if (!cached) return false;
  if (options.refresh) return false;
  if (cached.scripturePolicyVersion !== SCRIPTURE_POLICY_VERSION) return false;
  if (cached.expressionPolicyVersion !== EXPRESSION_POLICY_VERSION) return false;
  if (isDisallowedBeginnerExpression(cached.expression?.phrase)) return false;
  if (cached.fallback && !shouldAllowFallback(options)) return false;
  if (cached.fallback && process.env.OPENAI_API_KEY) return false;
  return true;
}

function isDisallowedBeginnerExpression(phrase) {
  const normalized = clean(phrase).toLowerCase();
  return DISALLOWED_BEGINNER_PHRASES.some((item) => normalized.includes(item));
}

async function generateLessonWithOpenAI({ dateKey, lessonKey, slotLabel, recent }) {
  const recentReferences = recent.map((item) => item.scripture?.reference).filter(Boolean).slice(0, HISTORY_LIMIT);
  const recentPhrases = recent.map((item) => item.expression?.phrase).filter(Boolean).slice(0, HISTORY_LIMIT);
  const blockedReferences = uniqueStrings([...recentReferences, ...COMMON_SCRIPTURE_REFERENCES]);
  let lastError = null;

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const lesson = await requestGeneratedLesson({ dateKey, lessonKey, slotLabel, recentReferences, recentPhrases, blockedReferences, attempt });
      assertFreshScriptureReference(lesson.scripture?.reference, blockedReferences);
      return lesson;
    } catch (error) {
      lastError = error;
      if (error.reference) blockedReferences.push(error.reference);
    }
  }

  throw lastError || new Error("OpenAI did not return a fresh scripture reference");
}

async function requestGeneratedLesson({ dateKey, lessonKey, slotLabel, recentReferences, recentPhrases, blockedReferences, attempt }) {
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
          content: "You create one Korean Christian daily Bible-and-English learning card. Return only valid JSON matching the schema. Do not quote real movie or TV lines. Create original natural American English examples that feel like scenes common in shows, films, YouTube commentary, and modern US workplace conversations. Use Korean explanations for an upper-intermediate to advanced Korean learner who studied in the US and wants to keep that instinct alive. The Bible passage must be freshly selected for this date and slot, not drawn from a fixed devotional list. Prefer less-overused but pastorally useful passages, and avoid recent or common references exactly.",
        },
        {
          role: "user",
          content: JSON.stringify({
            dateKey,
            lessonKey,
            slotLabel,
            attempt,
            recentReferences,
            blockedReferences,
            recentPhrases,
            requirements: [
              "Generate a fresh Bible passage recommendation for this exact dateKey and lessonKey. Do not select from a fixed fallback pool.",
              "Do not use any reference in blockedReferences, and do not repeat recentReferences.",
              "Recommend a Korean KRV Bible text when you are confident. Keep the Bible text concise, usually 1-3 verses.",
              "Make the scripture focus practical for today and add one concrete reflection prompt.",
              "Choose a fresh, practical American English expression at upper-intermediate or advanced level, especially workplace, negotiation, conflict, emotional nuance, YouTube commentary, film, TV, family, or friendship scenes.",
              "Avoid beginner maintenance phrases such as figure out, keep you posted, play it by ear, I forgot, I understand, or generic textbook idioms unless the nuance is genuinely advanced.",
              "Include meaning, two-line dialogue, nuance tip, where-it-fits scene note, 3 reusable patterns, and 4 practice lines.",
              "Do not repeat recentPhrases.",
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
  const index = hashString(meta.lessonKey || dateKey || formatDateKey(date));
  return normalizeLesson({
    dateKey,
    lessonKey: meta.lessonKey || dateKey,
    scripturePolicyVersion: SCRIPTURE_POLICY_VERSION,
    expressionPolicyVersion: EXPRESSION_POLICY_VERSION,
    scripture: fallbackScriptures[positiveModulo(index, fallbackScriptures.length)],
    expression: fallbackExpressions[positiveModulo(index * 7, fallbackExpressions.length)],
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
    lessonKey: lesson.lessonKey || dateKey,
    scripturePolicyVersion: SCRIPTURE_POLICY_VERSION,
    expressionPolicyVersion: EXPRESSION_POLICY_VERSION,
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
  const index = hashString(dateKey);
  return {
    scripture: fallbackScriptures[positiveModulo(index, fallbackScriptures.length)],
    expression: fallbackExpressions[positiveModulo(index * 7, fallbackExpressions.length)],
  };
}

function assertFreshScriptureReference(reference, blockedReferences) {
  const normalized = normalizeReference(reference);
  if (!normalized) throw new Error("OpenAI response did not include a scripture reference");
  if (!blockedReferences.map(normalizeReference).includes(normalized)) return;
  const error = new Error("OpenAI returned a repeated or common scripture reference: " + reference);
  error.reference = reference;
  throw error;
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

function shouldAllowFallback(options = {}) {
  if (options.allowFallback) return true;
  if (process.env.DAILY_VERSE_ALLOW_FALLBACK === "1") return true;
  return process.env.NODE_ENV !== "production";
}

function uniqueStrings(values) {
  return [...new Set(values.map(clean).filter(Boolean))];
}

function normalizeReference(value) {
  return clean(value).replace(/\s+/g, "").replace(/[–—]/g, "-").toLowerCase();
}

function formatLessonKey(dateKey, options = {}) {
  const slot = clean(options.slot) || clean(options.lessonSlot) || clean(options.slotLabel).toLowerCase();
  return dateKey + ":" + (slot || "app");
}

function hashString(value) {
  let hash = 0;
  for (const char of String(value || "")) hash = ((hash * 31) + char.charCodeAt(0)) | 0;
  return hash;
}

function positiveModulo(value, divisor) {
  return ((value % divisor) + divisor) % divisor;
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

