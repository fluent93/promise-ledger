import { EXPRESSION_POLICY_VERSION, advancedExpressions } from "./expression-data.js?v=0.25";

const APP_VERSION = "0.25";
const expressions = advancedExpressions;
let clipManifest = {};
let activeAudio = null;
let playbackActive = false;

const elements = {
  dateLabel: document.querySelector("#dateLabel"),
  expressionPhrase: document.querySelector("#expressionPhrase"),
  expressionMeaning: document.querySelector("#expressionMeaning"),
  expressionSource: document.querySelector("#expressionSource"),
  expressionExample: document.querySelector("#expressionExample"),
  playButton: document.querySelector("#playButton"),
  notificationButton: document.querySelector("#notificationButton"),
  statusMessage: document.querySelector("#statusMessage"),
};

const today = startOfLocalDay(new Date());
const expression = getDailyExpression(today);

render();
loadClipManifest().then((manifest) => {
  clipManifest = manifest;
});
registerServiceWorker()
  .then(renderNotificationState)
  .catch(() => {
    elements.notificationButton.disabled = true;
  });

elements.playButton.addEventListener("click", toggleDialogueAudio);
elements.notificationButton.addEventListener("click", toggleDailyNotification);

function render() {
  elements.dateLabel.textContent = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(today);
  elements.expressionPhrase.textContent = expression.phrase;
  elements.expressionMeaning.textContent = expression.meaning;
  elements.expressionSource.textContent = expression.source
    ? `Season ${expression.source.season} · ${expression.source.episode}`
    : "";
  elements.expressionExample.replaceChildren(...expression.example.map(createDialogueLine));

  if (!("Audio" in window) && !("speechSynthesis" in window)) {
    elements.playButton.disabled = true;
    elements.playButton.textContent = "음성 미지원";
  }
}

function createDialogueLine(line) {
  const row = document.createElement("p");
  row.className = "dialogue-line";

  const speaker = document.createElement("span");
  speaker.className = "speaker";
  speaker.textContent = line.speaker || "•";

  const text = document.createElement("span");
  text.className = "dialogue-text";

  const english = document.createElement("span");
  english.className = "dialogue-english";
  english.textContent = line.text;
  text.append(english);

  if (line.translation) {
    const translation = document.createElement("span");
    translation.className = "dialogue-translation";
    translation.textContent = line.translation;
    text.append(translation);
  }

  row.append(speaker, text);
  return row;
}

function toggleDialogueAudio() {
  if (playbackActive) {
    stopDialogueAudio();
    return;
  }

  const clip = clipManifest[expression.phrase];
  if (clip && "Audio" in window) {
    playActualClip(clip);
    return;
  }

  playSynthesizedDialogue();
}

function playActualClip(clip) {
  const source = clip.src || (clip.file ? `./audio/${clip.file}` : "");
  if (!source) {
    playSynthesizedDialogue();
    return;
  }

  const audio = new Audio(source);
  activeAudio = audio;
  audio.preload = "auto";
  audio.addEventListener("ended", finishAudioPlayback, { once: true });
  setPlaybackState(true);
  audio.play().catch(() => {
    if (activeAudio !== audio) return;
    activeAudio = null;
    setPlaybackState(false);
    playSynthesizedDialogue();
  });
}

function finishAudioPlayback() {
  activeAudio = null;
  setPlaybackState(false);
}

function playSynthesizedDialogue() {
  if (!("speechSynthesis" in window)) return;

  const voices = speechSynthesis.getVoices().filter((voice) => voice.lang.toLowerCase().startsWith("en"));
  const preferred = voices.filter((voice) => voice.lang.toLowerCase().startsWith("en-us"));
  const available = preferred.length ? preferred : voices;
  const lines = expression.example.map((line, index) => {
    const utterance = new SpeechSynthesisUtterance(line.text);
    utterance.lang = "en-US";
    utterance.rate = 0.92;
    utterance.pitch = index % 2 ? 1.05 : 0.94;
    if (available.length) utterance.voice = available[index % available.length];
    return utterance;
  });

  if (!lines.length) return;
  lines.at(-1).addEventListener("end", () => setPlaybackState(false), { once: true });
  lines.at(-1).addEventListener("error", () => setPlaybackState(false), { once: true });
  setPlaybackState(true);
  lines.forEach((line) => speechSynthesis.speak(line));
}

function stopDialogueAudio() {
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.currentTime = 0;
    activeAudio = null;
  }
  if ("speechSynthesis" in window) speechSynthesis.cancel();
  setPlaybackState(false);
}

function setPlaybackState(isPlaying) {
  playbackActive = isPlaying;
  elements.playButton.classList.toggle("is-playing", isPlaying);
  elements.playButton.textContent = isPlaying ? "■ 정지" : "▶ 듣기";
}

async function loadClipManifest() {
  try {
    const response = await fetch("./audio/clip-manifest.json", { cache: "no-store" });
    if (!response.ok) return {};
    const payload = await response.json();
    return payload && typeof payload.clips === "object" ? payload.clips : {};
  } catch {
    return {};
  }
}

async function toggleDailyNotification() {
  try {
    ensurePushSupport();
    const registration = await navigator.serviceWorker.ready;
    const existing = await registration.pushManager.getSubscription();

    if (existing) {
      await fetch("/api/push-subscriptions", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ endpoint: existing.endpoint }),
      });
      await existing.unsubscribe();
      setStatus("매일 09:30 알림을 껐습니다.");
      await renderNotificationState();
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") throw new Error("브라우저에서 알림을 허용해야 합니다.");

    const publicKey = await getPushPublicKey();
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
    const response = await fetch("/api/push-subscriptions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ subscription, timezone: "Asia/Seoul", appVersion: APP_VERSION }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || "알림 구독을 저장하지 못했습니다.");

    setStatus("매일 오전 9:30에 한 번 알려드립니다.");
    await renderNotificationState();
  } catch (error) {
    setStatus(error.message || "알림을 설정하지 못했습니다.");
  }
}

async function renderNotificationState() {
  const supported = "Notification" in window && "serviceWorker" in navigator && "PushManager" in window;
  elements.notificationButton.disabled = !supported;
  if (!supported) return;

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  const active = Boolean(subscription);
  elements.notificationButton.setAttribute("aria-pressed", String(active));
  elements.notificationButton.textContent = active ? "09:30 알림 켜짐" : "09:30 알림";
}

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return null;
  return navigator.serviceWorker.register("./sw.js");
}

async function getPushPublicKey() {
  const response = await fetch("/api/push-public-key");
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.publicKey) throw new Error(payload.error || "알림 키가 설정되지 않았습니다.");
  return payload.publicKey;
}

function ensurePushSupport() {
  if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
    throw new Error("이 브라우저는 알림을 지원하지 않습니다.");
  }
}

function getDailyExpression(date) {
  const index = dayNumber(date) + EXPRESSION_POLICY_VERSION * 13;
  return expressions[positiveModulo(index, expressions.length)];
}

function dayNumber(date) {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000);
}

function startOfLocalDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function positiveModulo(value, divisor) {
  return ((value % divisor) + divisor) % divisor;
}

function setStatus(message) {
  elements.statusMessage.textContent = message;
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((character) => character.charCodeAt(0)));
}
