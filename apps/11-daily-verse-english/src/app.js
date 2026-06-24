const DAY_IN_MS = 86_400_000;
const START_DAY = Date.UTC(2026, 0, 1);
const STORAGE_KEY = "daily-verse-english:v1";
const REMINDER_STORAGE_KEY = "daily-verse-english:reminders:v1";
const SETUP_DISMISSED_KEY = "daily-verse-english:setup-dismissed:v1";
const APP_VERSION = "0.15";

let deferredInstallPrompt = null;
let pushPublicKey = null;

const bibleSources = {
  krv: {
    label: "개역한글",
    source: "출처/저작권 안내",
    link: "https://www.bskorea.or.kr/bbs/content.php?co_id=subpage2_3_4_1",
  },
};

const scriptures = [
  {
    reference: "잠언 3:5-6",
    text: "너는 마음을 다하여 여호와를 의뢰하고 네 명철을 의지하지 말라 너는 범사에 그를 인정하라 그리하면 네 길을 지도하시리라",
    focus: "오늘 결정은 혼자 움켜쥐기보다 하나님께 맡기는 방향으로.",
    prompt: "일정, 관계, 돈, 선택 중 하나를 떠올리고 내가 통제하려는 부분과 맡길 수 있는 부분을 구분해보세요.",
  },
  {
    reference: "시편 23:1",
    text: "여호와는 나의 목자시니 내가 부족함이 없으리로다",
    focus: "부족함을 먼저 세기보다 인도하심을 먼저 기억하는 하루.",
    prompt: "오늘 필요한 것을 세 가지 적고, 이미 받은 공급도 함께 적어보세요.",
  },
  {
    reference: "마태복음 6:34",
    text: "그러므로 내일 일을 위하여 염려하지 말라 내일 일은 내일 염려할 것이요 한 날 괴로움은 그 날에 족하니라",
    focus: "내일의 무게를 오늘 아침에 미리 다 들지 않기.",
    prompt: "오늘 실제로 할 수 있는 한 가지 행동만 고르고 나머지는 목록 밖으로 잠시 내려놓으세요.",
  },
  {
    reference: "빌립보서 4:6-7",
    text: "아무 것도 염려하지 말고 오직 모든 일에 기도와 간구로, 너희 구할 것을 감사함으로 하나님께 아뢰라 그리하면 모든 지각에 뛰어난 하나님의 평강이 그리스도 예수 안에서 너희 마음과 생각을 지키시리라",
    focus: "걱정을 부정하지 않고 기도로 옮기는 연습.",
    prompt: "걱정 하나를 문장으로 쓰고, 그 옆에 감사 하나를 붙여보세요.",
  },
  {
    reference: "야고보서 1:19",
    text: "내 사랑하는 형제들아 너희가 알거니와 사람마다 듣기는 속히 하고 말하기는 더디 하며 성내기도 더디 하라",
    focus: "빨리 듣고, 천천히 말하고, 더 천천히 화내기.",
    prompt: "오늘 답장을 보내기 전 10초 멈출 대화를 하나 정해두세요.",
  },
  {
    reference: "요한복음 15:5",
    text: "나는 포도나무요 너희는 가지니 저가 내 안에, 내가 저 안에 있으면 이 사람은 과실을 많이 맺나니 나를 떠나서는 너희가 아무 것도 할 수 없음이라",
    focus: "성과보다 연결이 먼저라는 감각을 회복하기.",
    prompt: "오늘의 일과 중 바쁘게 뛰어가기 전에 멈출 2분을 예약해보세요.",
  },
  {
    reference: "이사야 41:10",
    text: "두려워 말라 내가 너와 함께 함이니라 놀라지 말라 나는 네 하나님이 됨이니라 내가 너를 굳세게 하리라 참으로 너를 도와 주리라 참으로 나의 의로운 오른손으로 너를 붙들리라",
    focus: "두려움을 숨기는 대신 붙들림을 기억하기.",
    prompt: "오늘 부담되는 일을 하나 적고, 그 일을 혼자 처리하지 않아도 되는 이유를 적어보세요.",
  },
  {
    reference: "골로새서 3:23",
    text: "무슨 일을 하든지 마음을 다하여 주께 하듯 하고 사람에게 하듯 하지 말라",
    focus: "작은 일을 작게 대하지 않는 태도.",
    prompt: "눈에 띄지 않는 일 하나를 정성껏 끝내고 표시해보세요.",
  },
  {
    reference: "로마서 12:2",
    text: "너희는 이 세대를 본받지 말고 오직 마음을 새롭게 함으로 변화를 받아 하나님의 선하시고 기뻐하시고 온전하신 뜻이 무엇인지 분별하도록 하라",
    focus: "흐름에 휩쓸리지 않고 생각의 방향을 새롭게 하기.",
    prompt: "오늘 반복해서 떠오르는 생각 하나를 더 건강한 문장으로 바꿔보세요.",
  },
  {
    reference: "시편 46:10",
    text: "이르시기를 너희는 가만히 있어 내가 하나님 됨을 알지어다 내가 열방과 세계 중에서 높임을 받으리라 하시도다",
    focus: "멈춤도 믿음의 행동이 될 수 있습니다.",
    prompt: "오늘 알림을 끄고 조용히 있을 5분을 정해보세요.",
  },
];

