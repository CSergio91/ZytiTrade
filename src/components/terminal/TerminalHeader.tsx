import React from 'react';
import { Cpu, Menu } from 'lucide-react';
import { UserSession, PropFirmAccount } from '../../lib/supabase';
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
  activeAccountId?: string;
  onSelectExchange: (exchange: string) => void;
  onSelectMarketType: (marketType: MarketType) => void;
  onSelectPair: (pair: string) => void;
  onSelectBalanceAmount: (amount: number) => void;
  onSelectAccount?: (account: PropFirmAccount | null) => void;
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
  activeAccountId,
  onSelectExchange,
  onSelectMarketType,
  onSelectPair,
  onSelectBalanceAmount,
  onSelectAccount,
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
          accounts={user?.accounts || []}
          activeAccountId={activeAccountId}
          onSelectAmount={onSelectBalanceAmount}
          onSelectAccount={onSelectAccount}
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
          {user?.provider === 'telegram' ? (
            <svg className="w-3.5 h-3.5 fill-[#229ED9] shrink-0" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
            </svg>
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          )}
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
