import React from 'react';
import { 
  Download, 
  Eye, 
  Check, 
  AlertTriangle, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { Language } from '../i18n/translations';

interface HeroSectionProps {
  currentLang: Language;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ currentLang }) => {
  const isEs = currentLang === 'es';

  return (
    <section className="relative min-h-[90vh] pt-36 pb-20 px-6 lg:px-12 max-w-7xl mx-auto flex items-center">
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        
        {/* COLUMNA IZQUIERDA: TIPOGRAFÍA EDITORIAL PURA */}
        <div className="lg:col-span-6 flex flex-col items-start z-10">
          
          {/* TAG PILL SUPERIOR SUAVE (COMO EN LA REFERENCIA) */}
          <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-[#f4edd9] dark:bg-[#252014] text-[#855e15] dark:text-[#f3c86a] text-xs font-mono font-bold tracking-tight mb-8">
            /zyti-trade-os
          </div>

          {/* HEADLINE CONTUNDENTE (ESTILO "BUILD WHAT YOU PLANNED. NOTHING ELSE.") */}
          <h1 className="text-5xl sm:text-6xl lg:text-[68px] font-black tracking-tight text-slate-950 dark:text-white leading-[1.06]">
            {isEs ? (
              <>
                Opera lo que planeas.<br />
                <span className="text-slate-950 dark:text-white">Nada más.</span>
              </>
            ) : (
              <>
                Trade what you planned.<br />
                <span className="text-slate-950 dark:text-white">Nothing else.</span>
              </>
            )}
          </h1>

          {/* SUBTÍTULO EDITORIAL FLUIDO */}
          <p className="mt-8 text-lg sm:text-xl text-slate-600 dark:text-slate-400 font-normal leading-relaxed max-w-lg">
            {isEs 
              ? 'El sistema operativo institucional para Binance, Bybit y firmas de fondeo. Ejecuta sin intermediarios, replica tus órdenes y audita cada trade.'
              : 'The institutional trading system for Binance, Bybit, and prop firms. Execute without middlemen, replicate cross-exchange trades, and audit risk.'}
          </p>

          {/* BOTONES DE ACCIÓN (ESTILO BOTÓN MOSTAZA / NEGRO DE LA REFERENCIA) */}
          <div className="mt-10 flex flex-wrap items-center gap-4">
            
            {/* BOTÓN PRIMARIO */}
            <button className="flex items-center gap-2.5 px-7 py-4 text-sm font-bold text-slate-950 bg-[#eab308] hover:bg-[#ca8a04] rounded-2xl shadow-sm transition-all duration-150 cursor-pointer">
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>{isEs ? 'Lanzar Terminal' : 'Launch Terminal'}</span>
            </button>

            {/* BOTÓN SECUNDARIO CON BORDE */}
            <button className="flex items-center gap-2 px-6 py-4 text-sm font-bold text-slate-900 dark:text-white bg-transparent hover:bg-slate-900/5 dark:hover:bg-white/5 rounded-2xl border border-slate-900 dark:border-slate-300 transition-all cursor-pointer">
              <Eye className="w-4 h-4" />
              <span>{isEs ? 'Ver demo en vivo' : 'View live demo'}</span>
            </button>
          </div>

          {/* LOGOS DE EXCHANGES SUTILES AL PIE DEL HERO */}
          <div className="mt-12 flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">
              Conectores:
            </span>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-slate-900/80 px-3 py-1.5 rounded-xl border border-[#ede8df] dark:border-slate-800">
              <span>Binance</span>
              <span className="text-slate-300 dark:text-slate-700">+</span>
              <span>Bybit</span>
              <span className="text-slate-300 dark:text-slate-700">+</span>
              <span>OKX</span>
              <span className="text-slate-300 dark:text-slate-700">+</span>
              <span>Prop Firms</span>
            </div>
          </div>

        </div>

        {/* COLUMNA DERECHA: MAQUETA DE UI REAL DE TRADING (ESTILO LA TARJETA DE LA REFERENCIA) */}
        <div className="lg:col-span-6 relative flex items-center justify-center">
          
          {/* TARJETA SATÉLITE 1 (ARRIBA IZQUIERDA): ALERTA DE ARBITRAJE */}
          <div className="absolute -top-6 left-2 sm:-left-4 z-20 satellite-card rounded-2xl p-4 max-w-[220px] animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-start gap-2.5">
              <div className="p-1 rounded-md bg-[#fee2e2] text-[#dc2626] shrink-0 mt-0.5">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                  Spread de Arbitraje
                </span>
                <span className="text-[11px] text-slate-500 mt-1 leading-snug">
                  Bybit cotiza +$18.50 sobre Binance.
                </span>
                <button className="mt-2.5 px-2.5 py-1 text-[10px] font-bold text-white bg-[#dc2626] hover:bg-[#b91c1c] rounded-lg self-start">
                  Ejecutar spread
                </button>
              </div>
            </div>
          </div>

          {/* TARJETA SATÉLITE 2 (ABAJO DERECHA): REPLICACIÓN COPY TRADING */}
          <div className="absolute -bottom-6 -right-2 sm:-right-4 z-20 satellite-card rounded-2xl p-4 max-w-[230px] animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-start gap-2.5">
              <div className="p-1 rounded-md bg-[#dcfce7] text-[#16a34a] shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                  Copy Trade Exitoso
                </span>
                <span className="text-[11px] text-slate-500 mt-1 leading-snug">
                  Orden replicada en 3 exchanges en 3.8ms.
                </span>
                <span className="mt-1 text-[10px] font-mono font-bold text-emerald-600">
                  Fill: 100% • Slippage: 0.01%
                </span>
              </div>
            </div>
          </div>

          {/* TARJETA PRINCIPAL (ESTILO "BUILD PLAN" DE LA REFERENCIA) */}
          <div className="w-full max-w-[420px] warm-card rounded-3xl p-6 sm:p-7 relative z-10">
            
            {/* CABECERA DE LA TARJETA */}
            <div className="flex items-baseline justify-between mb-1">
              <h3 className="text-xl font-black text-slate-950 dark:text-white">
                Trading Plan
              </h3>
              <span className="text-xs font-mono font-bold text-slate-500">
                BTC / USDT
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              8 de 10 condiciones de entrada cumplidas
            </p>

            {/* BARRA DE PROGRESO (VERDE SUAVE DE LA REFERENCIA) */}
            <div className="w-full h-2 rounded-full bg-[#ede8df] dark:bg-[#1f293d] overflow-hidden mb-6">
              <div className="h-full bg-[#65a30d] rounded-full w-[80%]" />
            </div>

            {/* MÉTRICAS DE RESUMEN (COMPLETED / IN PROGRESS / UP NEXT) */}
            <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-[#fbf9f4] dark:bg-[#0e1420] border border-[#ede8df] dark:border-[#1f293d] mb-6 text-center">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Llenadas</p>
                <p className="text-xl font-black text-[#65a30d]">8</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Activas</p>
                <p className="text-xl font-black text-[#ca8a04]">1</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pendientes</p>
                <p className="text-xl font-black text-slate-700 dark:text-slate-300">3</p>
              </div>
            </div>

            {/* LISTA DE TAREAS / EJECUCIONES (CHECKLIST NATIVO CON TACHADOS) */}
            <div className="flex flex-col gap-3 text-xs">
              
              {/* Tarea 1: Completada */}
              <div className="flex items-center justify-between text-slate-400 dark:text-slate-500">
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-[#65a30d] text-white flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span className="line-through">Conexión WSS con Binance & Bybit</span>
                </div>
                <span className="font-mono text-[10px]">1.2ms</span>
              </div>

              {/* Tarea 2: Completada */}
              <div className="flex items-center justify-between text-slate-400 dark:text-slate-500">
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-[#65a30d] text-white flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span className="line-through">Verificación de Margen & Drawdown</span>
                </div>
                <span className="font-mono text-[10px]">PASS</span>
              </div>

              {/* Tarea 3: Completada */}
              <div className="flex items-center justify-between text-slate-400 dark:text-slate-500">
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-[#65a30d] text-white flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span className="line-through">Cálculo de Sizing por % de Riesgo</span>
                </div>
                <span className="font-mono text-[10px]">0.5%</span>
              </div>

              {/* Tarea 4: Activa / En progreso */}
              <div className="flex items-center justify-between text-slate-900 dark:text-white font-bold p-1 rounded-lg bg-[#f4edd9]/60 dark:bg-amber-950/30">
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full border-2 border-[#ca8a04] flex items-center justify-center shrink-0" />
                  <span>Trailing Stop Dinámico</span>
                </div>
                <span className="font-mono text-[10px] text-[#ca8a04]">+$1,420</span>
              </div>

              {/* Tarea 5: Pendiente */}
              <div className="flex items-center justify-between text-slate-500">
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700 shrink-0" />
                  <span>Toma de ganancias TP3</span>
                </div>
                <span className="font-mono text-[10px]">$66,500</span>
              </div>

            </div>

            {/* PIE DE LA TARJETA */}
            <div className="mt-6 pt-4 border-t border-[#ede8df] dark:border-[#1f293d] flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-[#65a30d] font-bold">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                Estado del Motor: Óptimo
              </span>
              <span className="text-slate-400 font-mono text-[10px]">
                60 FPS Canvas
              </span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
