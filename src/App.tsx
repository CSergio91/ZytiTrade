import React, { useState, useEffect, useRef } from 'react';
import { BackgroundTradingChart } from './components/BackgroundTradingChart';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ExchangesSection } from './components/ExchangesSection';
import { PropFirmsSection } from './components/PropFirmsSection';
import { ServicesSection } from './components/ServicesSection';
import { PricingSection } from './components/PricingSection';
import { SecuritySection } from './components/SecuritySection';
import { DownloadSection } from './components/DownloadSection';
import { FooterSection } from './components/FooterSection';
import { AuthModal } from './components/AuthModal';
import { getStoredSession, UserSession } from './lib/supabase';
import { Language } from './i18n/translations';

export const App: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeSection, setActiveSection] = useState<number>(0);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserSession | null>(getStoredSession);

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

  // Light mode only - permanent institutional aesthetic
  const theme: 'light' | 'dark' = 'light';

  const navigateToSection = (index: number) => {
    setActiveSection(index);
    if (containerRef.current) {
      const screenWidth = containerRef.current.clientWidth || window.innerWidth;
      containerRef.current.scrollTo({
        left: index * screenWidth,
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
          left: e.deltaY * 1.3,
          behavior: 'auto'
        });
      }
    };

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      const screenWidth = container.clientWidth || window.innerWidth;
      const index = Math.round(scrollLeft / screenWidth);
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
    document.documentElement.classList.remove('dark');
    document.body.style.backgroundColor = '#fbf9f4';
    try {
      localStorage.setItem('zyti_theme', 'light');
    } catch (_) {}
  }, []);

  const TOTAL_SCREENS = 8;

  return (
    <div className="relative h-[100dvh] w-screen overflow-hidden font-sans bg-[#fbf9f4] text-slate-900">
      {/* GRÁFICO DE FONDO */}
      <BackgroundTradingChart theme={theme} />

      {/* NAVBAR: SIN BORDE Y SIN FONDO INCLUSO CUANDO SE ACHICA AL HACER SCROLL */}
      <Navbar 
        currentLang={currentLang} 
        onLanguageChange={handleLanguageChange}
        activeSection={activeSection}
        onNavigateSection={navigateToSection}
        onOpenAuth={() => setAuthModalOpen(true)}
        currentUser={currentUser}
      />

      {/* VIEWPORT SLIDER HORIZONTAL CON TODAS LAS PANTALLAS */}
      <main 
        ref={containerRef}
        className="relative z-10 flex flex-row overflow-x-auto snap-x snap-mandatory h-[100dvh] w-screen no-scrollbar"
        style={{ scrollBehavior: 'smooth' }}
      >
        {/* PANTALLA 0: HERO / INICIO */}
        <HeroSection currentLang={currentLang} onOpenAuth={() => setAuthModalOpen(true)} />

        {/* PANTALLA 1: EXCHANGES */}
        <ExchangesSection currentLang={currentLang} isActive={activeSection === 1} onOpenAuth={() => setAuthModalOpen(true)} />

        {/* PANTALLA 2: PROP FIRMS (AUDITED DIRECTORY) */}
        <PropFirmsSection currentLang={currentLang} isActive={activeSection === 2} onOpenAuth={() => setAuthModalOpen(true)} />

        {/* PANTALLA 3: SERVICIOS */}
        <ServicesSection currentLang={currentLang} isActive={activeSection === 3} onOpenAuth={() => setAuthModalOpen(true)} />

        {/* PANTALLA 4: PRECIOS */}
        <PricingSection currentLang={currentLang} isActive={activeSection === 4} onOpenAuth={() => setAuthModalOpen(true)} />

        {/* PANTALLA 5: SEGURIDAD */}
        <SecuritySection currentLang={currentLang} isActive={activeSection === 5} onOpenAuth={() => setAuthModalOpen(true)} />

        {/* PANTALLA 6: DESCARGAR */}
        <DownloadSection currentLang={currentLang} isActive={activeSection === 6} />

        {/* PANTALLA 7: FOOTER (CARGA ANIMADO DESDE ABAJO) */}
        <FooterSection currentLang={currentLang} isActive={activeSection === 7} onNavigateSection={navigateToSection} />
      </main>

      {/* MODAL INSTITUCIONAL DE AUTENTICACIÓN (LOGIN / REGISTRO / DEMO) */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        currentLang={currentLang} 
        onLoginSuccess={(u) => setCurrentUser(u)} 
      />

      {/* PROGRESS BAR INFERIOR DE 6 PANTALLAS */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-[#ede8df]/60 dark:bg-slate-900/60 z-50">
        <div 
          className="h-full bg-slate-950 dark:bg-white transition-all duration-300 ease-out"
          style={{ width: ((activeSection + 1) / TOTAL_SCREENS) * 100 + '%' }}
        />
      </div>
    </div>
  );
};

export default App;
