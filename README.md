# Ta-ti-ti

A small rhythm toy for learning to read rhythm with Kodály syllables — ta, ti-ti, tam-ti. Listen to a line, tap it back, or build your own.

**Open it:** https://mopheadpersona.github.io/kodaly/

[Русская версия](README.ru.md)

## What it does

- **Listen** — a count-in bar, then the metronome and a tone on every note, with the current syllable shown large.
- **Tap** — the metronome alone. Tap the pad, or press Space or Enter. Each note turns green (on the beat, within 70 ms), yellow (close, within 150 ms) or red (missed).
- **Endless** — new rhythms keep coming without a break; the next line shows in advance.
- **Build your own** — drop pieces into the bars, then listen, tap or loop them.
- 2/4, 3/4 and 4/4; three levels (no ti-ti / with ti-ti / with tam-ti); English and Russian; light and dark theme.

On iPhone, turn off silent mode: it mutes web audio.

## Run it locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000. Opening `index.html` straight from disk does not work: browsers do not load ES modules from `file://`.

## Tests

```bash
npm test
```

Node's built-in test runner; nothing to install. The tests cover the rhythm generator, tap grading and the texts in both languages.

## How it is built

A static site: plain HTML, CSS and ES modules. No framework, no build step, no dependencies.

| File | What is inside |
|---|---|
| `index.html` | Markup |
| `styles.css` | Styles and theme colours |
| `src/app.js` | State, screen, sound, buttons |
| `src/rhythm.js` | Rhythm pieces, levels, random generator |
| `src/grading.js` | Tap grading |
| `src/notation.js` | Rhythm notation as SVG |
| `src/i18n.js` | All texts in English and Russian |
| `tests/` | Tests for the modules above |

Every push to `main` is published by GitHub Pages.

More: [docs/plan.md](docs/plan.md) — analysis and plan; [CLAUDE.md](CLAUDE.md) — context and decisions for Claude Code.

## Based on

The order of rhythms follows chapter 1 of Ottman & Rogers, *Music for Sight Singing* (the beat and its division in two). The app generates its own rhythms; nothing from the book is copied.
