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
    }
    return 'es';
  };

  const [currentLang, setCurrentLang] = useState<Language>(getInitialLanguage);

  const handleLanguageChange = (newLang: Language) => {
    setCurrentLang(newLang);
    localStorage.setItem('zyti_lang', newLang);
    window.history.replaceState(null, '', `/${newLang}`);
    document.documentElement.lang = newLang;
  };

  // 2. Tema: por defecto siempre LIGHT
  const getInitialTheme = (): 'light' | 'dark' => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('zyti_theme');
      if (stored === 'dark') return 'dark';
    }
    return 'light';
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
      document.body.style.backgroundColor = '#090d16';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#ffffff';
    }
  }, [theme]);

  return (
    <div className={`relative min-h-screen font-sans ${theme === 'dark' ? 'bg-[#090d16] text-white' : 'bg-white text-slate-900'}`}>
      {/* 1. GRÁFICO DE FONDO TIPO TRADINGVIEW */}
      <BackgroundTradingChart theme={theme} />

      {/* 2. OVERLAY SEMITRANSPARENTE EQUILIBRADO CON BLUR (Permite ver el gráfico sin oscurecer) */}
      <div className={`relative z-10 min-h-screen pt-16 transition-colors duration-250 ${
        theme === 'dark' 
          ? 'bg-slate-950/60 backdrop-blur-[8px]' 
          : 'bg-white/55 backdrop-blur-[7px]'
      }`}>
        {/* BARRA DE NAVEGACIÓN FIJA ARRIBA DE LADO A LADO */}
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
