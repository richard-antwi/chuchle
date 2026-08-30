
# Next-Gen Church Presentation, Broadcasting & Stage Management Suite
## Master Product Requirements Document (PRD) & AI Implementation Blueprint
**Document Version:** 4.0 (Universal Master Production Specification)

---

## 1. Executive Summary & Product Vision
The **Next-Gen Presentation Suite** is a cross-platform, multi-display church presentation, live broadcasting, and stage management desktop application. 

It combines the best aspects of industry leaders into a single, unified workflow:
* **EasyWorship:** Frictionless UI simplicity and rapid hotkey navigation.
* **ProPresenter:** Multi-target "Audience Looks" routing, stage confidence screens, and native lower thirds.
* **vMix / OBS:** Direct camera switching, transparent NDI streaming, chroma keying, and live video color grading.
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
|  - External Media Control Bridge (VLC HTTP API, LibVLC Native, Spotify Web API)                   |
|  - Local Fastify + Socket.io LAN Server (Zero-Install Mobile Clicker & Musician Stage Views)      |
|  - Hardware Protocol Bridges (OBS WebSocket v5, vMix HTTP/TCP, MIDI, OSC, ATEM DSK)              |
+-------------------------------------------------+-------------------------------------------------+
                                                  | Zero-Copy IPC / Texture Buffers
        +-----------------------------------------+-----------------------------------------+
        |                                                                                   |
