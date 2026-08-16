# Workspace Guidelines for Seinfeld English

## Audio Clip & Curriculum Gold Standard

Whenever creating or extracting new Seinfeld English daily expressions or audio clips:

1. **Complete Scene Context Standard (No Arbitrary Line Limit)**:
   - Do NOT restrict dialogue to an arbitrary 3~4 lines if the scene needs 5~8 lines for full comedic context.
   - Always include the full scene exchange (setup, escalation, key expression, reaction, and hilarious punchline) so the entire scene is fully understood, vivid, and memorable.

2. **Audio Extraction Padding Rules**:
   - `before`: 1.5s ~ 2.0s (ensure opening speaker's word is never clipped).
   - `after`: 4.0s ~ 6.0s (allow final reaction line to finish naturally).
   - Multi-sentence `queries` and `avoid_nearby` must be configured to prevent matching wrong/unrelated scenes in the episode.

3. **No Synthetic TTS Audio**:
   - Always rely on authentic Seinfeld sitcom original audio clips. Do not use robotic or synthetic TTS fallback.
