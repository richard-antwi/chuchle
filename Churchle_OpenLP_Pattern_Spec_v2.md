# Churchle — OpenLP-Pattern Specification (v2)

This supersedes the visual/layout sections of the original blueprint. The
feature list and tech stack in the original blueprint are still valid — this
document fixes the part that's been missing every round so far: the actual
**interaction model**, not just the color palette.

## 1. Why "looks like OpenLP" wasn't really solved yet

Every UI pass so far restyled colors and rearranged panels, but none of them
implemented the one thing that actually makes OpenLP/EasyWorship/ProPresenter
feel like "real" presentation software: **a two-stage commit process between
selecting a slide and putting it on screen**, driven by keyboard, not just
mouse clicks into a single live pane.

Current Churchle behavior: click a slide → it's on screen immediately.
Standard behavior in every tool named in the brief: click/select a slide →
it loads into **Preview** → operator confirms (click, Enter, or Space) →
*then* it replaces what's in **Live**. This isn't a style detail — it's the
core safety mechanic that lets an operator queue up the next slide while the
current one is still showing, and it's why arrow keys can drive an entire
service without touching the mouse.

## 2. The Operator Dashboard: 4-panel architecture

This is the exact structural pattern OpenLP uses, and the one to build to.

```
┌──────────────┬─────────────────────┬───────────────────┬───────────────────┐
│              │                     │                     │                   │
│   LIBRARY    │   SERVICE           │   PREVIEW           │   LIVE            │
│  (what you   │   (what's queued    │   (what's about     │   (what's         │
│   can use)   │    for today)       │    to go out)       │    on screen)     │
│              │                     │                     │                   │
│  Songs       │  1. Call to worship │  ┌───────────────┐  │  ┌───────────────┐│
│  Bible       │  2. Amazing Grace ◄─┼──┤ Twas grace    │  │  │ Amazing grace ││
│  Hymnal      │  3. How Great...    │  │ that taught   │  │  │ how sweet     ││
│  Media       │  4. Announcements   │  │ my heart      │  │  │ the sound     ││
│  Themes      │  5. Sermon text     │  └───────────────┘  │  └───────────────┘│
│              │  6. Offering        │  [thumbnail strip]  │  [thumbnail strip]│
│              │  7. Closing hymn    │                     │                   │
│              │                     │        ▶ SEND LIVE ─┼──►                │
└──────────────┴─────────────────────┴───────────────────┴───────────────────┘
```

### Panel 1 — Library
Already mostly specced correctly in earlier rounds. Tabs for Songs, Bible,
Hymnal, Media, Themes. Double-clicking an item **adds it to the Service**
panel (not straight to Preview/Live) — this matches OpenLP's actual
click-to-queue behavior. Search box filters the active tab's list live.

### Panel 2 — Service (order of service)
The running order for today. Drag-to-reorder. Each item shows its type icon,
title, and a one-line subtitle (verse count, translation, duration).
**Single-click an item → its slides load into Preview** (not Live). This is
the missing link — right now clicking a service item in Churchle jumps
straight to output.

Toolbar above this panel: New/Open/Save service file, plus item-level
controls (remove, duplicate, move up/down) — mirrors every tool in the
brief; a service should be a savable/loadable file, not just session state.

### Panel 3 — Preview
Shows the currently-selected item's slides as a thumbnail grid, with the
selected slide shown large above the grid. This is a **staging area** —
nothing here is visible to the congregation. Arrow keys move the highlighted
thumbnail within Preview. Pressing **Enter/Space, or clicking "Send live"**
commits the highlighted thumbnail to the Live panel.

This is the single most important addition: right now there is no "about to
go out" state in Churchle at all — selecting something *is* projecting it.
Every tool in the brief separates these two states on purpose, so an
operator can line up the next slide while the congregation is still reading
the current one.

### Panel 4 — Live
Shows exactly what's currently on the Audience/Stage/Foyer outputs, same
thumbnail-grid treatment as Preview but visually marked (red border/label —
already established in the approved mockup). Clicking a thumbnail here
jumps output directly to that slide within the *same* item (e.g., verse 3 of
a song already live) without going through Preview again — this matches
OpenLP's behavior where within-song navigation is direct, but *switching
items* always stages through Preview first.

### Keyboard-driven flow (currently entirely missing, and worth prioritizing)
- **Up/Down or Page Up/Down** in the Service panel: move between queued
  items (loads into Preview, does not go live).
- **Left/Right arrows** in Preview or Live: move between slides within the
  current item.
- **Enter or Space**: commit the current Preview selection to Live.
- **Esc**: blank the live output (a "black screen" hotkey — standard in
  every tool named in the brief, currently absent from Churchle entirely).

