import React, { useEffect, useRef } from 'react';

interface BackgroundTradingChartProps {
  theme: 'light' | 'dark';
}

export const BackgroundTradingChart: React.FC<BackgroundTradingChartProps> = ({ theme }) => {
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

      const isDark = theme === 'dark';

      // 1. Fondo: Blanco Puro (#ffffff) en modo claro vs Dark Obsidian (#090d16) en modo oscuro
      if (isDark) {
        const bgGrad = ctx.createLinearGradient(0, 0, width, height);
        bgGrad.addColorStop(0, '#090d16');
        bgGrad.addColorStop(1, '#05080f');
        ctx.fillStyle = bgGrad;
      } else {
        ctx.fillStyle = '#ffffff'; // BLANCO PURO ABSOLUTO
      }
      ctx.fillRect(0, 0, width, height);

      // 2. Cuadrícula
      ctx.lineWidth = 1;
      ctx.strokeStyle = isDark ? 'rgba(30, 41, 59, 0.4)' : 'rgba(0, 0, 0, 0.04)'; // Línea gris ultra suave sobre blanco puro
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

      // Escala
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

      // 3. Volumen
      candles.forEach((c, idx) => {
        const x = idx * spacing + spacing / 2;
        const vH = (c.vol / 100) * (height * 0.16);
        const isUp = c.close >= c.open;
        if (isDark) {
          ctx.fillStyle = isUp ? 'rgba(16, 185, 129, 0.18)' : 'rgba(244, 63, 94, 0.18)';
        } else {
          ctx.fillStyle = isUp ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)';
        }
        ctx.fillRect(x - candleWidth / 2, height - vH, candleWidth, vH);
      });

      // 4. Velas
      candles.forEach((c, idx) => {
        const x = idx * spacing + spacing / 2;
        const openY = getY(c.open);
        const closeY = getY(c.close);
        const highY = getY(c.high);
        const lowY = getY(c.low);
        const isUp = c.close >= c.open;

        if (isDark) {
          ctx.strokeStyle = isUp ? 'rgba(16, 185, 129, 0.8)' : 'rgba(244, 63, 94, 0.8)';
          ctx.fillStyle = isUp ? 'rgba(16, 185, 129, 0.65)' : 'rgba(244, 63, 94, 0.65)';
        } else {
          ctx.strokeStyle = isUp ? '#10b981' : '#ef4444';
          ctx.fillStyle = isUp ? 'rgba(16, 185, 129, 0.65)' : 'rgba(239, 68, 68, 0.65)';
        }

        // Mecha
        ctx.beginPath();
        ctx.moveTo(x, highY);
        ctx.lineTo(x, lowY);
        ctx.stroke();

        // Cuerpo
        const bodyY = Math.min(openY, closeY);
        const bodyH = Math.max(Math.abs(closeY - openY), 2);
        ctx.fillRect(x - candleWidth / 2, bodyY, candleWidth, bodyH);
      });

      // 5. Medias Móviles
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.strokeStyle = isDark ? 'rgba(56, 189, 248, 0.6)' : 'rgba(37, 99, 235, 0.65)';
      candles.forEach((c, idx) => {
        const x = idx * spacing + spacing / 2;
        const y = getY(c.close) + Math.sin(idx * 0.15) * 8;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      ctx.beginPath();
      ctx.strokeStyle = isDark ? 'rgba(168, 85, 247, 0.55)' : 'rgba(124, 58, 237, 0.6)';
      candles.forEach((c, idx) => {
        const x = idx * spacing + spacing / 2;
        const y = getY(c.close) - Math.cos(idx * 0.12) * 12;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // 6. Línea de precio
      const lastCandle = candles[candles.length - 1];
      const lastY = getY(lastCandle.close);
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = isDark ? 'rgba(56, 189, 248, 0.75)' : 'rgba(37, 99, 235, 0.75)';
      ctx.beginPath();
      ctx.moveTo(0, lastY);
      ctx.lineTo(width, lastY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Badge de precio
      ctx.fillStyle = isDark ? '#0284c7' : '#2563eb';
      ctx.fillRect(width - 95, lastY - 12, 90, 24);
      ctx.fillStyle = '#ffffff';
      ctx.font = '11px JetBrains Mono, monospace';
      ctx.fillText('$' + lastCandle.close.toFixed(2), width - 85, lastY + 4);

      // Ticks
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
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  );
};
