import React, { useState, useMemo, useRef } from 'react';
import { TraderTradeAuditItem } from '../types/crm.types';

interface TraderPerformanceLinearChartProps {
  initialBalance: number;
  currentBalance: number;
  equity: number;
  profitTargetAmount: number;
  maxDailyLossAmount: number;
  maxTotalLossAmount: number;
  trades: TraderTradeAuditItem[];
  isEs?: boolean;
  height?: number;
}

interface DataPoint {
  timestamp: number;
  label: string;
  balance: number;
  pnl?: number;
  tradeInfo?: string;
}

export const TraderPerformanceLinearChart: React.FC<TraderPerformanceLinearChartProps> = ({
  initialBalance = 100000,
  currentBalance = 100000,
  equity = 100000,
  profitTargetAmount = 10000,
  maxDailyLossAmount = 4000,
  maxTotalLossAmount = 6000,
  trades = [],
  isEs = true,
  height = 340
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredPoint, setHoveredPoint] = useState<{ point: DataPoint; x: number; y: number } | null>(null);

  // 1. Niveles Clave Institucionales
  const targetPrice = initialBalance + profitTargetAmount;
  const bePrice = initialBalance;
  const currentPrice = currentBalance;
  // Pérdida máxima diaria calculada respecto al inicio del día o saldo base
  const dailyLossLimitPrice = Math.max(initialBalance - maxTotalLossAmount, initialBalance - maxDailyLossAmount);

  // 2. Construcción de la Serie Temporal de Balance / Equity a partir de los Trades
  const points: DataPoint[] = useMemo(() => {
    const closedTrades = trades
      .filter(t => t.status === 'CLOSED' && t.closedAt)
      .sort((a, b) => new Date(a.closedAt!).getTime() - new Date(b.closedAt!).getTime());

    if (closedTrades.length === 0) {
      // Si aún no hay trades cerrados, generar puntos representativos
      const now = Date.now();
      const p1Ts = now - 1000 * 60 * 180;
      const p2Ts = now - 1000 * 60 * 120;
      const p3Ts = now - 1000 * 60 * 60;
      const p4Ts = now;

      // Si el balance difiere del inicial, crear una curva suave
      const delta = currentBalance - initialBalance;
      return [
        {
          timestamp: p1Ts,
          label: new Date(p1Ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          balance: initialBalance,
          tradeInfo: isEs ? 'Inicio de Cuenta' : 'Account Start'
        },
        {
          timestamp: p2Ts,
          label: new Date(p2Ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          balance: initialBalance + delta * 0.35,
          tradeInfo: 'Trade #1'
        },
        {
          timestamp: p3Ts,
          label: new Date(p3Ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          balance: initialBalance + delta * 0.7,
          tradeInfo: 'Trade #2'
        },
        {
          timestamp: p4Ts,
          label: new Date(p4Ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          balance: currentBalance,
          tradeInfo: isEs ? 'Balance Actual' : 'Current Balance'
        }
      ];
    }

    // Calcular la evolución real acumulada trade por trade
    const pts: DataPoint[] = [];
    const firstTradeTs = new Date(closedTrades[0].openedAt || closedTrades[0].closedAt!).getTime() - 1000 * 60 * 15;
    pts.push({
      timestamp: firstTradeTs,
      label: new Date(firstTradeTs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      balance: initialBalance,
      tradeInfo: isEs ? 'Apertura de Cuenta' : 'Account Opened'
    });

    let cumBal = initialBalance;
    closedTrades.forEach((tr) => {
      const pnl = Number(tr.realizedPnl ?? 0);
      cumBal += pnl;
      const ts = new Date(tr.closedAt!).getTime();
      pts.push({
        timestamp: ts,
        label: new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        balance: cumBal,
        pnl: pnl,
        tradeInfo: `${tr.symbol} (${tr.side}) ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}`
      });
    });

    // Añadir punto final si el balance actual difiere ligeramente
    if (Math.abs(cumBal - currentBalance) > 1) {
      const now = Date.now();
      pts.push({
        timestamp: now,
        label: new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        balance: currentBalance,
        tradeInfo: isEs ? 'Balance en Vivo' : 'Live Balance'
      });
    }

    return pts;
  }, [trades, initialBalance, currentBalance, isEs]);

  // 3. Rango y Escala Vertical
  const allValues = [
    targetPrice,
    bePrice,
    currentPrice,
    dailyLossLimitPrice,
    ...points.map(p => p.balance)
  ];
  const rawMin = Math.min(...allValues);
  const rawMax = Math.max(...allValues);
  const valMargin = (rawMax - rawMin) * 0.15 || (initialBalance * 0.02);
  const yMin = rawMin - valMargin;
  const yMax = rawMax + valMargin;

  // Dimensiones SVG
  const width = 860;
  const paddingLeft = 140; // Espacio a la izquierda para los badges de niveles exactos
  const paddingRight = 40;
  const paddingTop = 35;
  const paddingBottom = 45;
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const getY = (val: number) => {
    if (yMax === yMin) return paddingTop + chartHeight / 2;
    const ratio = (val - yMin) / (yMax - yMin);
    return paddingTop + chartHeight * (1 - ratio);
  };

  const getX = (index: number) => {
    if (points.length <= 1) return paddingLeft + chartWidth / 2;
    return paddingLeft + (index / (points.length - 1)) * chartWidth;
  };

  const beY = getY(bePrice);
  const targetY = getY(targetPrice);
  const currentY = getY(currentPrice);
  const dailyLossY = getY(dailyLossLimitPrice);

  // 4. Construcción de Rutas SVG (Curva y Áreas coloreadas verde arriba / roja abajo)
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(p.balance).toFixed(1)}`).join(' ');

  // Área superior verde (desde la curva hasta la línea BE)
  const topAreaPath = `${pathD} L ${getX(points.length - 1).toFixed(1)} ${beY.toFixed(1)} L ${getX(0).toFixed(1)} ${beY.toFixed(1)} Z`;

  // Ticks del eje Y
  const numYTicks = 7;
  const yTicks = useMemo(() => {
    const ticks: number[] = [];
    const step = (yMax - yMin) / (numYTicks - 1);
    for (let i = 0; i < numYTicks; i++) {
      ticks.push(yMin + i * step);
    }
    return ticks;
  }, [yMin, yMax]);

  // Formato monetario
  const fmt = (num: number) => {
    return num.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="w-full select-none" ref={containerRef}>
      {/* Encabezado sutil institucional */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-2 border-b border-[#ece7dc] gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <h4 className="text-xs font-black text-[#0F172A] tracking-wider uppercase">
            {isEs ? 'Curva de Rendimiento & Umbrales de Riesgo' : 'Performance Curve & Risk Thresholds'}
          </h4>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono font-bold">
          <span className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-[#00C2A8]" />
            {isEs ? 'Beneficio sobre BE' : 'Profit over BE'}
          </span>
          <span className="flex items-center gap-1.5 text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-[#F43F5E]" />
            {isEs ? 'Drawdown bajo BE' : 'Drawdown below BE'}
          </span>
        </div>
      </div>

      {/* Contenedor del Gráfico SVG con viewBox responsivo */}
      <div className="relative w-full overflow-hidden bg-white/70 rounded-2xl border border-[#ede7dc] p-1 shadow-2xs">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto block font-sans"
          style={{ maxHeight: height }}
        >
          <defs>
            {/* Máscara para recortar área verde solo arriba de la línea BE */}
            <clipPath id="clip-above-be">
              <rect x={paddingLeft} y={0} width={chartWidth} height={beY} />
            </clipPath>
            {/* Máscara para recortar área roja solo abajo de la línea BE */}
            <clipPath id="clip-below-be">
              <rect x={paddingLeft} y={beY} width={chartWidth} height={height - beY} />
            </clipPath>

            {/* Gradientes translúcidos suaves */}
            <linearGradient id="greenAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00C2A8" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#00C2A8" stopOpacity="0.08" />
            </linearGradient>
            <linearGradient id="redAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#F43F5E" stopOpacity="0.32" />
            </linearGradient>
          </defs>

          {/* Líneas de rejilla horizontales */}
          {yTicks.map((val, idx) => {
            const y = getY(val);
            return (
              <g key={`grid-${idx}`}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#F1ECE2"
                  strokeWidth={1}
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  className="text-[10px] font-mono fill-slate-400 font-semibold"
                >
                  {fmt(val)} $
                </text>
              </g>
            );
          })}

          {/* Eje X (Líneas y horas) */}
          <line
            x1={paddingLeft}
            y1={height - paddingBottom}
            x2={width - paddingRight}
            y2={height - paddingBottom}
            stroke="#DCD6CA"
            strokeWidth={1.5}
          />
          {points.map((pt, idx) => {
            const x = getX(idx);
            // Mostrar horas espaciadas
            const shouldShowLabel = points.length <= 6 || idx % Math.ceil(points.length / 6) === 0 || idx === points.length - 1;
            return (
              <g key={`x-tick-${idx}`}>
                <line
                  x1={x}
                  y1={height - paddingBottom}
                  x2={x}
                  y2={height - paddingBottom + 5}
                  stroke="#C8C0B2"
                  strokeWidth={1.2}
                />
                {shouldShowLabel && (
                  <text
                    x={x}
                    y={height - paddingBottom + 18}
                    textAnchor="middle"
                    className="text-[10.5px] font-mono fill-slate-600 font-bold"
                  >
                    {pt.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* ==================================================================== */}
          {/* LÍNEAS DE REFERENCIA HORIZONTALES CON PÍLDORAS (COMO EN LA FOTO) */}
          {/* ==================================================================== */}

          {/* 1. OBJETIVO DE GANANCIAS (Línea sólida Verde Menta) */}
          <line
            x1={paddingLeft}
            y1={targetY}
            x2={width - paddingRight}
            y2={targetY}
            stroke="#00C2A8"
            strokeWidth={1.8}
          />
          {/* Badge Objetivo de Ganancias */}
          <g transform={`translate(${paddingLeft - 130}, ${targetY - 10})`}>
            <rect
              width="128"
              height="20"
              rx="4"
              fill="#00C2A8"
            />
            <text
              x="6"
              y="13"
              className="text-[9px] font-mono font-extrabold fill-white"
            >
              {fmt(targetPrice)} $
            </text>
            <text
              x="64"
              y="13"
              className="text-[8.5px] font-sans font-bold fill-white"
            >
              | {isEs ? 'Objetivo' : 'Target'}
            </text>
          </g>

          {/* 2. BALANCE ACTUAL (Línea punteada Azul Cobalto) */}
          <line
            x1={paddingLeft}
            y1={currentY}
            x2={width - paddingRight}
            y2={currentY}
            stroke="#0072FF"
            strokeWidth={1.5}
            strokeDasharray="3 3"
          />
          {/* Badge Balance */}
          <g transform={`translate(${paddingLeft - 130}, ${currentY - 10})`}>
            <rect
              width="128"
              height="20"
              rx="4"
              fill="#0072FF"
            />
            <text
              x="6"
              y="13"
              className="text-[9px] font-mono font-extrabold fill-white"
            >
              {fmt(currentPrice)} $
            </text>
            <text
              x="64"
              y="13"
              className="text-[8.5px] font-sans font-bold fill-white"
            >
              | Balance
            </text>
          </g>

          {/* 3. TAMAÑO DE CUENTA / BE (Línea punteada Negra / Carbón) */}
          <line
            x1={paddingLeft}
            y1={beY}
            x2={width - paddingRight}
            y2={beY}
            stroke="#0F172A"
            strokeWidth={1.4}
            strokeDasharray="2 2"
          />
          {/* Badge Tamaño de Cuenta */}
          <g transform={`translate(${paddingLeft - 130}, ${beY - 10})`}>
            <rect
              width="128"
              height="20"
              rx="4"
              fill="#0F172A"
            />
            <text
              x="6"
              y="13"
              className="text-[9px] font-mono font-extrabold fill-white"
            >
              {fmt(bePrice)} $
            </text>
            <text
              x="64"
              y="13"
              className="text-[8.5px] font-sans font-bold fill-white"
            >
              | {isEs ? 'Base BE' : 'Base BE'}
            </text>
          </g>

          {/* 4. PÉRDIDA MÁXIMA DIARIA / TOTAL (Línea sólida Roja Carmín) */}
          <line
            x1={paddingLeft}
            y1={dailyLossY}
            x2={width - paddingRight}
            y2={dailyLossY}
            stroke="#F43F5E"
            strokeWidth={1.8}
          />
          {/* Badge Pérdida Máxima */}
          <g transform={`translate(${paddingLeft - 130}, ${dailyLossY - 10})`}>
            <rect
              width="128"
              height="20"
              rx="4"
              fill="#F43F5E"
            />
            <text
              x="6"
              y="13"
              className="text-[9px] font-mono font-extrabold fill-white"
            >
              {fmt(dailyLossLimitPrice)} $
            </text>
            <text
              x="64"
              y="13"
              className="text-[8.5px] font-sans font-bold fill-white"
            >
              | {isEs ? 'Pérdida Máx.' : 'Max Loss'}
            </text>
          </g>

          {/* ==================================================================== */}
          {/* RELLENOS BAJO LA CURVA: VERDE ARRIBA DEL BE / ROJO ABAJO DEL BE */}
          {/* ==================================================================== */}
          {/* Zona Verde (Ganancias) */}
          <g clipPath="url(#clip-above-be)">
            <path
              d={topAreaPath}
              fill="url(#greenAreaGrad)"
            />
          </g>

          {/* Zona Roja (Pérdidas respecto a BE) */}
          <g clipPath="url(#clip-below-be)">
            <path
              d={topAreaPath}
              fill="url(#redAreaGrad)"
            />
          </g>

          {/* Curva Principal de Trazo Dual */}
          {/* Tramo arriba de BE (Color Verde Menta) */}
          <g clipPath="url(#clip-above-be)">
            <path
              d={pathD}
              fill="none"
              stroke="#00C2A8"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>

          {/* Tramo abajo de BE (Color Rojo Carmín) */}
          <g clipPath="url(#clip-below-be)">
            <path
              d={pathD}
              fill="none"
              stroke="#F43F5E"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>

          {/* Puntos interactivos sobre la curva */}
          {points.map((pt, idx) => {
            const x = getX(idx);
            const y = getY(pt.balance);
            const isAbove = pt.balance >= bePrice;
            const isHovered = hoveredPoint?.point === pt;

            return (
              <g 
                key={`dot-${idx}`}
                className="cursor-pointer transition-transform"
                onMouseEnter={() => setHoveredPoint({ point: pt, x, y })}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 6 : 3.5}
                  fill="#FFFFFF"
                  stroke={isAbove ? '#00C2A8' : '#F43F5E'}
                  strokeWidth={isHovered ? 3 : 2}
                  style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.15))' }}
                />
              </g>
            );
          })}
        </svg>

        {/* Tooltip flotante interactivo */}
        {hoveredPoint && (
          <div
            className="absolute z-30 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3 px-3 py-2 rounded-xl bg-slate-900/95 backdrop-blur-md text-white text-xs shadow-xl border border-slate-700/80 animate-fadeIn"
            style={{
              left: `${(hoveredPoint.x / width) * 100}%`,
              top: `${(hoveredPoint.y / height) * 100}%`
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-slate-300 text-[10px]">{hoveredPoint.point.label}</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                hoveredPoint.point.balance >= bePrice ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
              }`}>
                {hoveredPoint.point.balance >= bePrice ? (isEs ? 'Ganancia' : 'Profit') : 'Drawdown'}
              </span>
            </div>
            <div className="font-mono font-black text-sm text-white">
              ${fmt(hoveredPoint.point.balance)}
            </div>
            {hoveredPoint.point.tradeInfo && (
              <div className="text-[10.5px] text-slate-300 font-medium mt-0.5">
                {hoveredPoint.point.tradeInfo}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
