# Design

The UI comes from Claude Design: 61 screens (app flow 1–25 and 39–56, test screens 26–38 and 57–61).

- Project: https://claude.ai/design/p/7e094e17-8954-4ae5-bf57-ad239227dd31
- Latest export added: 21 Oct 2026

## Files

| File | What it's for |
|---|---|
| `visus-screens-unpacked.html` | **Read this one.** Plain HTML markup of all 61 screens, plus the logic block (`renderVals`) with the accent and size settings. Search for a screen by its label, e.g. `"14"` + `Between-test analysis` |
| `visus-screens-text.txt` | Every on-screen string in order. Use it for copy and labels |
| `visus-design-handoff.html` | The original bundled export (`Visus Eye Care App.html`). Open it in a browser to see the screens rendered. Too large and packed to read directly |
| `assets/visus-eye.png` | Entry screen illustration (960×717), extracted from the bundle |

## Confirmed design values

From `renderVals` in `visus-screens-unpacked.html`. Default accent is **Ocean**; the design defines colours in OKLCH, hex below is the converted value.

| Token | Design (Ocean, hue 250) | Hex |
|---|---|---|
| `acc` (accent) | `oklch(0.58 0.12 250)` | `#3C7EBE` |
| `accSoft` (soft background) | `oklch(0.95 0.03 250)` | `#E0F1FF` |
| `accInk` (accent text on soft) | `oklch(0.42 0.1 250)` | `#194F81` |
| `accBright` | `oklch(0.78 0.12 250)` | `#7ABDFF` |

Other accents (not used by default): Sage = hue 155 (`#318F5A` / `#E0F5E6` / `#095C34` / `#73CE95`); Graphite = black accent `#111111` with `#ECECE8` soft.

| Size | Normal | Large text mode |
|---|---|---|
| Hero title | 38 px | 42 px |
| Question title | 28 px | 32 px |
| Body | 17 px | 19 px |
| Button height / font | 56 px / 17 px | 62 px / 19 px |
| Option row height / font | 58 px / 17 px | 66 px / 19 px |
| Chip height | 44 px | 52 px |

Style: clean and minimal, black primary buttons, one subtle accent, floating pill tab bar (Home, Tests, Results, Profile). Every screen fits a 402×874 phone viewport without scrolling where possible. Base palette: background `#F7F7F4`, cards `#FFFFFF` with 1px `#ECECE8` border, ink `#111111`, secondary text `#5F5F5B`, font Figtree. Large text mode is a Settings option (Settings → Text size).
