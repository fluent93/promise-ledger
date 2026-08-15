# Workspace Guidelines for Seinfeld English

## Audio Clip & Curriculum Gold Standard

Whenever creating or extracting new Seinfeld English daily expressions or audio clips:

1. **3~4 Line Dialogue Standard**:
   - Never truncate a scene to just 2 short lines. Always include **3 to 4 dialogue exchanges** (setup line, main expression, objection/reaction, punchline) so scene context and humor are preserved.

2. **Audio Extraction Padding Rules**:
   - `before`: 1.5s ~ 1.8s (ensure opening speaker's word is never clipped).
   - `after`: 4.0s ~ 5.5s (allow final reaction line to finish naturally).
   - Multi-sentence `queries` and `avoid_nearby` must be configured to prevent matching wrong/unrelated scenes in the episode.

3. **No Synthetic TTS Audio**:
   - Always rely on authentic Seinfeld sitcom original audio clips. Do not use robotic or synthetic TTS fallback.
