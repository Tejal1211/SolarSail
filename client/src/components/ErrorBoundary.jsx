import React from 'react';

/**
 * Error Boundary Component
 * Catches React component errors and displays fallback UI
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error caught by boundary:', error, errorInfo);
    }

    // Update state with error details
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    // Could send to error tracking service here
    // e.g., Sentry, LogRocket, etc.
  }

  resetError = () => {
    this.setState({ 
      hasError: false, 
      error: null,
      errorInfo: null 
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div 
          role="alert" 
          className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center px-4"
          aria-live="polite"
        >
          <div className="text-center">
            <h1 className="text-4xl font-bold text-red-500 mb-4">
              Oops! Something went wrong
            </h1>
            <p className="text-gray-300 mb-6 max-w-md">
              The application encountered an unexpected error. 
              Please try refreshing the page or contact support.
            </p>
            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <details className="text-left bg-slate-800 p-4 rounded mb-6 max-w-xl mx-auto">
                <summary className="cursor-pointer text-yellow-500 font-mono">
                  Error Details (Dev Only)
                </summary>
                <pre className="text-red-400 text-sm mt-2 overflow-auto">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
            <button
              onClick={this.resetError}
              onKeyPress={(e) => e.key === 'Enter' && this.resetError()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition"
              aria-label="Try again"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
