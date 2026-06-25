import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4 text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-4">عذراً، حدث خطأ غير متوقع</h2>
          <p className="text-slate-400 mb-4">{this.state.error?.message}</p>
          <button
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-full font-bold"
            onClick={() => window.location.href = '/'}
          >
            العودة للرئيسية
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
