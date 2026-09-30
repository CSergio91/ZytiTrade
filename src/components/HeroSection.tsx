import React from 'react';
import { 
  Zap, 
  ArrowRight, 
  Activity, 
  ShieldCheck, 
  RefreshCw, 
  TrendingUp, 
  Layers, 
  Cpu, 
  CheckCircle2, 
  ExternalLink 
} from 'lucide-react';
import { translations, Language } from '../i18n/translations';

interface HeroSectionProps {
  currentLang: Language;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ currentLang }) => {
  const t = translations[currentLang].hero;

  return (
    <section className="relative min-h-screen pt-32 pb-20 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
      
      {/* CONTENEDOR HERO EN OVERLAY TRANSPARENTE CON BLUR */}
      <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
        
        {/* BADGE INSTITUCIONAL */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-blue-200/80 dark:border-blue-900/60 shadow-xs mb-6 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-wide">
            {t.badge}
          </span>
        </div>

        {/* HEADLINE PRINCIPAL */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-950 dark:text-white max-w-4xl leading-[1.12]">
          {t.titleStart}{' '}
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 dark:from-blue-400 dark:via-indigo-300 dark:to-violet-400 bg-clip-text text-transparent underline decoration-blue-200 dark:decoration-blue-800 decoration-wavy decoration-2">
            {t.titleHighlight}
          </span>{' '}
          {t.titleEnd}
        </h1>

        {/* SUBTÍTULO */}
        <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl font-normal leading-relaxed">
          {t.subtitle}
        </p>

        {/* BOTONES DE ACCIÓN */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 text-base font-bold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 transition-all duration-200 transform hover:-translate-y-0.5">
            <span>{t.ctaPrimary}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          
          <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 text-base font-bold text-slate-700 dark:text-slate-200 bg-white/80 dark:bg-slate-900/80 hover:bg-white/95 dark:hover:bg-slate-800/90 backdrop-blur-md rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">
            <span>{t.ctaSecondary}</span>
            <ExternalLink className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* MÉTRICAS INSTITUCIONALES */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 w-full max-w-4xl">
          <div className="glass-crystal rounded-2xl p-4 text-center border border-white/80 dark:border-slate-800">
            <p className="text-2xl sm:text-3xl font-black font-mono text-blue-600 dark:text-blue-400">{t.stats.latency}</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">{t.stats.latencyLabel}</p>
          </div>
          <div className="glass-crystal rounded-2xl p-4 text-center border border-white/80 dark:border-slate-800">
            <p className="text-2xl sm:text-3xl font-black font-mono text-indigo-600 dark:text-indigo-400">{t.stats.exchanges}</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">{t.stats.exchangesLabel}</p>
          </div>
          <div className="glass-crystal rounded-2xl p-4 text-center border border-white/80 dark:border-slate-800">
            <p className="text-2xl sm:text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">{t.stats.fps}</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">{t.stats.fpsLabel}</p>
          </div>
          <div className="glass-crystal rounded-2xl p-4 text-center border border-white/80 dark:border-slate-800">
            <p className="text-2xl sm:text-3xl font-black font-mono text-violet-600 dark:text-violet-400">{t.stats.uptime}</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">{t.stats.uptimeLabel}</p>
          </div>
        </div>

        {/* TARJETAS FLOTANTES DE ARBITRAJE Y COPY TRADING */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
          
          {/* TARJETA ARBITRAJE EN VIVO */}
          <div className="glass-crystal rounded-2xl p-5 text-left border border-white/90 dark:border-slate-800 shadow-lg relative overflow-hidden group hover:border-blue-200 dark:hover:border-blue-900/60 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                  <Zap className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">{t.liveCard.title}</span>
              </div>
              <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-100 dark:border-emerald-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                {t.liveCard.status}
              </span>
            </div>
            
            <p className="text-lg font-black text-slate-900 dark:text-white font-mono">{t.liveCard.pair}</p>
            
            <div className="mt-2.5 flex items-center justify-between text-xs font-mono text-slate-600 dark:text-slate-300 bg-slate-50/70 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
              <span>{t.liveCard.bestBid}</span>
              <span className="text-slate-400">⚡</span>
              <span>{t.liveCard.bestAsk}</span>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{t.liveCard.spread}</span>
              <span className="text-[11px] text-slate-400 font-medium">Auto-Router Engine</span>
            </div>
          </div>

          {/* TARJETA COPY TRADING EN VIVO */}
          <div className="glass-crystal rounded-2xl p-5 text-left border border-white/90 dark:border-slate-800 shadow-lg relative overflow-hidden group hover:border-indigo-200 dark:hover:border-indigo-900/60 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  <RefreshCw className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">{t.copyCard.title}</span>
              </div>
              <span className="text-[11px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-800 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {t.copyCard.status}
              </span>
            </div>

            <p className="text-sm font-bold text-slate-900 dark:text-white font-mono bg-slate-50/70 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
              {t.copyCard.leader}
            </p>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">{t.copyCard.replicas}</span>
              <span className="text-[11px] text-slate-400 font-mono">Binance • Bybit • OKX</span>
            </div>
          </div>

        </div>

      </div>

    </section>
  );
};
