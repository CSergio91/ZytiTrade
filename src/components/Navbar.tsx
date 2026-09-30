import React, { useState, useRef } from 'react';
import { 
  ChevronDown, 
  Globe,
  Menu,
  X
} from 'lucide-react';
import { translations, Language } from '../i18n/translations';
import { ExchangeLogo } from './ExchangeLogo';
import { PropFirmLogo } from './PropFirmLogo';
import { LottieAnimation } from './LottieAnimation';
import exchangeRadarData from '../assets/animations/exchange-radar.json';
import servicesAnimationData from '../assets/animations/services-network.json';

interface NavbarProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  theme?: 'light' | 'dark';
  onThemeToggle?: () => void;
  activeSection: number;
  onNavigateSection: (index: number) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  currentLang, 
  onLanguageChange, 
  activeSection,
  onNavigateSection
}) => {
  const [exchangeOpen, setExchangeOpen] = useState(false);
  const [propFirmsOpen, setPropFirmsOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Timers con margen de gracia (debounce) para que el menú nunca se cierre por movimientos accidentales
  const exchangeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const propFirmsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const servicesTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePropFirmsEnter = () => {
    if (propFirmsTimeoutRef.current) clearTimeout(propFirmsTimeoutRef.current);
    setPropFirmsOpen(true);
  };

  const handlePropFirmsLeave = () => {
    propFirmsTimeoutRef.current = setTimeout(() => {
      setPropFirmsOpen(false);
    }, 220);
  };

  const handleExchangeEnter = () => {
    if (exchangeTimeoutRef.current) clearTimeout(exchangeTimeoutRef.current);
    setExchangeOpen(true);
  };

  const handleExchangeLeave = () => {
    exchangeTimeoutRef.current = setTimeout(() => {
      setExchangeOpen(false);
    }, 220); // 220ms de margen de gracia
  };

  const handleServicesEnter = () => {
    if (servicesTimeoutRef.current) clearTimeout(servicesTimeoutRef.current);
    setServicesOpen(true);
  };

  const handleServicesLeave = () => {
    servicesTimeoutRef.current = setTimeout(() => {
      setServicesOpen(false);
    }, 220); // 220ms de margen de gracia
  };

  const t = translations[currentLang];
  const isShifted = activeSection > 0;

  // 15 Exchanges divididos en 3 columnas de exactamente 5 items cada una
  const venues = t.exchangesMenu.venues;
  const col1 = venues.slice(0, 5);
  const col2 = venues.slice(5, 10);
  const col3 = venues.slice(10, 15);

  // 15 Prop Firms divididas en 3 columnas de 5 items cada una
  const propFirms = t.propFirmsMenu?.firms || [];
  const pfCol1 = propFirms.slice(0, 5);
  const pfCol2 = propFirms.slice(5, 10);
  const pfCol3 = propFirms.slice(10, 15);

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
          ? 'top-2 sm:top-3 left-3 sm:left-6 right-3 sm:right-auto lg:w-auto lg:max-w-[calc(100vw-48px)] h-14 flex items-center justify-between gap-3 sm:gap-6 shadow-none'
          : 'top-0 left-0 right-0 w-full h-16 sm:h-20 px-3 sm:px-6 lg:px-12 flex items-center justify-between shadow-none'
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
        <span className={`font-black tracking-tight transition-all duration-300 ${isShifted ? 'text-xl' : 'text-2xl'} text-slate-950`}>
          ZYTI <span className="font-light text-slate-500">Trade</span>
        </span>
      </button>

      {/* 2. MENÚS DE NAVEGACIÓN — TEXTOS OSCUROS DE ALTO CONTRASTE */}
      <div className={`hidden md:flex items-center transition-all duration-300 font-bold ${
        isShifted ? 'gap-2 lg:gap-5 text-xs' : 'gap-3 lg:gap-8 text-xs lg:text-sm'
      } text-slate-950`}>
        
        {/* PANTALLA 1: EXCHANGES */}
        <div 
          className="relative py-2"
          onMouseEnter={handleExchangeEnter}
          onMouseLeave={handleExchangeLeave}
        >
          <button 
            type="button"
            onClick={() => onNavigateSection(1)}
            className={`flex items-center gap-1.5 transition-colors cursor-pointer py-1.5 bg-transparent border-none ${
              activeSection === 1 
                ? 'text-blue-600 font-black' 
                : 'text-slate-950 hover:text-blue-600'
            }`}
          >
            <span>{t.nav.exchanges}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
          </button>

          {/* POPOVER CON CRISTAL LUMINOSO PARA EXCHANGES */}
          {exchangeOpen && (
            <div 
              onMouseEnter={handleExchangeEnter}
              onMouseLeave={handleExchangeLeave}
              className="absolute top-full left-0 mt-1 w-[920px] rounded-3xl p-6 z-50 glass-panel animate-in fade-in duration-200 text-slate-950 shadow-2xl before:absolute before:-top-3 before:left-0 before:right-0 before:h-3 before:content-['']"
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200/80">
                <div>
                  <h4 className="text-sm font-black text-slate-950">
                    {t.exchangesMenu.title}
                  </h4>
                  <p className="text-xs text-slate-600 font-medium">
                    {t.exchangesMenu.subtitle}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => { onNavigateSection(1); setExchangeOpen(false); }}
                  className="text-xs font-mono font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer bg-transparent border-none"
                >
                  {currentLang === 'es' ? 'Ver pantalla completa (16 Venues) →' : 'View full screen (16 Venues) →'}
                </button>
              </div>

              <div className="flex gap-6 items-center">
                <div className="w-52 shrink-0 flex items-center justify-center p-1 bg-transparent border-none">
                  <LottieAnimation animationData={exchangeRadarData} className="w-48 h-48" />
                </div>

                <div className="flex-1 grid grid-cols-3 gap-3">
                  {/* COLUMNA 1 */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-500 px-2.5 pb-1">
                      {t.exchangesMenu.col1Title}
                    </span>
                    {col1.map((item, idx) => (
                      <div 
                        key={idx}
                        onClick={() => { onNavigateSection(1); setExchangeOpen(false); }}
                        className="group p-2.5 rounded-2xl transition-all duration-150 cursor-pointer flex items-center gap-3 border border-transparent hover:border-slate-300/80 hover:bg-[#ede5d6]/75 hover:shadow-sm"
                      >
                        <div className="shrink-0 transition-transform duration-150 group-hover:scale-110">
                          <ExchangeLogo name={item.name} size={24} />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-black text-slate-950 group-hover:text-blue-600 transition-colors truncate">
                            {item.name}
                          </span>
                          <span className="text-[11px] font-medium text-slate-600 group-hover:text-slate-900 transition-colors truncate">
                            {item.desc}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* COLUMNA 2 */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-500 px-2.5 pb-1">
                      {t.exchangesMenu.col2Title}
                    </span>
                    {col2.map((item, idx) => (
                      <div 
                        key={idx}
                        onClick={() => { onNavigateSection(1); setExchangeOpen(false); }}
                        className="group p-2.5 rounded-2xl transition-all duration-150 cursor-pointer flex items-center gap-3 border border-transparent hover:border-slate-300/80 hover:bg-[#ede5d6]/75 hover:shadow-sm"
                      >
                        <div className="shrink-0 transition-transform duration-150 group-hover:scale-110">
                          <ExchangeLogo name={item.name} size={24} />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-black text-slate-950 group-hover:text-blue-600 transition-colors truncate">
                            {item.name}
                          </span>
                          <span className="text-[11px] font-medium text-slate-600 group-hover:text-slate-900 transition-colors truncate">
                            {item.desc}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* COLUMNA 3 */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-500 px-2.5 pb-1">
                      {t.exchangesMenu.col3Title}
                    </span>
                    {col3.map((item, idx) => (
                      <div 
                        key={idx}
                        onClick={() => { onNavigateSection(1); setExchangeOpen(false); }}
                        className="group p-2.5 rounded-2xl transition-all duration-150 cursor-pointer flex items-center gap-3 border border-transparent hover:border-slate-300/80 hover:bg-[#ede5d6]/75 hover:shadow-sm"
                      >
                        <div className="shrink-0 transition-transform duration-150 group-hover:scale-110">
                          <ExchangeLogo name={item.name} size={24} />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-black text-slate-950 group-hover:text-blue-600 transition-colors truncate">
                            {item.name}
                          </span>
                          <span className="text-[11px] font-medium text-slate-600 group-hover:text-slate-900 transition-colors truncate">
                            {item.desc}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* PANTALLA 2: PROP FIRMS (FOCALIZADO ÚNICAMENTE EN activeSection === 2) */}
        <div 
          className="relative py-2"
          onMouseEnter={handlePropFirmsEnter}
          onMouseLeave={handlePropFirmsLeave}
        >
          <button 
            type="button"
            onClick={() => onNavigateSection(2)}
            className={`flex items-center gap-1.5 transition-colors cursor-pointer py-1.5 bg-transparent border-none ${
              activeSection === 2 
                ? 'text-blue-600 font-black' 
                : 'text-slate-950 hover:text-blue-600'
            }`}
          >
            <span>{t.nav.propFirms}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
          </button>

          {/* POPOVER CON CRISTAL LUMINOSO PARA PROP FIRMS */}
          {propFirmsOpen && (
            <div 
              onMouseEnter={handlePropFirmsEnter}
              onMouseLeave={handlePropFirmsLeave}
              className="absolute top-full left-0 mt-1 w-[920px] rounded-3xl p-6 z-50 glass-panel animate-in fade-in duration-200 text-slate-950 shadow-2xl before:absolute before:-top-3 before:left-0 before:right-0 before:h-3 before:content-['']"
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200/80">
                <div>
                  <h4 className="text-sm font-black text-slate-950">
                    {t.propFirmsMenu?.title || 'Directorio de Prop Firms Auditadas'}
                  </h4>
                  <p className="text-xs text-slate-600 font-medium">
                    {t.propFirmsMenu?.subtitle || 'Firmas líderes de fondeo compatibles con ZYTI Trade'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => { onNavigateSection(2); setPropFirmsOpen(false); }}
                  className="text-xs font-mono font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer bg-transparent border-none"
                >
                  {currentLang === 'es' ? 'Ver pantalla completa de Prop Firms →' : 'View full Prop Firms screen →'}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {/* COLUMNA 1 */}
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-500 px-2.5 pb-1">
                    {t.propFirmsMenu?.col1Title || 'Líderes Mundiales'}
                  </span>
                  {pfCol1.map((firm, idx) => (
                    <div 
                      key={idx}
                      onClick={() => { onNavigateSection(2); setPropFirmsOpen(false); }}
                      className="group p-2.5 rounded-2xl transition-all duration-150 cursor-pointer flex items-center gap-3 border border-transparent hover:border-slate-300/80 hover:bg-[#ede5d6]/75 hover:shadow-sm"
                    >
                      <div className="shrink-0 transition-transform duration-150 group-hover:scale-110">
                        <PropFirmLogo name={firm.name} size={26} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-black text-slate-950 group-hover:text-blue-600 transition-colors truncate">
                          {firm.name}
                        </span>
                        <span className="text-[11px] font-medium text-slate-600 group-hover:text-slate-900 transition-colors truncate">
                          {firm.desc}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* COLUMNA 2 */}
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-500 px-2.5 pb-1">
                    {t.propFirmsMenu?.col2Title || 'Flexibles & Algorítmicas'}
                  </span>
                  {pfCol2.map((firm, idx) => (
                    <div 
                      key={idx}
                      onClick={() => { onNavigateSection(2); setPropFirmsOpen(false); }}
                      className="group p-2.5 rounded-2xl transition-all duration-150 cursor-pointer flex items-center gap-3 border border-transparent hover:border-slate-300/80 hover:bg-[#ede5d6]/75 hover:shadow-sm"
                    >
                      <div className="shrink-0 transition-transform duration-150 group-hover:scale-110">
                        <PropFirmLogo name={firm.name} size={26} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-black text-slate-950 group-hover:text-blue-600 transition-colors truncate">
                          {firm.name}
                        </span>
                        <span className="text-[11px] font-medium text-slate-600 group-hover:text-slate-900 transition-colors truncate">
                          {firm.desc}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* COLUMNA 3 */}
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-500 px-2.5 pb-1">
                    {t.propFirmsMenu?.col3Title || 'Futuros & Especializadas'}
                  </span>
                  {pfCol3.map((firm, idx) => (
                    <div 
                      key={idx}
                      onClick={() => { onNavigateSection(2); setPropFirmsOpen(false); }}
                      className="group p-2.5 rounded-2xl transition-all duration-150 cursor-pointer flex items-center gap-3 border border-transparent hover:border-slate-300/80 hover:bg-[#ede5d6]/75 hover:shadow-sm"
                    >
                      <div className="shrink-0 transition-transform duration-150 group-hover:scale-110">
                        <PropFirmLogo name={firm.name} size={26} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-black text-slate-950 group-hover:text-blue-600 transition-colors truncate">
                          {firm.name}
                        </span>
                        <span className="text-[11px] font-medium text-slate-600 group-hover:text-slate-900 transition-colors truncate">
                          {firm.desc}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* PANTALLA 3: MENU SERVICIOS (FOCALIZADO ÚNICAMENTE EN activeSection === 3) */}
        <div 
          className="relative py-2"
          onMouseEnter={handleServicesEnter}
          onMouseLeave={handleServicesLeave}
        >
          <button 
            type="button"
            onClick={() => onNavigateSection(3)}
            className={`flex items-center gap-1.5 transition-colors cursor-pointer py-1.5 bg-transparent border-none ${
              activeSection === 3 
                ? 'text-blue-600 font-black' 
                : 'text-slate-950 hover:text-blue-600'
            }`}
          >
            <span>{t.nav.services}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
          </button>

          {servicesOpen && (
            <div 
              onMouseEnter={handleServicesEnter}
              onMouseLeave={handleServicesLeave}
              className="absolute top-full left-0 mt-1 w-[780px] rounded-3xl p-6 z-50 glass-panel animate-in fade-in duration-200 text-slate-950 shadow-2xl before:absolute before:-top-3 before:left-0 before:right-0 before:h-3 before:content-['']"
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200/80">
                <div>
                  <h4 className="text-sm font-black text-slate-950">
                    {t.servicesMenu.title}
                  </h4>
                  <p className="text-xs text-slate-600 font-medium">
                    {t.servicesMenu.subtitle}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => { onNavigateSection(3); setServicesOpen(false); }}
                  className="text-xs font-mono font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer bg-transparent border-none"
                >
                  {currentLang === 'es' ? 'Ver sección de servicios →' : 'View services section →'}
                </button>
              </div>

              <div className="flex gap-6 items-center">
                <div className="w-52 shrink-0 flex items-center justify-center p-1 bg-transparent border-none">
                  <LottieAnimation animationData={servicesAnimationData} className="w-48 h-48" />
                </div>

                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {servicesList.map((srv, idx) => (
                    <div 
                      key={idx}
                      onClick={() => { onNavigateSection(3); setServicesOpen(false); }}
                      className="group p-3.5 rounded-2xl transition-all duration-150 cursor-pointer flex flex-col justify-between border border-transparent hover:border-slate-300/80 hover:bg-[#ede5d6]/75 hover:shadow-sm"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-mono font-black text-blue-600">
                            0${idx + 1}
                          </span>
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 group-hover:scale-125 transition-transform" />
                        </div>
                        <span className="text-xs font-black text-slate-950 group-hover:text-blue-600 transition-colors block mb-1">
                          {srv.title}
                        </span>
                        <p className="text-[11px] font-medium leading-relaxed text-slate-600 group-hover:text-slate-900 transition-colors line-clamp-2">
                          {srv.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* PANTALLA 4: PRECIOS (activeSection === 4) */}
        <button 
          type="button"
          onClick={() => onNavigateSection(4)}
          className={`transition-colors cursor-pointer bg-transparent border-none p-0 ${
            activeSection === 4
              ? 'text-blue-600 font-black'
              : 'text-slate-950 hover:text-blue-600'
          }`}
        >
          {t.nav.pricing}
        </button>

        {/* PANTALLA 5: SEGURIDAD (activeSection === 5) */}
        <button 
          type="button"
          onClick={() => onNavigateSection(5)}
          className={`transition-colors cursor-pointer bg-transparent border-none p-0 ${
            activeSection === 5
              ? 'text-blue-600 font-black'
              : 'text-slate-950 hover:text-blue-600'
          }`}
        >
          {t.nav.security}
        </button>

        {/* PANTALLA 6: DESCARGAR (activeSection === 6) */}
        <button 
          type="button"
          onClick={() => onNavigateSection(6)}
          className={`transition-colors cursor-pointer bg-transparent border-none p-0 ${
            activeSection === 6
              ? 'text-blue-600 font-black'
              : 'text-slate-950 hover:text-blue-600'
          }`}
        >
          {t.nav.download}
        </button>
      </div>

      {/* 3. ACCIONES LATERALES (IDIOMA + ACCEDER) SIN BORDES */}
      <div className={`flex items-center transition-all duration-300 shrink-0 ${
        isShifted ? 'gap-2.5' : 'gap-3.5'
      }`}>
        
        {/* SELECTOR IDIOMA */}
        <div className="relative">
          <button 
            onClick={() => setLangOpen(!langOpen)}
            className={`flex items-center gap-1.5 rounded-xl transition-colors cursor-pointer border-none bg-transparent ${
              isShifted ? 'px-2 py-1.5 text-xs font-bold' : 'px-2.5 py-2 text-xs font-bold'
            } text-slate-950 hover:bg-[#ede5d6]/70`}
          >
            <Globe className="w-3.5 h-3.5 text-slate-700" />
            <span className="text-slate-950 font-bold">{currentLang.toUpperCase()}</span>
            <ChevronDown className="w-3 h-3 text-slate-600" />
          </button>

          {langOpen && (
            <div className="absolute top-full mt-2 w-36 rounded-2xl p-1.5 z-50 right-0 bg-white/95 backdrop-blur-md shadow-2xl border border-slate-200 before:absolute before:-top-3 before:left-0 before:right-0 before:h-3 before:content-['']">
              <button
                type="button"
                onClick={() => { onLanguageChange('es'); setLangOpen(false); }}
                className={`w-full text-left px-3 py-2 text-xs font-black rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                  currentLang === 'es' 
                    ? 'bg-slate-950 shadow-sm' 
                    : 'hover:bg-[#ede5d6] text-slate-900'
                }`}
              >
                <span style={{ color: currentLang === 'es' ? '#ffffff' : '#0f172a' }}>Español</span>
                {currentLang === 'es' && <span style={{ color: '#ffffff' }} className="text-xs font-black">✓</span>}
              </button>
              <button
                type="button"
                onClick={() => { onLanguageChange('en'); setLangOpen(false); }}
                className={`w-full text-left px-3 py-2 text-xs font-black rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                  currentLang === 'en' 
                    ? 'bg-slate-950 shadow-sm' 
                    : 'hover:bg-[#ede5d6] text-slate-900'
                }`}
              >
                <span style={{ color: currentLang === 'en' ? '#ffffff' : '#0f172a' }}>English</span>
                {currentLang === 'en' && <span style={{ color: '#ffffff' }} className="text-xs font-black">✓</span>}
              </button>
            </div>
          )}
        </div>

        {/* BOTÓN OPERAR AHORA: MISMO COLOR (#eab308) Y TEXTO QUE EN HERO */}
        <button className={`font-black rounded-xl border-none transition-all cursor-pointer whitespace-nowrap bg-[#eab308] hover:bg-[#ca8a04] text-slate-950 shadow-sm transform hover:scale-105 active:scale-95 ${
          isShifted ? 'px-4 py-2 text-xs' : 'px-5 py-2.5 text-sm'
        }`}>
          {t.nav.signIn}
        </button>
      </div>

      {/* 3. CONTROLES MÓVILES (SOLO EN MÓVIL < 768px, SIN IDIOMA REPETIDO EN LA BARRA) */}
      <div className="md:hidden flex items-center">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2.5 rounded-xl bg-[#ede5d6] text-slate-950 border border-[#ded5c5] flex items-center justify-center cursor-pointer shadow-sm active:scale-95 transition-transform"
          aria-label="Menú de navegación"
        >
          {mobileMenuOpen ? <X className="w-5 h-5 text-slate-950" /> : <Menu className="w-5 h-5 text-slate-950" />}
        </button>
      </div>

      {/* 4. DRAWER / MODAL TÁCTIL MÓVIL (SOLO EN MÓVIL, IDIOMA INTEGRADO, SIN NÚMEROS) */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-3 top-16 sm:top-20 z-50 md:hidden warm-card rounded-3xl p-5 shadow-2xl border border-[#ded5c5] bg-[#fbf9f4]/98 backdrop-blur-2xl animate-zoom-in max-h-[calc(100vh-80px)] overflow-y-auto no-scrollbar">
          
          {/* SELECTOR DE IDIOMA INTEGRADO DENTRO DEL MENÚ MÓVIL */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#ede8df]">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-slate-700" />
              <span>{currentLang === 'es' ? 'Idioma' : 'Language'}</span>
            </span>
            <div className="flex items-center gap-1 bg-[#ede5d6] p-1 rounded-xl border border-[#ded5c5]">
              <button
                type="button"
                onClick={() => onLanguageChange('es')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentLang === 'es'
                    ? 'bg-[#0f172a] text-white shadow-sm'
                    : 'text-slate-800 hover:text-black'
                }`}
              >
                Español
              </button>
              <button
                type="button"
                onClick={() => onLanguageChange('en')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentLang === 'en'
                    ? 'bg-[#0f172a] text-white shadow-sm'
                    : 'text-slate-800 hover:text-black'
                }`}
              >
                English
              </button>
            </div>
          </div>

          {/* LISTA DE SECCIONES LIMPIA (SIN NÚMEROS) */}
          <div className="flex flex-col gap-2">
            {[
              { title: currentLang === 'es' ? 'Inicio / Terminal OS' : 'Home / Terminal OS', idx: 0 },
              { title: `${t.nav.exchanges} (16 Venues)`, idx: 1 },
              { title: `${t.nav.propFirms || 'Prop Firms'} (16 Firmas)`, idx: 2 },
              { title: t.nav.services, idx: 3 },
              { title: t.nav.pricing || 'Precios', idx: 4 },
              { title: t.nav.security, idx: 5 },
              { title: `${t.nav.download} & Apps`, idx: 6 },
            ].map(item => (
              <button
                key={item.idx}
                type="button"
                onClick={() => {
                  onNavigateSection(item.idx);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center justify-between p-3.5 rounded-2xl text-sm font-bold transition-all text-left cursor-pointer ${
                  activeSection === item.idx 
                    ? 'bg-[#eab308] text-slate-950 shadow-sm' 
                    : 'bg-white/80 hover:bg-white text-slate-900 border border-[#ede8df]'
                }`}
              >
                <span>{item.title}</span>
              </button>
            ))}

            <button
              type="button"
              onClick={() => {
                onNavigateSection(0);
                setMobileMenuOpen(false);
              }}
              className="mt-3 flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-[#eab308] text-slate-950 font-black text-sm shadow-md cursor-pointer transform active:scale-95 transition-transform"
            >
              <span>{t.nav.signIn}</span>
            </button>
          </div>
        </div>
      )}

    </header>
  );
};

export default Navbar;
