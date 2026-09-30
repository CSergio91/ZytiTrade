import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Layers } from 'lucide-react';
import { PositionItem } from './types';

interface TerminalPositionsProps {
  isEs: boolean;
  positions: PositionItem[];
  onClosePosition: (id: number) => void;
}

export const TerminalPositions: React.FC<TerminalPositionsProps> = ({
  isEs,
  positions,
  onClosePosition
}) => {
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
    setIsExpanded((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('zyti_positions_expanded', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Cálculo real dinámico de PnL no realizado
  const totalPnL = positions.reduce((acc, p) => acc + (p.pnlUsdt ?? 0), 0);
  const isProfit = totalPnL >= 0;

  return (
    <div className={`terminal-desktop-positions bg-white ${isExpanded ? 'is-expanded' : 'is-collapsed'}`}>
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
          
          <span className="font-black text-slate-900 flex items-center gap-1.5 text-[11px]">
            <Layers className="w-3 h-3 text-slate-600" />
            <span>{isEs ? 'Posiciones Abiertas' : 'Open Positions'}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-800 text-[10px] font-mono font-bold">
              {positions.length}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
            positions.length === 0
              ? 'bg-slate-100 text-slate-600 border-slate-200'
              : isProfit
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-red-50 text-red-700 border-red-200'
          }`}>
            PnL No Realizado: {positions.length === 0 ? '$0.00' : `${isProfit ? '+' : ''}$${totalPnL.toFixed(2)}`} USDT
          </span>

          <span className="text-[10px] font-semibold text-slate-400 hover:text-slate-700 hidden sm:inline">
            {isExpanded ? (isEs ? 'Plegar' : 'Collapse') : (isEs ? 'Desplegar' : 'Expand')}
          </span>
        </div>
      </div>

      {/* CONTENIDO DESPLEGABLE DE LA TABLA (SE MUESTRA AL ESTAR DESPLEGADO) */}
      {isExpanded && (
        <div className="flex-1 overflow-y-auto no-scrollbar p-1.5">
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
                <th className="pb-1 px-2 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {positions.map((pos) => (
                <tr key={pos.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-1 px-2 font-bold text-slate-900">{pos.symbol}</td>
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
        </div>
      )}
    </div>
  );
};
