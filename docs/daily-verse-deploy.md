# 말씀영어 배포 체크리스트

개인/가족용으로 실제 휴대폰 알림까지 쓰기 위한 배포 순서입니다.

## 1. 로컬 확인

```bash
npm run check:11
npm run dev:11
```

로컬에서 `http://localhost:5174/daily-verse/`를 열고 확인합니다.

- 화면 하단 진단의 `version`이 최신인지 확인
- `알림 허용`
- `브라우저 테스트`
- `서버 테스트`

PC에서 알림이 보이지 않으면 먼저 Chrome/Windows 알림 설정을 확인합니다.

## 2. 비밀값 만들기

VAPID 키와 Cron 보호용 secret을 만듭니다.

```bash
npm run push:keys
npm run push:secret
```

`push:keys` 출력에서 `publicKey`와 `privateKey`를 각각 저장합니다.
`push:secret` 출력값은 `CRON_SECRET`으로 사용합니다.

## 3. Upstash Redis 만들기

Upstash Console에서 Redis database를 하나 만듭니다.

필요한 값:

- `UPSTASH_REDIS_REST_URL`: database page의 REST URL 또는 HTTPS endpoint
- `UPSTASH_REDIS_REST_TOKEN`: database page의 Token

Readonly token이 아니라 쓰기 가능한 기본 Token을 사용합니다. 구독 저장과 삭제가 필요하기 때문입니다.

## 4. Vercel 환경변수

Vercel Project Settings -> Environment Variables에 아래 값을 Production 환경으로 추가합니다.

```text
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:you@example.com
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
DAILY_VERSE_APP_URL=/daily-verse/
CRON_SECRET=...
```

환경변수를 바꾼 뒤에는 반드시 새 Production deployment가 필요합니다. 이전 deployment에는 새 값이 적용되지 않습니다.

## 5. Vercel 배포

GitHub/Vercel 연동으로 배포하거나 CLI를 사용합니다.

```bash
vercel --prod
```

배포 후 공유 주소는 다음 경로입니다.

```text
https://YOUR-PROJECT.vercel.app/daily-verse/
```

`/daily-verse`처럼 마지막 slash 없이 열어도 `vercel.json`에서 `/daily-verse/`로 이동시킵니다.

## 6. 운영 헬스체크

배포 주소에서 아래 endpoint를 엽니다.

```text
https://YOUR-PROJECT.vercel.app/api/push-health
```

기대 상태:

```json
{
  "ok": true,
  "vapid": { "configured": true },
  "storage": { "mode": "upstash", "ok": true },
  "cron": { "secretConfigured": true }
}
```

`ok: false`이면 `vapid`, `storage`, `cron` 중 false인 부분부터 고칩니다.

## 7. 내 폰 테스트

1. 휴대폰 Chrome 또는 Safari에서 `/daily-verse/` 열기
2. 홈 화면에 추가
3. 홈 화면 아이콘으로 다시 열기
4. `알림 허용`
5. 원하는 시간 선택
6. `브라우저 테스트`
7. `서버 테스트`

iPhone은 홈 화면에 추가된 웹앱에서 알림을 허용해야 합니다. Safari 탭에서만 테스트하면 알림 흐름이 다를 수 있습니다.

## 8. 가족에게 보내는 문구

```text
말씀영어 링크입니다.

https://YOUR-PROJECT.vercel.app/daily-verse/

1. 링크를 엽니다.
2. 홈 화면에 추가합니다.
3. 홈 화면의 말씀영어 아이콘으로 다시 엽니다.
4. 알림 허용을 누르고 원하는 시간을 선택합니다.
5. 브라우저 테스트를 눌러 알림이 뜨는지 확인합니다.
```

## 9. 현재 알림 시간

정기 알림은 Vercel Hobby Cron 대신 Google Cloud Scheduler가 호출합니다. `vercel.json`의 Vercel Cron은 꺼져 있습니다.

```text
07:30 KST -> /api/send-daily-verse-morning
12:30 KST -> /api/send-daily-verse-lunch
21:30 KST -> /api/send-daily-verse-evening
```

Google Cloud Scheduler 설정은 `docs/google-cloud-scheduler.md`를 따릅니다.

### Cron Timing Note

Vercel Hobby Cron is not minute-precise. Vercel documents Hobby cron precision as hourly, up to +/-59 minutes. The app records recent send logs in `/api/push-health` and prevents duplicate sends for the same slot/date. For exact minute-level delivery without Vercel Pro, use Google Cloud Scheduler.

## 10. 참고 문서

- Vercel Cron Jobs: https://vercel.com/docs/cron-jobs
- Vercel Environment Variables: https://vercel.com/docs/environment-variables
- Upstash Redis REST API: https://upstash.com/docs/redis/features/restapi
- MDN Push API: https://developer.mozilla.org/en-US/docs/Web/API/Push_API
