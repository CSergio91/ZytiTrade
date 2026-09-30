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
    <header className={`fixed top-0 left-0 right-0 w-full z-50 transition-colors duration-200 border-none ${
      isLight 
        ? 'bg-[#fbf9f4]/95 backdrop-blur-md shadow-xs text-slate-900' 
        : 'bg-[#0a0d14]/95 backdrop-blur-md text-white'
    }`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
        
        {/* LOGO LIMPIO */}
        <a href={'/' + currentLang} className="flex items-center gap-3 cursor-pointer shrink-0">
          <img 
            src="/logo-zyti.png" 
            alt="ZYTI Trade Logo" 
            className="w-10 h-10 object-contain"
          />
          <span className={`text-2xl font-black tracking-tight ${isLight ? 'text-slate-950' : 'text-white'}`}>
            ZYTI <span className={`font-light ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Trade</span>
          </span>
        </a>

        {/* NAVEGACIÓN CENTRAL 100% CLARA EN MODO CLARO */}
        <div className={`flex items-center gap-8 text-sm font-bold ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
          
          {/* MENU EXCHANGES */}
          <div 
            className="relative"
            onMouseEnter={() => setExchangeOpen(true)}
            onMouseLeave={() => setExchangeOpen(false)}
          >
            <button className={`flex items-center gap-1.5 transition-colors cursor-pointer py-2 ${
              isLight ? 'text-slate-900 hover:text-blue-600' : 'text-slate-200 hover:text-blue-400'
            }`}>
              <span>{t.nav.exchanges}</span>
              <ChevronDown className={`w-3.5 h-3.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`} />
            </button>

            {exchangeOpen && (
              <div className={`absolute top-full left-0 mt-1 w-72 rounded-2xl p-2 shadow-2xl animate-in fade-in duration-150 z-50 border ${
                isLight ? 'bg-white border-[#ede8df] text-slate-900' : 'bg-[#111726] border-[#1f293d] text-white'
              }`}>
                <div className="flex flex-col gap-0.5">
                  {exchangesList.map((ex, idx) => (
                    <div 
                      key={idx}
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
            <button className={`flex items-center gap-1.5 transition-colors cursor-pointer py-2 ${
              isLight ? 'text-slate-900 hover:text-blue-600' : 'text-slate-200 hover:text-blue-400'
            }`}>
              <span>{t.nav.services}</span>
              <ChevronDown className={`w-3.5 h-3.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`} />
            </button>

            {servicesOpen && (
              <div className={`absolute top-full left-0 mt-1 w-84 rounded-2xl p-2 shadow-2xl animate-in fade-in duration-150 z-50 border ${
                isLight ? 'bg-white border-[#ede8df] text-slate-900' : 'bg-[#111726] border-[#1f293d] text-white'
              }`}>
                <div className="flex flex-col gap-1">
                  {servicesList.map((srv, idx) => (
                    <div 
                      key={idx}
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

          <a href="#security" className={`transition-colors ${isLight ? 'text-slate-900 hover:text-blue-600' : 'text-slate-200 hover:text-blue-400'}`}>
            {t.nav.security}
          </a>

          <a href="#download" className={`transition-colors ${isLight ? 'text-slate-900 hover:text-blue-600' : 'text-slate-200 hover:text-blue-400'}`}>
            {t.nav.download}
          </a>
        </div>

        {/* ACCIONES DERECHA EN MODO CLARO TOTAL */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* THEME TOGGLE LUMINOSO */}
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
