# Seinfeld English

Seinfeld의 짧은 대표 표현을 매일 하나씩 깊게 연습하는 PWA입니다. 성경 콘텐츠와 OpenAI 생성 기능은 제거했으며, 표현 선택은 로컬 데이터에서 날짜별로 결정됩니다.

## Run

```bash
npm install
npm run dev:11
```

Open `http://localhost:5174/daily-verse/`. The legacy route is intentionally kept so existing home-screen installations and bookmarks continue to work.

## Content

`src/expression-data.js` contains short Seinfeld-associated expressions and newly written two-line conversations assigned to familiar characters. These are learning reconstructions, not verbatim episode transcripts. Full scripts and subtitle files are not stored in the repository.

The play button prefers a matching personal MP3 in `audio/clip-manifest.json` and falls back to browser speech when no clip is installed. Use the Colab workflow in `../../docs/seinfeld-audio-clips.md` to extract only short clips while the original videos remain in Google Drive.

The full-series candidate workflow is documented in `../../docs/seinfeld-curriculum.md`. It scans the Drive subtitles and produces five review candidates per episode without copying the source videos into this repository.

No `OPENAI_API_KEY` is used. The same date always selects the same expression in the app and in push notifications.

## Daily Notification

The app works without Redis. Reliable server-triggered Web Push still needs persistent subscription storage, so production uses an Upstash Redis Free database for the subscription, one daily send lock, and the latest 30 send logs. Every subscriber receives one notification at 09:30 KST.

```text
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:you@example.com
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
DAILY_ENGLISH_APP_URL=/daily-verse/
CRON_SECRET=...
```

Run `npm run push:env-check` before deploying. See `../../docs/seinfeld-english-deploy.md` for the production checklist.
