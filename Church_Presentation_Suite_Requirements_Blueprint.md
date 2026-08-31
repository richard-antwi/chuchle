# Next-Gen Church Presentation, Broadcasting & Stage Management Suite
## Master Product Requirements Document (PRD) & AI Implementation Blueprint
**Document Version:** 5.0 (OpenLP-Pattern 4-Panel Master Architecture & Production Spec)

---

## 1. Executive Summary & Product Vision
The **Next-Gen Presentation Suite (Churchle)** is a cross-platform, multi-display church presentation, live broadcasting, and stage management desktop application. 

It combines the best aspects of industry leaders into a single, unified workflow:
* **OpenLP / EasyWorship:** 4-panel staging architecture (Library | Service | Preview | Live), two-stage commit workflow, and rapid hotkey navigation.
* **ProPresenter:** Multi-target "Audience Looks" routing, stage confidence screens, and native lower thirds.
* **vMix / OBS:** Direct camera switching, transparent NDI streaming, GPU chroma keying, and live video color grading.
* **BibleShow:** Parallel multi-translation presentation, rich denominational hymnals, and scripture overlay presets.
* **Modern Media & AI:** VLC remote integration, wireless phone cameras (Iriun/DroidCam), local AI speech-to-scripture detection, and raw lyric auto-reflow.

---

## 2. Core Architecture & Tech Stack

```
+---------------------------------------------------------------------------------------------------+
|                                      ELECTRON MAIN PROCESS                                        |
|  - Native Multi-Screen Mapping & Hot-Unplug Auto-Recovery                                         |
|  - Embedded SQLite (better-sqlite3) Database (Bibles, Songs, Hymnals, Schedules)                  |
|  - Universal Camera Ingestion (DirectShow, AVFoundation, Iriun, WebRTC, RTSP, NDI)                |
|  - Native Disk Service Files (.churchle / JSON) Serialization & IPC Dialog Bridge                  |
|  - External Media Control Bridge (VLC HTTP API, LibVLC Native, Spotify Web API)                   |
|  - Local Fastify + Socket.io LAN Server (Zero-Install Mobile Clicker & Musician Stage Views)      |
|  - Hardware Protocol Bridges (OBS WebSocket v5, vMix HTTP/TCP, MIDI, OSC, ATEM DSK)              |
+-------------------------------------------------+-------------------------------------------------+
                                                  | Zero-Copy IPC / Texture Buffers
        +-----------------------------------------+-----------------------------------------+
        |                                                                                   |
+-------v---------------------------------------+     +-------------------------------------v-------+
|    OPERATOR CONTROL DASHBOARD (4-PANEL)       |     |           PROJECTED OUTPUT ENGINES          |
|  - Library | Service | Preview | Live Panelling |     |  - Screen 1: Main Projector (PixiJS 8 WebGL)|
|  - 2-Stage Staging Commit (Preview -> Live)   |     |  - Screen 2: Musician Stage Display (Chords)|
|  - React 19 + TypeScript + Tailwind app-*     |     |  - Screen 3: Live Stream (NDI Alpha Key)    |
|  - Keyboard Hotkeys (Up/Down/Left/Right/Space)|     |  - Screen 4: Spillover / In-House TV        |
|  - Multi-Camera Switcher & Color Grading FX   |     |  - Parallel Multi-Language Sync Engine      |
|  - Smart Lyric Auto-Reflow & AI Scripture Ear |     |                                             |
+-----------------------------------------------+     +---------------------------------------------+
```

### Technology Specification