const expressions = [
  {
    phrase: "Can you give me a quick rundown?",
    meaning: "짧게 요약해서 설명해줄래?",
    example: [
      { speaker: "A", text: "I missed the first part of the meeting.", translation: "회의 앞부분을 놓쳤어." },
      { speaker: "B", text: "Sure. I can give you a quick rundown.", translation: "물론이지. 짧게 요약해줄게." },
    ],
    tip: "회의, 상황 설명, 미드 속 사건 정리 장면에서 자연스럽습니다. summary보다 말맛이 더 구어적입니다.",
  },
  {
    phrase: "Let's take this offline.",
    meaning: "이건 따로 얘기하자.",
    example: [
      { speaker: "A", text: "I have a few concerns about the timeline.", translation: "일정에 대해 우려가 좀 있어요." },
      { speaker: "B", text: "Good point. Let's take this offline after the call.", translation: "좋은 지적이에요. 통화 끝나고 따로 얘기해요." },
    ],
    tip: "회의 중 모두 앞에서 길게 다루기 어려운 주제를 따로 빼자는 비즈니스 표현입니다.",
  },
  {
    phrase: "I'm not following.",
    meaning: "잘 못 따라가겠어, 이해가 안 돼.",
    example: [
      { speaker: "A", text: "The client changed the scope, so the launch date moved.", translation: "고객이 범위를 바꿔서 출시일이 밀렸어요." },
      { speaker: "B", text: "I'm not following. Which part changed?", translation: "잘 이해가 안 돼요. 어느 부분이 바뀐 거예요?" },
    ],
    tip: "I don't understand보다 대화 중에 훨씬 자연스럽게 끼어드는 표현입니다.",
  },
  {
    phrase: "I'll keep you posted.",
    meaning: "진행 상황 계속 알려줄게.",
    example: [
      { speaker: "A", text: "Let me know what happens with the scheduler.", translation: "스케줄러 어떻게 되는지 알려줘." },
      { speaker: "B", text: "Will do. I'll keep you posted.", translation: "그럴게. 계속 업데이트해줄게." },
    ],
    tip: "회사, 병원 예약, 가족 일정 등 거의 모든 상황에서 쓸 수 있는 실용 표현입니다.",
  },
  {
    phrase: "Let's play it by ear.",
    meaning: "상황 봐가면서 하자.",
    example: [
      { speaker: "A", text: "Should we book dinner now?", translation: "저녁 예약 지금 할까?" },
      { speaker: "B", text: "Let's play it by ear. We may get out late.", translation: "상황 봐가며 하자. 늦게 끝날 수도 있어." },
    ],
    tip: "정확한 계획을 세우기 애매할 때 미국 일상 대화에서 매우 자주 씁니다.",
  },
  {
    phrase: "You lost me.",
    meaning: "나 놓쳤어, 무슨 말인지 모르겠어.",
    example: [
      { speaker: "A", text: "After the token refresh, the endpoint checks the bearer header.", translation: "토큰 갱신 후 엔드포인트가 bearer 헤더를 확인해요." },
      { speaker: "B", text: "You lost me at token refresh.", translation: "토큰 갱신 얘기부터 못 따라갔어." },
    ],
    tip: "미드에서 자주 들리는 캐주얼한 표현입니다. `You lost me at...` 패턴도 좋습니다.",
  },
  {
    phrase: "That's above my pay grade.",
    meaning: "그건 내가 결정할 급은 아니야.",
    example: [
      { speaker: "A", text: "Do you know if leadership approved the budget?", translation: "윗선에서 예산 승인했는지 알아?" },
      { speaker: "B", text: "That's above my pay grade, but I can ask.", translation: "그건 내가 결정할 급은 아닌데 물어볼 수는 있어." },
    ],
    tip: "책임 범위를 벗어난다는 뜻을 약간 농담처럼 말할 때 씁니다. 영화/드라마에서도 흔합니다.",
  },
  {
    phrase: "That came out wrong.",
    meaning: "방금 말이 좀 이상하게 나왔네.",
    example: [
      { speaker: "A", text: "I didn't mean you were careless. That came out wrong.", translation: "네가 부주의했다는 뜻은 아니었어. 말이 좀 이상하게 나왔네." },
      { speaker: "B", text: "No worries. I know what you meant.", translation: "괜찮아. 무슨 뜻인지 알아." },
    ],
    tip: "말실수했을 때 바로 분위기를 수습하는 매우 유용한 표현입니다.",
  },
  {
    phrase: "No hard feelings.",
    meaning: "악감정은 없어, 기분 나쁘게 생각하지 마.",
    example: [
      { speaker: "A", text: "We decided to go with another vendor.", translation: "다른 업체로 가기로 했어요." },
      { speaker: "B", text: "No hard feelings. Thanks for letting me know.", translation: "악감정은 없어요. 알려줘서 고마워요." },
    ],
    tip: "거절, 의견 차이, 어색한 상황 뒤에 관계를 부드럽게 정리할 때 좋습니다.",
  },
  {
    phrase: "I'll take your word for it.",
    meaning: "네 말 믿을게, 그렇다고 칠게.",
    example: [
      { speaker: "A", text: "Trust me, the book is better than the movie.", translation: "진짜야, 책이 영화보다 훨씬 나아." },
      { speaker: "B", text: "I'll take your word for it.", translation: "네 말 믿을게." },
    ],
    tip: "직접 확인하진 않았지만 상대 말을 믿겠다는 표현입니다. 약간 장난스럽게도 씁니다.",
  },
  {
    phrase: "It slipped my mind.",
    meaning: "깜빡했어.",
    example: [
      { speaker: "A", text: "Did you send the link to your family?", translation: "가족에게 링크 보냈어?" },
      { speaker: "B", text: "Not yet. It slipped my mind.", translation: "아직. 깜빡했어." },
    ],
    tip: "I forgot보다 조금 더 부드럽고 자연스럽습니다.",
  },
  {
    phrase: "I didn't catch that.",
    meaning: "방금 못 들었어, 못 알아들었어.",
    example: [
      { speaker: "A", text: "The job runs at seven-thirty Korea time.", translation: "그 작업은 한국 시간 7시 30분에 돌아요." },
      { speaker: "B", text: "Sorry, I didn't catch that. What time?", translation: "미안, 못 들었어. 몇 시라고?" },
    ],
    tip: "상대 말을 놓쳤을 때 정중하고 자연스럽게 다시 물을 수 있습니다.",
  },
  {
    phrase: "Let's not make a scene.",
    meaning: "괜히 소란 피우지 말자.",
    example: [
      { speaker: "A", text: "Should I confront him right now?", translation: "지금 바로 따질까?" },
      { speaker: "B", text: "No. Let's not make a scene.", translation: "아니. 괜히 소란 피우지 말자." },
    ],
    tip: "영화/드라마에서 자주 나오는 표현입니다. 공공장소나 감정적인 상황에 잘 맞습니다.",
  },
  {
    phrase: "I owe you one.",
    meaning: "신세 졌어, 내가 하나 빚졌네.",
    example: [
      { speaker: "A", text: "I fixed the notification settings for you.", translation: "알림 설정 고쳐놨어." },
      { speaker: "B", text: "Thanks. I owe you one.", translation: "고마워. 신세 졌네." },
    ],
    tip: "감사를 짧고 미국식으로 표현할 때 좋습니다. 꼭 돈을 빚졌다는 뜻은 아닙니다.",
  },
  {
    phrase: "That sounds about right.",
    meaning: "대충 맞는 것 같아.",
    example: [
      { speaker: "A", text: "The scheduler should send three notifications a day.", translation: "스케줄러가 하루 세 번 알림을 보내야 해." },
      { speaker: "B", text: "That sounds about right.", translation: "대충 맞는 것 같아." },
    ],
    tip: "완전한 확신은 아니지만 들은 내용이 타당해 보일 때 씁니다.",
  },
  {
    phrase: "Don't get me wrong.",
    meaning: "오해하진 마.",
    example: [
      { speaker: "A", text: "Don't get me wrong. I like the idea, but the timing is tricky.", translation: "오해하진 마. 아이디어는 좋은데 타이밍이 좀 까다로워." },
      { speaker: "B", text: "That makes sense.", translation: "그 말 이해돼." },
    ],
    tip: "비판이나 반대 의견을 말하기 전에 완충하는 표현입니다.",
  },
  {
    phrase: "I'm on the fence.",
    meaning: "아직 결정 못 했어, 반반이야.",
    example: [
      { speaker: "A", text: "Are you going to the dinner tonight?", translation: "오늘 저녁 모임 갈 거야?" },
      { speaker: "B", text: "I'm on the fence. I'm pretty tired.", translation: "아직 고민 중이야. 좀 피곤해서." },
    ],
    tip: "결정을 못 내렸을 때 일상과 업무 모두에서 자주 씁니다.",
  },
  {
    phrase: "I'll figure it out.",
    meaning: "내가 어떻게든 알아서 해볼게.",
    example: [
      { speaker: "A", text: "Do you need help setting that up?", translation: "그거 설정하는 데 도움 필요해?" },
      { speaker: "B", text: "I might, but I'll figure it out first.", translation: "그럴 수도 있는데 일단 내가 해볼게." },
    ],
    tip: "해결책을 아직 몰라도 스스로 찾아보겠다는 미국식 표현입니다.",
  },
  {
    phrase: "It's not worth it.",
    meaning: "그럴 가치 없어, 괜히 하지 마.",
    example: [
      { speaker: "A", text: "Should I argue with customer support again?", translation: "고객센터랑 다시 따져볼까?" },
      { speaker: "B", text: "Honestly, it's not worth it.", translation: "솔직히 그럴 가치 없어." },
    ],
    tip: "시간, 감정, 돈을 들일 만큼 가치가 없을 때 씁니다.",
  },
  {
    phrase: "Let's call it a day.",
    meaning: "오늘은 여기까지 하자.",
    example: [
      { speaker: "A", text: "We tested the install and the scheduler.", translation: "설치랑 스케줄러 테스트했어." },
      { speaker: "B", text: "Great. Let's call it a day.", translation: "좋아. 오늘은 여기까지 하자." },
    ],
    tip: "업무나 작업을 마무리할 때 아주 자연스럽습니다.",
  },
  {
    phrase: "That doesn't sit right with me.",
    meaning: "그게 좀 마음에 걸려, 찜찜해.",
    example: [
      { speaker: "A", text: "We could skip the privacy note for now.", translation: "개인정보 안내는 일단 빼도 될 것 같아." },
      { speaker: "B", text: "That doesn't sit right with me.", translation: "그건 좀 마음에 걸려." },
    ],
    tip: "논리보다 감각적으로 찜찜함을 표현할 때 좋습니다. 드라마에서도 자주 들립니다.",
  },
  {
    phrase: "I'm just thinking out loud.",
    meaning: "그냥 생각나는 대로 말해보는 거야.",
    example: [
      { speaker: "A", text: "What if we made the reminder more personal?", translation: "알림을 좀 더 개인적으로 만들면 어떨까?" },
      { speaker: "B", text: "Maybe. I'm just thinking out loud.", translation: "그럴 수도. 그냥 생각나는 대로 말해보는 거야." },
    ],
    tip: "확정 의견이 아니라 아이디어를 던지는 중임을 밝힐 때 씁니다.",
  },
  {
    phrase: "I don't buy it.",
    meaning: "난 그 말 안 믿겨, 납득이 안 돼.",
    example: [
      { speaker: "A", text: "They said the delay was only because of traffic.", translation: "지연된 게 순전히 교통 때문이래." },
      { speaker: "B", text: "I don't buy it. Something else must have happened.", translation: "난 그 말 안 믿겨. 다른 일이 있었을 거야." },
    ],
    tip: "상대 설명이나 변명이 설득력 없을 때 쓰는 강한 구어 표현입니다.",
  },
  {
    phrase: "Let's sleep on it.",
    meaning: "하룻밤 생각해보자.",
    example: [
      { speaker: "A", text: "Should we change the whole notification system?", translation: "알림 시스템 전체를 바꿀까?" },
      { speaker: "B", text: "Let's sleep on it and decide tomorrow.", translation: "하룻밤 생각해보고 내일 결정하자." },
    ],
    tip: "즉시 결정하지 않고 시간을 두고 판단하자는 실생활 표현입니다.",
  },
];

