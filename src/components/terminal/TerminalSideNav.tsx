import React, { useState } from 'react';
import { ArrowLeftRight, LogOut, Repeat, X } from 'lucide-react';

interface TerminalSideNavProps {
  isEs: boolean;
  navPosition: 'left' | 'right';
  isMobileNavOpen: boolean;
  activeSection: string;
  onToggleNavPosition: () => void;
  onSelectSection: (section: 'none' | 'exchange' | string) => void;
  onCloseMobileNav: () => void;
  onExit: () => void;
}

export const TerminalSideNav: React.FC<TerminalSideNavProps> = ({
  isEs,
  navPosition,
  isMobileNavOpen,
  activeSection,
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
            {/* SECCIÓN 1: EXCHANGE */}
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

              {/* SECCIÓN EXCHANGE */}
              <div className="space-y-1">
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
