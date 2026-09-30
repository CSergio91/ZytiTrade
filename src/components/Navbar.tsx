import React, { useState } from 'react';
import { 
  ChevronDown, 
  Globe, 
  ArrowUpRight, 
  Layers, 
  Cpu, 
  Zap, 
  Activity, 
  BarChart3, 
  Repeat, 
  ShieldCheck, 
  Wallet 
} from 'lucide-react';
import { translations, Language } from '../i18n/translations';

interface NavbarProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentLang, onLanguageChange }) => {
  const [exchangeOpen, setExchangeOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const t = translations[currentLang];

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
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    },
    {
      title: t.servicesMenu.multiExchange.title,
      badge: t.servicesMenu.multiExchange.badge,
      desc: t.servicesMenu.multiExchange.desc,
      icon: Layers,
      color: 'text-blue-600 bg-blue-50 border-blue-100',
    },
    {
      title: t.servicesMenu.copyTrading.title,
      badge: t.servicesMenu.copyTrading.badge,
      desc: t.servicesMenu.copyTrading.desc,
      icon: Repeat,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    },
    {
      title: t.servicesMenu.arbitrage.title,
      badge: t.servicesMenu.arbitrage.badge,
      desc: t.servicesMenu.arbitrage.desc,
      icon: Zap,
      color: 'text-amber-600 bg-amber-50 border-amber-100',
    },
  ];

  return (
    <header className="fixed top-4 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <nav className="glass-nav rounded-2xl px-4 py-3 flex items-center justify-between transition-all duration-300">
        
        {/* LOGO ZYTI TRADE */}
        <div className="flex items-center gap-3 cursor-pointer">
          <img 
            src="/logo-zyti.png" 
            alt="ZYTI Trade Logo" 
            className="w-10 h-10 object-contain drop-shadow-sm transition-transform duration-300 hover:scale-105"
          />
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-950 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
              ZYTI <span className="text-blue-600 font-extrabold">TRADE</span>
            </span>
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold -mt-1">
              Trading OS
            </span>
          </div>
        </div>

        {/* NAVEGACIÓN PRINCIPAL */}
        <div className="hidden md:flex items-center gap-1 lg:gap-2">
          
          {/* MENU EXCHANGES (HOVER VERTICAL) */}
          <div 
            className="relative"
            onMouseEnter={() => setExchangeOpen(true)}
            onMouseLeave={() => setExchangeOpen(false)}
          >
            <button className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-100/70 rounded-xl transition-all">
              <span>{t.nav.exchanges}</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${exchangeOpen ? 'rotate-180 text-blue-600' : 'text-slate-400'}`} />
            </button>

            {exchangeOpen && (
              <div className="absolute top-full left-0 mt-2 w-80 glass-dropdown rounded-2xl p-2.5 shadow-2xl border border-slate-200/80 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-600">{t.exchangesMenu.title}</p>
                  <p className="text-[11px] text-slate-500">{t.exchangesMenu.subtitle}</p>
                </div>
                
                {/* LISTA VERTICAL DE EXCHANGES */}
                <div className="flex flex-col gap-1 max-h-[380px] overflow-y-auto pr-1">
                  {exchangesList.map((ex) => (
                    <div 
                      key={ex.key}
                      className="group flex items-start justify-between p-2.5 rounded-xl hover:bg-blue-50/80 transition-all cursor-pointer border border-transparent hover:border-blue-100"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {ex.name}
                        </span>
                        <span className="text-[11px] text-slate-500 line-clamp-1">
                          {ex.desc}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
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
            <button className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-100/70 rounded-xl transition-all">
              <span>{t.nav.services}</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${servicesOpen ? 'rotate-180 text-blue-600' : 'text-slate-400'}`} />
            </button>

            {servicesOpen && (
              <div className="absolute top-full left-0 mt-2 w-96 glass-dropdown rounded-2xl p-2.5 shadow-2xl border border-slate-200/80 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
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
                        className="group flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50/90 transition-all cursor-pointer border border-transparent hover:border-slate-200"
                      >
                        <div className={`p-2 rounded-lg border ${srv.color} shrink-0`}>
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {srv.title}
                            </span>
                            <span className="text-[9px] font-mono uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
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

          <a href="#features" className="px-3 py-2 text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-100/70 rounded-xl transition-all">
            {t.nav.features}
          </a>

          <a href="#docs" className="px-3 py-2 text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-100/70 rounded-xl transition-all">
            {t.nav.docs}
          </a>
        </div>

        {/* ACCIONES DERECHA: SELECTOR IDIOMA & CTA */}
        <div className="flex items-center gap-2.5">
          
          {/* SELECTOR IDIOMA */}
          <div className="relative">
            <button 
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100/80 rounded-xl border border-slate-200/80 transition-all"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>{currentLang.toUpperCase()}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {langOpen && (
              <div className="absolute right-0 top-full mt-2 w-28 glass-dropdown rounded-xl p-1 shadow-xl border border-slate-200 animate-in fade-in duration-150">
                <button
                  onClick={() => { onLanguageChange('es'); setLangOpen(false); }}
                  className={`w-full text-left px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-between ${currentLang === 'es' ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'}`}
                >
                  <span>Español</span>
                  {currentLang === 'es' && <span className="text-[10px]">✓</span>}
                </button>
                <button
                  onClick={() => { onLanguageChange('en'); setLangOpen(false); }}
                  className={`w-full text-left px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-between ${currentLang === 'en' ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'}`}
                >
                  <span>English</span>
                  {currentLang === 'en' && <span className="text-[10px]">✓</span>}
                </button>
              </div>
            )}
          </div>

          {/* CTA LANZAR TERMINAL */}
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-md hover:shadow-blue-500/25 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0">
            <span>{t.nav.launchTerminal}</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

      </nav>
    </header>
  );
};
