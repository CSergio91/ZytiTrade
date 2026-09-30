import React from 'react';
import { ShieldCheck, Lock, Network, KeyRound, EyeOff, CheckCircle2 } from 'lucide-react';
import { translations, Language } from '../i18n/translations';

interface SecuritySectionProps {
  currentLang: Language;
  isActive: boolean;
}

export const SecuritySection: React.FC<SecuritySectionProps> = ({ currentLang, isActive }) => {
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
    <section className="min-w-full w-screen h-screen flex items-center justify-center snap-center px-6 lg:px-12 pt-16">
      <div className="w-full max-w-7xl mx-auto">
        
        {/* CABECERA EDITORIAL */}
        <div className={`max-w-2xl mb-8 transition-all duration-500 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f4edd9] dark:bg-[#252014] text-[#855e15] dark:text-[#f3c86a] text-xs font-mono font-bold tracking-tight mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t.tag}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-950 dark:text-white tracking-tight">
            {t.title}
          </h2>
          <p className="text-sm text-slate-800 dark:text-slate-200 font-medium mt-2 leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* 4 PILARES INSTITUCIONALES EN GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                style={{ animationDelay: `${idx * 75}ms` }}
                className={`warm-card rounded-3xl p-6 lg:p-7 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:border-slate-500 shadow-sm ${
                  isActive ? 'animate-card-in' : 'opacity-0'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-2xl bg-[#f4ede0] dark:bg-[#1a2233] flex items-center justify-center text-slate-950 dark:text-blue-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-[#ede5d6] dark:bg-[#20293d] text-slate-800 dark:text-slate-300">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-950 dark:text-white mb-2 tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-[#ede8df] dark:border-[#20293d] flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{t.badgeEnclave}</span>
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    Client-Side Hardware Enclave
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
