import React from 'react';
import { ShieldCheck, Layers, Repeat, Zap, ArrowRight } from 'lucide-react';
import { translations, Language } from '../i18n/translations';

interface ServicesSectionProps {
  currentLang: Language;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ currentLang }) => {
  const t = translations[currentLang].servicesMenu;

  const services = [
    {
      title: t.propFirms.title,
      badge: t.propFirms.badge,
      desc: t.propFirms.desc,
      icon: ShieldCheck,
      gradient: 'from-indigo-500 to-purple-600',
    },
    {
      title: t.multiExchange.title,
      badge: t.multiExchange.badge,
      desc: t.multiExchange.desc,
      icon: Layers,
      gradient: 'from-blue-500 to-cyan-600',
    },
    {
      title: t.copyTrading.title,
      badge: t.copyTrading.badge,
      desc: t.copyTrading.desc,
      icon: Repeat,
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      title: t.arbitrage.title,
      badge: t.arbitrage.badge,
      desc: t.arbitrage.desc,
      icon: Zap,
      gradient: 'from-amber-500 to-orange-600',
    },
  ];

  return (
    <section id="services" className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight">
          {t.title}
        </h2>
        <p className="mt-3 text-base text-slate-600 dark:text-slate-300">
          {t.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {services.map((srv, idx) => {
          const IconComp = srv.icon;
          return (
            <div 
              key={idx}
              className="glass-card rounded-3xl p-6 border border-white/90 dark:border-slate-800 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
            >
              <div>
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${srv.gradient} text-white flex items-center justify-center shadow-md mb-5`}>
                  <IconComp className="w-6 h-6" />
                </div>
                <div className="inline-block text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 mb-2">
                  {srv.badge}
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {srv.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  {srv.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:gap-2 transition-all">
                <span>Explorar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
