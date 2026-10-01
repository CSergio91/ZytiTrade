import React, { useState } from 'react';
import { ArrowLeftRight, LogOut, Repeat, X, SlidersHorizontal } from 'lucide-react';

interface TerminalSideNavProps {
  isEs: boolean;
  navPosition: 'left' | 'right';
  isMobileNavOpen: boolean;
  activeSection: string;
  isTradingSidebarOpen?: boolean;
  onToggleTradingSidebar?: () => void;
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
  isTradingSidebarOpen = true,
  onToggleTradingSidebar,
  onToggleNavPosition,
  onSelectSection,
  onCloseMobileNav,
  onExit
}) => {
  const [isClickedExpanded, setIsClickedExpanded] = useState(false);

  return (
    <>
      {/* 1. BARRA LATERAL EN ESCRITORIO (>= 1024px) */}
      <aside className="terminal-side-nav">
        {/* Contenedor base de 48px para reservar el espacio permanente en el layout */}
        <div className={`w-12 h-full ${navPosition === 'left' ? 'border-r' : 'border-l'} border-[#ded5c5] bg-[#fbf9f4]`} />
        
        {/* Menú flotante al hover o al click que vuela por encima del gráfico sin redimensionarlo ni empujarlo */}
        <div 
          className={`absolute top-0 bottom-0 ${navPosition === 'left' ? 'left-0 border-r' : 'right-0 border-l'} ${
            isClickedExpanded ? 'w-56 shadow-2xl' : 'w-12 hover:w-56 shadow-xs hover:shadow-2xl'
          } bg-[#fbf9f4] border-[#ded5c5] transition-all duration-300 ease-out flex flex-col justify-between py-3 px-1.5 group z-40 overflow-hidden`}
        >
          {/* SECCIONES ARRIBA */}
          <div className="space-y-1.5">
            {/* SECCIÓN 1: TRADING (ABRIR / CERRAR PANEL DE TRADING Y LIBRO) */}
            <button
              type="button"
              onClick={() => {
                if (onToggleTradingSidebar) onToggleTradingSidebar();
                setIsClickedExpanded(false);
              }}
              className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all cursor-pointer ${
                isTradingSidebarOpen
                  ? 'bg-amber-100 text-amber-950 font-black shadow-xs'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-white/80'
              }`}
              title={isEs ? 'Panel de Trading y Libro' : 'Trading Panel & Order Book'}
            >
              <div className="w-6 h-6 flex items-center justify-center shrink-0">
                <JapaneseCandlesticksIcon className="w-4.5 h-4.5" />
              </div>
              <span className={`text-xs font-bold whitespace-nowrap ${isClickedExpanded ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity duration-200`}>
                Trading
              </span>
            </button>

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

          {/* PIE DE NAVEGACIÓN ABAJO: CAMBIAR SENTIDO + CERRAR SESIÓN */}
          <div className="pt-2 border-t border-slate-200 space-y-1">
            {/* BOTÓN CAMBIO DE POSICIÓN IZQUIERDA / DERECHA (ENCIMA DE CERRAR SESIÓN) */}
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

              {/* SECCIONES TRADING Y EXCHANGE */}
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    if (onToggleTradingSidebar) onToggleTradingSidebar();
                    onCloseMobileNav();
                  }}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    isTradingSidebarOpen
                      ? 'bg-amber-100 text-amber-950 font-black'
                      : 'text-slate-700 hover:bg-white'
                  }`}
                >
                  <JapaneseCandlesticksIcon className="w-4 h-4" />
                  <span>Trading & Order Book</span>
                </button>

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