+-------v---------------------------------------+     +-------------------------------------v-------+
|        OPERATOR CONTROL DASHBOARD             |     |           PROJECTED OUTPUT ENGINES          |
|  - React 19 + TypeScript + Tailwind CSS       |     |  - Screen 1: Main Projector (PixiJS 8 WebGL)|
|  - Multi-Camera Switcher & Color Grading FX   |     |  - Screen 2: Musician Stage Display (Chords)|
|  - Web Audio Live Mixer & Auto-Ducking        |     |  - Screen 3: Live Stream (NDI Alpha Key)    |
|  - Smart Lyric Auto-Reflow Parser             |     |  - Screen 4: Spillover / In-House TV        |
|  - AI Real-Time Speech Scripture Detector     |     |  - Parallel Multi-Language Sync Engine      |
+-----------------------------------------------+     +---------------------------------------------+
```

### Technology Specification

| Domain | Technology / Library | Architectural Role |
| :--- | :--- | :--- |
| **Desktop Shell** | Electron 31+ | Native multi-monitor management, borderless rendering windows, low-level OS hooks. |
| **Frontend Framework** | React 19 + TypeScript | High-performance declarative state rendering with Shadcn UI components. |
| **State Management** | Zustand + Immer | Microsecond state dispatching; isolated store slices for live outputs vs operator tools. |
| **Rendering Engine** | PixiJS 8 (WebGL / WebGPU) | 60+ FPS hardware-accelerated text compositing, motion video loops, and shader transitions. |
| **Local Database** | `better-sqlite3` | Zero-latency, relational offline storage for Bibles, songs, hymnals, and schedules with FTS5 search. |
| **Video Playback** | LibVLC / `node-libmpv` / FFmpeg | Seamless rendering of all codecs (H.264/H.265, ProRes 4444 Alpha, WebM, MKV, MP4). |
| **External Media Bridge** | VLC HTTP API / Spotify API | Bi-directional transport controls, status polling, and timeline scrubbing for external players. |
| **Camera Ingestion** | WebRTC / MediaDevices / RTSP / NDI | Ingests USB capture cards, webcams, Iriun/DroidCam wireless feeds, and PTZ IP cameras. |
| **Broadcast Protocol** | `grandiose` (NewTek NDI 5/6 SDK) | Real-time transparent lower-third video/audio streaming directly to OBS and vMix. |
| **Local Remote Hub** | Fastify + Socket.io | Built-in zero-config local web server for Mobile Remote & Stage Web App over local Wi-Fi. |
| **Office/Slide Import** | `libreoffice-convert` / `pptxgenjs` | Native parsing and live rendering of PPT, PPTX, PDF, Keynote, and Word files. |
| **Audio Processing** | Web Audio API / `node-speaker` | Multi-band EQ, compressor/limiter, master gain faders, and automatic audio ducking. |
| **AI Processing** | Whisper.wasm / `@xenova/transformers` | Offline local speech-to-text scripture cueing and intelligent lyric auto-splitting. |

---

## 3. Comprehensive Feature Specifications

### 3.1 Parallel Multi-Version Bibles & Dual-Language Hymnals
* **Multi-Version Scripture Presentation:**
  - Display up to 3 translations simultaneously in **Side-by-Side (2/3 columns)** or **Stacked (Top/Bottom)** layouts (e.g., NIV + Twi Asante, KJV + French LSG).
  - Single passage selection instantly retrieves and locks all translations in step.
* **Denominational Dual-Language Hymnals:**
  - Pre-indexed support for Methodist (MHB / CAN), Presbyterian (PHB), SDA, Baptist, Catholic, and Pentecostal hymnals.
  - Automatic cross-lingual pairing (e.g., MHB 1 English mapped directly to MHB 1 Twi).
  - Live instant language switch hotkey (`T`) to toggle verses mid-song without deselecting the slide.
* **Hybrid Bible Delivery & Cloud Asset Hub:**
  - Public domain translations pre-bundled for offline use.
  - In-app store to download language packs and themes with a single click.
  - Universal Bible importer supporting Zefania XML, OSIS XML, CSV, OpenSong, and BibleShow `.dat`/SQLite modules.

### 3.2 Universal Live Camera Feeds & Wireless Phone Streaming
* **Wired Capture Hardware:** Magewell, Elgato Cam Link, Blackmagic DeckLink, and standard USB 3.0 webcams.
* **Wireless Smartphone Cams:** Native connection to Iriun Webcam, DroidCam, and EpocCam virtual drivers over Wi-Fi or USB tethering.
* **Network & PTZ Streams:** Hardware-decoded **RTSP, RTMP, HTTP/MJPEG, and WebRTC** streams with VISCA-over-IP PTZ control.
* **Live Video Layering & Chroma Keying:** Real-time green/blue screen chroma keying for transparent presenter feeds.

### 3.3 Audio/Visual Live Control Suite
* **Live Video Color Grading:** Hardware-accelerated real-time sliders for **Brightness, Contrast, Saturation, Hue, White Balance, and Sharpness** via WebGL shaders.
* **Audio Mixing & Routing:** Multi-channel audio mixer, peak dBVU meters, master hardware output routing, crossfaders, and audio ducking.

### 3.4 VLC & External Media Player Integration
* **External VLC Remote Bridge:** Full bi-directional transport controls (Play, Pause, Stop, Seek Scrubbing, Volume Fader, Aspect Ratio) via VLC's HTTP/Telnet API.
* **Embedded LibVLC Engine:** Direct playback of damaged media files, DVD/VCD streams, ISOs, and broadcast formats (ProRes, MXF, MPEG-TS).
* **Background Music Players:** Pre-service background music integration with Spotify and local media players.

### 3.5 Smart Lyric Ingestion & AI Automation
* **Raw Web Lyric Auto-Reflow:** Paste unformatted song text copied from the web; the system automatically detects stanzas (`[Verse]`, `[Chorus]`, `[Bridge]`) and splits long paragraphs into balanced 2-to-4 line presentation slides.
* **AI Smart Scripture Ear:** Local offline Whisper speech recognition that identifies spoken scripture references in real time and cues them on the preview screen.

### 3.6 Multi-Target Output & Broadcast Protocols
* **Audience Looks Routing:** Simultaneous generation of 4 distinct feeds from 1 click:
  1. **Audience Screen:** Full-bleed lyrics, motion video backgrounds, full-screen media.
  2. **Live Stream Output:** Transparent lower thirds sent via NDI 5/6 directly to OBS/vMix.
  3. **Stage Confidence Monitor:** High-contrast layout with current verse, next verse preview, chords, and timers.
  4. **Foyer / Spillover TV:** Full-screen announcements and branded service schedules.
* **OBS & vMix Automation:** OBS WebSocket v5 integration to trigger camera scenes automatically based on active slide types.
* **Virtual Webcam Output:** Direct virtual camera output for Zoom, Google Meet, and YouTube Live.

### 3.7 Mobile Remote & Web Stage Display
* **Zero-Installation LAN Remote:** Fastify/Socket.io local web server allowing pastors and musicians to control slides and view chord charts from any mobile browser.

---

## 4. SQLite Database Schema (`better-sqlite3`)

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

## 5. Core Implementation Code Modules

### 5.1 Smart Lyric Auto-Reflow Parser (`src/utils/smartLyricReflow.ts`)

```typescript
export interface ReflowedSection {
  type: 'VERSE' | 'CHORUS' | 'BRIDGE' | 'OTHER';
  label: string;
  slides: string[];
}

