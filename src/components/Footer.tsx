import React from 'react';
import { Language } from '../i18n/translations';

interface FooterProps {
  currentLang: Language;
}

export const Footer: React.FC<FooterProps> = ({ currentLang }) => {
  return (
    <footer className="border-t border-[#ede8df] dark:border-[#1f293d] bg-[#fbf9f4] dark:bg-[#0a0d14] py-12 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-800 dark:text-slate-300 font-medium">
        <div className="flex items-center gap-3">
          <img src="/logo-zyti.png" alt="ZYTI Trade Logo" className="w-7 h-7 object-contain" />
          <span className="font-bold text-slate-950 dark:text-white">ZYTI Trade</span>
          <span>•</span>
          <span>Institutional Trading OS</span>
        </div>

        <div className="flex items-center gap-6">
          <a href="/sitemap.xml" className="hover:text-slate-950 dark:hover:text-white transition-colors">Sitemap</a>
          <a href="#" className="hover:text-slate-950 dark:hover:text-white transition-colors">Privacidad</a>
          <a href="#" className="hover:text-slate-950 dark:hover:text-white transition-colors">API & Webhooks</a>
          <a href="#" className="hover:text-slate-950 dark:hover:text-white transition-colors">Docs</a>
        </div>

        <p>© {new Date().getFullYear()} ZYTI Trade. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};
