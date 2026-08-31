# Churchle — extend approved theme to remaining views

The Operator Dashboard redesign (`churchle_dashboard_mockup.html`) is done and
approved. It was NOT applied anywhere else — `StageView.tsx`, `FoyerView.tsx`,
and `LowerThirdView.tsx` are still on the old dark slate/indigo/yellow theme
from before this redesign started. This handoff closes that gap.

## Scope

Apply the same design language from `churchle_dashboard_mockup.html` — same
CSS variables, same font stack, same visual restraint — to:

1. `src/renderer/src/views/StageView.tsx`
2. `src/renderer/src/views/FoyerView.tsx`
3. `src/renderer/src/views/LowerThirdView.tsx`

Reuse the exact `:root` tokens already established for the Operator Dashboard
(background/panel/border/text/accent/live hex values) rather than inventing a
new palette for these three. One design system across the whole app, not one
per screen.

## Per-view notes

**StageView** (monitor facing musicians/vocalists on stage)
- Keep the layout structure: current slide large and center, next-slide
  preview and chords in a footer row, clock in the header.
- Replace the dark bg + yellow text with the light theme: white/off-white
  background, dark text (`--text`), accent color (`--accent`) for the
  "current slide" label instead of yellow, and the live-red accent
  (`--live`) reserved for the on-air indicator only, not decorative text.
- This screen is read at a glance from a distance under stage lighting —
  keep font sizes as large as they currently are (5xl–7xl equivalents),
  don't shrink type to fit the lighter palette.

**FoyerView** (lobby/public-facing screen)
- Same token swap: replace the indigo/slate dark theme with the light
  theme's panel/border/accent colors.
- Keep the two-column layout (schedule left, live lyric overlay right) and
  the announcements ticker — just restyle, don't restructure.
- Drop the emoji in the announcement ticker text; use a plain text label
  consistent with the rest of the app's copy style.

**LowerThirdView** (transparent overlay composited over camera/stream output)
- The page background must stay fully transparent — this renders over live
  video, not on its own. Only the lyric card itself gets the light-theme
  treatment: white/near-white card background, dark text, subtle border,
  no heavy black glass panel like the current version.
- Because this sits on top of unpredictable video, keep a soft drop shadow
  or subtle outer border on the card so it stays legible over any
  background footage — this is one case where losing all shadow/contrast
  aids would hurt readability, so don't strip it entirely for style
  consistency.

## Verification

Same bar as last time: after implementing, take a screenshot of each of the
three views and confirm they visually match the Operator Dashboard's design
language (same fonts, same color tokens, same spacing rhythm) before
reporting this as complete. "The data still displays correctly" is not
sufficient — the visual match is the actual deliverable here.
