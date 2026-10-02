import React from 'react';
import { CrmKpiStats } from '../types/crm.types';
import { CrmLang, crmTranslations } from '../types/i18n';
import { Activity, ShieldCheck, DollarSign, KeyRound, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface KpiHeaderProps {
  kpis: CrmKpiStats | null;
  lang?: CrmLang;
  onRefresh?: () => void;
}

export const KpiHeader: React.FC<KpiHeaderProps> = ({ kpis, lang = 'es' }) => {
  const t = crmTranslations[lang] || crmTranslations.es;

  const stats = kpis || {
    totalAccounts: 24,
    activeAccounts: 18,
    breachedAccounts: 2,
    fundedCapitalUsd: 1250000,
    activeApiKeys: 6,
    aiAgentsConnected: 4,
    liveFloatingPnL: 14280.50,
    riskStatus: 'HEALTHY'
  };

  const isProfit = stats.liveFloatingPnL >= 0;

  return (
    <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-6">
      {/* 1. Traders Activos */}
      <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-white border border-[#e5dfd3] shadow-[0_4px_20px_-4px_rgba(27,24,18,0.04)] hover:border-slate-400 transition-colors">
        <div className="w-9 h-9 rounded-lg bg-cyan-50 border border-cyan-100 flex items-center justify-center shrink-0">
          <Activity className="w-4 h-4 text-cyan-700" />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500">{t.kpiTraders}</div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-extrabold text-[#0F172A] tracking-tight">{stats.activeAccounts}</span>
            <span className="text-[11px] text-slate-400 font-medium">/ {stats.totalAccounts} {t.kpiAccountsSuffix}</span>
          </div>
        </div>
      </div>

      {/* 2. Capital Asignado */}
      <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-white border border-[#e5dfd3] shadow-[0_4px_20px_-4px_rgba(27,24,18,0.04)] hover:border-slate-400 transition-colors">
        <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-200/80 flex items-center justify-center shrink-0">
          <DollarSign className="w-4 h-4 text-amber-700" />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500">{t.kpiCapital}</div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-extrabold text-[#0F172A] tracking-tight">
              ${(stats.fundedCapitalUsd / 1000).toFixed(0)}k
            </span>
            <span className="text-[11px] text-slate-400 font-medium">USD</span>
          </div>
        </div>
      </div>

      {/* 3. PnL Flotante Global */}
      <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-white border border-[#e5dfd3] shadow-[0_4px_20px_-4px_rgba(27,24,18,0.04)] hover:border-slate-400 transition-colors">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
          isProfit ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'
        }`}>
          {isProfit ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
        </div>
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500">{t.kpiFloatingPnl}</div>
          <div className="flex items-baseline gap-1">
            <span className={`text-xl font-extrabold font-mono tracking-tight ${isProfit ? 'text-emerald-700' : 'text-rose-700'}`}>
              {isProfit ? '+' : ''}${stats.liveFloatingPnL.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Sentinela de Riesgo */}
      <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-white border border-[#e5dfd3] shadow-[0_4px_20px_-4px_rgba(27,24,18,0.04)] hover:border-slate-400 transition-colors">
        <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-200/80 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-4 h-4 text-indigo-700" />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500">{t.kpiRiskSentinel}</div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span className="text-xs font-bold text-emerald-700">{t.kpiRiskActive}</span>
          </div>
        </div>
      </div>

      {/* 5. APIs & Agentes IA */}
      <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-white border border-[#e5dfd3] shadow-[0_4px_20px_-4px_rgba(27,24,18,0.04)] hover:border-slate-400 transition-colors col-span-2 sm:col-span-1">
        <div className="w-9 h-9 rounded-lg bg-purple-50 border border-purple-200/80 flex items-center justify-center shrink-0">
          <KeyRound className="w-4 h-4 text-purple-700" />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500">{t.kpiApis}</div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-extrabold text-[#0F172A] tracking-tight">{stats.activeApiKeys}</span>
            <span className="text-[11px] text-purple-700 font-medium">({stats.aiAgentsConnected} {t.kpiBotsSuffix})</span>
          </div>
        </div>
      </div>
    </div>
  );
};
