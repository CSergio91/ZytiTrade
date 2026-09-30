import React from 'react';
import { Activity, ShieldCheck } from 'lucide-react';
import { translations, Language } from '../i18n/translations';
import { ExchangeLogo } from './ExchangeLogo';
import { ExchangeLottie } from './ExchangeLottie';

interface ExchangesSectionProps {
  currentLang: Language;
  isActive: boolean;
}

export const ExchangesSection: React.FC<ExchangesSectionProps> = ({ currentLang, isActive }) => {
  const t = translations[currentLang].exchangesSection;
  const isEs = currentLang === 'es';

  // 15 Exchanges organizados en 3 columnas de exactamente 5 exchanges cada una
  const columns = [
    // COLUMNA 1 (5 Exchanges Tier-1 Principales)
    [
      { name: 'Binance', type: isEs ? 'Spot & Futuros USD-M' : 'Spot & USD-M Futures', latency: '1.2ms' },
      { name: 'Bybit', type: isEs ? 'Perpetuos USDT API v5' : 'USDT Perpetuals API v5', latency: '1.8ms' },
      { name: 'OKX', type: isEs ? 'Swaps & Opciones' : 'Swaps & Options', latency: '2.1ms' },
      { name: 'Kraken', type: isEs ? 'Spot EUR/USD Banking' : 'EUR/USD Banking Spot', latency: '3.4ms' },
      { name: 'Coinbase Advanced', type: isEs ? 'Liquidez Institucional Prime' : 'Prime Institutional Liquidity', latency: '4.2ms' },
    ],
    // COLUMNA 2 (5 Exchanges Derivados y Copy Trading)
    [
      { name: 'Bitget', type: isEs ? 'Derivados & Copy Trading API' : 'Derivatives & Copy API', latency: '2.0ms' },
      { name: 'KuCoin', type: isEs ? 'Más de 700 Altcoins' : '700+ Altcoin Markets', latency: '2.8ms' },
      { name: 'Gate.io', type: isEs ? 'Mercados Globales y Spot' : 'Global Spot Markets', latency: '3.1ms' },
      { name: 'BingX', type: isEs ? 'Contratos Estándar & Perpetuos' : 'Standard & Perpetual Contracts', latency: '2.4ms' },
      { name: 'MEXC Global', type: isEs ? 'Cero Comisiones en Spot' : 'Zero Fee Spot Markets', latency: '2.9ms' },
    ],
    // COLUMNA 3 (5 Exchanges Descentralizados y Alta Frecuencia)
    [
      { name: 'dYdX v4', type: isEs ? 'Perpetuos On-Chain Cosmos' : 'On-Chain Cosmos Perpetuals', latency: '1.9ms' },
      { name: 'Hyperliquid', type: isEs ? 'L1 Nativa para Derivados' : 'Native L1 for Derivatives', latency: '1.1ms' },
      { name: 'Vertex Protocol', type: isEs ? 'Orderbook Híbrido Arbitrum' : 'Hybrid Arbitrum Orderbook', latency: '1.5ms' },
      { name: 'Bitfinex', type: isEs ? 'Libro de Órdenes Profundo' : 'Deep Institutional Orderbook', latency: '3.6ms' },
      { name: 'Prop Firms Direct', type: isEs ? 'Pasarela de Evaluación & Fondeo' : 'Evaluation & Prop Gateway', latency: '0.8ms' },
    ]
  ];

  return (
    <section className="min-w-full w-screen h-screen flex items-center justify-center snap-center px-6 lg:px-12 pt-16">
      <div className="w-full max-w-7xl mx-auto">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* LADO IZQUIERDO: CABECERA + ANIMACIÓN LOTTIE DEL RADAR DE ENRUTAMIENTO */}
          <div className={`lg:col-span-4 flex flex-col justify-between transition-all duration-500 ${
            isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f4edd9] dark:bg-[#252014] text-[#855e15] dark:text-[#f3c86a] text-xs font-mono font-bold tracking-tight mb-3">
                <Activity className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                <span>{t.tag || '/venues-conectados'}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-950 dark:text-white tracking-tight leading-tight">
                {t.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium mt-2 leading-relaxed">
                {t.subtitle}
              </p>
            </div>

            {/* TARJETA RADAR LOTTIE */}
            <div className="mt-6 warm-card rounded-3xl p-5 flex flex-col items-center justify-center relative overflow-hidden shadow-lg border border-[#ede8df] dark:border-[#1f293d]">
              <div className="w-full flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  ● Multi-Venue WSS
                </span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                  60 FPS
                </span>
              </div>

              <div className="w-48 h-44 flex items-center justify-center">
                <ExchangeLottie className="w-40 h-40" />
              </div>

              <div className="w-full pt-3 border-t border-[#ede8df] dark:border-[#1f293d] flex items-center justify-between text-xs font-mono">
                <span className="text-slate-700 dark:text-slate-300 font-bold">15 Conectores</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">&lt; 1.5ms avg</span>
              </div>
            </div>
          </div>

          {/* LADO DERECHO: 3 COLUMNAS DE EXACTAMENTE 5 EXCHANGES CADA UNA */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {columns.map((col, colIdx) => (
              <div key={colIdx} className="flex flex-col gap-2.5">
                {col.map((venue, idx) => (
                  <div 
                    key={idx}
                    style={{ animationDelay: `${(colIdx * 5 + idx) * 30}ms` }}
                    className={`warm-card rounded-2xl px-4 py-3 flex items-center justify-between hover:border-slate-500 transition-all duration-200 hover:-translate-y-0.5 shadow-sm ${
                      isActive ? 'animate-card-in' : 'opacity-0'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center shrink-0 border border-slate-200/60 dark:border-slate-700/60">
                        <ExchangeLogo name={venue.name} size={18} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-950 dark:text-white truncate">{venue.name}</span>
                          <span className="text-[8px] font-mono font-bold text-[#65a30d] bg-[#f4edd9] dark:bg-[#1a2512] px-1 py-0.5 rounded">
                            {t.connected}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-700 dark:text-slate-300 font-medium truncate">{venue.type}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-slate-950 dark:text-white shrink-0 ml-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{venue.latency}</span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};
