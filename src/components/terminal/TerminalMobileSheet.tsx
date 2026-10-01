import React, { useState } from 'react';
import { BookOpen, Layers, X, Zap, History, Shield, Clock, User, LogOut } from 'lucide-react';
import { PositionItem, ClosedTradeItem, LimitOrderItem } from './types';
import { UserSession } from '../../lib/supabase';

interface TerminalMobileSheetProps {
  isEs: boolean;
  activeSheet: 'order' | 'book' | 'positions' | 'history' | 'profile' | null;
  positions: PositionItem[];
  limitOrders?: LimitOrderItem[];
  history: ClosedTradeItem[];
  demoBalance: number;
  riskPercent: number;
  onSetRiskPercent: (risk: number) => void;
  quickTradeEnabled: boolean;
  lastPrice: number;
  bestBid: number;
  bestAsk: number;
  selectedPair: string;
  user?: UserSession | null;
  onExit?: () => void;
  onQuickTrade: (side: 'buy' | 'sell') => void;
  setActiveSheet: (sheet: 'order' | 'book' | 'positions' | 'history' | 'profile' | null) => void;
  renderOrderForm: () => React.ReactNode;
  renderOrderBook: () => React.ReactNode;
  onClosePosition: (id: string) => void;
  onCloseAllPositions?: () => void;
  onCancelLimitOrder?: (id: string) => void;
  onCancelAllLimitOrders?: () => void;
  onSetBreakEven?: (pos: PositionItem) => void;
  onSelectPosition?: (pos: PositionItem) => void;
  onSelectLimitOrder?: (order: LimitOrderItem) => void;
}

