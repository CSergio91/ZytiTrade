import React, { useState } from 'react';
import { ArrowLeft, ChevronDown, Cpu, LayoutGrid, LogOut, Menu, Repeat } from 'lucide-react';
import { UserSession } from '../../lib/supabase';
import { MarketStats } from '../../workers/marketData.worker';

interface TerminalHeaderProps {
  isEs: boolean;
  user: UserSession | null;
  selectedPair: string;
  supportedPairs: string[];
  stats: MarketStats;
  isMobileNavOpen: boolean;
  activeSection: string;
  onSelectSection: (section: 'none' | 'exchange' | string) => void;
  onSelectPair: (pair: string) => void;
  onToggleMobileNav: () => void;
  onExit: () => void;
}

export const TerminalHeader: React.FC<TerminalHeaderProps> = ({
  isEs,
  user,
  selectedPair,
  supportedPairs,
  stats,
  isMobileNavOpen,
  activeSection,
  onSelectSection,
  onSelectPair,
  onToggleMobileNav,
  onExit
}) => {
  const [isTopNavOpen, setIsTopNavOpen] = useState(false);

  return (
    <header className="h-12 sm:h-14 border-b border-[#ded5c5] bg-[#fbf9f4] px-3 sm:px-4 flex items-center justify-between shrink-0 z-30">
      {/* PARTE IZQUIERDA: VOLVER + NAVEGACIÓN SUPERIOR (DESKTOP) + SELECTOR DE PAR + PRECIO EN VIVO */}
      <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar">
        {/* Botón de atrás: visible en escritorio (>= lg) */}
        <button 
          type="button"
          onClick={onExit}
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold border border-[#ded5c5] transition-all cursor-pointer shadow-xs shrink-0"
          title={isEs ? 'Volver al Inicio' : 'Back to Home'}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{isEs ? 'Inicio' : 'Home'}</span>
        </button>

        <div className="h-4 w-px bg-slate-300 hidden lg:block" />

        {/* NAVEGACIÓN SUPERIOR EN ESCRITORIO (>= 1024px): MENÚ DE SECCIONES (HOVER O CLICK) */}
        <div 
          className="relative hidden lg:block"
          onMouseEnter={() => setIsTopNavOpen(true)}
          onMouseLeave={() => setIsTopNavOpen(false)}
        >
          <button 
            type="button"
            onClick={() => setIsTopNavOpen(!isTopNavOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-xs ${
              activeSection === 'exchange' || isTopNavOpen
                ? 'bg-amber-100 text-amber-950 border-amber-300'
                : 'bg-white hover:bg-slate-100 text-slate-800 border-[#ded5c5]'
            }`}
            title={isEs ? 'Menú de navegación y secciones' : 'Navigation & sections menu'}
          >
            <LayoutGrid className="w-3.5 h-3.5 text-amber-600" />
            <span>{isEs ? 'Navegación' : 'Navigation'}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isTopNavOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* MENÚ FLOTANTE AL HOVER O CLICK */}
          {isTopNavOpen && (
            <div className="absolute top-full left-0 mt-1.5 w-60 bg-white/95 backdrop-blur-xl border border-[#ded5c5] rounded-2xl shadow-2xl p-1.5 z-50 animate-zoom-in">
              <div className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                {isEs ? 'Secciones ZYTI Trade' : 'ZYTI Trade Sections'}
              </div>

              <button
                type="button"
                onClick={() => {
                  onSelectSection(activeSection === 'exchange' ? 'none' : 'exchange');
                  setIsTopNavOpen(false);
                }}
                className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  activeSection === 'exchange'
                    ? 'bg-amber-100 text-amber-950 font-black'
                    : 'text-slate-800 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Repeat className="w-4 h-4 text-amber-600" />
                  <span>Exchange</span>
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-200/60 text-amber-900 font-bold">
                  LIVE
                </span>
              </button>
            </div>
          )}
        </div>

        <div className="h-4 w-px bg-slate-300 hidden lg:block" />

        {/* SELECTOR DE PARES DESPLEGABLE */}
        <div className="relative group shrink-0">
          <button 
            type="button"
            className="flex items-center gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-white border border-[#ded5c5] hover:border-slate-400 font-black text-xs sm:text-sm text-slate-950 cursor-pointer shadow-xs"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{selectedPair}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
          <div className="absolute top-full left-0 mt-1 w-36 bg-white border border-[#ded5c5] rounded-xl shadow-lg py-1 hidden group-hover:block z-50">
            {supportedPairs.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => onSelectPair(p)}
                className={`w-full text-left px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer hover:bg-amber-50 ${
                  selectedPair === p ? 'text-amber-600 bg-amber-50/50' : 'text-slate-800'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* PRECIO ACTUAL Y ESTADÍSTICAS 24H */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <span className={`text-xs sm:text-sm font-mono font-black ${stats.change24h >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            ${stats.lastPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className={`text-[10px] sm:text-xs font-mono font-bold px-1.5 py-0.5 rounded ${stats.change24h >= 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {stats.change24h >= 0 ? '+' : ''}{stats.change24h}%
          </span>
        </div>

        <div className="hidden xl:flex items-center gap-4 text-xs font-mono text-slate-600 pl-2">
          <span>24h High: <strong className="text-slate-900">${stats.high24h.toLocaleString()}</strong></span>
          <span>24h Low: <strong className="text-slate-900">${stats.low24h.toLocaleString()}</strong></span>
          <span>24h Vol: <strong className="text-slate-900">{stats.volume24h.toLocaleString()} BTC</strong></span>
        </div>
      </div>

      {/* PARTE DERECHA: STATUS WORKER + USUARIO + SALIR (ESCRITORIO) / HAMBURGUESA (MÓVIL) */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        <div className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-mono font-bold border border-emerald-200 shadow-xs">
          <Cpu className="w-3 h-3 text-emerald-600 animate-pulse" />
          <span>Worker 60 FPS</span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 bg-[#ede5d6] px-2 sm:px-3 py-1 rounded-xl border border-[#ded5c5]">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="text-xs font-bold text-slate-900 truncate max-w-[85px] sm:max-w-[140px]">
            {user?.name || user?.email || 'Demo Trader'}
          </span>
        </div>

        {/* BOTÓN SALIR EN ESCRITORIO (>= 1024px) - SIEMPRE VISIBLE */}
        <button
          type="button"
          onClick={onExit}
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white hover:bg-red-50 text-slate-700 hover:text-red-700 border border-[#ded5c5] hover:border-red-200 cursor-pointer transition-colors text-xs font-bold shadow-xs"
          title={isEs ? 'Cerrar sesión y salir' : 'Log out & Exit'}
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{isEs ? 'Salir' : 'Log Out'}</span>
        </button>

        {/* BOTÓN HAMBURGUESA EN MÓVIL (< 1024px) */}
        <button
          type="button"
          onClick={onToggleMobileNav}
          className="lg:hidden p-1.5 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-[#ede5d6] border border-[#ded5c5] cursor-pointer transition-colors shadow-xs"
          title={isEs ? 'Menú ZYTI Trade' : 'ZYTI Trade Menu'}
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
