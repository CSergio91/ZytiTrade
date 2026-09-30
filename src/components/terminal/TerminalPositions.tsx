import React from 'react';
import { Layers } from 'lucide-react';
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
  return (
    <div className="terminal-desktop-positions bg-white">
      <div className="h-7 px-3 border-b border-slate-200 flex items-center justify-between text-xs bg-[#fbf9f4]">
        <span className="font-black text-slate-900 flex items-center gap-1.5 text-[11px]">
          <Layers className="w-3 h-3 text-slate-600" />
          <span>{isEs ? `Posiciones Abiertas (${positions.length})` : `Open Positions (${positions.length})`}</span>
        </span>
        <span className="text-[10px] font-mono text-emerald-600 font-bold">
          PnL No Realizado: +442.78 USDT
        </span>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar p-1.5">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="text-[9px] text-slate-400 uppercase tracking-wider border-b border-slate-100">
              <th className="pb-1 px-2">Par</th>
              <th className="pb-1 px-2">Lado</th>
              <th className="pb-1 px-2">Tamaño</th>
              <th className="pb-1 px-2">Entrada</th>
              <th className="pb-1 px-2">Marca</th>
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
                <td className={`py-1 px-2 font-bold ${pos.isProfit ? 'text-emerald-600' : 'text-red-600'}`}>
                  {pos.pnl} ({pos.pnlPercent})
                </td>
                <td className="py-1 px-2 text-right">
                  <button
                    type="button"
                    onClick={() => onClosePosition(pos.id)}
                    className="text-[10px] text-red-600 hover:text-red-800 font-bold hover:underline cursor-pointer"
                  >
                    {isEs ? 'Cerrar' : 'Close'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
