# Design

The UI comes from Claude Design (61 screens).

- Project: https://claude.ai/design/p/7e094e17-8954-4ae5-bf57-ad239227dd31
- Final file: `Visus Eye Care App.html`, a standalone bundle of all screens

## In this folder

| File | What |
|---|---|
| `visus-design-handoff.html` | The final `Visus Eye Care App.html`. **Missing, see below** |
| `claude-design/DESIGN-RULES.md` | The design project's style rules (colours, font, layout) |
| `claude-design/support.js` | Claude Design runtime, only needed to render `.dc.html` source files |

## Missing: the full export

The Claude Design tool only reads the first 256 KiB of a file. These project files are bigger and could not be copied:

- `Visus Eye Care App.html` (the final bundle)
- `assets/visus-eye.png` (Entry screen illustration)
- `uploads/visus.png`, `uploads/2026-10-19_02-05-49.png`

To add them, download `Visus Eye Care App.html` from the Claude Design project and save it here as `visus-design-handoff.html`. Download `assets/visus-eye.png` into `claude-design/assets/`.

## Values not confirmed

The accent shades and some sizes are tweak settings in the design and could not be read. The mobile theme derives them from the brand blue `#2F6FD6` (see `apps/mobile/src/constants/theme.ts`). Check them once the full export is here.
