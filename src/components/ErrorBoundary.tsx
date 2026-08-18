import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, showDetails: false });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/app';
  };

  public render() {
    if (this.state.hasError) {
      const title = this.props.fallbackTitle || 'Modul konnte nicht geladen werden';
      const errorMessage = this.state.error?.message || 'Ein unerwarteter Laufzeitfehler ist aufgetreten.';

      return (
        <div className="min-h-[300px] w-full flex flex-col items-center justify-center p-6 bg-surface/80 border border-border/80 rounded-3xl shadow-xl backdrop-blur-md animate-in fade-in duration-200 my-4 text-center">
          <div className="p-4 rounded-2xl bg-red-500/10 text-red-500 mb-4 shadow-inner">
            <AlertTriangle size={36} className="animate-pulse" />
          </div>

          <h3 className="text-xl font-black text-text-primary tracking-tight mb-2">
            {title}
          </h3>
          <p className="text-text-muted text-sm max-w-md mb-6 leading-relaxed">
            {errorMessage}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
            <button
              onClick={this.handleReset}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw size={14} />
              Erneut versuchen
            </button>

            <button
              onClick={this.handleReload}
              className="px-4 py-2.5 bg-surface hover:bg-background border border-border text-text-primary font-bold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <RefreshCw size={14} />
              Seite neu laden
            </button>

            <button
              onClick={this.handleGoHome}
              className="px-4 py-2.5 bg-surface hover:bg-background border border-border text-text-muted hover:text-text-primary font-bold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <Home size={14} />
              Zum Dashboard
            </button>
          </div>

          {/* Technical Details for debugging */}
          {this.state.error && (
            <div className="w-full max-w-lg mt-4 text-left">
              <button
                onClick={() => this.setState(prev => ({ showDetails: !prev.showDetails }))}
                className="text-[11px] font-bold text-text-muted hover:text-text-primary flex items-center gap-1 mx-auto cursor-pointer py-1"
              >
                {this.state.showDetails ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                {this.state.showDetails ? 'Technische Details verbergen' : 'Technische Details anzeigen'}
              </button>

              {this.state.showDetails && (
                <div className="mt-2 p-3 bg-background border border-border/70 rounded-xl font-mono text-[11px] text-red-400 overflow-x-auto max-h-48 custom-scrollbar leading-relaxed">
                  <div className="font-bold mb-1">{this.state.error.toString()}</div>
                  {this.state.errorInfo?.componentStack && (
                    <pre className="text-text-muted text-[10px] whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