const state = {
  selectedDate: startOfLocalDay(new Date()),
  version: "krv",
  notes: loadNotes(),
  reminders: loadReminders(),
  setupDismissed: loadSetupDismissed(),
};

const elements = {
  copyButton: document.querySelector("#copyButton"),
  previousDayButton: document.querySelector("#previousDayButton"),
  nextDayButton: document.querySelector("#nextDayButton"),
  weekdayLabel: document.querySelector("#weekdayLabel"),
  dateLabel: document.querySelector("#dateLabel"),
  versionButtons: [...document.querySelectorAll(".version-button")],
  verseReference: document.querySelector("#verseReference"),
  verseFocus: document.querySelector("#verseFocus"),
  versePrompt: document.querySelector("#versePrompt"),
  primaryBibleLink: document.querySelector("#primaryBibleLink"),
  versionLabel: document.querySelector("#versionLabel"),
  expressionPhrase: document.querySelector("#expressionPhrase"),
  expressionMeaning: document.querySelector("#expressionMeaning"),
  expressionExample: document.querySelector("#expressionExample"),
  expressionTip: document.querySelector("#expressionTip"),
  noteInput: document.querySelector("#noteInput"),
  favoriteButton: document.querySelector("#favoriteButton"),
  installButton: document.querySelector("#installButton"),
  shareInstallButton: document.querySelector("#shareInstallButton"),
  installHint: document.querySelector("#installHint"),
  installPanel: document.querySelector("#installPanel"),
  setupPanel: document.querySelector("#setupPanel"),
  setupDismissButton: document.querySelector("#setupDismissButton"),
  setupInstallAction: document.querySelector("#setupInstallAction"),
  setupNotifyAction: document.querySelector("#setupNotifyAction"),
  setupTimeAction: document.querySelector("#setupTimeAction"),
  setupTestAction: document.querySelector("#setupTestAction"),
  setupSteps: [...document.querySelectorAll("[data-setup-step]")],
  setupStatuses: [...document.querySelectorAll("[data-setup-status]")],
  setupCopies: [...document.querySelectorAll("[data-setup-copy]")],
  notificationButton: document.querySelector("#notificationButton"),
  screenTestButton: document.querySelector("#screenTestButton"),
  localNotificationButton: document.querySelector("#localNotificationButton"),
  testNotificationButton: document.querySelector("#testNotificationButton"),
  unsubscribeButton: document.querySelector("#unsubscribeButton"),
  notificationStatus: document.querySelector("#notificationStatus"),
  notificationDiagnostics: document.querySelector("#notificationDiagnostics"),
  screenToast: document.querySelector("#screenToast"),
  reminderInputs: [...document.querySelectorAll(".reminder-options input")],
  saveMessage: document.querySelector("#saveMessage"),
};

