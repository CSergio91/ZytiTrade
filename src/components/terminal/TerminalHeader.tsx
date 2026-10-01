import React from 'react';
import { Cpu, Menu } from 'lucide-react';
import { UserSession } from '../../lib/supabase';
import { MarketStats } from '../../workers/marketData.worker';
import { MarketType, AdapterConnectionStatus } from '../../core/market-feed/types';
import { ExchangePairSelector } from './ExchangePairSelector';
import { DemoAccountBalanceSelector } from './DemoAccountBalanceSelector';

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
  currentExchange: string;
  currentMarketType: MarketType;
  connectionStatus: AdapterConnectionStatus;
  onSelectExchange: (exchange: string) => void;
  onSelectMarketType: (marketType: MarketType) => void;
  onSelectPair: (pair: string) => void;
  onSelectBalanceAmount: (amount: number) => void;
  onResetBalance?: () => void;
  onToggleMobileNav: () => void;
  onSelectSection?: (section: 'none' | 'exchange' | string) => void;
  onExit?: () => void;
}

export const TerminalHeader: React.FC<TerminalHeaderProps> = ({
  isEs,
  user,
  selectedPair,
  supportedPairs,
  stats,
  demoBalance,
  unrealizedPnL = 0,
  positionsCount = 0,
  currentExchange,
  currentMarketType,
  connectionStatus,
  onSelectExchange,
  onSelectMarketType,
  onSelectPair,
  onSelectBalanceAmount,
  onResetBalance,
  onToggleMobileNav
}) => {
  const isPnlProfit = unrealizedPnL >= 0;

  return (
    <header className="h-11 sm:h-13 border-b border-[#ded5c5] bg-[#fbf9f4] px-2 sm:px-4 flex items-center justify-between shrink-0 z-50 select-none overflow-visible relative">
      {/* PARTE IZQUIERDA: SELECTOR DE EXCHANGE & PAR + PRECIO + PNL + SALDO CUENTA DEMO */}
      <div className="flex items-center gap-2 sm:gap-3 py-0.5 overflow-visible relative">
        {/* SELECTOR INTERACTIVO DE EXCHANGE (BINANCE, BYBIT, KUCOIN, OKX, ETC) Y PAR CON PRECIO INTEGRADO */}
        <ExchangePairSelector
          currentExchange={currentExchange}
          currentMarketType={currentMarketType}
          selectedPair={selectedPair}
          supportedPairs={supportedPairs}
          connectionStatus={connectionStatus}
          stats={stats}
          isEs={isEs}
          onSelectExchange={onSelectExchange}
          onSelectMarketType={onSelectMarketType}
          onSelectPair={onSelectPair}
        />

        {/* EQUITY TOTAL EN TIEMPO REAL: Saldo base + PnL no realizado de posiciones en vivo */}
        <DemoAccountBalanceSelector
          currentBalance={demoBalance}
          unrealizedPnL={unrealizedPnL}
          isEs={isEs}
          onSelectAmount={onSelectBalanceAmount}
          onResetToCurrent={onResetBalance || (() => {})}
        />

        {/* PNL NO REALIZADO EN ESCRITORIO (OCULTO EN MÓVIL PORQUE SE GESTIONA ABAJO EN POSICIONES) */}
        <div className={`hidden md:flex items-center gap-1 px-1.5 py-0.5 rounded-lg border text-[9.5px] sm:text-[10px] font-mono font-bold shrink-0 ${
          positionsCount === 0
            ? 'bg-slate-100 text-slate-500 border-slate-200'
            : isPnlProfit
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-xs'
              : 'bg-red-50 text-red-700 border-red-200 shadow-xs'
        }`}>
          <span className="text-[8.5px] text-slate-500">{isEs ? 'PnL' : 'PnL'}:</span>
          <span>{positionsCount === 0 ? '$0.00' : `${isPnlProfit ? '+' : ''}$${unrealizedPnL.toFixed(2)}`}</span>
        </div>
      </div>

      {/* PARTE DERECHA: USUARIO + HAMBURGUESA (MÓVIL) */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
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
