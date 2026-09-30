import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Chart } from 'klinecharts';
import { PositionItem } from './types';
import { X, ShieldAlert, Target } from 'lucide-react';

interface PositionChartOverlayProps {
  chart: Chart | null;
  position: PositionItem | null;
  currentPrice: number;
  demoBalance: number;
  isEs: boolean;
  onUpdatePositionSLTP: (id: string, slPrice?: number | null, tpPrice?: number | null) => void;
  onClosePosition: (id: string) => void;
}

interface OverlayCoords {
  entryY: number | null;
  slY: number | null;
  tpY: number | null;
  entryX: number;
  zoneEndX: number;
}

export const PositionChartOverlay: React.FC<PositionChartOverlayProps> = ({
  chart,
  position,
  demoBalance,
  isEs,
  onUpdatePositionSLTP,
  onClosePosition
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [coords, setCoords] = useState<OverlayCoords>({ entryY: null, slY: null, tpY: null, entryX: 0, zoneEndX: 0 });
  const coordsRef = useRef<OverlayCoords>({ entryY: null, slY: null, tpY: null, entryX: 0, zoneEndX: 0 });
  const [draggingTarget, setDraggingTarget] = useState<'sl' | 'tp' | 'auto' | null>(null);
  const [dragPrice, setDragPrice] = useState<number | null>(null);
  const [dragPixelY, setDragPixelY] = useState<number | null>(null);

  const syncCoordinates = useCallback(() => {
    if (!chart || !position) {
      if (coordsRef.current.entryY !== null) {
        const reset: OverlayCoords = { entryY: null, slY: null, tpY: null, entryX: 0, zoneEndX: 0 };
        coordsRef.current = reset;
        setCoords(reset);
      }
      return;
    }
    try {
      const entryCoord = chart.convertToPixel({ value: position.entry }, { paneId: 'candle_pane' }) as { x?: number; y?: number } | undefined;
      const newEntryY = entryCoord && typeof entryCoord.y === 'number' && !isNaN(entryCoord.y) ? Math.round(entryCoord.y) : null;

      const entryTsCoord = (chart as any).convertToPixel({ timestamp: position.entryTimestamp }, { paneId: 'candle_pane' }) as { x?: number } | undefined;
      const canvasWidth = containerRef.current?.offsetWidth ?? 9999;
      let newEntryX = 0;
      if (entryTsCoord && typeof entryTsCoord.x === 'number' && !isNaN(entryTsCoord.x)) {
        const cx = Math.round(entryTsCoord.x);
        if (cx >= 0 && cx < canvasWidth) newEntryX = cx;
      }

      let newZoneEndX = newEntryX + 160;
      try {
        const dl = (chart as any).getDataList() as Array<{ timestamp: number }>;
        if (dl && dl.length >= 2) {
          const lX = (chart as any).convertToPixel({ timestamp: dl[dl.length - 1].timestamp }, { paneId: 'candle_pane' }) as { x?: number };
          const pX = (chart as any).convertToPixel({ timestamp: dl[dl.length - 2].timestamp }, { paneId: 'candle_pane' }) as { x?: number };
          if (lX && pX && lX.x && pX.x) {
            const bw = Math.abs(lX.x - pX.x);
            if (bw > 1) newZoneEndX = newEntryX + Math.round(bw * 10);
          }
        }
      } catch {}

      let newSlY: number | null = null;
      if (position.slPrice != null) {
        const c = chart.convertToPixel({ value: position.slPrice }, { paneId: 'candle_pane' }) as { y?: number } | undefined;
        if (c && typeof c.y === 'number' && !isNaN(c.y)) newSlY = Math.round(c.y);
      }
      let newTpY: number | null = null;
      if (position.tpPrice != null) {
        const c = chart.convertToPixel({ value: position.tpPrice }, { paneId: 'candle_pane' }) as { y?: number } | undefined;
        if (c && typeof c.y === 'number' && !isNaN(c.y)) newTpY = Math.round(c.y);
      }

      const prev = coordsRef.current;
      if (prev.entryY !== newEntryY || prev.slY !== newSlY || prev.tpY !== newTpY || prev.entryX !== newEntryX || prev.zoneEndX !== newZoneEndX) {
        const next = { entryY: newEntryY, slY: newSlY, tpY: newTpY, entryX: newEntryX, zoneEndX: newZoneEndX };
        coordsRef.current = next;
        setCoords(next);
      }
    } catch {}
  }, [chart, position?.entry, position?.slPrice, position?.tpPrice, position?.entryTimestamp]);

  useEffect(() => {
    syncCoordinates();
    if (!chart) return;
    const handler = () => syncCoordinates();
    try {
      (chart as any).subscribeAction('onZoom', handler);
      (chart as any).subscribeAction('onScroll', handler);
    } catch {}
    window.addEventListener('resize', handler);
    const interval = setInterval(syncCoordinates, 250);
    return () => {
      try {
        (chart as any).unsubscribeAction('onZoom', handler);
        (chart as any).unsubscribeAction('onScroll', handler);
      } catch {}
      window.removeEventListener('resize', handler);
      clearInterval(interval);
    };
  }, [chart, syncCoordinates]);

  if (!position || coords.entryY === null) return null;

  const { entryY, entryX, zoneEndX } = coords;
  const zoneWidth = Math.max(0, zoneEndX - entryX);
  const isLong = position.side === 'LONG';

  const pixelToPrice = (pixelY: number): number | null => {
    try {
      const converted = chart!.convertFromPixel([{ y: pixelY }], { paneId: 'candle_pane' }) as Array<{ value?: number }>;
      const v = converted[0]?.value;
      return typeof v === 'number' && !isNaN(v) && v > 0 ? Number(v.toFixed(2)) : null;
    } catch { return null; }
  };

  // Restriccion estricta de direccion segun posicion LONG o SHORT
  const clampPrice = (target: 'sl' | 'tp', raw: number): number => {
    const ep = position.entry;
    if (isLong) {
      // LONG: SL estrictamente debajo de entrada, TP estrictamente encima
      if (target === 'sl') return Math.min(raw, Number((ep * 0.999).toFixed(2)));
      return Math.max(raw, Number((ep * 1.001).toFixed(2)));
    } else {
      // SHORT: SL estrictamente encima de entrada, TP estrictamente debajo
      if (target === 'sl') return Math.max(raw, Number((ep * 1.001).toFixed(2)));
      return Math.min(raw, Number((ep * 0.999).toFixed(2)));
    }
  };

  const handlePointerDown = (target: 'sl' | 'tp' | 'auto', e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } catch {}
    setDraggingTarget(target);
    const initP = target === 'sl'
      ? (position.slPrice ?? (isLong ? position.entry * 0.98 : position.entry * 1.02))
      : target === 'tp'
      ? (position.tpPrice ?? (isLong ? position.entry * 1.04 : position.entry * 0.96))
      : position.entry;
    setDragPrice(Number(initP.toFixed(2)));
    setDragPixelY(target === 'sl' ? coords.slY : target === 'tp' ? coords.tpY : coords.entryY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingTarget || !chart || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pixelY = Math.max(4, Math.min(rect.height - 4, e.clientY - rect.top));
    setDragPixelY(pixelY);
    const raw = pixelToPrice(pixelY);
    if (raw === null) return;

    if (draggingTarget === 'auto') {
      // Determina dinámicamente si el arrastre va hacia TP o SL según la dirección
      if (pixelY < entryY) {
        // Hacia ARRIBA (precio más alto): LONG -> TP, SHORT -> SL
        const resolvedTarget = isLong ? 'tp' : 'sl';
        setDraggingTarget(resolvedTarget);
        setDragPrice(clampPrice(resolvedTarget, raw));
      } else if (pixelY > entryY) {
        // Hacia ABAJO (precio más bajo): LONG -> SL, SHORT -> TP
        const resolvedTarget = isLong ? 'sl' : 'tp';
        setDraggingTarget(resolvedTarget);
        setDragPrice(clampPrice(resolvedTarget, raw));
      }
    } else {
      setDragPrice(clampPrice(draggingTarget, raw));
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!draggingTarget) return;
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch {}
    if (dragPrice !== null && dragPrice > 0 && draggingTarget !== 'auto') {
      const clamped = clampPrice(draggingTarget, dragPrice);
      if (draggingTarget === 'sl') {
        onUpdatePositionSLTP(position.id, clamped, position.tpPrice ?? null);
      } else if (draggingTarget === 'tp') {
        onUpdatePositionSLTP(position.id, position.slPrice ?? null, clamped);
      }
    }
    setDraggingTarget(null);
    setDragPrice(null);
    setDragPixelY(null);
  };

  const handleAddDefaultSLTP = (e: React.MouseEvent) => {
    e.stopPropagation();
    const sl = isLong ? Number((position.entry * 0.98).toFixed(2)) : Number((position.entry * 1.02).toFixed(2));
    const tp = isLong ? Number((position.entry * 1.04).toFixed(2)) : Number((position.entry * 0.96).toFixed(2));
    onUpdatePositionSLTP(position.id, sl, tp);
  };

  const handleRemoveSL = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdatePositionSLTP(position.id, null, position.tpPrice ?? null);
  };

  const handleRemoveTP = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdatePositionSLTP(position.id, position.slPrice ?? null, null);
  };

  const activeSlY = draggingTarget === 'sl' && dragPixelY !== null ? dragPixelY : coords.slY;
  const activeTpY = draggingTarget === 'tp' && dragPixelY !== null ? dragPixelY : coords.tpY;

  const currentSL = draggingTarget === 'sl' && dragPrice !== null ? dragPrice : position.slPrice;
  const currentTP = draggingTarget === 'tp' && dragPrice !== null ? dragPrice : position.tpPrice;
  const slDelta = currentSL != null ? Math.abs(currentSL - position.entry) * position.sizeUnits : 0;
  const tpDelta = currentTP != null ? Math.abs(currentTP - position.entry) * position.sizeUnits : 0;
  const slPct = demoBalance > 0 ? (slDelta / demoBalance) * 100 : 0;
  const tpPct = demoBalance > 0 ? (tpDelta / demoBalance) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-20 overflow-hidden select-none"
      onPointerMove={draggingTarget ? handlePointerMove : undefined}
      onPointerUp={draggingTarget ? handlePointerUp : undefined}
    >
      <svg className="w-full h-full absolute inset-0">
        {/* ZONA TP (verde) */}
        {activeTpY !== null && (
          <rect
            x={entryX} y={Math.min(entryY, activeTpY)}
            width={zoneWidth} height={Math.max(2, Math.abs(entryY - activeTpY))}
            fill="rgba(16,185,129,0.12)" stroke="#10b981" strokeWidth={0.5} strokeDasharray="5 4"
          />
        )}
        {/* ZONA SL (roja) */}
        {activeSlY !== null && (
          <rect
            x={entryX} y={Math.min(entryY, activeSlY)}
            width={zoneWidth} height={Math.max(2, Math.abs(entryY - activeSlY))}
            fill="rgba(239,68,68,0.12)" stroke="#ef4444" strokeWidth={0.5} strokeDasharray="5 4"
          />
        )}
        {/* LINEA ENTRADA — full width */}
        <line x1={0} y1={entryY} x2="100%" y2={entryY} stroke={isLong ? '#0ea5e9' : '#f43f5e'} strokeWidth={1.5} />
        {/* LINEA TAKE PROFIT — full width verde */}
        {activeTpY !== null && (
          <line x1={0} y1={activeTpY} x2="100%" y2={activeTpY} stroke="#10b981" strokeWidth={1.5} />
        )}
        {/* LINEA STOP LOSS — full width roja */}
        {activeSlY !== null && (
          <line x1={0} y1={activeSlY} x2="100%" y2={activeSlY} stroke="#ef4444" strokeWidth={1.5} />
        )}
        {/* LINEA VERTICAL DE ENTRADA */}
        {entryX > 4 && (
          <line
            x1={entryX} y1={activeTpY ?? entryY} x2={entryX} y2={activeSlY ?? entryY}
            stroke={isLong ? '#0ea5e9' : '#f43f5e'} strokeWidth={1} strokeDasharray="3 3" opacity={0.4}
          />
        )}
      </svg>

      {/* BADGE ENTRY PnL + ARRASTRE DE SL / TP DESDE LA ENTRADA */}
      <div
        style={{ top: `${entryY}px` }}
        className="absolute right-16 -translate-y-1/2 pointer-events-auto flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-950/95 text-white border border-slate-700 shadow-xl text-[9px] font-mono font-bold z-30"
      >
        <span className={`px-1 py-0.5 rounded text-[8px] font-black ${isLong ? 'bg-sky-500' : 'bg-rose-600'}`}>{position.side}</span>
        <span className="text-slate-300">@${position.entry.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        <span className={`font-black ${position.isProfit ? 'text-emerald-400' : 'text-red-400'}`}>{position.pnl}</span>
        
        {/* Si no tiene TP, permitir arrastrar o añadir TP */}
        {!position.tpPrice && (
          <button
            type="button"
            onPointerDown={(e) => handlePointerDown('tp', e)}
            className="px-1.5 py-0.5 rounded bg-emerald-600/90 hover:bg-emerald-500 text-white text-[8px] font-black cursor-ns-resize flex items-center gap-0.5 touch-none"
            title={isEs ? 'Arrastrar para crear TP' : 'Drag to place TP'}
          >
            +TP ⇅
          </button>
        )}

        {/* Si no tiene SL, permitir arrastrar o añadir SL */}
        {!position.slPrice && (
          <button
            type="button"
            onPointerDown={(e) => handlePointerDown('sl', e)}
            className="px-1.5 py-0.5 rounded bg-red-600/90 hover:bg-red-500 text-white text-[8px] font-black cursor-ns-resize flex items-center gap-0.5 touch-none"
            title={isEs ? 'Arrastrar para crear SL' : 'Drag to place SL'}
          >
            +SL ⇅
          </button>
        )}

        {/* Agarre de arrastre directo sobre la entrada */}
        <div
          onPointerDown={(e) => handlePointerDown('auto', e)}
          className="cursor-ns-resize px-1 text-slate-400 hover:text-amber-400 touch-none"
          title={isEs ? 'Arrastra arriba/abajo para SL o TP' : 'Drag up/down for SL or TP'}
        >
          ⇅
        </div>

        <button type="button" onClick={() => onClosePosition(position.id)}
          className="p-0.5 rounded hover:bg-red-700 text-slate-400 hover:text-white cursor-pointer"
          title={isEs ? 'Cerrar posición a mercado' : 'Close at market'}
        ><X className="w-2.5 h-2.5" /></button>
      </div>

      {/* HANDLE TAKE PROFIT ARRASTRABLE CON BOTÓN DE CERRAR ORDEN TP */}
      {activeTpY !== null && currentTP != null && (
        <div
          style={{ top: `${activeTpY}px` }}
          onPointerDown={(e) => handlePointerDown('tp', e)}
          className="absolute right-16 -translate-y-1/2 pointer-events-auto cursor-ns-resize flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-900/95 text-white border border-emerald-500 shadow-xl text-[9px] font-mono font-bold touch-none z-30"
        >
          <Target className="w-2.5 h-2.5 text-emerald-300 shrink-0" />
          <span className="text-emerald-100">TP ${currentTP.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          <span className="text-[8px] text-emerald-200 font-black">+${tpDelta.toFixed(2)} (+{tpPct.toFixed(1)}%)</span>
          <span className="text-emerald-400">⇅</span>
          <button type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={handleRemoveTP}
            className="p-0.5 rounded hover:bg-emerald-600 text-emerald-300 hover:text-white cursor-pointer"
            title={isEs ? 'Quitar orden de TP' : 'Cancel TP order'}
          ><X className="w-2.5 h-2.5" /></button>
        </div>
      )}

      {/* HANDLE STOP LOSS ARRASTRABLE CON BOTÓN DE CERRAR ORDEN SL */}
      {activeSlY !== null && currentSL != null && (
        <div
          style={{ top: `${activeSlY}px` }}
          onPointerDown={(e) => handlePointerDown('sl', e)}
          className="absolute right-16 -translate-y-1/2 pointer-events-auto cursor-ns-resize flex items-center gap-1 px-2 py-0.5 rounded-lg bg-red-900/95 text-white border border-red-500 shadow-xl text-[9px] font-mono font-bold touch-none z-30"
        >
          <ShieldAlert className="w-2.5 h-2.5 text-red-300 shrink-0" />
          <span className="text-red-100">SL ${currentSL.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          <span className="text-[8px] text-red-200 font-black">-${slDelta.toFixed(2)} (-{slPct.toFixed(1)}%)</span>
          <span className="text-red-400">⇅</span>
          <button type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={handleRemoveSL}
            className="p-0.5 rounded hover:bg-red-600 text-red-300 hover:text-white cursor-pointer"
            title={isEs ? 'Quitar orden de SL' : 'Cancel SL order'}
          ><X className="w-2.5 h-2.5" /></button>
        </div>
      )}
    </div>
  );
};