elements.previousDayButton.addEventListener("click", () => {
  state.selectedDate = addDays(state.selectedDate, -1);
  render();
});

elements.nextDayButton.addEventListener("click", () => {
  state.selectedDate = addDays(state.selectedDate, 1);
  render();
});

elements.versionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.version = button.dataset.version;
    render();
  });
});

elements.favoriteButton.addEventListener("click", () => {
  const key = dateKey(state.selectedDate);
  state.notes[key] = {
    note: elements.noteInput.value.trim(),
    savedAt: new Date().toISOString(),
    version: state.version,
  };
  persistNotes();
  setMessage("저장했습니다.");
});


elements.reminderInputs.forEach((input) => {
  input.addEventListener("change", () => {
    state.reminders[input.value] = input.checked;
    persistReminders();
    renderReminderStatus();
    syncPushSubscription().catch((error) => setNotificationStatus(error.message || "구독 저장에 실패했습니다."));
  });
});

elements.setupDismissButton?.addEventListener("click", () => {
  state.setupDismissed = true;
  persistSetupDismissed();
  renderSetupStatus();
});

elements.setupInstallAction?.addEventListener("click", () => {
  if (isAppInstalled()) return;
  if (!elements.installButton.hidden) {
    elements.installButton.click();
    return;
  }
  elements.shareInstallButton.click();
});

