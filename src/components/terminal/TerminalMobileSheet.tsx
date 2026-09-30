import React from 'react';
import { BookOpen, Layers, X, Zap } from 'lucide-react';
import { PositionItem } from './types';

interface TerminalMobileSheetProps {
  isEs: boolean;
  activeSheet: 'order' | 'book' | 'positions' | null;
  positions: PositionItem[];
  quickTradeEnabled: boolean;
  lastPrice: number;
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

  return (
    <>
      {/* 1. BOTONES FLOTANTES DE OPERAR CON 1 TOQUE (SI ESTÁ HABILITADO POR EL CHECKBOX) */}
      {quickTradeEnabled && (
        <div 
          className={`lg:hidden fixed ${
            activeSheet ? 'bottom-[52dvh]' : 'bottom-16'
          } left-3 right-3 z-30 flex items-center gap-2.5 animate-zoom-in transition-all duration-300 pointer-events-auto`}
        >
          {/* BOTÓN COMPRA RÁPIDA 1 TOQUE */}
          <button
            type="button"
            onClick={() => onQuickTrade('buy')}
            className="flex-1 py-2 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-xl flex items-center justify-between text-xs font-black cursor-pointer border border-emerald-500/40 transition-all"
          >
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 fill-white" />
              <span>{isEs ? `Comprar ${baseSymbol}` : `Buy ${baseSymbol}`}</span>
            </div>
            <span className="font-mono text-[10px] opacity-90">${lastPrice.toLocaleString()}</span>
          </button>

          {/* BOTÓN VENTA RÁPIDA 1 TOQUE */}
          <button
            type="button"
            onClick={() => onQuickTrade('sell')}
            className="flex-1 py-2 px-3 rounded-2xl bg-red-600 hover:bg-red-700 active:scale-95 text-white shadow-xl flex items-center justify-between text-xs font-black cursor-pointer border border-red-500/40 transition-all"
          >
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 fill-white" />
              <span>{isEs ? `Vender ${baseSymbol}` : `Sell ${baseSymbol}`}</span>
            </div>
            <span className="font-mono text-[10px] opacity-90">${lastPrice.toLocaleString()}</span>
          </button>
        </div>
      )}

      {/* 2. BARRA DE NAVEGACIÓN INFERIOR FIJA (MÓVIL < 1024px) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-14 border-t border-[#ded5c5] bg-white flex items-center justify-around px-2 shadow-2xl select-none">
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
          <div className="relative">
            <Layers className={`w-4 h-4 ${activeSheet === 'positions' ? 'text-amber-600' : 'text-slate-500'}`} />
            {positions.length > 0 && (
              <span className="absolute -top-1 -right-2 px-1 py-0.1 bg-emerald-500 text-white rounded-full text-[8px] font-mono font-bold leading-none">
                {positions.length}
              </span>
            )}
          </div>
          <span>{isEs ? 'Posiciones' : 'Positions'}</span>
        </button>
      </nav>

      {/* 3. HOJA MODAL DESLIZANTE A MITAD DE PANTALLA (50dvh) */}
      {activeSheet && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
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
    </>
  );
};
