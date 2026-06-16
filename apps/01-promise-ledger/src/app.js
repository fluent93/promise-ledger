import { extractPromises } from "./parser.js?v=0.6";

const STORAGE_KEY = "promise-ledger:v2";
const LEGACY_STORAGE_KEY = "promise-ledger:v1";
const LANGUAGE_KEY = "promise-ledger:lang";

const copy = {
  ko: {
    productTag: "챙김노트",
    eyebrow: "personal follow-up",
    headline: "챙길 사람을 먼저 보여주는 약속 노트",
    subhead: "대화에서 흘린 작은 약속을 사람별로 정리하고, 오늘 다시 볼 것만 가볍게 남깁니다.",
    inputLabel: "대화나 메모",
    inputHint: "복붙하면 사람, 할 일, 기한을 임시로 정리합니다.",
    placeholder: "예: 민수에게 금요일까지 견적서 보내주기로 함. 지은이는 다음 주 월요일에 디자인 초안 공유해준다고 했다.",
    sampleButton: "샘플",
    extractButton: "추출",
    todayMetric: "오늘",
    waitingMetric: "받을 것",
    openMetric: "미완료",
    feedEyebrow: "follow-up feed",
    feedTitle: "오늘의 챙김",
    filterAll: "전체",
    filterMine: "내가 할 일",
    filterTheirs: "상대가 할 일",
    filterToday: "오늘",
    emptyTitle: "아직 기록된 약속이 없습니다.",
    emptyBody: "샘플로 흐름을 먼저 확인하거나 실제 대화를 붙여넣어보세요.",
    mine: "내가 할 일",
    theirs: "상대가 할 일",
    noDue: "기한 없음",
    todayDue: "오늘",
    overdue: "지남",
    open: "진행",
    waiting: "대기",
    done: "완료",
    edit: "수정",
    save: "저장",
    cancel: "취소",
    personLabel: "사람",
    promiseLabel: "약속 내용",
    dueLabel: "기한",
    directionLabel: "방향",
    summary: (mine, theirs) => `내가 ${mine}개, 상대가 ${theirs}개`,
    count: (count) => `${count}개`,
    successMessage: (count) => `${count}개의 약속을 추출했습니다.`,
    editMessage: "약속을 수정했습니다.",
    emptyMessage: "추출할 약속을 찾지 못했습니다. 샘플 문장으로 먼저 테스트해보세요.",
    sample: `민수에게 금요일까지 견적서 보내주기로 함.
지은이는 다음 주 월요일에 디자인 초안 공유해준다고 했다.
대표님께 오늘 오후에 회의 장소 다시 확인해드리기.
현우가 내일까지 결제 링크 보내주기로 했음.`,
  },
  en: {
    productTag: "Follow-up note",
    eyebrow: "personal follow-up",
    headline: "A promise note organized around people.",
    subhead: "Turn loose chat promises into a light follow-up list by person and date.",
    inputLabel: "Chat or note",
    inputHint: "Paste text to draft people, tasks, and dates.",
    placeholder: "Example: I promised Alex I would send the invoice by Friday. Sarah said she will share the draft next Monday.",
    sampleButton: "Sample",
    extractButton: "Extract",
    todayMetric: "Today",
    waitingMetric: "Incoming",
    openMetric: "Open",
    feedEyebrow: "follow-up feed",
    feedTitle: "Follow-up feed",
    filterAll: "All",
    filterMine: "I owe",
    filterTheirs: "They owe",
    filterToday: "Today",
    emptyTitle: "No promises yet.",
    emptyBody: "Try the sample first, or paste a real chat or note.",
    mine: "I owe",
    theirs: "They owe",
    noDue: "No date",
    todayDue: "Today",
    overdue: "Overdue",
    open: "Open",
    waiting: "Waiting",
    done: "Done",
    edit: "Edit",
    save: "Save",
    cancel: "Cancel",
    personLabel: "Person",
    promiseLabel: "Promise",
    dueLabel: "Due",
    directionLabel: "Direction",
    summary: (mine, theirs) => `I owe ${mine}, they owe ${theirs}`,
    count: (count) => `${count}`,
    successMessage: (count) => `Extracted ${count} promises.`,
    editMessage: "Promise updated.",
    emptyMessage: "No promises found. Try the sample text first.",
    sample: `I promised Alex I would send the invoice by Friday.
Sarah said she will share the draft next Monday.
Remind Daniel today about the dinner booking.
Jamie will send me the payment link tomorrow.`,
  },
};

const state = {
  promises: loadPromises(),
  filter: "all",
  lang: localStorage.getItem(LANGUAGE_KEY) || "ko",
};

const editingIds = new Set();

