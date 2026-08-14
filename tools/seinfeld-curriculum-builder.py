from __future__ import annotations

from datetime import datetime, timezone
from difflib import SequenceMatcher
from html import unescape
import json
from pathlib import Path
import re

import pysubs2


SOURCE_ROOT = Path("/content/drive/MyDrive/Seinfeld (small size_torrent)")
OUTPUT_ROOT = Path("/content/drive/MyDrive/Seinfeld English Clips")
CANDIDATES_PER_EPISODE = 5

VIDEO_EXTENSIONS = {".avi", ".mkv", ".mp4", ".m4v"}
ENGLISH_SUBTITLE_EXTENSIONS = {".srt", ".ass", ".ssa", ".vtt"}
ALL_SUBTITLE_EXTENSIONS = ENGLISH_SUBTITLE_EXTENSIONS | {".smi"}

COMMON_PATTERNS = (
    "are you",
    "can you",
    "could you",
    "did you",
    "do you",
    "don't you",
    "have you",
    "how do",
    "how did",
    "i can't",
    "i don't",
    "i mean",
    "i think",
    "i want",
    "i was",
    "i'm gonna",
    "let me",
    "what are",
    "what do",
    "what happened",
    "what if",
    "why are",
    "why don't",
    "would you",
    "you can't",
    "you know",
    "you mean",
)


def normalize_text(value: str) -> str:
    value = unescape(value).lower()
    value = re.sub(r"<[^>]+>", " ", value)
    value = re.sub(r"[^a-z0-9']+", " ", value)
    return " ".join(value.split())


def clean_caption(value: str) -> str:
    value = re.sub(r"(?i)<br\s*/?>", " ", value)
    value = re.sub(r"<[^>]+>", " ", value)
    value = unescape(value).replace("\xa0", " ")
    return " ".join(value.split())


def language_of(value: str) -> str:
    hangul = len(re.findall(r"[가-힣]", value))
    latin = len(re.findall(r"[A-Za-z]", value))
    if hangul > 0 and hangul >= latin * 0.08:
        return "ko"
    return "en" if latin else "unknown"


def episode_ref(path: Path) -> tuple[int, int] | None:
    match = re.search(r"(?i)s(\d{1,2})e(\d{1,2})", path.name)
    if not match:
        match = re.search(r"(?i)(\d{1,2})x(\d{1,2})", path.name)
    if not match:
        return None
    return int(match.group(1)), int(match.group(2))


def episode_title(path: Path) -> str:
    value = re.sub(r"(?i)\.(en|eng|ko)$", "", path.stem)
    value = re.sub(r"(?i)^\s*seinfeld\s*[-.]\s*", "", value)
    value = re.sub(r"(?i)^\s*(?:s\d{1,2}e\d{1,2}(?:e\d{1,2})?|\d{1,2}x\d{1,2})\s*[-.]\s*", "", value)
    value = re.sub(r"^\s*\d{1,3}(?:\s*,\s*\d{1,3})?\s*-\s*", "", value)
    value = re.sub(r"\[[^]]+]", "", value)
    value = re.sub(r"\s*-\s*$", "", value)
    value = re.sub(r"\s*\(\d+\)\s*$", "", value)
    return " ".join(value.replace(".", " ").split())


def title_key(path: Path) -> str:
    return normalize_text(episode_title(path))


def read_text(path: Path) -> str:
    data = path.read_bytes()
    for encoding in ("utf-8-sig", "cp949", "euc-kr", "cp1252"):
        try:
            return data.decode(encoding)
        except UnicodeDecodeError:
            pass
    return data.decode("utf-8", errors="replace")


def load_smi(path: Path) -> list[dict]:
    content = read_text(path)
    syncs = list(re.finditer(r"(?is)<sync\b[^>]*\bstart\s*=\s*['\"]?(\d+)[^>]*>", content))
    cues = []
    for index, sync in enumerate(syncs):
        start_ms = int(sync.group(1))
        end_ms = int(syncs[index + 1].group(1)) if index + 1 < len(syncs) else start_ms + 2500
        body_end = syncs[index + 1].start() if index + 1 < len(syncs) else len(content)
        body = content[sync.end() : body_end]
        paragraphs = re.findall(r"(?is)<p\b[^>]*>(.*?)(?=<p\b|$)", body) or [body]
        for paragraph in paragraphs:
            text = clean_caption(paragraph)
            if not text or text.lower() in {"&nbsp;", "nbsp"}:
                continue
            language = language_of(text)
            if language == "unknown":
                continue
            cues.append({"start_ms": start_ms, "end_ms": end_ms, "text": text, "language": language})
    return cues


