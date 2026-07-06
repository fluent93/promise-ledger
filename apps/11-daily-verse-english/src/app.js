import { advancedExpressions } from "./expression-data.js?v=0.20";

const STORAGE_KEY = "daily-verse-english:v1";
const REMINDER_STORAGE_KEY = "daily-verse-english:reminders:v1";
const SETUP_DISMISSED_KEY = "daily-verse-english:setup-dismissed:v1";
const NOTE_OWNER_STORAGE_KEY = "daily-verse-english:note-owner:v1";
const APP_VERSION = "0.20";

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
  {
    reference: "여호수아 1:9",
    text: "내가 네게 명한 것이 아니냐 마음을 강하게 하고 담대히 하라 두려워 말며 놀라지 말라 네가 어디로 가든지 네 하나님 여호와가 너와 함께 하느니라 하시니라",
    focus: "담대함은 상황이 쉬워서가 아니라 함께하심을 믿어서 나옵니다.",
    prompt: "오늘 피하고 싶은 일 하나를 적고, 첫 행동을 작게 정해보세요.",
  },
  {
    reference: "시편 121:1-2",
    text: "내가 산을 향하여 눈을 들리라 나의 도움이 어디서 올꼬 나의 도움이 천지를 지으신 여호와에게서로다",
    focus: "도움을 찾는 시선을 다시 하나님께 돌리는 하루.",
    prompt: "도움이 필요한 일을 하나 정하고, 사람에게 말하기 전에 짧게 기도해보세요.",
  },
  {
    reference: "이사야 40:31",
    text: "오직 여호와를 앙망하는 자는 새 힘을 얻으리니 독수리의 날개치며 올라감 같을 것이요 달음박질하여도 곤비치 아니하겠고 걸어가도 피곤치 아니하리로다",
    focus: "속도를 내기 전에 새 힘을 받는 방향을 선택하기.",
    prompt: "오늘 무리해서 밀어붙이는 일 하나에 쉼표를 찍어보세요.",
  },
  {
    reference: "미가 6:8",
    text: "사람아 주께서 선한 것이 무엇임을 네게 보이셨나니 여호와께서 네게 구하시는 것이 오직 공의를 행하며 인자를 사랑하며 겸손히 네 하나님과 함께 행하는 것이 아니냐",
    focus: "크게 보이는 성취보다 바르게 걷는 태도를 붙들기.",
    prompt: "오늘 공의, 인자, 겸손 중 하나를 실제 행동으로 옮길 장면을 정해보세요.",
  },
  {
    reference: "마태복음 5:16",
    text: "이같이 너희 빛을 사람 앞에 비취게 하여 저희로 너희 착한 행실을 보고 하늘에 계신 너희 아버지께 영광을 돌리게 하라",
    focus: "보이기 위한 선행이 아니라 하나님께 향하게 하는 빛으로 살기.",
    prompt: "오늘 누군가에게 조용히 도움이 되는 행동 하나를 해보세요.",
  },
  {
    reference: "마태복음 11:28",
    text: "수고하고 무거운 짐진 자들아 다 내게로 오라 내가 너희를 쉬게 하리라",
    focus: "무거움을 혼자 들고 버티는 대신 주님께 가지고 가기.",
    prompt: "오늘 마음에 남은 피로를 한 문장으로 쓰고 기도로 내려놓아보세요.",
  },
  {
    reference: "누가복음 6:31",
    text: "남에게 대접을 받고자 하는대로 너희도 남을 대접하라",
    focus: "내가 받고 싶은 존중을 먼저 건네는 연습.",
    prompt: "오늘 대화 하나에서 내가 원하는 말투를 먼저 사용해보세요.",
  },
  {
    reference: "요한복음 14:27",
    text: "평안을 너희에게 끼치노니 곧 나의 평안을 너희에게 주노라 내가 너희에게 주는 것은 세상이 주는 것 같지 아니하니라 너희는 마음에 근심도 말고 두려워하지도 말라",
    focus: "상황이 주는 안정과 주님이 주시는 평안을 구분하기.",
    prompt: "오늘 불안을 키우는 정보를 하나 줄이고 평안을 선택할 시간을 만들어보세요.",
  },
  {
    reference: "로마서 8:28",
    text: "우리가 알거니와 하나님을 사랑하는 자 곧 그 뜻대로 부르심을 입은 자들에게는 모든 것이 합력하여 선을 이루느니라",
    focus: "아직 이해되지 않는 일도 선으로 엮으시는 하나님을 신뢰하기.",
    prompt: "최근 마음에 걸리는 일을 하나 적고, 지금 보이는 작은 선한 조각을 찾아보세요.",
  },
  {
    reference: "로마서 12:12",
    text: "소망 중에 즐거워하며 환난 중에 참으며 기도에 항상 힘쓰며",
    focus: "소망, 인내, 기도를 하루의 리듬으로 삼기.",
    prompt: "오늘 힘든 순간에 반복할 짧은 기도문을 하나 만들어보세요.",
  },
  {
    reference: "갈라디아서 6:9",
    text: "우리가 선을 행하되 낙심하지 말지니 피곤하지 아니하면 때가 이르매 거두리라",
    focus: "당장 보상받지 못해도 선한 일을 멈추지 않기.",
    prompt: "최근 지친 선한 습관 하나를 오늘만 다시 해보세요.",
  },
  {
    reference: "에베소서 4:32",
    text: "서로 인자하게 하며 불쌍히 여기며 서로 용서하기를 하나님이 그리스도 안에서 너희를 용서하심과 같이 하라",
    focus: "용서는 감정을 무시하는 일이 아니라 받은 은혜를 기억하는 일.",
    prompt: "오늘 마음이 딱딱해지는 사람을 떠올리고, 그를 위한 짧은 기도를 해보세요.",
  },
  {
    reference: "빌립보서 2:3-4",
    text: "아무 일에든지 다툼이나 허영으로 하지 말고 오직 겸손한 마음으로 각각 자기보다 남을 낫게 여기고 각각 자기 일을 돌아볼뿐더러 또한 각각 다른 사람들의 일을 돌아보아",
    focus: "내 입장만 크게 만드는 마음에서 한 걸음 물러서기.",
    prompt: "오늘 회의나 대화에서 다른 사람의 필요를 먼저 묻는 질문을 해보세요.",
  },
  {
    reference: "골로새서 3:15",
    text: "그리스도의 평강이 너희 마음을 주장하게 하라 평강을 위하여 너희가 한 몸으로 부르심을 받았나니 또한 너희는 감사하는 자가 되라",
    focus: "마음의 주도권을 불안이 아니라 그리스도의 평강에 맡기기.",
    prompt: "오늘 마음을 흔드는 생각이 오면 감사 세 가지를 적어보세요.",
  },
  {
    reference: "데살로니가전서 5:16-18",
    text: "항상 기뻐하라 쉬지 말고 기도하라 범사에 감사하라 이는 그리스도 예수 안에서 너희를 향하신 하나님의 뜻이니라",
    focus: "기쁨과 기도와 감사는 기분보다 깊은 선택입니다.",
    prompt: "오늘 감사 하나를 바로 메시지나 메모로 남겨보세요.",
  },
  {
    reference: "디모데후서 1:7",
    text: "하나님이 우리에게 주신 것은 두려워하는 마음이 아니요 오직 능력과 사랑과 근신하는 마음이니",
    focus: "두려움 대신 능력, 사랑, 절제의 마음으로 반응하기.",
    prompt: "오늘 두려움이 올라오는 순간에 사랑으로 할 수 있는 행동을 하나 고르세요.",
  },
  {
    reference: "히브리서 4:16",
    text: "그러므로 우리가 긍휼하심을 받고 때를 따라 돕는 은혜를 얻기 위하여 은혜의 보좌 앞에 담대히 나아갈 것이니라",
    focus: "부족함이 기도를 막는 이유가 아니라 은혜 앞으로 가는 이유가 됩니다.",
    prompt: "오늘 미루던 기도 제목 하나를 솔직한 문장으로 꺼내보세요.",
  },
  {
    reference: "히브리서 10:24",
    text: "서로 돌아보아 사랑과 선행을 격려하며",
    focus: "믿음은 혼자 버티는 힘만이 아니라 서로 격려하는 관계입니다.",
    prompt: "오늘 한 사람에게 짧은 격려 메시지를 보내보세요.",
  },
  {
    reference: "베드로전서 5:7",
    text: "너희 염려를 다 주께 맡겨 버리라 이는 저가 너희를 권고하심이니라",
    focus: "염려를 맡길 수 있는 이유는 하나님이 돌보시기 때문입니다.",
    prompt: "오늘 가장 큰 염려를 적고, 그 옆에 맡긴다는 표시를 해보세요.",
  },
  {
    reference: "요한일서 4:18",
    text: "사랑 안에 두려움이 없고 온전한 사랑이 두려움을 내어쫓나니 두려움에는 형벌이 있음이라 두려워하는 자는 사랑 안에서 온전히 이루지 못하였느니라",
    focus: "두려움을 이기는 힘은 더 큰 통제가 아니라 더 온전한 사랑입니다.",
    prompt: "오늘 두려움으로 미루는 말이나 행동을 사랑의 방식으로 바꿔보세요.",
  },
];

