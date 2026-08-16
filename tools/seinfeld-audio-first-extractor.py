"""
Seinfeld English — Audio-First Reverse Pipeline Extractor
==========================================================
Workflow:
1. Cut 10~20 second audio clip directly from video (Audio First).
2. Play & Listen to verify audio quality and 3~4 line dialogue flow.
3. Transcribe exact dialogue lines and key expression.
4. Auto-update manifest & export MP3 to apps/11-daily-verse-english/audio/.
"""

import json
from pathlib import Path
import subprocess

def extract_audio_clip(video_path: Path, start_time: str, duration_sec: float, output_mp3: Path):
    """
    Cut an MP3 clip directly from source video file using ffmpeg.
    """
    cmd = [
        "ffmpeg",
        "-y",
        "-ss", start_time,
        "-i", str(video_path),
        "-t", str(duration_sec),
        "-vn",
        "-acodec", "libmp3lame",
        "-ab", "128k",
        "-ar", "44100",
        str(output_mp3)
    ]
    result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"FFmpeg failed: {result.stderr}")
    return output_mp3

def register_clip(
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
    Register verified audio clip and exact transcribed dialogue into manifest.
    """
    manifest = {"version": 3, "clips": {}}
    if manifest_path.exists():
        try:
            with open(manifest_path, "r", encoding="utf8") as f:
                manifest = json.load(f)
        except Exception:
            pass

    manifest["clips"][phrase] = {
        "src": f"/api/audio-clip?id={slug}",
        "file": f"{slug}.mp3",
        "episode": episode,
        "season": season,
        "dialogue": dialogue
    }

    with open(manifest_path, "w", encoding="utf8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)

    print(f"✅ Registered clip '{phrase}' -> {slug}.mp3 with {len(dialogue)} dialogue lines.")
