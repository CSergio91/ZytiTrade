import React from 'react';
import { ShieldCheck, Zap, ArrowRight, Lock, Network, KeyRound, EyeOff, CheckCircle2 } from 'lucide-react';
import { translations, Language } from '../i18n/translations';
import { LottieAnimation } from './LottieAnimation';
import securityShieldData from '../assets/animations/security-shield.json';

interface SecuritySectionProps {
  currentLang: Language;
  isActive: boolean;
  onOpenAuth?: () => void;
}

export const SecuritySection: React.FC<SecuritySectionProps> = ({ currentLang, isActive, onOpenAuth }) => {
  const t = translations[currentLang].securitySection;

  const pillars = [
    {
      icon: Lock,
      title: t.p1Title,
      desc: t.p1Desc,
      badge: 'AES-GCM 256',
    },
    {
      icon: Network,
      title: t.p2Title,
      desc: t.p2Desc,
      badge: 'Zero Middleman',
    },
    {
      icon: KeyRound,
      title: t.p3Title,
      desc: t.p3Desc,
      badge: 'Zero Custody',
    },
    {
      icon: EyeOff,
      title: t.p4Title,
      desc: t.p4Desc,
      badge: 'Zero Telemetry',
    },
  ];

  return (
    <section className="min-w-full w-screen h-[100dvh] flex flex-col justify-start lg:justify-center snap-center px-4 sm:px-6 lg:px-10 xl:px-12 pt-16 sm:pt-18 lg:pt-20 pb-2 sm:pb-3 overflow-y-auto no-scrollbar">
      <div className="w-full max-w-7xl mx-auto">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* LADO IZQUIERDO: CABECERA EDITORIAL + ANIMACIÓN LOTTIE OFICIAL DE SEGURIDAD */}
          <div className={`lg:col-span-5 flex flex-col justify-between transition-all duration-500 ${
            isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}>
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f4edd9] dark:bg-[#252014] text-[#855e15] dark:text-[#f3c86a] text-xs font-mono font-bold tracking-tight mb-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{t.tag}</span>
              </div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-slate-950 dark:text-white tracking-tight leading-tight">
                {t.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-900 dark:text-slate-200 font-medium mt-2 leading-relaxed">
                {t.subtitle}
              </p>
            </div>

            {/* ANIMACIÓN LOTTIE OFICIAL (ESCUDO Y ENCLAVE SEGURO, 100% TRANSPARENTE) */}
            <div className="mt-2 sm:mt-2.5 flex items-center justify-center bg-transparent border-none">
              <LottieAnimation 
                animationData={securityShieldData} 
                className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 xl:w-20 xl:h-20" 
              />
            </div>

            {/* BOTÓN CTA ACTIVO */}
            <div className="mt-2 sm:mt-2.5 flex items-center">
              <button onClick={onOpenAuth} type="button" className="flex items-center justify-center gap-2.5 px-6 py-3 text-xs sm:text-sm font-black text-slate-950 bg-[#eab308] hover:bg-[#ca8a04] rounded-2xl shadow-sm transition-all duration-150 cursor-pointer transform hover:scale-105 active:scale-95 w-full sm:w-auto"
              >
                <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                <span>{currentLang === 'es' ? 'Operar Ahora' : 'Trade Now'}</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* LADO DERECHO: 4 PILARES INSTITUCIONALES EN GRID 2x2 */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            {pillars.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  style={{ animationDelay: `${idx * 75}ms` }}
                  className={`warm-card rounded-3xl p-5 sm:p-6 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:border-slate-500 shadow-md ${
                    isActive ? 'animate-card-in' : 'opacity-0'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#f4ede0] dark:bg-[#1a2233] flex items-center justify-center text-slate-950 dark:text-blue-400">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#ede5d6] dark:bg-[#20293d] text-slate-900 dark:text-slate-300">
                        {item.badge}
                      </span>
                    </div>

                    <h3 className="text-base font-black text-slate-950 dark:text-white mb-1.5 tracking-tight">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-900 dark:text-slate-300 leading-relaxed font-medium">
                      {item.desc}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{t.badgeEnclave}</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400">
                      Client-Side Hardware Enclave
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
};

export default SecuritySection;