const expressions = advancedExpressions;

const state = {
  selectedDate: startOfLocalDay(new Date()),
  version: "krv",
  notes: loadNotes(),
  noteOwnerId: loadNoteOwnerId(),
  noteRecords: [],
  noteSearch: "",
  reminders: loadReminders(),
  setupDismissed: loadSetupDismissed(),
  currentPair: null,
  currentPairKey: "",
  currentPairError: "",
  currentPairErrorKey: "",
  currentPairRequestId: 0,
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
  expressionScene: document.querySelector("#expressionScene"),
  expressionPatterns: document.querySelector("#expressionPatterns"),
  expressionDrills: document.querySelector("#expressionDrills"),
  noteInput: document.querySelector("#noteInput"),
  favoriteButton: document.querySelector("#favoriteButton"),
  noteRefreshButton: document.querySelector("#noteRefreshButton"),
  noteCodeButton: document.querySelector("#noteCodeButton"),
  noteSearchInput: document.querySelector("#noteSearchInput"),
  noteSearchButton: document.querySelector("#noteSearchButton"),
  noteList: document.querySelector("#noteList"),
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

elements.favoriteButton.addEventListener("click", async () => {
  const key = dateKey(state.selectedDate);
  const pair = getDailyPair();
  const note = elements.noteInput.value.trim();
  const savedAt = new Date().toISOString();
  state.notes[key] = {
    note,
    savedAt,
    version: state.version,
  };
  if (!note) delete state.notes[key];
  persistNotes();
  setMessage("저장 중입니다...");

  try {
    await saveRemoteNote({ key, note, pair, savedAt });
    setMessage(note ? "DB에 저장했습니다." : "DB에서 삭제했습니다.");
    await loadRemoteNotes();
  } catch (error) {
    console.warn(error);
    setMessage("이 기기에는 저장했습니다. 서버 저장은 잠시 후 다시 시도해주세요.");
    renderNoteList();
  }
});

elements.noteRefreshButton?.addEventListener("click", () => {
  loadRemoteNotes().catch((error) => {
    console.warn(error);
    setMessage("기록을 불러오지 못했습니다.");
  });
});

elements.noteCodeButton?.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(state.noteOwnerId);
    setMessage("기록 코드를 복사했습니다.");
  } catch {
    setMessage(`기록 코드: ${state.noteOwnerId}`);
  }
});

