import React, { useState, useRef, useEffect } from 'react';
import { Wallet, ChevronDown, Check, ShieldAlert } from 'lucide-react';

export const DEMO_ACCOUNT_TIERS = [
  { amount: 1000, label: '$1,000', tier: 'Micro Challenge' },
  { amount: 5000, label: '$5,000', tier: 'Starter Challenge' },
  { amount: 10000, label: '$10,000', tier: 'Standard Evaluation' },
  { amount: 15000, label: '$15,000', tier: 'Executive Evaluation' },
  { amount: 25000, label: '$25,000', tier: 'Pro Evaluation' },
  { amount: 50000, label: '$50,000', tier: 'Master Evaluation' },
  { amount: 100000, label: '$100,000', tier: 'Institucional 100K' },
  { amount: 200000, label: '$200,000', tier: 'Institucional 200K' },
  { amount: 1000000, label: '$1,000,000', tier: 'Whale Sovereign' }
];

interface DemoAccountBalanceSelectorProps {
  currentBalance: number;
  unrealizedPnL: number;
  isEs: boolean;
  onSelectAmount: (amount: number) => void;
  onResetToCurrent: () => void;
}

export const DemoAccountBalanceSelector: React.FC<DemoAccountBalanceSelectorProps> = ({
  currentBalance,
  unrealizedPnL,
  isEs,
  onSelectAmount,
  onResetToCurrent
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const equity = currentBalance + unrealizedPnL;
  const activeTier = DEMO_ACCOUNT_TIERS.find((t) => t.amount === currentBalance) || {
    amount: currentBalance,
    label: `$${currentBalance.toLocaleString()}`,
    tier: 'Custom Account'
  };

  return (
    <div className="relative shrink-0" ref={containerRef}>
      {/* BADGE CLICABLE DE BALANCE */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-amber-100/70 border border-amber-200/90 hover:border-amber-400 text-amber-950 shadow-xs font-mono font-bold transition-all cursor-pointer select-none group"
        title={isEs ? 'Clic para cambiar tamaño de cuenta o resetear' : 'Click to change account size or reset'}
      >
        <Wallet className="w-3.5 h-3.5 text-amber-700 shrink-0" />
        <div className="flex flex-col text-left leading-none">
          <span className="text-[8.5px] uppercase font-bold text-amber-800">
            {isEs ? 'Fondeo Demo' : 'Prop Demo'}
          </span>
          <span
            className={`text-[11px] sm:text-xs font-black transition-colors ${
              unrealizedPnL > 0 ? 'text-emerald-700' : unrealizedPnL < 0 ? 'text-red-700' : 'text-amber-950'
            }`}
          >
            ${equity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <ChevronDown
          className={`w-3 h-3 text-amber-700/70 transition-transform group-hover:text-amber-900 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* DROPDOWN DE TALLAS DE CUENTA INSTITUCIONAL */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-transparent" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute top-full left-0 mt-1.5 w-68 sm:w-76 bg-white border border-[#ded5c5] rounded-2xl shadow-2xl py-3 px-3 z-50 animate-in fade-in-50 zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider">
                {isEs ? 'Tallas de Cuenta Prop Firm' : 'Prop Firm Account Sizes'}
              </span>
              <button
                type="button"
                onClick={() => {
                  onResetToCurrent();
                  setIsOpen(false);
                }}
                className="text-[9px] font-mono font-bold text-amber-700 hover:text-amber-900 underline cursor-pointer"
              >
                {isEs ? 'Reiniciar Saldo' : 'Reset Balance'}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1.5 mb-2">
              {DEMO_ACCOUNT_TIERS.map((tier) => {
                const isSelected = tier.amount === currentBalance;
                return (
                  <button
                    key={tier.amount}
                    type="button"
                    onClick={() => {
                      onSelectAmount(tier.amount);
                      setIsOpen(false);
                    }}
                    className={`p-1.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                      isSelected
                        ? 'bg-amber-500 text-white font-black border-amber-600 shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:bg-amber-50 text-slate-800 font-bold'
                    }`}
                  >
                    <span className="text-[11px] font-mono">{tier.label}</span>
                    <span
                      className={`text-[7.5px] truncate max-w-full ${
                        isSelected ? 'text-amber-100' : 'text-slate-400'
                      }`}
                    >
                      {tier.tier.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-[10px] text-slate-600 flex items-start gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <span className="leading-tight">
                {isEs
                  ? 'El motor de riesgo (Drawdown diario del 5% y máximo del 10%) se calibra automáticamente según la talla seleccionada.'
                  : 'Risk rules (5% daily and 10% max drawdown) automatically re-calibrate to the chosen account size.'}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
