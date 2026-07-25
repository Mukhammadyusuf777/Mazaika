import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
          height: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', textAlign: 'center', padding: '24px'
        }}>
          <h1 style={{ fontSize: '32px', marginBottom: '16px', color: '#ff4d4d' }}>Oops, nimadir xato ketdi!</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
            {this.state.error?.message || 'Kutilmagan xatolik yuz berdi.'}
          </p>
          <button 
            className="btn btn-primary" 
            onClick={() => window.location.href = '/dashboard'}
          >
            Bosh sahifaga qaytish
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
