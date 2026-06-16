# Parser Test Cases

These cases are a lightweight product benchmark for Promise Ledger before connecting an AI extractor. They are written as user-like chat or note fragments rather than perfect task statements.

## How To Use

1. Paste a few cases into `apps/01-promise-ledger`.
2. Check whether the extracted person, direction, due date, and promise text feel usable.
3. Mark cases as pass, partial, or fail in this file as we learn.
4. Keep cases that fail. They are useful prompts for the Structured Outputs version later.

## Expected Fields

- `person`: who the promise is attached to
- `direction`: `mine` if I owe them, `theirs` if they owe me
- `dueDate`: normalized date if inferable
- `text`: readable promise content

## Korean Cases

| ID | Input | Expected Person | Direction | Due | Notes |
| --- | --- | --- | --- | --- | --- |
| KO-01 | 민수에게 금요일까지 견적서 보내주기로 함. | 민수 | mine | next Friday | Current happy path. |
| KO-02 | 지은이는 다음 주 월요일에 디자인 초안 공유해준다고 했다. | 지은 | theirs | next Monday | Current happy path. |
| KO-03 | 대표님께 오늘 오후에 회의 장소 다시 확인해드리기. | 대표 | mine | today | Honorific handling. |
| KO-04 | 현우가 내일까지 결제 링크 보내주기로 했음. | 현우 | theirs | tomorrow | Current happy path. |
| KO-05 | 수진한테 이번 주 금요일까지 계약서 검토해서 보내기. | 수진 | mine | Friday | "이번 주" not explicitly handled yet. |
| KO-06 | 엄마에게 내일 병원 예약 시간 확인해드리기. | 엄마 | mine | tomorrow | Family/relationship wording. |
| KO-07 | 도윤이가 토요일에 사진 원본 보내준다고 함. | 도윤 | theirs | Saturday | Name particle variant. |
| KO-08 | 선영님께 다음 주 수요일까지 발표 자료 공유. | 선영 | mine | next Wednesday | Honorific stripping. |
| KO-09 | 재훈은 오늘 저녁에 가게 주소 알려주기로 했다. | 재훈 | theirs | today | Verb does not include current theirs hint. |
| KO-10 | 유리에게 생일 선물 링크 나중에 보내기. | 유리 | mine | none | No due date. |
| KO-11 | 태호가 내일 오전까지 계좌번호 알려준다고 했어. | 태호 | theirs | tomorrow | Casual sentence ending. |
| KO-12 | 서연한테 월요일에 다시 연락하기. | 서연 | mine | Monday | Short reminder. |
| KO-13 | 민지랑 이야기: 내가 금요일까지 초대장 만들어주기. | 민지 | mine | Friday | "랑" is currently hard. |
| KO-14 | 준호에게 다음 주까지 초안 피드백 주기로. | 준호 | mine | none/next week | Week without weekday. |
| KO-15 | 혜린이가 자료 받으면 나한테 전달해준다고 함. | 혜린 | theirs | none | Conditional. |
| KO-16 | 아빠께 오늘 보험 서류 스캔해서 보내드리기. | 아빠 | mine | today | Family honorific. |
| KO-17 | 예린은 수요일까지 로고 후보 3개 보내준대. | 예린 | theirs | Wednesday | Colloquial "준대". |
| KO-18 | 동호에게 내일까지 회식 참석 여부 물어보기. | 동호 | mine | tomorrow | Ask/check type. |
| KO-19 | 하늘이가 다음 주 금요일에 예약 확인해준다고 했음. | 하늘 | theirs | next Friday | Current weekday path. |
| KO-20 | 나중에 Alex에게 한국어 자료 번역본 보내기. | Alex | mine | none | Mixed Korean/English. |

## English Cases

| ID | Input | Expected Person | Direction | Due | Notes |
| --- | --- | --- | --- | --- | --- |
| EN-01 | I promised Alex I would send the invoice by Friday. | Alex | mine | Friday | Current happy path. |
| EN-02 | Sarah said she will share the draft next Monday. | Sarah | theirs | next Monday | Current happy path. |
| EN-03 | Remind Daniel today about the dinner booking. | Daniel | mine | today | Current happy path. |
| EN-04 | Jamie will send me the payment link tomorrow. | Jamie | theirs | tomorrow | Current happy path. |
| EN-05 | Tell Priya I will review her slides by Wednesday. | Priya | mine | Wednesday | Tell/reminder. |
| EN-06 | Michael said he can confirm the venue on Friday. | Michael | theirs | Friday | `can` + future meaning. |
| EN-07 | I need to message Chloe tomorrow about the contract. | Chloe | mine | tomorrow | Current parser may miss "message Chloe" if lowercase start context varies. |
| EN-08 | From Noah: he will send the receipt next Tuesday. | Noah | theirs | next Tuesday | From-pattern. |
| EN-09 | Send Olivia the final copy by Monday. | Olivia | mine | Monday | Imperative. |
| EN-10 | Emma promised to call me today. | Emma | theirs | today | Person first + promised. |
| EN-11 | I owe Ben a quick summary by Thu. | Ben | mine | Thursday | Current parser may miss "owe". |
| EN-12 | Ava will bring the documents tomorrow morning. | Ava | theirs | tomorrow | Person first. |
| EN-13 | Need to ask Liam about the budget next week. | Liam | mine | none/next week | Week without weekday. |
| EN-14 | Sofia said the mockups will be ready Friday. | Sofia | theirs | Friday | Indirect obligation. |
| EN-15 | I told Ethan I would send the Zoom link today. | Ethan | mine | today | Current parser may miss "told". |
| EN-16 | Mia can share the photos on Saturday. | Mia | theirs | Saturday | Person first + can. |
| EN-17 | Please remind Lucas tomorrow to check the booking. | Lucas | mine | tomorrow | Polite imperative. |
| EN-18 | Henry will give me feedback next Wednesday. | Henry | theirs | next Wednesday | Current happy path. |
| EN-19 | I should send Grace the notes by Friday. | Grace | mine | Friday | Current parser may miss "should send Grace". |
| EN-20 | To Rachel: send the signed NDA by Monday. | Rachel | mine | Monday | To-pattern; direction may need review. |

## Current Known Gaps

- Week-only dates like "next week" and "다음 주까지" are not normalized.
- English phrases like `should send Grace` still need additional person patterns.
- Mixed Korean/English names work only in some particle patterns.
- Rule-based extraction is useful for bootstrapping but should be replaced by Structured Outputs once the product schema stabilizes.

## Automated Baseline

Representative cases now live in `apps/01-promise-ledger/src/parser-cases.js` and run with `npm run test:01`. The current automated baseline is 16 passing cases.
