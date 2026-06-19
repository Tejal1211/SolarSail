import React from 'react';

/**
 * Error Boundary Component
 * Catches and displays errors gracefully with accessibility support
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo,
    });
    console.error('Error caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4"
          role="alert"
          aria-live="assertive"
        >
          <div className="max-w-md w-full bg-gray-800 rounded-lg p-8 shadow-2xl">
            <h1 className="text-2xl font-bold text-red-500 mb-4">
              ⚠️ Something went wrong
            </h1>

            <p className="text-gray-300 mb-4">
              We encountered an error. Please try again.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-4 p-3 bg-gray-700 rounded text-xs">
                <summary className="cursor-pointer font-mono text-yellow-400">
                  Error Details (Dev Only)
                </summary>
                <pre className="mt-2 overflow-auto text-gray-200 max-h-48">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}

            <div className="space-y-3">
              <button
                onClick={this.handleReset}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition"
                aria-label="Try again"
              >
                Try Again
              </button>

              <a
                href="/"
                className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition"
              >
                Back to Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
