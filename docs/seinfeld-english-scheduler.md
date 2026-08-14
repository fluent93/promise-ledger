# Seinfeld English Scheduler

Google Cloud Scheduler can call the following endpoints in the `Asia/Seoul` time zone:

| Job | Schedule | Endpoint |
| --- | --- | --- |
| `daily-expression` | `30 9 * * *` | `/api/send-daily-expression` |

Use `GET` and include `Authorization: Bearer <CRON_SECRET>`. After a forced run, open `/api/push-health` and confirm that `recentSends` contains a `daily-expression-send` entry.
