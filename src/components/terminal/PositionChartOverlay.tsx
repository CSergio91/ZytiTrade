import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Chart } from 'klinecharts';
import { PositionItem } from './types';
import { X, ShieldAlert, Target } from 'lucide-react';

export interface TradeSetupPreview {
  enabled: boolean;
  side: 'buy' | 'sell';
  entryPrice: number;
  slPercent: number;
  tpPercent: number;
  slPrice: number;
  tpPrice: number;
  estimatedLossUsd: number;
  estimatedProfitUsd: number;
}

interface PositionChartOverlayProps {
  chart: Chart | null;
  positions: PositionItem[];
  currentPrice: number;
  demoBalance: number;
  isEs: boolean;
  tradeSetupPreview?: TradeSetupPreview | null;
  onUpdatePositionSLTP: (id: string, slPrice?: number | null, tpPrice?: number | null) => void;
  onSetBreakEven?: (pos: PositionItem) => void;
  onClosePosition: (id: string) => void;
  onUpdatePreviewSLTP?: (slPercent?: number, tpPercent?: number) => void;
}

interface PositionCoords {
  id: string;
  entryY: number | null;
  slY: number | null;
  tpY: number | null;
  entryX: number;
  zoneEndX: number;
}

export const PositionChartOverlay: React.FC<PositionChartOverlayProps> = ({
  chart,
  positions,
  currentPrice,
  demoBalance,
  isEs,
  tradeSetupPreview,
  onUpdatePositionSLTP,
  onSetBreakEven,
  onClosePosition,
  onUpdatePreviewSLTP
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Coordenadas calculadas para cada posición abierta
  const [positionsCoords, setPositionsCoords] = useState<PositionCoords[]>([]);
  
  // Coordenadas calculadas para la previa (cuando no hay posiciones abiertas)
  const [previewCoords, setPreviewCoords] = useState<{
    entryY: number | null;
    slY: number | null;
    tpY: number | null;
    entryX: number;
    zoneEndX: number;
  }>({ entryY: null, slY: null, tpY: null, entryX: 0, zoneEndX: 0 });

  // Estado de arrastre (tanto para posición abierta como para previsualización)
  const [draggingItem, setDraggingItem] = useState<{
    type: 'position' | 'preview';
    positionId?: string;
    target: 'sl' | 'tp' | 'auto';
    dragPrice: number | null;
    dragPixelY: number | null;
  } | null>(null);

  const hasOpenPositions = positions.length > 0;
  const isPreviewMode = !hasOpenPositions && Boolean(tradeSetupPreview?.enabled);

  // Conversor pixel Y -> precio en el gráfico KLineChart
  const pixelToPrice = useCallback((pixelY: number): number | null => {
    if (!chart) return null;
    try {
      const converted = (chart as any).convertFromPixel([{ y: pixelY }], { paneId: 'candle_pane' }) as Array<{ value?: number }>;
      const v = converted[0]?.value;
      return typeof v === 'number' && !isNaN(v) && v > 0 ? Number(v.toFixed(2)) : null;
    } catch {
      return null;
    }
  }, [chart]);

  // Sincronización de coordenadas según estado del gráfico KLineChart
  const syncCoordinates = useCallback(() => {
    if (!chart || (!hasOpenPositions && !tradeSetupPreview?.enabled)) {
      setPositionsCoords([]);
      setPreviewCoords({ entryY: null, slY: null, tpY: null, entryX: 0, zoneEndX: 0 });
      return;
    }

    try {
      const dl = (chart as any).getDataList() as Array<{ timestamp: number }> | undefined;
      const canvasWidth = containerRef.current?.offsetWidth ?? 9999;

      let candleWidth = 12;
      let lastCandleX = canvasWidth - 100;

      if (dl && dl.length >= 1) {
        const lastTs = dl[dl.length - 1].timestamp;
        const lastCandleCoord = (chart as any).convertToPixel({ timestamp: lastTs }, { paneId: 'candle_pane' }) as { x?: number } | undefined;
        if (lastCandleCoord && typeof lastCandleCoord.x === 'number' && !isNaN(lastCandleCoord.x)) {
          lastCandleX = Math.round(lastCandleCoord.x);
        }
        if (dl.length >= 2) {
          const pCoord = (chart as any).convertToPixel({ timestamp: dl[dl.length - 2].timestamp }, { paneId: 'candle_pane' }) as { x?: number } | undefined;
          if (pCoord && typeof pCoord.x === 'number' && !isNaN(pCoord.x)) {
            const bw = Math.abs(lastCandleX - pCoord.x);
            if (bw > 1) candleWidth = bw;
          }
        }
      }

      // 1. Sincronizar todas las posiciones abiertas
      if (hasOpenPositions) {
        const newCoordsList: PositionCoords[] = positions.map((pos) => {
          const entryCoord = chart.convertToPixel({ value: pos.entry }, { paneId: 'candle_pane' }) as { y?: number } | undefined;
          const entryY = entryCoord && typeof entryCoord.y === 'number' && !isNaN(entryCoord.y) ? Math.round(entryCoord.y) : null;

          let entryX = lastCandleX;
          const entryTsCoord = (chart as any).convertToPixel({ timestamp: pos.entryTimestamp }, { paneId: 'candle_pane' }) as { x?: number } | undefined;
          if (entryTsCoord && typeof entryTsCoord.x === 'number' && !isNaN(entryTsCoord.x)) {
            const cx = Math.round(entryTsCoord.x);
            if (cx >= 0 && cx < canvasWidth) entryX = cx;
          }

          let slY: number | null = null;
          if (pos.slPrice != null) {
            const c = chart.convertToPixel({ value: pos.slPrice }, { paneId: 'candle_pane' }) as { y?: number } | undefined;
            if (c && typeof c.y === 'number' && !isNaN(c.y)) slY = Math.round(c.y);
          }

          let tpY: number | null = null;
          if (pos.tpPrice != null) {
            const c = chart.convertToPixel({ value: pos.tpPrice }, { paneId: 'candle_pane' }) as { y?: number } | undefined;
            if (c && typeof c.y === 'number' && !isNaN(c.y)) tpY = Math.round(c.y);
          }

          const zoneEndX = entryX + Math.round(candleWidth * 12);

          return { id: pos.id, entryY, slY, tpY, entryX, zoneEndX };
        });

        setPositionsCoords(newCoordsList);
      } else {
        setPositionsCoords([]);
      }

      // 2. Sincronizar coordenadas de la previsualización de orden
      if (isPreviewMode && tradeSetupPreview) {
        const entryCoord = chart.convertToPixel({ value: tradeSetupPreview.entryPrice }, { paneId: 'candle_pane' }) as { y?: number } | undefined;
        const entryY = entryCoord && typeof entryCoord.y === 'number' && !isNaN(entryCoord.y) ? Math.round(entryCoord.y) : null;

        let slY: number | null = null;
        if (tradeSetupPreview.slPrice != null) {
          const c = chart.convertToPixel({ value: tradeSetupPreview.slPrice }, { paneId: 'candle_pane' }) as { y?: number } | undefined;
          if (c && typeof c.y === 'number' && !isNaN(c.y)) slY = Math.round(c.y);
        }

        let tpY: number | null = null;
        if (tradeSetupPreview.tpPrice != null) {
          const c = chart.convertToPixel({ value: tradeSetupPreview.tpPrice }, { paneId: 'candle_pane' }) as { y?: number } | undefined;
          if (c && typeof c.y === 'number' && !isNaN(c.y)) tpY = Math.round(c.y);
        }

        const entryX = lastCandleX;
        const zoneEndX = entryX + Math.round(candleWidth * 12);

        setPreviewCoords({ entryY, slY, tpY, entryX, zoneEndX });
      }
    } catch {}
  }, [chart, positions, hasOpenPositions, isPreviewMode, tradeSetupPreview]);

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

  // Referencias para arrastre ininterrumpido en window
  const draggingItemRef = useRef(draggingItem);
  draggingItemRef.current = draggingItem;

  const positionsRef = useRef(positions);
  positionsRef.current = positions;

  const positionsCoordsRef = useRef(positionsCoords);
  positionsCoordsRef.current = positionsCoords;

  const currentPriceRef = useRef(currentPrice);
  currentPriceRef.current = currentPrice;

  // Pointer event handlers para arrastrar SL o TP en posiciones u orden previa
  const handlePointerDown = (
    type: 'position' | 'preview',
    target: 'sl' | 'tp' | 'auto',
    e: React.PointerEvent,
    posId?: string
  ) => {
    e.preventDefault();
    e.stopPropagation();

    let initPrice = 0;
    let initPixelY: number | null = null;

    if (type === 'position' && posId) {
      const pos = positions.find((p) => p.id === posId);
      const coord = positionsCoords.find((c) => c.id === posId);
      if (pos && coord) {
        initPrice = target === 'sl'
          ? (pos.slPrice ?? pos.entry)
          : target === 'tp'
          ? (pos.tpPrice ?? pos.entry)
          : pos.entry;
        initPixelY = target === 'sl' ? coord.slY : target === 'tp' ? coord.tpY : coord.entryY;
      }
    } else if (type === 'preview' && tradeSetupPreview) {
      initPrice = target === 'sl'
        ? tradeSetupPreview.slPrice
        : target === 'tp'
        ? tradeSetupPreview.tpPrice
        : tradeSetupPreview.entryPrice;
      initPixelY = target === 'sl' ? previewCoords.slY : target === 'tp' ? previewCoords.tpY : previewCoords.entryY;
    }

    setDraggingItem({
      type,
      positionId: posId,
      target,
      dragPrice: initPrice > 0 ? Number(initPrice.toFixed(2)) : null,
      dragPixelY: initPixelY
    });
  };

  // Listener global en window para arrastre continuo y sin pérdida de eventos
  useEffect(() => {
    if (!draggingItem) return;

    const onWindowPointerMove = (e: PointerEvent) => {
      const currentDrag = draggingItemRef.current;
      if (!currentDrag || !chart || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pixelY = Math.max(4, Math.min(rect.height - 4, e.clientY - rect.top));
      const rawPrice = pixelToPrice(pixelY);
      if (rawPrice === null || rawPrice <= 0) return;

      if (currentDrag.type === 'preview' && tradeSetupPreview) {
        const isLong = tradeSetupPreview.side === 'buy';
        const ep = tradeSetupPreview.entryPrice;

        let target = currentDrag.target;
        if (target === 'auto') {
          target = pixelY < (previewCoords.entryY ?? 0) ? (isLong ? 'tp' : 'sl') : (isLong ? 'sl' : 'tp');
        }

        let clampedPrice = rawPrice;
        if (isLong) {
          if (target === 'sl') clampedPrice = Math.min(rawPrice, Number((ep * 0.999).toFixed(2)));
          if (target === 'tp') clampedPrice = Math.max(rawPrice, Number((ep * 1.001).toFixed(2)));
        } else {
          if (target === 'sl') clampedPrice = Math.max(rawPrice, Number((ep * 1.001).toFixed(2)));
          if (target === 'tp') clampedPrice = Math.min(rawPrice, Number((ep * 0.999).toFixed(2)));
        }

        setDraggingItem((prev) => prev ? { ...prev, target, dragPrice: clampedPrice, dragPixelY: pixelY } : null);
        draggingItemRef.current = { ...currentDrag, target, dragPrice: clampedPrice, dragPixelY: pixelY };

        if (onUpdatePreviewSLTP) {
          if (target === 'sl') {
            const delta = Math.abs(ep - clampedPrice);
            onUpdatePreviewSLTP(Number(((delta / ep) * 100).toFixed(1)), undefined);
          } else if (target === 'tp') {
            const delta = Math.abs(clampedPrice - ep);
            onUpdatePreviewSLTP(undefined, Number(((delta / ep) * 100).toFixed(1)));
          }
        }
      } else if (currentDrag.type === 'position' && currentDrag.positionId) {
        const pos = positionsRef.current.find((p) => p.id === currentDrag.positionId);
        const coord = positionsCoordsRef.current.find((c) => c.id === currentDrag.positionId);
        if (!pos || !coord) return;

        const isLong = pos.side === 'LONG';
        const ep = pos.entry;
        const cp = (currentPriceRef.current && currentPriceRef.current > 0) ? currentPriceRef.current : pos.mark;

        let target = currentDrag.target;
        if (target === 'auto' && coord.entryY !== null) {
          target = isLong ? (rawPrice > cp ? 'tp' : 'sl') : (rawPrice < cp ? 'tp' : 'sl');
        }

        let clampedPrice = rawPrice;
        if (isLong) {
          if (target === 'sl') {
            // LONG: SL no debe superar el precio de mercado actual para evitar ejecución instantánea,
            // pero puede superar la entrada hacia arriba tanto como se desee para trailing stop / asegurar beneficios
            const maxAllowedSL = Number((cp * 0.9999).toFixed(2));
            clampedPrice = Math.min(rawPrice, maxAllowedSL);

            // Imán sutil a Break-Even solo si está a menos de 4 píxeles en pantalla de la entrada
            if (coord.entryY !== null && Math.abs(pixelY - coord.entryY) <= 4) {
              clampedPrice = ep;
            }
          } else if (target === 'tp') {
            const minAllowedTP = Number((cp * 1.0001).toFixed(2));
            clampedPrice = Math.max(rawPrice, minAllowedTP);
          }
        } else {
          // SHORT
          if (target === 'sl') {
            // SHORT: SL no debe ser menor al precio de mercado actual para evitar ejecución instantánea,
            // pero puede descender por debajo de la entrada para trailing stop / asegurar beneficios en caída
            const minAllowedSL = Number((cp * 1.0001).toFixed(2));
            clampedPrice = Math.max(rawPrice, minAllowedSL);

            // Imán sutil a Break-Even solo si está a menos de 4 píxeles en pantalla de la entrada
            if (coord.entryY !== null && Math.abs(pixelY - coord.entryY) <= 4) {
              clampedPrice = ep;
            }
          } else if (target === 'tp') {
            const maxAllowedTP = Number((cp * 0.9999).toFixed(2));
            clampedPrice = Math.min(rawPrice, maxAllowedTP);
          }
        }

        let activePixelY = pixelY;
        try {
          const pCoord = chart.convertToPixel({ value: clampedPrice }, { paneId: 'candle_pane' }) as { y?: number } | undefined;
          if (pCoord && typeof pCoord.y === 'number' && !isNaN(pCoord.y)) {
            activePixelY = Math.round(pCoord.y);
          }
        } catch {}

        setDraggingItem((prev) => prev ? { ...prev, target, dragPrice: clampedPrice, dragPixelY: activePixelY } : null);
        draggingItemRef.current = { ...currentDrag, target, dragPrice: clampedPrice, dragPixelY: activePixelY };
      }
    };

    const onWindowPointerUp = () => {
      const currentDrag = draggingItemRef.current;
      if (currentDrag && currentDrag.type === 'position' && currentDrag.positionId && currentDrag.dragPrice) {
        const pos = positionsRef.current.find((p) => p.id === currentDrag.positionId);
        if (pos) {
          let finalTarget = currentDrag.target;
          if (finalTarget === 'auto') {
            const isLong = pos.side === 'LONG';
            finalTarget = isLong
              ? (currentDrag.dragPrice > pos.entry ? 'tp' : 'sl')
              : (currentDrag.dragPrice < pos.entry ? 'tp' : 'sl');
          }

          if (finalTarget === 'sl') {
            onUpdatePositionSLTP(pos.id, currentDrag.dragPrice, pos.tpPrice ?? null);
          } else if (finalTarget === 'tp') {
            onUpdatePositionSLTP(pos.id, pos.slPrice ?? null, currentDrag.dragPrice);
          }
        }
      }

      setDraggingItem(null);
    };

    window.addEventListener('pointermove', onWindowPointerMove);
    window.addEventListener('pointerup', onWindowPointerUp);
    return () => {
      window.removeEventListener('pointermove', onWindowPointerMove);
      window.removeEventListener('pointerup', onWindowPointerUp);
    };
  }, [chart, pixelToPrice, onUpdatePreviewSLTP, onUpdatePositionSLTP, previewCoords.entryY, tradeSetupPreview, draggingItem]);

  if (!hasOpenPositions && !isPreviewMode) return null;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-20 overflow-hidden select-none"
    >
      {/* ---------------------------------------------------------------- */}
      {/* CASO 1: HAY POSICIONES ABIERTAS (RENDERIZAR TODAS LAS LÍNEAS) */}
      {/* ---------------------------------------------------------------- */}
      {hasOpenPositions && (
        <>
          <svg className="w-full h-full absolute inset-0">
            {positionsCoords.map((coord, idx) => {
              const pos = positions.find((p) => p.id === coord.id);
              if (!pos || coord.entryY === null) return null;

              const isLong = pos.side === 'LONG';
              const isDraggingThis = draggingItem?.type === 'position' && draggingItem?.positionId === pos.id;

              const activeSlY = isDraggingThis && draggingItem.target === 'sl' && draggingItem.dragPixelY !== null
                ? draggingItem.dragPixelY
                : coord.slY;

              const activeTpY = isDraggingThis && draggingItem.target === 'tp' && draggingItem.dragPixelY !== null
                ? draggingItem.dragPixelY
                : coord.tpY;

              const currentSL = isDraggingThis && draggingItem.target === 'sl' && draggingItem.dragPrice !== null
                ? draggingItem.dragPrice
                : pos.slPrice;

              const slRawPnL = currentSL != null
                ? (isLong ? (currentSL - pos.entry) * pos.sizeUnits : (pos.entry - currentSL) * pos.sizeUnits)
                : 0;

              const isSlInProfit = currentSL != null && slRawPnL > 0.05;
              const isSlBreakEven = currentSL != null && Math.abs(currentSL - pos.entry) <= 0.05;

              const slStrokeColor = isSlBreakEven ? '#3b82f6' : isSlInProfit ? '#10b981' : '#ef4444';
              const slFillColor = isSlBreakEven ? 'rgba(59,130,246,0.12)' : isSlInProfit ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.10)';

              const zoneWidth = Math.max(0, coord.zoneEndX - coord.entryX);

              return (
                <g key={`pos-lines-${pos.id}`}>
                  {/* ZONA TAKE PROFIT (VERDE CON TRAMADO SUAVE) */}
                  {activeTpY !== null && (
                    <rect
                      x={coord.entryX}
                      y={Math.min(coord.entryY, activeTpY)}
                      width={zoneWidth}
                      height={Math.max(2, Math.abs(coord.entryY - activeTpY))}
                      fill="rgba(16,185,129,0.10)"
                      stroke="#10b981"
                      strokeWidth={0.5}
                      strokeDasharray="4 3"
                    />
                  )}

                  {/* ZONA STOP LOSS (ADAPTATIVA: ROJA EN RIESGO, AZUL EN BREAK-EVEN, VERDE EN GANANCIA PROTEGIDA) */}
                  {activeSlY !== null && (
                    <rect
                      x={coord.entryX}
                      y={Math.min(coord.entryY, activeSlY)}
                      width={zoneWidth}
                      height={Math.max(2, Math.abs(coord.entryY - activeSlY))}
                      fill={slFillColor}
                      stroke={slStrokeColor}
                      strokeWidth={0.5}
                      strokeDasharray="4 3"
                    />
                  )}

                  {/* LÍNEA DE ENTRADA — ESTRICTAMENTE AZUL Y MUY FINA (0.75px) */}
                  <line
                    x1={0}
                    y1={coord.entryY}
                    x2="100%"
                    y2={coord.entryY}
                    stroke="#2563eb"
                    strokeWidth={0.75}
                  />

                  {/* LÍNEA TAKE PROFIT — VERDE Y FINA (0.75px) */}
                  {activeTpY !== null && (
                    <line
                      x1={0}
                      y1={activeTpY}
                      x2="100%"
                      y2={activeTpY}
                      stroke="#10b981"
                      strokeWidth={0.75}
                    />
                  )}

                  {/* LÍNEA STOP LOSS — DINÁMICA: ROJA, AZUL EN BE O VERDE EN BENEFICIO PROTEGIDO */}
                  {activeSlY !== null && (
                    <line
                      x1={0}
                      y1={activeSlY}
                      x2="100%"
                      y2={activeSlY}
                      stroke={slStrokeColor}
                      strokeWidth={0.75}
                    />
                  )}

                  {/* GUÍA VERTICAL EN VELAS */}
                  {coord.entryX > 4 && (
                    <line
                      x1={coord.entryX}
                      y1={activeTpY ?? coord.entryY}
                      x2={coord.entryX}
                      y2={activeSlY ?? coord.entryY}
                      stroke="#2563eb"
                      strokeWidth={0.75}
                      strokeDasharray="3 3"
                      opacity={0.35}
                    />
                  )}
                </g>
              );
            })}
          </svg>

          {/* BADGES INTERACTIVOS PARA CADA POSICIÓN ABIERTA */}
          {positionsCoords.map((coord, idx) => {
            const pos = positions.find((p) => p.id === coord.id);
            if (!pos || coord.entryY === null) return null;

            const isLong = pos.side === 'LONG';
            const isDraggingThis = draggingItem?.type === 'position' && draggingItem?.positionId === pos.id;

            const currentSL = isDraggingThis && draggingItem.target === 'sl' && draggingItem.dragPrice !== null
              ? draggingItem.dragPrice
              : pos.slPrice;

            const currentTP = isDraggingThis && draggingItem.target === 'tp' && draggingItem.dragPrice !== null
              ? draggingItem.dragPrice
              : pos.tpPrice;

            const activeSlY = isDraggingThis && draggingItem.target === 'sl' && draggingItem.dragPixelY !== null
              ? draggingItem.dragPixelY
              : coord.slY;

            const activeTpY = isDraggingThis && draggingItem.target === 'tp' && draggingItem.dragPixelY !== null
              ? draggingItem.dragPixelY
              : coord.tpY;

            const slRawPnL = currentSL != null
              ? (isLong ? (currentSL - pos.entry) * pos.sizeUnits : (pos.entry - currentSL) * pos.sizeUnits)
              : 0;
            const tpDelta = currentTP != null ? Math.abs(currentTP - pos.entry) * pos.sizeUnits : 0;

            const isSlInProfit = currentSL != null && slRawPnL > 0.05;
            const isSlBreakEven = currentSL != null && Math.abs(currentSL - pos.entry) <= 0.05;
            const slPct = demoBalance > 0 ? (Math.abs(slRawPnL) / demoBalance) * 100 : 0;
            const tpPct = demoBalance > 0 ? (tpDelta / demoBalance) * 100 : 0;

            // Desplazamiento horizontal respetando la escala de precios lateral (72px)
            // para que en móviles y táctiles se pueda interactuar con el eje Y sin obstáculos
            const baseOffsetRight = 72;
            const offsetRight = baseOffsetRight + (idx * 16);

            // Si la orden de SL o TP está a la misma altura que la Entrada (p.ej. Break-Even < 24px),
            // desplazamos el badge de Entrada a la izquierda para que ambos sean perfectamente visibles
            const isSlNearEntry = activeSlY !== null && coord.entryY !== null && Math.abs(activeSlY - coord.entryY) < 24;
            const isTpNearEntry = activeTpY !== null && coord.entryY !== null && Math.abs(activeTpY - coord.entryY) < 24;
            const entryOffsetRight = offsetRight + (isSlNearEntry || isTpNearEntry ? 200 : 0);

            return (
              <React.Fragment key={`pos-badges-${pos.id}`}>
                {/* BADGE DE ENTRADA (AZUL / SKY) */}
                <div
                  style={{ top: `${coord.entryY}px`, right: `${entryOffsetRight}px` }}
                  className="absolute -translate-y-1/2 pointer-events-auto flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-950/95 text-white border border-blue-500/80 shadow-md text-[9px] font-mono font-bold z-30 transition-all"
                >
                  <span className={`px-1 py-0.2 rounded text-[8px] font-black ${isLong ? 'bg-blue-600' : 'bg-indigo-600'}`}>
                    {pos.side} #{idx + 1}
                  </span>
                  <span className="text-slate-300">
                    @${pos.entry.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <span className={`font-black ${pos.isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
                    {pos.pnl}
                  </span>

                  {/* Botones para arrastrar o crear SL y TP si no existen */}
                  {!pos.tpPrice && (
                    <button
                      type="button"
                      onPointerDown={(e) => handlePointerDown('position', 'tp', e, pos.id)}
                      className="px-1 py-0.2 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[8px] font-black cursor-ns-resize flex items-center gap-0.5 touch-none"
                      title={isEs ? 'Arrastrar para crear TP' : 'Drag to place TP'}
                    >
                      +TP ⇅
                    </button>
                  )}

                  {!pos.slPrice && (
                    <button
                      type="button"
                      onPointerDown={(e) => handlePointerDown('position', 'sl', e, pos.id)}
                      className="px-1 py-0.2 rounded bg-red-600 hover:bg-red-500 text-white text-[8px] font-black cursor-ns-resize flex items-center gap-0.5 touch-none"
                      title={isEs ? 'Arrastrar para crear SL' : 'Drag to place SL'}
                    >
                      +SL ⇅
                    </button>
                  )}

                  {/* Botón rápido Break-Even (BE): SIEMPRE VISIBLE, con feedback de validación/error */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onSetBreakEven) {
                        onSetBreakEven(pos);
                      } else {
                        onUpdatePositionSLTP(pos.id, pos.entry, pos.tpPrice ?? null);
                      }
                    }}
                    className={`px-1.5 py-0.5 rounded text-[8px] font-black cursor-pointer flex items-center gap-0.5 transition-all ${
                      pos.slPrice && Math.abs(pos.slPrice - pos.entry) < 0.05
                        ? 'bg-blue-500 text-white ring-1 ring-blue-300 shadow-xs'
                        : pos.isProfit
                        ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-xs active:scale-95'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:text-amber-300 active:scale-95'
                    }`}
                    title={
                      pos.slPrice && Math.abs(pos.slPrice - pos.entry) < 0.05
                        ? (isEs ? 'Break-Even activo en entrada. Arrastra el SL para proteger ganancias' : 'Break-Even active at entry. Drag SL to trail profits')
                        : pos.isProfit
                        ? (isEs ? 'Fijar Stop Loss a Break-Even (Entrada)' : 'Set Stop Loss to Break-Even (Entry)')
                        : (isEs ? 'Posición en pérdida. Pulsa para ver requerimientos' : 'Position in loss. Click to view requirements')
                    }
                  >
                    BE
                  </button>

                  <div
                    onPointerDown={(e) => handlePointerDown('position', 'auto', e, pos.id)}
                    className="cursor-ns-resize px-0.5 text-slate-400 hover:text-amber-400 touch-none"
                    title={isEs ? 'Arrastra arriba/abajo para SL o TP' : 'Drag up/down for SL or TP'}
                  >
                    ⇅
                  </div>

                  <button
                    type="button"
                    onClick={() => onClosePosition(pos.id)}
                    className="p-0.5 rounded hover:bg-red-700 text-slate-400 hover:text-white cursor-pointer"
                    title={isEs ? 'Cerrar posición a mercado' : 'Close at market'}
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>

                {/* BADGE TAKE PROFIT ARRASTRABLE */}
                {activeTpY !== null && currentTP != null && (
                  <div
                    style={{ top: `${activeTpY}px`, right: `${offsetRight}px` }}
                    onPointerDown={(e) => handlePointerDown('position', 'tp', e, pos.id)}
                    className="absolute -translate-y-1/2 pointer-events-auto cursor-ns-resize flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-950/95 text-emerald-200 border border-emerald-500 shadow-md text-[9px] font-mono font-bold touch-none z-30"
                  >
                    <Target className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                    <span>TP ${currentTP.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    <span className="text-[8px] text-emerald-300 font-black">+${tpDelta.toFixed(2)} (+{tpPct.toFixed(1)}%)</span>
                    <span className="text-emerald-400">⇅</span>
                    <button
                      type="button"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdatePositionSLTP(pos.id, pos.slPrice ?? null, null);
                      }}
                      className="p-0.5 rounded hover:bg-emerald-600 text-emerald-300 hover:text-white cursor-pointer"
                      title={isEs ? 'Quitar orden de TP' : 'Cancel TP order'}
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                )}

                {/* BADGE STOP LOSS ARRASTRABLE (RIESGO, BREAK-EVEN O GANANCIA PROTEGIDA) */}
                {activeSlY !== null && currentSL != null && (
                  <div
                    style={{ top: `${activeSlY}px`, right: `${offsetRight}px` }}
                    onPointerDown={(e) => handlePointerDown('position', 'sl', e, pos.id)}
                    className={`absolute -translate-y-1/2 pointer-events-auto cursor-ns-resize flex items-center gap-1 px-2 py-0.5 rounded-lg shadow-md text-[9px] font-mono font-bold touch-none z-30 transition-colors ${
                      isSlBreakEven
                        ? 'bg-blue-950/95 text-blue-200 border border-blue-400'
                        : isSlInProfit
                        ? 'bg-emerald-950/95 text-emerald-200 border border-emerald-500'
                        : 'bg-red-950/95 text-red-200 border border-red-500'
                    }`}
                  >
                    <ShieldAlert className={`w-2.5 h-2.5 shrink-0 ${
                      isSlBreakEven ? 'text-blue-400' : isSlInProfit ? 'text-emerald-400' : 'text-red-400'
                    }`} />
                    <span>
                      {isSlBreakEven ? 'SL (BE)' : isSlInProfit ? (isEs ? 'SL (Protegido)' : 'SL (Protected)') : 'SL'}{' '}
                      ${currentSL.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                    <span className={`text-[8px] font-black ${
                      isSlBreakEven ? 'text-blue-300' : isSlInProfit ? 'text-emerald-300' : 'text-red-300'
                    }`}>
                      {isSlBreakEven
                        ? '$0.00 (BE)'
                        : isSlInProfit
                        ? `+$${slRawPnL.toFixed(2)} (+${slPct.toFixed(1)}%)`
                        : `-$${Math.abs(slRawPnL).toFixed(2)} (-${slPct.toFixed(1)}%)`}
                    </span>
                    <span className={isSlBreakEven ? 'text-blue-400' : isSlInProfit ? 'text-emerald-400' : 'text-red-400'}>⇅</span>
                    <button
                      type="button"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdatePositionSLTP(pos.id, null, pos.tpPrice ?? null);
                      }}
                      className="p-0.5 rounded hover:bg-slate-700/60 text-slate-300 hover:text-white cursor-pointer"
                      title={isEs ? 'Quitar orden de SL' : 'Cancel SL order'}
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* CASO 2: NO HAY POSICIONES ABIERTAS (PREVIA CONFIGURACIÓN ARRASTRABLE LIMPIA) */}
      {/* ---------------------------------------------------------------- */}
      {isPreviewMode && tradeSetupPreview && previewCoords.entryY !== null && (
        <>
          <svg className="w-full h-full absolute inset-0 pointer-events-none">
            {/* LÍNEA DE ENTRADA PREVIA — AZUL Y FINA (0.75px) */}
            <line
              x1={0}
              y1={previewCoords.entryY}
              x2="100%"
              y2={previewCoords.entryY}
              stroke="#2563eb"
              strokeWidth={0.75}
              strokeDasharray="4 3"
            />

            {/* LÍNEA TP PREVIA — VERDE Y FINA (0.75px) */}
            {previewCoords.tpY !== null && (
              <line
                x1={0}
                y1={previewCoords.tpY}
                x2="100%"
                y2={previewCoords.tpY}
                stroke="#10b981"
                strokeWidth={0.75}
                strokeDasharray="4 3"
              />
            )}

            {/* LÍNEA SL PREVIA — ROJA Y FINA (0.75px) */}
            {previewCoords.slY !== null && (
              <line
                x1={0}
                y1={previewCoords.slY}
                x2="100%"
                y2={previewCoords.slY}
                stroke="#ef4444"
                strokeWidth={0.75}
                strokeDasharray="4 3"
              />
            )}
          </svg>

          {/* BADGE PREVIO DE ENTRADA — AZUL */}
          <div
            style={{ top: `${previewCoords.entryY}px` }}
            className="absolute right-16 -translate-y-1/2 flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-900/95 text-white border border-blue-500 shadow-md text-[9px] font-mono font-bold z-30 pointer-events-auto"
          >
            <span className="px-1 py-0.2 rounded text-[8px] font-black bg-blue-600">
              CONFIG {tradeSetupPreview.side === 'buy' ? 'LONG' : 'SHORT'}
            </span>
            <span className="text-slate-300">
              @${tradeSetupPreview.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            <div
              onPointerDown={(e) => handlePointerDown('preview', 'auto', e)}
              className="cursor-ns-resize px-1 text-slate-400 hover:text-amber-400 touch-none"
              title={isEs ? 'Arrastra para mover SL o TP' : 'Drag to adjust SL or TP'}
            >
              ⇅
            </div>
          </div>

          {/* BADGE PREVIO TAKE PROFIT ARRASTRABLE (ACTUALIZA PANEL EN TIEMPO REAL) */}
          {previewCoords.tpY !== null && (
            <div
              style={{ top: `${previewCoords.tpY}px` }}
              onPointerDown={(e) => handlePointerDown('preview', 'tp', e)}
              className="absolute right-16 -translate-y-1/2 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-950/95 text-emerald-200 border border-emerald-500 shadow-md text-[9px] font-mono font-bold z-30 pointer-events-auto cursor-ns-resize touch-none"
              title={isEs ? 'Arrastra para modificar TP en tiempo real' : 'Drag to adjust TP in real time'}
            >
              <Target className="w-2.5 h-2.5 text-emerald-400" />
              <span>TP ${tradeSetupPreview.tpPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              <span className="text-[8px] text-emerald-300 font-black">
                (+{tradeSetupPreview.tpPercent}%) +${tradeSetupPreview.estimatedProfitUsd.toFixed(1)}
              </span>
              <span className="text-emerald-400">⇅</span>
            </div>
          )}

          {/* BADGE PREVIO STOP LOSS ARRASTRABLE (ACTUALIZA PANEL EN TIEMPO REAL) */}
          {previewCoords.slY !== null && (
            <div
              style={{ top: `${previewCoords.slY}px` }}
              onPointerDown={(e) => handlePointerDown('preview', 'sl', e)}
              className="absolute right-16 -translate-y-1/2 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-red-950/95 text-red-200 border border-red-500 shadow-md text-[9px] font-mono font-bold z-30 pointer-events-auto cursor-ns-resize touch-none"
              title={isEs ? 'Arrastra para modificar SL en tiempo real' : 'Drag to adjust SL in real time'}
            >
              <ShieldAlert className="w-2.5 h-2.5 text-red-400" />
              <span>SL ${tradeSetupPreview.slPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              <span className="text-[8px] text-red-300 font-black">
                (-{tradeSetupPreview.slPercent}%) -${tradeSetupPreview.estimatedLossUsd.toFixed(1)}
              </span>
              <span className="text-red-400">⇅</span>
            </div>
          )}
        </>
      )}
    </div>
  );
};
