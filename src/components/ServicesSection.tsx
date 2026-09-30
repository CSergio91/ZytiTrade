import React from 'react';
import { ArrowRight } from 'lucide-react';
import { translations, Language } from '../i18n/translations';

interface ServicesSectionProps {
  currentLang: Language;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ currentLang }) => {
  const isEs = currentLang === 'es';

  const services = [
    {
      num: '01',
      title: isEs ? 'Pasarela para Prop Firms' : 'Prop Firm Gateway',
      desc: isEs 
        ? 'Aprovisionamiento de cuentas vía REST API y Webhooks en tiempo real para auditorías de drawdown y challenges.'
        : 'API account provisioning & real-time Webhooks for risk auditors, challenges and evaluations.',
    },
    {
      num: '02',
      title: isEs ? 'Trading MultiExchange' : 'Multi-Exchange Trading',
      desc: isEs
        ? 'Unifica balances, órdenes abiertas y posiciones de múltiples cuentas en una interfaz sin fricciones.'
        : 'Consolidate balances, open orders and positions across venues into a single clean workspace.',
    },
    {
      num: '03',
      title: isEs ? 'Copy Trading entre Exchanges' : 'Cross-Venue Copy Trading',
      desc: isEs
        ? 'Replica operaciones de Binance a Bybit u OKX en menos de 5ms utilizando claves cifradas en local.'
        : 'Replicate trades from Binance to Bybit or OKX under 5ms using local encrypted API keys.',
    },
    {
      num: '04',
      title: isEs ? 'Arbitraje Algorítmico' : 'Algorithmic Arbitrage',
      desc: isEs
        ? 'Detección de spreads cruzados y ejecución sincronizada de dos patas en tiempo real.'
        : 'Cross-market price discrepancy detection with synchronized execution in real time.',
    },
  ];

  return (
    <section id="download" className="py-20 px-6 lg:px-12 max-w-7xl mx-auto border-t border-[#ede8df] dark:border-[#1f293d]">
      <div className="max-w-xl mb-12">
        <h2 className="text-3xl font-black text-slate-950 dark:text-white tracking-tight">
          {isEs ? 'Todo el ecosistema en un solo lugar.' : 'The complete ecosystem in one place.'}
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">
          {isEs 
            ? 'Diseñado para eliminar la sobrecarga de herramientas y darte una terminal limpia y predecible.'
            : 'Designed to eliminate tool overload and give you a clean, predictable trading experience.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {services.map((srv, idx) => (
          <div 
            key={idx}
            className="warm-card rounded-3xl p-6 flex flex-col justify-between hover:border-slate-400 transition-colors"
          >
            <div>
              <span className="text-xs font-mono font-bold text-slate-400">
                {srv.num}
              </span>
              <h3 className="text-lg font-bold text-slate-950 dark:text-white mt-3">
                {srv.title}
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                {srv.desc}
              </p>
            </div>

            <div className="mt-8 flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white cursor-pointer hover:gap-2 transition-all">
              <span>{isEs ? 'Conocer más' : 'Learn more'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