| Domain | Technology / Library | Architectural Role |
| :--- | :--- | :--- |
| **Desktop Shell** | Electron 31+ | Native multi-monitor management, borderless rendering windows, low-level OS hooks. |
| **Frontend Framework** | React 19 + TypeScript | High-performance declarative state rendering. |
| **Theme Design System** | Tailwind CSS (`app-*` tokens) | Single source of truth palette in `tailwind.config.js` (`bg-app-bg`, `bg-app-panel`, `border-app-border`, `text-app-text`, `text-app-accent`, `bg-app-live`). |
| **Interaction Pattern** | OpenLP 4-Panel Model | Two-stage staging commit between Preview and Live driven by keyboard hotkeys. |
| **State Management** | Zustand + Immer | Microsecond state dispatching; isolated store slices for live outputs vs operator tools. |
| **Rendering Engine** | PixiJS 8 (WebGL / WebGPU) | 60+ FPS hardware-accelerated text compositing, motion video loops, container-relative resizing, and shader transitions. |
| **Local Database** | `better-sqlite3` | Zero-latency, relational offline storage for Bibles, songs, hymnals, and schedules with FTS5 search. |
| **Video Playback** | LibVLC / `node-libmpv` / FFmpeg | Seamless rendering of all codecs (H.264/H.265, ProRes 4444 Alpha, WebM, MKV, MP4). |
| **External Media Bridge** | VLC HTTP API / Spotify API | Bi-directional transport controls, status polling, and timeline scrubbing for external players. |
| **Camera Ingestion** | WebRTC / MediaDevices / RTSP / NDI | USB capture cards, webcams, Iriun/DroidCam feeds, with React ErrorBoundary fallback protection. |
| **Broadcast Protocol** | `grandiose` (NewTek NDI 5/6 SDK) | Real-time transparent lower-third video/audio streaming directly to OBS and vMix. |
| **Local Remote Hub** | Fastify + Socket.io | Built-in zero-config local web server for Mobile Remote & Stage Web App over local Wi-Fi. |

---

## 3. The 4-Panel OpenLP Operator Staging Model

```
┌──────────────┬─────────────────────┬───────────────────┬───────────────────┐
│   LIBRARY    │   SERVICE           │   PREVIEW         │   LIVE            │
│  (what you   │   (what's queued    │   (what's about   │   (what's         │
│   can use)   │    for today)       │    to go out)     │    on screen)     │
├──────────────┼─────────────────────┼───────────────────┼───────────────────┤
│ Songs        │ 1. Call to worship  │ ┌───────────────┐ │ ┌───────────────┐ │
│ Bible        │ 2. Amazing Grace ◄──┼─┤ Twas grace    │ │ │ Amazing grace │ │
│ Hymnal       │ 3. How Great...     │ │ that taught   │ │ │ how sweet     │ │
│ Media        │ 4. Announcements    │ └───────────────┘ │ └───────────────┘ │
│ Themes       │ 5. Sermon text      │ [thumbnail strip] │ [thumbnail strip] │
│              │ 6. Offering         │                   │                   │
│              │ 7. Closing hymn     │    ▶ SEND LIVE ───┼─►                 │
└──────────────┴─────────────────────┴───────────────────┴───────────────────┘
```

### 3.1 Panel Functions
1. **Panel 1 — Library (Left):** Songs, Bible, Hymnal, Media, Themes. Double-clicking an item appends it to the Service queue.
2. **Panel 2 — Service (Order of Service):** Running order for today's service. Single-clicking an item loads its slides into **Preview** (does NOT immediately output to Live). Includes toolbar buttons to **Open** and **Save `.churchle`** service files to disk.
3. **Panel 3 — Preview (Staging Area):** Shows queued item's slides as a large staging preview + thumbnail grid + **SEND LIVE TO CONGREGATION ▶** button.
4. **Panel 4 — Live (On-Air Output):** Red-bordered WebGL live viewport + thumbnail grid. Direct thumbnail clicks jump slides within the active live item. Includes quick action buttons for **Blank Screen (Esc / B)** and **Clear Text (C)**.

### 3.2 Keyboard Navigation Shortcuts
- **`Up` / `Down` or `Page Up` / `Page Down`:** Move selection in the Service queue list (staging into Preview).
- **`Left` / `Right`:** Move slide thumbnail selection in Preview or Live.
- **`Enter` or `Space`:** Commit Preview selection to Live and project to the WebGL Audience output.
- **`Esc` or `B`:** Toggle Blank/Black live screen output.
- **`C`:** Toggle Clear text overlay.

---

## 4. Comprehensive Feature Specifications

### 4.1 Scrollable List-of-Results Bibles & Hymnals
* **OpenLP Scripture Explorer Pattern (`BibleView.tsx`):**
  - Persistent top search bar (Book, Chapter, Verse range, and combined reference string like `John 3:16-18`).
  - Scrollable verse results list with Shift-click multi-verse selection, **"+ Queue Item"**, and **"Send Live ▶"**.
* **Methodist Hymnal Explorer (`HymnalView.tsx`):**
  - Browsable index by number & first line + dual-language English/Twi stanza switcher + **"+ Add Entire Hymn to Service"**.

### 4.2 Theme Preset Manager & System Settings
* **Theme Preset Manager (`ThemeManagerView.tsx`):**
  - Dedicated view to create, edit, and save named font family, font size, text color, and background presets assigned per-song or per-service item.
