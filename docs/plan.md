# Ta-ti-ti: analysis and plan

Written 4 November 2026, updated as steps land. Context and rules: [CLAUDE.md](../CLAUDE.md).

## Where things stand

| Step | Status |
|---|---|
| 0–1. `CLAUDE.md`, git | done |
| 2. Split into files | done — notation, chips and texts match the prototype byte for byte |
| 3. English and Russian | done — English by default; the Russian version renders exactly like the prototype |
| 4. Tests | done — 25 tests, `npm test`, about a second |
| 5. Hosting | done — GitHub Pages, https://mopheadpersona.github.io/kodaly/ |
| 6. Home screen and offline | next |
| Version 2: harder rhythms | not started, only when asked |

## How it works day to day

**Folder.** Everything lives in `~/kodaly`. Open Claude Code there and it reads `CLAUDE.md`: what the app is, which decisions not to touch, which step we are on.

**Versions.** Every step is a git commit. To go back: "restore how it was before two languages" — find the commit and revert.

**Site.** The code is on GitHub in the public repo `mopheadpersona/kodaly`. GitHub Pages publishes every push to `main`, in about a minute.

**iPhone.** Open the address in Safari → Share → Add to Home Screen. After step 6 it starts as a separate app without the address bar and works offline.

**Who checks what.** Claude checks in a browser on the computer: buttons, errors, layout, both languages, both themes, a narrow screen. Claude cannot hear sound, so latency, headphones and silent mode are checked by the user on a real iPhone.

## What is inside

| Part | File | What it does | Pure? |
|---|---|---|---|
| Rhythm model | `src/rhythm.js` | `TYPES` (pieces and their length in beats), `LEVELS`, weights, `partsOf` | yes |
| Generator | `src/rhythm.js` | `genItems({meter, level, rng})` fills the bars with random pieces by the level's rules | yes (randomness is passed in) |
| Notation | `src/notation.js` | `svgItem`, `rowSvg`, `chipSvg` draw SVG by hand, one picture per piece | yes, apart from the current language |
| Grading | `src/grading.js` | `gradeOf` (70/150 ms), `windowAt`, `findMatch` | yes |
| Texts | `src/i18n.js` | dictionaries, `t()`, syllables, plurals via `Intl.PluralRules` | yes, apart from the current language |
| Sound and screen | `src/app.js` | Web Audio (click, tone, tap sound — the whole line is scheduled ahead on the audio clock), pad, keyboard, buttons, `localStorage` | no |

Things noticed (not bugs, nothing to fix now):

1. **Generator.** It makes up to 40 tries to get a "good" line (has ti-ti on level 2, does not end on a rest). If all 40 fail it returns the last one. In practice this does not happen. Tests should check only what always holds: bars are filled exactly, no rest first, no two rests in a row, no piece crosses a bar line.
2. **Tap time** is the audio clock when the tap is handled, not the moment of the touch itself. That adds a few milliseconds of error, fine for a 70 ms "on the beat". It could be refined later, but that changes behaviour — only if the user asks.
3. **Headphone latency.** The app subtracts `outputLatency`. If Safari does not report it, zero is subtracted, so with Bluetooth headphones on iPhone taps look late. The summary hint about headphones covers exactly this. To check on the user's iPhone.
4. **Silent mode.** Newer Safari has `navigator.audioSession`; setting its type to `playback` may let sound play in silent mode. Worth a small separate try. The hint stays either way.
5. **Fonts** come from Google Fonts. Offline, system fonts show instead. Step 6 fixes that.
6. **Hidden tab.** When the tab is not visible the browser slows down drawing. The sound stays exact; only the highlighting lags. That is normal.

## Step 2. Structure — done

```
index.html          markup
styles.css          styles
src/
  app.js            entry point: screen, sound, buttons
  rhythm.js         pieces, levels, generator — pure
  grading.js        tap grading — pure
  notation.js       SVG: data in, markup out
  i18n.js           texts in English and Russian, plurals
```

Why split: tests can import the pure functions directly (Node 23 is installed, nothing else needed); git diffs show what actually changed; languages and version 2 go into their own files; there is still no build — the browser loads ES modules itself.

