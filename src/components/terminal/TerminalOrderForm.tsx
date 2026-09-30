import React from 'react';
import { TrendingUp, Zap } from 'lucide-react';

interface TerminalOrderFormProps {
  isEs: boolean;
  selectedPair: string;
  side: 'buy' | 'sell';
  orderType: 'market' | 'limit';
  amount: string;
  leverage: number;
  orderSuccess: string | null;
  quickTradeEnabled: boolean;
  isDesktop?: boolean;
  onToggleQuickTrade: () => void;
  setSide: (side: 'buy' | 'sell') => void;
  setOrderType: (type: 'market' | 'limit') => void;
  setAmount: (amount: string) => void;
  setLeverage: (leverage: number) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const TerminalOrderForm: React.FC<TerminalOrderFormProps> = ({
  isEs,
  selectedPair,
  side,
  orderType,
  amount,
  leverage,
  orderSuccess,
  quickTradeEnabled,
  isDesktop = false,
  onToggleQuickTrade,
  setSide,
  setOrderType,
  setAmount,
  setLeverage,
  onSubmit
}) => {
  return (
    <div className="p-2.5 rounded-xl bg-white border border-[#ded5c5] shadow-xs">
      {/* SELECTOR COMPRA / VENTA */}
      <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#ede5d6] mb-2.5">
        <button
          type="button"
          onClick={() => setSide('buy')}
          className={`py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
            side === 'buy'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-800 hover:text-emerald-700'
          }`}
        >
          {isEs ? 'Comprar / Long' : 'Buy / Long'}
        </button>
        <button
          type="button"
          onClick={() => setSide('sell')}
          className={`py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
            side === 'sell'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-800 hover:text-red-700'
          }`}
        >
          {isEs ? 'Vender / Short' : 'Sell / Short'}
        </button>
      </div>

      {/* TIPO DE ORDEN */}
      <div className="flex gap-1.5 mb-2.5">
        <button
          type="button"
          onClick={() => setOrderType('market')}
          className={`flex-1 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
            orderType === 'market'
              ? 'bg-slate-950 text-white border-slate-950'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          Market
        </button>
        <button
          type="button"
          onClick={() => setOrderType('limit')}
          className={`flex-1 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
            orderType === 'limit'
              ? 'bg-slate-950 text-white border-slate-950'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          Limit
        </button>
      </div>

      {/* FORMULARIO */}
      <form onSubmit={onSubmit} className="space-y-2.5">
        {/* MONTO */}
        <div>
          <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
            {isEs ? 'Monto (USDT)' : 'Order Value (USDT)'}
          </label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-2.5 pr-10 py-1.5 rounded-lg border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-amber-500"
              placeholder="1000"
              required
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400">
              USDT
            </span>
          </div>
        </div>

        {/* APALANCAMIENTO */}
        <div>
          <div className="flex justify-between text-[10px] font-bold text-slate-700 mb-0.5">
            <span>{isEs ? 'Apalancamiento' : 'Leverage'}</span>
            <span className="text-amber-600 font-mono font-black">{leverage}x</span>
          </div>
          <input
            type="range"
            min="1"
            max="100"
            value={leverage}
            onChange={(e) => setLeverage(Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer h-1.5"
          />
        </div>

        {/* FEEDBACK DE ÉXITO */}
        {orderSuccess && (
          <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold flex items-center gap-1.5">
            <TrendingUp className="w-3 h-3 shrink-0" />
            <span>{orderSuccess}</span>
          </div>
        )}

        {/* CHECKBOX BOTONES FLOTANTES DE 1 TOQUE (EXCLUSIVO PARA MÓVILES < 1024px) */}
        {!isDesktop && (
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between lg:hidden terminal-mobile-only">
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-slate-900 flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                <span>{isEs ? 'Botones Flotantes (1 Toque)' : '1-Tap Floating Buttons'}</span>
              </span>
              <span className="text-[9px] text-slate-400">
                {isEs ? 'Habilita comprar y vender directo sobre el gráfico' : 'Trade directly over chart on mobile'}
              </span>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={quickTradeEnabled}
                onChange={onToggleQuickTrade}
                className="sr-only peer"
              />
              <div className="w-8 h-4.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-amber-500 cursor-pointer" />
            </label>
          </div>
        )}

        {/* BOTÓN DISPARADOR */}
        <button
          type="submit"
          className={`w-full py-2 rounded-xl text-xs font-black shadow-xs transition-all transform active:scale-98 cursor-pointer flex items-center justify-center gap-1.5 text-white ${
            side === 'buy' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          <Zap className="w-3.5 h-3.5 fill-white" />
          <span>
            {side === 'buy'
              ? isEs ? `Comprar ${selectedPair.split('/')[0]}` : `Buy ${selectedPair.split('/')[0]}`
              : isEs ? `Vender ${selectedPair.split('/')[0]}` : `Sell ${selectedPair.split('/')[0]}`
            }
          </span>
        </button>
      </form>
    </div>
  );
};
