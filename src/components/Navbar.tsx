import React, { useState } from 'react';
import { 
  Globe, 
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Layers,
  Cpu,
  ShieldCheck,
  Maximize2
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
  const [langOpen, setLangOpen] = useState(false);

  const t = translations[currentLang];
  const isLight = theme === 'light';
  const isCollapsed = activeSection > 0;

  const sections = [
    { id: 0, label: '01 ' + (currentLang === 'es' ? 'Terminal' : 'Terminal'), icon: Maximize2 },
    { id: 1, label: '02 ' + t.nav.exchanges, icon: Cpu },
    { id: 2, label: '03 ' + t.nav.services, icon: Layers },
  ];

  return (
    <>
      {/* MODO EXPANDIDO SUPERIOR (SLIDE 0 / HERO) VS MODO COMPRIMIDO LATERAL (SLIDE 1 Y 2) */}
      <header 
        className={`fixed z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isCollapsed
            ? 'top-8 left-6 w-18 h-[calc(100vh-64px)] rounded-3xl shadow-2xl py-6 px-2 flex flex-col justify-between items-center border ' +
              (isLight ? 'bg-white/95 border-[#ede8df] text-slate-900 shadow-slate-200/60 backdrop-blur-md' : 'bg-[#111726]/95 border-[#1f293d] text-white shadow-black/60 backdrop-blur-md')
            : 'top-0 left-0 right-0 w-full h-20 px-6 lg:px-12 flex flex-row justify-between items-center border-none ' +
              (isLight ? 'bg-[#fbf9f4]/95 text-slate-900 backdrop-blur-md' : 'bg-[#0a0d14]/95 text-white backdrop-blur-md')
        }`}
      >
        
        {/* PARTE 1: LOGO */}
        <div className="flex items-center gap-3 cursor-pointer shrink-0">
          <button 
            onClick={() => onNavigateSection(0)}
            className="flex items-center gap-2.5 border-none bg-transparent cursor-pointer p-0"
            title="Ir al inicio"
          >
            <img 
              src="/logo-zyti.png" 
              alt="ZYTI Trade Logo" 
              className={`object-contain transition-all duration-300 ${isCollapsed ? 'w-9 h-9 hover:scale-110' : 'w-10 h-10'}`}
            />
            {!isCollapsed && (
              <span className={`text-2xl font-black tracking-tight ${isLight ? 'text-slate-950' : 'text-white'}`}>
                ZYTI <span className={`font-light ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Trade</span>
              </span>
            )}
          </button>
        </div>

        {/* PARTE 2: NAVEGADOR DE SECCIONES (HORIZONTAL EN HEADER / VERTICAL EN DOCK LATERAL) */}
        <div className={`flex transition-all duration-300 ${
          isCollapsed 
            ? 'flex-col gap-3 p-1.5 rounded-2xl bg-[#f4efe5]/60 dark:bg-slate-900/60 border border-[#ede8df] dark:border-slate-800' 
            : 'flex-row items-center gap-2 sm:gap-3 p-1 rounded-2xl bg-[#ede8df]/60 dark:bg-slate-900/60 border border-[#ede8df] dark:border-slate-800'
        }`}>
          {sections.map((sec) => {
            const Icon = sec.icon;
            return (
              <button
                key={sec.id}
                onClick={() => onNavigateSection(sec.id)}
                title={sec.label}
                className={`transition-all cursor-pointer flex items-center justify-center ${
                  isCollapsed
                    ? 'w-10 h-10 rounded-xl ' + (activeSection === sec.id ? (isLight ? 'bg-slate-950 text-white shadow-sm' : 'bg-blue-600 text-white shadow-sm') : (isLight ? 'text-slate-600 hover:bg-white/80' : 'text-slate-400 hover:bg-slate-800'))
                    : 'px-3.5 py-1.5 rounded-xl text-xs font-bold ' + (activeSection === sec.id ? (isLight ? 'bg-white text-slate-950 shadow-sm' : 'bg-slate-800 text-white shadow-sm') : (isLight ? 'text-slate-600 hover:text-slate-950 hover:bg-white/50' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'))
                }`}
              >
                {isCollapsed ? (
                  <span className="text-[11px] font-mono font-black">0{sec.id + 1}</span>
                ) : (
                  <span>{sec.label}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* PARTE 3: ACCIONES (HORIZONTAL EN HEADER / APILADAS VERTICALMENTE EN DOCK LATERAL) */}
        <div className={`flex items-center gap-2.5 shrink-0 transition-all duration-300 ${
          isCollapsed ? 'flex-col' : 'flex-row'
        }`}>
          
          {/* THEME TOGGLE */}
          <button
            onClick={onThemeToggle}
            aria-label="Toggle Theme"
            className={`rounded-xl border transition-colors cursor-pointer flex items-center justify-center ${
              isCollapsed ? 'p-2 w-10 h-10' : 'p-2.5'
            } ${
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
              className={`rounded-xl border transition-colors cursor-pointer flex items-center justify-center ${
                isCollapsed ? 'w-10 h-10 p-0 text-[11px] font-bold font-mono' : 'gap-1.5 px-3 py-2 text-xs font-bold'
              } ${
                isLight 
                  ? 'bg-white border-[#ede8df] text-slate-900 hover:bg-[#f4efe5]' 
                  : 'bg-[#151d2e] border-[#23304a] text-slate-200 hover:bg-slate-800'
              }`}
            >
              {isCollapsed ? (
                <span>{currentLang.toUpperCase()}</span>
              ) : (
                <>
                  <Globe className={`w-3.5 h-3.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`} />
                  <span>{currentLang.toUpperCase()}</span>
                </>
              )}
            </button>

            {langOpen && (
              <div className={`absolute z-50 warm-card rounded-xl p-1 shadow-2xl border ${
                isCollapsed ? 'left-full top-0 ml-3 w-36' : 'right-0 top-full mt-2 w-36'
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

          {/* BOTÓN SIGN IN (Solo se muestra texto en el header superior) */}
          {!isCollapsed && (
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
    </>
  );
};
