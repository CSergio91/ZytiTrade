import React, { useState } from 'react';
import { 
  ChevronDown, 
  Globe, 
  Sun,
  Moon
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
  const isShifted = activeSection > 0;

  // 15 Exchanges divididos en 3 columnas de exactamente 5 items cada una
  const venues = t.exchangesMenu.venues;
  const col1 = venues.slice(0, 5);
  const col2 = venues.slice(5, 10);
  const col3 = venues.slice(10, 15);

  const servicesList = [
    t.servicesMenu.propFirms,
    t.servicesMenu.multiExchange,
    t.servicesMenu.copyTrading,
    t.servicesMenu.arbitrage,
  ];

  return (
    <header 
      className={`fixed z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] bg-transparent border-none ${
        isShifted
          ? 'top-3 left-6 w-auto max-w-[calc(100vw-48px)] h-14 flex items-center justify-between gap-6 shadow-none'
          : 'top-0 left-0 right-0 w-full h-20 px-6 lg:px-12 flex items-center justify-between shadow-none'
      }`}
    >
      
      {/* 1. LOGO INSTITUCIONAL COMPLETO */}
      <button 
        onClick={() => onNavigateSection(0)}
        className="flex items-center gap-2.5 border-none bg-transparent cursor-pointer p-0 shrink-0"
        title="Inicio"
      >
        <img 
          src="/logo-zyti.png" 
          alt="ZYTI Trade Logo" 
          className={`object-contain transition-all duration-300 ${isShifted ? 'w-8 h-8' : 'w-10 h-10'}`}
        />
        <span className={`font-black tracking-tight transition-all duration-300 ${isShifted ? 'text-xl' : 'text-2xl'} ${isLight ? 'text-slate-950' : 'text-white'}`}>
          ZYTI <span className={`font-light ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Trade</span>
        </span>
      </button>

      {/* 2. MENÚS DE NAVEGACIÓN — CADA ITEM CORRESPONDE A UNA PANTALLA */}
      <div className={`flex items-center transition-all duration-300 font-bold ${
        isShifted ? 'gap-5 text-xs' : 'gap-8 text-sm'
      } ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
        
        {/* PANTALLA 1: MENU EXCHANGES (CON DROPDOWN EN 3 COLUMNAS DE A 5 ITEMS) */}
        <div 
          className="relative"
          onMouseEnter={() => setExchangeOpen(true)}
          onMouseLeave={() => setExchangeOpen(false)}
        >
          <button 
            onClick={() => onNavigateSection(1)}
            className={`flex items-center gap-1.5 transition-colors cursor-pointer py-1.5 bg-transparent border-none ${
              activeSection === 1 
                ? 'text-blue-600 dark:text-blue-400' 
                : (isLight ? 'text-slate-900 hover:text-blue-600' : 'text-slate-200 hover:text-blue-400')
            }`}
          >
            <span>{t.nav.exchanges}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {/* POPOVER CON 3 COLUMNAS DE EXACTAMENTE 5 EXCHANGES */}
          {exchangeOpen && (
            <div className={`absolute top-full left-0 mt-2 w-[720px] rounded-3xl p-5 shadow-2xl animate-in fade-in duration-150 z-50 border backdrop-blur-xl ${
              isLight ? 'bg-white/98 border-[#ede8df] text-slate-900 shadow-slate-200/80' : 'bg-[#111726]/98 border-[#1f293d] text-white shadow-black/80'
            }`}>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#ede8df] dark:border-[#1f293d]">
                <div>
                  <h4 className="text-sm font-black text-slate-950 dark:text-white">
                    {t.exchangesMenu.title}
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-400 font-medium">
                    {t.exchangesMenu.subtitle}
                  </p>
                </div>
                <button
                  onClick={() => { onNavigateSection(1); setExchangeOpen(false); }}
                  className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer bg-transparent border-none"
                >
                  {currentLang === 'es' ? 'Ver pantalla completa →' : 'View full screen →'}
                </button>
              </div>

              {/* 3 COLUMNAS DE 5 EXCHANGES CADA UNA */}
              <div className="grid grid-cols-3 gap-4">
                
                {/* COLUMNA 1 (5 ITEMS) */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 px-2">
                    {t.exchangesMenu.col1Title}
                  </span>
                  {col1.map((item, idx) => (
                    <div 
                      key={idx}
                      onClick={() => { onNavigateSection(1); setExchangeOpen(false); }}
                      className={`p-2.5 rounded-xl transition-all cursor-pointer flex flex-col ${
                        isLight ? 'hover:bg-[#f4efe5]' : 'hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${isLight ? 'text-slate-950' : 'text-white'}`}>{item.name}</span>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#ede5d6] dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                          {item.badge}
                        </span>
                      </div>
                      <span className={`text-[11px] font-medium mt-0.5 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>{item.desc}</span>
                    </div>
                  ))}
                </div>

                {/* COLUMNA 2 (5 ITEMS) */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 px-2">
                    {t.exchangesMenu.col2Title}
                  </span>
                  {col2.map((item, idx) => (
                    <div 
                      key={idx}
                      onClick={() => { onNavigateSection(1); setExchangeOpen(false); }}
                      className={`p-2.5 rounded-xl transition-all cursor-pointer flex flex-col ${
                        isLight ? 'hover:bg-[#f4efe5]' : 'hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${isLight ? 'text-slate-950' : 'text-white'}`}>{item.name}</span>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#ede5d6] dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                          {item.badge}
                        </span>
                      </div>
                      <span className={`text-[11px] font-medium mt-0.5 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>{item.desc}</span>
                    </div>
                  ))}
                </div>

                {/* COLUMNA 3 (5 ITEMS) */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 px-2">
                    {t.exchangesMenu.col3Title}
                  </span>
                  {col3.map((item, idx) => (
                    <div 
                      key={idx}
                      onClick={() => { onNavigateSection(1); setExchangeOpen(false); }}
                      className={`p-2.5 rounded-xl transition-all cursor-pointer flex flex-col ${
                        isLight ? 'hover:bg-[#f4efe5]' : 'hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${isLight ? 'text-slate-950' : 'text-white'}`}>{item.name}</span>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#ede5d6] dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                          {item.badge}
                        </span>
                      </div>
                      <span className={`text-[11px] font-medium mt-0.5 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>{item.desc}</span>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          )}
        </div>

        {/* PANTALLA 2: MENU SERVICIOS */}
        <div 
          className="relative"
          onMouseEnter={() => setServicesOpen(true)}
          onMouseLeave={() => setServicesOpen(false)}
        >
          <button 
            onClick={() => onNavigateSection(2)}
            className={`flex items-center gap-1.5 transition-colors cursor-pointer py-1.5 bg-transparent border-none ${
              activeSection === 2 
                ? 'text-blue-600 dark:text-blue-400' 
                : (isLight ? 'text-slate-900 hover:text-blue-600' : 'text-slate-200 hover:text-blue-400')
            }`}
          >
            <span>{t.nav.services}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {servicesOpen && (
            <div className={`absolute top-full left-0 mt-2 w-88 rounded-3xl p-3 shadow-2xl animate-in fade-in duration-150 z-50 border backdrop-blur-xl ${
              isLight ? 'bg-white/98 border-[#ede8df] text-slate-900 shadow-slate-200/80' : 'bg-[#111726]/98 border-[#1f293d] text-white shadow-black/80'
            }`}>
              <div className="flex flex-col gap-1">
                {servicesList.map((srv, idx) => (
                  <div 
                    key={idx}
                    onClick={() => { onNavigateSection(2); setServicesOpen(false); }}
                    className={`p-3 rounded-2xl transition-colors cursor-pointer flex flex-col ${
                      isLight ? 'hover:bg-[#f4efe5]' : 'hover:bg-slate-800'
                    }`}
                  >
                    <span className={`text-sm font-bold ${isLight ? 'text-slate-950' : 'text-white'}`}>{srv.title}</span>
                    <span className={`text-xs font-medium leading-snug mt-0.5 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>{srv.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* PANTALLA 3: SEGURIDAD */}
        <button 
          onClick={() => onNavigateSection(3)}
          className={`transition-colors cursor-pointer bg-transparent border-none p-0 ${
            activeSection === 3
              ? 'text-blue-600 dark:text-blue-400'
              : (isLight ? 'text-slate-900 hover:text-blue-600' : 'text-slate-200 hover:text-blue-400')
          }`}
        >
          {t.nav.security}
        </button>

        {/* PANTALLA 4: DESCARGAR / APPS */}
        <button 
          onClick={() => onNavigateSection(4)}
          className={`transition-colors cursor-pointer bg-transparent border-none p-0 ${
            activeSection === 4
              ? 'text-blue-600 dark:text-blue-400'
              : (isLight ? 'text-slate-900 hover:text-blue-600' : 'text-slate-200 hover:text-blue-400')
          }`}
        >
          {t.nav.download}
        </button>
      </div>

      {/* 3. ACCIONES LATERALES (TEMA + IDIOMA + ACCEDER) */}
      <div className={`flex items-center transition-all duration-300 shrink-0 ${
        isShifted ? 'gap-2.5' : 'gap-3.5'
      }`}>
        
        {/* THEME TOGGLE (100% SIN BORDES) */}
        <button
          onClick={onThemeToggle}
          aria-label="Toggle Theme"
          className={`rounded-xl transition-colors cursor-pointer flex items-center justify-center border-none bg-transparent ${
            isShifted ? 'p-1.5' : 'p-2'
          } ${
            isLight 
              ? 'text-amber-500 hover:bg-[#ede5d6]/50' 
              : 'text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          {isLight ? (
            <Sun className="w-4 h-4 fill-amber-500 text-amber-500" />
          ) : (
            <Moon className="w-4 h-4 text-blue-400" />
          )}
        </button>

        {/* SELECTOR IDIOMA (100% SIN BORDES) */}
        <div className="relative">
          <button 
            onClick={() => setLangOpen(!langOpen)}
            className={`flex items-center gap-1.5 rounded-xl transition-colors cursor-pointer border-none bg-transparent ${
              isShifted ? 'px-2 py-1.5 text-xs font-bold' : 'px-2.5 py-2 text-xs font-bold'
            } ${
              isLight 
                ? 'text-slate-900 hover:bg-[#ede5d6]/50' 
                : 'text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Globe className={`w-3.5 h-3.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`} />
            <span>{currentLang.toUpperCase()}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {langOpen && (
            <div className={`absolute top-full mt-2 w-32 rounded-2xl p-1 shadow-2xl z-50 border right-0 backdrop-blur-xl ${
              isLight ? 'bg-white border-[#ede8df]' : 'bg-[#111726] border-[#1f293d]'
            }`}>
              <button
                onClick={() => { onLanguageChange('es'); setLangOpen(false); }}
                className={'w-full text-left px-3 py-1.5 text-xs font-bold rounded-xl flex items-center justify-between cursor-pointer ' + (currentLang === 'es' ? 'bg-slate-900 text-white' : (isLight ? 'hover:bg-[#f4efe5] text-slate-900' : 'hover:bg-slate-800 text-slate-200'))}
              >
                <span>Español</span>
                {currentLang === 'es' && <span className="text-[10px]">✓</span>}
              </button>
              <button
                onClick={() => { onLanguageChange('en'); setLangOpen(false); }}
                className={'w-full text-left px-3 py-1.5 text-xs font-bold rounded-xl flex items-center justify-between cursor-pointer ' + (currentLang === 'en' ? 'bg-slate-900 text-white' : (isLight ? 'hover:bg-[#f4efe5] text-slate-900' : 'hover:bg-slate-800 text-slate-200'))}
              >
                <span>English</span>
                {currentLang === 'en' && <span className="text-[10px]">✓</span>}
              </button>
            </div>
          )}
        </div>

        {/* BOTÓN SIGN IN */}
        <button className={`font-bold rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
          isShifted ? 'px-4 py-2 text-xs' : 'px-5 py-2.5 text-sm'
        } ${
          isLight 
            ? 'bg-slate-950 border-slate-950 text-white hover:bg-slate-800' 
            : 'bg-white border-white text-slate-950 hover:bg-slate-200'
        }`}>
          {t.nav.signIn}
        </button>
      </div>

    </header>
  );
};
