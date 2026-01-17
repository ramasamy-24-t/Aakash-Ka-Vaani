import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-8">
                    <div className="max-w-2xl w-full space-y-4">
                        <h1 className="text-3xl font-bold text-red-500">Something went wrong.</h1>
                        <div className="bg-black/50 p-6 rounded-xl border border-red-500/20 overflow-auto">
                            <h2 className="text-xl font-semibold mb-2">{this.state.error?.toString()}</h2>
                            <pre className="text-sm text-gray-400 whitespace-pre-wrap font-mono">
                                {this.state.errorInfo?.componentStack}
                            </pre>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
