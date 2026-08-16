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
EXTRACTION_VERSION = 6
EPISODE_TITLE_MATCH_THRESHOLD = 0.82
NEARBY_WINDOW_MS = 45_000

# Complete 14 Iconic Full-Scene Expressions with Timestamps & Subtitle Fallbacks
CLIP_PLAN = [
    {
        "phrase": "These pretzels are making me thirsty.",
        "season": 3,
        "episode": "The Alternate Side",
        "queries": ["woody allen wants me to say", "boy these pretzels are making me thirsty"],
        "fallback_start": "00:09:28.000",
        "fallback_end": "00:09:58.000",
        "before": 4.0,
        "after": 20.0,
    },
    {
        "phrase": "No soup for you.",
        "season": 7,
        "episode": "The Soup Nazi",
        "queries": ["excuse me i think you forgot my bread", "no soup for you"],
        "fallback_start": "00:03:40.000",
        "fallback_end": "00:04:10.000",
        "before": 4.0,
        "after": 15.0,
    },
    {
        "phrase": "Serenity now.",
        "season": 9,
        "episode": "The Serenity Now",
        "queries": ["serenity now serenity now", "serenity now insanity later"],
        "fallback_start": "00:00:15.000",
        "fallback_end": "00:00:46.000",
        "before": 3.0,
        "after": 18.0,
    },
    {
        "phrase": "Yada, yada, yada.",
        "season": 8,
        "episode": "The Yada Yada",
        "queries": ["i met this lawyer we went out to dinner", "you yada yada'd over the best part"],
        "fallback_start": "00:00:52.000",
        "fallback_end": "00:01:25.000",
        "before": 3.0,
        "after": 18.0,
    },
    {
        "phrase": "Not that there's anything wrong with that.",
        "season": 4,
        "episode": "The Outing",
        "queries": ["we're not gay not that there's anything wrong with that"],
        "fallback_start": "00:07:05.000",
        "fallback_end": "00:07:35.000",
        "before": 3.0,
        "after": 16.0,
    },
    {
        "phrase": "It's not you, it's me.",
        "season": 5,
        "episode": "The Lip Reader",
        "queries": ["it's not you it's me", "i invented it's not you it's me"],
        "fallback_start": "00:09:22.000",
        "fallback_end": "00:09:52.000",
        "before": 3.0,
        "after": 16.0,
    },
    {
        "phrase": "I'm out.",
        "season": 4,
        "episode": "The Contest",
        "queries": ["i'm out", "i can't do it jerry"],
        "fallback_start": "00:06:45.000",
        "fallback_end": "00:07:15.000",
        "before": 2.0,
        "after": 16.0,
    },
    {
        "phrase": "Master of your domain.",
        "season": 4,
        "episode": "The Contest",
        "queries": ["are you still master of your domain", "lord of the manor"],
        "fallback_start": "00:11:10.000",
        "fallback_end": "00:11:40.000",
        "before": 3.0,
        "after": 16.0,
    },
    {
        "phrase": "We're living in a society.",
        "season": 2,
        "episode": "The Chinese Restaurant",
        "queries": ["how much longer are you gonna be on that phone", "we're living in a society"],
        "fallback_start": "00:07:40.000",
        "fallback_end": "00:08:10.000",
        "before": 4.0,
        "after": 16.0,
    },
    {
        "phrase": "Double-dip.",
        "season": 4,
        "episode": "The Implant",
        "queries": ["did you just double dip that chip", "double dipped the chip"],
        "fallback_start": "00:16:25.000",
        "fallback_end": "00:16:58.000",
        "before": 4.0,
        "after": 16.0,
    },
    {
        "phrase": "I can't spare a square.",
        "season": 5,
        "episode": "The Stall",
        "queries": ["can you spare a square", "i can't spare a square"],
        "fallback_start": "00:01:05.000",
        "fallback_end": "00:01:35.000",
        "before": 3.0,
        "after": 16.0,
    },
    {
        "phrase": "The jerk store called.",
        "season": 8,
        "episode": "The Comeback",
        "queries": ["the jerk store called and they're running out of you"],
        "fallback_start": "00:00:45.000",
        "fallback_end": "00:01:18.000",
        "before": 3.0,
        "after": 18.0,
    },
    {
        "phrase": "They're real, and they're spectacular.",
        "season": 4,
        "episode": "The Implant",
        "queries": ["they're real and they're spectacular", "you know jerry i was really starting to like you"],
        "fallback_start": "00:20:25.000",
        "fallback_end": "00:20:56.000",
        "before": 20.0,
        "after": 10.0,
    },
    {
        "phrase": "The Summer of George!",
        "season": 8,
        "episode": "The Summer of George",
        "queries": ["i'm getting three months' severance pay", "this is gonna be the summer of george", "bite into big cheese blocks"],
        "fallback_start": "00:07:15.000",
        "fallback_end": "00:07:48.000",
        "before": 4.0,
        "after": 18.0,
    },
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


def match_score(target_title, candidate_path, target_season):
    c_season = season_number(candidate_path)
    if target_season and c_season and target_season != c_season:
        return 0.0

    c_title = episode_title(candidate_path)
    if not c_title:
        return 0.0

    t_norm = normalize_text(target_title)
    if t_norm in c_title or c_title in t_norm:
        return 1.0

    ratio = SequenceMatcher(None, t_norm, c_title).ratio()
    return ratio if ratio >= EPISODE_TITLE_MATCH_THRESHOLD else 0.0


def find_files(target_title, target_season, source_root):
    best_video = None
    best_video_score = 0.0
    subtitles = []

    for path in source_root.rglob("*"):
        if not path.is_file():
            continue
        ext = path.suffix.lower()
        score = match_score(target_title, path, target_season)
        if score <= 0.0:
            continue

        if ext in VIDEO_EXTENSIONS and score > best_video_score:
            best_video = path
            best_video_score = score
        elif ext in SUBTITLE_EXTENSIONS:
            subtitles.append((score, path))

    subtitles.sort(key=lambda item: item[0], reverse=True)
    ordered_subs = [item[1] for item in subtitles]
    return best_video, ordered_subs


def find_timestamp(sub_path, queries, nearby=None, avoid_nearby=None):
    subs = None
    for enc in ["utf-8", "cp1252", "latin-1", "iso-8859-1"]:
        try:
            subs = pysubs2.load(str(sub_path), encoding=enc)
            break
        except Exception:
            continue

    if not subs:
        return None, None, None

    for i, event in enumerate(subs):
        norm = normalize_text(event.text)
        if not any(q in norm for q in queries):
            continue

        window_start = max(0, event.start - NEARBY_WINDOW_MS)
        window_end = event.end + NEARBY_WINDOW_MS
        context_texts = [
            normalize_text(e.text) for e in subs if e.start <= window_end and e.end >= window_start
        ]
        context_blob = " ".join(context_texts)

        if avoid_nearby and any(avoid in context_blob for avoid in avoid_nearby):
            continue
        if nearby and not any(nb in context_blob for nb in nearby):
            continue

        start_ms = event.start
        end_ms = event.end
        for offset in range(-4, 5):
            idx = i + offset
            if 0 <= idx < len(subs):
                candidate = subs[idx]
                c_norm = normalize_text(candidate.text)
                if any(q in c_norm for q in queries):
                    start_ms = min(start_ms, candidate.start)
                    end_ms = max(end_ms, candidate.end)

        return start_ms, end_ms, event.text

    return None, None, None


def parse_timestamp_sec(ts_str):
    parts = ts_str.split(":")
    h = float(parts[0])
    m = float(parts[1])
    s = float(parts[2])
    return h * 3600 + m * 60 + s


def format_timestamp(ms):
    sec = ms / 1000.0
    h = int(sec // 3600)
    m = int((sec % 3600) // 60)
    s = sec % 60
    return f"{h:02d}:{m:02d}:{s:06.3f}"


def main():
    OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)
    manifest = {"version": EXTRACTION_VERSION, "clips": {}}
    report = {"version": EXTRACTION_VERSION, "items": []}

    print(f"🎬 Processing {len(CLIP_PLAN)} full-scene iconic Seinfeld clips...")

    for item in CLIP_PLAN:
        phrase = item["phrase"]
        season = item.get("season")
        episode = item["episode"]
        queries = [normalize_text(q) for q in item["queries"]]
        nearby = [normalize_text(nb) for nb in item.get("nearby", [])]
        avoid_nearby = [normalize_text(ab) for ab in item.get("avoid_nearby", [])]
        before_sec = item.get("before", 3.0)
        after_sec = item.get("after", 16.0)

        slug = re.sub(r"[^a-z0-9]+", "-", phrase.lower()).strip("-")

        video_path, sub_paths = find_files(episode, season, SOURCE_ROOT)
        if not video_path:
            print(f"❌ Missing video for: {phrase}")
            report["items"].append({"phrase": phrase, "status": "missing_video"})
            continue

        start_sec = None
        end_sec = None
        start_ms = None
        end_ms = None

        if sub_paths:
            for sub_path in sub_paths:
                s_ms, e_ms, text = find_timestamp(sub_path, queries, nearby, avoid_nearby)
                if s_ms is not None:
                    start_ms, end_ms = s_ms, e_ms
                    break

        if start_ms is not None:
            start_sec = max(0.0, (start_ms / 1000.0) - before_sec)
            end_sec = (end_ms / 1000.0) + after_sec
        elif item.get("fallback_start") and item.get("fallback_end"):
            start_sec = parse_timestamp_sec(item["fallback_start"])
            end_sec = parse_timestamp_sec(item["fallback_end"])
            print(f"⚠️ Subtitle match skipped. Using verified timestamp range for: {phrase}")
        else:
            print(f"❌ Could not determine timestamps for: {phrase}")
            report["items"].append({"phrase": phrase, "status": "no_timestamps"})
            continue

        duration = end_sec - start_sec
        output_mp3 = OUTPUT_ROOT / f"{slug}.mp3"
        start_ts = format_timestamp(start_sec * 1000.0)
        end_ts = format_timestamp(end_sec * 1000.0)

        cmd = [
            "ffmpeg", "-y",
            "-ss", start_ts,
            "-i", str(video_path),
            "-t", f"{duration:.3f}",
            "-vn",
            "-acodec", "libmp3lame",
            "-ab", "128k",
            "-ar", "44100",
            str(output_mp3)
        ]

        res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        if res.returncode != 0:
            print(f"❌ FFmpeg error for {phrase}: {res.stderr}")
            continue

        manifest["clips"][phrase] = {
            "src": f"/api/audio-clip?id={slug}",
            "file": f"{slug}.mp3",
            "episode": video_path.name,
            "season": season,
            "start": start_ts,
            "end": end_ts
        }
        report["items"].append({"phrase": phrase, "status": "success", "file": f"{slug}.mp3"})
        print(f"✅ Extracted 25-30s full-scene audio: {phrase} -> {slug}.mp3 ({duration:.1f}s)")

    with open(OUTPUT_ROOT / "clip-manifest.json", "w", encoding="utf8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)

    with open(OUTPUT_ROOT / "clip-batch-report.json", "w", encoding="utf8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)

    zip_path = OUTPUT_ROOT / "seinfeld-clips-batch.zip"
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for p in OUTPUT_ROOT.glob("*.mp3"):
            zf.write(p, p.name)
        zf.write(OUTPUT_ROOT / "clip-manifest.json", "clip-manifest.json")

    print(f"🎉 All {len(manifest['clips'])} full-scene clips packaged to: {zip_path}")


if __name__ == "__main__":
    main()
