import { Component, ReactNode, ErrorInfo } from 'react'
import { useDiagnosticsStore } from '../stores/useDiagnosticsStore'

interface Props {
  children: ReactNode
  fallbackTitle?: string
}

interface State {
  hasError: boolean
  errorMessage: string
}

export default class PresentationErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: ''
  }

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error.message || 'Presentation rendering error occurred.'
    }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('PresentationErrorBoundary caught exception:', error, errorInfo)
    useDiagnosticsStore.getState().setRendererStatus('fallback')
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full bg-black/90 text-white p-4 flex flex-col items-center justify-center text-center space-y-2 select-none border border-app-live rounded-lg">
          <span className="text-xs font-bold text-app-live uppercase tracking-widest">
            [ WebGL Presentation Fallback ]
          </span>
          <p className="text-xs text-gray-300 font-mono max-w-xs">{this.state.errorMessage}</p>
          <button
            onClick={() => {
              this.setState({ hasError: false, errorMessage: '' })
              useDiagnosticsStore.getState().setRendererStatus('ready')
            }}
            className="px-3 py-1 bg-app-accent text-white text-[11px] font-bold rounded hover:opacity-90 transition cursor-pointer"
          >
            Retry WebGL Stage
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
