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

    const candleCount = Math.floor(width / 18);
    let currentPrice = 64200;
    const candles: Array<{ open: number; close: number; high: number; low: number; vol: number }> = [];

    for (let i = 0; i < candleCount; i++) {
      const delta = (Math.random() - 0.485) * 35;
      const open = currentPrice;
      const close = open + delta;
      const high = Math.max(open, close) + Math.random() * 18;
      const low = Math.min(open, close) - Math.random() * 18;
      const vol = 15 + Math.random() * 50;
      candles.push({ open, close, high, low, vol });
      currentPrice = close;
    }

    let tickCounter = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const isDark = theme === 'dark';

      // 1. Fondo base: Warm Cream (#fbf9f4) en Light vs Dark (#0a0d14) en Dark
      ctx.fillStyle = isDark ? '#0a0d14' : '#fbf9f4';
      ctx.fillRect(0, 0, width, height);

      // 2. Cuadrícula ultra tenue solo visible hacia la derecha
      ctx.lineWidth = 1;
      ctx.strokeStyle = isDark ? 'rgba(35, 48, 74, 0.25)' : 'rgba(230, 224, 212, 0.5)';
      const gridSpacingX = 100;
      const gridSpacingY = 70;

      ctx.beginPath();
      for (let x = width * 0.35; x < width; x += gridSpacingX) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += gridSpacingY) {
        ctx.moveTo(width * 0.35, y);
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
      const chartTop = height * 0.18;
      const chartBottom = height * 0.78;
      const chartHeight = chartBottom - chartTop;

      const getY = (val: number) => chartBottom - ((val - minP) / priceRange) * chartHeight;

      const candleWidth = 5;
      const spacing = width / candles.length;

      // 3. Velas sutiles que flotan suavemente a la derecha sin invadir el titular de la izquierda
      candles.forEach((c, idx) => {
        const x = idx * spacing + spacing / 2;
        
        // FADE OUT hacia la izquierda para que el texto quede 100% limpio y legible
        const fadeFactor = Math.max(0, Math.min(1, (x - width * 0.25) / (width * 0.35)));
        if (fadeFactor <= 0) return;

        const openY = getY(c.open);
        const closeY = getY(c.close);
        const highY = getY(c.high);
        const lowY = getY(c.low);
        const isUp = c.close >= c.open;

        const alpha = isDark ? 0.35 * fadeFactor : 0.25 * fadeFactor;
        ctx.strokeStyle = isUp ? `rgba(22, 163, 74, ${alpha})` : `rgba(220, 38, 38, ${alpha})`;
        ctx.fillStyle = ctx.strokeStyle;

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

      // 4. Medias Móviles finas y elegantes
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.strokeStyle = isDark ? 'rgba(56, 189, 248, 0.25)' : 'rgba(37, 99, 235, 0.2)';
      candles.forEach((c, idx) => {
        const x = idx * spacing + spacing / 2;
        const y = getY(c.close) + Math.sin(idx * 0.15) * 8;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Tick
      tickCounter++;
      if (tickCounter % 6 === 0) {
        const change = (Math.random() - 0.495) * 6;
        const lastCandle = candles[candles.length - 1];
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
