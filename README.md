# Small Painpoint Solvers

개인의 일상적이고 반복적인 작은 불편함을 빠르게 MVP로 검증하는 실험실입니다. 거창한 서비스보다 “엑셀, 카톡, 메모, 캘린더로 억지로 해결하던 작은 문제”를 먼저 다룹니다.

## Principles

1. 매일 또는 매주 반복되는 문제인가?
2. 너무 사소해서 사람들이 그냥 참고 사는 문제인가?
3. 엑셀, 카톡, 메모, 캘린더로 억지로 해결하는 중인가?
4. AI가 자동화보다 정리, 판단, 기억에서 가치를 만드는가?
5. 혼자 빠르게 MVP를 만들 수 있는가?

## Apps

| No | App | Status | Path |
| --- | --- | --- | --- |
| 01 | Promise Ledger / 챙김노트 | v0.9 Vercel-ready API MVP | `apps/01-promise-ledger` |
| 02 | Recycle Checker | Idea backlog | `apps/02-recycle-checker` |
| 03 | Item Memory | Idea backlog | `apps/03-item-memory` |
| 04 | Action Item Extractor | Idea backlog | `apps/04-action-item-extractor` |
| 05 | Reply Tracker | Idea backlog | `apps/05-reply-tracker` |
| 06 | Fridge Priority | Idea backlog | `apps/06-fridge-priority` |
| 07 | CancelGuard | Idea backlog | `apps/07-cancel-guard` |
| 08 | Family Notice Parser | Idea backlog | `apps/08-family-notice-parser` |
| 09 | Tone Tuner | Idea backlog | `apps/09-tone-tuner` |
| 10 | Read Later Recall | Idea backlog | `apps/10-read-later-recall` |
| 11 | Daily Verse English / 말씀영어 | PWA + Web Push MVP | `apps/11-daily-verse-english` |

## Run

```bash
npm run dev:01
```

Then open `http://localhost:5173`.

For the daily Bible verse and American English MVP:

```bash
npm run dev:11
```

Then open `http://localhost:5174`.


## Deploy 11 to Vercel

Daily Verse English is served at `/daily-verse/` in production. It uses Web Push, Vercel Cron, and Upstash Redis REST for subscriptions.

Required environment variables:

```text
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:you@example.com
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
DAILY_VERSE_APP_URL=/daily-verse/
CRON_SECRET=...
```

Useful checks:

```bash
npm run push:keys
npm run push:secret
npm run push:env-check
npm run check:11
```

After deployment, open `/api/push-health` and expect `ok: true` before sharing `/daily-verse/` with family.

Detailed launch steps live in `docs/daily-verse-deploy.md`.

## Deploy 01 to Vercel

The repository root contains `vercel.json` and `api/extract-promises.js`, so Vercel can serve the 01 app at `/` and the extraction endpoint at `/api/extract-promises`.

Set these Vercel environment variables for hosted LLM extraction:

```bash
LLM_PROVIDER=groq
GROQ_API_KEY=...
GROQ_MODEL=openai/gpt-oss-20b
```

If the Groq key is missing or the provider call fails, the API falls back to the local rule-based parser and includes `requestedProvider` plus `fallbackReason` in the JSON response.

## Repository Shape

```text
api/
  extract-promises.js
apps/
  01-promise-ledger/
  02-recycle-checker/
  ...
docs/
  roadmap.md
package.json
vercel.json
README.md
```

앱이 충분히 커지기 전까지는 이 mono-repo 안에서 실험합니다. 공통 AI 추출 로직, UI 패턴, 인증/DB 구조가 생기면 `packages/`를 추가합니다.
