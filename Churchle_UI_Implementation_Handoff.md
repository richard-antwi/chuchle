# Churchle — UI implementation handoff

The attached `churchle_dashboard_mockup.html` is the **approved reference
design**. Don't reinterpret it, don't "improve" on it, don't fall back to the
existing dark/slate Tailwind theme — match it as closely as the mockup allows.

## Instructions for the agent

1. **Rebuild `OperatorDashboard.tsx` to match `churchle_dashboard_mockup.html`
   exactly**: same layout structure, same colors, same spacing, same
   typography, same icon style (thin-stroke line icons, not filled).
   - Menu bar (thin row: File / Edit / View / Service / Tools / Settings / Help)
   - Toolbar with mode buttons: Slides, Bible, Hymnal, Camera, Audio, Streaming
     — each toggles which panel set is shown, styled exactly like the mockup's
     `.tbtn` / `.tbtn.active` states
   - Three-pane body: Library (left, 230px) → Order of Service (middle, 290px)
     → Live/Preview stage (right, flexible width)
   - Status bar footer showing display connection dots, OBS status, and a
     master audio VU meter
   - Copy the exact hex values from the mockup's `:root` CSS variables —
     don't substitute the existing `slate`/`indigo`/`purple`/`teal` Tailwind
     palette. This is a light theme now, not dark.

2. **Wire it to the real state, don't just restyle the mockup's dummy data.**
   The mockup's song list, order-of-service items, and slide thumbnails are
   placeholder content to show the layout. Replace them with the actual data
   sources already built:
   - Library panel ↔ SQLite songs/Bible/hymnal tables (`db.ts`)
   - Order of service ↔ the current service/slide queue state
   - Live/Preview stage ↔ `useDisplayStore`'s `currentLyrics` / next-slide logic
     (same data that currently drives `PixiStage.tsx` and `StageView.tsx`)
   - Status bar ↔ the existing display-connection, VLC, and OBS status you
     already wired up in earlier steps — just move it into this footer instead
     of wherever it currently renders

3. **Map each toolbar mode to the existing feature panels** (nothing new to
   build here — this is a relocation, not new functionality):
   - **Slides** → lyric reflow sandbox + PDF importer (current default view)
   - **Bible** → the existing Bible lookup panel
   - **Hymnal** → the existing dual-language hymnal panel
   - **Camera** → camera select + color grading + chroma key controls
   - **Audio** → the mixer faders, ducking panel, VLC transport
   - **Streaming** → OBS scene mapping + lower-third controls

4. **Keep the Remote/AI transcriber controls accessible** even though they
   didn't get their own toolbar icon in the mockup — add a "Remote" icon to
   the toolbar in the same style as the others, to the right of Streaming.

5. **Don't touch the multi-window logic** (`DisplayService.ts`, the separate
   Audience/Stage/Foyer windows) — this handoff is only about the Operator
   dashboard's own UI. The window-cascade/persistence fix from the earlier
   redesign spec is still a separate, outstanding task — confirm it's done
   before calling this complete.

6. **When done, take a screenshot of the running app and compare it side by
   side against the mockup HTML before reporting this as finished.** If it
   doesn't visually match, it isn't done — "the logic works" is not the bar
   this time, "it looks like the reference" is.
