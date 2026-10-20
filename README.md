# Jee OS 2.5.0 — Continuous 6-Hour PCM Plan

This is the core JEE planner build. Notes Studio is intentionally omitted. The project retains the supplied tracker, playlist links, test/revision system, local progress, optional Supabase sync, and Android build workflow.

## Curriculum
- Physics: 43 chapters / 481 listed lectures
- Chemistry: 49 chapters / 868 listed lectures
- Maths: 37 chapters / 1,376 listed lectures
- Total: 129 chapters / 2,725 listed lectures
- `tracker.json` is the active seed; `playlist-durations.json` supplies average durations where available.

## Daily planner
- Monday through Saturday use one continuous 6-hour study block: Physics 2 hours, Chemistry 2 hours, Maths 2 hours.
- Each subject progresses through its own chapters in tracker order.
- Videos are estimated from playlist-average original durations divided by 1.5 for the playback speed. These are estimates, not exact per-video durations.
- Videos are never split. If the next whole video does not fit the remaining subject-hour, it carries into the next slot for that subject; unused time remains available for revision/practice. A video estimated longer than a full subject-hour would be placed in a dedicated whole-video overrun slot.
- Sundays remain protected for the existing test/rest system; no special kickoff-date exceptions are used.

## Run on Windows
1. Install Node.js 22 or newer.
2. Extract the ZIP into a writable folder.
3. Double-click `start.bat`.
4. Jee OS opens in your default browser at `http://127.0.0.1:3000`.
Do not open `index.html` directly.

## Playlist duration refresh (optional)
The included backend script can refresh playlist duration averages using the YouTube Data API v3. It requires your own API key in the terminal environment; no API key is bundled. In PowerShell, from the project folder:

```powershell
$env:YOUTUBE_API_KEY="YOUR_YOUTUBE_DATA_API_V3_KEY"
npm run refresh:durations
```

Restrict the key to YouTube Data API v3 and do not paste or commit the key. Public playlist videos are supported, while private, deleted, restricted or unavailable videos may not return data. The app also works with the included duration data without refreshing it.

## Android
Capacitor configuration and the GitHub Actions APK workflow are included. The APK itself is not prebuilt in this ZIP. Push the project to GitHub and run the workflow to produce a debug APK. The workflow keeps the Watch buttons while removing chapter-link editing controls from the APK.

## Notes
- Notes Studio and all transcript/notes upload UI are omitted from this version by design.
- Local progress stays in this browser's storage. Supabase cloud sync remains optional.
- See `PATCH-NOTES-2.4.0.txt` and `FINAL-AUDIT.md` for the version summary and checks performed.
