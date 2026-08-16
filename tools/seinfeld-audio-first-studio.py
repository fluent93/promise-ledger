"""
Seinfeld English — Audio-First Studio Extractor
===============================================
Interactive tool to slice high-quality MP3 clips from Google Drive video files,
listen to the audio preview, transcribe the exact 3-4 dialogue lines,
and update the Seinfeld English PWA catalog.
"""

from pathlib import Path
import subprocess
import json
import os

SOURCE_ROOT = Path("/content/drive/MyDrive/Seinfeld (small size_torrent)")
OUTPUT_ROOT = Path("/content/drive/MyDrive/Seinfeld English Clips")

def find_video_file(episode_query: str, source_dir: Path = SOURCE_ROOT) -> Path:
    """Find video file by episode number or name."""
    extensions = {".avi", ".mkv", ".mp4", ".m4v", ".mpg", ".mpeg"}
    query_clean = episode_query.lower().strip()
    
    for path in source_dir.rglob("*"):
        if path.is_file() and path.suffix.lower() in extensions:
            if query_clean in path.name.lower():
                return path
    raise FileNotFoundError(f"No video file matching '{episode_query}' found in {source_dir}")

def slice_audio_clip(video_path: Path, start_timestamp: str, duration_sec: float, output_path: Path) -> Path:
    """
    Slice MP3 audio clip cleanly with libmp3lame encoding.
    """
    output_path.parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        "ffmpeg", "-y",
        "-ss", start_timestamp,
        "-i", str(video_path),
        "-t", str(duration_sec),
        "-vn",
        "-acodec", "libmp3lame",
        "-ab", "128k",
        "-ar", "44100",
        str(output_path)
    ]
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if res.returncode != 0:
        raise RuntimeError(f"FFmpeg slicing failed: {res.stderr}")
    print(f"✅ Audio sliced successfully: {output_path} ({output_path.stat().st_size} bytes)")
    return output_path

def save_manifest_entry(
    manifest_path: Path,
    slug: str,
    phrase: str,
    meaning: str,
    season: int,
    episode: str,
    dialogue: list[dict],
    nuance: str = "",
    modern_usage: list[dict] = None
):
    """
    Save verified entry to manifest.json.
    """
    manifest = {"version": 3, "clips": {}}
    if manifest_path.exists():
        try:
            with open(manifest_path, "r", encoding="utf-8") as f:
                manifest = json.load(f)
        except Exception:
            pass

    manifest["clips"][phrase] = {
        "src": f"/api/audio-clip?id={slug}",
        "file": f"{slug}.mp3",
        "episode": episode,
        "season": season,
        "dialogue": dialogue,
        "meaning": meaning,
        "nuance": nuance,
        "modernUsage": modern_usage or []
    }

    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)

    print(f"🎉 Saved to manifest: '{phrase}' ({len(dialogue)} dialogue lines)")
