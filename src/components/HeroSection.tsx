import React from 'react';
import { 
  Zap,
  Download, 
  Eye, 
  Check, 
  AlertTriangle 
} from 'lucide-react';
import { translations, Language } from '../i18n/translations';

interface HeroSectionProps {
  currentLang: Language;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ currentLang }) => {
  const t = translations[currentLang].hero;

  return (
    <section className="min-w-full w-screen h-screen flex items-center justify-center snap-center px-6 lg:px-12 pt-16">
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center animate-zoom-in">
        
        {/* COLUMNA IZQUIERDA */}
        <div className="lg:col-span-6 flex flex-col items-start z-10">
          
          <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-[#f4edd9] dark:bg-[#252014] text-[#855e15] dark:text-[#f3c86a] text-xs font-mono font-bold tracking-tight mb-6">
            {t.tag}
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-[66px] font-black tracking-tight text-slate-950 dark:text-white leading-[1.06]">
            {t.headlineStart}<br />
            <span className="text-gradient-purple font-black">{t.headlineHighlight}</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-900 dark:text-slate-200 font-medium leading-relaxed max-w-lg">
            {t.subtitle}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button className="flex items-center gap-2.5 px-7 py-3.5 text-sm font-bold text-slate-950 bg-[#eab308] hover:bg-[#ca8a04] rounded-2xl shadow-sm transition-all duration-150 cursor-pointer transform hover:scale-105 active:scale-95">
              <Zap className="w-4 h-4 stroke-[2.5] fill-slate-950" />
              <span>{t.ctaPrimary}</span>
            </button>

            <button className="flex items-center gap-2 px-6 py-3.5 text-sm font-bold text-slate-900 dark:text-white bg-transparent hover:bg-slate-900/5 dark:hover:bg-white/5 rounded-2xl border border-slate-900 dark:border-slate-300 transition-all cursor-pointer transform hover:scale-105 active:scale-95">
              <Eye className="w-4 h-4" />
              <span>{t.ctaSecondary}</span>
            </button>
          </div>

          <div className="mt-8 flex items-center gap-3">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider mr-1">
              {t.connectorsLabel}
            </span>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 bg-white/80 dark:bg-slate-900/80 px-3 py-1.5 rounded-xl border border-[#ede8df] dark:border-slate-800">
              <span>Binance</span>
              <span className="text-slate-500 font-bold">+</span>
              <span>Bybit</span>
              <span className="text-slate-500 font-bold">+</span>
              <span>OKX</span>
              <span className="text-slate-500 font-bold">+</span>
              <span>Prop Firms</span>
            </div>
          </div>

        </div>

        {/* COLUMNA DERECHA: TARJETAS CON LEVITACIÓN ORGÁNICA */}
        <div className="lg:col-span-6 relative flex items-center justify-center">
          
          {/* ALERTA SATÉLITE 1: LEVITACIÓN ORGÁNICA LENTA */}
          <div className="absolute -top-8 left-2 sm:-left-4 z-20 satellite-card rounded-2xl p-4 max-w-[220px] animate-float">
            <div className="flex items-start gap-2.5">
              <div className="p-1 rounded-md bg-[#fee2e2] text-[#dc2626] shrink-0 mt-0.5">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                  {t.satellites.arbTitle}
                </span>
                <span className="text-[11px] text-slate-800 dark:text-slate-300 font-medium mt-1 leading-snug">
                  {t.satellites.arbDesc}
                </span>
                <button className="mt-2.5 px-2.5 py-1 text-[10px] font-bold text-white bg-[#dc2626] hover:bg-[#b91c1c] rounded-lg self-start cursor-pointer">
                  {t.satellites.arbBtn}
                </button>
              </div>
            </div>
          </div>

          {/* ALERTA SATÉLITE 2: LEVITACIÓN EN DESFASE */}
          <div className="absolute -bottom-8 -right-2 sm:-right-4 z-20 satellite-card rounded-2xl p-4 max-w-[230px] animate-float-reverse">
            <div className="flex items-start gap-2.5">
              <div className="p-1 rounded-md bg-[#dcfce7] text-[#16a34a] shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                  {t.satellites.copyTitle}
                </span>
                <span className="text-[11px] text-slate-800 dark:text-slate-300 font-medium mt-1 leading-snug">
                  {t.satellites.copyDesc}
                </span>
                <span className="mt-1 text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {t.satellites.copyMetrics}
                </span>
              </div>
            </div>
          </div>

          {/* TARJETA PRINCIPAL */}
          <div className="w-full max-w-[420px] warm-card rounded-3xl p-6 sm:p-7 relative z-10 shadow-2xl transition-transform duration-300 hover:scale-[1.02]">
            
            <div className="flex items-baseline justify-between mb-1">
              <h3 className="text-xl font-black text-slate-950 dark:text-white">
                {t.planCard.title}
              </h3>
              <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-400">
                {t.planCard.pair}
              </span>
            </div>

            <p className="text-xs text-slate-800 dark:text-slate-300 font-semibold mb-4">
              {t.planCard.conditions}
            </p>

            <div className="w-full h-2 rounded-full bg-[#ede8df] dark:bg-[#1f293d] overflow-hidden mb-6">
              <div className="h-full bg-[#65a30d] rounded-full w-[80%] transition-all duration-1000 ease-out" />
            </div>

            <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-[#fbf9f4] dark:bg-[#0e1420] border border-[#ede8df] dark:border-[#1f293d] mb-6 text-center">
              <div>
                <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{t.planCard.col1Label}</p>
                <p className="text-xl font-black text-[#65a30d]">8</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{t.planCard.col2Label}</p>
                <p className="text-xl font-black text-[#ca8a04]">1</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{t.planCard.col3Label}</p>
                <p className="text-xl font-black text-slate-800 dark:text-slate-200">3</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-[#65a30d] text-white flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span className="line-through">{t.planCard.task1}</span>
                </div>
                <span className="font-mono text-[10px]">1.2ms</span>
              </div>

              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-[#65a30d] text-white flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span className="line-through">{t.planCard.task2}</span>
                </div>
                <span className="font-mono text-[10px]">PASS</span>
              </div>

              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-[#65a30d] text-white flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span className="line-through">{t.planCard.task3}</span>
                </div>
                <span className="font-mono text-[10px]">0.5%</span>
              </div>

              <div className="flex items-center justify-between text-slate-900 dark:text-white font-bold p-1 rounded-lg bg-[#f4edd9]/60 dark:bg-amber-950/30">
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full border-2 border-[#ca8a04] flex items-center justify-center shrink-0 animate-pulse" />
                  <span>{t.planCard.task4}</span>
                </div>
                <span className="font-mono text-[10px] text-[#ca8a04]">+$1,420</span>
              </div>

              <div className="flex items-center justify-between text-slate-800 dark:text-slate-200 font-semibold">
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full border border-slate-400 dark:border-slate-600 shrink-0" />
                  <span>{t.planCard.task5}</span>
                </div>
                <span className="font-mono text-[10px]">$66,500</span>
              </div>

            </div>

            <div className="mt-6 pt-4 border-t border-[#ede8df] dark:border-[#1f293d] flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-[#65a30d] font-bold">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                {t.planCard.engineHealth}
              </span>
              <span className="text-slate-700 dark:text-slate-300 font-mono font-bold text-[10px]">
                {t.planCard.canvasFps}
              </span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
