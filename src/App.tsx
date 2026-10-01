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
import { TradingTerminal } from './components/TradingTerminal';
import { TerminalErrorBoundary } from './components/TerminalErrorBoundary';
import { TelegramOnboardingApp } from './components/TelegramOnboardingApp';
import { NotFoundPage } from './components/NotFoundPage';
import { getStoredSession, setStoredSession, UserSession, supabase } from './lib/supabase';
import { Language } from './i18n/translations';

export const App: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeSection, setActiveSection] = useState<number>(0);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Detección de subdominio (ej: zytiterminal.zytitrade.com o zytiterminal.*)
  const isTerminalSubdomain = (): boolean => {
    if (typeof window === 'undefined') return false;
    const host = window.location.hostname.toLowerCase();
    return host.startsWith('zytiterminal.') || host === 'zytiterminal.zytitrade.com';
  };

  const getInitialSymbolFromUrl = (): string | undefined => {
    if (typeof window === 'undefined') return undefined;
    const match = window.location.pathname.match(/(?:\/(?:es|en))?\/trade\/([a-zA-Z0-9_-]+)/i);
    return match?.[1] ? match[1].toUpperCase() : undefined;
  };

  const getInitialView = (): 'landing' | 'terminal' | 'tg-onboarding' | 'not-found' => {
    if (typeof window !== 'undefined') {
      const rawPath = window.location.pathname.toLowerCase();
      const pathname = rawPath.replace(/\/$/, '') || '/';
      if (pathname.includes('/tg-onboarding') || pathname.includes('/tgonboarding')) return 'tg-onboarding';
      if (isTerminalSubdomain()) return 'terminal';
      if (pathname.includes('/zytiterminal')) return 'terminal';
      // Rutas dinámicas por par de trading (/trade/BTCUSDT, /es/trade/ETHUSDT, etc.)
      if (pathname.match(/^(\/(es|en))?\/trade(\/[a-zA-Z0-9_-]+)?$/i)) return 'terminal';
      if (pathname === '/404' || pathname === '/es/404' || pathname === '/en/404') return 'not-found';
      
      const validPaths = ['', '/', '/es', '/en'];
      if (!validPaths.includes(pathname)) {
        return 'not-found';
      }
    }
    return 'landing';
  };

  const [currentView, setCurrentView] = useState<'landing' | 'terminal' | 'tg-onboarding' | 'not-found'>(getInitialView);
  const [urlSymbol, setUrlSymbol] = useState<string | undefined>(getInitialSymbolFromUrl);
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
    if (isTerminalSubdomain()) {
      window.history.replaceState(null, '', '/' + newLang);
    } else {
      const isTerminal = currentView === 'terminal' || window.location.pathname.toLowerCase().includes('/zytiterminal');
      const targetPath = isTerminal ? `/${newLang}/zytiterminal` : `/${newLang}`;
      window.history.replaceState(null, '', targetPath);
    }
    document.documentElement.lang = newLang;
  };

  const navigateToTerminal = () => {
    setCurrentView('terminal');
    if (!isTerminalSubdomain()) {
      const targetPath = `/${currentLang}/zytiterminal`;
      if (window.location.pathname.toLowerCase() !== targetPath.toLowerCase()) {
        window.history.pushState({ view: 'terminal' }, '', targetPath);
      }
    }
  };

  const navigateToLanding = () => {
    if (isTerminalSubdomain()) {
      window.location.href = 'https://zytitrade.com';
      return;
    }
    setCurrentView('landing');
    const targetPath = `/${currentLang}`;
    if (window.location.pathname.toLowerCase() !== targetPath.toLowerCase()) {
      window.history.pushState({ view: 'landing' }, '', targetPath);
    }
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

  // ── OAuth Popup: si esta ventana fue abierta como popup de OAuth,
  //    cerrarse sola una vez que Supabase guarda la sesión en localStorage
  useEffect(() => {
    const isPopup = !!window.opener && window.opener !== window;
    if (!isPopup) return;

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === 'SIGNED_IN' || event === 'USER_UPDATED')) {
        // Notificar al padre antes de cerrar
        try { window.opener.postMessage({ type: 'ZYTI_AUTH_SUCCESS' }, window.location.origin); } catch {}
        setTimeout(() => window.close(), 300);
      }
    });
    return () => listener?.subscription?.unsubscribe?.();
  }, []);

  // ── Sincronización cross-window: cuando el popup OAuth escribe la sesión,
  //    el padre la detecta via el evento 'storage' de localStorage
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key !== 'zyti_user_session' && !e.key?.startsWith('sb-')) return;
      // Leer la sesión directa de Supabase
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user && !currentUser) {
          supabase.auth.getUser().then(({ data: { user } }) => {
            if (!user) return;
            const userSession: UserSession = {
              id: user.id,
              email: user.email || '',
              name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Trader',
              avatarUrl: user.user_metadata?.avatar_url,
              provider: (user.app_metadata?.provider as any) || 'email',
              role: user.email?.toLowerCase().includes('admin@') ? 'admin' : 'trader',
              accounts: [],
              activeAccountId: undefined
            };
            setStoredSession(userSession);
            setCurrentUser(userSession);
            setAuthModalOpen(false);
            navigateToTerminal();
          });
        }
      });
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [currentUser]);


  // Sincronización con el historial del navegador (atrás/adelante)
  useEffect(() => {
    const handlePopState = () => {
      if (isTerminalSubdomain()) {
        setCurrentView('terminal');
        return;
      }
      const rawPath = window.location.pathname.toLowerCase();
      const path = rawPath.replace(/\/$/, '') || '/';
      if (path.includes('/tg-onboarding') || path.includes('/tgonboarding')) {
        setCurrentView('tg-onboarding');
      } else if (path.includes('/zytiterminal') || path.match(/^(\/(es|en))?\/trade(\/[a-zA-Z0-9_-]+)?$/i)) {
        setCurrentView('terminal');
        const match = window.location.pathname.match(/(?:\/(?:es|en))?\/trade\/([a-zA-Z0-9_-]+)/i);
        if (match && match[1]) {
          setUrlSymbol(match[1].toUpperCase());
        }
      } else if (path === '/404' || path === '/es/404' || path === '/en/404' || (!['', '/', '/es', '/en'].includes(path))) {
        setCurrentView('not-found');
      } else {
        setCurrentView('landing');
      }
      if (path.startsWith('/en')) {
        setCurrentLang('en');
      } else if (path.startsWith('/es')) {
        setCurrentLang('es');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleLogout = async () => {
    // 1. Cerrar sesión en Supabase
    try { await supabase.auth.signOut(); } catch {}

    // 2. Limpiar sesión local y estado de la terminal demo
    setStoredSession(null);
    setCurrentUser(null);
    try {
      localStorage.removeItem('zyti_user_session');
      localStorage.removeItem('zyti_demo_balance');
      localStorage.removeItem('zyti_limit_orders');
      localStorage.removeItem('zyti_daily_start_equity');
    } catch {}

    // 3. Navegar a la landing y abrir el modal de login
    //    Usamos un pequeño delay para que el cambio de vista se aplique antes de abrir el modal
    navigateToLanding();
    setTimeout(() => setAuthModalOpen(true), 80);
  };

  const TOTAL_SCREENS = 8;

  const handleOpenTerminalOrAuth = () => {
    if (currentUser) {
      navigateToTerminal();
    } else {
      setAuthModalOpen(true);
    }
  };

  // Vista de Telegram Mini App Onboarding (abierta desde el bot)
  if (currentView === 'tg-onboarding') {
    return <TelegramOnboardingApp />;
  }

  // Vista de Error 404 (Página no encontrada con animación Lottie institucional)
  if (currentView === 'not-found') {
    return (
      <>
        <NotFoundPage 
          currentLang={currentLang}
          onTradeNow={handleOpenTerminalOrAuth}
          onNavigateHome={navigateToLanding}
        />
        <AuthModal 
          isOpen={authModalOpen} 
          onClose={() => setAuthModalOpen(false)} 
          currentLang={currentLang} 
          onLoginSuccess={(u) => { 
            setCurrentUser(u); 
            navigateToTerminal(); 
          }} 
        />
      </>
    );
  }

  // Vista de Terminal de Trading (Abierta tanto para usuarios autenticados como visitantes en modo live chart)
  if (currentView === 'terminal') {
    return (
      <TerminalErrorBoundary onExit={handleLogout} lang={currentLang}>
        <TradingTerminal 
          currentLang={currentLang} 
          user={currentUser} 
          initialSymbol={urlSymbol}
          onExit={handleLogout} 
          onOpenAuth={() => setAuthModalOpen(true)}
          onLanguageChange={handleLanguageChange}
          onUpdateUser={(updated) => {
            setCurrentUser(updated);
            setStoredSession(updated);
          }}
        />
        <AuthModal 
          isOpen={authModalOpen} 
          onClose={() => setAuthModalOpen(false)} 
          currentLang={currentLang} 
          onLoginSuccess={(u) => { 
            setCurrentUser(u); 
            setStoredSession(u);
            setAuthModalOpen(false);
          }} 
        />
      </TerminalErrorBoundary>
    );
  }

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
        onOpenAuth={handleOpenTerminalOrAuth}
        onExplore={navigateToTerminal}
        currentUser={currentUser}
      />

      {/* VIEWPORT SLIDER HORIZONTAL CON TODAS LAS PANTALLAS */}
      <main 
        ref={containerRef}
        className="relative z-10 flex flex-row overflow-x-auto snap-x snap-mandatory h-[100dvh] w-screen no-scrollbar"
        style={{ scrollBehavior: 'smooth' }}
      >
        {/* PANTALLA 0: HERO / INICIO */}
        <HeroSection 
          currentLang={currentLang} 
          onOpenAuth={handleOpenTerminalOrAuth} 
          onExplore={navigateToTerminal} 
        />

        {/* PANTALLA 1: EXCHANGES */}
        <ExchangesSection currentLang={currentLang} isActive={activeSection === 1} onOpenAuth={handleOpenTerminalOrAuth} />

        {/* PANTALLA 2: PROP FIRMS (AUDITED DIRECTORY) */}
        <PropFirmsSection currentLang={currentLang} isActive={activeSection === 2} onOpenAuth={handleOpenTerminalOrAuth} />

        {/* PANTALLA 3: SERVICIOS */}
        <ServicesSection currentLang={currentLang} isActive={activeSection === 3} onOpenAuth={handleOpenTerminalOrAuth} />

        {/* PANTALLA 4: PRECIOS */}
        <PricingSection currentLang={currentLang} isActive={activeSection === 4} onOpenAuth={handleOpenTerminalOrAuth} />

        {/* PANTALLA 5: SEGURIDAD */}
        <SecuritySection currentLang={currentLang} isActive={activeSection === 5} onOpenAuth={handleOpenTerminalOrAuth} />

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
        onLoginSuccess={(u) => { 
          setCurrentUser(u); 
          navigateToTerminal(); 
        }} 
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