export function parseAndReflowRawLyrics(rawText: string, linesPerSlide = 4): ReflowedSection[] {
  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  const sections: ReflowedSection[] = [];
  
  let currentLabel = 'Verse 1';
  let currentType: ReflowedSection['type'] = 'VERSE';
  let currentBuffer: string[] = [];
  let verseCounter = 1;

  const headerRegex = /^(\[?(Verse|Chorus|Bridge|Tag|Intro|Ending|Outro)\s*(\d+)?\]?)/i;

  const flushBuffer = () => {
    if (currentBuffer.length === 0) return;
    const slides: string[] = [];
    for (let i = 0; i < currentBuffer.length; i += linesPerSlide) {
      slides.push(currentBuffer.slice(i, i + linesPerSlide).join('\n'));
    }
    sections.push({ type: currentType, label: currentLabel, slides });
    currentBuffer = [];
  };

  for (const line of lines) {
    const match = line.match(headerRegex);
    if (match) {
      flushBuffer();
      const detectedType = match[2].toUpperCase();
      currentType = (['VERSE', 'CHORUS', 'BRIDGE'].includes(detectedType) ? detectedType : 'OTHER') as any;
      currentLabel = match[1].replace(/[\[\]]/g, '');
      if (currentType === 'VERSE' && !match[3]) {
        currentLabel = `Verse ${verseCounter++}`;
      }
    } else {
      currentBuffer.push(line);
    }
  }

  flushBuffer();
  return sections;
}
```

### 5.2 External VLC Remote Control Bridge (`electron/services/VlcMediaService.ts`)

```typescript
import axios from 'axios';

export interface VlcStatus {
  state: 'playing' | 'paused' | 'stopped';
  time: number;
  length: number;
  volume: number;
  fullscreen: boolean;
  filename: string;
}

export class VlcMediaService {
  private baseUrl: string;
  private authHeader: string;
  private pollTimer: NodeJS.Timeout | null = null;

  constructor(host = '127.0.0.1', port = 8080, password = 'churchpassword') {
    this.baseUrl = `http://${host}:${port}/requests/status.json`;
    this.authHeader = `Basic ${Buffer.from(`:${password}`).toString('base64')}`;
  }

  public async sendCommand(command: string, extraParams: Record<string, string | number> = {}): Promise<VlcStatus | null> {
    try {
      const response = await axios.get(this.baseUrl, {
        headers: { Authorization: this.authHeader },
        params: { command, ...extraParams },
        timeout: 1500,
      });
      return {
        state: response.data.state || 'stopped',
        time: response.data.time || 0,
        length: response.data.length || 0,
        volume: response.data.volume || 0,
        fullscreen: Boolean(response.data.fullscreen),
        filename: response.data.information?.category?.meta?.filename || 'External VLC Media',
      };
    } catch (error) {
      return null;
    }
  }

  public play() { return this.sendCommand('pl_play'); }
  public pause() { return this.sendCommand('pl_pause'); }
  public stop() { return this.sendCommand('pl_stop'); }
  public seek(seconds: number) { return this.sendCommand('seek', { val: seconds }); }
  public setVolume(vol0to256: number) { return this.sendCommand('volume', { val: Math.round(vol0to256) }); }
}
```

---

## 6. Step-by-Step AI Implementation Sequence

1. **Step 1: Scaffolding & Multi-Screen Engine** (`DisplayService.ts`, Electron multi-window lifecycle).
2. **Step 2: SQLite Relational Database** (`better-sqlite3`, Bibles, Songs, Hymnals, Schedules).
3. **Step 3: WebGL PixiJS Rendering Core** (`PixiStage.ts`, 60fps GPU layers, parallel scripture view).
4. **Step 4: Camera Ingestion & Color Grading** (`CameraFeedLayer.ts`, WebRTC, Iriun, RTSP, ColorMatrix filters).
5. **Step 5: Media Players & Audio Mixer** (`VlcMediaService.ts`, Web Audio API mixer, auto-ducking).
6. **Step 6: Smart Ingestion & AI Automation** (`smartLyricReflow.ts`, local Whisper speech listener).
7. **Step 7: Streaming Protocols & Office Importers** (NDI 5/6 Alpha channels, OBS WebSocket, PowerPoint converter).
8. **Step 8: Mobile Web Remote & Stage Hub** (Fastify + Socket.io local LAN server).
