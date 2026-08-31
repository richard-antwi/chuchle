import { useState } from 'react'
import { ServiceQueueItem } from './OrderOfServicePanel'

interface ServiceAndThemesPanelProps {
  queueItems: ServiceQueueItem[]
  stagedItemId: string
  onSelectQueueItem: (item: ServiceQueueItem) => void
  onSaveService?: () => void
  onOpenService?: () => void
}

export default function ServiceAndThemesPanel({
  queueItems,
  stagedItemId,
  onSelectQueueItem,
  onSaveService,
  onOpenService
}: ServiceAndThemesPanelProps) {
  const [themes] = useState([
    { id: 'blue_burst', name: 'Blue Burst', bg: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)' },
    { id: 'clouds', name: 'Clouds', bg: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)' },
    { id: 'default', name: 'Default (default)', bg: 'linear-gradient(135deg, #000428 0%, #004e92 100%)' },
    { id: 'geo_purple', name: 'Geo Purple', bg: 'linear-gradient(135deg, #302b63 0%, #24243e 100%)' }
  ])

  const [selectedThemeId, setSelectedThemeId] = useState('default')

  return (
    <div className="w-[260px] bg-app-panel flex flex-col justify-between select-none">
      {/* TOP 50%: SERVICE ORDER PANEL (Matching Picture 1) */}
      <div className="h-1/2 border-b border-app-border flex flex-col min-h-0">
        {/* Header Bar */}
        <div className="p-2 border-b border-app-border bg-app-toolbar flex items-center justify-between">
          <span className="text-xs font-bold text-app-text flex items-center gap-1.5">
            <span>Service</span>
            <span className="text-[10px] text-app-text-3 font-normal">({queueItems.length} items)</span>
          </span>
        </div>

        {/* Icon Toolbar (Matching Picture 1) */}
        <div className="p-1.5 border-b border-app-border bg-app-toolbar flex items-center gap-1">
          {onOpenService && (
            <button
              title="Open Service"
              onClick={onOpenService}
              className="p-1.5 hover:bg-app-border rounded text-app-text-2 hover:text-app-text transition cursor-pointer text-xs"
            >
              📂
            </button>
          )}
          {onSaveService && (
            <button
              title="Save Service"
              onClick={onSaveService}
              className="p-1.5 hover:bg-app-border rounded text-app-text-2 hover:text-app-text transition cursor-pointer text-xs"
            >
              💾
            </button>
          )}
          <div className="w-[1px] h-4 bg-app-border mx-0.5" />
          <button
            title="Move Item Up"
            className="p-1.5 hover:bg-app-border rounded text-app-text-2 hover:text-app-text transition cursor-pointer text-xs"
          >
            ↑
          </button>
          <button
            title="Move Item Down"
            className="p-1.5 hover:bg-app-border rounded text-app-text-2 hover:text-app-text transition cursor-pointer text-xs"
          >
            ↓
          </button>
          <button
            title="Delete Item"
            className="p-1.5 hover:bg-app-border rounded text-app-text-2 hover:text-app-text transition cursor-pointer text-xs"
          >
            🗑️
          </button>
        </div>

        {/* Scrollable Service Items List */}
        <div className="flex-1 overflow-y-auto p-1 space-y-0.5 bg-app-panel">
          {queueItems.map((item, idx) => {
            const isStaged = stagedItemId === item.id
            return (
              <div
                key={item.id}
                onClick={() => onSelectQueueItem(item)}
                className={`px-2.5 py-2 rounded text-xs font-semibold cursor-pointer transition flex items-center gap-2 ${
                  isStaged
                    ? 'bg-app-accent text-white font-bold shadow-sm'
                    : 'text-app-text hover:bg-app-toolbar'
                }`}
              >
                <span className="text-[10px] font-mono opacity-60 w-4">{idx + 1}.</span>
                <div className="flex-1 truncate">
                  <div className="truncate">{item.title}</div>
                  <div className={`text-[10px] font-normal truncate ${isStaged ? 'text-blue-100' : 'text-app-text-3'}`}>
                    {item.sub}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* BOTTOM 50%: THEMES PANEL (Matching Picture 1) */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header Bar */}
        <div className="p-2 border-b border-app-border bg-app-toolbar flex items-center justify-between">
          <span className="text-xs font-bold text-app-text">Themes</span>
        </div>

        {/* Icon Toolbar (Matching Picture 1) */}
        <div className="p-1.5 border-b border-app-border bg-app-toolbar flex items-center gap-1">
          <button
            title="Create New Theme"
            className="p-1.5 hover:bg-app-border rounded text-app-text-2 hover:text-app-text transition cursor-pointer text-xs"
          >
            ➕
          </button>
          <button
            title="Edit Theme"
            className="p-1.5 hover:bg-app-border rounded text-app-text-2 hover:text-app-text transition cursor-pointer text-xs"
          >
            ✏️
          </button>
          <button
            title="Delete Theme"
            className="p-1.5 hover:bg-app-border rounded text-app-text-2 hover:text-app-text transition cursor-pointer text-xs"
          >
            🗑️
          </button>
          <div className="w-[1px] h-4 bg-app-border mx-0.5" />
          <button
            title="Export Theme"
            className="p-1.5 hover:bg-app-border rounded text-app-text-2 hover:text-app-text transition cursor-pointer text-xs"
          >
            ⬆
          </button>
          <button
            title="Import Theme"
            className="p-1.5 hover:bg-app-border rounded text-app-text-2 hover:text-app-text transition cursor-pointer text-xs"
          >
            ⬇
          </button>
        </div>

        {/* Scrollable Theme Thumbnail Cards List (Matching Picture 1) */}
        <div className="flex-1 overflow-y-auto p-1.5 space-y-2 bg-app-panel">
          {themes.map((th) => {
            const isSel = selectedThemeId === th.id
            return (
              <div
                key={th.id}
                onClick={() => setSelectedThemeId(th.id)}
                className={`p-1.5 rounded border transition cursor-pointer flex items-center gap-2.5 ${
                  isSel
                    ? 'bg-app-accent-bg border-app-accent text-white font-bold'
                    : 'bg-app-panel border-app-border text-app-text hover:border-app-border-strong'
                }`}
              >
                <div
                  className="w-14 aspect-video rounded border border-app-border flex-shrink-0 flex items-center justify-center p-1 text-[8px] font-bold text-white shadow-sm"
                  style={{ background: th.bg }}
                >
                  Aa
                </div>
                <span className="text-xs truncate font-semibold">{th.name}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
