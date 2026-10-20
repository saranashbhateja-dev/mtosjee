# Jee OS 2.5.0 — Change and Verification Notes

## Schedule model
- Monday through Saturday use one continuous 6-hour study block.
- The daily allocation is Physics 2 hours, Chemistry 2 hours and Maths 2 hours.
- Each subject follows its own chapter order. Complete videos are never split; estimates use playlist-average duration at 1.5x playback.
- Sundays remain protected for the existing test/rest system. Historical kickoff-date exceptions have been removed.
- The scheduler version was bumped to 5 so cached daily schedules are rebuilt.

## Preserved features
- Existing 129-chapter tracker and playlist data.
- Existing revision cycles and Sunday test structure.
- Calendar, progress tracking, local save, backup/import, optional Supabase sync and Android build workflow.

## Checks performed for this patch
- `node --check app.js` passes.
- Reviewed the schedule implementation to confirm one daily allocation of 7,200 seconds per subject, with no Morning/Night grouping in the daily planner.
- Reviewed test scheduling to remove the historical 11 October 2026 exception while retaining Sunday-based tests.

These source checks do not substitute for full browser, live Supabase or Android runtime testing.
