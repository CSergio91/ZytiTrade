import React from 'react';
import { ArrowUp, Activity, ShieldCheck, Terminal, ExternalLink } from 'lucide-react';
import { translations, Language } from '../i18n/translations';

interface FooterSectionProps {
  currentLang: Language;
  isActive: boolean;
  onNavigateSection: (index: number) => void;
}

export const FooterSection: React.FC<FooterSectionProps> = ({ currentLang, isActive, onNavigateSection }) => {
  const t = translations[currentLang].footer;
  const navT = translations[currentLang].nav;

  return (
    <section className="min-w-full w-screen h-[100dvh] flex flex-col justify-end snap-center px-4 sm:px-6 lg:px-12 pb-8 pt-20 sm:pt-24 overflow-y-auto no-scrollbar">
      <div 
        className={`w-full max-w-7xl mx-auto warm-card rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isActive ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-32 opacity-0 scale-95'
        }`}
      >
        
        {/* FILA SUPERIOR: MARCA + VOLVER ARRIBA */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-8 border-b border-[#ede8df] dark:border-[#20293d]">
          <div className="flex items-center gap-3">
            <img src="/logo-zyti.png" alt="ZYTI Trade Logo" className="w-10 h-10 object-contain" />
            <div>
              <span className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">
                ZYTI <span className="font-light text-slate-500">Trade</span>
              </span>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                {t.tagline}
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateSection(0)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#ede5d6] dark:bg-[#1a2233] text-slate-950 dark:text-white text-xs font-bold hover:bg-[#e4dcce] dark:hover:bg-[#25314a] transition-all cursor-pointer border border-[#ded5c5] dark:border-[#29364f]"
          >
            <span>{t.backToTop}</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* CUERPO DEL FOOTER: 4 COLUMNAS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 py-8 border-b border-[#ede8df] dark:border-[#20293d]">
          
          {/* COL 1: FILOSOFÍA NO CUSTODIAL */}
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-950 dark:text-white">
              Arquitectura
            </span>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              {t.zeroCustodyNotice}
            </p>
            <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Zero-Custody Verified</span>
            </div>
          </div>

          {/* COL 2: NAVEGACIÓN DIRECTA */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-950 dark:text-white">
              {t.sectionsTitle}
            </span>
            <button 
              onClick={() => onNavigateSection(0)} 
              className="text-left text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
            >
              {currentLang === 'es' ? 'Inicio / Terminal OS' : 'Home / Terminal OS'}
            </button>
            <button 
              onClick={() => onNavigateSection(1)} 
              className="text-left text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
            >
              {navT.exchanges} (16 Venues)
            </button>
            <button 
              onClick={() => onNavigateSection(2)} 
              className="text-left text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
            >
              {navT.propFirms || 'Prop Firms'} (16 Firmas)
            </button>
            <button 
              onClick={() => onNavigateSection(3)} 
              className="text-left text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
            >
              {navT.services}
            </button>
            <button 
              onClick={() => onNavigateSection(4)} 
              className="text-left text-xs font-medium text-slate-900 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
            >
              {navT.pricing || 'Precios'}
            </button>
            <button 
              onClick={() => onNavigateSection(5)} 
              className="text-left text-xs font-medium text-slate-900 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
            >
              {navT.security}
            </button>
            <button 
              onClick={() => onNavigateSection(6)} 
              className="text-left text-xs font-medium text-slate-900 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
            >
              {navT.download} & Apps
            </button>
          </div>

          {/* COL 3: LEGAL Y CUMPLIMIENTO */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-950 dark:text-white">
              {t.legalTitle}
            </span>
            <a href="/legal/privacy" className="text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              {t.privacy}
            </a>
            <a href="/legal/terms" className="text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              {t.terms}
            </a>
            <a href="/legal/risk" className="text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              {t.risk}
            </a>
            <a href="/sitemap.xml" target="_blank" rel="noreferrer" className="text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              {t.sitemap} (XML)
            </a>
          </div>

          {/* COL 4: STATUS & TELEMETRÍA */}
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-950 dark:text-white">
              {t.statusTitle}
            </span>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{t.statusOnline}</span>
            </div>
            <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
              Uptime: {t.uptime}
            </span>
            <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
              Engine: {t.wsActive}
            </span>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noreferrer"
              className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>{t.apiDocs}</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>

        </div>

        {/* BARRA INFERIOR: COPYRIGHT & YEAR */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-medium text-slate-600 dark:text-slate-400">
          <span>
            © 2026 {t.rights}
          </span>
          <span className="font-mono text-[11px]">
            Zero-Egress • IndexedDB Cache 31,536,000s • KLineChart v10 Native
          </span>
        </div>

      </div>
    </section>
  );
};