* **System Settings (`SettingsView.tsx`):**
  - Configure default Bible translations, CCLI License #, physical monitor selector, and window position persistence.

### 4.3 Disk Service File Serialization & CCLI Copyright
* **`.churchle` Disk Service Files:** Native save and open file dialogs to serialize order of service items to disk.
* **CCLI Copyright Footer:** Integrated CCLI License number field in settings with automatic display on song slide footers.

### 4.4 Camera Ingestion Resilience
* **Resilient WebGL & Camera Preview:** WebGL canvas resizing anchored to parent panel containers (`resizeTo: parentElem`) and wrapped in `CameraErrorBoundary` fallback components to prevent hardware lockouts from crashing the dashboard.

---

## 5. SQLite Database Schema (`better-sqlite3`)

```sql
-- 1. Songs Library
CREATE TABLE IF NOT EXISTS songs (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    artist TEXT,
    author TEXT,
    ccli_number TEXT,
    copyright TEXT,
    key_signature TEXT,
    tempo INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS song_sections (
    id TEXT PRIMARY KEY,
    song_id TEXT NOT NULL,
    section_type TEXT NOT NULL, -- Verse, Chorus, Bridge, Tag, Vamp
    section_order INTEGER NOT NULL,
    label TEXT NOT NULL,
    content TEXT NOT NULL,
    chords TEXT,
    FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
);

-- 2. Multi-Language Hymnal Database
CREATE TABLE IF NOT EXISTS hymnals (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    denomination TEXT,
    primary_language TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS hymn_entries (
    id TEXT PRIMARY KEY,
    hymnal_id TEXT NOT NULL,
    hymn_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    tune_name TEXT,
    meter TEXT,
    author TEXT,
    language TEXT NOT NULL,
    parallel_group_id TEXT,
    FOREIGN KEY (hymnal_id) REFERENCES hymnals(id)
);

CREATE TABLE IF NOT EXISTS hymn_verses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hymn_entry_id TEXT NOT NULL,
    verse_number INTEGER NOT NULL,
    stanza_text TEXT NOT NULL,
    chorus_text TEXT,
    FOREIGN KEY (hymn_entry_id) REFERENCES hymn_entries(id)
);

-- 3. Parallel Bible Translations & Verses
CREATE TABLE IF NOT EXISTS bible_translations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    language TEXT NOT NULL,
    copyright TEXT,
    is_installed INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS bible_verses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    translation_id TEXT NOT NULL,
    book_id INTEGER NOT NULL,
    book_name TEXT NOT NULL,
    chapter INTEGER NOT NULL,
    verse INTEGER NOT NULL,
    text TEXT NOT NULL,
    FOREIGN KEY (translation_id) REFERENCES bible_translations(id)
);
CREATE INDEX IF NOT EXISTS idx_bible_lookup ON bible_verses(translation_id, book_id, chapter, verse);
CREATE VIRTUAL TABLE IF NOT EXISTS bible_fts USING fts5(translation_id, book_name, chapter, verse, text);

-- 4. Service Schedules & Playlists
CREATE TABLE IF NOT EXISTS service_schedules (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    service_date DATE NOT NULL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS schedule_items (
    id TEXT PRIMARY KEY,
    schedule_id TEXT NOT NULL,
    item_order INTEGER NOT NULL,
    item_type TEXT NOT NULL,
    reference_id TEXT,
    custom_title TEXT,
    slide_data TEXT,
    FOREIGN KEY (schedule_id) REFERENCES service_schedules(id) ON DELETE CASCADE
);
```

---

## 6. Implementation Milestones (Completed)

1. **Step 1 — Single Source Theme Engine (`tailwind.config.js`):** `colors.app` design tokens (`bg-app-bg`, `bg-app-panel`, `border-app-border`, `text-app-text`, `text-app-accent`, `bg-app-live`).
2. **Step 2 — 4-Panel OpenLP Staging Dashboard:** Library | Service | Preview | Live panelling in [OperatorDashboard.tsx](file:///c:/Users/USER/Desktop/churchle/src/renderer/src/views/OperatorDashboard.tsx) with two-stage commit staging and keyboard hotkeys.
3. **Step 3 — OpenLP List-of-Results Bible & Hymnal Views:** List-of-results scripture search with Shift-click selection + MHB hymnal explorer index.
4. **Step 4 — Theme Preset Manager & Settings Screen:** Named theme preset customizer + system preferences.
5. **Step 5 — Native Service Disk Files & CCLI Integration:** `.churchle` file save/load dialogs + CCLI License # support.
