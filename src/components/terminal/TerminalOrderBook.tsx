import React from 'react';
import { Activity } from 'lucide-react';
import { OrderBookPayload } from '../../workers/marketData.worker';

interface TerminalOrderBookProps {
  orderBook: OrderBookPayload;
}

export const TerminalOrderBook: React.FC<TerminalOrderBookProps> = ({ orderBook }) => {
  return (
    <div className="p-2 sm:p-2.5 rounded-xl bg-white border border-[#ded5c5] shadow-xs">
      <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100">
        <span className="text-[11px] font-black text-slate-900 flex items-center gap-1.5">
          <Activity className="w-3 h-3 text-slate-600" />
          <span>Order Book L2</span>
        </span>
        <span className="text-[9px] font-mono text-slate-400">Profundidad</span>
      </div>

      {/* ASKS (VENTAS - ROJO) */}
      <div className="space-y-0.5 font-mono text-[10px]">
        {orderBook.asks.slice(-5).reverse().map((ask, i) => (
          <div key={i} className="relative flex justify-between px-1.5 py-0.5">
            <div 
              className="absolute right-0 top-0 bottom-0 bg-red-100/60 rounded-xs transition-all pointer-events-none"
              style={{ width: `${Math.min(100, (ask.amount / 12) * 100)}%` }}
            />
            <span className="relative z-10 text-red-600 font-bold">${ask.price.toLocaleString()}</span>
            <span className="relative z-10 text-slate-600">{ask.amount.toFixed(3)}</span>
          </div>
        ))}
      </div>

      {/* SPREAD INDICATOR */}
      <div className="py-1 px-1.5 my-1 bg-[#fbf9f4] border-y border-slate-100 flex items-center justify-between font-mono text-[10px]">
        <span className="text-slate-400 text-[9px] uppercase">Spread</span>
        <span className="text-amber-600 font-bold">0.01% (L2)</span>
      </div>

      {/* BIDS (COMPRAS - VERDE) */}
      <div className="space-y-0.5 font-mono text-[10px]">
        {orderBook.bids.slice(0, 5).map((bid, i) => (
          <div key={i} className="relative flex justify-between px-1.5 py-0.5">
            <div 
              className="absolute right-0 top-0 bottom-0 bg-emerald-100/60 rounded-xs transition-all pointer-events-none"
              style={{ width: `${Math.min(100, (bid.amount / 12) * 100)}%` }}
            />
            <span className="relative z-10 text-emerald-600 font-bold">${bid.price.toLocaleString()}</span>
            <span className="relative z-10 text-slate-600">{bid.amount.toFixed(3)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
