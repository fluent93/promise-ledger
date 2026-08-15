from __future__ import annotations

from difflib import SequenceMatcher
import html
import json
from pathlib import Path
import re
import subprocess
import unicodedata
import zipfile

import os
import pysubs2


SOURCE_ROOT = Path("/content/drive/MyDrive/Seinfeld (small size_torrent)")
OUTPUT_ROOT = Path("/content/drive/MyDrive/Seinfeld English Clips")
VIDEO_EXTENSIONS = {".avi", ".mkv", ".mp4", ".m4v", ".mpg", ".mpeg"}
SUBTITLE_EXTENSIONS = {".srt", ".ass", ".ssa", ".vtt"}
EXTRACTION_VERSION = 3
EPISODE_TITLE_MATCH_THRESHOLD = 0.82
NEARBY_WINDOW_MS = 45_000

CLIP_PLAN = [
    {"phrase": "What's the deal with...?", "season": 8, "episode": "The Summer of George", "queries": ["what's the deal with those guys down in the pit", "what's the deal with"]},
    {"phrase": "Yada, yada, yada.", "season": 8, "episode": "The Yada Yada", "queries": ["you yada yada'd over the best part", "yada yada'd over the best part", "yada yada'd", "yada yada yada"]},
    {"phrase": "Not that there's anything wrong with that.", "season": 4, "episode": "The Outing", "queries": ["not that there's anything wrong with that", "not that there is anything wrong with that", "anything wrong with that"]},
    {"phrase": "It's not you, it's me.", "season": 5, "episode": "The Lip Reader", "queries": ["this is the best break-up line ever invented", "it's not you it's me routine", "it's not you it's me"]},
    {"phrase": "I'm out.", "season": 4, "episode": "The Contest", "queries": ["i'm out of the contest", "i'm out"]},
    {"phrase": "Serenity now.", "season": 9, "episode": "The Serenity Now", "queries": ["serenity now insanity later", "serenity now"]},
    {"phrase": "That's a shame.", "season": 5, "episode": "The Stall", "queries": ["what a shame", "that's a shame"]},
    {"phrase": "Get out!", "season": 2, "episode": "The Apartment", "queries": ["get out"]},
    {"phrase": "Giddy up!", "season": 2, "episode": "The Baby Shower", "queries": ["giddy up", "giddy-up", "giddyup", "giddap"]},
    {"phrase": "We're living in a society.", "season": 2, "episode": "The Chinese Restaurant", "queries": ["we're living in a society"]},
    {"phrase": "Double-dip.", "season": 4, "episode": "The Implant", "queries": ["double dip that chip", "double dipped the chip"], "before": 4.0, "after": 7.0},
    {"phrase": "I can't spare a square.", "season": 5, "episode": "The Stall", "queries": ["i can't spare a square"]},
    {"phrase": "No soup for you.", "season": 7, "episode": "The Soup Nazi", "queries": ["no soup for you"], "before": 11.0, "after": 2.0},
    {
        "phrase": "These pretzels are making me thirsty.",
        "season": 3,
        "episode": "The Alternate Side",
        "queries": ["boy these pretzels are making me thirsty", "these pretzels are making me thirsty"],
        "nearby": ["working on it", "boy these pretzels", "thirsty"],
        "avoid_nearby": ["seven dates", "face to face", "over the limit", "i m coming down", "shut up i hear you"],
        "before": 0.5,
        "after": 5.5,
    },
    {"phrase": "I was in the pool!", "season": 5, "episode": "The Hamptons", "queries": ["i was in the pool"]},
    {"phrase": "Master of your domain.", "season": 4, "episode": "The Contest", "queries": ["master of your domain"]},
    {"phrase": "You are so good-looking.", "season": 3, "episode": "The Good Samaritan", "queries": ["you are so good-looking", "you're so good-looking"]},
    {"phrase": "A Festivus for the rest of us.", "season": 9, "episode": "The Strike", "queries": ["a festivus for the rest of us"]},
    {"phrase": "They're real, and they're spectacular.", "season": 4, "episode": "The Implant", "queries": ["they're real and they're spectacular"]},
    {"phrase": "I don't wanna be a pirate.", "season": 5, "episode": "The Puffy Shirt", "queries": ["i don't wanna be a pirate", "i don't want to be a pirate", "wanna be a pirate", "want to be a pirate"]},
    {"phrase": "The jerk store called.", "season": 8, "episode": "The Comeback", "queries": ["the jerk store called", "jerk store called", "jerk store"]},
    {"phrase": "Maybe the dingo ate your baby.", "season": 3, "episode": "The Stranded", "queries": ["maybe the dingo ate your baby"]},
    {"phrase": "You're killing independent George!", "season": 7, "episode": "The Pool Guy", "queries": ["you're killing independent george"]},
    {"phrase": "I choose not to run.", "season": 6, "episode": "The Race", "queries": ["i choose not to run", "choose not to run", "i choose not to"]},
    {"phrase": "That's gold.", "season": 8, "episode": "The Fatigues", "queries": ["that's gold jerry gold", "it's gold jerry gold"]},
    {"phrase": "They're all Twix!", "season": 9, "episode": "The Dealership", "queries": ["they're all twix"]},
    {"phrase": "He's a close talker.", "season": 5, "episode": "The Raincoats", "queries": ["he's nice a bit of a close talker", "close talker"]},
    {"phrase": "It's sponge-worthy.", "season": 7, "episode": "The Sponge", "queries": ["really spongeworthy", "spongeworthy"]},
    {"phrase": "You know how to take it; you just don't know how to hold it.", "season": 3, "episode": "The Alternate Side", "queries": ["you know how to take the reservation", "don't know how to hold the reservation"], "before": 4.0, "after": 6.0},
]


