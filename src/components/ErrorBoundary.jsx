import { Component } from 'react'

export default class ErrorBoundary extends Component {
    state = { hasError: false }

    static getDerivedStateFromError() {
        return { hasError: true }
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-950 text-gray-400">
                    <div className="text-center">
                        <p className="text-lg font-semibold text-gray-200 mb-1">Something went wrong</p>
                        <p className="text-sm">Please refresh the page to continue.</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 bg-primary hover:bg-primary-hover text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                        >
                            Refresh
                        </button>
                    </div>
                </div>
            )
        }
        return this.props.children
    }
}
