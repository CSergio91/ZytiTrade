import React, { useState } from 'react';
import { 
  ChevronDown, 
  Globe, 
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight
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

  const sections = [
    { id: 0, label: '01 ' + (currentLang === 'es' ? 'Terminal' : 'Terminal') },
    { id: 1, label: '02 ' + t.nav.exchanges },
    { id: 2, label: '03 ' + t.nav.services },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 w-full z-50 transition-colors duration-200 border-none ${
      isLight 
        ? 'bg-[#fbf9f4]/95 backdrop-blur-md shadow-xs text-slate-900' 
        : 'bg-[#0a0d14]/95 backdrop-blur-md text-white'
    }`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
        
        {/* LOGO */}
        <button 
          onClick={() => onNavigateSection(0)}
          className="flex items-center gap-3 cursor-pointer shrink-0 border-none bg-transparent"
        >
          <img 
            src="/logo-zyti.png" 
            alt="ZYTI Trade Logo" 
            className="w-10 h-10 object-contain"
          />
          <span className={`text-2xl font-black tracking-tight ${isLight ? 'text-slate-950' : 'text-white'}`}>
            ZYTI <span className={`font-light ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Trade</span>
          </span>
        </button>

        {/* NAVEGACIÓN HORIZONTAL EDITORIAL EN EL NAVBAR */}
        <div className="flex items-center gap-2 sm:gap-3 p-1 rounded-2xl bg-[#ede8df]/60 dark:bg-slate-900/60 border border-[#ede8df] dark:border-slate-800">
          {sections.map((sec) => (
            <button
              key={sec.id}
              onClick={() => onNavigateSection(sec.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSection === sec.id
                  ? (isLight ? 'bg-white text-slate-950 shadow-sm' : 'bg-slate-800 text-white shadow-sm')
                  : (isLight ? 'text-slate-600 hover:text-slate-950 hover:bg-white/50' : 'text-slate-400 hover:text-white hover:bg-slate-800/50')
              }`}
            >
              {sec.label}
            </button>
          ))}
        </div>

        {/* ACCIONES DERECHA */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* BOTONES ANTERIOR / SIGUIENTE HORIZONTAL */}
          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={() => onNavigateSection(Math.max(0, activeSection - 1))}
              disabled={activeSection === 0}
              title="Sección Anterior"
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                activeSection === 0 
                  ? 'opacity-30 cursor-not-allowed border-transparent' 
                  : (isLight ? 'bg-white border-[#ede8df] text-slate-800 hover:bg-[#f4efe5]' : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700')
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigateSection(Math.min(2, activeSection + 1))}
              disabled={activeSection === 2}
              title="Sección Siguiente"
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                activeSection === 2 
                  ? 'opacity-30 cursor-not-allowed border-transparent' 
                  : (isLight ? 'bg-white border-[#ede8df] text-slate-800 hover:bg-[#f4efe5]' : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700')
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* THEME TOGGLE */}
          <button
            onClick={onThemeToggle}
            aria-label="Toggle Theme"
            className={`p-2.5 rounded-xl border transition-colors cursor-pointer flex items-center justify-center ${
              isLight 
                ? 'bg-white border-[#ede8df] text-amber-500 hover:bg-[#f4efe5]' 
                : 'bg-[#151d2e] border-[#23304a] text-slate-200 hover:bg-slate-800'
            }`}
          >
            {isLight ? (
              <Sun className="w-4 h-4 fill-amber-500 text-amber-500" />
            ) : (
              <Moon className="w-4 h-4 text-blue-400" />
            )}
          </button>

          {/* SELECTOR IDIOMA */}
          <div className="relative">
            <button 
              onClick={() => setLangOpen(!langOpen)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${
                isLight 
                  ? 'bg-white border-[#ede8df] text-slate-900 hover:bg-[#f4efe5]' 
                  : 'bg-[#151d2e] border-[#23304a] text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Globe className={`w-3.5 h-3.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`} />
              <span>{currentLang.toUpperCase()}</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            {langOpen && (
              <div className={`absolute right-0 top-full mt-2 w-36 rounded-xl p-1 shadow-2xl z-50 border ${
                isLight ? 'bg-white border-[#ede8df]' : 'bg-[#111726] border-[#1f293d]'
              }`}>
                <button
                  onClick={() => { onLanguageChange('es'); setLangOpen(false); }}
                  className={`w-full text-left px-3 py-1.5 text-xs font-bold rounded-lg flex items-center justify-between cursor-pointer ${
                    currentLang === 'es' 
                      ? 'bg-slate-900 text-white' 
                      : (isLight ? 'hover:bg-[#f4efe5] text-slate-900' : 'hover:bg-slate-800 text-slate-200')
                  }`}
                >
                  <span>Español (/es)</span>
                  {currentLang === 'es' && <span className="text-[10px]">✓</span>}
                </button>
                <button
                  onClick={() => { onLanguageChange('en'); setLangOpen(false); }}
                  className={`w-full text-left px-3 py-1.5 text-xs font-bold rounded-lg flex items-center justify-between cursor-pointer ${
                    currentLang === 'en' 
                      ? 'bg-slate-900 text-white' 
                      : (isLight ? 'hover:bg-[#f4efe5] text-slate-900' : 'hover:bg-slate-800 text-slate-200')
                  }`}
                >
                  <span>English (/en)</span>
                  {currentLang === 'en' && <span className="text-[10px]">✓</span>}
                </button>
              </div>
            )}
          </div>

          {/* BOTÓN SIGN IN */}
          <button className={`px-5 py-2.5 text-sm font-bold rounded-xl border transition-all cursor-pointer ${
            isLight 
              ? 'bg-white border-slate-900 text-slate-950 hover:bg-slate-900 hover:text-white' 
              : 'bg-transparent border-slate-700 text-white hover:bg-white/10'
          }`}>
            {t.nav.signIn}
          </button>
        </div>

      </div>
    </header>
  );
};