Downside: the page no longer opens with a double click, because ES modules do not load from `file://`. A local server is needed (`python3 -m http.server`). On the site everything works as usual. If a single file is ever needed again (say, to show the app in a plain chat), a small script can glue it back together.

How behaviour was kept: code moved as is; functions that read global state now take parameters (`genItems({meter, level, rng})`, `geo(width, beats, view)`, `rowSvg(row, layout, options)`). Before the split, the same rhythms were built with the chips in every meter and view and the SVG was fingerprinted; after the split all 15 fingerprints matched. Then "Listen", "Tap" (with taps timed to the audio clock: 7 of 7 on the beat; 100 ms late → close), "Endless" and "Build your own" were run in the browser.

## Step 3. Two languages — done

- `src/i18n.js`: dictionaries `en` and `ru`, `t('key', {n})`. Every string from the markup and the script lives there.
- Syllables: `та / ти-ти / та-а / та-а-а / та-а-а-а / ш / там-ти` ↔ `ta / ti-ti / ta-a / ta-a-a / ta-a-a-a / sh / tam-ti`. Pieces store a syllable key; the word is looked up when drawing, so switching language redraws everything.
- Count on the pad: `раз два три четыре` ↔ `one two three four`. In the notation, `и` ↔ `&`.
- Plurals via `Intl.PluralRules`: Russian has 1 щелчок / 2 щелчка / 5 щелчков / 11 щелчков / 21 щелчок; English 1 click / 2 clicks.
- EN/RU switch in the header, disabled while something plays. Saved in `localStorage` `tatiti` (field `lang`); sets `<html lang>`, the tab title and screen-reader labels.
- English by default. A Russian phone also opens in English first.
- Checked: the Russian version gives the same 15 fingerprints as the prototype; the English one was read through and run; both fit a 375 px screen without horizontal scroll.

## Step 4. Tests — done

`npm test` runs `node --test`: no libraries. `package.json` only sets `"type": "module"` and the `test` script.

- **Generator** (`tests/rhythm.test.js`): every meter × every level × 2000 lines from a seeded random source, so a failure can be reproduced. Each bar is filled exactly; pieces follow without gaps; no piece crosses a bar line; no rest first; no two rests in a row; ta-a-a-a only at the start of a bar; only the level's pieces. Plus `partsOf` splitting ti-ti and tam-ti.
- **Grading** (`tests/grading.test.js`): 0 and ±70 ms — on the beat; ±70.1 and ±150 ms — close; ±150.1 ms — miss. Window: capped at 280 ms, otherwise 48% of the gap to the closer neighbour. Matching picks the closest ungraded note, skips graded ones, ignores taps outside every window.
- **Texts** (`tests/i18n.test.js`): Russian plurals (1, 2, 5, 11, 21, 22, 112…) and the same result as the prototype's formula for every number 0–1000; English plurals; both dictionaries have the same keys, shapes and `{placeholders}`; the agreed syllables, count words and "&"/"и".
- Sound and screen are not covered by tests — they are checked in the browser.

The tests were checked by breaking the code on purpose in a copy: making 70 or 150 ms exclusive, moving the threshold to 80 ms, removing the 280 ms cap, allowing a rest first, two rests in a row, a piece across the bar line, dropping a Russian text, changing an English syllable — each made a test fail. The one change that failed nothing — dropping the "ta-a-a-a only at a bar start" rule — is harmless: a 4-beat piece only fits at the start of a 4/4 bar anyway.

## Step 5. Hosting — done

| | GitHub Pages | Cloudflare Pages | Netlify |
|---|---|---|---|
| Address | `mopheadpersona.github.io/kodaly` | `kodaly.pages.dev` if free | `kodaly.netlify.app` |
| What it needs | nothing: `gh` is already signed in | a Cloudflare account + `wrangler` | a Netlify account + their CLI |
| Updating | `git push` | a deploy command or a connected repo | same |
| Repository | public on the free plan | can be private | can be private |
| Own domain later | yes | yes, easiest if the domain is on Cloudflare | yes |

