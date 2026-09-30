import React from 'react';
import { ArrowRight } from 'lucide-react';
import { translations, Language } from '../i18n/translations';

interface ServicesSectionProps {
  currentLang: Language;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ currentLang }) => {
  const t = translations[currentLang].servicesSection;
  const srv = translations[currentLang].servicesMenu;

  const services = [
    { num: '01', title: srv.propFirms.title, desc: srv.propFirms.desc },
    { num: '02', title: srv.multiExchange.title, desc: srv.multiExchange.desc },
    { num: '03', title: srv.copyTrading.title, desc: srv.copyTrading.desc },
    { num: '04', title: srv.arbitrage.title, desc: srv.arbitrage.desc },
  ];

  return (
    <section className="min-w-full w-screen h-screen flex items-center justify-center snap-center px-6 lg:px-12 pt-16">
      <div className="w-full max-w-7xl mx-auto animate-zoom-in">
        <div className="max-w-xl mb-10">
          <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-[#f4edd9] dark:bg-[#252014] text-[#855e15] dark:text-[#f3c86a] text-xs font-mono font-bold tracking-tight mb-4">
            /services-and-architecture
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-slate-950 dark:text-white tracking-tight">
            {t.title}
          </h2>
          <p className="text-base text-slate-800 dark:text-slate-200 font-medium mt-3 leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((s, idx) => (
            <div 
              key={idx}
              className="warm-card rounded-3xl p-6 flex flex-col justify-between hover:border-slate-500 transition-all duration-200 hover:-translate-y-1 shadow-lg"
            >
              <div>
                <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                  {s.num}
                </span>
                <h3 className="text-lg font-bold text-slate-950 dark:text-white mt-3">
                  {s.title}
                </h3>
                <p className="text-xs text-slate-800 dark:text-slate-300 font-medium mt-2 leading-relaxed">
                  {s.desc}
                </p>
              </div>

              <div className="mt-8 flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white cursor-pointer hover:gap-2 transition-all">
                <span>{t.learnMore}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