elements.setupNotifyAction?.addEventListener("click", () => {
  if (!elements.notificationButton.disabled) elements.notificationButton.click();
});

elements.setupTimeAction?.addEventListener("click", () => {
  document.querySelector(".reminder-panel")?.scrollIntoView({ behavior: "smooth", block: "center" });
  setNotificationStatus("원하는 알림 시간을 선택하세요.");
});

elements.setupTestAction?.addEventListener("click", () => {
  if (!elements.localNotificationButton.disabled) elements.localNotificationButton.click();
});

elements.notificationButton.addEventListener("click", async () => {
  if (!("Notification" in window)) {
    setNotificationStatus("이 브라우저는 알림을 지원하지 않습니다.");
    return;
  }

  const permission = await Notification.requestPermission();
  renderReminderStatus();
  if (permission === "granted") {
    try {
      await syncPushSubscription();
    } catch (error) {
      setNotificationStatus(error.message || "구독 저장에 실패했습니다.");
    }
  } else {
    setNotificationStatus("알림이 꺼져 있습니다.");
  }
});

elements.screenTestButton.addEventListener("click", () => {
  showScreenToast("화면 테스트 성공: 버튼 클릭은 정상입니다.");
  setNotificationStatus("화면 테스트는 성공했습니다. 이제 브라우저 테스트를 눌러 PC 알림을 확인하세요.");
  renderNotificationDiagnostics();
});

elements.unsubscribeButton.addEventListener("click", async () => {
  try {
    await unsubscribeFromPush();
    setNotificationStatus("정기 알림을 껐습니다.");
    renderReminderStatus();
  } catch (error) {
    setNotificationStatus(error.message || "알림 해제에 실패했습니다.");
  }
});

elements.localNotificationButton.addEventListener("click", async () => {
  if (!ensureNotificationReady()) return;
  showScreenToast("브라우저 테스트 클릭됨: PC 알림 2가지를 요청했습니다.");
  await showLocalTestNotifications();
  setNotificationStatus("Chrome 직접 알림과 서비스워커 알림을 모두 요청했습니다. 둘 다 안 보이면 Windows/Chrome 알림 표시가 막힌 상태일 가능성이 큽니다.");
  await renderNotificationDiagnostics();
});

elements.testNotificationButton.addEventListener("click", async () => {
  if (!ensureNotificationReady()) return;

  try {
    await sendServerTestPush();
    setNotificationStatus("서버가 푸시를 보냈습니다. 안 보이면 브라우저 테스트로 PC 알림 허용 상태를 먼저 확인하세요.");
  } catch (error) {
    console.warn(error);
    await showLocalTestNotifications();
    setNotificationStatus("브라우저 테스트 알림을 보냈습니다.");
  }
});