const elements = {
  form: document.querySelector("#promiseForm"),
  rawText: document.querySelector("#rawText"),
  loadSampleButton: document.querySelector("#loadSampleButton"),
  peopleBoard: document.querySelector("#peopleBoard"),
  emptyState: document.querySelector("#emptyState"),
  personTemplate: document.querySelector("#personTemplate"),
  promiseTemplate: document.querySelector("#promiseTemplate"),
  tabs: [...document.querySelectorAll(".tab")],
  langButtons: [...document.querySelectorAll(".lang-button")],
  clearDoneButton: document.querySelector("#clearDoneButton"),
  todayLabel: document.querySelector("#todayLabel"),
  dueTodayCount: document.querySelector("#dueTodayCount"),
  waitingCount: document.querySelector("#waitingCount"),
  openCount: document.querySelector("#openCount"),
  formMessage: document.querySelector("#formMessage"),
  i18n: [...document.querySelectorAll("[data-i18n]")],
};

elements.form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const input = elements.rawText.value;
  const extracted = await extractFromApi(input);
  if (!extracted.length) {
    setFormMessage(t("emptyMessage"), "error");
    elements.rawText.focus();
    return;
  }
  state.promises = [...extracted, ...state.promises];
  elements.rawText.value = "";
  persist();
  render();
  setFormMessage(t("successMessage")(extracted.length), "success");
});

elements.loadSampleButton.addEventListener("click", () => {
  elements.rawText.value = t("sample");
  setFormMessage("", "");
  elements.rawText.focus();
});

elements.tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    state.filter = tab.dataset.filter;
    render();
  });
});

elements.langButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.lang = button.dataset.lang;
    localStorage.setItem(LANGUAGE_KEY, state.lang);
    render();
  });
});


