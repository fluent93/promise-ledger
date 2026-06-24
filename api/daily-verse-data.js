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
  { phrase: "Can you give me a quick rundown?", meaning: "짧게 요약해서 설명해줄래?" },
  { phrase: "Let's take this offline.", meaning: "이건 따로 얘기하자." },
  { phrase: "I'm not following.", meaning: "잘 못 따라가겠어, 이해가 안 돼." },
  { phrase: "I'll keep you posted.", meaning: "진행 상황 계속 알려줄게." },
  { phrase: "Let's play it by ear.", meaning: "상황 봐가면서 하자." },
  { phrase: "You lost me.", meaning: "나 놓쳤어, 무슨 말인지 모르겠어." },
  { phrase: "That's above my pay grade.", meaning: "그건 내가 결정할 급은 아니야." },
  { phrase: "That came out wrong.", meaning: "방금 말이 좀 이상하게 나왔네." },
  { phrase: "No hard feelings.", meaning: "악감정은 없어, 기분 나쁘게 생각하지 마." },
  { phrase: "I'll take your word for it.", meaning: "네 말 믿을게, 그렇다고 칠게." },
  { phrase: "It slipped my mind.", meaning: "깜빡했어." },
  { phrase: "I didn't catch that.", meaning: "방금 못 들었어, 못 알아들었어." },
  { phrase: "Let's not make a scene.", meaning: "괜히 소란 피우지 말자." },
  { phrase: "I owe you one.", meaning: "신세 졌어, 내가 하나 빚졌네." },
  { phrase: "That sounds about right.", meaning: "대충 맞는 것 같아." },
  { phrase: "Don't get me wrong.", meaning: "오해하진 마." },
  { phrase: "I'm on the fence.", meaning: "아직 결정 못 했어, 반반이야." },
  { phrase: "I'll figure it out.", meaning: "내가 어떻게든 알아서 해볼게." },
  { phrase: "It's not worth it.", meaning: "그럴 가치 없어, 괜히 하지 마." },
  { phrase: "Let's call it a day.", meaning: "오늘은 여기까지 하자." },
  { phrase: "That doesn't sit right with me.", meaning: "그게 좀 마음에 걸려, 찜찜해." },
  { phrase: "I'm just thinking out loud.", meaning: "그냥 생각나는 대로 말해보는 거야." },
  { phrase: "I don't buy it.", meaning: "난 그 말 안 믿겨, 납득이 안 돼." },
  { phrase: "Let's sleep on it.", meaning: "하룻밤 생각해보자." },
];

export function getDailyVersePayload(date = new Date(), options = {}) {
  const index = Math.floor((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - START_DAY) / DAY_IN_MS);
  const scripture = scriptures[index % scriptures.length];
  const expression = expressions[(index * 7) % expressions.length];
  const slotPrefix = options.slotLabel ? `${options.slotLabel} ` : "";
  const scheduledSuffix = options.scheduledTime ? ` (${options.scheduledTime})` : "";
  return {
    title: `${slotPrefix}말씀${scheduledSuffix} · ${scripture.reference}`,
    body: `${scripture.text}

${expression.phrase} — ${expression.meaning}`,
    url: process.env.DAILY_VERSE_APP_URL || "/daily-verse/",
    scripture,
    expression,
    slotLabel: options.slotLabel || "",
    scheduledTime: options.scheduledTime || "",
  };
}
