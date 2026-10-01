import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Zap, Home } from 'lucide-react';
import { translations, Language } from '../i18n/translations';

interface NotFoundPageProps {
  currentLang: Language;
  onTradeNow: () => void;
  onNavigateHome: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({
  currentLang,
  onTradeNow,
  onNavigateHome,
}) => {
  const t = translations[currentLang]?.notFound || translations.es.notFound;

  return (
    <div className="relative min-h-[100dvh] w-screen overflow-x-hidden overflow-y-auto bg-[#fbf9f4] text-slate-900 font-sans flex flex-col justify-between p-4 sm:p-6 lg:p-10 select-none">
      {/* GLOW DECORATIVO DE FONDO */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[520px] md:w-[650px] h-[340px] sm:h-[520px] md:h-[650px] bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-amber-300/10 rounded-full blur-2xl pointer-events-none" />

      {/* CABECERA: LOGO INSTITUCIONAL OFICIAL DE ZYTI TRADE */}
      <header className="relative z-20 w-full max-w-6xl mx-auto flex items-center justify-between pt-2">
        <button
          onClick={onNavigateHome}
          type="button"
          className="flex items-center gap-2.5 border-none bg-transparent cursor-pointer p-0 shrink-0 group transition-transform active:scale-95"
          title="ZYTI Trade - Inicio"
        >
          <img 
            src="/logo-zyti.png" 
            alt="ZYTI Trade Logo" 
            className="w-8 h-8 md:w-10 md:h-10 object-contain"
          />
          <span className="font-black tracking-tight text-xl md:text-2xl text-slate-950">
            ZYTI <span className="font-light text-slate-500">Trade</span>
          </span>
        </button>
      </header>

      {/* CONTENIDO PRINCIPAL: ANIMACIÓN LOTTIE GRANDE EN EL CENTRO + 2 BOTONES DE ACCIÓN */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center my-auto py-4 sm:py-6 max-w-2xl mx-auto w-full animate-zoom-in">
        
        {/* ANIMACIÓN LOTTIE: EN EL CENTRO Y GRANDE */}
        <div className="relative w-72 h-72 sm:w-96 sm:h-96 md:w-[480px] md:h-[480px] max-w-full flex items-center justify-center my-0 sm:-my-2">
          <DotLottieReact
            src="https://lottie.host/27c26359-27e7-41c7-ae3b-34205faa00ca/gBIBPySMUs.lottie"
            loop
            autoplay
            className="w-full h-full object-contain filter drop-shadow-md"
          />
        </div>

        {/* TÍTULO Y DESCRIPCIÓN */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-950 tracking-tight leading-tight mt-1">
          {t.title}
        </h1>
        <p className="mt-2 text-xs sm:text-sm md:text-base text-slate-600 font-medium leading-relaxed max-w-md mx-auto">
          {t.subtitle}
        </p>

        {/* BOTONES DE ACCIÓN: OPERAR AHORA (AMARILLO INSTITUCIONAL) + HOME */}
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 w-full sm:w-auto px-4">
          
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

        </div>

      </main>

      {/* PIE DE PÁGINA LIMPIO Y ELEGANTE */}
      <footer className="relative z-20 w-full max-w-6xl mx-auto flex items-center justify-center text-center text-xs text-slate-500 font-medium pt-4 border-t border-[#ded5c5]/60">
        <span>© {new Date().getFullYear()} ZYTI Trade. All rights reserved.</span>
      </footer>
    </div>
  );
};