## 3. What "designed to the standard" means for every other screen

Being consistent with OpenLP/EasyWorship/BibleShow isn't just the shared
color tokens already established — each screen has its own genuine
convention worth matching:

**Bible screen** — BibleShow/OpenLP pattern: a persistent search bar at top
(book, chapter, verse, and a combined reference field like `John 3:16`),
results appear as a scrollable list of individual verses each with its own
"add to service" button, not a single lookup-then-block-of-text like the
current implementation. Selecting multiple consecutive verses should be
possible by shift-click, matching how every Bible presentation tool handles
multi-verse passages.

**Hymnal screen** — same list-of-results pattern as Bible, not a raw
number-entry box. Include a browsable index (by first line or hymn number)
alongside the search field, since musicians often don't know the number.

**Theme manager** — currently doesn't exist as its own screen anywhere in
the app; every tool in the brief has one. Needs: font, size, color, outline,
shadow, and background (solid/image/video) controls, with named saved
presets an operator can assign per-song or per-service-item, not just the
one global theme currently in `useDisplayStore`.

**Media/Camera/Audio/Streaming/Remote screens** — the panel-card layout
approved in the last round is fine structurally; the gap is that four of
these five never got their intended content correctly rendered (confirmed
by the screenshot bug report — separate issue, being fixed already).

**Settings** — doesn't exist as a dedicated screen yet. Needs at minimum:
default theme, default Bible/hymnal translation, display assignment
(manually override which physical monitor is Audience/Stage/Foyer instead
of relying only on auto-detection), and the window-position persistence
fix already specified in an earlier round.

## 4. Feature gaps vs. the original blueprint worth calling out now

These were in the original PRD's feature list but have no UI home in any
round so far, and are standard in every named competitor:

- **Save/load a service file** as an actual file on disk (OpenLP uses
  `.osz`; doesn't need to match that format, just needs to exist as a
  concept — right now "New service" in the toolbar has no corresponding
  save format).
- **Print the order of service** (plain-text or PDF export) — a genuinely
  common request from pastors/ushers who want a paper copy, present in
  EasyWorship and OpenLP both.
- **CCLI/copyright reporting** — flagged in the very first review of this
  blueprint and still not addressed in any round since. Worth a real
  decision (build it, or explicitly scope it out) rather than continuing to
  silently omit it.
- **A dedicated "blank/black screen" and "logo/clear" hotkey** — covered
  above under keyboard flow, but worth calling out as its own checklist
  item since it's easy to build the 4-panel model and still forget it.

## 5. Implementation order (restructure first, confirmed bugs after)

Decision: build the 4-panel model first, fix the two already-confirmed bugs
(Camera tab crash, Bible/Hymnal/Streaming/Remote theme mismatch) afterward.
Two things to carry forward so this order doesn't quietly reintroduce either
bug into the new structure:

- The theme-mismatch bug's root cause (leftover `background-image:
  url('./wavy-lines.svg')` on `body` in `assets/main.css`, per the earlier
  diagnostic) affects the whole app shell, not just the four tabs it was
  first noticed on. **Remove that leftover rule as part of this rebuild**,
  not as a separate later step — otherwise the new Preview/Live panels
  inherit the same landmine and this shows up a third time under a new name.
- The Camera tab crash is isolated to `CameraVisualsTab.tsx`'s double
  `PixiStage` mount. It's fine to leave the underlying fix for later, but
  don't drop a second `<PixiStage />` instance into the new Preview or Live
  panels while building them — that would spread the same bug into two more
  places before it's even fixed once.

1. **Restructure `OperatorDashboard.tsx` into the real 4-panel model**
   (Library / Service / Preview / Live) with the Preview-then-Live commit
   step and keyboard bindings from Section 2. This is a behavioral change,
   not just a layout change — flag that clearly to whichever agent builds
   it, since "looks like 4 columns" without the staging behavior isn't the
   same feature. Remove the `wavy-lines.svg` body background as part of this
   pass.
2. **Fix the two confirmed rendering bugs** in the now-restructured shell:
   Camera tab crash (get the real console error first, per the earlier
   diagnostic doc, before changing code) and confirm Bible/Hymnal/Streaming/
   Remote now render correctly now that the leftover CSS is gone.
3. Rebuild the Bible and Hymnal screens to the list-of-results pattern in
   Section 3.
4. Add the Theme manager and Settings screens — currently missing entirely.
5. Address the feature gaps in Section 4 (service save/load at minimum;
   print and CCLI reporting can be scoped as a decision rather than a
   silent gap).
