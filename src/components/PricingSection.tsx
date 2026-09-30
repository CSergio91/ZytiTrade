import React, { useState } from 'react';
import { Check, Sparkles, CreditCard, ArrowRight } from 'lucide-react';
import { translations, Language } from '../i18n/translations';
import { LottieAnimation } from './LottieAnimation';
import pricingAnimationData from '../assets/animations/pricing.json';

interface PricingSectionProps {
  currentLang: Language;
  isActive: boolean;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ currentLang, isActive }) => {
  const [isAnnual, setIsAnnual] = useState(true);
  const t = translations[currentLang].pricingSection;

  return (
    <section className="min-w-full w-screen h-screen flex items-center justify-center snap-center px-6 lg:px-12 pt-16">
      <div className="w-full max-w-7xl mx-auto">
        
        {/* CABECERA EDITORIAL CON ANIMACIÓN LOTTIE OFICIAL */}
        <div className={`flex flex-col md:flex-row md:items-end justify-between gap-6 mb-7 transition-all duration-500 ${
          isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <div className="flex items-center gap-4 sm:gap-6 max-w-2xl">
            {/* ANIMACIÓN LOTTIE OFICIAL DE PRECIOS (100% TRANSPARENTE, SIN CAJAS) */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 flex items-center justify-center bg-transparent border-none">
              <LottieAnimation 
                animationData={pricingAnimationData} 
                className="w-20 h-20 sm:w-24 sm:h-24" 
              />
            </div>

            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f4edd9] text-[#855e15] text-xs font-mono font-bold tracking-tight mb-2">
                <CreditCard className="w-3.5 h-3.5" />
                <span>{t.tag}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight leading-tight">
                {t.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-900 font-medium mt-1.5 leading-relaxed">
                {t.subtitle}
              </p>
            </div>
          </div>

          {/* TOGGLE MENSUAL / ANUAL */}
          <div className="flex items-center gap-3 p-1.5 rounded-2xl warm-card border border-slate-300 self-start md:self-end shrink-0 shadow-sm">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                !isAnnual
                  ? 'bg-slate-950 text-white shadow-sm'
                  : 'text-slate-800 hover:text-slate-950'
              }`}
            >
              {t.monthlyLabel}
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                isAnnual
                  ? 'bg-slate-950 text-white shadow-sm'
                  : 'text-slate-800 hover:text-slate-950'
              }`}
            >
              <span>{t.annualLabel}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500 text-white font-mono font-bold">
                -20%
              </span>
            </button>
          </div>
        </div>

        {/* 4 CARDS DE PLANES DE SUSCRIPCIÓN EN GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {t.plans.map((plan, idx) => {
            const price = isAnnual ? plan.priceAnnual : plan.priceMonthly;
            const isCustom = typeof price === 'string';

            return (
              <div
                key={plan.id}
                style={{ animationDelay: `${idx * 60}ms` }}
                className={`warm-card rounded-3xl p-5 sm:p-6 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 shadow-sm relative ${
                  plan.isPopular 
                    ? 'border-2 border-indigo-600 shadow-indigo-500/10' 
                    : 'hover:border-slate-400'
                } ${isActive ? 'animate-card-in' : 'opacity-0'}`}
              >
                {/* BADGE DESTACADO */}
                {plan.isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
                    <Sparkles className="w-3 h-3" />
                    <span>{plan.badge}</span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-black text-slate-950 tracking-tight">
                      {plan.name}
                    </h3>
                    {!plan.isPopular && (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#ede5d6] text-slate-900">
                        {plan.badge}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-800 leading-snug font-medium mb-4 min-h-[36px]">
                    {plan.desc}
                  </p>

                  {/* PRECIO */}
                  <div className="pb-4 mb-4 border-b border-[#ede8df]">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
                        {isCustom ? price : `$${price}`}
                      </span>
                      {!isCustom && (
                        <span className="text-xs font-mono text-slate-700 font-bold">
                          {t.perMonth}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-slate-600 font-semibold">
                      {!isCustom && isAnnual 
                        ? (currentLang === 'es' ? 'Facturado anualmente' : 'Billed annually')
                        : (!isCustom ? (currentLang === 'es' ? 'Facturado mes a mes' : 'Billed monthly') : (currentLang === 'es' ? 'SLA y arquitectura dedicada' : 'Dedicated SLA & setup'))}
                    </span>
                  </div>

                  {/* LISTA DE CARACTERÍSTICAS */}
                  <ul className="flex flex-col gap-2.5 mb-6">
                    {plan.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2 text-xs">
                        <div className="w-4 h-4 rounded-full bg-[#dcfce7] text-[#16a34a] flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span className="text-slate-900 font-medium leading-tight">
                          {feat}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* BOTÓN CTA */}
                <button
                  className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    plan.isPopular
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md'
                      : 'bg-slate-950 hover:bg-slate-800 text-white'
                  }`}
                >
                  <span>{plan.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default PricingSection;
