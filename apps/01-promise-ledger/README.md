# Promise Ledger / 챙김노트

사람 단위로 작은 약속을 추적하는 개인용 MVP입니다. 업무 단위의 할 일 관리가 아니라, “내가 누구에게 뭘 해주기로 했는지”와 “상대가 나에게 뭘 해주기로 했는지”를 놓치지 않게 돕는 것이 목표입니다.

## Status

v0.9 Vercel-ready API MVP.

## Current Features

- 자유 형식 텍스트 붙여넣기
- 한국어/영어 UI 전환
- 한국어/영어 약속 문장 간이 추출
- 추출된 약속 직접 수정
- 파서 로직 분리 (`src/parser.js`)
- 로컬 Node API와 Vercel serverless API 지원
- 사람별 피드
- 내가 할 일 / 상대가 할 일 / 오늘 필터
- 진행 / 대기 / 완료 상태 변경
- 브라우저 `localStorage` 저장

## Run

루트에서 실행합니다.

```bash
npm run dev:01
```

또는 이 폴더에서 정적 서버를 실행합니다.

```bash
python3 -m http.server 5173
```

브라우저에서 `http://localhost:5173`을 엽니다.

## Current Architecture

서버는 로컬 Node API와 Vercel serverless API를 같은 추출 함수로 공유합니다. 데이터 저장은 아직 브라우저 `localStorage`를 사용합니다.

```text
Browser
  -> POST /api/extract-promises
  -> extractor provider
    -> groq | ollama | rule-based parser
  -> localStorage
```

## Vercel Deploy

The repository root includes:

- `api/extract-promises.js`: Vercel serverless function
- `vercel.json`: rewrites `/`, `/styles.css`, and `/src/*` to this app

Set these project environment variables in Vercel:

```bash
LLM_PROVIDER=groq
GROQ_API_KEY=...
GROQ_MODEL=openai/gpt-oss-20b
```

The API falls back to `rule-based` if Groq is unavailable.

## Next

- Vercel preview 배포
- Groq 모델별 추출 품질 비교
- Supabase/Postgres 저장소 검토
- 날짜 표현 추가 인식
- 리마인드 알림 또는 캘린더 내보내기


## Parser Benchmark

Parser quality is tracked in [`../../docs/parser-test-cases.md`](../../docs/parser-test-cases.md). The current automated baseline runs 16 representative Korean and English chat-like cases.


## Test

From the repository root:

```bash
npm run test:01
```

This runs the automated parser baseline from `src/parser-cases.js`.

## Extraction Schema

The target AI extraction contract is documented in [`../../docs/extraction-schema.md`](../../docs/extraction-schema.md).


## Extractor Provider

`/api/extract-promises` uses an extractor provider selected by `LLM_PROVIDER`.

```bash
LLM_PROVIDER=rule-based npm run dev:01
```

Current providers:

- `rule-based`: local parser, no external API key required
- `ollama`: local Ollama endpoint with structured JSON output; falls back to `rule-based` if Ollama is unavailable
- `groq`: hosted Groq API with Structured Outputs; falls back to `rule-based` if `GROQ_API_KEY` is missing or the request fails

Example:

```bash
LLM_PROVIDER=ollama OLLAMA_MODEL=qwen2.5:7b npm run dev:01
```

Optional environment variables:

- `OLLAMA_BASE_URL`: defaults to `http://127.0.0.1:11434`
- `OLLAMA_MODEL`: defaults to `qwen2.5:7b`


### Groq Provider

Groq is the recommended hosted LLM provider for an early Vercel deployment because it exposes an OpenAI-compatible API and supports Structured Outputs.

```bash
GROQ_API_KEY=... LLM_PROVIDER=groq GROQ_MODEL=openai/gpt-oss-20b npm run dev:01
```

Optional environment variables:

- `GROQ_BASE_URL`: defaults to `https://api.groq.com/openai/v1`
- `GROQ_MODEL`: defaults to `openai/gpt-oss-20b`

For Vercel, set `GROQ_API_KEY`, `LLM_PROVIDER=groq`, and `GROQ_MODEL` as project environment variables. Never expose `GROQ_API_KEY` in browser code.
