import React, { useState, useRef, useEffect } from 'react';
import { Wallet, ChevronDown, Check, ShieldAlert, Award, RotateCcw, ShieldCheck } from 'lucide-react';
import { PropFirmAccount } from '../../lib/supabase';

export const STANDARD_ACCOUNT_BALANCE = 100000;

interface DemoAccountBalanceSelectorProps {
  currentBalance: number;
  unrealizedPnL: number;
  isEs: boolean;
  accounts?: PropFirmAccount[];
  activeAccountId?: string;
  onSelectAmount: (amount: number) => void;
  onSelectAccount?: (account: PropFirmAccount | null) => void;
  onResetToCurrent: () => void;
}

export const DemoAccountBalanceSelector: React.FC<DemoAccountBalanceSelectorProps> = ({
  currentBalance,
  unrealizedPnL,
  isEs,
  accounts = [],
  activeAccountId,
  onSelectAccount,
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
  const activePropAccount = accounts.find((a) => a.id === activeAccountId) || accounts[0];

  return (
    <div className="relative shrink-0" ref={containerRef}>
      {/* BADGE CLICABLE DE BALANCE / CUENTA ACTIVA */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1 sm:gap-1.5 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-xl border shadow-xs font-mono font-bold transition-all cursor-pointer select-none group shrink-0 ${
          activePropAccount 
            ? 'bg-amber-500/15 border-amber-400 text-amber-950 hover:bg-amber-500/25'
            : 'bg-amber-100/70 border-amber-200/90 hover:border-amber-400 text-amber-950'
        }`}
        title={isEs ? 'Clic para ver detalles de cuenta de fondeo' : 'Click to view funding account details'}
      >
        {activePropAccount ? (
          <Award className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-600 shrink-0" />
        ) : (
          <Wallet className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-700 shrink-0" />
        )}
        <div className="flex flex-col text-left leading-none max-w-[85px] sm:max-w-[180px]">
          <span className="text-[7.5px] sm:text-[8px] uppercase font-bold text-amber-800 truncate">
            {activePropAccount ? `${activePropAccount.firmName}` : (isEs ? 'Cuenta 100K' : '100K Account')}
          </span>
          <span
            className={`text-[10px] sm:text-xs font-black transition-colors ${
              unrealizedPnL > 0 ? 'text-emerald-700' : unrealizedPnL < 0 ? 'text-red-700' : 'text-amber-950'
            }`}
          >
            ${equity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <ChevronDown
          className={`w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-700/70 transition-transform group-hover:text-amber-900 shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* DROPDOWN DE INFORMACIÓN DE CUENTA INSTITUCIONAL */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-transparent" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute top-full left-0 mt-1.5 w-76 sm:w-84 bg-white border border-[#ded5c5] rounded-2xl shadow-2xl py-3 px-3 z-50 animate-in fade-in-50 zoom-in-95 duration-150">
            
            {/* CUENTAS DE FONDEO VINCULADAS */}
            {accounts.length > 0 && (
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1.5 px-1">
                  <span className="text-[10px] font-mono uppercase font-bold text-amber-800 tracking-wider flex items-center gap-1">
                    <Award className="w-3 h-3 text-amber-600" />
                    {isEs ? 'Cuentas Oficiales de Fondeo' : 'Official Prop Firm Accounts'}
                  </span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {accounts.map((acc) => {
                    const isSelected = acc.id === (activeAccountId || accounts[0]?.id);
                    return (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => {
                          if (onSelectAccount) onSelectAccount(acc);
                          setIsOpen(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-500 text-amber-950 font-bold'
                            : 'bg-slate-50 hover:bg-amber-50 border-slate-200 text-slate-800'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-slate-900">{acc.firmName || 'ZYTI Funding'}</span>
                          <span className="text-[10px] font-mono text-slate-500">{acc.accountNumber}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-emerald-700">
                            ${(acc.initialBalance || STANDARD_ACCOUNT_BALANCE).toLocaleString()}
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-amber-600" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="border-t border-slate-200 my-2.5" />
              </div>
            )}

            {/* ESPECIFICACIONES DE RIESGO DE LA CUENTA ESTANDARIZADA */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 mb-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-500">
                  {isEs ? 'Balance Estandarizado' : 'Standard Balance'}
                </span>
                <span className="text-xs font-mono font-black text-slate-900">
                  $100,000.00 USDT
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-500">
                  {isEs ? 'Pérdida Diaria Máx. (5%)' : 'Max Daily Loss (5%)'}
                </span>
                <span className="text-xs font-mono font-bold text-red-600">
                  -$5,000.00 USDT
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-500">
                  {isEs ? 'Drawdown Total Máx. (10%)' : 'Max Total Drawdown (10%)'}
                </span>
                <span className="text-xs font-mono font-bold text-red-600">
                  -$10,000.00 USDT
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-500">
                  {isEs ? 'Apalancamiento Máximo' : 'Max Leverage'}
                </span>
                <span className="text-xs font-mono font-bold text-emerald-700">
                  100x
                </span>
              </div>
            </div>

            {/* BOTÓN PARA REINICIAR LA CUENTA A 100K */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1 text-[10px] font-mono text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Sentinel Risk Activo</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onResetToCurrent();
                  setIsOpen(false);
                }}
                className="flex items-center gap-1 text-[10px] font-mono font-bold text-amber-800 hover:text-amber-950 px-2 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 transition-colors cursor-pointer"
                title={isEs ? 'Restablecer saldo a $100,000 USDT' : 'Reset balance to $100,000 USDT'}
              >
                <RotateCcw className="w-3 h-3 text-amber-800" />
                <span>{isEs ? 'Restablecer a 100K' : 'Reset to 100K'}</span>
              </button>
            </div>

          </div>
        </>
      )}
    </div>
  );
};
