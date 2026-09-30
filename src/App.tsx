import React, { useState, useEffect, useRef } from 'react';
import { BackgroundTradingChart } from './components/BackgroundTradingChart';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ExchangesSection } from './components/ExchangesSection';
import { ServicesSection } from './components/ServicesSection';
import { Language } from './i18n/translations';

export const App: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeSection, setActiveSection] = useState<number>(0);

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
    window.history.replaceState(null, '', '/' + newLang);
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

  const navigateToSection = (index: number) => {
    setActiveSection(index);
    if (containerRef.current) {
      containerRef.current.scrollTo({
        left: index * window.innerWidth,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        container.scrollBy({
          left: e.deltaY * 1.4,
          behavior: 'auto'
        });
      }
    };

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      const index = Math.round(scrollLeft / window.innerWidth);
      if (index !== activeSection) {
        setActiveSection(index);
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('scroll', handleScroll);
    };
  }, [activeSection]);

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
    <div className={'relative h-screen w-screen overflow-hidden font-sans ' + (theme === 'dark' ? 'bg-[#0a0d14] text-white' : 'bg-[#fbf9f4] text-slate-900')}>
      {/* GRÁFICO DE FONDO */}
      <BackgroundTradingChart theme={theme} />

      {/* NAVBAR QUE SE COMPRIME ANIMADAMENTE HACIA LA IZQUIERDA AL HACER SCROLL */}
      <Navbar 
        currentLang={currentLang} 
        onLanguageChange={handleLanguageChange}
        theme={theme}
        onThemeToggle={handleThemeToggle}
        activeSection={activeSection}
        onNavigateSection={navigateToSection}
      />

      {/* VIEWPORT SLIDER HORIZONTAL */}
      <main 
        ref={containerRef}
        className="relative z-10 flex flex-row overflow-x-auto snap-x snap-mandatory h-screen w-screen no-scrollbar"
        style={{ scrollBehavior: 'smooth' }}
      >
        <HeroSection currentLang={currentLang} />
        <ExchangesSection currentLang={currentLang} isActive={activeSection === 1} />
        <ServicesSection currentLang={currentLang} isActive={activeSection === 2} />
      </main>

      {/* PROGRESS BAR INFERIOR */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-[#ede8df]/60 dark:bg-slate-900/60 z-50">
        <div 
          className="h-full bg-slate-950 dark:bg-white transition-all duration-300 ease-out"
          style={{ width: ((activeSection + 1) / 3) * 100 + '%' }}
        />
      </div>
    </div>
  );
};

export default App;
