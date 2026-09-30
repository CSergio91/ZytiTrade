import React, { useState } from 'react';
import { Check, Sparkles, CreditCard, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
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

  // Mostramos los 3 planes fundamentales: Starter ($0), Pro Trader y Institutional Desk (Más Popular)
  const displayPlans = t.plans.filter(p => p.id !== 'enterprise').slice(0, 3);

  return (
    <section className="min-w-full w-screen h-[100dvh] flex flex-col justify-start lg:justify-center snap-center px-4 sm:px-6 lg:px-10 xl:px-12 pt-14 sm:pt-16 lg:pt-18 pb-3 lg:pb-5 overflow-y-auto no-scrollbar">
      <div className="w-full max-w-7xl mx-auto">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* LADO IZQUIERDO (4 COLUMNAS): CABECERA + ANIMACIÓN LOTTIE GRANDE + TOGGLE PRO */}
          <div className={`lg:col-span-4 flex flex-col justify-between transition-all duration-500 ${
            isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}>
            <div>
              {/* BADGE DE SECCIÓN */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f4edd9] text-[#855e15] text-xs font-mono font-bold tracking-tight mb-3">
                <CreditCard className="w-3.5 h-3.5" />
                <span>{t.tag}</span>
              </div>

              {/* TÍTULO Y SUBTÍTULO */}
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 tracking-tight leading-tight">
                {t.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-900 font-medium mt-2 leading-relaxed">
                {t.subtitle}
              </p>

              {/* TOGGLE PRO MENSUAL / ANUAL DE ALTO RENDIMIENTO */}
              <div className="mt-5 p-1.5 rounded-2xl bg-[#ede5d6]/80 border border-slate-300 shadow-inner flex items-center gap-1.5 w-fit">
                <button
                  type="button"
                  onClick={() => setIsAnnual(false)}
                  className={`billing-toggle-btn px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    !isAnnual ? 'active' : 'inactive'
                  }`}
                >
                  <span className="!text-current">{t.monthlyLabel}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsAnnual(true)}
                  className={`billing-toggle-btn px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                    isAnnual ? 'active' : 'inactive'
                  }`}
                >
                  <span className="!text-current">{t.annualLabel}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500 !text-white font-mono font-black shadow-sm">
                    -20%
                  </span>
                </button>
              </div>
            </div>

            {/* ANIMACIÓN LOTTIE OFICIAL DE PRECIOS GRANDE (MISMA ÁREA Y JERARQUÍA QUE EN EXCHANGE) */}
            <div className="mt-2 sm:mt-2.5 flex items-center justify-center bg-transparent border-none">
              <LottieAnimation 
                animationData={pricingAnimationData} 
                className="w-14 h-14 sm:w-16 sm:h-16 lg:w-28 lg:h-28 xl:w-32 xl:h-32" 
              />
            </div>
          </div>

          {/* LADO DERECHO (8 COLUMNAS): 3 PLANES DE SUSCRIPCIÓN EN GRID EQUILIBRADO */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-5">
            {displayPlans.map((plan, idx) => {
              const price = isAnnual ? plan.priceAnnual : plan.priceMonthly;
              const isCustom = typeof price === 'string';

              return (
                <div
                  key={plan.id}
                  style={{ animationDelay: `${idx * 75}ms` }}
                  className={`warm-card rounded-3xl p-5 sm:p-6 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 shadow-md relative ${
                    plan.isPopular 
                      ? 'border-2 border-indigo-600 shadow-indigo-500/10' 
                      : 'hover:border-slate-500'
                  } ${isActive ? 'animate-card-in' : 'opacity-0'}`}
                >
                  {/* BADGE DESTACADO EN PLAN INSTITUTIONAL */}
                  {plan.isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      <span className="!text-white font-bold">{plan.badge}</span>
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

                    <p className="text-xs text-slate-900 leading-snug font-medium mb-4 min-h-[38px]">
                      {plan.desc}
                    </p>

                    {/* PRECIO */}
                    <div className="pb-4 mb-4 border-t border-b border-[#ede8df] pt-3">
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
                      <span className="text-[10px] font-mono text-slate-600 font-semibold block mt-0.5">
                        {!isCustom && isAnnual 
                          ? (currentLang === 'es' ? 'Facturado anualmente (-20%)' : 'Billed annually (-20%)')
                          : (!isCustom ? (currentLang === 'es' ? 'Facturado mes a mes' : 'Billed monthly') : (currentLang === 'es' ? 'SLA y arquitectura dedicada' : 'Dedicated SLA & setup'))}
                      </span>
                    </div>

                    {/* LISTA DE CARACTERÍSTICAS INSTITUCIONALES */}
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
                    className={`w-full py-2.5 px-4 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      plan.isPopular
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md'
                        : 'bg-slate-950 hover:bg-slate-800 text-white shadow-sm'
                    }`}
                  >
                    <span className="!text-white font-bold">{plan.cta}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
};

export default PricingSection;
