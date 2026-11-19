# LEONIDA ATLAS — GTA VI Trophy Field Guide

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/vidovizio/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/vidovizio/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An original, offline-first PS5 trophy checklist, roadmap, and spoiler-aware progress tracker for Grand Theft Auto VI. The interface uses CSS-only city light and a dark field-notes palette; it contains no game imagery or external runtime dependencies.

## Run locally

From the repository root:

```sh
node serve.ts
```

Open http://localhost:8080. The static server serves only `app/`.

## Features

- All 55 supplied PS5 trophies with names, descriptions, grades, trophy kinds, stages, checklist steps, and per-entry source links.
- Progress stored in this browser, with earned totals and grade counts; export a JSON backup or import one on another device.
- Search by trophy name and filters for story, missables, collectibles, activities, and online.
- Story spoiler switch masks names and descriptions until marked earned.
- A five-phase route to the platinum with chapter progression, collectible targets, activity totals, and an explicit missable-status note.
- Original guide notes distinguish requirements stated by the trophy descriptions from methods that have not been independently documented.
- Four deterministic browser scenes are available with `?shot=checklist`, `?shot=guide`, `?shot=roadmap`, and `?shot=filters`.

## Controls

Select a trophy row to open its guide. Use the round button at left to mark it earned. The search box filters names; the left rail narrows by category. Turn **Story spoilers** on to conceal unearned story trophy names and descriptions. **Export** downloads progress; **Import** restores a previous JSON export.

## Source note

The trophy reference supplied with the kit is the basis for the official wording and count targets. Exophase returned no response, PSNProfiles returned a 403, and the PowerPyx GTA VI category was unavailable when checked. Therefore the guide does not claim a verified missable list or invent unconfirmed locations and walkthrough steps. The sources are linked beside each entry for readers to re-check.

Entered on [make.fun](https://make.fun/?ref=quick-robin-90&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards
