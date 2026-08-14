# Seinfeld 실제 음성 클립

원본 영상은 Google Drive에 그대로 두고 Colab에서 마운트해 사용한다. 저장소와 앱에는 선택한 장면의 짧은 MP3만 둔다.

## 추출

1. `tools/seinfeld-clip-extractor.ipynb`를 Google Colab에서 연다.
2. 첫 셀을 실행해 Drive를 마운트한다.
3. `Run all`을 실행하면 첫 `No soup for you` 클립과 manifest가 자동 생성된다.
4. 이후에는 자막 검색 결과에서 원하는 장면을 확인하고 `extract_clip(...)`을 실행한다.

노트북은 현재 Drive에서 확인된 `MyDrive/Seinfeld (small size_torrent)`를 기본 원본 경로로 사용한다. 출력은 `MyDrive/Seinfeld English Clips`에 생성된다.

```text
Seinfeld English Clips/
  clip-manifest.json
  no-soup-for-you.mp3
  serenity-now.mp3
```

## 앱 연결

출력 폴더의 MP3와 `clip-manifest.json`을 아래 폴더에 둔다.

```text
apps/11-daily-verse-english/audio/
```

앱은 오늘 표현과 동일한 manifest 키가 있으면 실제 클립을 먼저 재생한다. 파일이 없거나 재생에 실패하면 기존 브라우저 음성으로 자동 전환한다.

생성 MP3와 실제 manifest는 `.gitignore`에 포함되어 있다. 개인 감상 범위를 벗어난 공개 배포나 공유에는 원저작물의 이용 조건을 별도로 확인해야 한다.
