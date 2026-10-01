import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Zap, Home, ArrowLeft, Globe, AlertCircle } from 'lucide-react';
import { translations, Language } from '../i18n/translations';

interface NotFoundPageProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  onTradeNow: () => void;
  onNavigateHome: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({
  currentLang,
  onLanguageChange,
  onTradeNow,
  onNavigateHome,
}) => {
  const t = translations[currentLang].notFound;

  return (
    <div className="relative min-h-[100dvh] w-screen overflow-x-hidden overflow-y-auto bg-[#fbf9f4] text-slate-900 font-sans flex flex-col justify-between p-4 sm:p-6 lg:p-10 select-none">
      {/* GLOW DECORATIVO DE FONDO */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[520px] md:w-[650px] h-[340px] sm:h-[520px] md:h-[650px] bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-amber-300/10 rounded-full blur-2xl pointer-events-none" />

      {/* CABECERA: BRAND LOGO + SELECTOR DE IDIOMA */}
      <header className="relative z-20 w-full max-w-6xl mx-auto flex items-center justify-between pt-2">
        <button
          onClick={onNavigateHome}
          type="button"
          className="flex items-center gap-2 cursor-pointer group transition-transform active:scale-95"
        >
          <div className="w-9 h-9 rounded-xl bg-slate-950 flex items-center justify-center shadow-sm">
            <span className="text-amber-400 font-black text-base tracking-tighter">Z</span>
          </div>
          <div className="flex flex-col text-left">
            <span className="text-sm font-black text-slate-950 tracking-tight leading-none">
              ZYTI <span className="text-[#eab308]">TRADE</span>
            </span>
            <span className="text-[10px] text-slate-700 font-medium tracking-wider">
              TRADING OS
            </span>
          </div>
        </button>

        {/* SELECTOR DE IDIOMA COMPACTO */}
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/80 border border-[#ded5c5] shadow-xs backdrop-blur-sm">
          <Globe className="w-3.5 h-3.5 text-slate-700 ml-1.5" />
          <button
            onClick={() => onLanguageChange('es')}
            type="button"
            className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              currentLang === 'es'
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            ES
          </button>
          <button
            onClick={() => onLanguageChange('en')}
            type="button"
            className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              currentLang === 'en'
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            EN
          </button>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL: LOTTIE EN EL CENTRO Y GRANDE + ACCIONES */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center my-auto py-6 sm:py-10 max-w-2xl mx-auto w-full animate-zoom-in">
        
        {/* BADGE INSTITUCIONAL */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f4edd9] border border-amber-300/80 text-[#855e15] shadow-xs mb-3 sm:mb-4">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          <span className="text-xs font-mono font-bold tracking-tight uppercase">
            {t.badge}
          </span>
        </div>

        {/* ANIMACIÓN LOTTIE: EN EL CENTRO Y GRANDE */}
        <div className="relative w-72 h-72 sm:w-96 sm:h-96 md:w-[460px] md:h-[460px] max-w-full flex items-center justify-center my-0 sm:-my-2">
          <DotLottieReact
            src="https://lottie.host/27c26359-27e7-41c7-ae3b-34205faa00ca/gBIBPySMUs.lottie"
            loop
            autoplay
            className="w-full h-full object-contain filter drop-shadow-md"
          />
        </div>

        {/* TÍTULO Y DESCRIPCIÓN */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-950 tracking-tight leading-tight mt-1 sm:mt-2">
          {t.title}
        </h1>
        <p className="mt-2.5 text-xs sm:text-sm md:text-base text-slate-600 font-medium leading-relaxed max-w-md mx-auto">
          {t.subtitle}
        </p>

        {/* BOTONES DE ACCIÓN: AMARILLO INSTITUCIONAL + HOME */}
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto px-4">
          
          {/* BOTÓN OPERAR AHORA: AMARILLO INSTITUCIONAL */}
          <button
            onClick={onTradeNow}
            type="button"
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 text-sm font-black text-slate-950 bg-[#eab308] hover:bg-[#ca8a04] rounded-2xl shadow-md shadow-amber-500/25 transition-all duration-150 cursor-pointer transform hover:scale-105 active:scale-95"
          >
            <Zap className="w-4 h-4 stroke-[2.5] fill-slate-950" />
            <span>{t.tradeNow}</span>
          </button>

          {/* BOTÓN HOME: BLANCO / INSTITUCIONAL */}
          <button
            onClick={onNavigateHome}
            type="button"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-bold text-slate-900 bg-white hover:bg-slate-50 border border-[#ded5c5] hover:border-slate-400 rounded-2xl shadow-xs transition-all duration-150 cursor-pointer active:scale-95"
          >
            <Home className="w-4 h-4 text-slate-700" />
            <span>{t.home}</span>
          </button>

          {/* BOTÓN VOLVER ATRÁS OPCIONAL */}
          <button
            onClick={() => {
              if (window.history.length > 1) {
                window.history.back();
              } else {
                onNavigateHome();
              }
            }}
            type="button"
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-3.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-transparent hover:bg-black/5 rounded-2xl transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t.goBack}</span>
          </button>
        </div>

      </main>

      {/* PIE DE PÁGINA SUTIL */}
      <footer className="relative z-20 w-full max-w-6xl mx-auto flex items-center justify-between text-[11px] text-slate-700 font-medium pt-4 border-t border-[#ded5c5]/60">
        <span>© {new Date().getFullYear()} ZYTI Trade. All rights reserved.</span>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-[10px] text-slate-700 font-bold uppercase tracking-wider">
            Systems Operational
          </span>
        </div>
      </footer>
    </div>
  );
};
