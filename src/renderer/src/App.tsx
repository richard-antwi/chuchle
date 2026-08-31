import { useState, useEffect } from 'react'
import AudienceView from './views/AudienceView'
import StageView from './views/StageView'
import FoyerView from './views/FoyerView'
import OperatorDashboard from './views/OperatorDashboard'
import LowerThirdView from './views/LowerThirdView'

import { useDisplayStore } from './stores/useDisplayStore'

function App(): React.JSX.Element {
  const uiThemeMode = useDisplayStore((state) => state.uiThemeMode)

  useEffect(() => {
    const root = document.documentElement
    if (uiThemeMode === 'light') {
      root.style.setProperty('--bg', '#eef0f3')
      root.style.setProperty('--panel', '#ffffff')
      root.style.setProperty('--border', '#d7dbe1')
      root.style.setProperty('--border-strong', '#b9c0ca')
      root.style.setProperty('--text', '#22262c')
      root.style.setProperty('--text-2', '#5b6270')
      root.style.setProperty('--text-3', '#9399a4')
      root.style.setProperty('--accent', '#2f6fed')
      root.style.setProperty('--accent-bg', '#e8f0fe')
      root.style.setProperty('--toolbar', '#f6f7f9')
      root.style.setProperty('--live', '#d8352c')
      root.style.setProperty('--live-bg', '#fdeceb')
    } else {
      root.style.setProperty('--bg', '#1e1e1e')
      root.style.setProperty('--panel', '#2d2d2d')
      root.style.setProperty('--border', '#3e3e42')
      root.style.setProperty('--border-strong', '#505054')
      root.style.setProperty('--text', '#ffffff')
      root.style.setProperty('--text-2', '#bbbbbb')
      root.style.setProperty('--text-3', '#888888')
      root.style.setProperty('--accent', '#2b73d2')
      root.style.setProperty('--accent-bg', '#1b4985')
      root.style.setProperty('--toolbar', '#252526')
      root.style.setProperty('--live', '#d8352c')
      root.style.setProperty('--live-bg', '#3f1917')
    }
  }, [uiThemeMode])

  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    const hash = window.location.hash
    // Parse route from hash (e.g. "#/audience" -> "audience")
    return hash.replace(/^#\/?/, '') || 'operator'
  })

  useEffect(() => {
    const handleHashChange = (): void => {
      const hash = window.location.hash
      setCurrentRoute(hash.replace(/^#\/?/, '') || 'operator')
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  switch (currentRoute) {
    case 'audience':
      return <AudienceView />
    case 'stage':
      return <StageView />
    case 'foyer':
      return <FoyerView />
    case 'lowerthird':
      return <LowerThirdView />
    case 'operator':
    default:
      return <OperatorDashboard />
  }
}

export default App
