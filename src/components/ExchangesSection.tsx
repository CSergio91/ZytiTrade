import React from 'react';
import { translations, Language } from '../i18n/translations';

interface ExchangesSectionProps {
  currentLang: Language;
}

export const ExchangesSection: React.FC<ExchangesSectionProps> = ({ currentLang }) => {
  const t = translations[currentLang].exchangesSection;
  const ex = translations[currentLang].exchangesMenu;

  const venues = [
    { name: ex.binance.name, type: ex.binance.desc, latency: '1.2ms' },
    { name: ex.bybit.name, type: ex.bybit.desc, latency: '1.8ms' },
    { name: ex.okx.name, type: ex.okx.desc, latency: '2.1ms' },
    { name: ex.kraken.name, type: ex.kraken.desc, latency: '3.4ms' },
    { name: ex.coinbase.name, type: ex.coinbase.desc, latency: '4.2ms' },
    { name: ex.bitget.name, type: ex.bitget.desc, latency: '2.0ms' },
  ];

  return (
    <section className="min-w-full w-screen h-screen flex items-center justify-center snap-center px-6 lg:px-12 pt-16">
      <div className="w-full max-w-7xl mx-auto animate-zoom-in">
        <div className="max-w-xl mb-10">
          <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-[#f4edd9] dark:bg-[#252014] text-[#855e15] dark:text-[#f3c86a] text-xs font-mono font-bold tracking-tight mb-4">
            /venues-and-latency
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-slate-950 dark:text-white tracking-tight">
            {t.title}
          </h2>
          <p className="text-base text-slate-800 dark:text-slate-200 font-medium mt-3 leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {venues.map((venue, idx) => (
            <div 
              key={idx}
              className="warm-card rounded-2xl p-6 flex flex-col justify-between hover:border-slate-500 transition-all duration-200 hover:-translate-y-1 shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-bold text-slate-950 dark:text-white">{venue.name}</span>
                  <span className="text-[10px] font-mono font-bold text-[#65a30d] bg-[#f4edd9] dark:bg-[#1a2512] px-2.5 py-1 rounded-full">
                    {t.connected}
                  </span>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 font-medium mt-1">{venue.type}</p>
              </div>
              
              <div className="mt-6 pt-4 border-t border-[#ede8df] dark:border-[#1f293d] flex items-center justify-between text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                <span>{t.latencyLabel}</span>
                <span className="text-sm font-black text-slate-950 dark:text-white">{venue.latency}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
