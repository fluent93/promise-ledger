# Seinfeld 실제 음성 클립

원본 영상은 Google Drive에 그대로 두고 Colab에서 마운트해 사용한다. 저장소와 앱에는 선택한 장면의 짧은 MP3만 둔다.

## 추출

1. `tools/seinfeld-clip-extractor.ipynb`를 Google Colab에서 연다.
2. 첫 셀을 실행해 Drive를 마운트한다.
3. `Run all`을 실행하면 현재 29개 표현을 에피소드별로 찾아 일괄 추출한다.
4. 완료 후 `clip-batch-report.json`에서 실제 매칭 문장과 누락 항목을 확인한다.

노트북은 현재 Drive에서 확인된 `MyDrive/Seinfeld (small size_torrent)`를 기본 원본 경로로 사용한다. 출력은 `MyDrive/Seinfeld English Clips`에 생성된다.

```text
Seinfeld English Clips/
  clip-manifest.json
  clip-batch-report.json
  seinfeld-clips-batch.zip
  no-soup-for-you.mp3
  serenity-now.mp3
```

## 앱 연결

출력 폴더의 MP3와 `clip-manifest.json`을 아래 폴더에 둔다.

```text
apps/11-daily-verse-english/audio/
```

배포용 MP3는 공개 GitHub에 넣지 않고 기존 Upstash Redis에 업로드한다.

```bash
npm run audio:upload -- no-soup-for-you apps/11-daily-verse-english/audio/no-soup-for-you.mp3
```

manifest의 `src`는 `/api/audio-clip?id=no-soup-for-you`처럼 지정한다. 이 API는 iPhone Safari의 byte-range 요청을 지원한다. 앱은 오늘 표현과 동일한 manifest 키가 있고 실제 MP3를 읽을 수 있을 때만 듣기 버튼을 활성화하며, 실패해도 브라우저 합성음으로 대체하지 않는다.

일괄 ZIP을 푼 뒤에는 전체 MP3를 Redis에 올리고 앱 manifest를 한 번에 갱신한다.

```bash
npm run audio:import -- .tmp/seinfeld-clips-batch
```

생성 MP3와 실제 manifest는 `.gitignore`에 포함되어 있다. 개인 감상 범위를 벗어난 공개 배포나 공유에는 원저작물의 이용 조건을 별도로 확인해야 한다.
