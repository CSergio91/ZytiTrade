import React from 'react';
import { translations, Language } from '../i18n/translations';

interface FooterProps {
  currentLang: Language;
}

export const Footer: React.FC<FooterProps> = ({ currentLang }) => {
  const t = translations[currentLang].footer;

  return (
    <footer className="relative z-10 border-t border-slate-200/80 bg-white/70 backdrop-blur-md py-12 px-4 sm:px-6 lg:px-8 mt-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <img src="/logo-zyti.png" alt="ZYTI Trade Logo" className="w-8 h-8 object-contain" />
          <div className="flex flex-col">
            <span className="text-base font-bold text-slate-900">ZYTI TRADE</span>
            <span className="text-xs text-slate-500">{t.tagline}</span>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs font-semibold text-slate-600">
          <a href="/sitemap.xml" className="hover:text-blue-600 transition-colors">Sitemap</a>
          <a href="#" className="hover:text-blue-600 transition-colors">{t.privacy}</a>
          <a href="#" className="hover:text-blue-600 transition-colors">{t.terms}</a>
          <a href="#" className="hover:text-blue-600 transition-colors">{t.apiDocs}</a>
          <span className="flex items-center gap-1.5 text-emerald-600 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            {t.status}
          </span>
        </div>

        <p className="text-xs text-slate-400">
          © {new Date().getFullYear()} ZYTI Trade. {t.rights}
        </p>
      </div>
    </footer>
  );
};
