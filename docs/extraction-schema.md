# Promise Extraction Schema

This document defines the target structured output for Promise Ledger before wiring an AI extraction API. The current rule-based parser should gradually converge toward this shape.

## Goal

Given pasted chat, note, email, or meeting text, extract relationship-centered promises. The app should answer two questions:

- What do I owe this person?
- What does this person owe me?

## Output Shape

```json
{
  "promises": [
    {
      "person": "Alex",
      "direction": "mine",
      "content": "Send the invoice",
      "dueDate": "2026-06-12",
      "status": "open",
      "confidence": 0.86,
      "sourceText": "I promised Alex I would send the invoice by Friday.",
      "evidence": "promised Alex ... by Friday",
      "language": "en"
    }
  ]
}
```

## Field Definitions

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `person` | string | yes | The relationship/person the promise is attached to. |
| `direction` | `mine` or `theirs` | yes | `mine` means I owe them. `theirs` means they owe me. |
| `content` | string | yes | Human-readable promise content, cleaned from the original sentence. |
| `dueDate` | `YYYY-MM-DD` or empty string | yes | Empty string if no date is inferable. |
| `status` | `open` | yes | New extractions should default to `open`. |
| `confidence` | number | yes | 0 to 1. Lower when direction/date/person is ambiguous. |
| `sourceText` | string | yes | Original sentence or fragment. |
| `evidence` | string | no | Short phrase explaining why this was extracted. |
| `language` | `ko`, `en`, or `mixed` | yes | Dominant language of source text. |

## Direction Rules

Use `mine` when:

- The speaker promised, owes, needs to send, needs to ask, needs to remind, or needs to follow up.
- Korean examples include `보내주기로 함`, `확인해드리기`, `물어보기`.

Use `theirs` when:

- The other person said they will do something, promised to send/share/confirm, or owes the speaker something.
- Korean examples include `해준다고`, `보내준대`, `알려주기로 했다`.

If ambiguous, pick the most likely direction and lower `confidence`.

## Date Rules

- Normalize explicit relative dates using the user's current date.
- `today`, `오늘` -> current date.
- `tomorrow`, `내일` -> current date + 1.
- `next Monday`, `다음 주 월요일` -> the Monday of the following week in normal user language.
- If only `next week` or `다음 주까지` appears, leave `dueDate` empty for now and lower confidence, unless product later supports week-level due dates.

## Initial API Direction

A future server route can expose this contract:

```text
POST /api/extract-promises
```

Request:

```json
{
  "text": "I promised Alex I would send the invoice by Friday.",
  "locale": "en-US",
  "today": "2026-06-09"
}
```

Response:

```json
{
  "promises": []
}
```

## Why This Comes Before DB

The DB schema should store stable product concepts. The extraction schema is still being validated, so the DB should wait until the app has enough real examples to confirm the fields.
