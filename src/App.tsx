import React, { useState, useEffect } from 'react';
import { BackgroundTradingChart } from './components/BackgroundTradingChart';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ExchangesSection } from './components/ExchangesSection';
import { ServicesSection } from './components/ServicesSection';
import { Footer } from './components/Footer';
import { Language } from './i18n/translations';

export const App: React.FC = () => {
  // Detectar idioma inicial desde URL (/es o /en) o localStorage / navegador
  const getInitialLanguage = (): Language => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname.toLowerCase();
      if (pathname.startsWith('/es')) return 'es';
      if (pathname.startsWith('/en')) return 'en';
      const stored = localStorage.getItem('zyti_lang') as Language;
      if (stored === 'es' || stored === 'en') return stored;
      if (navigator.language.startsWith('es')) return 'es';
    }
    return 'en';
  };

  const [currentLang, setCurrentLang] = useState<Language>(getInitialLanguage);

  const handleLanguageChange = (newLang: Language) => {
    setCurrentLang(newLang);
    localStorage.setItem('zyti_lang', newLang);
    window.history.replaceState(null, '', `/${newLang}`);
    document.documentElement.lang = newLang;
  };

  useEffect(() => {
    document.documentElement.lang = currentLang;
  }, [currentLang]);

  return (
    <div className="relative min-h-screen font-sans selection:bg-blue-600 selection:text-white">
      {/* 1. GRÁFICO DE FONDO TIPO TRADINGVIEW EN TONALIDAD CLARA */}
      <BackgroundTradingChart />

      {/* 2. OVERLAY SUPERIOR CLARO TRANSPARENTE CON BACKDROP BLUR */}
      <div className="relative z-10 min-h-screen bg-white/40 backdrop-blur-[6px]">
        {/* BARRA DE NAVEGACIÓN CON MENÚS AL HOVER */}
        <Navbar currentLang={currentLang} onLanguageChange={handleLanguageChange} />

        {/* SECCIÓN HERO MINIMALISTA */}
        <HeroSection currentLang={currentLang} />

        {/* SECCIÓN DE EXCHANGES */}
        <ExchangesSection currentLang={currentLang} />

        {/* SECCIÓN DE SERVICIOS */}
        <ServicesSection currentLang={currentLang} />

        {/* FOOTER */}
        <Footer currentLang={currentLang} />
      </div>
    </div>
  );
};

export default App;
