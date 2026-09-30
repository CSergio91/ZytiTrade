import React from 'react';
import { ArrowRight, Layers, Zap } from 'lucide-react';
import { translations, Language } from '../i18n/translations';
import { LottieAnimation } from './LottieAnimation';
import servicesAnimationData from '../assets/animations/services-network.json';

interface ServicesSectionProps {
  currentLang: Language;
  isActive: boolean;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ currentLang, isActive }) => {
  const t = translations[currentLang].servicesSection;
  const srv = translations[currentLang].servicesMenu;

  const services = [
    { num: '01', title: srv.propFirms.title, desc: srv.propFirms.desc, delay: '0ms' },
    { num: '02', title: srv.multiExchange.title, desc: srv.multiExchange.desc, delay: '60ms' },
    { num: '03', title: srv.copyTrading.title, desc: srv.copyTrading.desc, delay: '120ms' },
    { num: '04', title: srv.arbitrage.title, desc: srv.arbitrage.desc, delay: '180ms' },
  ];

  return (
    <section className="min-w-full w-screen h-[100dvh] flex flex-col justify-start lg:justify-center snap-center px-4 sm:px-6 lg:px-12 pt-20 sm:pt-24 lg:pt-16 pb-12 overflow-y-auto no-scrollbar">
      <div className="w-full max-w-7xl mx-auto">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* LADO IZQUIERDO: CABECERA EDITORIAL + ANIMACIÓN LOTTIE OFICIAL DE SERVICIOS */}
          <div className={`lg:col-span-5 flex flex-col justify-between transition-all duration-500 ${
            isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f4edd9] dark:bg-[#252014] text-[#855e15] dark:text-[#f3c86a] text-xs font-mono font-bold tracking-tight mb-3">
                <Layers className="w-3.5 h-3.5" />
                <span>{t.tag || '/soluciones-institucionales'}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 dark:text-white tracking-tight leading-tight">
                {t.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-900 dark:text-slate-200 font-medium mt-2 leading-relaxed">
                {t.subtitle}
              </p>
            </div>

            {/* ANIMACIÓN LOTTIE REUTILIZABLE (100% TRANSPARENTE, SIN TEXTOS NI FONDOS OPACOS) */}
            <div className="mt-3 flex items-center justify-center bg-transparent border-none">
              <LottieAnimation 
                animationData={servicesAnimationData} 
                className="w-28 h-28 sm:w-36 sm:h-36 lg:w-52 lg:h-52" 
              />
            </div>

            {/* BOTÓN CTA ACTIVO */}
            <div className="mt-3 flex items-center">
              <button 
                className="flex items-center justify-center gap-2.5 px-6 py-3 text-xs sm:text-sm font-black text-slate-950 bg-[#eab308] hover:bg-[#ca8a04] rounded-2xl shadow-sm transition-all duration-150 cursor-pointer transform hover:scale-105 active:scale-95 w-full sm:w-auto"
              >
                <Zap className="w-4 h-4 stroke-[2.5] fill-slate-950" />
                <span>{currentLang === 'es' ? 'Operar Ahora' : 'Trade Now'}</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* LADO DERECHO: GRID 2x2 DE LOS 4 SERVICIOS CLAVE */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {services.map((s, idx) => (
              <div 
                key={idx}
                style={{ animationDelay: s.delay }}
                className={`warm-card rounded-3xl p-6 flex flex-col justify-between hover:border-slate-500 transition-all duration-200 hover:-translate-y-1 shadow-md ${
                  isActive ? 'animate-card-in' : 'opacity-0'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-black text-slate-900 dark:text-white">
                      {s.num}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-slate-950 dark:text-white mt-1 tracking-tight">
                    {s.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-900 dark:text-slate-300 font-medium mt-2 leading-relaxed">
                    {s.desc}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-slate-950 dark:text-white group cursor-pointer">
                  <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {t.learnMore}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};

export default ServicesSection;
