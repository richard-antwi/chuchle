import { useState, useEffect } from 'react'
import AudienceView from './views/AudienceView'
import StageView from './views/StageView'
import FoyerView from './views/FoyerView'
import OperatorDashboard from './views/OperatorDashboard'

function App(): React.JSX.Element {
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
    case 'operator':
    default:
      return <OperatorDashboard />
  }
}

export default App
