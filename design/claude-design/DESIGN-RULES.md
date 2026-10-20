<!-- Copied from CLAUDE.md in the Claude Design project. Renamed so Claude Code does not load it as instructions. -->
# Visus project rules
- Build ONE screen per request — no multiple design options/variations unless explicitly asked.
- All screens live in "Visus Entry.dc.html". Each batch is its own left-to-right row (new batch = new row below, with a "Batch N" header); within a batch append screens to the RIGHT. Numbering continues across rows. Exception: Batch 5 (Settings, About) sits at the end of the Batch 2 row with an extra gap.
- TEST SCREENS live in a second column to the RIGHT of all app-flow rows, separated by a large gap, top-aligned with the first "App flow" row. Each test batch gets its own row (header = "Batch N · name"), stacked top to bottom; that batch's test screens go left to right. Numbering continues from the app flow.
- Label screens sequentially: "1. Entry screen", "2. Onboarding screen", "3. …".
- Every screen must fit inside the phone viewport (402×874) — no vertical or horizontal overflow/scrolling.
- Visual style (v2, clean): pearl off-white #F7F7F4 bg, white #FFFFFF cards with 1px #ECECE8 border, ink #111111, secondary text #5F5F5B, Figtree font. Black primary buttons, minimal decoration, no logo mark, smooth transitions. One subtle accent from the accent tweak (default Ocean). Floating pill tab bar (Home, Tests, Results, Profile).
- Old doodle version archived in "Visus Entry (doodle v1).dc.html".
