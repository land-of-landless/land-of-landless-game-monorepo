/**
 * ErrorBoundary — catches render errors and shows a fallback UI.
 */

import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  fallback?: ReactNode;
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div style={{ padding: '2rem', color: '#d63031', textAlign: 'center' }}>
            <h2>Something went wrong</h2>
            <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', opacity: 0.7 }}>
              {this.state.error?.message}
            </p>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
