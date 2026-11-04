# Ta-ti-ti (folder `kodaly`)

Context for every Claude Code session in this folder. Full analysis and plan: [docs/plan.md](docs/plan.md).

- The user writes in Russian: reply in Russian, short and simple.
- Everything in the repository is in English: code, comments, docs, commit messages. The one exception is the Russian dictionary in `src/i18n.js` and `README.ru.md`.

## What this is

A rhythm toy built on Kodály syllables, for an adult learning to read rhythm from scratch. It follows Ottman & Rogers, *Music for Sight Singing*, chapter 1 (exercises 1.1–1.29: the quarter note is the beat, divided in two). The goal is play, not study: listen, tap, build your own.

What the app does:

- Time signatures 2/4, 3/4, 4/4. A line is 8–9 beats: 4 bars of 2/4, 3 bars of 3/4, 2 bars of 4/4.
- Random rhythm generator with three levels: no ti-ti / with ti-ti / with tam-ti.
- "Listen": a count-in bar, then the metronome and a warm tone on every note; the current syllable is shown large on the pad.
- "Tap": a count-in bar, then the metronome alone, no notes. Tap the pad with a finger, or press Space or Enter; Esc stops. Each note is graded: within 70 ms — on the beat, within 150 ms — close, further — miss. A tap is matched to a note within min(280 ms, 48% of the gap to the neighbouring note). `outputLatency` is taken into account. The summary shows the average offset and a hint about Bluetooth headphone delay.
- "Endless": rhythms run back to back without a pause, the next line is visible in advance, the score adds up until "Stop". A rhythm you built loops in this mode.
- "Build your own": the pieces ta, ti-ti, ta-a, ta-a-a, ta-a-a-a, rest, tam-ti fill the bars in order; a piece that does not fit the current bar is disabled.
- Views: "Notes only" (default) and "With blocks" (sound length, like a piano roll).
- Two languages, English by default; EN/RU switch in the header. The choice is saved and sets `<html lang>`.
- Settings are stored in `localStorage` under the key `tatiti`.
- Light and dark themes; fonts Unbounded, Golos Text and IBM Plex Mono, served from `fonts/`.
- Installs to the iPhone Home Screen (manifest, icon "ta ti-ti") and works offline (service worker `sw.js`).

## Decisions not to change without asking

These come from how the user actually plays with it:

- "Notes only" is the default view. During "Tap" nothing moves and nothing is highlighted ahead: a running line makes you watch the picture instead of listening to the metronome.
- A grade appears only after the tap (the note changes colour), never as a hint beforehand.
- The tap sound is off by default: it throws you off. The "Tap sound" button stays.
- "New rhythm" is fresh and random every time. Repeating the same one is boring; variations beat repetition.
- Syllables: ta, ti-ti, ta-a, ta-a-a, ta-a-a-a, sh (rest), tam-ti — in Russian та, ти-ти, та-а, та-а-а, та-а-а-а, ш, там-ти. Add new durations (sixteenths, ties, syncopation, another beat note) only when the user asks.
- Simplicity: one screen, no extra settings, no onboarding.
- On iPhone, silent mode mutes Web Audio, so the hint about it stays.

## How we work

