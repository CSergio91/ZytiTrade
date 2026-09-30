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

  const exchangesList = [
    t.exchangesMenu.binance,
    t.exchangesMenu.bybit,
    t.exchangesMenu.okx,
    t.exchangesMenu.kraken,
    t.exchangesMenu.coinbase,
    t.exchangesMenu.bitget,
    t.exchangesMenu.kucoin,
    t.exchangesMenu.gate,
  ];

  const servicesList = [
    t.servicesMenu.propFirms,
    t.servicesMenu.multiExchange,
    t.servicesMenu.copyTrading,
    t.servicesMenu.arbitrage,
  ];

  return (
    <header 
      className={`fixed z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isShifted
          ? 'top-4 left-6 w-auto max-w-[calc(100vw-48px)] h-16 px-5 rounded-2xl flex items-center justify-between gap-6 shadow-2xl border ' +
            (isLight ? 'bg-white/95 border-[#ede8df] text-slate-900 shadow-slate-200/60 backdrop-blur-md' : 'bg-[#111726]/95 border-[#1f293d] text-white shadow-black/60 backdrop-blur-md')
          : 'top-0 left-0 right-0 w-full h-20 px-6 lg:px-12 flex items-center justify-between border-none ' +
            (isLight ? 'bg-[#fbf9f4]/95 text-slate-900 backdrop-blur-md' : 'bg-[#0a0d14]/95 text-white backdrop-blur-md')
      }`}
    >
      
      {/* 1. LOGO COMPLETO (SIEMPRE VISIBLE) */}
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

      {/* 2. MENÚS DE NAVEGACIÓN COMPLETOS CON SUBMENÚS AL HOVER */}
      <div className={`flex items-center transition-all duration-300 font-bold ${
        isShifted ? 'gap-5 text-xs' : 'gap-8 text-sm'
      } ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
        
        {/* MENU EXCHANGES */}
        <div 
          className="relative"
          onMouseEnter={() => setExchangeOpen(true)}
          onMouseLeave={() => setExchangeOpen(false)}
        >
          <button 
            onClick={() => onNavigateSection(1)}
            className={`flex items-center gap-1.5 transition-colors cursor-pointer py-1.5 ${
              activeSection === 1 
                ? 'text-blue-600' 
                : (isLight ? 'text-slate-900 hover:text-blue-600' : 'text-slate-200 hover:text-blue-400')
            }`}
          >
            <span>{t.nav.exchanges}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {exchangeOpen && (
            <div className={`absolute top-full left-0 mt-2 w-72 rounded-2xl p-2 shadow-2xl animate-in fade-in duration-150 z-50 border ${
              isLight ? 'bg-white border-[#ede8df] text-slate-900' : 'bg-[#111726] border-[#1f293d] text-white'
            }`}>
              <div className="flex flex-col gap-0.5">
                {exchangesList.map((ex, idx) => (
                  <div 
                    key={idx}
                    onClick={() => { onNavigateSection(1); setExchangeOpen(false); }}
                    className={`p-2.5 rounded-xl transition-colors cursor-pointer flex flex-col ${
                      isLight ? 'hover:bg-[#f4efe5]' : 'hover:bg-slate-800'
                    }`}
                  >
                    <span className={`text-sm font-bold ${isLight ? 'text-slate-950' : 'text-white'}`}>{ex.name}</span>
                    <span className={`text-xs font-medium ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>{ex.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* MENU SERVICIOS */}
        <div 
          className="relative"
          onMouseEnter={() => setServicesOpen(true)}
          onMouseLeave={() => setServicesOpen(false)}
        >
          <button 
            onClick={() => onNavigateSection(2)}
            className={`flex items-center gap-1.5 transition-colors cursor-pointer py-1.5 ${
              activeSection === 2 
                ? 'text-blue-600' 
                : (isLight ? 'text-slate-900 hover:text-blue-600' : 'text-slate-200 hover:text-blue-400')
            }`}
          >
            <span>{t.nav.services}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {servicesOpen && (
            <div className={`absolute top-full left-0 mt-2 w-84 rounded-2xl p-2 shadow-2xl animate-in fade-in duration-150 z-50 border ${
              isLight ? 'bg-white border-[#ede8df] text-slate-900' : 'bg-[#111726] border-[#1f293d] text-white'
            }`}>
              <div className="flex flex-col gap-1">
                {servicesList.map((srv, idx) => (
                  <div 
                    key={idx}
                    onClick={() => { onNavigateSection(2); setServicesOpen(false); }}
                    className={`p-3 rounded-xl transition-colors cursor-pointer flex flex-col ${
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

        <button 
          onClick={() => onNavigateSection(1)}
          className={`transition-colors cursor-pointer bg-transparent border-none p-0 ${
            isLight ? 'text-slate-900 hover:text-blue-600' : 'text-slate-200 hover:text-blue-400'
          }`}
        >
          {t.nav.security}
        </button>

        <button 
          onClick={() => onNavigateSection(2)}
          className={`transition-colors cursor-pointer bg-transparent border-none p-0 ${
            isLight ? 'text-slate-900 hover:text-blue-600' : 'text-slate-200 hover:text-blue-400'
          }`}
        >
          {t.nav.download}
        </button>
      </div>

      {/* 3. ACCIONES COMPLETAS (TEMA + IDIOMA + ACCEDER) */}
      <div className={`flex items-center transition-all duration-300 shrink-0 ${
        isShifted ? 'gap-2.5' : 'gap-3.5'
      }`}>
        
        {/* THEME TOGGLE */}
        <button
          onClick={onThemeToggle}
          aria-label="Toggle Theme"
          className={`rounded-xl border transition-colors cursor-pointer flex items-center justify-center ${
            isShifted ? 'p-2' : 'p-2.5'
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
            className={`flex items-center gap-1.5 rounded-xl border transition-colors cursor-pointer ${
              isShifted ? 'px-2.5 py-1.5 text-xs font-bold' : 'px-3 py-2 text-xs font-bold'
            } ${
              isLight 
                ? 'bg-white border-[#ede8df] text-slate-900 hover:bg-[#f4efe5]' 
                : 'bg-[#151d2e] border-[#23304a] text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Globe className={`w-3.5 h-3.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`} />
            <span>{currentLang.toUpperCase()}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {langOpen && (
            <div className={`absolute top-full mt-2 w-32 rounded-xl p-1 shadow-2xl z-50 border right-0 ${
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

        {/* BOTÓN SIGN IN / ACCEDER COMPLETO */}
        <button className={`font-bold rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
          isShifted ? 'px-4 py-2 text-xs' : 'px-5 py-2.5 text-sm'
        } ${
          isLight 
            ? 'bg-white border-slate-900 text-slate-950 hover:bg-slate-900 hover:text-white' 
            : 'bg-transparent border-slate-700 text-white hover:bg-white/10'
        }`}>
          {t.nav.signIn}
        </button>
      </div>

    </header>
  );
};