def normalize_text(value):
    value = html.unescape(unicodedata.normalize("NFKC", value)).lower()
    value = re.sub(r"<[^>]+>", " ", value)
    value = re.sub(r"[^a-z0-9]+", " ", value)
    value = re.sub(r"\bl\b", "i", value)
    return " ".join(value.split())


def episode_title(path):
    value = re.sub(r"\.(en|eng)$", "", path.stem, flags=re.IGNORECASE)
    value = re.sub(r"\[[^]]+\]|\([^)]*\)", " ", value)
    value = re.sub(r"^\s*seinfeld\s*-\s*", "", value, flags=re.IGNORECASE)
    value = re.sub(r"^\s*\d+x\d+(?:-\d+)?\s*-\s*", "", value, flags=re.IGNORECASE)
    value = re.sub(r"^\s*\d{1,3}(?:\s*,\s*\d{1,3})?\s*-\s*", "", value)
    value = re.sub(r"\s*-\s*$", "", value)
    return normalize_text(value)


def season_number(path):
    match = re.search(r"(?:^|\D)([1-9])x\d{1,2}", path.name, flags=re.IGNORECASE)
    if match:
        return int(match.group(1))
    for part in path.parts:
        match = re.search(r"season\s*([1-9])", part, flags=re.IGNORECASE)
        if match:
            return int(match.group(1))
    return None


def load_subtitles(path):
    for encoding in ("utf-8", "cp1252", "cp949"):
        try:
            return pysubs2.load(str(path), encoding=encoding)
        except (UnicodeDecodeError, LookupError):
            continue
        except Exception:
            return None
    return None


def slugify(value):
    value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii").lower()
    return re.sub(r"[^a-z0-9]+", "-", value).strip("-")[:72] or "clip"


def format_seconds(value):
    milliseconds = round(value * 1000)
    hours, milliseconds = divmod(milliseconds, 3_600_000)
    minutes, milliseconds = divmod(milliseconds, 60_000)
    seconds, milliseconds = divmod(milliseconds, 1000)
    return f"{hours:02d}:{minutes:02d}:{seconds:02d}.{milliseconds:03d}"


