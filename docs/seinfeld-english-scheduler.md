# Seinfeld English Scheduler

Production app:

```text
https://promise-ledger-six.vercel.app/daily-verse/
```

Preferred delivery path:

| Job | Schedule | Time zone | Endpoint |
| --- | --- | --- | --- |
| `daily-expression` | `30 9 * * *` | `Asia/Seoul` | `/api/send-daily-expression` |

Use `GET` and include `Authorization: Bearer <CRON_SECRET>`.

Vercel also runs one Hobby cron at `30 0 * * *` UTC (= 09:30 KST). Timing on Hobby can drift by up to about an hour, so keep the Google Cloud Scheduler job for exact 09:30 delivery. The daily send lock prevents double delivery if both fire.

Legacy `/api/send-daily-verse-morning` still forwards to the same handler so older Scheduler jobs keep working.

## Create or update the GCP job

```bash
APP_URL="https://promise-ledger-six.vercel.app"
SECRET="<CRON_SECRET>"

gcloud scheduler jobs update http daily-expression \
  --schedule="30 9 * * *" \
  --time-zone="Asia/Seoul" \
  --uri="$APP_URL/api/send-daily-expression" \
  --http-method=GET \
  --headers="Authorization=Bearer $SECRET" \
  --attempt-deadline=60s
```

If the job does not exist yet:

```bash
gcloud scheduler jobs create http daily-expression \
  --schedule="30 9 * * *" \
  --time-zone="Asia/Seoul" \
  --uri="$APP_URL/api/send-daily-expression" \
  --http-method=GET \
  --headers="Authorization=Bearer $SECRET" \
  --attempt-deadline=60s
```

Delete obsolete morning/lunch/evening jobs if they still exist:

```bash
gcloud scheduler jobs delete daily-verse-morning --quiet || true
gcloud scheduler jobs delete daily-verse-lunch --quiet || true
gcloud scheduler jobs delete daily-verse-evening --quiet || true
```

## Verification

1. Force-run the job once in Cloud Scheduler.
2. Open `https://promise-ledger-six.vercel.app/api/push-health`.
3. Confirm `storage.count >= 1` and `recentSends` contains a `daily-expression-send` entry for today.
