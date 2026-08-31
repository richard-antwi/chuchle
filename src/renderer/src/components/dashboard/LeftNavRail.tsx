import { useState } from 'react'

export interface TabItem {
  id: string
  label: string
  icon: string
  badge?: string
}

interface LeftNavRailProps {
  activeTab: string
  onTabChange: (tabId: string) => void
}

const TABS: TabItem[] = [
  { id: 'slides', label: 'Slides', icon: '📽️' },
  { id: 'scripture', label: 'Scripture & Hymnal', icon: '📖' },
  { id: 'camera', label: 'Camera & Visuals', icon: '📹' },
  { id: 'audio', label: 'Audio Mixer', icon: '🎛️' },
  { id: 'streaming', label: 'Streaming', icon: '📡' },
  { id: 'remote', label: 'Remote & AI', icon: '🎙️' },
  { id: 'themes', label: 'Theme Manager', icon: '🎨' },
  { id: 'settings', label: 'System Settings', icon: '⚙️' }
]

export default function LeftNavRail({ activeTab, onTabChange }: LeftNavRailProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={`bg-app-toolbar border-r border-app-border flex flex-col justify-between transition-all duration-200 select-none ${
        collapsed ? 'w-16' : 'w-52'
      }`}
    >
      {/* Navigation Items */}
      <nav className="p-2 space-y-1">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              title={collapsed ? tab.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition duration-150 cursor-pointer ${
                isActive
                  ? 'bg-app-accent-bg text-app-accent border border-app-accent/30 shadow-sm font-extrabold'
                  : 'text-app-text-2 hover:text-app-text hover:bg-app-panel border border-transparent'
              }`}
            >
              <span className="text-base leading-none">{tab.icon}</span>
              {!collapsed && <span className="truncate">{tab.label}</span>}
            </button>
          )
        })}
      </nav>

      {/* Collapse / Expand Toggle Button */}
      <div className="p-2 border-t border-app-border">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 text-app-text-3 hover:text-app-text rounded-lg hover:bg-app-panel transition duration-150 cursor-pointer text-xs"
        >
          {collapsed ? '➔' : '← Collapse'}
        </button>
      </div>
    </aside>
  )
}
