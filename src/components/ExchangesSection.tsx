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
    <section id="security" className="py-20 px-6 lg:px-12 max-w-7xl mx-auto border-t border-[#ede8df] dark:border-[#1f293d]">
      <div className="max-w-xl mb-12">
        <h2 className="text-3xl font-black text-slate-950 dark:text-white tracking-tight">
          {t.title}
        </h2>
        <p className="text-base text-slate-800 dark:text-slate-200 font-medium mt-3 leading-relaxed">
          {t.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {venues.map((venue, idx) => (
          <div 
            key={idx}
            className="warm-card rounded-2xl p-5 flex flex-col justify-between hover:border-slate-400 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-base font-bold text-slate-950 dark:text-white">{venue.name}</span>
                <span className="text-[10px] font-mono font-bold text-[#65a30d] bg-[#f4edd9] dark:bg-[#1a2512] px-2 py-0.5 rounded-full">
                  {t.connected}
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium mt-1">{venue.type}</p>
            </div>
            
            <div className="mt-5 pt-3 border-t border-[#ede8df] dark:border-[#1f293d] flex items-center justify-between text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
              <span>{t.latencyLabel}</span>
              <span className="font-bold text-slate-900 dark:text-white">{venue.latency}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
