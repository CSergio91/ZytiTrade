import React from 'react';
import { BookOpen, Layers, X, Zap } from 'lucide-react';
import { PositionItem } from './types';

interface TerminalMobileSheetProps {
  isEs: boolean;
  activeSheet: 'order' | 'book' | 'positions' | null;
  positions: PositionItem[];
  quickTradeEnabled: boolean;
  lastPrice: number;
  bestBid: number;
  bestAsk: number;
  selectedPair: string;
  onQuickTrade: (side: 'buy' | 'sell') => void;
  setActiveSheet: (sheet: 'order' | 'book' | 'positions' | null) => void;
  renderOrderForm: () => React.ReactNode;
  renderOrderBook: () => React.ReactNode;
  onClosePosition: (id: number) => void;
}

export const TerminalMobileSheet: React.FC<TerminalMobileSheetProps> = ({
  isEs,
  activeSheet,
  positions,
  quickTradeEnabled,
  lastPrice,
  bestBid,
  bestAsk,
  selectedPair,
  onQuickTrade,
  setActiveSheet,
  renderOrderForm,
  renderOrderBook,
  onClosePosition
}) => {
  const toggleSheet = (tab: 'order' | 'book' | 'positions') => {
    setActiveSheet(activeSheet === tab ? null : tab);
  };

  const baseSymbol = selectedPair.split('/')[0];

  const totalPnL = positions.reduce((acc, p) => acc + (p.pnlUsdt ?? 0), 0);
  const isPnlProfit = totalPnL >= 0;

  return (
    <div className="terminal-mobile-only lg:hidden">
      {/* 1. BOTONES FLOTANTES DE OPERAR CON 1 TOQUE (EXCLUSIVO MÓVIL < 1024px) */}
      {quickTradeEnabled && (
        <div 
          className={`lg:hidden terminal-mobile-only terminal-floating-quicktrade fixed ${
            activeSheet ? 'bottom-[51dvh]' : 'bottom-15'
          } left-2 right-2 z-30 flex items-center gap-2 animate-zoom-in transition-all duration-300 pointer-events-auto`}
        >
          {/* BOTÓN COMPRA RÁPIDA 1 TOQUE (AL ASK) */}
          <button
            type="button"
            onClick={() => onQuickTrade('buy')}
            className="flex-1 py-1 px-2 rounded-xl bg-emerald-600/95 hover:bg-emerald-700 active:scale-95 text-white shadow-lg flex flex-col items-center justify-center cursor-pointer border border-emerald-400/30 transition-all"
          >
            <div className="flex items-center gap-1 leading-tight">
              <Zap className="w-3 h-3 fill-white text-white shrink-0" />
              <span className="text-[11px] font-black uppercase tracking-tight">
                {isEs ? `Comprar ${baseSymbol}` : `Buy ${baseSymbol}`}
              </span>
            </div>
            <div className="flex items-center gap-1 font-mono text-[9.5px] leading-tight text-emerald-100 mt-0.5">
              <span>${bestAsk.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span className="opacity-80 text-[8px] uppercase font-bold">Ask</span>
            </div>
          </button>

          {/* BOTÓN VENTA RÁPIDA 1 TOQUE (AL BID) */}
          <button
            type="button"
            onClick={() => onQuickTrade('sell')}
            className="flex-1 py-1 px-2 rounded-xl bg-red-600/95 hover:bg-red-700 active:scale-95 text-white shadow-lg flex flex-col items-center justify-center cursor-pointer border border-red-400/30 transition-all"
          >
            <div className="flex items-center gap-1 leading-tight">
              <Zap className="w-3 h-3 fill-white text-white shrink-0" />
              <span className="text-[11px] font-black uppercase tracking-tight">
                {isEs ? `Vender ${baseSymbol}` : `Sell ${baseSymbol}`}
              </span>
            </div>
            <div className="flex items-center gap-1 font-mono text-[9.5px] leading-tight text-red-100 mt-0.5">
              <span>${bestBid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span className="opacity-80 text-[8px] uppercase font-bold">Bid</span>
            </div>
          </button>
        </div>
      )}

      {/* 2. BARRA DE NAVEGACIÓN INFERIOR FIJA (MÓVIL < 1024px) */}
      <nav className="lg:hidden terminal-mobile-only terminal-mobile-bottom-nav fixed bottom-0 left-0 right-0 z-40 h-14 border-t border-[#ded5c5] bg-white flex items-center justify-around px-2 shadow-2xl select-none">
        {/* BOTÓN OPERAR */}
        <button
          type="button"
          onClick={() => toggleSheet('order')}
          className={`flex-1 py-1.5 flex flex-col items-center justify-center gap-0.5 text-[11px] font-bold transition-all rounded-xl cursor-pointer ${
            activeSheet === 'order'
              ? 'bg-amber-100/70 text-amber-950 font-black shadow-xs'
              : 'text-slate-600 hover:text-slate-950'
          }`}
        >
          <Zap className={`w-4 h-4 ${activeSheet === 'order' ? 'text-amber-600' : 'text-slate-500'}`} />
          <span>{isEs ? 'Operar' : 'Trade'}</span>
        </button>

        <div className="h-6 w-px bg-slate-200" />

        {/* BOTÓN ORDER BOOK */}
        <button
          type="button"
          onClick={() => toggleSheet('book')}
          className={`flex-1 py-1.5 flex flex-col items-center justify-center gap-0.5 text-[11px] font-bold transition-all rounded-xl cursor-pointer ${
            activeSheet === 'book'
              ? 'bg-amber-100/70 text-amber-950 font-black shadow-xs'
              : 'text-slate-600 hover:text-slate-950'
          }`}
        >
          <BookOpen className={`w-4 h-4 ${activeSheet === 'book' ? 'text-amber-600' : 'text-slate-500'}`} />
          <span>Order Book</span>
        </button>

        <div className="h-6 w-px bg-slate-200" />

        {/* BOTÓN POSICIONES */}
        <button
          type="button"
          onClick={() => toggleSheet('positions')}
          className={`flex-1 py-1.5 flex flex-col items-center justify-center gap-0.5 text-[11px] font-bold transition-all rounded-xl cursor-pointer relative ${
            activeSheet === 'positions'
              ? 'bg-amber-100/70 text-amber-950 font-black shadow-xs'
              : 'text-slate-600 hover:text-slate-950'
          }`}
        >
          <div className="relative flex items-center">
            <Layers className={`w-4 h-4 ${activeSheet === 'positions' ? 'text-amber-600' : 'text-slate-500'}`} />
            {positions.length > 0 && (
              <span className={`ml-1 px-1 py-0.2 rounded-full text-[8px] font-mono font-bold leading-none ${
                isPnlProfit ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
              }`}>
                {positions.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-[10px]">
            <span>{isEs ? 'Posiciones' : 'Positions'}</span>
            {positions.length > 0 && (
              <span className={`text-[9px] font-mono font-bold ${isPnlProfit ? 'text-emerald-600' : 'text-red-600'}`}>
                {isPnlProfit ? '+' : ''}${totalPnL.toFixed(1)}
              </span>
            )}
          </div>
        </button>
      </nav>

      {/* 3. HOJA MODAL DESLIZANTE A MITAD DE PANTALLA (50dvh) */}
      {activeSheet && (
        <div className="lg:hidden terminal-mobile-only terminal-mobile-sheet fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop sobre el 50% superior del gráfico que permite cerrarlo tocando */}
          <div 
            className="flex-1 bg-black/40 backdrop-blur-[1px] transition-opacity"
            onClick={() => setActiveSheet(null)}
          />

          {/* Panel inferior que ocupa la mitad de la pantalla */}
          <div className="h-[50dvh] max-h-[500px] bg-[#fbf9f4] border-t border-[#ded5c5] rounded-t-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-up-sheet">
            {/* Header del sheet con barra de arrastre y botón cerrar */}
            <div className="px-4 py-2 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-4 bg-amber-500 rounded-full" />
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                  {activeSheet === 'order' && (isEs ? 'Terminal de Órdenes' : 'Order Execution')}
                  {activeSheet === 'book' && 'Order Book L2'}
                  {activeSheet === 'positions' && (isEs ? `Posiciones Abiertas (${positions.length})` : `Open Positions (${positions.length})`)}
                </h4>
              </div>

              {activeSheet === 'positions' && positions.length > 0 && (
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                  isPnlProfit ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                  PnL: {isPnlProfit ? '+' : ''}${totalPnL.toFixed(2)} USDT
                </span>
              )}

              <button
                type="button"
                onClick={() => setActiveSheet(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                title={isEs ? 'Cerrar panel' : 'Close panel'}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Contenido scrolleable de la hoja */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-3 pb-8">
              {activeSheet === 'order' && renderOrderForm()}
              {activeSheet === 'book' && renderOrderBook()}
              {activeSheet === 'positions' && (
                <div className="space-y-2">
                  {positions.map((pos) => (
                    <div key={pos.id} className="p-2.5 rounded-xl bg-white border border-[#ded5c5] shadow-xs flex items-center justify-between font-mono text-xs">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-slate-900">{pos.symbol}</span>
                          <span className={`px-1 py-0.2 rounded text-[9px] font-bold ${
                            pos.side === 'LONG' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {pos.side}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Entrada: ${pos.entry.toLocaleString()} • Tam: {pos.size}
                        </div>
                        {(pos.slPrice || pos.tpPrice) && (
                          <div className="text-[9.5px] mt-0.5 text-slate-500">
                            {pos.slPrice && <span className="text-red-600 font-semibold">SL: ${pos.slPrice.toLocaleString()} </span>}
                            {pos.tpPrice && <span className="text-emerald-600 font-semibold">• TP: ${pos.tpPrice.toLocaleString()}</span>}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${pos.isProfit ? 'text-emerald-600' : 'text-red-600'}`}>
                          {pos.pnl} ({pos.pnlPercent})
                        </div>
                        <button
                          type="button"
                          onClick={() => onClosePosition(pos.id)}
                          className="text-[10px] text-red-600 font-bold hover:underline cursor-pointer mt-0.5"
                        >
                          {isEs ? 'Cerrar' : 'Close'}
                        </button>
                      </div>
                    </div>
                  ))}
                  {positions.length === 0 && (
                    <div className="text-center py-8 text-xs text-slate-400">
                      {isEs ? 'No hay posiciones abiertas' : 'No open positions'}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
