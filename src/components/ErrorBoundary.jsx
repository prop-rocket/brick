import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('[brick] Unhandled render error:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-mortar px-6 text-center">
          <div className="flex flex-col gap-2">
            <h1 className="heading text-2xl text-chalk">Something went wrong</h1>
            <p className="text-sm text-iron">
              {this.state.error?.message ?? 'An unexpected error occurred.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="heading min-h-tap rounded-lg bg-brick-red px-6 text-base text-chalk hover:bg-ember"
          >
            Reload app
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