elements.shareInstallButton.addEventListener("click", async () => {
  const url = getShareUrl();
  const text = `말씀영어 링크입니다.

${url}

iPhone은 Safari에서 열고 공유 버튼 -> 홈 화면에 추가를 누르세요. Android는 Chrome에서 열고 앱 설치를 누르세요.`;
  try {
    if (navigator.share) {
      await navigator.share({ title: "말씀영어", text, url });
      setNotificationStatus("공유 화면을 열었습니다.");
      return;
    }
    await navigator.clipboard.writeText(text);
    setNotificationStatus("가족에게 보낼 안내 문구를 복사했습니다.");
  } catch {
    setNotificationStatus("공유를 취소했습니다.");
  }
});

elements.installButton.addEventListener("click", async () => {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  const result = await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  elements.installButton.hidden = true;
  if (result.outcome === "accepted") {
    elements.installHint.textContent = "설치가 완료되면 홈 화면의 말씀영어 아이콘으로 열 수 있습니다.";
  }
});

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  elements.installButton.hidden = false;
  elements.installHint.textContent = "이 기기에서는 설치 버튼을 눌러 홈 화면에 바로 추가할 수 있습니다.";
  renderSetupStatus();
});

window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  elements.installButton.hidden = true;
  elements.installHint.textContent = "홈 화면의 말씀영어 아이콘으로 다시 열 수 있습니다.";
  renderSetupStatus();
});

elements.copyButton.addEventListener("click", async () => {
  const pair = getDailyPair();
  const source = bibleSources[state.version];
  const text = [
    `[${formatDate(state.selectedDate)}]`,
    `말씀: ${pair.scripture.reference} (${source.label})`,
    pair.scripture.text,
    `초점: ${pair.scripture.focus}`,
    `영어: ${pair.expression.phrase} - ${pair.expression.meaning}`,
    formatExpressionExample(pair.expression),
  ].join("\n");

  try {
    await navigator.clipboard.writeText(text);
    setMessage("오늘 카드를 복사했습니다.");
  } catch {
    setMessage("복사 권한이 없어 메모 칸에 내용을 넣었습니다.");
    elements.noteInput.value = text;
  }
});

registerServiceWorker();
render();

function render() {
  const pair = getDailyPair();
  const source = bibleSources[state.version];
  const note = state.notes[dateKey(state.selectedDate)]?.note || "";

  elements.weekdayLabel.textContent = new Intl.DateTimeFormat("ko-KR", { weekday: "long" }).format(state.selectedDate);
  elements.dateLabel.textContent = formatDate(state.selectedDate);
  elements.verseReference.textContent = pair.scripture.reference;
  elements.verseFocus.textContent = pair.scripture.text;
  elements.versePrompt.textContent = `${pair.scripture.focus} ${pair.scripture.prompt}`;
  elements.primaryBibleLink.href = source.link;
  elements.primaryBibleLink.textContent = `${source.source} 보기`;
  elements.versionLabel.textContent = source.label;
  elements.expressionPhrase.textContent = pair.expression.phrase;
  elements.expressionMeaning.textContent = pair.expression.meaning;
  renderExpressionExample(pair.expression.example);
  elements.expressionTip.textContent = pair.expression.tip;
  elements.noteInput.value = note;
  elements.versionButtons.forEach((button) => button.classList.toggle("active", button.dataset.version === state.version));
  setMessage("");
  renderReminderStatus();
  renderSetupStatus();
}

function renderExpressionExample(example) {
  const lines = Array.isArray(example) ? example : [{ speaker: "", text: example, translation: "" }];
  elements.expressionExample.innerHTML = "";
  for (const line of lines) {
    const row = document.createElement("p");
    row.className = "dialogue-line";
    const speaker = document.createElement("strong");
    speaker.textContent = line.speaker || "•";
    const textGroup = document.createElement("span");
    textGroup.className = "dialogue-text";
    const english = document.createElement("span");
    english.className = "dialogue-english";
    english.textContent = line.text;
    textGroup.append(english);
    if (line.translation) {
      const translation = document.createElement("span");
      translation.className = "dialogue-translation";
      translation.textContent = line.translation;
      textGroup.append(translation);
    }
    row.append(speaker, textGroup);
    elements.expressionExample.append(row);
  }
}

function formatExpressionExample(expression) {
  const lines = Array.isArray(expression.example) ? expression.example : [{ speaker: "", text: expression.example }];
  return [
    `예문:`,
    ...lines.map((line) => {
      const speaker = line.speaker ? `${line.speaker}: ` : "";
      const translation = line.translation ? ` (${line.translation})` : "";
      return `${speaker}${line.text}${translation}`;
    }),
  ].join("\n");
}

function getDailyPair() {
  const index = dayIndex(state.selectedDate);
  return {
    scripture: scriptures[index % scriptures.length],
    expression: expressions[(index * 7) % expressions.length],
  };
}