def load_standard_subtitle(path: Path) -> list[dict]:
    for encoding in ("utf-8", "cp1252", "cp949"):
        try:
            subtitles = pysubs2.load(str(path), encoding=encoding)
            break
        except Exception:
            subtitles = None
    if subtitles is None:
        return []
    cues = []
    for event in subtitles:
        text = " ".join(event.plaintext.splitlines())
        text = clean_caption(text)
        language = language_of(text)
        if text and language != "unknown":
            cues.append({"start_ms": event.start, "end_ms": event.end, "text": text, "language": language})
    return cues


def load_subtitle(path: Path) -> list[dict]:
    return load_smi(path) if path.suffix.lower() == ".smi" else load_standard_subtitle(path)


def choose_best(existing: tuple[Path, list[dict]] | None, candidate: tuple[Path, list[dict]]):
    if existing is None or len(candidate[1]) > len(existing[1]):
        return candidate
    return existing


def matching_video(subtitle_path: Path, videos_by_title: dict[str, Path]) -> Path | None:
    key = title_key(subtitle_path)
    if key in videos_by_title:
        return videos_by_title[key]
    scored = [(SequenceMatcher(None, key, title).ratio(), video) for title, video in videos_by_title.items()]
    score, video = max(scored, default=(0, None), key=lambda item: item[0])
    return video if score >= 0.82 else None


def useful_score(text: str) -> float:
    normalized = normalize_text(text)
    words = normalized.split()
    if len(words) < 4 or len(words) > 14:
        return -1
    if "www" in normalized or not re.search(r"[a-z]", normalized):
        return -1
    score = 1.0
    if "?" in text:
        score += 2.0
    if re.search(r"\b(?:i|you|we|they|he|she)'(?:m|re|ve|d|ll|s|t)\b", normalized):
        score += 1.5
    score += sum(1.2 for pattern in COMMON_PATTERNS if pattern in normalized)
    if 6 <= len(words) <= 10:
        score += 1.0
    if text.isupper() or len(re.findall(r"[A-Z][a-z]+", text)) > 4:
        score -= 1.0
    return score


def align_translation(cue: dict, korean_cues: list[dict]) -> str:
    best_text = ""
    best_overlap = 0
    for korean in korean_cues:
        overlap = min(cue["end_ms"], korean["end_ms"]) - max(cue["start_ms"], korean["start_ms"])
        if overlap > best_overlap:
            best_overlap = overlap
            best_text = korean["text"]
    if best_text:
        return best_text
    midpoint = (cue["start_ms"] + cue["end_ms"]) / 2
    nearest = min(
        korean_cues,
        default=None,
        key=lambda item: abs((item["start_ms"] + item["end_ms"]) / 2 - midpoint),
    )
    if nearest and abs((nearest["start_ms"] + nearest["end_ms"]) / 2 - midpoint) <= 3000:
        return nearest["text"]
    return ""


def select_candidates(english_cues: list[dict], count: int) -> list[tuple[int, dict]]:
    ranked = sorted(
        ((useful_score(cue["text"]), index, cue) for index, cue in enumerate(english_cues)),
        key=lambda item: (-item[0], item[2]["start_ms"]),
    )
    selected = []
    seen = set()
    for score, index, cue in ranked:
        normalized = normalize_text(cue["text"])
        if score < 0 or normalized in seen:
            continue
        if any(abs(cue["start_ms"] - item[1]["start_ms"]) < 45_000 for item in selected):
            continue
        selected.append((index, cue))
        seen.add(normalized)
        if len(selected) == count:
            break
    return sorted(selected, key=lambda item: item[1]["start_ms"])


def format_seconds(milliseconds: int) -> str:
    hours, milliseconds = divmod(max(0, milliseconds), 3_600_000)
    minutes, milliseconds = divmod(milliseconds, 60_000)
    seconds, milliseconds = divmod(milliseconds, 1000)
    return f"{hours:02d}:{minutes:02d}:{seconds:02d}.{milliseconds:03d}"