def matching_video(title, videos_by_title):
    key = normalize_text(title)
    if key in videos_by_title:
        return videos_by_title[key]
    scored = [(SequenceMatcher(None, key, candidate).ratio(), video) for candidate, video in videos_by_title.items()]
    score, video = max(scored, default=(0, None), key=lambda item: item[0])
    return video if score >= EPISODE_TITLE_MATCH_THRESHOLD else None


def episode_title_matches(actual, expected):
    if actual == expected:
        return True
    return SequenceMatcher(None, actual, expected).ratio() >= EPISODE_TITLE_MATCH_THRESHOLD


def nearby_text(episode_cues, match, window_ms=NEARBY_WINDOW_MS):
    start = match["start_ms"]
    return " ".join(
        cue["normalized"]
        for cue in episode_cues
        if abs(cue["start_ms"] - start) <= window_ms
    )


def cue_fits_context(plan, episode_cues, match):
    window = nearby_text(episode_cues, match)
    avoid = [normalize_text(item) for item in plan.get("avoid_nearby", [])]
    if any(item and item in window for item in avoid):
        return False
    required = [normalize_text(item) for item in plan.get("nearby", [])]
    if not required:
        return True
    return any(item and item in window for item in required)


def search_cues(plan, pool):
    for query_index, query in enumerate(plan["queries"]):
        needle = normalize_text(query)
        matches = [cue for cue in pool if needle and needle in cue["normalized"]]
        if not matches:
            continue
        matches.sort(key=lambda cue: cue["start_ms"])
        contextual = [cue for cue in matches if cue_fits_context(plan, pool, cue)]
        if contextual:
            return contextual[0], query_index
        if not plan.get("nearby") and not plan.get("avoid_nearby"):
            return matches[0], query_index
    return None, None


def find_match(plan, cues):
    expected_title = normalize_text(plan["episode"])
    season_cues = [cue for cue in cues if cue["season"] == plan["season"]]
    episode_cues = [
        cue
        for cue in season_cues
        if episode_title_matches(cue["subtitle_title"], expected_title)
    ]
    match = search_cues(plan, episode_cues)
    if match[0] is not None:
        return match
    return search_cues(plan, season_cues)


def extract_clip(plan, cue, video):
    before = plan.get("before", 5.0)
    after = plan.get("after", 4.0)
    start = max(0, cue["start_ms"] / 1000 - before)
    end = cue["end_ms"] / 1000 + after
    duration = end - start
    if duration <= 0 or duration > 30:
        raise ValueError(f"Invalid clip duration: {duration:.3f}s")

    output = OUTPUT_ROOT / f"{slugify(plan['phrase'])}.mp3"
    command = [
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
        "-ss", f"{start:.3f}", "-i", str(video), "-t", f"{duration:.3f}",
        "-vn", "-ac", "1", "-ar", "44100", "-b:a", "96k", str(output),
    ]
    subprocess.run(command, check=True)
    return output, start, end


