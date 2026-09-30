import React from 'react';
import { Download, Monitor, Smartphone, Globe, ArrowUpRight, CheckCircle2, ShieldCheck, Cpu } from 'lucide-react';
import { translations, Language } from '../i18n/translations';

interface DownloadSectionProps {
  currentLang: Language;
  isActive: boolean;
}

export const DownloadSection: React.FC<DownloadSectionProps> = ({ currentLang, isActive }) => {
  const t = translations[currentLang].downloadSection;

  const platforms = [
    {
      id: 'windows',
      icon: Monitor,
      title: t.winTitle,
      desc: t.winDesc,
      badge: t.winBadge,
      format: t.winFormat,
      action: t.btnDownload,
      isPrimary: true,
      tag: 'Windows 10 / 11 • x64 & ARM64',
      features: [
        t.winFeature1,
        t.winFeature2,
        t.winFeature3,
      ],
    },
    {
      id: 'android',
      icon: Smartphone,
      title: t.androidTitle,
      desc: t.androidDesc,
      badge: t.androidBadge,
      format: t.androidFormat,
      action: t.btnDownloadApk,
      isPrimary: true,
      tag: 'Android 9.0+ • APK Directo',
      features: [
        t.androidFeature1,
        t.androidFeature2,
        t.androidFeature3,
      ],
    },
    {
      id: 'web',
      icon: Globe,
      title: t.webTitle,
      desc: t.webDesc,
      badge: t.webBadge,
      format: t.webFormat,
      action: t.btnLaunch,
      isPrimary: false,
      tag: 'WebGL 2.0 • Chrome / Edge / Brave',
      features: [
        t.webFeature1,
        t.webFeature2,
        t.webFeature3,
      ],
    },
  ];

  return (
    <section className="min-w-full w-screen h-[100dvh] flex flex-col justify-start lg:items-center lg:justify-center snap-center px-4 sm:px-6 lg:px-12 pt-16 sm:pt-20 lg:pt-24 xl:pt-28 pb-8 lg:pb-12 overflow-y-auto lg:overflow-hidden no-scrollbar">
      <div className="w-full max-w-6xl mx-auto">
        
        {/* CABECERA EDITORIAL */}
        <div className={`max-w-2xl mb-8 transition-all duration-500 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f4edd9] dark:bg-[#252014] text-[#855e15] dark:text-[#f3c86a] text-xs font-mono font-bold tracking-tight mb-3">
            <Download className="w-3.5 h-3.5" />
            <span>{t.tag}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 dark:text-white tracking-tight">
            {t.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-900 dark:text-slate-200 font-medium mt-2 leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* 3 PLATAFORMAS OFICIALES EN GRID 3 COLUMNAS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {platforms.map((plat, idx) => {
            const Icon = plat.icon;
            return (
              <div
                key={plat.id}
                style={{ animationDelay: `${idx * 90}ms` }}
                className={`warm-card rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:border-slate-500 shadow-md ${
                  isActive ? 'animate-card-in' : 'opacity-0'
                }`}
              >
                <div>
                  {/* ICONO Y BADGES SUPERIORES */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#f4ede0] dark:bg-[#1a2233] flex items-center justify-center text-slate-950 dark:text-blue-400">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-md bg-[#ede5d6] dark:bg-[#20293d] text-slate-950 dark:text-slate-200">
                        {plat.badge}
                      </span>
                      <span className="text-[9px] font-mono font-bold text-slate-600 dark:text-slate-400">
                        {plat.format}
                      </span>
                    </div>
                  </div>

                  {/* TITULAR Y DESCRIPCIÓN */}
                  <h3 className="text-lg font-black text-slate-950 dark:text-white tracking-tight mb-2">
                    {plat.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-900 dark:text-slate-300 leading-relaxed font-medium mb-5">
                    {plat.desc}
                  </p>

                  {/* LISTA DE CAPACIDADES / ESPECIFICACIONES */}
                  <div className="space-y-2.5 mb-6 pt-4 border-t border-[#ede8df] dark:border-[#20293d]">
                    {plat.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-xs font-medium text-slate-900 dark:text-slate-200 leading-snug">
                          {feat}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* BOTÓN DE ACCIÓN Y ESPECIFICACIÓN TÉCNICA */}
                <div className="pt-4 border-t border-[#ede8df] dark:border-[#20293d] flex flex-col gap-2.5">
                  <button 
                    className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                      plat.isPrimary
                        ? 'bg-slate-950 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200'
                        : 'bg-[#ede5d6] hover:bg-[#e4dcce] text-slate-950 dark:bg-[#20293d] dark:hover:bg-[#2b3650] dark:text-white'
                    }`}
                  >
                    {plat.isPrimary ? <Download className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                    <span>{plat.action}</span>
                  </button>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-600 dark:text-slate-400 pt-1">
                    <span>{plat.tag}</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{t.version}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default DownloadSection;
