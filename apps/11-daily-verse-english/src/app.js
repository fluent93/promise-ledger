const DAY_IN_MS = 86_400_000;
const START_DAY = Date.UTC(2026, 0, 1);
const STORAGE_KEY = "daily-verse-english:v1";
const REMINDER_STORAGE_KEY = "daily-verse-english:reminders:v1";
const SETUP_DISMISSED_KEY = "daily-verse-english:setup-dismissed:v1";
const APP_VERSION = "0.13";

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
    phrase: "That tracks.",
    meaning: "말이 되네, 앞뒤가 맞네.",
    example: [
      { speaker: "A", text: "She pushed the deadline because the client changed the scope." },
      { speaker: "B", text: "That tracks. The original timeline was already tight." },
    ],
    tip: "That makes sense보다 더 담백하고 구어적인 표현입니다. 설명을 듣고 논리적으로 납득될 때 씁니다.",
  },
  {
    phrase: "I wouldn't read too much into it.",
    meaning: "거기에 너무 큰 의미를 두지는 않을 것 같아.",
    example: [
      { speaker: "A", text: "He sounded a little short in his reply." },
      { speaker: "B", text: "I wouldn't read too much into it. He may just be busy." },
    ],
    tip: "상대가 과해석하는 흐름을 부드럽게 낮출 때 좋습니다. 이유를 붙이면 더 자연스럽습니다.",
  },
  {
    phrase: "Let's not get ahead of ourselves.",
    meaning: "너무 앞서가지는 말자.",
    example: [
      { speaker: "A", text: "If this works, we could turn it into a full product." },
      { speaker: "B", text: "Maybe, but let's not get ahead of ourselves. We need a working pilot first." },
    ],
    tip: "기대감은 인정하되 아직 검증이 필요하다고 말할 때 쓰는 표현입니다.",
  },
  {
    phrase: "I'm still trying to wrap my head around it.",
    meaning: "아직 이해하려고 정리 중이야.",
    example: [
      { speaker: "A", text: "Do you have an opinion on the new pricing model?" },
      { speaker: "B", text: "Not yet. I'm still trying to wrap my head around it." },
    ],
    tip: "모른다고 딱 자르기보다 복잡한 내용을 소화 중이라는 뉘앙스를 줍니다.",
  },
  {
    phrase: "There's a bit of a disconnect.",
    meaning: "서로 어긋나는 부분이 좀 있어.",
    example: [
      { speaker: "A", text: "The team says quality matters, but the deadline keeps moving up." },
      { speaker: "B", text: "Right. There's a bit of a disconnect between the goal and the timeline." },
    ],
    tip: "문제 제기 표현이지만 공격적이지 않습니다. expectations, messaging, priorities와 자주 어울립니다.",
  },
  {
    phrase: "We may be talking past each other.",
    meaning: "우리 서로 다른 얘기를 하고 있는 것 같아.",
    example: [
      { speaker: "A", text: "I'm talking about the user experience, not the backend implementation." },
      { speaker: "B", text: "Got it. We may be talking past each other." },
    ],
    tip: "논쟁이 꼬일 때 대화를 재정렬하는 고급 표현입니다.",
  },
  {
    phrase: "I don't want to overcommit.",
    meaning: "무리하게 약속하고 싶지는 않아.",
    example: [
      { speaker: "A", text: "Can you finish both versions by Friday?" },
      { speaker: "B", text: "I can try, but I don't want to overcommit." },
    ],
    tip: "거절은 아니지만 책임 있게 기대치를 조정하는 표현입니다.",
  },
  {
    phrase: "The timing is less than ideal.",
    meaning: "타이밍이 썩 좋지는 않아.",
    example: [
      { speaker: "A", text: "They want feedback by tomorrow morning." },
      { speaker: "B", text: "The timing is less than ideal, but we can send a short version." },
    ],
    tip: "bad timing보다 완곡하고 직장/공식 상황에서도 쓰기 좋습니다.",
  },
  {
    phrase: "It depends on what we're optimizing for.",
    meaning: "우리가 뭘 우선하느냐에 달려 있어.",
    example: [
      { speaker: "A", text: "Should we make it simpler or more powerful?" },
      { speaker: "B", text: "It depends on what we're optimizing for: adoption or depth." },
    ],
    tip: "단순 찬반보다 기준을 먼저 세울 때 쓰는 표현입니다. 전략 대화에 자주 어울립니다.",
  },
  {
    phrase: "I'm not convinced that's the right trade-off.",
    meaning: "그 절충이 맞는지는 아직 확신이 안 서.",
    example: [
      { speaker: "A", text: "We can save time by cutting the onboarding steps." },
      { speaker: "B", text: "I'm not convinced that's the right trade-off." },
    ],
    tip: "반대 의견을 단정적으로 밀어붙이지 않고 판단 기준을 다시 보자는 느낌을 줍니다.",
  },
  {
    phrase: "Let's pressure-test the idea.",
    meaning: "그 아이디어를 한번 빡세게 검증해보자.",
    example: [
      { speaker: "A", text: "I think families would actually use this every morning." },
      { speaker: "B", text: "Let's pressure-test the idea with three real users first." },
    ],
    tip: "아이디어를 비판하자는 뜻이 아니라 약점을 찾아 더 탄탄하게 만들자는 표현입니다.",
  },
  {
    phrase: "That's a fair point, but...",
    meaning: "그 말도 일리는 있는데...",
    example: [
      { speaker: "A", text: "We should keep the interface simple for older users." },
      { speaker: "B", text: "That's a fair point, but we still need a clear way to manage reminders." },
    ],
    tip: "상대 의견을 인정한 뒤 다른 관점을 제시할 때 유용합니다. but 뒤에는 구체적인 우려를 붙이세요.",
  },
  {
    phrase: "I see where you're coming from.",
    meaning: "네가 왜 그렇게 생각하는지는 알겠어.",
    example: [
      { speaker: "A", text: "I don't think we should add more features yet." },
      { speaker: "B", text: "I see where you're coming from. My concern is retention." },
    ],
    tip: "동의한다는 뜻은 아닙니다. 상대의 관점을 이해한다는 신호라 갈등을 낮춰줍니다.",
  },
  {
    phrase: "Can we take a step back?",
    meaning: "잠깐 한 발 물러서서 볼 수 있을까?",
    example: [
      { speaker: "A", text: "We're stuck on the button text again." },
      { speaker: "B", text: "Can we take a step back? What problem are we trying to solve?" },
    ],
    tip: "세부 논쟁에서 목적/맥락으로 돌아가고 싶을 때 자연스럽습니다.",
  },
  {
    phrase: "That feels like a stretch.",
    meaning: "그건 좀 무리한 해석/주장 같아.",
    example: [
      { speaker: "A", text: "One user complained, so the whole concept is broken." },
      { speaker: "B", text: "That feels like a stretch. We need more data." },
    ],
    tip: "상대 주장을 직접 틀렸다고 하기보다 과장된 느낌을 지적하는 표현입니다.",
  },
  {
    phrase: "I'm inclined to agree.",
    meaning: "나도 대체로 동의하는 쪽이야.",
    example: [
      { speaker: "A", text: "We should keep the first version focused." },
      { speaker: "B", text: "I'm inclined to agree, especially for a family audience." },
    ],
    tip: "완전한 확신보다는 동의 쪽으로 기울어 있다는 미묘한 표현입니다.",
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
  const lines = Array.isArray(example) ? example : [{ speaker: "", text: example }];
  elements.expressionExample.innerHTML = "";
  for (const line of lines) {
    const row = document.createElement("p");
    row.className = "dialogue-line";
    const speaker = document.createElement("strong");
    speaker.textContent = line.speaker || "•";
    const text = document.createElement("span");
    text.textContent = line.text;
    row.append(speaker, text);
    elements.expressionExample.append(row);
  }
}

function formatExpressionExample(expression) {
  const lines = Array.isArray(expression.example) ? expression.example : [{ speaker: "", text: expression.example }];
  return [`예문:`, ...lines.map((line) => `${line.speaker ? `${line.speaker}: ` : ""}${line.text}`)].join("\n");
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