elements.noteSearchButton?.addEventListener("click", () => {
  state.noteSearch = elements.noteSearchInput.value.trim();
  loadRemoteNotes().catch((error) => {
    console.warn(error);
    setMessage("검색하지 못했습니다.");
  });
});

elements.noteSearchInput?.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  state.noteSearch = elements.noteSearchInput.value.trim();
  loadRemoteNotes().catch((error) => {
    console.warn(error);
    setMessage("검색하지 못했습니다.");
  });
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
    formatExpressionSupport(pair.expression),
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
initializeRemoteNotes();

function render() {
  const key = dateKey(state.selectedDate);
  const pair = getDailyPair();
  const source = bibleSources[state.version];
  const note = state.notes[key]?.note || "";
  const generationError = state.currentPairErrorKey === key ? state.currentPairError : "";

  elements.weekdayLabel.textContent = new Intl.DateTimeFormat("ko-KR", { weekday: "long" }).format(state.selectedDate);
  elements.dateLabel.textContent = formatDate(state.selectedDate);
  elements.verseReference.textContent = generationError ? "생성 실패" : pair.scripture.reference;
  elements.verseFocus.textContent = generationError ? "오늘 말씀을 새로 생성하지 못했습니다." : pair.scripture.text;
  elements.versePrompt.textContent = generationError ? generationError : `${pair.scripture.focus} ${pair.scripture.prompt}`;
  elements.primaryBibleLink.href = source.link;
  elements.primaryBibleLink.textContent = `${source.source} 보기`;
  elements.versionLabel.textContent = source.label;
  elements.expressionPhrase.textContent = pair.expression.phrase;
  elements.expressionMeaning.textContent = pair.expression.meaning;
  renderExpressionExample(pair.expression.example);
  elements.expressionTip.textContent = pair.expression.tip;
  renderExpressionSupport(pair.expression);
  elements.noteInput.value = note;
  elements.versionButtons.forEach((button) => button.classList.toggle("active", button.dataset.version === state.version));
  setMessage("");
  renderReminderStatus();
  renderSetupStatus();
  renderNoteList();
  if (!generationError) {
    loadDynamicPairForSelectedDate().catch((error) => {
      console.warn(error);
      state.currentPairErrorKey = dateKey(state.selectedDate);
      state.currentPairError = error.message || "OpenAI 생성 설정을 확인해주세요.";
      render();
    });
  }
}

