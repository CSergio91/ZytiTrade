import React from 'react';
import { ShieldCheck, Cpu, ArrowUpRight } from 'lucide-react';
import { translations, Language } from '../i18n/translations';

interface ExchangesSectionProps {
  currentLang: Language;
}

export const ExchangesSection: React.FC<ExchangesSectionProps> = ({ currentLang }) => {
  const t = translations[currentLang];

  const venues = [
    { name: 'Binance', type: 'Spot & Futures', latency: '1.2ms', api: 'Native WSS', status: 'Optimal' },
    { name: 'Bybit', type: 'USDT Perpetuals', latency: '1.8ms', api: 'API v5 Direct', status: 'Optimal' },
    { name: 'OKX', type: 'Swaps & Options', latency: '2.1ms', api: 'Push Streaming', status: 'Optimal' },
    { name: 'Kraken', type: 'Spot EUR/USD', latency: '3.4ms', api: 'REST + WSS', status: 'Optimal' },
    { name: 'Coinbase', type: 'Institutional Prime', latency: '4.2ms', api: 'Direct FIX / API', status: 'Optimal' },
    { name: 'Bitget', type: 'Copy Derivatives', latency: '2.0ms', api: 'Low-Latency Socket', status: 'Optimal' },
    { name: 'KuCoin', type: '700+ Altcoins', latency: '3.1ms', api: 'Level 2 DOM', status: 'Optimal' },
    { name: 'Gate.io', type: 'Global Liquidity', latency: '3.6ms', api: 'Native Gateway', status: 'Optimal' },
  ];

  return (
    <section id="exchanges" className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="glass-card rounded-3xl p-6 sm:p-10 border border-white/80 shadow-xl">
        <div className="max-w-2xl mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-3">
            <Cpu className="w-3.5 h-3.5" />
            <span>Multi-Exchange Connectivity</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t.exchangesMenu.title}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-2">
            {t.exchangesMenu.subtitle}
          </p>
        </div>

        {/* GRID VERTICAL / HORIZONTAL DE EXCHANGES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {venues.map((venue, idx) => (
            <div 
              key={idx}
              className="p-4 rounded-2xl bg-white/70 hover:bg-white/95 border border-slate-100 hover:border-blue-200 transition-all shadow-xs group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {venue.name}
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                  {venue.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mb-3">{venue.type}</p>
              <div className="flex items-center justify-between text-[11px] font-mono pt-2 border-t border-slate-100 text-slate-500">
                <span>{venue.api}</span>
                <span className="font-bold text-blue-600">{venue.latency}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
