# Apply pack — Direction 1C · "Voltage on Slate"

A **cosmetic re-skin** of the Billing Finance monitoring dashboard: a control-room,
high-contrast **dark** theme — electric-lime accent on deep slate, with neon status
signals and soft glows.

This is a drop-in overlay for the existing `bf-monitoring-website` app. It changes
**only** presentation (CSS tokens, component styles, and fonts). No data shapes,
API calls, auth, or component logic change.

## What's in the pack

Copy these files over the matching paths in the app, replacing what's there:

- `index.html` — swaps the webfont links to **Space Grotesk** (UI/display) +
  **JetBrains Mono** + **Instrument Serif**, and paints the slate canvas up front.
- `src/styles/tokens.css` — the "Voltage on Slate" palette, type, radii, shadows.
- `src/styles/app.css` — dark surfaces, lime primary button + glow, neon status
  dots, glowing tile accent bars.
- `src/App.jsx`, `src/components/StatTile.jsx`, `src/components/StatusBox.jsx` —
  included for completeness; unchanged from the current app so the overlay is a
  clean, self-contained copy.

## How to apply

From the repo root:

```
cp -R apply-1c/index.html          ./index.html
cp -R apply-1c/src/styles/*.css    ./src/styles/
cp -R apply-1c/src/App.jsx         ./src/App.jsx
cp -R apply-1c/src/components/*    ./src/components/
```

Then `npm run dev`. The dashboard renders dark with the lime "Refresh all" CTA,
glowing availability tiles, and mono captions.

## Palette

| Token | Hex | Role |
|---|---|---|
| `--bg` | `#0e1117` | app canvas (slate) |
| `--panel` | `#161b22` | cards / header |
| `--brand` | `#c4f24c` | voltage lime — CTA, accents, live labels |
| `--ok` | `#4ade80` | operational |
| `--warn` | `#facc15` | degraded |
| `--bad` | `#fb7185` | down |

Lime is the only brand colour — text and glyphs sitting on it use `--brand-ink`
(`#0e1117`) for contrast.
