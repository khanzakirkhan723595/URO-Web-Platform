// src/components/ErrorBoundary.jsx
// Catches rendering errors so one broken component does not blank the whole site.
import { Component } from 'react';
import { AlertTriangle } from 'lucide-react';

class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('UI error caught by ErrorBoundary:', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="container-page flex min-h-[60vh] items-center justify-center py-16">
        <div className="panel max-w-md text-center">
          <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-amber-500" />
          <h1 className="mb-2 text-xl font-bold text-slate-900">Something went wrong</h1>
          <p className="mb-6 text-sm text-slate-600">An unexpected error occurred while displaying this page.</p>
          <button className="btn-primary" onClick={() => window.location.assign('/')}>Back to home</button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