async function extractFromApi(text) {
  try {
    const response = await fetch("/api/extract-promises", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text, locale: navigator.language, today: new Date().toISOString() }),
    });

    if (!response.ok) throw new Error(`API extraction failed: ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data.promises)) throw new Error("API response missing promises");
    return data.promises;
  } catch (error) {
    console.warn(error);
    return extractPromises(text);
  }
}

elements.clearDoneButton.addEventListener("click", () => {
  state.promises = state.promises.filter((promise) => promise.status !== "done");
  editingIds.clear();
  persist();
  render();
});

function render() {
  applyLanguage();
  elements.tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.filter === state.filter));
  elements.langButtons.forEach((button) => button.classList.toggle("active", button.dataset.lang === state.lang));

  const visiblePromises = filterPromises(state.promises);
  const grouped = groupByPerson(visiblePromises);
  elements.peopleBoard.innerHTML = "";
  elements.emptyState.classList.toggle("visible", visiblePromises.length === 0);
  for (const [person, promises] of grouped.entries()) elements.peopleBoard.appendChild(renderPerson(person, promises));
  renderStats();
}

function applyLanguage() {
  document.documentElement.lang = state.lang;
  elements.rawText.placeholder = t("placeholder");
  elements.todayLabel.textContent = new Intl.DateTimeFormat(state.lang === "ko" ? "ko-KR" : "en-US", {
    month: "short",
    day: "numeric",
    weekday: "short",
  }).format(new Date());
  elements.i18n.forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });
  elements.clearDoneButton.title = state.lang === "ko" ? "완료 항목 정리" : "Clear done";
  elements.clearDoneButton.ariaLabel = elements.clearDoneButton.title;
}

function filterPromises(promises) {
  const today = toDateInputValue(new Date());
  return promises.filter((promise) => {
    if (state.filter === "mine") return promise.direction === "mine";
    if (state.filter === "theirs") return promise.direction === "theirs";
    if (state.filter === "today") return promise.dueDate === today;
    return true;
  });
}

function groupByPerson(promises) {
  return promises.reduce((groups, promise) => {
    const current = groups.get(promise.person) ?? [];
    current.push(promise);
    groups.set(promise.person, current);
    return groups;
  }, new Map());
}

function renderPerson(person, promises) {
  const node = elements.personTemplate.content.firstElementChild.cloneNode(true);
  const openPromises = promises.filter((promise) => promise.status !== "done");
  const avatar = node.querySelector(".avatar");

  avatar.textContent = person.slice(0, 1).toUpperCase();
  avatar.style.background = avatarColor(person);
  node.querySelector("h3").textContent = person;
  node.querySelector("header p").textContent = getPersonSummary(promises);
  node.querySelector(".count-badge").textContent = t("count")(openPromises.length);

  const list = node.querySelector(".promise-list");
  promises.forEach((promise) => list.appendChild(renderPromise(promise)));
  return node;
}

function renderPromise(promise) {
  const node = elements.promiseTemplate.content.firstElementChild.cloneNode(true);
  const directionBadge = node.querySelector(".direction-badge");
  const dueChip = node.querySelector(".due-chip");
  const statusSelect = node.querySelector("select");
  const editButton = node.querySelector(".edit-button");

  node.classList.toggle("done", promise.status === "done");
  directionBadge.classList.add(promise.direction);
  directionBadge.textContent = t(promise.direction);
  dueChip.textContent = dueLabel(promise);
  dueChip.classList.toggle("today", promise.dueDate === toDateInputValue(new Date()));
  dueChip.classList.toggle("overdue", isOverdue(promise));
  node.querySelector(".promise-text").textContent = promise.text;
  node.querySelector(".promise-source").textContent = promise.source;

  setStatusOptions(statusSelect);
  statusSelect.value = promise.status;
  statusSelect.addEventListener("change", () => updatePromise(promise.id, { status: statusSelect.value }));

  editButton.textContent = t("edit");
  editButton.title = t("edit");
  editButton.ariaLabel = t("edit");
  editButton.addEventListener("click", () => {
    editingIds.add(promise.id);
    render();
  });

  node.querySelector(".delete-button").addEventListener("click", () => {
    state.promises = state.promises.filter((item) => item.id !== promise.id);
    editingIds.delete(promise.id);
    persist();
    render();
  });

  if (editingIds.has(promise.id)) {
    node.appendChild(renderEditForm(promise));
  }

  return node;
}

function renderEditForm(promise) {
  const form = document.createElement("form");
  form.className = "promise-edit";
  form.innerHTML = `
    <label>
      <span>${t("personLabel")}</span>
      <input name="person" type="text" value="${escapeHtml(promise.person)}" required />
    </label>
    <label class="wide-field">
      <span>${t("promiseLabel")}</span>
      <textarea name="text" rows="3" required>${escapeHtml(promise.text)}</textarea>
    </label>
    <label>
      <span>${t("dueLabel")}</span>
      <input name="dueDate" type="date" value="${escapeHtml(promise.dueDate ?? "")}" />
    </label>
    <label>
      <span>${t("directionLabel")}</span>
      <select name="direction">
        <option value="mine">${t("mine")}</option>
        <option value="theirs">${t("theirs")}</option>
      </select>
    </label>
    <div class="edit-actions">
      <button class="ghost-button" type="button" data-action="cancel">${t("cancel")}</button>
      <button class="primary-button" type="submit">${t("save")}</button>
    </div>
  `;

  form.elements.direction.value = promise.direction;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    updatePromise(promise.id, {
      person: String(data.get("person")).trim() || promise.person,
      text: String(data.get("text")).trim() || promise.text,
      dueDate: String(data.get("dueDate")),
      direction: String(data.get("direction")),
    });
    editingIds.delete(promise.id);
    setFormMessage(t("editMessage"), "success");
  });

  form.querySelector('[data-action="cancel"]').addEventListener("click", () => {
    editingIds.delete(promise.id);
    render();
  });

  return form;
}

function setStatusOptions(select) {
  select.innerHTML = "";
  ["open", "waiting", "done"].forEach((status) => {
    const option = document.createElement("option");
    option.value = status;
    option.textContent = t(status);
    select.appendChild(option);
  });
}

function getPersonSummary(promises) {
  const mine = promises.filter((promise) => promise.direction === "mine").length;
  const theirs = promises.filter((promise) => promise.direction === "theirs").length;
  return t("summary")(mine, theirs);
}

function dueLabel(promise) {
  if (!promise.dueDate) return t("noDue");
  if (isOverdue(promise)) return t("overdue");
  if (promise.dueDate === toDateInputValue(new Date())) return t("todayDue");
  return formatDate(promise.dueDate);
}

function formatDate(value) {
  return new Intl.DateTimeFormat(state.lang === "ko" ? "ko-KR" : "en-US", {
    month: "short",
    day: "numeric",
    weekday: "short",
  }).format(new Date(`${value}T00:00:00`));
}

function isOverdue(promise) {
  if (!promise.dueDate || promise.status === "done") return false;
  return promise.dueDate < toDateInputValue(new Date());
}

function updatePromise(id, patch) {
  state.promises = state.promises.map((promise) => promise.id === id ? { ...promise, ...patch } : promise);
  persist();
  render();
}

function setFormMessage(message, tone) {
  elements.formMessage.textContent = message;
  elements.formMessage.className = tone ? `form-message ${tone}` : "form-message";
}

function renderStats() {
  const today = toDateInputValue(new Date());
  const active = state.promises.filter((promise) => promise.status !== "done");
  elements.dueTodayCount.textContent = active.filter((promise) => promise.dueDate === today).length;
  elements.waitingCount.textContent = active.filter((promise) => promise.direction === "theirs").length;
  elements.openCount.textContent = active.length;
}

function loadPromises() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY)) ?? [];
  } catch {
    return [];
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.promises));
}

function toDateInputValue(date) {
  return date.toISOString().slice(0, 10);
}

function avatarColor(name) {
  const colors = ["#0f8f83", "#396bdb", "#9b6400", "#7c5cc4", "#b45309", "#287271"];
  const index = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[char]);
}

function t(key) {
  return copy[state.lang][key];
}

render();
