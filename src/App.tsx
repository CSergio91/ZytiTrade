import React, { useState, useEffect } from 'react';
import { BackgroundTradingChart } from './components/BackgroundTradingChart';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ExchangesSection } from './components/ExchangesSection';
import { ServicesSection } from './components/ServicesSection';
import { Footer } from './components/Footer';
import { Language } from './i18n/translations';

export const App: React.FC = () => {
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
      document.body.style.backgroundColor = '#0a0d14';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#fbf9f4';
    }
  }, [theme]);

  return (
    <div className={`relative min-h-screen font-sans ${theme === 'dark' ? 'bg-[#0a0d14] text-white' : 'bg-[#fbf9f4] text-slate-900'}`}>
      {/* 1. GRÁFICO DE FONDO SUTIL */}
      <BackgroundTradingChart theme={theme} />

      {/* 2. CONTENIDO PRINCIPAL */}
      <div className="relative z-10 min-h-screen">
        <Navbar 
          currentLang={currentLang} 
          onLanguageChange={handleLanguageChange}
          theme={theme}
          onThemeToggle={handleThemeToggle}
        />

        <HeroSection currentLang={currentLang} />

        <ExchangesSection currentLang={currentLang} />

        <ServicesSection currentLang={currentLang} />

        <Footer currentLang={currentLang} />
      </div>
    </div>
  );
};

export default App;
