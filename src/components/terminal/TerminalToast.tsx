import React, { useEffect, useState } from 'react';
import { Target, ShieldAlert, X, TrendingUp, TrendingDown, CheckCircle2 } from 'lucide-react';
import { playTakeProfitSound, playStopLossSound } from '../../utils/audioAlerts';

export interface ToastNotification {
  id: string;
  type: 'tp' | 'sl' | 'info' | 'success';
  title: string;
  message?: string;
  symbol?: string;
  pnlUsdt?: number;
  pnlPercent?: number;
  price?: number;
  duration?: number;
}

interface TerminalToastProps {
  toasts: ToastNotification[];
  onDismiss: (id: string) => void;
  isEs: boolean;
}

export const TerminalToast: React.FC<TerminalToastProps> = ({
  toasts,
  onDismiss,
  isEs
}) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-14 sm:top-16 right-2 sm:right-6 z-50 flex flex-col gap-2 max-w-[94vw] sm:max-w-sm pointer-events-none select-none">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={onDismiss}
          isEs={isEs}
        />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{
  toast: ToastNotification;
  onDismiss: (id: string) => void;
  isEs: boolean;
}> = ({ toast, onDismiss, isEs }) => {
  const duration = toast.duration ?? 5000;
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // Reproducir sonido armónico correspondiente
    if (toast.type === 'tp') {
      playTakeProfitSound();
    } else if (toast.type === 'sl') {
      playStopLossSound();
    }

    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (elapsed >= duration) {
        clearInterval(interval);
        onDismiss(toast.id);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [toast.id, toast.type, duration, onDismiss]);

  const isTP = toast.type === 'tp';
  const isSL = toast.type === 'sl';
  const isSuccess = toast.type === 'success';

  return (
    <div
      className={`pointer-events-auto relative overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-md p-3.5 transition-all duration-300 animate-slide-in-right ${
        isTP
          ? 'bg-slate-950/95 border-emerald-500/50 text-white shadow-emerald-950/30'
          : isSL
          ? 'bg-slate-950/95 border-rose-500/50 text-white shadow-rose-950/30'
          : isSuccess
          ? 'bg-slate-950/95 border-amber-500/50 text-white shadow-amber-950/20'
          : 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-900/10'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* ICONO CON GLOW */}
        <div
          className={`p-2 rounded-xl shrink-0 ${
            isTP
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : isSL
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              : isSuccess
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : 'bg-slate-100 text-slate-700'
          }`}
        >
          {isTP && <Target className="w-5 h-5 animate-pulse" />}
          {isSL && <ShieldAlert className="w-5 h-5" />}
          {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          {!isTP && !isSL && !isSuccess && <CheckCircle2 className="w-5 h-5" />}
        </div>

        {/* CONTENIDO TEXTUAL */}
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-black tracking-tight">{toast.title}</span>
            {toast.symbol && (
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {toast.symbol}
              </span>
            )}
          </div>

          {toast.message && (
            <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
              {toast.message}
            </p>
          )}

          {/* DETALLES DE PNL Y PRECIO */}
          {(toast.pnlUsdt !== undefined || toast.price !== undefined) && (
            <div className="flex items-center gap-2 mt-1.5 text-xs font-mono">
              {toast.pnlUsdt !== undefined && (
                <span
                  className={`font-black flex items-center gap-0.5 ${
                    toast.pnlUsdt >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {toast.pnlUsdt >= 0 ? (
                    <TrendingUp className="w-3.5 h-3.5" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {toast.pnlUsdt >= 0 ? '+' : ''}${toast.pnlUsdt.toFixed(2)} USDT
                  </span>
                  {toast.pnlPercent !== undefined && (
                    <span className="text-[10px] opacity-80">
                      ({toast.pnlPercent >= 0 ? '+' : ''}{toast.pnlPercent.toFixed(1)}%)
                    </span>
                  )}
                </span>
              )}

              {toast.price !== undefined && (
                <span className="text-[10px] text-slate-400">
                  @${toast.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              )}
            </div>
          )}
        </div>

        {/* BOTÓN CERRAR */}
        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer shrink-0"
          title={isEs ? 'Cerrar' : 'Dismiss'}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* BARRA DE PROGRESO DE AUTO-DISMISS */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-800/50">
        <div
          className={`h-full transition-all duration-75 ${
            isTP ? 'bg-emerald-500' : isSL ? 'bg-rose-500' : 'bg-amber-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
