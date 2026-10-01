import React from 'react';
import { AlertTriangle, RotateCcw, LogOut } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  onExit?: () => void;
  lang?: 'es' | 'en';
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class TerminalErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error?.message || 'Error desconocido en el terminal'
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ZYTI Terminal] Error de renderizado:', error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false, errorMessage: '' });
    try {
      localStorage.removeItem('zyti_limit_orders');
    } catch {}
    window.location.reload();
  };

  render() {
    const isEs = this.props.lang !== 'en';

    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen bg-[#fbf9f4] flex flex-col items-center justify-center gap-6 px-6 font-sans">
          <div className="flex flex-col items-center gap-4 max-w-md text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-950 mb-1">
                {isEs ? 'Error en el Terminal' : 'Terminal Error'}
              </h2>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                {isEs
                  ? 'Se produjo un error inesperado al cargar el terminal de trading. Puedes recargar o volver al inicio.'
                  : 'An unexpected error occurred while loading the trading terminal. You can reload or go back to home.'}
              </p>
              {this.state.errorMessage && (
                <p className="mt-2 text-xs font-mono text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 text-left break-all">
                  {this.state.errorMessage}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#eab308] hover:bg-[#ca8a04] text-slate-950 font-black text-sm shadow-sm transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{isEs ? 'Recargar Terminal' : 'Reload Terminal'}</span>
              </button>
              {this.props.onExit && (
                <button
                  type="button"
                  onClick={this.props.onExit}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm border border-slate-200 transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{isEs ? 'Salir' : 'Exit'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
