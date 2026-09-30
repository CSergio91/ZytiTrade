import React, { useState, useEffect } from 'react';
import { BackgroundTradingChart } from './components/BackgroundTradingChart';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ExchangesSection } from './components/ExchangesSection';
import { ServicesSection } from './components/ServicesSection';
import { Footer } from './components/Footer';
import { Language } from './i18n/translations';

export const App: React.FC = () => {
  // 1. Idioma
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

  // 2. Tema: por defecto siempre LIGHT (Blanco Puro) a menos que esté en localStorage
  const getInitialTheme = (): 'light' | 'dark' => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('zyti_theme');
      if (stored === 'light' || stored === 'dark') return stored;
    }
    return 'light'; // MODO CLARO BLANCO PURO POR DEFECTO
  };

  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme);

  const handleThemeToggle = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('zyti_theme', nextTheme);
  };

  useEffect(() => {
    document.documentElement.lang = currentLang;
  }, [currentLang]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className="relative min-h-screen bg-white dark:bg-[#090d16] font-sans selection:bg-blue-600 selection:text-white">
      {/* 1. GRÁFICO DE FONDO TIPO TRADINGVIEW: 100% BLANCO PURO O DARK OBSIDIAN */}
      <BackgroundTradingChart theme={theme} />

      {/* 2. CAPA SUPERIOR: EN LIGHT ES 100% TRANSPARENTE SIN VELOS GRISES */}
      <div className="relative z-10 min-h-screen bg-transparent dark:bg-slate-950/75 dark:backdrop-blur-md transition-colors duration-200">
        {/* BARRA DE NAVEGACIÓN */}
        <Navbar 
          currentLang={currentLang} 
          onLanguageChange={handleLanguageChange}
          theme={theme}
          onThemeToggle={handleThemeToggle}
        />

        {/* HERO SECTION */}
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