def build_curriculum() -> tuple[dict, dict]:
    if not SOURCE_ROOT.exists():
        raise FileNotFoundError(f"SOURCE_ROOT를 실제 Drive 경로로 수정하세요: {SOURCE_ROOT}")
    OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)

    all_files = [path for path in SOURCE_ROOT.rglob("*") if path.is_file()]
    videos = sorted(path for path in all_files if path.suffix.lower() in VIDEO_EXTENSIONS)
    subtitle_files = sorted(path for path in all_files if path.suffix.lower() in ALL_SUBTITLE_EXTENSIONS)
    videos_by_title = {title_key(video): video for video in videos}

    english_by_ref: dict[tuple[int, int], tuple[Path, list[dict]]] = {}
    korean_by_ref: dict[tuple[int, int], tuple[Path, list[dict]]] = {}

    for path in subtitle_files:
        ref = episode_ref(path)
        if ref is None:
            continue
        cues = load_subtitle(path)
        english = [cue for cue in cues if cue["language"] == "en"]
        korean = [cue for cue in cues if cue["language"] == "ko"]
        if english and path.suffix.lower() in ENGLISH_SUBTITLE_EXTENSIONS:
            english_by_ref[ref] = choose_best(english_by_ref.get(ref), (path, english))
        if korean:
            korean_by_ref[ref] = choose_best(korean_by_ref.get(ref), (path, korean))

    lessons = []
    episodes = []
    for ref in sorted(english_by_ref):
        season, episode_number = ref
        subtitle_path, english_cues = english_by_ref[ref]
        korean_path, korean_cues = korean_by_ref.get(ref, (None, []))
        video = matching_video(subtitle_path, videos_by_title)
        title = episode_title(subtitle_path)
        selected = select_candidates(english_cues, CANDIDATES_PER_EPISODE)

        episode_record = {
            "season": season,
            "episodeNumber": episode_number,
            "episode": title,
            "englishSubtitle": str(subtitle_path.relative_to(SOURCE_ROOT)),
            "koreanSubtitle": str(korean_path.relative_to(SOURCE_ROOT)) if korean_path else None,
            "video": str(video.relative_to(SOURCE_ROOT)) if video else None,
            "candidateCount": len(selected),
        }
        episodes.append(episode_record)

        for position, (index, cue) in enumerate(selected, start=1):
            if index > 0:
                context_indices = [index - 1, index]
            elif len(english_cues) > 1:
                context_indices = [0, 1]
            else:
                context_indices = [0]
            context = []
            for context_index in context_indices:
                context_cue = english_cues[context_index]
                context.append(
                    {
                        "speaker": "TBD",
                        "text": context_cue["text"],
                        "translation": align_translation(context_cue, korean_cues),
                    }
                )
            clip_start = max(0, english_cues[context_indices[0]]["start_ms"] - 1000)
            clip_end = min(clip_start + 20_000, cue["end_ms"] + 2000)
            lessons.append(
                {
                    "id": f"s{season:02d}e{episode_number:02d}-{position:02d}",
                    "phrase": cue["text"],
                    "meaning": align_translation(cue, korean_cues),
                    "example": context,
                    "source": {"season": season, "episodeNumber": episode_number, "episode": title},
                    "clip": {
                        "video": episode_record["video"],
                        "start": format_seconds(clip_start),
                        "end": format_seconds(clip_end),
                    },
                    "status": "candidate",
                    "requiresSpeakerReview": True,
                    "translationStatus": "subtitle" if context[-1]["translation"] else "missing",
                }
            )

    generated_at = datetime.now(timezone.utc).isoformat()
    curriculum = {
        "version": 1,
        "generatedAt": generated_at,
        "targetLessonsPerEpisode": CANDIDATES_PER_EPISODE,
        "lessons": lessons,
    }
    catalog = {
        "version": 1,
        "generatedAt": generated_at,
        "sourceRoot": SOURCE_ROOT.name,
        "episodeCount": len(episodes),
        "lessonCandidateCount": len(lessons),
        "koreanSubtitleEpisodeCount": sum(1 for episode in episodes if episode["koreanSubtitle"]),
        "matchedVideoEpisodeCount": sum(1 for episode in episodes if episode["video"]),
        "episodes": episodes,
    }
    return curriculum, catalog


def main() -> None:
    curriculum, catalog = build_curriculum()
    curriculum_path = OUTPUT_ROOT / "curriculum-candidates.json"
    catalog_path = OUTPUT_ROOT / "episode-catalog.json"
    curriculum_path.write_text(json.dumps(curriculum, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    catalog_path.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Episodes indexed: {catalog['episodeCount']}")
    print(f"Candidates created: {catalog['lessonCandidateCount']}")
    print(f"Episodes with Korean subtitles: {catalog['koreanSubtitleEpisodeCount']}")
    print(f"Episodes matched to video: {catalog['matchedVideoEpisodeCount']}")
    print(f"Output: {curriculum_path}")


if __name__ == "__main__":
    main()
