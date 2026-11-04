# reference

Material the app is based on. The files themselves are not in git (see `.gitignore`): they are copyrighted.

- `ottman-rogers-2019-ch1-rhythm.pdf` — Ottman & Rogers, *Music for Sight Singing* (2019), chapter 1 "Rhythm", 12 pages, exercises 1.1–1.61.
  - Section 1 (1.1–1.10): the quarter note is the beat; only the beat note and longer.
  - Section 2 (1.11–1.24): the beat divided in two; dotted and tied notes.
  - Section 3 (1.25–1.29): two-part drills.
  - Section 4 (1.30–1.53): other beat notes — 2/2, 3/2, 4/2, 3/8 and so on.
  - Section 5 (1.54–1.61): two-part drills with other beat notes.

Put other chapters and rhythm files here too.

Reading a PDF on this Mac: `pdftoppm` is not installed and the Swift compiler is broken, but `osascript -l JavaScript` with `ObjC.import('PDFKit')` works — it extracts the text and renders pages to PNG.