async function loadDynamicPairForSelectedDate() {
  const key = dateKey(state.selectedDate);
  if (state.currentPairKey === key && state.currentPair) return;
  if (state.currentPairErrorKey === key && state.currentPairError) return;

  const requestId = state.currentPairRequestId + 1;
  state.currentPairRequestId = requestId;
  const response = await fetch("/api/daily-verse-data?date=" + encodeURIComponent(key));
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.scripture || !payload.expression) throw new Error(payload.message || payload.error || "Failed to load daily lesson");
  if (requestId !== state.currentPairRequestId || dateKey(state.selectedDate) !== key) return;

  state.currentPair = { scripture: payload.scripture, expression: payload.expression, generated: payload.generated, cached: payload.cached };
  state.currentPairKey = key;
  state.currentPairError = "";
  state.currentPairErrorKey = "";
  render();
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

function renderExpressionSupport(expression) {
  if (!elements.expressionScene || !elements.expressionPatterns || !elements.expressionDrills) return;
  elements.expressionScene.textContent = expression.scene || "미드나 영화의 친구, 가족, 직장 대화처럼 바로 반응해야 하는 장면에 잘 맞습니다.";
  renderExpressionList(elements.expressionPatterns, expression.patterns || buildExpressionPatterns(expression));
  renderExpressionList(elements.expressionDrills, expression.drills || buildExpressionDrills(expression));
}

function renderExpressionList(element, items) {
  element.innerHTML = "";
  for (const item of items) {
    const li = document.createElement("li");
    li.textContent = item;
    element.append(li);
  }
}

function buildExpressionPatterns(expression) {
  return [
    expression.phrase,
    expression.phrase + " What do you think?",
    "I mean, " + expression.phrase,
  ];
}

