import React from 'react';
import { Download, Monitor, Apple, Terminal as LinuxIcon, Smartphone, Globe, ArrowUpRight } from 'lucide-react';
import { translations, Language } from '../i18n/translations';

interface DownloadSectionProps {
  currentLang: Language;
  isActive: boolean;
}

export const DownloadSection: React.FC<DownloadSectionProps> = ({ currentLang, isActive }) => {
  const t = translations[currentLang].downloadSection;

  const platforms = [
    {
      icon: Monitor,
      title: t.winTitle,
      desc: t.winDesc,
      format: '.exe (x64 / ARM64)',
      action: t.btnDownload,
      isPrimary: true,
    },
    {
      icon: Apple,
      title: t.macTitle,
      desc: t.macDesc,
      format: '.dmg (Universal M1-M4/Intel)',
      action: t.btnDownload,
      isPrimary: false,
    },
    {
      icon: LinuxIcon,
      title: t.linuxTitle,
      desc: t.linuxDesc,
      format: '.AppImage / .deb',
      action: t.btnDownload,
      isPrimary: false,
    },
    {
      icon: Smartphone,
      title: t.androidTitle,
      desc: t.androidDesc,
      format: 'APK Oficial v2.4.0',
      action: t.btnDownload,
      isPrimary: true,
    },
    {
      icon: Globe,
      title: t.webTitle,
      desc: t.webDesc,
      format: 'PWA WebGL 60 FPS',
      action: t.btnLaunch,
      isPrimary: false,
    },
  ];

  return (
    <section className="min-w-full w-screen h-screen flex items-center justify-center snap-center px-6 lg:px-12 pt-16">
      <div className="w-full max-w-7xl mx-auto">
        
        {/* CABECERA EDITORIAL */}
        <div className={`max-w-2xl mb-8 transition-all duration-500 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f4edd9] dark:bg-[#252014] text-[#855e15] dark:text-[#f3c86a] text-xs font-mono font-bold tracking-tight mb-3">
            <Download className="w-3.5 h-3.5" />
            <span>{t.tag}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-950 dark:text-white tracking-tight">
            {t.title}
          </h2>
          <p className="text-sm text-slate-800 dark:text-slate-200 font-medium mt-2 leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* 5 PLATAFORMAS EN GRID ADAPTATIVO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {platforms.map((plat, idx) => {
            const Icon = plat.icon;
            return (
              <div
                key={idx}
                style={{ animationDelay: `${idx * 60}ms` }}
                className={`warm-card rounded-3xl p-5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:border-slate-500 shadow-sm ${
                  isActive ? 'animate-card-in' : 'opacity-0'
                }`}
              >
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-[#f4ede0] dark:bg-[#1a2233] flex items-center justify-center text-slate-950 dark:text-blue-400 mb-3">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-950 dark:text-white tracking-tight mb-1">
                    {plat.title}
                  </h3>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-snug font-medium mb-3">
                    {plat.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#ede8df] dark:border-[#20293d]">
                  <span className="block text-[10px] font-mono text-slate-500 mb-2 font-bold">
                    {plat.format}
                  </span>
                  <button 
                    className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      plat.isPrimary
                        ? 'bg-slate-950 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200'
                        : 'bg-[#ede5d6] hover:bg-[#e4dcce] text-slate-950 dark:bg-[#20293d] dark:hover:bg-[#2b3650] dark:text-white'
                    }`}
                  >
                    <span>{plat.action}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