Chosen: **GitHub Pages**, public repo `mopheadpersona/kodaly`, branch `main`, root folder. HTTPS is automatic. No new accounts; publishing is a normal `git push`. The book is not in the repo (`.gitignore`).

The site lives under `/kodaly/`, not at the domain root. All paths in the project are relative, and step 6 (icons, service worker scope) has to keep that in mind.

## Step 6. Home screen and offline

- `manifest.webmanifest`: name "Ta-ti-ti", standalone display without the address bar, theme colours, icons 192 and 512.
- `apple-touch-icon` 180×180 — iPhone takes the icon from here, not from the manifest. A simple icon in the app's style (a note or "ta"), shown to the user before committing.
- `sw.js` service worker: caches every app file, the fonts and icons; serves from cache and fetches the new version in the background. A new version shows from the next launch. The cache version changes with every deploy.
- Fonts served locally from `fonts/`: Unbounded, Golos Text, IBM Plex Mono, Latin + Cyrillic, about 10 woff2 files. All three are under the OFL, so they may live in the repo. The Google Fonts link goes away: faster, and works offline.
- A service worker needs HTTPS, so this comes after hosting. It also goes last because the cache gets in the way of seeing fresh versions during development.
- On iPhone, the Home Screen app keeps its settings separately from Safari: meter, tempo, view and language have to be picked once more.
- Check: airplane mode → open from the Home Screen → everything works, with its own fonts.

## Version 2: harder rhythms

Not started — this is the next stage. `reference/` has only chapter 1 (exercises 1.1–1.61). The app now covers sections 1–2, except ties and pick-ups.

| Book section | Exercises | What is there | In the app |
|---|---|---|---|
| 1. Quarter-note beat, beat note and longer | 1.1–1.10 | ta, ta-a, ta-a-a, ta-a-a-a, rests, pick-ups | yes, except pick-ups and rests longer than a beat |
| 2. The beat divided in two; dots and ties | 1.11–1.24 | ti-ti, tam-ti, ties (also across the bar line), eighth rest | ti-ti and tam-ti yes; no ties, no eighth rest |
| 3. Two-part drills | 1.25–1.29 | two lines at once: two hands, or voice + hand | no |
| 4. Other beat notes | 1.30–1.53 | 2/2, ¢, 3/2, 4/2, 3/8, 4/8: sounds the same, written differently | no |
| 5. Two-part drills with other beat notes | 1.54–1.61 | — | no |

Later chapters of the book (sixteenths, 6/8, syncopation) are not in `reference/` yet.

**What has to change:**

1. **Rhythm model.** Today a piece is whole beats inside one bar. Ties across the bar line and pick-ups need a model of "sounds with durations", with bars as a layer on top.
2. **Rhythms as data, not code.** Pieces (syllables in both languages, length, how to draw) and levels (which pieces, which weights) in one data file. A new rhythm is a new data row; the generator stays as it is.
3. **Notation** — the hardest part. Seven figures are drawn by hand today. Ties, eighth rests, eighths beamed in fours and other beat notes (a half note as the beat — same syllables, different pictures) need a more general drawer. Two ways:
   - extend our own: same look, lightweight, more work;
   - use a notation library (VexFlow or abcjs): correct notation out of the box, but heavier and a different look.

   Decide when we get there.
4. **Levels.** Three buttons become a ladder following the book's sections. Keep "one screen": for example one row "level: 1 2 3 4 5…", not a menu.
5. **Two-part drills** — a new mode. The app plays one line and you tap the other. Or the pad splits into two halves for two hands; on a computer, two keys (for example F and J).

**Copyright.** The book is a guide: which elements, in which order. The app generates its own rhythms, as now. The book's exercises should not be copied one to one onto a public site. Locally, for personal use, they can be.

## What to check on the iPhone

- Silent mode: the hint is there; with sound on, everything plays.
- With Bluetooth headphones and without: what average offset the "Tap" summary shows.
- Light and dark theme, English and Russian.
- After step 6: install to the Home Screen, launch in airplane mode, update after a deploy.

## Open questions

1. Own domain — later, when there is one.
2. Should a Russian phone open in Russian on the first visit? Now it is always English first, as asked.
