import React, { useState } from 'react';
import { ArrowLeftRight, LogOut, Repeat, X, SlidersHorizontal, BookOpen, ListFilter, Check, ChevronDown, ChevronRight, User } from 'lucide-react';
import { UserSession } from '../../lib/supabase';

interface TerminalSideNavProps {
  isEs: boolean;
  navPosition: 'left' | 'right';
  isMobileNavOpen: boolean;
  activeSection: string;
  user?: UserSession | null;
  isTradingSidebarOpen?: boolean;
  showOrderForm?: boolean;
  showOrderBook?: boolean;
  showPositions?: boolean;
  onOpenTradingPanel?: () => void;
  onToggleTradingSidebar?: () => void;
  onToggleOrderForm?: () => void;
  onToggleOrderBook?: () => void;
  onTogglePositions?: () => void;
  onToggleNavPosition: () => void;
  onSelectSection: (section: 'none' | 'exchange' | string) => void;
  onCloseMobileNav: () => void;
  onExit: () => void;
}

// Icono personalizado de Velas Japonesas en blanco, negro y una roja
export const JapaneseCandlesticksIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${className} shrink-0`}
  >
    {/* Vela 1: Blanca con contorno y mecha negra */}
    <line x1="4.5" y1="2" x2="4.5" y2="18" stroke="#0f172a" strokeWidth="1.25" strokeLinecap="round" />
    <rect x="2.5" y="6" width="4" height="7" rx="0.5" fill="#ffffff" stroke="#0f172a" strokeWidth="1.25" />

    {/* Vela 2: Roja viva sólida */}
    <line x1="10" y1="1.5" x2="10" y2="18.5" stroke="#ef4444" strokeWidth="1.25" strokeLinecap="round" />
    <rect x="8" y="4" width="4" height="9" rx="0.5" fill="#ef4444" stroke="#dc2626" strokeWidth="0.5" />

    {/* Vela 3: Negra sólida */}
    <line x1="15.5" y1="3" x2="15.5" y2="17" stroke="#0f172a" strokeWidth="1.25" strokeLinecap="round" />
    <rect x="13.5" y="7" width="4" height="6" rx="0.5" fill="#0f172a" />
  </svg>
);

export const TerminalSideNav: React.FC<TerminalSideNavProps> = ({
  isEs,
  navPosition,
  isMobileNavOpen,
  activeSection,
  user,
  isTradingSidebarOpen = true,
  showOrderForm = true,
  showOrderBook = true,
  showPositions = true,
  onOpenTradingPanel,
  onToggleTradingSidebar,
  onToggleOrderForm,
  onToggleOrderBook,
  onTogglePositions,
  onToggleNavPosition,
  onSelectSection,
  onCloseMobileNav,
  onExit
}) => {
  const [isClickedExpanded, setIsClickedExpanded] = useState(false);
  const [isTradingSubmenuOpen, setIsTradingSubmenuOpen] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('zyti_trading_submenu_open');
      return saved !== null ? saved !== 'false' : true;
    } catch {
      return true;
    }
  });

  const handleToggleTradingSubmenu = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsTradingSubmenuOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('zyti_trading_submenu_open', String(next));
      } catch {}
      return next;
    });
  };

  return (
    <>
      {/* 1. BARRA LATERAL EN ESCRITORIO (>= 1024px) */}
      <aside 
        className="terminal-side-nav"
        onMouseLeave={() => setIsClickedExpanded(false)}
      >
        {/* Contenedor base de 48px para reservar el espacio permanente en el layout */}
        <div className={`w-12 h-full ${navPosition === 'left' ? 'border-r' : 'border-l'} border-[#ded5c5] bg-[#fbf9f4]`} />
        
        {/* Menú flotante al hover o al click que vuela por encima del gráfico sin redimensionarlo ni empujarlo */}
        <div 
          onMouseLeave={() => setIsClickedExpanded(false)}
          className={`absolute top-0 bottom-0 ${navPosition === 'left' ? 'left-0 border-r' : 'right-0 border-l'} ${
            isClickedExpanded ? 'w-64 shadow-2xl' : 'w-12 hover:w-64 shadow-xs hover:shadow-2xl'
          } bg-[#fbf9f4] border-[#ded5c5] transition-all duration-300 ease-out flex flex-col justify-between py-3 px-1.5 group z-40 overflow-hidden`}
        >
          {/* SECCIONES ARRIBA */}
          <div className="space-y-2">
            {/* SECCIÓN 1: TRADING CON SUBMENÚS */}
            <div className="space-y-1">
              <div
                className={`w-full flex items-center justify-between p-1.5 rounded-xl transition-all ${
                  isTradingSidebarOpen && showOrderForm
                    ? 'bg-amber-100/90 text-amber-950 font-black shadow-xs'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-white/90'
                }`}
              >
                {/* Botón principal Trading: Abre panel si está oculto y expande opciones */}
                <button
                  type="button"
                  onClick={() => {
                    setIsClickedExpanded(true);
                    setIsTradingSubmenuOpen(true);
                    try { localStorage.setItem('zyti_trading_submenu_open', 'true'); } catch {}
                    if (onOpenTradingPanel) {
                      onOpenTradingPanel();
                    } else if (onToggleTradingSidebar) {
                      onToggleTradingSidebar();
                    }
                  }}
                  className="flex items-center gap-3 flex-1 text-left cursor-pointer outline-none py-0.5"
                  title={isEs ? 'Mostrar Panel de Trading' : 'Show Trading Panel'}
                >
                  <div className="w-6 h-6 flex items-center justify-center shrink-0">
                    <JapaneseCandlesticksIcon className="w-4.5 h-4.5" />
                  </div>
                  <span className={`text-xs font-bold whitespace-nowrap ${isClickedExpanded ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity duration-200`}>
                    Trading
                  </span>
                </button>

                {/* Botón chevron desacoplado para colapsar/desplegar submenú */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsClickedExpanded(true);
                    handleToggleTradingSubmenu(e);
                  }}
                  className={`p-1 rounded-md hover:bg-amber-200/70 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer outline-none ${
                    isClickedExpanded ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}
                  title={isTradingSubmenuOpen ? (isEs ? 'Plegar submenú' : 'Collapse submenu') : (isEs ? 'Desplegar submenú' : 'Expand submenu')}
                >
                  {isTradingSubmenuOpen ? <ChevronDown className="w-3.5 h-3.5 text-amber-900" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
                </button>
              </div>

              {/* SUBMENÚ DE PANELES DE TRADING */}
              {isTradingSubmenuOpen && (
                <div className={`pl-3 pr-1 py-1 space-y-1 ${isClickedExpanded ? 'block' : 'hidden group-hover:block'} transition-all`}>
                  {/* SUBITEM 1: FORMULARIO DE ÓRDENES */}
                  {onToggleOrderForm && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsClickedExpanded(true);
                        onToggleOrderForm();
                      }}
                      className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-[11px] font-medium text-slate-700 hover:text-slate-950 hover:bg-white transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <SlidersHorizontal className="w-3 h-3 text-slate-500" />
                        <span className="whitespace-nowrap">{isEs ? 'Panel de Órdenes' : 'Order Form'}</span>
                      </div>
                      <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${
                        showOrderForm ? 'bg-amber-500 border-amber-600 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {showOrderForm && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                    </button>
                  )}

                  {/* SUBITEM 2: LIBRO DE ÓRDENES */}
                  {onToggleOrderBook && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsClickedExpanded(true);
                        onToggleOrderBook();
                      }}
                      className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-[11px] font-medium text-slate-700 hover:text-slate-950 hover:bg-white transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-3 h-3 text-slate-500" />
                        <span className="whitespace-nowrap">{isEs ? 'Libro de Órdenes' : 'Order Book'}</span>
                      </div>
                      <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${
                        showOrderBook ? 'bg-amber-500 border-amber-600 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {showOrderBook && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                    </button>
                  )}

                  {/* SUBITEM 3: POSICIONES Y ÓRDENES PENDIENTES */}
                  {onTogglePositions && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsClickedExpanded(true);
                        onTogglePositions();
                      }}
                      className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-[11px] font-medium text-slate-700 hover:text-slate-950 hover:bg-white transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <ListFilter className="w-3 h-3 text-slate-500" />
                        <span className="whitespace-nowrap">{isEs ? 'Posiciones & Órdenes' : 'Positions & Orders'}</span>
                      </div>
                      <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${
                        showPositions ? 'bg-amber-500 border-amber-600 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {showPositions && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* SECCIÓN 2: EXCHANGE */}
            <button
              type="button"
              onClick={() => {
                onSelectSection(activeSection === 'exchange' ? 'none' : 'exchange');
                setIsClickedExpanded(!isClickedExpanded);
              }}
              className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all cursor-pointer ${
                activeSection === 'exchange'
                  ? 'bg-amber-100 text-amber-950 font-black shadow-xs'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-white/80'
              }`}
              title="Exchange"
            >
              <div className="w-6 h-6 flex items-center justify-center shrink-0">
                <Repeat className={`w-4 h-4 ${activeSection === 'exchange' ? 'text-amber-600' : 'text-slate-700'}`} />
              </div>
              <span className={`text-xs font-bold whitespace-nowrap ${isClickedExpanded ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity duration-200`}>
                Exchange
              </span>
            </button>
          </div>

          {/* PIE DE NAVEGACIÓN ABAJO: PERFIL DE USUARIO + CAMBIAR SENTIDO + CERRAR SESIÓN */}
          <div className="pt-2 border-t border-slate-200 space-y-1.5">
            {/* BADGE DE PERFIL DE USUARIO EN ESCRITORIO */}
            <div 
              className={`w-full flex items-center gap-2 p-1.5 rounded-xl bg-amber-500/10 border border-amber-300/70 overflow-hidden select-none transition-all ${
                isClickedExpanded ? 'justify-start' : 'justify-center group-hover:justify-start'
              }`}
              title={user?.name || user?.email || (isEs ? 'Perfil de Usuario' : 'User Profile')}
            >
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name || 'User'} className="w-6 h-6 rounded-full object-cover shrink-0 border border-amber-400" />
              ) : user?.provider === 'telegram' ? (
                <div className="w-6 h-6 rounded-full bg-[#229ED9] flex items-center justify-center shrink-0 shadow-xs">
                  <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/></svg>
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-amber-500 text-amber-950 font-black text-[11px] flex items-center justify-center shrink-0">
                  {user?.name?.[0]?.toUpperCase() || user?.telegramUsername?.[0]?.toUpperCase() || 'T'}
                </div>
              )}
              <div className={`flex flex-col text-left leading-tight min-w-0 ${isClickedExpanded ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity duration-200`}>
                <span className="text-[11px] font-black text-slate-900 truncate">
                  {user?.name || (user?.telegramUsername ? `@${user.telegramUsername}` : (user?.email && !user.email.endsWith('@telegram.org') ? user.email.split('@')[0] : 'Trader'))}
                </span>
                <span className="text-[9px] font-bold text-amber-800 truncate">
                  {user?.telegramUsername ? `@${user.telegramUsername}` : (user?.role === 'admin' ? 'Admin' : (isEs ? 'Trader Activo' : 'Active Trader'))}
                </span>
              </div>
            </div>

            {/* BOTÓN CAMBIO DE POSICIÓN IZQUIERDA / DERECHA */}
            <button
              type="button"
              onClick={onToggleNavPosition}
              className="w-full flex items-center gap-3 p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-white/80 transition-colors cursor-pointer"
              title={navPosition === 'left' ? (isEs ? 'Mover menú a la derecha' : 'Move menu to right') : (isEs ? 'Mover menú a la izquierda' : 'Move menu to left')}
            >
              <div className="w-6 h-6 flex items-center justify-center shrink-0">
                <ArrowLeftRight className="w-4 h-4 text-slate-600" />
              </div>
              <span className={`text-xs font-bold whitespace-nowrap ${isClickedExpanded ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity duration-200`}>
                {navPosition === 'left' ? (isEs ? 'Mover a Derecha' : 'Move to Right') : (isEs ? 'Mover a Izquierda' : 'Move to Left')}
              </span>
            </button>

            {/* BOTÓN CERRAR SESIÓN (AL FONDO) */}
            <button
              type="button"
              onClick={onExit}
              className="w-full flex items-center gap-3 p-2 rounded-xl text-slate-500 hover:text-red-700 hover:bg-red-50/70 transition-colors cursor-pointer"
              title={isEs ? 'Cerrar sesión' : 'Log Out'}
            >
              <div className="w-6 h-6 flex items-center justify-center shrink-0">
                <LogOut className="w-4 h-4" />
              </div>
              <span className={`text-xs font-bold whitespace-nowrap ${isClickedExpanded ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity duration-200`}>
                {isEs ? 'Cerrar Sesión' : 'Log Out'}
              </span>
            </button>
          </div>
        </div>
      </aside>

      {/* 2. DRAWER DE NAVEGACIÓN EN MÓVIL (< 1024px) */}
      {isMobileNavOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-end">
          <div className="w-72 h-full bg-[#fbf9f4] border-l border-[#ded5c5] shadow-2xl p-4 flex flex-col justify-between animate-slide-in-right">
            <div>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                <span className="text-xs font-black text-slate-900">Menú ZYTI Trade</span>
                <button
                  type="button"
                  onClick={onCloseMobileNav}
                  className="p-1 rounded-lg text-slate-500 hover:text-slate-900 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* PERFIL DE USUARIO EN EL DRAWER MÓVIL */}
              <div className="mb-3 p-2.5 rounded-2xl bg-amber-500/10 border border-amber-300/80 flex items-center gap-2.5">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name || 'User'} className="w-8 h-8 rounded-full object-cover shrink-0 border border-amber-400" />
                ) : user?.provider === 'telegram' ? (
                  <div className="w-8 h-8 rounded-full bg-[#229ED9] flex items-center justify-center shrink-0 shadow-xs">
                    <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/></svg>
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-amber-950 font-black text-xs flex items-center justify-center shrink-0">
                    {user?.name?.[0]?.toUpperCase() || user?.telegramUsername?.[0]?.toUpperCase() || 'T'}
                  </div>
                )}
                <div className="flex flex-col text-left leading-tight min-w-0">
                  <span className="text-xs font-black text-slate-900 truncate">
                    {user?.name || (user?.telegramUsername ? `@${user.telegramUsername}` : (user?.email && !user.email.endsWith('@telegram.org') ? user.email.split('@')[0] : 'Trader'))}
                  </span>
                  <span className="text-[10px] font-bold text-amber-800 truncate">
                    {user?.telegramUsername ? `@${user.telegramUsername}` : (user?.role === 'admin' ? 'Administrador' : (isEs ? 'Cuenta Activa' : 'Active Account'))}
                  </span>
                </div>
              </div>

              {/* SECCIONES TRADING Y EXCHANGE */}
              <div className="space-y-1">
                <div
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold transition-colors ${
                    isTradingSidebarOpen && showOrderForm
                      ? 'bg-amber-100 text-amber-950 font-black'
                      : 'text-slate-700 hover:bg-white'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenTradingPanel) onOpenTradingPanel();
                      setIsTradingSubmenuOpen(true);
                      onCloseMobileNav();
                    }}
                    className="flex items-center gap-3 flex-1 text-left cursor-pointer"
                  >
                    <JapaneseCandlesticksIcon className="w-4 h-4" />
                    <span>Trading</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleToggleTradingSubmenu}
                    className="p-1 rounded text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    {isTradingSubmenuOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {isTradingSubmenuOpen && (
                  <div className="pl-6 pr-2 py-1 space-y-1.5 animate-in fade-in duration-150">
                    {onToggleOrderForm && (
                      <button
                        type="button"
                        onClick={onToggleOrderForm}
                        className="w-full flex items-center justify-between py-1 text-xs text-slate-700 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                          <span>{isEs ? 'Panel de Órdenes' : 'Order Form'}</span>
                        </div>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${showOrderForm ? 'bg-amber-500 border-amber-600 text-white' : 'border-slate-300'}`}>
                          {showOrderForm && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </button>
                    )}
                    {onToggleOrderBook && (
                      <button
                        type="button"
                        onClick={onToggleOrderBook}
                        className="w-full flex items-center justify-between py-1 text-xs text-slate-700 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                          <span>{isEs ? 'Libro de Órdenes' : 'Order Book'}</span>
                        </div>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${showOrderBook ? 'bg-amber-500 border-amber-600 text-white' : 'border-slate-300'}`}>
                          {showOrderBook && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </button>
                    )}
                    {onTogglePositions && (
                      <button
                        type="button"
                        onClick={onTogglePositions}
                        className="w-full flex items-center justify-between py-1 text-xs text-slate-700 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <ListFilter className="w-3.5 h-3.5 text-slate-500" />
                          <span>{isEs ? 'Posiciones & Órdenes' : 'Positions & Orders'}</span>
                        </div>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${showPositions ? 'bg-amber-500 border-amber-600 text-white' : 'border-slate-300'}`}>
                          {showPositions && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </button>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    onSelectSection('exchange');
                    onCloseMobileNav();
                  }}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    activeSection === 'exchange'
                      ? 'bg-amber-100 text-amber-950 font-black'
                      : 'text-slate-700 hover:bg-white'
                  }`}
                >
                  <Repeat className="w-4 h-4 text-amber-600" />
                  <span>Exchange</span>
                </button>
              </div>
            </div>

            {/* CERRAR SESIÓN */}
            <div className="pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={onExit}
                className="w-full flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>{isEs ? 'Cerrar Sesión' : 'Log Out'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
