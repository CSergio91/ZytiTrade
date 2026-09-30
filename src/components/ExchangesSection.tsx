import React from 'react';
import { translations, Language } from '../i18n/translations';

interface ExchangesSectionProps {
  currentLang: Language;
}

export const ExchangesSection: React.FC<ExchangesSectionProps> = ({ currentLang }) => {
  const t = translations[currentLang];

  const venues = [
    { name: 'Binance', type: 'Spot & Futuros USD-M', latency: '1.2ms', status: 'Conectado' },
    { name: 'Bybit', type: 'Perpetuos USDT API v5', latency: '1.8ms', status: 'Conectado' },
    { name: 'OKX', type: 'Swaps & Opciones', latency: '2.1ms', status: 'Conectado' },
    { name: 'Kraken', type: 'Spot EUR/USD', latency: '3.4ms', status: 'Conectado' },
    { name: 'Coinbase', type: 'Prime Liquidity', latency: '4.2ms', status: 'Conectado' },
    { name: 'Bitget', type: 'Copy Trading API', latency: '2.0ms', status: 'Conectado' },
  ];

  return (
    <section id="security" className="py-20 px-6 lg:px-12 max-w-7xl mx-auto border-t border-[#ede8df] dark:border-[#1f293d]">
      <div className="max-w-xl mb-12">
        <h2 className="text-3xl font-black text-slate-950 dark:text-white tracking-tight">
          Exchanges soportados de forma nativa.
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">
          Sin intermediarios ni servidores puente de terceros. Tus credenciales API se guardan cifradas localmente en tu propio cliente.
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
                  {venue.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{venue.type}</p>
            </div>
            
            <div className="mt-5 pt-3 border-t border-[#ede8df] dark:border-[#1f293d] flex items-center justify-between text-xs font-mono text-slate-500">
              <span>Latencia nativa</span>
              <span className="font-bold text-slate-900 dark:text-white">{venue.latency}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
