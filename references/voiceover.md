# Voiceover: script format, recording, syncing

## Script format (`script.txt`, or ```text blocks inside a .md)
- **One paragraph = one shot.** Blank line between paragraphs.
- Optional delivery tag at the start, in square brackets, describing something *audible*:
  `[Measured, neutral, editorial]`, `[Quiet, warm, unhurried]`. Tags that describe actions or visuals
  (`[pause]`, `[text appears]`) get **read aloud** by TTS — don't use them.
- Someone else's words go in quotation marks, verbatim. Never put quoted words inside brackets.
- Spell numbers out ("twenty twenty-four", "four hundred million") and dot abbreviations meant as
  letters ("E.M.S.", "U.S."). No SSML.
- Pacing: ~150 words/minute for a calm read; ≤ ~6 spoken numbers per minute; a shot every 4–15 s.

## ElevenLabs (Studio, Eleven v4 or newer with audio tags)
Paste the whole block as one generation (consistent voice, no seams), Stability ≈ 0.5,
Similarity ≈ 0.75, Style 0. Generate 2–3 takes; keep the one whose delivery matches the tags.
Use per-paragraph regenerate for a single bad line, then export the whole take. Save as
`VO/part1.mp3` (part N → `VO/partN.mp3`).

## Syncing
```bash
pip install faster-whisper
python3 vosync.py VO/part1.mp3 script.txt timings.json [--block=N] [--model=small.en]
```
It prints `matched X/Y` and every paragraph's start–end. Expect a few unmatched words (numbers the
model writes as digits) — they're interpolated. Read the printed transcript: a dropped or extra
clause means re-record the line, not "fix it in the timings". Then rebuild, check, review, render.

`split_audio.py` cuts per-shot clips (`VO/p1-s01.mp3`…) so each HTML page can play its own audio
via the "Load mp3" button while you fine-tune a shot.
