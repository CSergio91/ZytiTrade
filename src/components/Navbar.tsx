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
}

export const Navbar: React.FC<NavbarProps> = ({ currentLang, onLanguageChange, theme, onThemeToggle }) => {
  const [exchangeOpen, setExchangeOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const t = translations[currentLang];
  const isLight = theme === 'light';

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
    <header className="fixed top-0 left-0 right-0 w-full z-50 bg-[#fbf9f4]/95 dark:bg-[#0a0d14]/95 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
        
        {/* LOGO LIMPIO */}
        <a href={'/' + currentLang} className="flex items-center gap-3 cursor-pointer shrink-0">
          <img 
            src="/logo-zyti.png" 
            alt="ZYTI Trade Logo" 
            className="w-10 h-10 object-contain"
          />
          <span className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">
            ZYTI <span className="font-light text-slate-500">Trade</span>
          </span>
        </a>

        {/* NAVEGACIÓN CENTRAL */}
        <div className="flex items-center gap-8 text-sm font-semibold text-slate-900 dark:text-slate-200">
          
          {/* MENU EXCHANGES */}
          <div 
            className="relative"
            onMouseEnter={() => setExchangeOpen(true)}
            onMouseLeave={() => setExchangeOpen(false)}
          >
            <button className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-white transition-colors cursor-pointer py-2">
              <span>{t.nav.exchanges}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {exchangeOpen && (
              <div className="absolute top-full left-0 mt-1 w-72 warm-card rounded-2xl p-2 shadow-xl animate-in fade-in duration-150 z-50">
                <div className="flex flex-col gap-0.5">
                  {exchangesList.map((ex, idx) => (
                    <div 
                      key={idx}
                      className="p-2.5 rounded-xl hover:bg-[#f4efe5] dark:hover:bg-slate-800 transition-colors cursor-pointer flex flex-col"
                    >
                      <span className="text-sm font-bold text-slate-950 dark:text-white">{ex.name}</span>
                      <span className="text-xs text-slate-700 dark:text-slate-400 font-medium">{ex.desc}</span>
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
            <button className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-white transition-colors cursor-pointer py-2">
              <span>{t.nav.services}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {servicesOpen && (
              <div className="absolute top-full left-0 mt-1 w-84 warm-card rounded-2xl p-2 shadow-xl animate-in fade-in duration-150 z-50">
                <div className="flex flex-col gap-1">
                  {servicesList.map((srv, idx) => (
                    <div 
                      key={idx}
                      className="p-3 rounded-xl hover:bg-[#f4efe5] dark:hover:bg-slate-800 transition-colors cursor-pointer flex flex-col"
                    >
                      <span className="text-sm font-bold text-slate-950 dark:text-white">{srv.title}</span>
                      <span className="text-xs text-slate-700 dark:text-slate-400 font-medium leading-snug mt-0.5">{srv.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <a href="#security" className="hover:text-blue-600 dark:hover:text-white transition-colors">
            {t.nav.security}
          </a>

          <a href="#download" className="hover:text-blue-600 dark:hover:text-white transition-colors">
            {t.nav.download}
          </a>
        </div>

        {/* ACCIONES DERECHA */}
        <div className="flex items-center gap-4 shrink-0">
          
          {/* THEME TOGGLE */}
          <button
            onClick={onThemeToggle}
            aria-label="Toggle Theme"
            className="p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-[#ede8df] dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {isLight ? (
              <Moon className="w-4 h-4 text-slate-700" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>

          {/* SELECTOR IDIOMA CON RUTAS /es y /en */}
          <div className="relative">
            <button 
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl text-slate-800 dark:text-slate-200 hover:bg-[#ede8df] dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
              <span>{currentLang.toUpperCase()}</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            {langOpen && (
              <div className="absolute right-0 top-full mt-2 w-32 warm-card rounded-xl p-1 shadow-lg z-50">
                <button
                  onClick={() => { onLanguageChange('es'); setLangOpen(false); }}
                  className={'w-full text-left px-3 py-1.5 text-xs font-bold rounded-lg flex items-center justify-between cursor-pointer ' + (currentLang === 'es' ? 'bg-[#111827] text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-200')}
                >
                  <span>Español (/es)</span>
                  {currentLang === 'es' && <span className="text-[10px]">✓</span>}
                </button>
                <button
                  onClick={() => { onLanguageChange('en'); setLangOpen(false); }}
                  className={'w-full text-left px-3 py-1.5 text-xs font-bold rounded-lg flex items-center justify-between cursor-pointer ' + (currentLang === 'en' ? 'bg-[#111827] text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-200')}
                >
                  <span>English (/en)</span>
                  {currentLang === 'en' && <span className="text-[10px]">✓</span>}
                </button>
              </div>
            )}
          </div>

          {/* BOTÓN SIGN IN */}
          <button className="px-5 py-2 text-sm font-bold text-slate-900 dark:text-white bg-transparent hover:bg-slate-900/5 dark:hover:bg-white/10 rounded-xl border border-slate-300 dark:border-slate-700 transition-all cursor-pointer">
            {t.nav.signIn}
          </button>
        </div>

      </div>
    </header>
  );
};
