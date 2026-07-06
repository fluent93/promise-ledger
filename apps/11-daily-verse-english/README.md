# Daily Verse English / 말씀영어

매일 개역한글 성경 본문 하나와 American English 표현 하나를 함께 추천하는 루틴형 MVP입니다.

## MVP

- 오늘 날짜 기준으로 고정되는 말씀/영어 표현 추천
- 이전/다음 날짜 이동
- 개역한글 본문 표시
- 향후 개역개정/킹제임스 흠정역 연결을 위한 번역본 구조
- 오늘의 메모 저장
- 오늘 카드 클립보드 복사
- 알림 시간 선택, 브라우저 테스트, 서버 테스트, 알림 해제

## Bible Text Policy

현재 MVP는 개역한글 본문을 직접 표시합니다. 대한성서공회 안내에 따르면 개역한글판은 저작재산권 보호기간이 소멸한 번역본입니다.

개역개정과 흠정역은 이 앱 안에 본문을 재배포하지 않고, 나중에 허가나 공식 연결 방식이 정리되면 번역본 옵션으로 추가합니다.

## PWA Install

현재 앱은 PWA 설치 기반을 갖추고 있습니다. `manifest.json`, `sw.js`, 앱 아이콘, 휴대폰 설치 안내 패널이 포함되어 있습니다.

- iPhone: Safari에서 링크 열기 -> 공유 버튼 -> 홈 화면에 추가
- Android: Chrome에서 링크 열기 -> 앱 설치 또는 홈 화면에 추가
- 설치 후 홈 화면의 `말씀영어` 아이콘으로 실행

정기 알림을 실제로 보내려면 HTTPS 배포, Web Push 구독 저장 API, 스케줄러가 추가로 필요합니다. 현재는 알림 시간 선택, 알림 권한 요청, 테스트 알림까지 준비되어 있습니다.

## Run

```bash
npm run dev:11
```

Then open `http://localhost:5174`. In production, share `/daily-verse/`. The local dev server serves both the static app and `/api/*` push endpoints. If `.env.local` has no VAPID keys, development keys are generated automatically and kept out of git.


## Dynamic Recommendations

The app now requests /api/daily-verse-data for each selected date. In production, OPENAI_API_KEY is required: the API generates a fresh Bible-and-English lesson, caches it by date plus delivery slot, and returns an error if generation fails instead of silently rotating through a bundled verse pool. The bundled deterministic lessons are now only a local/offline fallback, or can be explicitly enabled with DAILY_VERSE_ALLOW_FALLBACK=1.

Set these environment variables to enable dynamic generation:

```text
OPENAI_API_KEY=...
DAILY_VERSE_OPENAI_MODEL=gpt-5.4-mini
```

The generator avoids recent cached Bible references and English phrases, and asks for richer expression support: scene note, reusable patterns, and practice lines.

## Web Push Setup

정기 알림은 Vercel Functions, Vercel Cron, Upstash Redis REST, Web Push VAPID 키를 사용합니다. Local development uses `LOCAL_PUSH_STORE_FILE` so you can test subscriptions without Upstash.

1. VAPID 키 생성

```bash
npm run push:keys
npm run push:secret
```

2. 배포 환경 변수 설정

```text
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:you@example.com
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
DAILY_VERSE_APP_URL=/daily-verse/
CRON_SECRET=...
```

3. 배포 후 앱에서 `알림 허용`을 누르면 `/api/push-subscriptions`에 구독 정보가 저장됩니다. `서버 테스트`는 `/api/push-test`로 현재 기기에 즉시 Web Push를 보내 서버 전송 경로를 확인합니다.

4. Vercel Cron은 UTC 기준으로 실행됩니다. 현재 설정은 한국 시간 기준입니다.

```text
07:30 KST -> /api/send-daily-verse-morning -> 22:30 UTC
12:30 KST -> /api/send-daily-verse-lunch   -> 03:30 UTC
21:30 KST -> /api/send-daily-verse-evening -> 12:30 UTC
```


## Deployment Check

Before deploying, check production environment variables locally or in CI:

```bash
npm run push:env-check
```

After deployment, open this endpoint to verify the production push setup without exposing secrets:

```text
/api/push-health
```

Expected shape:

```json
{
  "ok": true,
  "appUrl": "/daily-verse/",
  "vapid": { "configured": true },
  "storage": { "ok": true, "mode": "upstash", "count": 0 }
}
```

For the full launch sequence, including Vercel, Upstash, phone testing, and a family sharing message, see `../../docs/daily-verse-deploy.md`.

### Cron Timing Note

Vercel Hobby Cron is not minute-precise. Vercel documents Hobby cron precision as hourly, up to +/-59 minutes. The app records recent send logs in `/api/push-health` and prevents duplicate sends for the same slot/date. For exact minute-level delivery, use Vercel Pro or a dedicated scheduler.

## Scheduler

Production reminders use Google Cloud Scheduler instead of Vercel Hobby Cron for more accurate KST delivery. See `../../docs/google-cloud-scheduler.md`.
