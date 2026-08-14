# Seinfeld English 배포 체크리스트

## Local

```bash
npm run check:11
npm run dev:11
```

Open `http://localhost:5174/daily-verse/`. The old route remains in use for installed-PWA compatibility.

## Production Push

The core app and browser voice playback need no API key. The single 09:30 Web Push uses VAPID keys and Upstash Redis Free only to retain the browser subscription and prevent duplicate sends.

```bash
npm run push:keys
npm run push:secret
```

Set these variables in Vercel:

```text
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:you@example.com
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
DAILY_ENGLISH_APP_URL=/daily-verse/
CRON_SECRET=...
```

After deployment, check `/api/push-health` and press `09:30 알림` once in the app. Scheduled delivery uses the endpoint in `seinfeld-english-scheduler.md`.

Without Redis, the expression and voice playback still work; only the daily push is unavailable. Personal episode clips are optional and ignored by Git; see `seinfeld-audio-clips.md`.

## Cost Guardrails

- OpenAI is not called anywhere in this app. Remove any old `OPENAI_API_KEY` from Vercel and revoke the key in the OpenAI dashboard.
- Keep the Upstash database on the `$0` Free plan and do not add a payment method. One user and one daily send use roughly 120 scheduled Redis commands per month, excluding occasional health checks.
- Redis stores only one push subscription, a 48-hour duplicate-send lock, and the latest 30 send logs.
- Google Cloud Scheduler needs one job. Check the billing account for unrelated Scheduler jobs because its free allowance is shared across the billing account.
- Keep Vercel on Hobby for this personal project. The scheduler stays on Google Cloud because Vercel Hobby does not guarantee minute-level cron timing.
