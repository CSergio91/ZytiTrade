import React, { useState, useEffect } from 'react';
import { RiskRuleConfigEntity } from '../types/crm.types';
import { CrmLang } from '../types/i18n';
import { X, Save, Sliders, Zap } from 'lucide-react';

interface DynamicRulesModalProps {
  isOpen: boolean;
  lang?: CrmLang;
  onClose: () => void;
  ruleToEdit: RiskRuleConfigEntity | null;
  onSaveRule: (rule: Partial<RiskRuleConfigEntity>) => Promise<void>;
}

export const DynamicRulesModal: React.FC<DynamicRulesModalProps> = ({
  isOpen,
  lang = 'es',
  onClose,
  ruleToEdit,
  onSaveRule
}) => {
  const [name, setName] = useState('');
  const [maxDailyLossPercent, setMaxDailyLossPercent] = useState(5.0);
  const [maxTotalDrawdownPercent, setMaxTotalDrawdownPercent] = useState(10.0);
  const [maxTrailingDrawdownPercent, setMaxTrailingDrawdownPercent] = useState<number | ''>('');
  const [drawdownType, setDrawdownType] = useState<'EOD' | 'TRAILING_EQUITY'>('EOD');
  const [maxLeverage, setMaxLeverage] = useState(100);
  const [mandatoryStopLoss, setMandatoryStopLoss] = useState(false);
  const [weekendHoldingAllowed, setWeekendHoldingAllowed] = useState(true);
  const [consistencyRulePercent, setConsistencyRulePercent] = useState(40.0);
  const [minTradingDays, setMinTradingDays] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (ruleToEdit) {
      setName(ruleToEdit.name);
      setMaxDailyLossPercent(ruleToEdit.max_daily_loss_percent);
      setMaxTotalDrawdownPercent(ruleToEdit.max_total_drawdown_percent);
      setMaxTrailingDrawdownPercent(ruleToEdit.max_trailing_drawdown_percent ?? '');
      setDrawdownType(ruleToEdit.drawdown_type);
      setMaxLeverage(ruleToEdit.max_leverage);
      setMandatoryStopLoss(ruleToEdit.mandatory_stop_loss);
      setWeekendHoldingAllowed(ruleToEdit.weekend_holding_allowed);
      setConsistencyRulePercent(ruleToEdit.consistency_rule_percent);
      setMinTradingDays(ruleToEdit.min_trading_days);
    } else {
      setName(lang === 'es' ? 'Nuevo Challenge 100K' : 'New 100K Challenge');
      setMaxDailyLossPercent(5.0);
      setMaxTotalDrawdownPercent(10.0);
      setMaxTrailingDrawdownPercent('');
      setDrawdownType('EOD');
      setMaxLeverage(50);
      setMandatoryStopLoss(false);
      setWeekendHoldingAllowed(true);
      setConsistencyRulePercent(40.0);
      setMinTradingDays(5);
    }
  }, [ruleToEdit, isOpen, lang]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSaveRule({
        id: ruleToEdit ? ruleToEdit.id : undefined,
        name,
        max_daily_loss_percent: Number(maxDailyLossPercent),
        max_total_drawdown_percent: Number(maxTotalDrawdownPercent),
        max_trailing_drawdown_percent: maxTrailingDrawdownPercent !== '' ? Number(maxTrailingDrawdownPercent) : null,
        drawdown_type: drawdownType,
        max_leverage: Number(maxLeverage),
        mandatory_stop_loss: mandatoryStopLoss,
        weekend_holding_allowed: weekendHoldingAllowed,
        consistency_rule_percent: Number(consistencyRulePercent),
        min_trading_days: Number(minTradingDays)
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEs = lang === 'es';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl rounded-2xl bg-[#FDFCF9] border border-[#ded8cb] shadow-2xl p-6 text-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#ece7dc]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center">
              <Sliders className="w-4 h-4 text-indigo-700" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#0F172A] tracking-tight">
                {ruleToEdit 
                  ? (isEs ? 'Calibrar Preset de Reglas de Riesgo' : 'Calibrate Risk Rules Preset')
                  : (isEs ? 'Crear Nuevo Preset de Reglas' : 'Create New Risk Rules Preset')
                }
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {isEs ? 'Guardado en tiempo real en la base de datos (0 valores fijos).' : 'Real-time database storage (zero hardcoded values).'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isEs ? 'Nombre del Challenge / Preset' : 'Challenge / Preset Name'}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-[#dcd6ca] text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-800"
              placeholder={isEs ? 'ej: Challenge Swing 25K' : 'e.g. 25K Swing Challenge'}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isEs ? 'Pérdida Diaria Máx. (%)' : 'Max Daily Loss (%)'}
              </label>
              <input
                type="number"
                step="0.1"
                min="0.5"
                max="20"
                required
                value={maxDailyLossPercent}
                onChange={(e) => setMaxDailyLossPercent(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#dcd6ca] text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isEs ? 'Pérdida Total Máx. (%)' : 'Max Total Drawdown (%)'}
              </label>
              <input
                type="number"
                step="0.1"
                min="1.0"
                max="30"
                required
                value={maxTotalDrawdownPercent}
                onChange={(e) => setMaxTotalDrawdownPercent(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#dcd6ca] text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isEs ? 'Tipo de Drawdown' : 'Drawdown Type'}
              </label>
              <select
                value={drawdownType}
                onChange={(e) => setDrawdownType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#dcd6ca] text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-800"
              >
                <option value="EOD">EOD ({isEs ? 'Fin del Día' : 'End of Day'})</option>
                <option value="TRAILING_EQUITY">Trailing Equity ({isEs ? 'Flotante en Vivo' : 'Live High-Water'})</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isEs ? 'Apalancamiento Máx.' : 'Max Leverage'}
              </label>
              <input
                type="number"
                min="1"
                max="200"
                required
                value={maxLeverage}
                onChange={(e) => setMaxLeverage(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#dcd6ca] text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isEs ? 'Regla Consistencia (%)' : 'Consistency Rule (%)'}
              </label>
              <input
                type="number"
                step="1"
                min="10"
                max="100"
                value={consistencyRulePercent}
                onChange={(e) => setConsistencyRulePercent(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#dcd6ca] text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isEs ? 'Días Mínimos de Trading' : 'Min Trading Days'}
              </label>
              <input
                type="number"
                min="0"
                max="30"
                value={minTradingDays}
                onChange={(e) => setMinTradingDays(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#dcd6ca] text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-slate-800"
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="pt-2 border-t border-[#ece7dc] space-y-2.5">
            <label className="flex items-center justify-between cursor-pointer p-2.5 rounded-xl bg-white border border-[#e5dfd3]">
              <span className="text-xs font-bold text-slate-700">
                {isEs ? 'Stop Loss Obligatorio en Cada Trade' : 'Mandatory Stop Loss on Every Trade'}
              </span>
              <input
                type="checkbox"
                checked={mandatoryStopLoss}
                onChange={(e) => setMandatoryStopLoss(e.target.checked)}
                className="w-4 h-4 rounded text-slate-900 focus:ring-slate-800"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer p-2.5 rounded-xl bg-white border border-[#e5dfd3]">
              <span className="text-xs font-bold text-slate-700">
                {isEs ? 'Permitir Operaciones en Fines de Semana (Weekend Holding)' : 'Allow Weekend Holding'}
              </span>
              <input
                type="checkbox"
                checked={weekendHoldingAllowed}
                onChange={(e) => setWeekendHoldingAllowed(e.target.checked)}
                className="w-4 h-4 rounded text-slate-900 focus:ring-slate-800"
              />
            </label>
          </div>

          {/* Botones */}
          <div className="flex items-center justify-end gap-2.5 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors"
            >
              {isEs ? 'Cancelar' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#EAB308] hover:bg-[#CA8A04] text-[#020617] text-xs font-bold shadow-sm transition-all hover:scale-[1.02] active:scale-95"
            >
              <Zap className="w-3.5 h-3.5 fill-[#020617]" />
              <span>{isSubmitting ? (isEs ? 'Guardando...' : 'Saving...') : (isEs ? 'Guardar Regla' : 'Save Rule')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
