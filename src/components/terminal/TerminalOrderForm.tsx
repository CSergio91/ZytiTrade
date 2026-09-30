import React from 'react';
import { TrendingUp, Zap, Shield, Target, DollarSign, Percent } from 'lucide-react';

interface TerminalOrderFormProps {
  isEs: boolean;
  selectedPair: string;
  currentPrice: number;
  demoBalance: number;
  side: 'buy' | 'sell';
  orderType: 'market' | 'limit';
  amount: string;
  leverage: number;
  riskPercent: number;
  slPercent: number;
  tpPercent: number;
  orderMode: 'amount' | 'risk';
  orderSuccess: string | null;
  quickTradeEnabled: boolean;
  isDesktop?: boolean;
  onToggleQuickTrade: () => void;
  setSide: (side: 'buy' | 'sell') => void;
  setOrderType: (type: 'market' | 'limit') => void;
  setAmount: (amount: string) => void;
  setLeverage: (leverage: number) => void;
  setRiskPercent: (risk: number) => void;
  setSlPercent: (sl: number) => void;
  setTpPercent: (tp: number) => void;
  setOrderMode: (mode: 'amount' | 'risk') => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const TerminalOrderForm: React.FC<TerminalOrderFormProps> = ({
  isEs,
  selectedPair,
  currentPrice,
  demoBalance,
  side,
  orderType,
  amount,
  leverage,
  riskPercent,
  slPercent,
  tpPercent,
  orderMode,
  orderSuccess,
  quickTradeEnabled,
  isDesktop = false,
  onToggleQuickTrade,
  setSide,
  setOrderType,
  setAmount,
  setLeverage,
  setRiskPercent,
  setSlPercent,
  setTpPercent,
  setOrderMode,
  onSubmit
}) => {
  const isLong = side === 'buy';

  // Cálculos de SL y TP estimados en precio
  const calculatedSlPrice = isLong
    ? currentPrice * (1 - slPercent / 100)
    : currentPrice * (1 + slPercent / 100);

  const calculatedTpPrice = isLong
    ? currentPrice * (1 + tpPercent / 100)
    : currentPrice * (1 - tpPercent / 100);

  // Cálculo de tamaño en modo Riesgo (%) o Monto (USDT)
  const riskAmountUsd = (demoBalance * riskPercent) / 100;
  const effectiveAmountUsd = orderMode === 'risk'
    ? Math.max(10, Math.round(riskAmountUsd / (slPercent / 100)))
    : parseFloat(amount) || 1000;

  const estimatedLossUsd = orderMode === 'risk'
    ? riskAmountUsd
    : (effectiveAmountUsd * (slPercent / 100));

  const estimatedProfitUsd = (effectiveAmountUsd * (tpPercent / 100));
  const riskRewardRatio = slPercent > 0 ? (tpPercent / slPercent).toFixed(1) : '1.0';

  return (
    <div className="p-2.5 rounded-xl bg-white border border-[#ded5c5] shadow-xs space-y-2.5">
      {/* CABECERA SALDO DEMO */}
      <div className="flex items-center justify-between px-2 py-1 rounded-lg bg-[#fbf9f4] border border-[#ded5c5]">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          {isEs ? 'Saldo Demo' : 'Demo Balance'}
        </span>
        <span className="text-xs font-mono font-black text-slate-900">
          ${demoBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT
        </span>
      </div>

      {/* SELECTOR COMPRA / VENTA */}
      <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#ede5d6]">
        <button
          type="button"
          onClick={() => setSide('buy')}
          className={`py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
            isLong
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
            !isLong
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-800 hover:text-red-700'
          }`}
        >
          {isEs ? 'Vender / Short' : 'Sell / Short'}
        </button>
      </div>

      {/* TIPO DE ORDEN */}
      <div className="flex gap-1.5">
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

      {/* SELECTOR MODO: MONTO FIJO VS RIESGO % CUENTA */}
      <div className="grid grid-cols-2 gap-1 p-0.5 rounded-lg bg-slate-100 border border-slate-200 text-[10px] font-bold">
        <button
          type="button"
          onClick={() => setOrderMode('amount')}
          className={`py-1 rounded-md flex items-center justify-center gap-1 transition-all cursor-pointer ${
            orderMode === 'amount'
              ? 'bg-white text-slate-950 shadow-xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <DollarSign className="w-3 h-3" />
          <span>{isEs ? 'Monto Fijo' : 'Fixed Value'}</span>
        </button>
        <button
          type="button"
          onClick={() => setOrderMode('risk')}
          className={`py-1 rounded-md flex items-center justify-center gap-1 transition-all cursor-pointer ${
            orderMode === 'risk'
              ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Percent className="w-3 h-3" />
          <span>{isEs ? 'Riesgo Cuenta' : 'Account Risk'}</span>
        </button>
      </div>

      {/* FORMULARIO */}
      <form onSubmit={onSubmit} className="space-y-2.5">
        {/* MONTO O RIESGO SEGÚN EL MODO */}
        {orderMode === 'amount' ? (
          <div>
            <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
              {isEs ? 'Monto Posición (USDT)' : 'Order Value (USDT)'}
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
        ) : (
          <div>
            <div className="flex justify-between text-[10px] font-bold text-slate-700 mb-1">
              <span>{isEs ? 'Riesgo de Cuenta (%)' : 'Account Risk (%)'}</span>
              <span className="text-amber-600 font-mono font-black">{riskPercent}% (${riskAmountUsd.toFixed(2)})</span>
            </div>
            <div className="grid grid-cols-4 gap-1 mb-1">
              {[1, 2, 3, 5].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRiskPercent(r)}
                  className={`py-1 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                    riskPercent === r
                      ? 'bg-slate-950 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {r}%
                </button>
              ))}
            </div>
            <div className="text-[9px] text-slate-400 font-mono">
              {isEs ? 'Tamaño calculado:' : 'Computed Size:'} ~${effectiveAmountUsd.toLocaleString()} USDT
            </div>
          </div>
        )}

        {/* STOP LOSS (%) Y TAKE PROFIT (%) */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
          {/* STOP LOSS */}
          <div>
            <div className="flex items-center justify-between text-[10px] font-bold text-red-600 mb-0.5">
              <span className="flex items-center gap-1">
                <Shield className="w-2.5 h-2.5" />
                <span>SL (%)</span>
              </span>
              <span className="font-mono">-${estimatedLossUsd.toFixed(1)}</span>
            </div>
            <div className="grid grid-cols-3 gap-1 mb-1">
              {[1, 2, 3].map((sl) => (
                <button
                  key={sl}
                  type="button"
                  onClick={() => setSlPercent(sl)}
                  className={`py-0.5 rounded text-[9px] font-mono font-bold transition-all cursor-pointer ${
                    slPercent === sl ? 'bg-red-600 text-white' : 'bg-red-50 text-red-700 hover:bg-red-100'
                  }`}
                >
                  {sl}%
                </button>
              ))}
            </div>
            <span className="text-[9px] font-mono text-slate-400 block truncate">
              ${calculatedSlPrice.toLocaleString(undefined, { maximumFractionDigits: 1 })}
            </span>
          </div>

          {/* TAKE PROFIT */}
          <div>
            <div className="flex items-center justify-between text-[10px] font-bold text-emerald-600 mb-0.5">
              <span className="flex items-center gap-1">
                <Target className="w-2.5 h-2.5" />
                <span>TP (%)</span>
              </span>
              <span className="font-mono">+${estimatedProfitUsd.toFixed(1)}</span>
            </div>
            <div className="grid grid-cols-3 gap-1 mb-1">
              {[2, 4, 6].map((tp) => (
                <button
                  key={tp}
                  type="button"
                  onClick={() => setTpPercent(tp)}
                  className={`py-0.5 rounded text-[9px] font-mono font-bold transition-all cursor-pointer ${
                    tpPercent === tp ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  {tp}%
                </button>
              ))}
            </div>
            <span className="text-[9px] font-mono text-slate-400 block truncate">
              ${calculatedTpPrice.toLocaleString(undefined, { maximumFractionDigits: 1 })}
            </span>
          </div>
        </div>

        {/* RATIO RIESGO / BENEFICIO */}
        <div className="flex items-center justify-between px-2 py-1 rounded bg-[#fbf9f4] border border-[#ded5c5] text-[9px] font-mono">
          <span className="text-slate-500 font-bold">{isEs ? 'Ratio Riesgo / Beneficio:' : 'Risk / Reward Ratio:'}</span>
          <span className="font-black text-amber-700">1 : {riskRewardRatio}</span>
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

        {/* BOTÓN SUBMIT PRINCIPAL */}
        <button
          type="submit"
          className={`w-full py-2 rounded-xl text-xs font-black text-white transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1.5 ${
            isLong
              ? 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99]'
              : 'bg-red-600 hover:bg-red-700 active:scale-[0.99]'
          }`}
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>
            {isLong
              ? `${isEs ? 'Comprar' : 'Buy'} ${selectedPair.split('/')[0]}`
              : `${isEs ? 'Vender' : 'Sell'} ${selectedPair.split('/')[0]}`}
          </span>
        </button>
      </form>
    </div>
  );
};
