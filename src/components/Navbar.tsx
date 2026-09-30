import React, { useState } from 'react';
import { 
  Globe, 
  Sun,
  Moon,
  ChevronDown
} from 'lucide-react';
import { translations, Language } from '../i18n/translations';

interface NavbarProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
  activeSection: number;
  onNavigateSection: (index: number) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  currentLang, 
  onLanguageChange, 
  theme, 
  onThemeToggle,
  activeSection,
  onNavigateSection
}) => {
  const [exchangeOpen, setExchangeOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const t = translations[currentLang];
  const isLight = theme === 'light';
  const isCompact = activeSection > 0;

  const sections = [
    { id: 0, label: currentLang === 'es' ? 'Terminal' : 'Terminal', short: '01' },
    { id: 1, label: t.nav.exchanges, short: '02' },
    { id: 2, label: t.nav.services, short: '03' },
  ];

  return (
    <header 
      className={`fixed z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isCompact
          ? 'top-4 left-6 w-auto max-w-fit h-13 px-3.5 py-1.5 rounded-2xl flex flex-row items-center gap-3.5 shadow-xl border ' +
            (isLight ? 'bg-white/95 border-[#ede8df] text-slate-900 shadow-slate-200/50 backdrop-blur-md' : 'bg-[#111726]/95 border-[#1f293d] text-white shadow-black/50 backdrop-blur-md')
          : 'top-0 left-0 right-0 w-full h-20 px-6 lg:px-12 flex flex-row items-center justify-between border-none ' +
            (isLight ? 'bg-[#fbf9f4]/95 text-slate-900 backdrop-blur-md' : 'bg-[#0a0d14]/95 text-white backdrop-blur-md')
      }`}
    >
      
      {/* 1. LOGO */}
      <button 
        onClick={() => onNavigateSection(0)}
        className="flex items-center gap-2.5 border-none bg-transparent cursor-pointer p-0 shrink-0"
        title="Inicio"
      >
        <img 
          src="/logo-zyti.png" 
          alt="ZYTI Trade Logo" 
          className={`object-contain transition-all duration-300 ${isCompact ? 'w-7 h-7' : 'w-10 h-10'}`}
        />
        {!isCompact && (
          <span className={`text-2xl font-black tracking-tight ${isLight ? 'text-slate-950' : 'text-white'}`}>
            ZYTI <span className={`font-light ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Trade</span>
          </span>
        )}
      </button>

      {/* 2. NAVEGADOR HORIZONTAL (Píldoras compactas o completas) */}
      <div className={`flex items-center gap-1.5 transition-all duration-300 ${
        isCompact 
          ? 'p-0.5 rounded-xl bg-[#f4efe5]/60 dark:bg-slate-900/60' 
          : 'p-1 rounded-2xl bg-[#ede8df]/60 dark:bg-slate-900/60 border border-[#ede8df] dark:border-slate-800'
      }`}>
        {sections.map((sec) => (
          <button
            key={sec.id}
            onClick={() => onNavigateSection(sec.id)}
            className={`rounded-lg text-xs font-bold transition-all cursor-pointer ${
              isCompact ? 'px-2.5 py-1' : 'px-3.5 py-1.5'
            } ${
              activeSection === sec.id
                ? (isLight ? 'bg-white text-slate-950 shadow-xs' : 'bg-slate-800 text-white shadow-xs')
                : (isLight ? 'text-slate-600 hover:text-slate-950 hover:bg-white/50' : 'text-slate-400 hover:text-white hover:bg-slate-800/50')
            }`}
          >
            {isCompact ? sec.short : `${sec.short} ${sec.label}`}
          </button>
        ))}
      </div>

      {/* 3. ACCIONES HORIZONTALES (THEME TOGGLE + IDIOMA + SIGN IN) */}
      <div className="flex items-center gap-2 shrink-0">
        
        {/* THEME TOGGLE */}
        <button
          onClick={onThemeToggle}
          aria-label="Toggle Theme"
          className={`rounded-xl border transition-colors cursor-pointer flex items-center justify-center ${
            isCompact ? 'p-1.5' : 'p-2.5'
          } ${
            isLight 
              ? 'bg-white border-[#ede8df] text-amber-500 hover:bg-[#f4efe5]' 
              : 'bg-[#151d2e] border-[#23304a] text-slate-200 hover:bg-slate-800'
          }`}
        >
          {isLight ? (
            <Sun className={`fill-amber-500 text-amber-500 ${isCompact ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
          ) : (
            <Moon className={`text-blue-400 ${isCompact ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
          )}
        </button>

        {/* SELECTOR IDIOMA */}
        <div className="relative">
          <button 
            onClick={() => setLangOpen(!langOpen)}
            className={`flex items-center gap-1 rounded-xl border transition-colors cursor-pointer ${
              isCompact ? 'px-2 py-1 text-[11px] font-bold font-mono' : 'px-3 py-2 text-xs font-bold'
            } ${
              isLight 
                ? 'bg-white border-[#ede8df] text-slate-900 hover:bg-[#f4efe5]' 
                : 'bg-[#151d2e] border-[#23304a] text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Globe className={`${isCompact ? 'w-3 h-3' : 'w-3.5 h-3.5'} ${isLight ? 'text-slate-600' : 'text-slate-400'}`} />
            <span>{currentLang.toUpperCase()}</span>
          </button>

          {langOpen && (
            <div className={`absolute top-full mt-2 w-32 rounded-xl p-1 shadow-2xl z-50 border ${
              isCompact ? 'left-0' : 'right-0'
            } ${
              isLight ? 'bg-white border-[#ede8df]' : 'bg-[#111726] border-[#1f293d]'
            }`}>
              <button
                onClick={() => { onLanguageChange('es'); setLangOpen(false); }}
                className={'w-full text-left px-3 py-1.5 text-xs font-bold rounded-lg flex items-center justify-between cursor-pointer ' + (currentLang === 'es' ? 'bg-slate-900 text-white' : (isLight ? 'hover:bg-[#f4efe5] text-slate-900' : 'hover:bg-slate-800 text-slate-200'))}
              >
                <span>Español</span>
                {currentLang === 'es' && <span className="text-[10px]">✓</span>}
              </button>
              <button
                onClick={() => { onLanguageChange('en'); setLangOpen(false); }}
                className={'w-full text-left px-3 py-1.5 text-xs font-bold rounded-lg flex items-center justify-between cursor-pointer ' + (currentLang === 'en' ? 'bg-slate-900 text-white' : (isLight ? 'hover:bg-[#f4efe5] text-slate-900' : 'hover:bg-slate-800 text-slate-200'))}
              >
                <span>English</span>
                {currentLang === 'en' && <span className="text-[10px]">✓</span>}
              </button>
            </div>
          )}
        </div>

        {/* BOTÓN SIGN IN (Visible solo en header expandido para mantener la cápsula compacta) */}
        {!isCompact && (
          <button className={`px-5 py-2.5 text-sm font-bold rounded-xl border transition-all cursor-pointer ${
            isLight 
              ? 'bg-white border-slate-900 text-slate-950 hover:bg-slate-900 hover:text-white' 
              : 'bg-transparent border-slate-700 text-white hover:bg-white/10'
          }`}>
            {t.nav.signIn}
          </button>
        )}
      </div>

    </header>
  );
};
