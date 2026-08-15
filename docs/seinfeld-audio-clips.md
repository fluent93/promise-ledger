# Seinfeld 실제 음성 클립 추출 및 품질 가이드

원본 영상은 Google Drive에 그대로 두고 Colab에서 마운트해 사용한다. 저장소와 앱에는 선택한 장면의 짧은 MP3만 둔다.

## 품질 및 추출 표준 (Extraction Gold Standard)

### 1. 3~4줄 대화 맥락 유지 (Context Preservation)
- 단 2줄 대화로 자르면 문맥과 시트콤 특유의 유머 흐름이 깨집니다.
- 모든 에피소드 클립은 **반드시 3~4줄의 대화 흐름(상황 세팅 → 핵심 표현 → 반응/반박/결론)**을 포함해야 합니다.

### 2. 정밀 타임코드 파라미터 (Padding Rules)
- **`before: 1.5 ~ 1.8`**: 대사 시작 전 1.5~1.8초 여유를 두어 첫 단어(화자 발음)가 절대로 잘리지 않게 합니다.
- **`after: 4.0 ~ 5.5`**: 대사 종료 후 4.0~5.5초 여유를 두어 리액션 대사가 완전히 끝난 뒤 깔끔하게 종료되도록 합니다.
- **`queries` (연속 2문장 매칭)** & **`avoid_nearby` (엉뚱한 씬 차단)**: 단어 1개 검색이 아니라 연속 대사 조합으로 자막을 검색하여 에피소드 내 엉뚱한 씬이나 다툼 씬이 추출되는 것을 방지합니다.

---

## 추출 단계

1. `tools/seinfeld-clip-extractor.ipynb` 또는 `tools/seinfeld-batch-clip-extractor.py`를 실행한다.
2. `clip-batch-report.json`에서 실제 매칭 문장과 타임코드를 확인한다.
3. 생성된 MP3는 `MyDrive/Seinfeld English Clips`에 기록된다.

---

## 앱 연결

출력 폴더의 MP3와 `clip-manifest.json`을 아래 폴더에 둔다.

```text
apps/11-daily-verse-english/audio/
```

배포용 MP3는 공개 GitHub에 넣지 않고 Upstash Redis에 업로드한다.

```bash
npm run audio:upload -- no-soup-for-you apps/11-daily-verse-english/audio/no-soup-for-you.mp3
```

manifest의 `src`는 `/api/audio-clip?id=no-soup-for-you`처럼 지정한다. 이 API는 iPhone Safari의 byte-range 요청 및 로컬 파일 폴백을 지원한다.
