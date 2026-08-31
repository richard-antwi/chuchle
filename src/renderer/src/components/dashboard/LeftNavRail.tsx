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
  { id: 'setup', label: 'Displays & Setup', icon: '⚙️' }
]

export default function LeftNavRail({ activeTab, onTabChange }: LeftNavRailProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={`bg-[#0B0E14] border-r border-[#232B38] flex flex-col justify-between transition-all duration-200 select-none ${
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
                  ? 'bg-[#141922] text-[#F5A623] border border-[#F5A623]/40 shadow-sm'
                  : 'text-slate-400 hover:text-[#E8EAED] hover:bg-[#141922]/60 border border-transparent'
              }`}
            >
              <span className="text-base leading-none">{tab.icon}</span>
              {!collapsed && <span className="truncate">{tab.label}</span>}
            </button>
          )
        })}
      </nav>

      {/* Collapse / Expand Toggle Button */}
      <div className="p-2 border-t border-[#232B38]">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 text-slate-500 hover:text-slate-300 rounded-lg hover:bg-[#141922] transition duration-150 cursor-pointer text-xs"
        >
          {collapsed ? '➔' : '← Collapse'}
        </button>
      </div>
    </aside>
  )
}