function dayIndex(date) {
  return Math.floor((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - START_DAY) / DAY_IN_MS);
}

function startOfLocalDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return startOfLocalDay(next);
}

function dateKey(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function formatDate(date) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function loadNotes() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function persistNotes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.notes));
}

function setMessage(message) {
  elements.saveMessage.textContent = message;
}


function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch((error) => {
      console.warn("Service worker registration failed", error);
    });
  });
}


function loadSetupDismissed() {
  return localStorage.getItem(SETUP_DISMISSED_KEY) === "true";
}

function persistSetupDismissed() {
  localStorage.setItem(SETUP_DISMISSED_KEY, String(state.setupDismissed));
}

function isAppInstalled() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

function loadReminders() {
  try {
    return JSON.parse(localStorage.getItem(REMINDER_STORAGE_KEY)) || {
      morning: true,
      lunch: false,
      evening: true,
    };
  } catch {
    return { morning: true, lunch: false, evening: true };
  }
}

function persistReminders() {
  localStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(state.reminders));
}

function renderReminderStatus() {
  elements.reminderInputs.forEach((input) => {
    input.checked = Boolean(state.reminders[input.value]);
  });

  if (!("Notification" in window)) {
    elements.notificationButton.disabled = true;
    elements.localNotificationButton.disabled = true;
    elements.testNotificationButton.disabled = true;
    elements.unsubscribeButton.disabled = true;
    setNotificationStatus("이 브라우저는 알림을 지원하지 않습니다.");
    renderSetupStatus();
    return;
  }

  const selectedCount = Object.values(state.reminders).filter(Boolean).length;
  const suffix = selectedCount ? `${selectedCount}개 시간 선택됨` : "알림 시간 미선택";
  if (Notification.permission === "granted") {
    elements.notificationButton.textContent = "알림 허용됨";
    elements.notificationButton.disabled = true;
    elements.localNotificationButton.disabled = false;
    elements.testNotificationButton.disabled = false;
    elements.unsubscribeButton.disabled = false;
    setNotificationStatus(suffix);
  } else if (Notification.permission === "denied") {
    elements.notificationButton.textContent = "알림 차단됨";
    elements.notificationButton.disabled = true;
    elements.localNotificationButton.disabled = true;
    elements.testNotificationButton.disabled = true;
    elements.unsubscribeButton.disabled = false;
    setNotificationStatus("브라우저 설정에서 알림을 다시 켜야 합니다.");
  } else {
    elements.notificationButton.textContent = "알림 허용";
    elements.notificationButton.disabled = false;
    elements.localNotificationButton.disabled = true;
    elements.testNotificationButton.disabled = true;
    elements.unsubscribeButton.disabled = false;
    setNotificationStatus(suffix);
  }
  renderSetupStatus();
}

function renderSetupStatus() {
  if (!elements.setupPanel) return;
  elements.setupPanel.hidden = state.setupDismissed;
  if (state.setupDismissed) return;

  const selectedCount = Object.values(state.reminders).filter(Boolean).length;
  const installed = isAppInstalled();
  const permission = "Notification" in window ? Notification.permission : "unsupported";
  const canInstallPrompt = Boolean(deferredInstallPrompt);

  setSetupStep("install", installed ? "done" : "ready", installed ? "완료" : canInstallPrompt ? "가능" : "대기", installed ? "홈 화면에서 열 수 있습니다." : canInstallPrompt ? "설치 버튼으로 홈 화면에 추가할 수 있습니다." : "링크를 공유하거나 브라우저 메뉴에서 추가합니다.", installed ? "완료" : canInstallPrompt ? "설치" : "공유", installed);

  setSetupStep("notify", permission === "granted" ? "done" : permission === "denied" ? "blocked" : "ready", permission === "granted" ? "완료" : permission === "denied" ? "차단" : "대기", permission === "granted" ? "이 기기의 알림 권한이 켜졌습니다." : permission === "denied" ? "브라우저 설정에서 알림을 다시 켜야 합니다." : "알림 허용을 누르면 이 기기에 등록됩니다.", permission === "granted" ? "완료" : "허용", permission !== "default");

  setSetupStep("time", selectedCount ? "done" : "ready", selectedCount ? "완료" : "대기", selectedCount ? `${selectedCount}개 시간이 선택되어 있습니다.` : "받고 싶은 시간대를 하나 이상 선택합니다.", "선택", false);

  setSetupStep("test", permission === "granted" ? "ready" : "blocked", permission === "granted" ? "확인" : "대기", permission === "granted" ? "테스트 알림으로 실제 표시를 확인합니다." : "알림 허용 후 테스트할 수 있습니다.", "테스트", permission !== "granted");
}

