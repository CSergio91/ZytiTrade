import React, { useEffect, useRef } from 'react';

export const BackgroundTradingChart: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Generar dataset inicial de velas
    const candleCount = Math.floor(width / 14);
    let currentPrice = 64200;
    const candles: Array<{ open: number; close: number; high: number; low: number; vol: number }> = [];

    for (let i = 0; i < candleCount; i++) {
      const delta = (Math.random() - 0.49) * 45;
      const open = currentPrice;
      const close = open + delta;
      const high = Math.max(open, close) + Math.random() * 25;
      const low = Math.min(open, close) - Math.random() * 25;
      const vol = 15 + Math.random() * 65;
      candles.push({ open, close, high, low, vol });
      currentPrice = close;
    }

    let tickCounter = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Fondo base degradado claro y limpio
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#f8fafc'); // Slate-50
      bgGrad.addColorStop(1, '#f1f5f9'); // Slate-100
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Cuadrícula sutil tipo TradingView
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(226, 232, 240, 0.75)'; // Slate-200 suave
      const gridSpacingX = 80;
      const gridSpacingY = 55;

      ctx.beginPath();
      for (let x = 0; x < width; x += gridSpacingX) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += gridSpacingY) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Encontrar rangos de precio para escala
      let minP = Infinity;
      let maxP = -Infinity;
      candles.forEach((c) => {
        if (c.low < minP) minP = c.low;
        if (c.high > maxP) maxP = c.high;
      });
      const priceRange = maxP - minP || 1;
      const chartTop = height * 0.15;
      const chartBottom = height * 0.75;
      const chartHeight = chartBottom - chartTop;

      const getY = (val: number) => chartBottom - ((val - minP) / priceRange) * chartHeight;

      const candleWidth = 7;
      const spacing = width / candles.length;

      // Dibujar barras de volumen en la base
      candles.forEach((c, idx) => {
        const x = idx * spacing + spacing / 2;
        const vH = (c.vol / 100) * (height * 0.18);
        const isUp = c.close >= c.open;
        ctx.fillStyle = isUp ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)';
        ctx.fillRect(x - candleWidth / 2, height - vH, candleWidth, vH);
      });

      // Dibujar velas
      candles.forEach((c, idx) => {
        const x = idx * spacing + spacing / 2;
        const openY = getY(c.open);
        const closeY = getY(c.close);
        const highY = getY(c.high);
        const lowY = getY(c.low);
        const isUp = c.close >= c.open;

        ctx.strokeStyle = isUp ? 'rgba(16, 185, 129, 0.55)' : 'rgba(239, 68, 68, 0.55)';
        ctx.fillStyle = isUp ? 'rgba(16, 185, 129, 0.45)' : 'rgba(239, 68, 68, 0.45)';

        // Mecha
        ctx.beginPath();
        ctx.moveTo(x, highY);
        ctx.lineTo(x, lowY);
        ctx.stroke();

        // Cuerpo de la vela
        const bodyY = Math.min(openY, closeY);
        const bodyH = Math.max(Math.abs(closeY - openY), 2);
        ctx.fillRect(x - candleWidth / 2, bodyY, candleWidth, bodyH);
      });

      // Medias Móviles exponenciales (EMA)
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(37, 99, 235, 0.45)'; // Azul primario suave
      candles.forEach((c, idx) => {
        const x = idx * spacing + spacing / 2;
        const y = getY(c.close) + Math.sin(idx * 0.15) * 8;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      ctx.beginPath();
      ctx.strokeStyle = 'rgba(124, 58, 237, 0.4)'; // Violeta suave
      candles.forEach((c, idx) => {
        const x = idx * spacing + spacing / 2;
        const y = getY(c.close) - Math.cos(idx * 0.12) * 12;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Línea de precio actual animada
      const lastCandle = candles[candles.length - 1];
      const lastY = getY(lastCandle.close);
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = 'rgba(37, 99, 235, 0.6)';
      ctx.beginPath();
      ctx.moveTo(0, lastY);
      ctx.lineTo(width, lastY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Badge de precio actual en el eje derecho
      ctx.fillStyle = '#2563eb';
      ctx.fillRect(width - 95, lastY - 12, 90, 24);
      ctx.fillStyle = '#ffffff';
      ctx.font = '11px JetBrains Mono, monospace';
      ctx.fillText('$' + lastCandle.close.toFixed(2), width - 85, lastY + 4);

      // Simulación de streaming de tick cada 6 frames
      tickCounter++;
      if (tickCounter % 6 === 0) {
        const change = (Math.random() - 0.495) * 6;
        lastCandle.close += change;
        if (lastCandle.close > lastCandle.high) lastCandle.high = lastCandle.close;
        if (lastCandle.close < lastCandle.low) lastCandle.low = lastCandle.close;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-80"
      style={{ filter: 'contrast(102%)' }}
    />
  );
};