export const TerminalMobileSheet: React.FC<TerminalMobileSheetProps> = ({
  isEs,
  activeSheet,
  positions,
  limitOrders = [],
  history,
  demoBalance,
  riskPercent,
  onSetRiskPercent,
  quickTradeEnabled,
  lastPrice,
  bestBid,
  bestAsk,
  selectedPair,
  user,
  onExit,
  onQuickTrade,
  setActiveSheet,
  renderOrderForm,
  renderOrderBook,
  onClosePosition,
  onCloseAllPositions,
  onCancelLimitOrder,
  onCancelAllLimitOrders,
  onSetBreakEven,
  onSelectPosition,
  onSelectLimitOrder
}) => {
  const [positionsSubTab, setPositionsSubTab] = useState<'positions' | 'limits'>('positions');
  const toggleSheet = (tab: 'order' | 'book' | 'positions' | 'history' | 'profile') => {
    setActiveSheet(activeSheet === tab ? null : tab);
  };

  const baseSymbol = selectedPair.split('/')[0];

  const totalPnL = positions.reduce((acc, p) => acc + (p.pnlUsdt ?? 0), 0);
  const isPnlProfit = totalPnL >= 0;
  const equity = demoBalance + totalPnL;

  const currentRiskAmountUsd = (demoBalance * riskPercent) / 100;

  return (
    <div className="terminal-mobile-only lg:hidden">
      {/* 1. BOTONES FLOTANTES DE OPERAR CON 1 TOQUE (EXCLUSIVO MÓVIL < 1024px) */}
      {quickTradeEnabled && (
        <div 
          className={`lg:hidden terminal-mobile-only terminal-floating-quicktrade fixed ${
            activeSheet ? 'bottom-[51dvh]' : 'bottom-15'
          } left-2 right-2 z-30 flex flex-col gap-1.5 animate-zoom-in transition-all duration-300 pointer-events-auto`}
        >
          {/* BARRA SUPERIOR PEGADA: CONTROL RÁPIDO DEL RIESGO (%) */}
          <div className="flex items-center justify-between px-2.5 py-1 rounded-xl bg-white/95 backdrop-blur-md border border-[#ded5c5] shadow-md font-sans text-xs">
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="text-[10px] font-black uppercase text-slate-700 tracking-tight">
                {isEs ? 'Riesgo' : 'Risk'}:
              </span>
              <span className="text-[10.5px] font-mono font-black text-amber-800 bg-amber-100/80 px-1.5 py-0.2 rounded border border-amber-200">
                {riskPercent}% (${currentRiskAmountUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })} USDT)
              </span>
            </div>

            {/* SELECTOR RÁPIDO DE PORCENTAJES DE RIESGO */}
            <div className="flex items-center gap-1">
              {[0.5, 1, 2, 3, 5].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => onSetRiskPercent(r)}
                  className={`px-1.5 py-0.5 rounded-lg text-[9.5px] font-mono font-bold transition-all cursor-pointer ${
                    riskPercent === r
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {r}%
                </button>
              ))}
            </div>
          </div>

          {/* BOTONES FLOTANTES COMPRAR Y VENDER */}
          <div className="flex items-center gap-2">
            {/* BOTÓN COMPRA RÁPIDA 1 TOQUE (AL ASK) */}
            <button
              type="button"
              onClick={() => onQuickTrade('buy')}
              className="flex-1 py-1.5 px-2 rounded-xl bg-emerald-600/95 hover:bg-emerald-700 active:scale-95 text-white shadow-lg flex flex-col items-center justify-center cursor-pointer border border-emerald-400/30 transition-all"
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
              className="flex-1 py-1.5 px-2 rounded-xl bg-red-600/95 hover:bg-red-700 active:scale-95 text-white shadow-lg flex flex-col items-center justify-center cursor-pointer border border-red-400/30 transition-all"
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
                {isPnlProfit ? '+' : ''}${totalPnL.toFixed(2)}
              </span>
            )}
          </div>
        </button>

        <div className="h-6 w-px bg-slate-200" />

        {/* BOTÓN HISTORIAL (POSICIONES CERRADAS) */}
        <button
          type="button"
          onClick={() => toggleSheet('history')}
          className={`flex-1 py-1.5 flex flex-col items-center justify-center gap-0.5 text-[11px] font-bold transition-all rounded-xl cursor-pointer relative ${
            activeSheet === 'history'
              ? 'bg-amber-100/70 text-amber-950 font-black shadow-xs'
              : 'text-slate-600 hover:text-slate-950'
          }`}
        >
          <div className="relative flex items-center">
            <History className={`w-4 h-4 ${activeSheet === 'history' ? 'text-amber-600' : 'text-slate-500'}`} />
            {history.length > 0 && (
              <span className="ml-1 px-1 py-0.2 rounded-full text-[8px] font-mono font-bold leading-none bg-slate-500 text-white">
                {history.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-[10px]">
            <span>{isEs ? 'Historial' : 'History'}</span>
          </div>
        </button>

        <div className="h-6 w-px bg-slate-200" />

        {/* BOTÓN PERFIL (EXCLUSIVO MÓVIL) */}
        <button
          type="button"
          onClick={() => toggleSheet('profile')}
          className={`flex-1 py-1.5 flex flex-col items-center justify-center gap-0.5 text-[11px] font-bold transition-all rounded-xl cursor-pointer ${
            activeSheet === 'profile'
              ? 'bg-amber-100/70 text-amber-950 font-black shadow-xs'
              : 'text-slate-600 hover:text-slate-950'
          }`}
        >
          <div className="relative flex items-center justify-center">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="User" className="w-4 h-4 rounded-full object-cover border border-amber-400" />
            ) : user?.provider === 'telegram' ? (
              <svg className="w-4 h-4 fill-[#229ED9]" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/></svg>
            ) : (
              <User className={`w-4 h-4 ${activeSheet === 'profile' ? 'text-amber-600' : 'text-slate-500'}`} />
            )}
          </div>
          <div className="flex items-center gap-1 text-[10px]">
            <span className="truncate max-w-[50px]">{isEs ? 'Perfil' : 'Profile'}</span>
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
          <div className="h-[50dvh] max-h-[520px] bg-[#fbf9f4] border-t border-[#ded5c5] rounded-t-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-up-sheet">
            {/* Header del sheet con barra de arrastre y botón cerrar */}
            <div className="px-4 py-2 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-4 bg-amber-500 rounded-full" />
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                  {activeSheet === 'order' && (isEs ? 'Terminal de Órdenes' : 'Order Execution')}
                  {activeSheet === 'book' && 'Order Book L2'}
                  {activeSheet === 'positions' && (
                    positionsSubTab === 'positions'
                      ? (isEs ? `Posiciones Abiertas (${positions.length})` : `Open Positions (${positions.length})`)
                      : (isEs ? `Órdenes Límites (${limitOrders.length})` : `Limit Orders (${limitOrders.length})`)
                  )}
                  {activeSheet === 'history' && (isEs ? `Historial de Posiciones (${history.length})` : `Trade History (${history.length})`)}
                  {activeSheet === 'profile' && (isEs ? 'Perfil de Usuario' : 'User Profile')}
                </h4>
              </div>

              {activeSheet === 'positions' && (
                <div className="flex items-center gap-2">
                  {positionsSubTab === 'positions' && positions.length > 0 && (
                    <>
                      <button
                        type="button"
                        onClick={onCloseAllPositions}
                        className="px-2 py-0.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-[10px] font-bold cursor-pointer transition-colors active:scale-95"
                        title={isEs ? 'Cerrar todas las operaciones' : 'Close all positions'}
                      >
                        {isEs ? 'Cerrar Todo' : 'Close All'}
                      </button>
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                        isPnlProfit ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {isPnlProfit ? '+' : ''}${totalPnL.toFixed(2)}
                      </span>
                    </>
                  )}
                  {positionsSubTab === 'limits' && limitOrders.length > 0 && (
                    <button
                      type="button"
                      onClick={onCancelAllLimitOrders}
                      className="px-2 py-0.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-[10px] font-bold cursor-pointer transition-colors active:scale-95"
                      title={isEs ? 'Cancelar todas las órdenes límite' : 'Cancel all limit orders'}
                    >
                      {isEs ? 'Cancelar Todo' : 'Cancel All'}
                    </button>
                  )}
                </div>
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
              
              {/* VISTA 1: POSICIONES ABIERTAS CON BALANCE ARRIBA Y SEPARACIÓN */}
              {activeSheet === 'positions' && (
                <div className="space-y-3">
                  {/* CARD DE BALANCE DE LA CUENTA */}
                  <div className="p-2.5 rounded-2xl bg-white border border-[#ded5c5] shadow-xs">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                      <span className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider">
                        {isEs ? 'Balance de la Cuenta' : 'Account Balance'}
                      </span>
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                        isPnlProfit
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        PnL Flotante: {isPnlProfit ? '+' : ''}${totalPnL.toFixed(2)} USDT
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1.5 text-xs font-mono">
                      <div>
                        <div className="text-[9px] text-slate-400 uppercase font-semibold">{isEs ? 'Saldo Base' : 'Balance'}:</div>
                        <div className="font-black text-slate-900 text-sm">
                          ${demoBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-400 uppercase font-semibold">Equity Total:</div>
                        <div className={`font-black text-sm ${equity >= demoBalance ? 'text-emerald-700' : 'text-red-700'}`}>
                          ${equity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SELECTOR SUB-PESTAÑAS: POSICIONES VS LÍMITES */}
                  <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-200/80 font-mono text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setPositionsSubTab('positions')}
                      className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        positionsSubTab === 'positions'
                          ? 'bg-white text-slate-900 shadow-xs font-black'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>{isEs ? 'Posiciones' : 'Positions'} ({positions.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPositionsSubTab('limits')}
                      className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        positionsSubTab === 'limits'
                          ? 'bg-white text-slate-900 shadow-xs font-black'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>{isEs ? 'Límites' : 'Limits'} ({limitOrders.length})</span>
                    </button>
                  </div>

                  {/* SEPARACIÓN VISUAL ENTRE BALANCE Y LISTA */}
                  <div className="flex items-center gap-2 px-1">
                    <span className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider">
                      {positionsSubTab === 'positions'
                        ? (isEs ? 'Posiciones en Vivo' : 'Live Positions')
                        : (isEs ? 'Órdenes Límites Pendientes' : 'Pending Limit Orders')}
                    </span>
                    <div className="flex-1 h-px bg-slate-200" />
                  </div>

                  {/* LISTA SEGÚN LA SUB-PESTAÑA SELECCIONADA */}
                  {positionsSubTab === 'limits' ? (
                    <div className="space-y-2">
                      {limitOrders.map((ord) => {
                        const isBuy = ord.side === 'buy';
                        return (
                          <div
                            key={ord.id}
                            onClick={() => onSelectLimitOrder ? onSelectLimitOrder(ord) : onSelectPosition?.({ symbol: ord.symbol, exchange: ord.exchange, marketType: ord.marketType } as any)}
                            className="p-2.5 rounded-xl bg-white border border-[#ded5c5] shadow-xs flex items-center justify-between font-mono text-xs cursor-pointer active:bg-amber-50/70 transition-colors"
                          >
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-black text-slate-900">{ord.symbol}</span>
                                {ord.exchange && (
                                  <span className="text-[8px] uppercase font-mono font-bold px-1 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                    {ord.exchange}
                                  </span>
                                )}
                                <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                                  isBuy ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {isBuy ? 'BUY LIMIT' : 'SELL LIMIT'}
                                </span>
                                <span className="text-[9px] text-slate-500 font-semibold">{ord.leverage}x</span>
                              </div>
                              <div className="text-[10px] text-slate-700 font-bold mt-0.5">
                                Precio Límite: <span className="text-amber-700">${ord.limitPrice.toLocaleString()}</span>
                              </div>
                              <div className="text-[9px] text-slate-500 mt-0.5">
                                Tamaño: {ord.size} • Margen: ${ord.collateralUsdt.toFixed(1)}
                              </div>
                              {(ord.slPrice || ord.tpPrice) && (
                                <div className="text-[9px] text-slate-500 mt-0.5">
                                  {ord.slPrice && <span className="text-red-600 font-semibold">SL: ${ord.slPrice.toLocaleString()} </span>}
                                  {ord.tpPrice && <span className="text-emerald-600 font-semibold">• TP: ${ord.tpPrice.toLocaleString()}</span>}
                                </div>
                              )}
                            </div>
                            <div className="text-right flex flex-col items-end gap-1">
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                PENDIENTE
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onCancelLimitOrder?.(ord.id);
                                }}
                                className="px-2 py-0.5 rounded bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-bold border border-red-200 cursor-pointer active:scale-95"
                              >
                                {isEs ? 'Cancelar' : 'Cancel'}
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {limitOrders.length === 0 && (
                        <div className="text-center py-6 text-xs text-slate-400">
                          {isEs ? 'No tienes órdenes límites pendientes' : 'No pending limit orders'}
                        </div>
                      )}
                    </div>
                  ) : (
                  <div className="space-y-2">
                    {positions.map((pos) => (
                      <div
                        key={pos.id}
                        onClick={() => onSelectPosition?.(pos)}
                        className="p-2.5 rounded-xl bg-white border border-[#ded5c5] shadow-xs flex items-center justify-between font-mono text-xs cursor-pointer active:bg-amber-50/70 transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-black text-slate-900">{pos.symbol}</span>
                            {pos.exchange && (
                              <span className="text-[8px] uppercase font-mono font-bold px-1 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                {pos.exchange}
                              </span>
                            )}
                            <span className={`px-1 py-0.2 rounded text-[9px] font-bold ${
                              pos.side === 'LONG' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {pos.side}
                            </span>
                            <span className="text-[9px] text-slate-500 font-semibold">{pos.leverage}x</span>
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            Entrada: ${pos.entry.toLocaleString()} • Marca: ${pos.mark.toLocaleString()}
                          </div>
                          {(pos.slPrice || pos.tpPrice) && (
                            <div className="text-[9.5px] mt-0.5 text-slate-500">
                              {pos.slPrice && <span className="text-red-600 font-semibold">SL: ${pos.slPrice.toLocaleString()} </span>}
                              {pos.tpPrice && <span className="text-emerald-600 font-semibold">• TP: ${pos.tpPrice.toLocaleString()}</span>}
                            </div>
                          )}
                        </div>
                        <div className="text-right flex flex-col items-end gap-1">
                          <div className={`font-black ${pos.isProfit ? 'text-emerald-600' : 'text-red-600'}`}>
                            {pos.pnl} ({pos.pnlPercent})
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onSetBreakEven?.(pos);
                              }}
                              className={`px-2 py-0.5 rounded text-[9px] font-black cursor-pointer transition-all ${
                                pos.slPrice && Math.abs(pos.slPrice - pos.entry) < 0.05
                                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                                  : pos.isProfit
                                  ? 'bg-blue-600 active:bg-blue-500 text-white'
                                  : 'bg-slate-100 text-slate-500 border border-slate-300 active:scale-95'
                              }`}
                              title={
                                pos.slPrice && Math.abs(pos.slPrice - pos.entry) < 0.05
                                  ? (isEs ? 'Ya en Break-Even' : 'Already at Break-Even')
                                  : pos.isProfit
                                  ? (isEs ? 'Fijar SL a Break-Even' : 'Set SL to Break-Even')
                                  : (isEs ? 'Posición en pérdida' : 'Position in loss')
                              }
                            >
                              BE
                            </button>
                            <button
                              type="button"
                              onClick={() => onClosePosition(pos.id)}
                              className="text-[10px] text-red-600 font-bold hover:underline cursor-pointer"
                            >
                              {isEs ? 'Cerrar' : 'Close'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {positions.length === 0 && (
                      <div className="text-center py-6 text-xs text-slate-400">
                        {isEs ? 'No hay posiciones abiertas en este momento' : 'No open positions right now'}
                      </div>
                    )}
                  </div>
                  )}
                </div>
              )}

              {/* VISTA 2: HISTORIAL DE POSICIONES CERRADAS */}
              {activeSheet === 'history' && (
                <div className="space-y-2">
                  {history.map((item) => (
                    <div key={item.id} className="p-2.5 rounded-xl bg-white border border-[#ded5c5] shadow-xs flex items-center justify-between font-mono text-xs">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-slate-900">{item.symbol}</span>
                          <span className={`px-1 py-0.2 rounded text-[9px] font-bold ${
                            item.side === 'LONG' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {item.side}
                          </span>
                          {item.closeReason && (
                            <span className={`px-1 py-0.2 rounded text-[8.5px] font-bold ${
                              item.closeReason === 'TP'
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.closeReason === 'SL'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-slate-100 text-slate-600'
                            }`}>
                              {item.closeReason}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Entrada: ${item.entry.toLocaleString()} • Salida: ${item.exitPrice.toLocaleString()}
                        </div>
                        <div className="text-[9px] text-slate-400 mt-0.5">
                          {item.closedAt}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className={`font-black ${item.isProfit ? 'text-emerald-600' : 'text-red-600'}`}>
                          {item.isProfit ? '+' : ''}${item.pnlUsdt.toFixed(2)} USDT
                        </div>
                        <div className={`text-[10px] font-bold ${item.isProfit ? 'text-emerald-600' : 'text-red-600'}`}>
                          ({item.pnlPercent})
                        </div>
                      </div>
                    </div>
                  ))}

                  {history.length === 0 && (
                    <div className="text-center py-8 text-xs text-slate-400">
                      {isEs ? 'No hay operaciones cerradas en el historial' : 'No closed trades in history yet'}
                    </div>
                  )}
                </div>
              )}

              {/* CASO 5: PERFIL DEL USUARIO (EXCLUSIVO MÓVIL) */}
              {activeSheet === 'profile' && (
                <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-between">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-amber-500/10 border border-amber-300/80">
                      {user?.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.name || 'User'} className="w-12 h-12 rounded-full object-cover shrink-0 border-2 border-amber-400" />
                      ) : user?.provider === 'telegram' ? (
                        <div className="w-12 h-12 rounded-full bg-[#229ED9] flex items-center justify-center shrink-0 shadow-sm">
                          <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/></svg>
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-amber-500 text-amber-950 font-black text-lg flex items-center justify-center shrink-0">
                          {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'T'}
                        </div>
                      )}
                      <div className="flex flex-col text-left leading-tight min-w-0">
                        <span className="text-sm font-black text-slate-900 truncate">
                          {user?.name || user?.email?.split('@')[0] || (isEs ? 'Trader ZYTI' : 'ZYTI Trader')}
                        </span>
                        <span className="text-xs text-slate-500 truncate mt-0.5">
                          {user?.email || (user?.telegramUsername ? `@${user.telegramUsername}` : '')}
                        </span>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-900 border border-amber-300">
                            {user?.role === 'admin' ? 'Admin' : (isEs ? 'Cuenta Demo $10,000' : 'Demo Account $10,000')}
                          </span>
                          {user?.provider === 'telegram' && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#229ED9]/15 text-[#1b8bc2] border border-[#229ED9]/30">
                              Telegram
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-white border border-[#ded5c5] flex flex-col gap-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">{isEs ? 'Saldo de la cuenta' : 'Account Balance'}:</span>
                        <span className="font-mono font-bold text-slate-900">${demoBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">{isEs ? 'Equidad flotante' : 'Floating Equity'}:</span>
                        <span className={`font-mono font-bold ${isPnlProfit ? 'text-emerald-600' : 'text-red-600'}`}>${equity.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">{isEs ? 'Posiciones abiertas' : 'Open Positions'}:</span>
                        <span className="font-mono font-bold text-slate-900">{positions.length}</span>
                      </div>
                    </div>
                  </div>

                  {onExit && (
                    <button
                      type="button"
                      onClick={onExit}
                      className="w-full mt-4 py-2.5 px-4 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer active:scale-98"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{isEs ? 'Cerrar Sesión' : 'Log Out'}</span>
                    </button>
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
