const DAY_IN_MS = 86_400_000;
const START_DAY = Date.UTC(2026, 0, 1);

const scriptures = [
  {
    reference: "잠언 3:5-6",
    text: "너는 마음을 다하여 여호와를 의뢰하고 네 명철을 의지하지 말라 너는 범사에 그를 인정하라 그리하면 네 길을 지도하시리라",
  },
  {
    reference: "시편 23:1",
    text: "여호와는 나의 목자시니 내가 부족함이 없으리로다",
  },
  {
    reference: "마태복음 6:34",
    text: "그러므로 내일 일을 위하여 염려하지 말라 내일 일은 내일 염려할 것이요 한 날 괴로움은 그 날에 족하니라",
  },
  {
    reference: "빌립보서 4:6-7",
    text: "아무 것도 염려하지 말고 오직 모든 일에 기도와 간구로, 너희 구할 것을 감사함으로 하나님께 아뢰라 그리하면 모든 지각에 뛰어난 하나님의 평강이 그리스도 예수 안에서 너희 마음과 생각을 지키시리라",
  },
  {
    reference: "야고보서 1:19",
    text: "내 사랑하는 형제들아 너희가 알거니와 사람마다 듣기는 속히 하고 말하기는 더디 하며 성내기도 더디 하라",
  },
  {
    reference: "요한복음 15:5",
    text: "나는 포도나무요 너희는 가지니 저가 내 안에, 내가 저 안에 있으면 이 사람은 과실을 많이 맺나니 나를 떠나서는 너희가 아무 것도 할 수 없음이라",
  },
  {
    reference: "이사야 41:10",
    text: "두려워 말라 내가 너와 함께 함이니라 놀라지 말라 나는 네 하나님이 됨이니라 내가 너를 굳세게 하리라 참으로 너를 도와 주리라 참으로 나의 의로운 오른손으로 너를 붙들리라",
  },
  {
    reference: "골로새서 3:23",
    text: "무슨 일을 하든지 마음을 다하여 주께 하듯 하고 사람에게 하듯 하지 말라",
  },
  {
    reference: "로마서 12:2",
    text: "너희는 이 세대를 본받지 말고 오직 마음을 새롭게 함으로 변화를 받아 하나님의 선하시고 기뻐하시고 온전하신 뜻이 무엇인지 분별하도록 하라",
  },
  {
    reference: "시편 46:10",
    text: "이르시기를 너희는 가만히 있어 내가 하나님 됨을 알지어다 내가 열방과 세계 중에서 높임을 받으리라 하시도다",
  },
];

const expressions = [
  { phrase: "I'm rooting for you.", meaning: "응원하고 있어." },
  { phrase: "Let me sleep on it.", meaning: "하룻밤 생각해볼게." },
  { phrase: "That makes sense.", meaning: "말이 되네, 이해돼." },
  { phrase: "I'll take care of it.", meaning: "내가 처리할게." },
  { phrase: "It's not a big deal.", meaning: "별일 아니야." },
  { phrase: "Can I take a rain check?", meaning: "다음으로 미뤄도 될까?" },
  { phrase: "I'm on the same page.", meaning: "나도 같은 생각이야." },
  { phrase: "Let's keep it simple.", meaning: "간단하게 하자." },
  { phrase: "I appreciate the heads-up.", meaning: "미리 알려줘서 고마워." },
  { phrase: "No rush.", meaning: "급하지 않아." },
];

export function getDailyVersePayload(date = new Date()) {
  const index = Math.floor((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - START_DAY) / DAY_IN_MS);
  const scripture = scriptures[index % scriptures.length];
  const expression = expressions[(index * 7) % expressions.length];
  return {
    title: `오늘의 말씀 · ${scripture.reference}`,
    body: `${scripture.text}

${expression.phrase} — ${expression.meaning}`,
    url: process.env.DAILY_VERSE_APP_URL || "/daily-verse/",
    scripture,
    expression,
  };
}
