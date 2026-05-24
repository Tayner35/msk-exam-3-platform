# MSK Exam 3 Platform

Static publishing repo for the MD818 MSK Exam 3 interactive study platform.

## Structure

- `index.html` is the lightweight app shell.
- `css/styles.css` contains the UI styles.
- `js/app.js` contains the interactive study runtime.
- `data/platform-data.js` contains validated source-scoped study data.
- `assets/images/` contains extracted course and cached external image assets.
- `scripts/migrate-platform.mjs` documents the one-time migration from the legacy single-file HTML artifact.

## Local Preview

Run this from the repo root:

```sh
python3 -m http.server 4173
```

Then open `http://localhost:4173/index.html`.
