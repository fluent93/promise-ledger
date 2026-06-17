# Google Cloud Scheduler Setup for 말씀영어

Vercel Hobby Cron is disabled in `vercel.json`. Use Google Cloud Scheduler to call the existing Vercel API endpoints at exact KST schedules.

Production app URL:

```text
https://promise-ledger-six.vercel.app/daily-verse/
```

Scheduler targets:

```text
GET https://promise-ledger-six.vercel.app/api/send-daily-verse-morning
GET https://promise-ledger-six.vercel.app/api/send-daily-verse-lunch
GET https://promise-ledger-six.vercel.app/api/send-daily-verse-evening
```

All three jobs must include this HTTP header:

```text
Authorization: Bearer <CRON_SECRET>
```

Use the same `CRON_SECRET` value already stored in Vercel Production Environment Variables and local `.env.local`.

## Recommended Jobs

| Job name | Schedule | Time zone | URL |
| --- | --- | --- | --- |
| `daily-verse-morning` | `30 7 * * *` | `Asia/Seoul` | `/api/send-daily-verse-morning` |
| `daily-verse-lunch` | `30 12 * * *` | `Asia/Seoul` | `/api/send-daily-verse-lunch` |
| `daily-verse-evening` | `30 21 * * *` | `Asia/Seoul` | `/api/send-daily-verse-evening` |

## Console Steps

1. Open Google Cloud Console.
2. Search for `Cloud Scheduler`.
3. Enable the Cloud Scheduler API if prompted.
4. Create a job.
5. Set Frequency with the cron expression above.
6. Set Timezone to `Asia/Seoul`.
7. Target type: `HTTP`.
8. URL: use the matching endpoint above.
9. HTTP method: `GET`.
10. Auth header: add `Authorization` with value `Bearer <CRON_SECRET>`.
11. Save.
12. Repeat for morning, lunch, evening.
13. Use `Force run` once on one job and check `/api/push-health`.

## gcloud Example

If `gcloud` is installed and authenticated:

```bash
APP_URL="https://promise-ledger-six.vercel.app"
SECRET="<CRON_SECRET>"

gcloud scheduler jobs create http daily-verse-morning \
  --schedule="30 7 * * *" \
  --time-zone="Asia/Seoul" \
  --uri="$APP_URL/api/send-daily-verse-morning" \
  --http-method=GET \
  --headers="Authorization=Bearer $SECRET"

gcloud scheduler jobs create http daily-verse-lunch \
  --schedule="30 12 * * *" \
  --time-zone="Asia/Seoul" \
  --uri="$APP_URL/api/send-daily-verse-lunch" \
  --http-method=GET \
  --headers="Authorization=Bearer $SECRET"

gcloud scheduler jobs create http daily-verse-evening \
  --schedule="30 21 * * *" \
  --time-zone="Asia/Seoul" \
  --uri="$APP_URL/api/send-daily-verse-evening" \
  --http-method=GET \
  --headers="Authorization=Bearer $SECRET"
```

## Verification

Open:

```text
https://promise-ledger-six.vercel.app/api/push-health
```

Check:

- `ok: true`
- `storage.count` is at least 1 after a phone subscribes
- `recentSends` records the slot, scheduled time, and actual KST trigger time after the scheduler runs

## Pricing Note

Google Cloud Scheduler pricing currently includes 3 free jobs per billing account per month. This app needs exactly 3 jobs: morning, lunch, evening.
