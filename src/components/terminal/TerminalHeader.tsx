import React from 'react';
import { ChevronDown, Cpu, Menu, Wallet } from 'lucide-react';
import { UserSession } from '../../lib/supabase';
import { MarketStats } from '../../workers/marketData.worker';

interface TerminalHeaderProps {
  isEs: boolean;
  user: UserSession | null;
  selectedPair: string;
  supportedPairs: string[];
  stats: MarketStats;
  demoBalance: number;
  availableBalance?: number;
  equity?: number;
  isMobileNavOpen: boolean;
  unrealizedPnL?: number;
  positionsCount?: number;
  activeSection?: string;
  onSelectSection?: (section: 'none' | 'exchange' | string) => void;
  onSelectPair: (pair: string) => void;
  onToggleMobileNav: () => void;
  onResetBalance?: () => void;
  onExit?: () => void;
}

export const TerminalHeader: React.FC<TerminalHeaderProps> = ({
  isEs,
  user,
  selectedPair,
  supportedPairs,
  stats,
  demoBalance,
  availableBalance,
  equity,
  unrealizedPnL = 0,
  positionsCount = 0,
  onSelectPair,
  onToggleMobileNav,
  onResetBalance
}) => {
  const isPnlProfit = unrealizedPnL >= 0;
  const currentEquity = equity ?? (demoBalance + unrealizedPnL);
  const currentAvailable = availableBalance ?? demoBalance;

  return (
    <header className="h-11 sm:h-13 border-b border-[#ded5c5] bg-[#fbf9f4] px-2 sm:px-4 flex items-center justify-between shrink-0 z-30 select-none">
      {/* PARTE IZQUIERDA: SELECTOR DE PAR + PRECIO + PNL + SALDO CUENTA */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 overflow-x-auto no-scrollbar py-0.5">
        {/* SELECTOR DE PARES DESPLEGABLE */}
        <div className="relative group shrink-0">
          <button 
            type="button"
            className="flex items-center gap-1 px-1.5 py-1 sm:px-2.5 sm:py-1 rounded-xl bg-white border border-[#ded5c5] hover:border-slate-400 font-black text-[11px] sm:text-xs text-slate-950 cursor-pointer shadow-xs"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{selectedPair}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>
          <div className="absolute top-full left-0 mt-1 w-36 bg-white border border-[#ded5c5] rounded-xl shadow-lg py-1 hidden group-hover:block z-50">
            {supportedPairs.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => onSelectPair(p)}
                className={`w-full text-left px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer hover:bg-amber-50 ${
                  selectedPair === p ? 'text-amber-600 bg-amber-50/50' : 'text-slate-800'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* PRECIO ACTUAL Y % 24H */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 font-mono">
          <span className={`text-[11px] sm:text-xs font-black ${stats.change24h >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            ${stats.lastPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className={`text-[9px] sm:text-[10px] font-bold px-1 py-0.2 rounded ${stats.change24h >= 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {stats.change24h >= 0 ? '+' : ''}{stats.change24h}%
          </span>
        </div>

        {/* EQUITY TOTAL EN TIEMPO REAL: Saldo base + PnL no realizado de posiciones en vivo */}
        <div className="flex items-center gap-1 shrink-0">
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-amber-100/70 border border-amber-200/80 text-[9.5px] sm:text-[11px] font-mono font-bold text-amber-950 shadow-xs">
            <Wallet className="w-3 h-3 text-amber-700 shrink-0" />
            <span className="hidden xs:inline text-amber-800">Demo:</span>
            <span
              className={`font-black transition-colors duration-200 ${
                unrealizedPnL > 0 ? 'text-emerald-700' : unrealizedPnL < 0 ? 'text-red-700' : 'text-amber-950'
              }`}
              title={`Patrimonio Total: $${currentEquity.toFixed(2)} | Saldo Base: $${demoBalance.toFixed(2)} | Libre: $${currentAvailable.toFixed(2)} | PnL: ${unrealizedPnL >= 0 ? '+' : ''}$${unrealizedPnL.toFixed(2)}`}
            >
              ${currentEquity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          {onResetBalance && (
            <button
              type="button"
              onClick={onResetBalance}
              title={isEs ? 'Resetear saldo demo a $10,000' : 'Reset demo balance to $10,000'}
              className="px-1 py-0.5 rounded text-[8px] font-black bg-slate-200 hover:bg-red-100 text-slate-500 hover:text-red-700 border border-slate-300 hover:border-red-300 transition-colors cursor-pointer shrink-0"
            >
              RST
            </button>
          )}
        </div>

        {/* PNL NO REALIZADO SIEMPRE VISIBLE EN MÓVIL Y ESCRITORIO */}
        <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-lg border text-[9.5px] sm:text-[10px] font-mono font-bold shrink-0 ${
          positionsCount === 0
            ? 'bg-slate-100 text-slate-500 border-slate-200'
            : isPnlProfit
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-xs'
              : 'bg-red-50 text-red-700 border-red-200 shadow-xs'
        }`}>
          <span className="text-[8.5px] text-slate-500">{isEs ? 'PnL' : 'PnL'}:</span>
          <span>{positionsCount === 0 ? '$0.00' : `${isPnlProfit ? '+' : ''}$${unrealizedPnL.toFixed(2)}`}</span>
        </div>

        <div className="terminal-stats-24h items-center gap-4 text-xs font-mono text-slate-600 pl-2">
          <span>24h High: <strong className="text-slate-900">${stats.high24h.toLocaleString()}</strong></span>
          <span>24h Low: <strong className="text-slate-900">${stats.low24h.toLocaleString()}</strong></span>
          <span>24h Vol: <strong className="text-slate-900">{stats.volume24h.toLocaleString()} BTC</strong></span>
        </div>
      </div>

      {/* PARTE DERECHA: STATUS WORKER + USUARIO + HAMBURGUESA (MÓVIL) */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        <div className="terminal-worker-badge items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-mono font-bold border border-emerald-200 shadow-xs">
          <Cpu className="w-3 h-3 text-emerald-600 animate-pulse" />
          <span>Worker 60 FPS</span>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5 bg-[#ede5d6] px-1.5 sm:px-2.5 py-0.5 rounded-xl border border-[#ded5c5]">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span className="text-[10px] sm:text-xs font-bold text-slate-900 truncate max-w-[70px] sm:max-w-[120px]">
            {user?.name || user?.email || 'Demo Trader'}
          </span>
        </div>

        {/* BOTÓN HAMBURGUESA EN MÓVIL (< 1024px) */}
        <button
          type="button"
          onClick={onToggleMobileNav}
          className="terminal-mobile-hamburger p-1 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-[#ede5d6] border border-[#ded5c5] cursor-pointer transition-colors shadow-xs"
          title={isEs ? 'Menú ZYTI Trade' : 'ZYTI Trade Menu'}
        >
          <Menu className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
