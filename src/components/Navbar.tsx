import React, { useState } from 'react';
import { 
  ChevronDown, 
  Globe, 
  ArrowUpRight, 
  Layers, 
  Cpu, 
  Zap, 
  Repeat, 
  ShieldCheck, 
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
    { key: 'binance', name: t.exchangesMenu.binance.name, desc: t.exchangesMenu.binance.desc, tag: 'Tier 1' },
    { key: 'bybit', name: t.exchangesMenu.bybit.name, desc: t.exchangesMenu.bybit.desc, tag: 'API v5' },
    { key: 'okx', name: t.exchangesMenu.okx.name, desc: t.exchangesMenu.okx.desc, tag: 'Swaps' },
    { key: 'kraken', name: t.exchangesMenu.kraken.name, desc: t.exchangesMenu.kraken.desc, tag: 'EUR/USD' },
    { key: 'coinbase', name: t.exchangesMenu.coinbase.name, desc: t.exchangesMenu.coinbase.desc, tag: 'Prime' },
    { key: 'bitget', name: t.exchangesMenu.bitget.name, desc: t.exchangesMenu.bitget.desc, tag: 'Copy API' },
    { key: 'kucoin', name: t.exchangesMenu.kucoin.name, desc: t.exchangesMenu.kucoin.desc, tag: '700+ Pairs' },
    { key: 'gate', name: t.exchangesMenu.gate.name, desc: t.exchangesMenu.gate.desc, tag: 'Liquidity' },
  ];

  const servicesList = [
    {
      title: t.servicesMenu.propFirms.title,
      badge: t.servicesMenu.propFirms.badge,
      desc: t.servicesMenu.propFirms.desc,
      icon: ShieldCheck,
      color: 'text-indigo-600 bg-indigo-50/80 border-indigo-200/60 dark:bg-indigo-950/50 dark:border-indigo-800 dark:text-indigo-400',
    },
    {
      title: t.servicesMenu.multiExchange.title,
      badge: t.servicesMenu.multiExchange.badge,
      desc: t.servicesMenu.multiExchange.desc,
      icon: Layers,
      color: 'text-blue-600 bg-blue-50/80 border-blue-200/60 dark:bg-blue-950/50 dark:border-blue-800 dark:text-blue-400',
    },
    {
      title: t.servicesMenu.copyTrading.title,
      badge: t.servicesMenu.copyTrading.badge,
      desc: t.servicesMenu.copyTrading.desc,
      icon: Repeat,
      color: 'text-emerald-600 bg-emerald-50/80 border-emerald-200/60 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-400',
    },
    {
      title: t.servicesMenu.arbitrage.title,
      badge: t.servicesMenu.arbitrage.badge,
      desc: t.servicesMenu.arbitrage.desc,
      icon: Zap,
      color: 'text-amber-600 bg-amber-50/80 border-amber-200/60 dark:bg-amber-950/50 dark:border-amber-800 dark:text-amber-400',
    },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 glass-nav-top transition-colors duration-250">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* LOGO ZYTI TRADE */}
        <div className="flex items-center gap-3 cursor-pointer shrink-0">
          <img 
            src="/logo-zyti.png" 
            alt="ZYTI Trade Logo" 
            className="w-9 h-9 object-contain drop-shadow-sm transition-transform duration-300 hover:scale-105"
          />
          <div className="flex flex-col">
            <span className={`text-lg font-black tracking-tight leading-tight ${isLight ? 'text-slate-950' : 'text-white'}`}>
              ZYTI <span className="text-blue-600 font-black">TRADE</span>
            </span>
            <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold -mt-0.5">
              Trading OS
            </span>
          </div>
        </div>

        {/* NAVEGACIÓN CENTRAL */}
        <div className="flex items-center gap-1 sm:gap-2">
          
          {/* MENU EXCHANGES (HOVER VERTICAL) */}
          <div 
            className="relative"
            onMouseEnter={() => setExchangeOpen(true)}
            onMouseLeave={() => setExchangeOpen(false)}
          >
            <button className={`flex items-center gap-1.5 px-3 py-2 text-sm font-bold rounded-xl transition-all ${isLight ? 'text-slate-800 hover:text-blue-600 hover:bg-white/60' : 'text-slate-200 hover:text-blue-400 hover:bg-slate-800/60'}`}>
              <span>{t.nav.exchanges}</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${exchangeOpen ? 'rotate-180 text-blue-600' : 'text-slate-400'}`} />
            </button>

            {exchangeOpen && (
              <div className="absolute top-full left-0 mt-2 w-80 glass-dropdown-crystal rounded-2xl p-2.5 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                <div className={`px-3 py-2 border-b mb-1 ${isLight ? 'border-slate-200/60' : 'border-slate-800'}`}>
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-600">{t.exchangesMenu.title}</p>
                  <p className="text-[11px] text-slate-500">{t.exchangesMenu.subtitle}</p>
                </div>
                
                {/* LISTA VERTICAL DE EXCHANGES */}
                <div className="flex flex-col gap-1 max-h-[380px] overflow-y-auto pr-1">
                  {exchangesList.map((ex) => (
                    <div 
                      key={ex.key}
                      className={`group flex items-start justify-between p-2.5 rounded-xl transition-all cursor-pointer border border-transparent ${isLight ? 'hover:bg-blue-50/70 hover:border-blue-200/50' : 'hover:bg-slate-800/80 hover:border-slate-700'}`}
                    >
                      <div className="flex flex-col">
                        <span className={`text-sm font-bold transition-colors ${isLight ? 'text-slate-900 group-hover:text-blue-600' : 'text-white group-hover:text-blue-400'}`}>
                          {ex.name}
                        </span>
                        <span className="text-[11px] text-slate-500 line-clamp-1">
                          {ex.desc}
                        </span>
                      </div>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full transition-colors ${isLight ? 'bg-white/80 border border-slate-200 text-slate-700 group-hover:bg-blue-100 group-hover:text-blue-700' : 'bg-slate-800 text-slate-300 group-hover:bg-blue-900/60 group-hover:text-blue-300'}`}>
                        {ex.tag}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* MENU SERVICIOS (HOVER VERTICAL) */}
          <div 
            className="relative"
            onMouseEnter={() => setServicesOpen(true)}
            onMouseLeave={() => setServicesOpen(false)}
          >
            <button className={`flex items-center gap-1.5 px-3 py-2 text-sm font-bold rounded-xl transition-all ${isLight ? 'text-slate-800 hover:text-blue-600 hover:bg-white/60' : 'text-slate-200 hover:text-blue-400 hover:bg-slate-800/60'}`}>
              <span>{t.nav.services}</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${servicesOpen ? 'rotate-180 text-blue-600' : 'text-slate-400'}`} />
            </button>

            {servicesOpen && (
              <div className="absolute top-full left-0 mt-2 w-96 glass-dropdown-crystal rounded-2xl p-2.5 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                <div className={`px-3 py-2 border-b mb-1 ${isLight ? 'border-slate-200/60' : 'border-slate-800'}`}>
                  <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">{t.servicesMenu.title}</p>
                  <p className="text-[11px] text-slate-500">{t.servicesMenu.subtitle}</p>
                </div>
                
                {/* LISTA VERTICAL DE SERVICIOS */}
                <div className="flex flex-col gap-1.5">
                  {servicesList.map((srv, idx) => {
                    const IconComp = srv.icon;
                    return (
                      <div 
                        key={idx}
                        className={`group flex items-start gap-3 p-2.5 rounded-xl transition-all cursor-pointer border border-transparent ${isLight ? 'hover:bg-white/70 hover:border-slate-200/80' : 'hover:bg-slate-800/80 hover:border-slate-700'}`}
                      >
                        <div className={`p-2 rounded-lg border ${srv.color} shrink-0`}>
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold transition-colors ${isLight ? 'text-slate-900 group-hover:text-blue-600' : 'text-white group-hover:text-blue-400'}`}>
                              {srv.title}
                            </span>
                            <span className={`text-[9px] font-mono uppercase font-bold px-1.5 py-0.5 rounded ${isLight ? 'bg-white/80 border border-slate-200 text-slate-700' : 'bg-slate-800 text-slate-300'}`}>
                              {srv.badge}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 leading-tight mt-0.5">
                            {srv.desc}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <a href="#exchanges" className={`hidden sm:inline px-3 py-2 text-sm font-bold rounded-xl transition-all ${isLight ? 'text-slate-800 hover:text-blue-600 hover:bg-white/60' : 'text-slate-200 hover:text-blue-400 hover:bg-slate-800/60'}`}>
            {t.nav.features}
          </a>

          <a href="#services" className={`hidden sm:inline px-3 py-2 text-sm font-bold rounded-xl transition-all ${isLight ? 'text-slate-800 hover:text-blue-600 hover:bg-white/60' : 'text-slate-200 hover:text-blue-400 hover:bg-slate-800/60'}`}>
            {t.nav.docs}
          </a>
        </div>

        {/* ACCIONES DERECHA */}
        <div className="flex items-center gap-2.5 shrink-0">
          
          {/* SWITCH THEME CLARO / OSCURO */}
          <button
            onClick={onThemeToggle}
            title={isLight ? 'Cambiar a Modo Oscuro' : 'Cambiar a Modo Claro'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-black transition-all cursor-pointer ${
              isLight 
                ? 'bg-white/80 border-slate-200/90 text-slate-800 hover:bg-white shadow-xs' 
                : 'bg-slate-800/80 border-slate-700 text-amber-300 hover:bg-slate-800'
            }`}
          >
            {isLight ? (
              <>
                <Sun className="w-4 h-4 text-amber-500" />
                <span className="hidden sm:inline">Modo Claro</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-blue-400" />
                <span className="hidden sm:inline">Modo Oscuro</span>
              </>
            )}
          </button>

          {/* SELECTOR IDIOMA */}
          <div className="relative">
            <button 
              onClick={() => setLangOpen(!langOpen)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-black rounded-xl border transition-all ${
                isLight 
                  ? 'border-slate-200/90 bg-white/80 text-slate-800 hover:bg-white shadow-xs' 
                  : 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>{currentLang.toUpperCase()}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {langOpen && (
              <div className="absolute right-0 top-full mt-2 w-28 glass-dropdown-crystal rounded-xl p-1 shadow-xl z-50">
                <button
                  onClick={() => { onLanguageChange('es'); setLangOpen(false); }}
                  className={`w-full text-left px-3 py-1.5 text-xs font-bold rounded-lg flex items-center justify-between ${currentLang === 'es' ? 'bg-blue-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                  <span>Español</span>
                  {currentLang === 'es' && <span className="text-[10px]">✓</span>}
                </button>
                <button
                  onClick={() => { onLanguageChange('en'); setLangOpen(false); }}
                  className={`w-full text-left px-3 py-1.5 text-xs font-bold rounded-lg flex items-center justify-between ${currentLang === 'en' ? 'bg-blue-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                  <span>English</span>
                  {currentLang === 'en' && <span className="text-[10px]">✓</span>}
                </button>
              </div>
            )}
          </div>

          {/* CTA LANZAR TERMINAL */}
          <button className="flex items-center gap-2 px-3.5 sm:px-4 py-2 text-sm font-black text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md hover:shadow-blue-500/25 transition-all">
            <span className="hidden sm:inline">{t.nav.launchTerminal}</span>
            <span className="sm:hidden">Terminal</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
};
