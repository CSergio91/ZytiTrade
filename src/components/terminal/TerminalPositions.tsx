import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Layers, History, CheckCircle2, AlertTriangle, Clock, Edit3, X } from 'lucide-react';
import { PositionItem, ClosedTradeItem, LimitOrderItem } from './types';

interface TerminalPositionsProps {
  isEs: boolean;
  positions: PositionItem[];
  limitOrders?: LimitOrderItem[];
  history?: ClosedTradeItem[];
  demoBalance?: number;
  onClosePosition: (id: string) => void;
  onCloseAllPositions?: () => void;
  onCancelLimitOrder?: (id: string) => void;
  onCancelAllLimitOrders?: () => void;
  onSetBreakEven?: (pos: PositionItem) => void;
  onSelectPosition?: (pos: PositionItem) => void;
  onSelectLimitOrder?: (order: LimitOrderItem) => void;
  onUpdateLimitOrder?: (id: string, newLimitPrice?: number, newSlPrice?: number | null, newTpPrice?: number | null) => void;
}

export const TerminalPositions: React.FC<TerminalPositionsProps> = ({
  isEs,
  positions,
  limitOrders = [],
  history = [],
  demoBalance = 10000,
  onClosePosition,
  onCloseAllPositions,
  onCancelLimitOrder,
  onCancelAllLimitOrders,
  onSetBreakEven,
  onSelectPosition,
  onSelectLimitOrder,
  onUpdateLimitOrder
}) => {
  // Pestaña activa: 'positions' | 'limits' | 'history'
  const [activeTab, setActiveTab] = useState<'positions' | 'limits' | 'history'>('positions');

  // Estado para modal de modificación de orden límite
  const [editingOrder, setEditingOrder] = useState<LimitOrderItem | null>(null);
  const [editLimitPrice, setEditLimitPrice] = useState<string>('');
  const [editSlPrice, setEditSlPrice] = useState<string>('');
  const [editTpPrice, setEditTpPrice] = useState<string>('');

  const startEditingOrder = (ord: LimitOrderItem) => {
    setEditingOrder(ord);
    setEditLimitPrice(ord.limitPrice.toString());
    setEditSlPrice(ord.slPrice != null ? ord.slPrice.toString() : '');
    setEditTpPrice(ord.tpPrice != null ? ord.tpPrice.toString() : '');
  };

  const handleSaveOrderEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder || !onUpdateLimitOrder) return;
    const newLimit = parseFloat(editLimitPrice);
    if (!newLimit || isNaN(newLimit) || newLimit <= 0) return;
    const newSl = editSlPrice.trim() !== '' ? parseFloat(editSlPrice) : null;
    const newTp = editTpPrice.trim() !== '' ? parseFloat(editTpPrice) : null;
    onUpdateLimitOrder(editingOrder.id, newLimit, newSl, newTp);
    setEditingOrder(null);
  };

  // Altura personalizable del panel con persistencia en localStorage
  const [panelHeight, setPanelHeight] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('zyti_positions_height');
      return saved !== null ? Math.max(90, Math.min(650, Number(saved))) : 200;
    } catch {
      return 200;
    }
  });

  const [isResizing, setIsResizing] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Estado desplegable del panel en escritorio
  const [isExpanded, setIsExpanded] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('zyti_positions_expanded');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const toggleExpanded = () => {
    setIsAnimating(true);
    setIsExpanded((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('zyti_positions_expanded', JSON.stringify(next));
      } catch {}
      return next;
    });
    setTimeout(() => setIsAnimating(false), 220);
  };

  // Arrastre fluido para redimensionar la altura del panel inferior
  const handleMouseDownResize = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    const startY = e.clientY;
    const startHeight = isExpanded ? panelHeight : 34;

    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'row-resize';

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = startY - moveEvent.clientY; // Arrastrar hacia arriba aumenta altura
      const maxHeight = Math.min(window.innerHeight * 0.75, 650);
      const nextH = Math.max(90, Math.min(maxHeight, startHeight + deltaY));
      if (!isExpanded && nextH > 50) {
        setIsExpanded(true);
      }
      setPanelHeight(nextH);
    };

    const onMouseUp = () => {
      setIsResizing(false);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      setPanelHeight((finalH) => {
        try {
          localStorage.setItem('zyti_positions_height', finalH.toString());
        } catch {}
        return finalH;
      });
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Cálculo real dinámico de PnL no realizado
  const totalPnL = positions.reduce((acc, p) => acc + (p.pnlUsdt ?? 0), 0);
  const isProfit = totalPnL >= 0;
  const equity = demoBalance + totalPnL;

  return (
    <div 
      style={{ height: isExpanded ? `${panelHeight}px` : undefined }}
      className={`terminal-desktop-positions bg-white relative ${isExpanded ? 'is-expanded' : 'is-collapsed'} ${isAnimating ? 'is-animating' : ''}`}
    >
      {/* 1. CONTROL DE ARRASTRE SUPERIOR (SPLITTER RESIZER) */}
      <div
        onMouseDown={handleMouseDownResize}
        className="h-2 w-full cursor-row-resize absolute -top-1 left-0 right-0 z-50 group flex items-center justify-center touch-none select-none hover:bg-amber-400/30 active:bg-amber-500/50 transition-colors"
        title={isEs ? 'Arrastrar para cambiar tamaño del panel de posiciones' : 'Drag to resize positions panel'}
      >
        <div className="w-12 h-1 bg-slate-300 rounded-full group-hover:bg-amber-500 group-hover:w-16 transition-all" />
      </div>

      {/* BARRA SUPERIOR / PESTAÑA CLICKEABLE PARA PLEGAR O DESPLEGAR */}
      <div 
        onClick={toggleExpanded}
        className="h-8.5 px-3 border-b border-slate-200 flex items-center justify-between text-xs bg-[#fbf9f4] hover:bg-[#f3ece0] transition-colors cursor-pointer select-none"
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer"
            title={isExpanded ? (isEs ? 'Plegar panel' : 'Collapse panel') : (isEs ? 'Desplegar panel' : 'Expand panel')}
          >
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
          
          {/* Pestaña: Posiciones Abiertas */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveTab('positions');
              if (!isExpanded) setIsExpanded(true);
            }}
            className={`flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-bold transition-all ${
              activeTab === 'positions'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3 h-3 text-slate-600" />
            <span>{isEs ? 'Posiciones' : 'Positions'}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-800 text-[10px] font-mono font-bold">
              {positions.length}
            </span>
          </button>

          {/* Pestaña: Órdenes Límites */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveTab('limits');
              if (!isExpanded) setIsExpanded(true);
            }}
            className={`flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-bold transition-all ${
              activeTab === 'limits'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-3 h-3 text-amber-600" />
            <span>{isEs ? 'Órdenes Límites' : 'Limit Orders'}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
              limitOrders.length > 0 ? 'bg-amber-100 text-amber-900 border border-amber-200' : 'bg-slate-200 text-slate-800'
            }`}>
              {limitOrders.length}
            </span>
          </button>

          {/* Pestaña: Historial */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveTab('history');
              if (!isExpanded) setIsExpanded(true);
            }}
            className={`flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-bold transition-all ${
              activeTab === 'history'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-3 h-3 text-slate-600" />
            <span>{isEs ? 'Historial' : 'History'}</span>
            {history.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-800 text-[10px] font-mono font-bold">
                {history.length}
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* BOTÓN CERRAR TODAS LAS POSICIONES O CANCELAR TODAS LAS LÍMITES */}
          {activeTab === 'positions' && positions.length > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCloseAllPositions?.();
              }}
              className="px-2 py-0.5 rounded bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800 border border-red-200 text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs active:scale-95"
              title={isEs ? 'Cerrar todas las operaciones abiertas a mercado' : 'Close all open positions at market'}
            >
              <span>{isEs ? 'Cerrar Todo' : 'Close All'}</span>
              <span className="px-1 rounded-full bg-red-200 text-red-900 text-[9px] font-mono font-bold">
                {positions.length}
              </span>
            </button>
          )}

          {activeTab === 'limits' && limitOrders.length > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCancelAllLimitOrders?.();
              }}
              className="px-2 py-0.5 rounded bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800 border border-red-200 text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs active:scale-95"
              title={isEs ? 'Cancelar todas las órdenes límite pendientes' : 'Cancel all pending limit orders'}
            >
              <span>{isEs ? 'Cancelar Todo' : 'Cancel All'}</span>
              <span className="px-1 rounded-full bg-red-200 text-red-900 text-[9px] font-mono font-bold">
                {limitOrders.length}
              </span>
            </button>
          )}

          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
            positions.length === 0
              ? 'bg-slate-100 text-slate-600 border-slate-200'
              : isProfit
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-red-50 text-red-700 border-red-200'
          }`}>
            PnL: {positions.length === 0 ? '$0.00' : `${isProfit ? '+' : ''}$${totalPnL.toFixed(2)}`} USDT
          </span>

          <span className="text-[10px] font-semibold text-slate-400 hover:text-slate-700 hidden sm:inline">
            {isExpanded ? (isEs ? 'Plegar' : 'Collapse') : (isEs ? 'Desplegar' : 'Expand')}
          </span>
        </div>
      </div>

      {/* CONTENIDO DESPLEGABLE (SE MUESTRA AL ESTAR DESPLEGADO) */}
      {isExpanded && (
        <div className="flex-1 overflow-y-auto no-scrollbar p-2 flex flex-col gap-2">
          {/* BARRA SUPERIOR DE BALANCE DE LA CUENTA */}
          <div className="px-3 py-1.5 rounded-lg bg-[#f8f5ee] border border-stone-200 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans">
                  {isEs ? 'Balance de Cuenta' : 'Account Balance'}
                </span>
                <span className="font-bold text-slate-900">${demoBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT</span>
              </div>
              <div className="h-6 w-px bg-slate-200" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans">Equity</span>
                <span className={`font-bold ${equity >= demoBalance ? 'text-emerald-700' : 'text-red-700'}`}>
                  ${equity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT
                </span>
              </div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans text-right">
                {isEs ? 'PnL Total No Realizado' : 'Total Unrealized PnL'}
              </span>
              <span className={`font-bold ${isProfit ? 'text-emerald-700' : 'text-red-700'} block text-right`}>
                {positions.length === 0 ? '$0.00 USDT' : `${isProfit ? '+' : ''}$${totalPnL.toFixed(2)} USDT`}
              </span>
            </div>
          </div>

          {/* SEPARACIÓN VISUAL LIMPIA */}
          <div className="border-t border-slate-200/80 my-0.5" />

          {/* PESTAÑA: POSICIONES ABIERTAS */}
          {activeTab === 'positions' && (
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="text-[9px] text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <th className="pb-1 px-2">Par</th>
                  <th className="pb-1 px-2">Lado</th>
                  <th className="pb-1 px-2">Tamaño</th>
                  <th className="pb-1 px-2">Entrada</th>
                  <th className="pb-1 px-2">Marca</th>
                  <th className="pb-1 px-2">SL / TP</th>
                  <th className="pb-1 px-2">PnL (%)</th>
                  <th className="pb-1 px-2 text-right">
                    {positions.length > 1 ? (
                      <button
                        type="button"
                        onClick={onCloseAllPositions}
                        className="text-[9px] text-red-600 hover:text-red-800 font-black hover:underline cursor-pointer"
                        title={isEs ? 'Cerrar todas las operaciones' : 'Close all positions'}
                      >
                        {isEs ? 'Cerrar Todo' : 'Close All'}
                      </button>
                    ) : (
                      isEs ? 'Acción' : 'Action'
                    )}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {positions.map((pos) => (
                  <tr
                    key={pos.id}
                    onClick={() => onSelectPosition?.(pos)}
                    className="hover:bg-amber-50/70 cursor-pointer transition-colors group select-none"
                    title={isEs ? `Clic para cambiar al gráfico de ${pos.symbol}` : `Click to switch chart to ${pos.symbol}`}
                  >
                    <td className="py-1 px-2 font-bold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <span className="group-hover:text-amber-700 transition-colors">{pos.symbol}</span>
                        {pos.exchange && (
                          <span className="text-[8px] uppercase font-mono font-bold px-1 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            {pos.exchange}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-1 px-2">
                      <span className={`px-1 py-0.2 rounded text-[9px] font-bold ${
                        pos.side === 'LONG' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {pos.side}
                      </span>
                    </td>
                    <td className="py-1 px-2 text-slate-600">{pos.size}</td>
                    <td className="py-1 px-2 font-bold text-slate-800">${pos.entry.toLocaleString()}</td>
                    <td className="py-1 px-2 text-slate-600">${pos.mark.toLocaleString()}</td>
                    <td className="py-1 px-2 text-[10px] text-slate-600">
                      <span className="text-red-600">SL: {pos.slPrice ? `$${pos.slPrice.toLocaleString()}` : '-'}</span>
                      {' / '}
                      <span className="text-emerald-600">TP: {pos.tpPrice ? `$${pos.tpPrice.toLocaleString()}` : '-'}</span>
                    </td>
                    <td className={`py-1 px-2 font-bold ${pos.isProfit ? 'text-emerald-600' : 'text-red-600'}`}>
                      {pos.pnl} ({pos.pnlPercent})
                    </td>
                    <td className="py-1 px-2 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSetBreakEven?.(pos);
                          }}
                          className={`px-1.5 py-0.5 rounded text-[9px] font-black cursor-pointer transition-all ${
                            pos.slPrice && Math.abs(pos.slPrice - pos.entry) < 0.05
                              ? 'bg-blue-100 text-blue-700 border border-blue-300 shadow-2xs'
                              : pos.isProfit
                              ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-xs active:scale-95'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-500 border border-slate-300 hover:text-slate-800 active:scale-95'
                          }`}
                          title={
                            pos.slPrice && Math.abs(pos.slPrice - pos.entry) < 0.05
                              ? (isEs ? 'Posición ya protegida en Break-Even. Arrastra el SL para asegurar beneficios' : 'Position protected at Break-Even. Drag SL to trail profits')
                              : pos.isProfit
                              ? (isEs ? 'Fijar Stop Loss a Break-Even (Entrada)' : 'Set Stop Loss to Break-Even (Entry)')
                              : (isEs ? 'Posición en pérdida. Clic para ver detalles' : 'Position in loss. Click to view details')
                          }
                        >
                          BE
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onClosePosition(pos.id);
                          }}
                          className="text-[10px] text-red-600 hover:text-red-800 font-bold hover:underline cursor-pointer"
                        >
                          {isEs ? 'Cerrar' : 'Close'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {positions.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-xs text-slate-400">
                      {isEs ? 'No hay posiciones abiertas en este momento' : 'No open positions right now'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {/* PESTAÑA: ÓRDENES LÍMITES */}
          {activeTab === 'limits' && (
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="text-[9px] text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <th className="pb-1 px-2">Par</th>
                  <th className="pb-1 px-2">Tipo / Lado</th>
                  <th className="pb-1 px-2">Tamaño</th>
                  <th className="pb-1 px-2">Precio Límite</th>
                  <th className="pb-1 px-2">Margen Reservado</th>
                  <th className="pb-1 px-2">SL / TP</th>
                  <th className="pb-1 px-2 text-right">
                    {limitOrders.length > 1 ? (
                      <button
                        type="button"
                        onClick={onCancelAllLimitOrders}
                        className="text-[9px] text-red-600 hover:text-red-800 font-black hover:underline cursor-pointer"
                        title={isEs ? 'Cancelar todas las órdenes límite' : 'Cancel all limit orders'}
                      >
                        {isEs ? 'Cancelar Todo' : 'Cancel All'}
                      </button>
                    ) : (
                      isEs ? 'Acción' : 'Action'
                    )}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {limitOrders.map((ord) => {
                  const isBuy = ord.side === 'buy';
                  return (
                    <tr
                      key={ord.id}
                      onClick={() => onSelectLimitOrder ? onSelectLimitOrder(ord) : onSelectPosition?.({ symbol: ord.symbol, exchange: ord.exchange, marketType: ord.marketType } as any)}
                      className="hover:bg-amber-50/70 cursor-pointer transition-colors group select-none"
                      title={isEs ? `Clic para ver gráfico de ${ord.symbol}` : `Click to switch to ${ord.symbol}`}
                    >
                      <td className="py-1 px-2 font-bold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <span className="group-hover:text-amber-700 transition-colors">{ord.symbol}</span>
                          {ord.exchange && (
                            <span className="text-[8px] uppercase font-mono font-bold px-1 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                              {ord.exchange}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-1 px-2">
                        {(() => {
                          const isSubtypeLimit = ord.orderSubtype ? ord.orderSubtype === 'LIMIT' : (isBuy ? ord.limitPrice <= (ord.placedAtPrice || ord.limitPrice) : ord.limitPrice >= (ord.placedAtPrice || ord.limitPrice));
                          const label = isBuy
                            ? (isSubtypeLimit ? 'BUY LIMIT' : 'BUY STOP')
                            : (isSubtypeLimit ? 'SELL LIMIT' : 'SELL STOP');
                          const badgeColor = isBuy
                            ? (isSubtypeLimit ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800')
                            : (isSubtypeLimit ? 'bg-rose-100 text-rose-800' : 'bg-purple-100 text-purple-800');
                          return (
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${badgeColor}`}>
                              {label} {ord.leverage}x
                            </span>
                          );
                        })()}
                      </td>
                      <td className="py-1 px-2 text-slate-600">{ord.size}</td>
                      <td className="py-1 px-2 font-bold text-amber-700">${ord.limitPrice.toLocaleString()}</td>
                      <td className="py-1 px-2 text-slate-600">${ord.collateralUsdt.toFixed(2)} USDT</td>
                      <td className="py-1 px-2 text-[10px] text-slate-600">
                        <span className="text-red-600">SL: {ord.slPrice ? `$${ord.slPrice.toLocaleString()}` : '-'}</span>
                        {' / '}
                        <span className="text-emerald-600">TP: {ord.tpPrice ? `$${ord.tpPrice.toLocaleString()}` : '-'}</span>
                      </td>
                      <td className="py-1 px-2 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditingOrder(ord);
                            }}
                            className="px-2 py-0.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-200 cursor-pointer transition-colors active:scale-95 flex items-center gap-1"
                            title={isEs ? 'Modificar orden' : 'Edit order'}
                          >
                            <Edit3 className="w-2.5 h-2.5" />
                            <span>{isEs ? 'Editar' : 'Edit'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onCancelLimitOrder?.(ord.id);
                            }}
                            className="px-2 py-0.5 rounded bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-800 text-[10px] font-bold border border-red-200 cursor-pointer transition-colors active:scale-95"
                            title={isEs ? 'Cancelar orden pendiente' : 'Cancel pending order'}
                          >
                            {isEs ? 'Cancelar' : 'Cancel'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {limitOrders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-xs text-slate-400">
                      {isEs ? 'No hay órdenes límites pendientes en este momento' : 'No pending limit orders right now'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {/* PESTAÑA: HISTORIAL DE OPERACIONES CERRADAS */}
          {activeTab === 'history' && (
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="text-[9px] text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <th className="pb-1 px-2">Par</th>
                  <th className="pb-1 px-2">Lado</th>
                  <th className="pb-1 px-2">Tamaño</th>
                  <th className="pb-1 px-2">Entrada</th>
                  <th className="pb-1 px-2">Salida</th>
                  <th className="pb-1 px-2">Cierre</th>
                  <th className="pb-1 px-2">PnL Realizado</th>
                  <th className="pb-1 px-2 text-right">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-1 px-2 font-bold text-slate-900">{item.symbol}</td>
                    <td className="py-1 px-2">
                      <span className={`px-1 py-0.2 rounded text-[9px] font-bold ${
                        item.side === 'LONG' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {item.side}
                      </span>
                    </td>
                    <td className="py-1 px-2 text-slate-600">{item.size}</td>
                    <td className="py-1 px-2 font-bold text-slate-800">${item.entry.toLocaleString()}</td>
                    <td className="py-1 px-2 text-slate-600">${item.exitPrice.toLocaleString()}</td>
                    <td className="py-1 px-2 text-[10px]">
                      {item.closeReason === 'TP' && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                          TP
                        </span>
                      )}
                      {item.closeReason === 'SL' && (
                        <span className="px-1.5 py-0.5 rounded bg-red-50 text-red-700 font-bold border border-red-200">
                          SL
                        </span>
                      )}
                      {(!item.closeReason || item.closeReason === 'MANUAL') && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold border border-slate-200">
                          {isEs ? 'Manual' : 'Manual'}
                        </span>
                      )}
                    </td>
                    <td className={`py-1 px-2 font-bold ${item.isProfit ? 'text-emerald-600' : 'text-red-600'}`}>
                      {item.isProfit ? '+' : ''}${item.pnlUsdt.toFixed(2)} ({item.pnlPercent})
                    </td>
                    <td className="py-1 px-2 text-right text-[10px] text-slate-400">
                      {new Date(item.closedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-xs text-slate-400">
                      {isEs ? 'No hay operaciones cerradas registradas en el historial' : 'No closed trades recorded in history'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* MODAL DE EDICIÓN DE ORDEN LÍMITE */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-2xl p-4 space-y-3 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-black text-white ${
                  editingOrder.side === 'buy' ? 'bg-emerald-600' : 'bg-red-600'
                }`}>
                  {editingOrder.side === 'buy'
                    ? (editingOrder.limitPrice <= (editingOrder.placedAtPrice || editingOrder.limitPrice) ? 'BUY LIMIT' : 'BUY STOP')
                    : (editingOrder.limitPrice >= (editingOrder.placedAtPrice || editingOrder.limitPrice) ? 'SELL LIMIT' : 'SELL STOP')}
                </span>
                <span className="font-bold text-xs text-slate-900">{editingOrder.symbol}</span>
              </div>
              <button
                type="button"
                onClick={() => setEditingOrder(null)}
                className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveOrderEdit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {isEs ? 'Precio Límite (USDT)' : 'Limit Price (USDT)'}
                </label>
                <input
                  type="number"
                  step="any"
                  min="0.000001"
                  required
                  value={editLimitPrice}
                  onChange={(e) => setEditLimitPrice(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-red-700 mb-1">
                    Stop Loss (USDT)
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    placeholder={isEs ? 'Sin SL' : 'No SL'}
                    value={editSlPrice}
                    onChange={(e) => setEditSlPrice(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-red-200 bg-red-50/30 font-mono text-xs font-bold text-red-900 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-emerald-700 mb-1">
                    Take Profit (USDT)
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    placeholder={isEs ? 'Sin TP' : 'No TP'}
                    value={editTpPrice}
                    onChange={(e) => setEditTpPrice(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50/30 font-mono text-xs font-bold text-emerald-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  {isEs ? 'Cancelar' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-black text-white bg-amber-600 hover:bg-amber-700 shadow-sm cursor-pointer"
                >
                  {isEs ? 'Guardar Cambios' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