function setSetupStep(name, stateName, statusText, copy, actionText, disabled) {
  const step = elements.setupSteps.find((item) => item.dataset.setupStep === name);
  const status = elements.setupStatuses.find((item) => item.dataset.setupStatus === name);
  const copyNode = elements.setupCopies.find((item) => item.dataset.setupCopy === name);
  const action = elements[`setup${name[0].toUpperCase()}${name.slice(1)}Action`];
  if (!step || !status || !copyNode || !action) return;

  step.classList.toggle("done", stateName === "done");
  step.classList.toggle("blocked", stateName === "blocked");
  step.classList.toggle("ready", stateName === "ready");
  status.textContent = statusText;
  copyNode.textContent = copy;
  action.textContent = actionText;
  action.disabled = Boolean(disabled);
}

async function renderNotificationDiagnostics() {
  const permissionApiState = await getNotificationPermissionApiState();
  const platform = navigator.userAgentData?.platform || navigator.platform || "unknown";
  const diagnostics = [
    ["permission", "Notification" in window ? Notification.permission : "unsupported"],
    ["permissionApi", permissionApiState],
    ["secure", window.isSecureContext ? "yes" : "no"],
    ["serviceWorker", "serviceWorker" in navigator ? "yes" : "no"],
    ["controller", navigator.serviceWorker?.controller ? "yes" : "no"],
    ["visibility", document.visibilityState],
    ["platform", platform],
    ["version", APP_VERSION],
  ];
  elements.notificationDiagnostics.innerHTML = "";
  for (const [label, value] of diagnostics) {
    const item = document.createElement("span");
    item.textContent = `${label}: ${value}`;
    elements.notificationDiagnostics.append(item);
  }
}

async function getNotificationPermissionApiState() {
  if (!navigator.permissions?.query) return "unsupported";
  try {
    const status = await navigator.permissions.query({ name: "notifications" });
    return status.state;
  } catch {
    return "unavailable";
  }
}

function showScreenToast(message) {
  elements.screenToast.hidden = false;
  elements.screenToast.textContent = `${new Date().toLocaleTimeString("ko-KR")} · ${message}`;
}

function setNotificationStatus(message) {
  elements.notificationStatus.textContent = message;
}


function ensureNotificationReady() {
  if (!("Notification" in window)) {
    setNotificationStatus("이 브라우저는 알림을 지원하지 않습니다.");
    return false;
  }
  if (Notification.permission !== "granted") {
    setNotificationStatus("먼저 알림을 허용해주세요.");
    return false;
  }
  return true;
}

async function sendServerTestPush() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) throw new Error("Push is not supported");
  const publicKey = await getPushPublicKey();
  if (!publicKey) throw new Error("VAPID public key is not configured");
  const registration = await navigator.serviceWorker.ready;
  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
  }

  const response = await fetch("/api/push-test", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ subscription }),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "Server push test failed");
  }
}

async function showLocalTestNotifications() {
  const pair = getDailyPair();
  const body = `${pair.scripture.reference} ${pair.scripture.text}`;
  try {
    new Notification("Chrome 직접 알림 · 말씀영어", {
      body,
      icon: "./icons/icon.svg",
      tag: `direct-test-${Date.now()}`,
      requireInteraction: true,
      silent: false,
    });
  } catch (error) {
    console.warn(error);
  }

  const registration = await navigator.serviceWorker?.ready;
  if (registration) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    await registration.showNotification("서비스워커 알림 · 말씀영어", {
      body,
      icon: "./icons/icon.svg",
      badge: "./icons/icon.svg",
      tag: `sw-test-${Date.now()}`,
      requireInteraction: true,
      silent: false,
      data: { url: "./" },
    });
  }
}

async function unsubscribeFromPush() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) return;

  const endpoint = subscription.endpoint;
  await subscription.unsubscribe();
  await fetch("/api/push-subscriptions", {
    method: "DELETE",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ endpoint }),
  }).catch(() => {});
}

async function syncPushSubscription() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || Notification.permission !== "granted") return;
  const publicKey = await getPushPublicKey();
  if (!publicKey) {
    setNotificationStatus("배포 환경에 VAPID 공개키가 아직 설정되지 않았습니다.");
    return;
  }

  const registration = await navigator.serviceWorker.ready;
  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
  }

  const response = await fetch("/api/push-subscriptions", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      subscription,
      preferences: state.reminders,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Seoul",
      userAgent: navigator.userAgent,
    }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "Push subscription failed");
  }
  setNotificationStatus("정기 알림 구독이 저장되었습니다.");
}

async function getPushPublicKey() {
  if (pushPublicKey !== null) return pushPublicKey;
  try {
    const response = await fetch("/api/push-public-key");
    if (!response.ok) throw new Error("missing public key endpoint");
    const data = await response.json();
    pushPublicKey = data.publicKey || "";
    return pushPublicKey;
  } catch {
    pushPublicKey = "";
    return "";
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}


function getShareUrl() {
  const url = new URL(window.location.href);
  if (!url.pathname.endsWith("/daily-verse/")) url.pathname = "/daily-verse/";
  url.search = "";
  url.hash = "";
  return url.href;
}
