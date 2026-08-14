# Seinfeld 전체 시즌 커리큘럼

목표는 전체 방송분에서 회당 5개의 실용 표현을 골라 최대 약 900개의 고유 학습 항목을 만드는 것이다. 합본 회차와 자막 파일 구성에 따라 실제 카탈로그 수는 달라질 수 있다. 앱은 하루에 한 항목만 보여주며, 전체 커리큘럼을 마치기 전에는 반복하지 않는다.

## Build Candidates

Drive의 `Seinfeld English Clips/seinfeld-curriculum-builder.ipynb`를 [Colab에서 열고](https://colab.research.google.com/drive/1BOGCMjsUeVvWPD5_dW26J1ZOCdRQqZHu) `Run all`을 실행한다. 원본 영상은 Drive에 그대로 있고 다음 작은 JSON만 출력된다.

```text
Seinfeld English Clips/
  episode-catalog.json
  curriculum-candidates.json
```

`episode-catalog.json`은 영문 자막, 한글 자막, 영상의 회차별 연결 상태를 기록한다. `curriculum-candidates.json`은 자막에서 자동 선정한 회당 5개의 후보와 타임코드를 기록한다.

## Review Gate

자동 후보는 앱 데이터가 아니다. 다음 조건을 모두 만족한 항목만 앱으로 승격한다.

1. 실제 생활에서 재사용할 가치가 있는 표현인가.
2. 표시할 두 줄이 같은 실제 장면인가.
3. 화자 이름이 영상과 일치하는가.
4. 영어와 한국어 자막의 의미가 맞는가.
5. 클립 시작과 끝이 20초 이내에서 자연스러운가.

현재 Drive에서 확인된 한글 자막은 시즌 1-5 중심이다. 시즌 6-9의 번역은 `translationStatus: missing`으로 남기고 별도 검수한다. OpenAI API를 사용하지 않는다.