function buildExpressionDrills(expression) {
  return [
    "A: What happened? B: " + expression.phrase,
    expression.phrase + " + 이유 한 문장 붙이기",
    "오늘 실제 대화에 맞춰 " + expression.phrase + "로 시작해보기",
    "같은 뜻을 더 부드럽게 한 번 바꿔 말해보기",
  ];
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

function formatExpressionSupport(expression) {
  const scene = expression.scene || "짧게 주고받는 대화 장면에서 자연스럽게 쓸 수 있습니다.";
  const patterns = expression.patterns || buildExpressionPatterns(expression);
  const drills = expression.drills || buildExpressionDrills(expression);
  return [
    "사용 장면: " + scene,
    "응용:",
    ...patterns.map((item) => "- " + item),
    "연습:",
    ...drills.map((item) => "- " + item),
  ].join("\n");
}

function getDailyPair() {
  const key = dateKey(state.selectedDate);
  if (state.currentPairKey === key && state.currentPair) return state.currentPair;
  return getDailyPairForDate(state.selectedDate);
}

function getDailyPairForDate(date) {
  const index = hashString(dateKey(date));
  return {
    scripture: scriptures[positiveModulo(index, scriptures.length)],
    expression: expressions[positiveModulo(index * 7, expressions.length)],
  };
}

function hashString(value) {
  let hash = 0;
  for (const char of String(value || "")) hash = ((hash * 31) + char.charCodeAt(0)) | 0;
  return hash;
}

function positiveModulo(value, divisor) {
  return ((value % divisor) + divisor) % divisor;
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

function loadNoteOwnerId() {
  const existing = localStorage.getItem(NOTE_OWNER_STORAGE_KEY);
  if (existing) return existing;
  const ownerId = createNoteOwnerId();
  localStorage.setItem(NOTE_OWNER_STORAGE_KEY, ownerId);
  return ownerId;
}

function createNoteOwnerId() {
  if (crypto.randomUUID) return crypto.randomUUID().replace(/-/g, "");
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function initializeRemoteNotes() {
  try {
    await syncLocalNotesToRemote();
    await loadRemoteNotes();
  } catch (error) {
    console.warn(error);
    renderNoteList();
  }
}

async function syncLocalNotesToRemote() {
  const entries = Object.entries(state.notes).filter(([, value]) => value?.note);
  for (const [key, value] of entries) {
    const pair = getDailyPairForDate(parseDateKey(key));
    await saveRemoteNote({ key, note: value.note, pair, savedAt: value.savedAt || new Date().toISOString() });
  }
}

async function loadRemoteNotes() {
  const url = new URL("/api/notes", window.location.origin);
  if (state.noteSearch) url.searchParams.set("q", state.noteSearch);
  url.searchParams.set("limit", "100");
  const response = await fetch(url, { headers: { "x-note-owner": state.noteOwnerId } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Failed to load notes");
  state.noteRecords = Array.isArray(data.notes) ? data.notes : [];
  for (const record of state.noteRecords) {
    if (!record?.dateKey || !record.note) continue;
    state.notes[record.dateKey] = {
      note: record.note,
      savedAt: record.savedAt || record.updatedAt,
      version: record.version || state.version,
    };
  }
  persistNotes();
  renderNoteList();
}

async function saveRemoteNote({ key, note, pair, savedAt }) {
  const response = await fetch("/api/notes", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-note-owner": state.noteOwnerId,
    },
    body: JSON.stringify({
      dateKey: key,
      note,
      savedAt,
      version: state.version,
      scripture: {
        reference: pair.scripture.reference,
        text: pair.scripture.text,
      },
      expression: {
        phrase: pair.expression.phrase,
        meaning: pair.expression.meaning,
      },
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Failed to save note");
  return data;
}

function renderNoteList() {
  if (!elements.noteList) return;
  elements.noteList.innerHTML = "";
  const records = state.noteRecords.length ? state.noteRecords : localNoteRecords();
  if (!records.length) {
    const empty = document.createElement("p");
    empty.className = "note-empty";
    empty.textContent = "저장된 기록이 없습니다.";
    elements.noteList.append(empty);
    return;
  }

  for (const record of records) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "note-record";
    button.addEventListener("click", () => {
      state.selectedDate = parseDateKey(record.dateKey);
      render();
      document.querySelector(".practice-panel")?.scrollIntoView({ behavior: "smooth", block: "center" });
      setMessage(`${record.dateKey} 기록을 열었습니다.`);
    });

    const meta = document.createElement("span");
    meta.className = "note-record-meta";
    meta.textContent = [record.dateKey, record.scripture?.reference, record.expression?.phrase].filter(Boolean).join(" · ");

    const body = document.createElement("span");
    body.className = "note-record-body";
    body.textContent = record.note;

    button.append(meta, body);
    elements.noteList.append(button);
  }
}

function localNoteRecords() {
  const query = state.noteSearch.toLocaleLowerCase("ko-KR");
  return Object.entries(state.notes)
    .filter(([, value]) => value?.note)
    .map(([key, value]) => {
      const pair = getDailyPairForDate(parseDateKey(key));
      return {
        dateKey: key,
        note: value.note,
        savedAt: value.savedAt,
        scripture: { reference: pair.scripture.reference, text: pair.scripture.text },
        expression: { phrase: pair.expression.phrase, meaning: pair.expression.meaning },
      };
    })
    .filter((record) => {
      if (!query) return true;
      return [record.dateKey, record.note, record.scripture.reference, record.scripture.text, record.expression.phrase, record.expression.meaning]
        .join(" ")
        .toLocaleLowerCase("ko-KR")
        .includes(query);
    })
    .sort((a, b) => b.dateKey.localeCompare(a.dateKey));
}

function parseDateKey(key) {
  const [year, month, day] = key.split("-").map(Number);
  return startOfLocalDay(new Date(year, month - 1, day));
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