- Step by step. After each step: a commit and a short report.
- Small commits, so any version can be restored.
- Ask before deploying anything new and before buying or setting up anything external. Pushing to `main` redeploys the site — that is the agreed routine.
- Static site: no backend, no framework, no build step.
- After changing any file the app loads (page, styles, `src/`, fonts, icons, manifest): run `npm run stamp`. It puts a new version into `sw.js`, so phones download the update. `npm test` fails until it is done.
- Before every commit: run `npm test`, then open the page and check that "Listen", "Tap", "Endless" and "Build your own" work, in both languages.
- A new file the app loads must be added to `FILES` in `sw.js`, or it will be missing offline. A test checks this.
- Work on `main` (the user's choice).

## How to check

On a real iPhone in Safari — with Bluetooth headphones and without; on a computer in Chrome and Safari; in light and dark theme.

Locally: run `python3 scripts/serve.py` and open http://localhost:8000. It is `http.server` with caching turned off, so edits show on a plain reload (with the stock server the browser can keep stale modules). ES modules do not load from `file://`. For Claude's built-in browser there is `.claude/launch.json` (port 5317).

The service worker is off on localhost so edits show at once; add `?sw` to the URL to test it. To test offline: open `/?sw`, wait until it is installed, stop the server, reload — the app must still open, play and switch languages.

Synthetic taps in the browser (key events timed with `performance.now()`) only line up with the notes when the Mac's audio output has low latency. With Bluetooth output (`outputLatency` about 170 ms) the "on the beat" centre moved between 0 and +130 ms from one page load to another — in the prototype as well. That is a property of how the browser reports latency, not a bug in grading.

Useful check after a refactor: build the same rhythms with the chips and compare the SVG of the strip before and after — it should match byte for byte. The Russian version must still render exactly like the prototype.

## Tasks in order

- [x] 0. `CLAUDE.md` with "What this is" and "Decisions".
- [x] 1. Git. First commit — the prototype `index.html` as is ("prototype from chat"), `.gitignore`. Small commits from then on.
- [x] 2. Structure: `index.html` + `styles.css` + ES modules in `src/`, no build. Pure functions (generator, tap grading, plurals) in their own files. Behaviour unchanged.
- [x] 3. Two languages. English by default, EN/RU switch in the header; the choice is remembered and sets `<html lang>`. All texts in a dictionary. English syllables in Latin letters (ta, ti-ti, ta-a, ta-a-a, ta-a-a-a, sh, tam-ti), count one/two/three/four and "&" instead of "и". Plurals via `Intl.PluralRules` (щелчок/щелчка/щелчков vs click/clicks). English texts are as plain and short as the Russian ones, no marketing.
- [x] 4. Tests for pure functions: `npm test` (Node's built-in runner, no dependencies), files in `tests/`. Generator rules over 18 000 seeded lines (bars filled exactly, no rest first, no two rests in a row, nothing crosses a bar line, only the level's pieces); grading at the 70 and 150 ms boundaries and the search window; plurals (Russian checked against the prototype's formula for 0–1000); both languages have the same keys and placeholders; agreed syllables in both languages.
- [x] 5. Deploy. GitHub Pages from the public repo `mopheadpersona/kodaly`, branch `main`, root folder. Site: https://mopheadpersona.github.io/kodaly/ (HTTPS). Every push to `main` redeploys. Own domain — later.
- [x] 6. Home screen. `manifest.webmanifest`, icons in `icons/` (the user chose "ta ti-ti": ta in orange, ti-ti in dark on the light background, as while playing), Apple tags in `index.html`, fonts served from `fonts/`, service worker `sw.js` caching all 22 files (253 KB). Checked offline in the browser: with the server stopped the app opened, played, graded taps and switched languages.

## Version 2 and later (do not start without being asked)

The user wants harder rhythms later — that is the next version. What chapter 1 of the book has and the app does not yet: ties (including across the bar line), the eighth rest, pick-ups (anacrusis), rests longer than a beat, two-part drills (sections 3 and 5), other beat notes — 2/2, 3/2, 3/8 and so on (section 4). Details and what has to change: [docs/plan.md](docs/plan.md).

## Where things are

- `index.html` — markup. English text by default; elements with `data-i18n` / `data-i18n-aria` are filled from the dictionary.
- `styles.css` — styles and theme colours.
- `src/app.js` — entry point: state, screen, sound, buttons.
- `src/rhythm.js` — pieces, levels, random generator. Pure.
- `src/grading.js` — tap grading: window, grade, matching. Pure.
- `src/notation.js` — SVG notation: data in, markup out.
- `src/i18n.js` — every text in English and Russian, syllables, plurals.
- `tests/` — tests for the pure modules and for the service worker's file list and version; `package.json` only sets ES modules and the `test` and `stamp` scripts.
- `sw.js` — service worker: the list of cached files and their version.
- `manifest.webmanifest`, `icons/` — Home Screen name and icons (`icon.svg` is the source; PNGs rendered with `qlmanage -t -s <size>`).
- `fonts/` — woff2 files (Latin and Cyrillic), `fonts.css`, OFL licences.
- `scripts/` — `stamp.mjs` (`npm run stamp`), `sw-version.mjs` (shared with the tests), `serve.py` (dev server without caching).
- `reference/` — the book (PDF, chapter 1 only). Not in git: it is copyrighted and the repository is public. Do not copy the book's exercises into the app one to one — take from it which elements come in which order, and generate our own rhythms.
- `docs/plan.md` — analysis and plan.
- `README.md`, `README.ru.md` — the GitHub front page in English and Russian.
