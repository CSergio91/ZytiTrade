import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Chart } from 'klinecharts';
import { PositionItem } from './types';
import { X, ShieldAlert, Target } from 'lucide-react';

interface PositionChartOverlayProps {
  chart: Chart | null;
  position: PositionItem | null;
  currentPrice: number;
  isEs: boolean;
  onUpdatePositionSLTP: (id: number, slPrice?: number, tpPrice?: number) => void;
  onClosePosition: (id: number) => void;
}

export const PositionChartOverlay: React.FC<PositionChartOverlayProps> = ({
  chart,
  position,
  currentPrice,
  isEs,
  onUpdatePositionSLTP,
  onClosePosition
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Coordenadas calculadas en píxeles Y
  const [coords, setCoords] = useState<{
    entryY: number | null;
    slY: number | null;
    tpY: number | null;
  }>({ entryY: null, slY: null, tpY: null });

  // Estado de arrastre en curso
  const [draggingTarget, setDraggingTarget] = useState<'sl' | 'tp' | null>(null);
  const [dragPrice, setDragPrice] = useState<number | null>(null);

  // Función para sincronizar coordenadas Y con KLineChart
  const syncCoordinates = useCallback(() => {
    if (!chart || !position) {
      setCoords({ entryY: null, slY: null, tpY: null });
      return;
    }

    try {
      // 1. Coordenada Y de Entrada
      const entryCoord = chart.convertToPixel(
        { value: position.entry },
        { paneId: 'candle_pane' }
      ) as { y?: number } | undefined;
      const entryY = entryCoord && typeof entryCoord.y === 'number' && !isNaN(entryCoord.y) ? entryCoord.y : null;

      // 2. Coordenada Y de Stop Loss
      const currentSL = draggingTarget === 'sl' && dragPrice !== null ? dragPrice : position.slPrice;
      let slY: number | null = null;
      if (currentSL !== undefined) {
        const slCoord = chart.convertToPixel(
          { value: currentSL },
          { paneId: 'candle_pane' }
        ) as { y?: number } | undefined;
        if (slCoord && typeof slCoord.y === 'number' && !isNaN(slCoord.y)) {
          slY = slCoord.y;
        }
      }

      // 3. Coordenada Y de Take Profit
      const currentTP = draggingTarget === 'tp' && dragPrice !== null ? dragPrice : position.tpPrice;
      let tpY: number | null = null;
      if (currentTP !== undefined) {
        const tpCoord = chart.convertToPixel(
          { value: currentTP },
          { paneId: 'candle_pane' }
        ) as { y?: number } | undefined;
        if (tpCoord && typeof tpCoord.y === 'number' && !isNaN(tpCoord.y)) {
          tpY = tpCoord.y;
        }
      }

      setCoords({ entryY, slY, tpY });
    } catch {
      // Si el gráfico aún no está listo o en transición
    }
  }, [chart, position, draggingTarget, dragPrice]);

  // Actualización continua vía requestAnimationFrame y suscripción a eventos de gráfico
  useEffect(() => {
    let animId: number;
    const loop = () => {
      syncCoordinates();
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animId);
  }, [syncCoordinates]);

  if (!position || coords.entryY === null) {
    return null;
  }

  const { entryY, slY, tpY } = coords;
  const isLong = position.side === 'LONG';

  // Manejador para iniciar arrastre
  const handlePointerDown = (target: 'sl' | 'tp', e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDraggingTarget(target);
    const initialP = target === 'sl' ? position.slPrice ?? position.entry : position.tpPrice ?? position.entry;
    setDragPrice(initialP);
  };

  // Movimiento del cursor/touch
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingTarget || !chart || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pixelY = e.clientY - rect.top;

    try {
      const converted = chart.convertFromPixel([{ y: pixelY }], { paneId: 'candle_pane' }) as Array<{ value?: number }>;
      const newPrice = converted[0]?.value;
      if (typeof newPrice === 'number' && !isNaN(newPrice) && newPrice > 0) {
        setDragPrice(Number(newPrice.toFixed(2)));
      }
    } catch {}
  };

  // Fin de arrastre
  const handlePointerUp = (e: React.PointerEvent) => {
    if (!draggingTarget) return;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}

    if (dragPrice !== null && dragPrice > 0) {
      if (draggingTarget === 'sl') {
        onUpdatePositionSLTP(position.id, dragPrice, position.tpPrice);
      } else {
        onUpdatePositionSLTP(position.id, position.slPrice, dragPrice);
      }
    }

    setDraggingTarget(null);
    setDragPrice(null);
  };

  // Crear SL / TP por defecto al tocar la línea de entrada si no existen
  const handleAddDefaultSLTP = (e: React.MouseEvent) => {
    e.stopPropagation();
    const slDist = isLong ? position.entry * 0.98 : position.entry * 1.02;
    const tpDist = isLong ? position.entry * 1.04 : position.entry * 0.96;
    onUpdatePositionSLTP(position.id, Number(slDist.toFixed(2)), Number(tpDist.toFixed(2)));
  };

  // Cálculo de PnL en tiempo real para SL y TP
  const activeSL = draggingTarget === 'sl' && dragPrice !== null ? dragPrice : position.slPrice;
  const activeTP = draggingTarget === 'tp' && dragPrice !== null ? dragPrice : position.tpPrice;

  const slDiffPercent = activeSL ? ((activeSL - position.entry) / position.entry) * 100 * (isLong ? 1 : -1) : 0;
  const tpDiffPercent = activeTP ? ((activeTP - position.entry) / position.entry) * 100 * (isLong ? 1 : -1) : 0;

  const slEstimatedPnl = activeSL ? (activeSL - position.entry) * position.sizeUnits * position.leverage * (isLong ? 1 : -1) : 0;
  const tpEstimatedPnl = activeTP ? (activeTP - position.entry) * position.sizeUnits * position.leverage * (isLong ? 1 : -1) : 0;

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 pointer-events-none z-20 overflow-hidden select-none"
    >
      <svg className="w-full h-full absolute inset-0">
        {/* 1. ÁREA VERDE CLARA DE TAKE PROFIT */}
        {tpY !== null && (
          <rect
            x={0}
            y={Math.min(entryY, tpY)}
            width="100%"
            height={Math.abs(entryY - tpY)}
            fill="rgba(16, 185, 129, 0.16)"
            stroke="#10b981"
            strokeWidth={1}
            strokeDasharray="4 4"
          />
        )}

        {/* 2. ÁREA ROJA CLARA DE STOP LOSS */}
        {slY !== null && (
          <rect
            x={0}
            y={Math.min(entryY, slY)}
            width="100%"
            height={Math.abs(entryY - slY)}
            fill="rgba(239, 68, 68, 0.16)"
            stroke="#ef4444"
            strokeWidth={1}
            strokeDasharray="4 4"
          />
        )}

        {/* 3. LÍNEA HORIZONTAL DE ENTRADA */}
        <line
          x1={0}
          y1={entryY}
          x2="100%"
          y2={entryY}
          stroke={isLong ? '#0284c7' : '#dc2626'}
          strokeWidth={1.5}
        />
      </svg>

      {/* PILL / BADGE DE ENTRADA (CLICKEABLE Y CON BOTÓN CERRAR) */}
      <div 
        style={{ top: `${entryY}px` }}
        className="absolute left-2 -translate-y-1/2 pointer-events-auto flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-900/95 text-white border border-slate-700 shadow-lg text-[10px] font-mono font-bold"
      >
        <span className={`px-1 rounded text-[9px] font-black ${isLong ? 'bg-emerald-500 text-slate-950' : 'bg-red-500 text-white'}`}>
          {position.side} {position.size}
        </span>
        <span className="text-slate-300">
          @{position.entry.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
        <span className={`font-black ${position.isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
          {position.pnl} ({position.pnlPercent})
        </span>

        {/* BOTÓN PARA AÑADIR SL/TP SI NO EXISTEN */}
        {(!position.slPrice || !position.tpPrice) && (
          <button
            type="button"
            onClick={handleAddDefaultSLTP}
            className="px-1.5 py-0.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 text-[9px] font-bold cursor-pointer transition-colors"
            title={isEs ? 'Habilitar SL y TP arrastrables' : 'Enable draggable SL & TP'}
          >
            + SL/TP
          </button>
        )}

        {/* BOTÓN CERRAR POSICIÓN DIRECTO EN EL GRÁFICO */}
        <button
          type="button"
          onClick={() => onClosePosition(position.id)}
          className="p-0.5 rounded hover:bg-red-600/80 text-slate-400 hover:text-white transition-colors cursor-pointer"
          title={isEs ? 'Cerrar posición a mercado' : 'Close market position'}
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {/* LÍNEA Y MANEJADOR ARRASTRABLE DE TAKE PROFIT (VERDE) */}
      {tpY !== null && activeTP && (
        <div
          style={{ top: `${tpY}px` }}
          onPointerDown={(e) => handlePointerDown('tp', e)}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="absolute right-4 -translate-y-1/2 pointer-events-auto cursor-ns-resize flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-700 text-white border border-emerald-400 shadow-xl text-[10px] font-mono font-bold transition-transform hover:scale-105 active:scale-95 touch-none"
          title={isEs ? 'Arrastra para ajustar Take Profit' : 'Drag to adjust Take Profit'}
        >
          <Target className="w-3 h-3 text-emerald-200" />
          <span>TP ${activeTP.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          <span className="text-emerald-200 text-[9px]">
            ({tpDiffPercent >= 0 ? '+' : ''}{tpDiffPercent.toFixed(1)}% / +${Math.abs(tpEstimatedPnl).toFixed(2)})
          </span>
          <span className="text-[9px] text-emerald-300 font-sans">⇅</span>
        </div>
      )}

      {/* LÍNEA Y MANEJADOR ARRASTRABLE DE STOP LOSS (ROJO) */}
      {slY !== null && activeSL && (
        <div
          style={{ top: `${slY}px` }}
          onPointerDown={(e) => handlePointerDown('sl', e)}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="absolute right-4 -translate-y-1/2 pointer-events-auto cursor-ns-resize flex items-center gap-1.5 px-2 py-1 rounded-lg bg-red-700 text-white border border-red-400 shadow-xl text-[10px] font-mono font-bold transition-transform hover:scale-105 active:scale-95 touch-none"
          title={isEs ? 'Arrastra para ajustar Stop Loss' : 'Drag to adjust Stop Loss'}
        >
          <ShieldAlert className="w-3 h-3 text-red-200" />
          <span>SL ${activeSL.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          <span className="text-red-200 text-[9px]">
            ({slDiffPercent <= 0 ? '' : '-'}{Math.abs(slDiffPercent).toFixed(1)}% / -${Math.abs(slEstimatedPnl).toFixed(2)})
          </span>
          <span className="text-[9px] text-red-300 font-sans">⇅</span>
        </div>
      )}
    </div>
  );
};