def main():
    if not SOURCE_ROOT.exists():
        raise FileNotFoundError(f"Drive source folder not found: {SOURCE_ROOT}")
    OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)

    videos = sorted(path for path in SOURCE_ROOT.rglob("*") if path.suffix.lower() in VIDEO_EXTENSIONS)
    videos_by_title = {episode_title(video): video for video in videos}
    subtitle_paths = sorted(path for path in SOURCE_ROOT.rglob("*") if path.suffix.lower() in SUBTITLE_EXTENSIONS)

    cues = []
    for subtitle_path in subtitle_paths:
        season = season_number(subtitle_path)
        if season is None:
            continue
        subtitles = load_subtitles(subtitle_path)
        if subtitles is None:
            continue
        for cue in subtitles:
            text = " ".join(cue.plaintext.splitlines())
            cues.append({
                "season": season,
                "subtitle": subtitle_path,
                "subtitle_title": episode_title(subtitle_path),
                "start_ms": cue.start,
                "end_ms": cue.end,
                "text": text,
                "normalized": normalize_text(text),
            })

    print(f"Videos: {len(videos)}, subtitles: {len(subtitle_paths)}, searchable cues: {len(cues):,}")
    manifest_path = OUTPUT_ROOT / "clip-manifest.json"
    manifest = {"version": EXTRACTION_VERSION, "clips": {}}
    if manifest_path.exists():
        try:
            existing_manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
            if existing_manifest.get("version") == EXTRACTION_VERSION:
                manifest = existing_manifest
            else:
                print("Extraction version changed; regenerating every clip.")
        except (json.JSONDecodeError, OSError):
            pass
    manifest.setdefault("clips", {})

    only_phrase = os.environ.get("CLIP_PHRASE", "").strip()
    plans = [plan for plan in CLIP_PLAN if not only_phrase or plan["phrase"] == only_phrase]
    if only_phrase and not plans:
        raise ValueError(f"Unknown CLIP_PHRASE: {only_phrase}")
    force_reextract = os.environ.get("FORCE_REEXTRACT") == "1"

    report = []
    for index, plan in enumerate(plans, start=1):
        print(f"[{index:02d}/{len(plans)}] {plan['phrase']}")
        existing = manifest["clips"].get(plan["phrase"])
        existing_path = OUTPUT_ROOT / existing.get("file", "") if existing else None
        if existing_path and existing_path.is_file() and not force_reextract:
            report.append({
                "phrase": plan["phrase"],
                "status": "generated",
                "existing": True,
                **existing,
            })
            print(f"  existing: {existing_path.name}")
            continue
        cue, query_index = find_match(plan, cues)
        video = matching_video(plan["episode"], videos_by_title)
        if cue is None or video is None:
            report.append({
                "phrase": plan["phrase"],
                "status": "missing",
                "subtitleFound": cue is not None,
                "videoFound": video is not None,
            })
            print("  MISSING")
            continue
        try:
            output, start, end = extract_clip(plan, cue, video)
            manifest["clips"][plan["phrase"]] = {
                "file": output.name,
                "episode": video.name,
                "start": format_seconds(start),
                "end": format_seconds(end),
            }
            report.append({
                "phrase": plan["phrase"],
                "status": "generated",
                "file": output.name,
                "episode": video.name,
                "subtitle": str(cue["subtitle"].relative_to(SOURCE_ROOT)),
                "matchedText": cue["text"],
                "query": plan["queries"][query_index],
                "start": format_seconds(start),
                "end": format_seconds(end),
            })
            print(f"  {output.name} ({output.stat().st_size / 1024:.1f} KB)")
            print(f"  matched: {cue['text']}")
        except Exception as error:
            report.append({"phrase": plan["phrase"], "status": "error", "error": str(error)})
            print(f"  ERROR: {error}")

    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    report_path = OUTPUT_ROOT / "clip-batch-report.json"
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    zip_path = OUTPUT_ROOT / "seinfeld-clips-batch.zip"
    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        archive.write(manifest_path, manifest_path.name)
        archive.write(report_path, report_path.name)
        for item in manifest["clips"].values():
            clip_path = OUTPUT_ROOT / item["file"]
            if clip_path.exists():
                archive.write(clip_path, clip_path.name)

    generated = sum(item["status"] == "generated" for item in report)
    missing = [item["phrase"] for item in report if item["status"] != "generated"]
    print(f"\nGenerated: {generated}/{len(plans)}")
    print(f"ZIP: {zip_path} ({zip_path.stat().st_size / 1024 / 1024:.1f} MB)")
    if missing:
        print("Needs review:")
        for phrase in missing:
            print(f"- {phrase}")


if __name__ == "__main__":
    main()
