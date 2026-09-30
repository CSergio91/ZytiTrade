import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  ArrowLeft, 
  Zap, 
  LogOut
} from 'lucide-react';
import { Language } from '../i18n/translations';
import { UserSession } from '../lib/supabase';

interface TradingTerminalProps {
  currentLang: Language;
  user: UserSession | null;
  onExit: () => void;
}

export const TradingTerminal: React.FC<TradingTerminalProps> = ({
  currentLang,
  user,
  onExit
}) => {
  const isEs = currentLang === 'es';
  const [selectedPair, setSelectedPair] = useState('BTC/USDT');
  const [timeframe, setTimeframe] = useState('15m');
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('1000');
  const [leverage, setLeverage] = useState(10);
  const [positions, setPositions] = useState<any[]>([
    {
      id: 1,
      symbol: 'BTC/USDT',
      side: 'LONG',
      size: '0.45 BTC',
      entry: 67840.5,
      mark: 68450.2,
      pnl: '+274.36 USDT',
      pnlPercent: '+4.04%',
      isProfit: true
    },
    {
      id: 2,
      symbol: 'ETH/USDT',
      side: 'LONG',
      size: '4.2 ETH',
      entry: 3480.0,
      mark: 3520.1,
      pnl: '+168.42 USDT',
      pnlPercent: '+2.41%',
      isProfit: true
    }
  ]);

  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 450);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    const candleCount = 45;
    let currentPrice = 68450.2;
    const candles: Array<{ open: number; close: number; high: number; low: number }> = [];

    for (let i = 0; i < candleCount; i++) {
      const delta = (Math.random() - 0.48) * 80;
      const open = currentPrice;
      const close = open + delta;
      const high = Math.max(open, close) + Math.random() * 45;
      const low = Math.min(open, close) - Math.random() * 45;
      candles.push({ open, close, high, low });
      currentPrice = close;
    }

    let tick = 0;
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Background
      ctx.fillStyle = '#fbf9f4';
      ctx.fillRect(0, 0, width, height);

      // Grid
      ctx.strokeStyle = 'rgba(214, 206, 192, 0.4)';
      ctx.lineWidth = 1;
      for (let y = 40; y < height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Min/Max
      let minP = Infinity;
      let maxP = -Infinity;
      candles.forEach(c => {
        if (c.low < minP) minP = c.low;
        if (c.high > maxP) maxP = c.high;
      });
      const range = maxP - minP || 1;
      const getY = (val: number) => height - 30 - ((val - minP) / range) * (height - 60);

      const spacing = width / candles.length;
      const candleW = Math.max(4, spacing * 0.65);

      candles.forEach((c, idx) => {
        const x = idx * spacing + spacing / 2;
        const isUp = c.close >= c.open;
        const color = isUp ? '#16a34a' : '#dc2626';

        // Wick
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x, getY(c.high));
        ctx.lineTo(x, getY(c.low));
        ctx.stroke();

        // Body
        ctx.fillStyle = color;
        const openY = getY(c.open);
        const closeY = getY(c.close);
        const topY = Math.min(openY, closeY);
        const bodyH = Math.max(2, Math.abs(openY - closeY));
        ctx.fillRect(x - candleW / 2, topY, candleW, bodyH);
      });

      // Price line
      const lastC = candles[candles.length - 1];
      const lastY = getY(lastC.close);
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = lastC.close >= lastC.open ? '#16a34a' : '#dc2626';
      ctx.beginPath();
      ctx.moveTo(0, lastY);
      ctx.lineTo(width, lastY);
      ctx.stroke();
      ctx.setLineDash([]);

      tick++;
      if (tick % 60 === 0) {
        const last = candles[candles.length - 1];
        last.close += (Math.random() - 0.49) * 15;
        last.high = Math.max(last.high, last.close);
        last.low = Math.min(last.low, last.close);
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const newPos = {
      id: Date.now(),
      symbol: selectedPair,
      side: side === 'buy' ? 'LONG' : 'SHORT',
      size: (parseFloat(amount) / 68450).toFixed(4) + ' BTC',
      entry: 68450.2,
      mark: 68450.2,
      pnl: '0.00 USDT',
      pnlPercent: '0.00%',
      isProfit: true
    };
    setPositions([newPos, ...positions]);
    setOrderSuccess(isEs ? '¡Orden ejecutada instantáneamente en ZYTI OS!' : 'Order filled instantly on ZYTI OS!');
    setTimeout(() => setOrderSuccess(null), 2500);
  };

  return (
    <div className="min-h-screen w-screen bg-[#fbf9f4] text-slate-900 flex flex-col font-sans overflow-hidden">
      
      {/* 1. TOP HEADER INSTITUCIONAL DE LA TERMINAL */}
      <header className="h-14 border-b border-[#ded5c5] bg-[#fbf9f4]/98 px-4 flex items-center justify-between shrink-0 z-30">
        
        {/* LOGO & VOLVER A LANDING */}
        <div className="flex items-center gap-4">
          <button 
            type="button"
            onClick={onExit}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold border border-[#ded5c5] transition-all cursor-pointer shadow-xs"
            title="Volver a la Landing Page"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isEs ? 'Volver al Inicio' : 'Back to Home'}</span>
          </button>

          <div className="h-5 w-px bg-slate-300" />

          {/* SELECTOR DE PAR */}
          <div className="flex items-center gap-2">
            <span className="font-black text-sm text-slate-950 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {selectedPair}
            </span>
            <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              $68,450.20 (+2.42%)
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-4 text-xs font-mono text-slate-600 pl-3">
            <span>24h High: <strong className="text-slate-900">$69,120.00</strong></span>
            <span>24h Low: <strong className="text-slate-900">$66,800.50</strong></span>
            <span>24h Vol: <strong className="text-slate-900">42,890 BTC</strong></span>
          </div>
        </div>

        {/* ACCIONES DERECHA: STATUS DE CONEXIÓN + USUARIO DEMO */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-mono font-bold border border-emerald-200">
            <Activity className="w-3 h-3 text-emerald-600 animate-pulse" />
            <span>60 FPS WSS • Direct Engine</span>
          </div>

          {/* USER BADGE & SALIR */}
          <div className="flex items-center gap-2 bg-[#ede5d6] px-3 py-1.5 rounded-xl border border-[#ded5c5]">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-xs font-bold text-slate-900 truncate max-w-[120px]">
              {user?.name || user?.email || 'Demo Trader'}
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 font-bold">
              $100,000 USD
            </span>
          </div>

          <button
            type="button"
            onClick={onExit}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-950 hover:bg-[#ede5d6] cursor-pointer transition-colors"
            title="Cerrar sesión y volver"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. CUERPO PRINCIPAL DE LA TERMINAL: GRÁFICO + ORDERBOOK + ORDER ENTRY */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        
        {/* ÁREA CENTRAL: GRÁFICO KLINECHART / CANVAS + TIMEFRAMES */}
        <div className="lg:col-span-9 flex flex-col border-r border-[#ded5c5] bg-[#fbf9f4]">
          
          {/* BARRA DE HERRAMIENTAS Y TIMEFRAMES */}
          <div className="h-10 px-4 border-b border-[#ded5c5] flex items-center justify-between text-xs shrink-0 bg-white/70">
            <div className="flex items-center gap-1">
              {['1m', '5m', '15m', '1h', '4h', '1D'].map((tf) => (
                <button
                  key={tf}
                  type="button"
                  onClick={() => setTimeframe(tf)}
                  className={`px-2.5 py-1 rounded-lg font-mono font-bold transition-colors cursor-pointer ${
                    timeframe === tf 
                      ? 'bg-slate-950 text-white shadow-xs' 
                      : 'text-slate-600 hover:bg-slate-200/60 text-slate-900'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 text-xs font-mono text-slate-600">
              <span className="text-emerald-600 font-bold">● Binance Pro REST</span>
              <span className="text-blue-600 font-bold">● Bybit v5 WSS</span>
              <span className="text-purple-600 font-bold">● OKX L2 Arb</span>
            </div>
          </div>

          {/* CANVAS DEL GRÁFICO EN VIVO */}
          <div className="flex-1 relative overflow-hidden bg-[#fbf9f4]">
            <canvas ref={canvasRef} className="w-full h-full block" />
            <div className="absolute top-4 left-4 pointer-events-none bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-[#ded5c5] shadow-xs">
              <span className="text-xs font-bold text-slate-900 font-mono">
                {selectedPair} • {timeframe} • GPU Canvas 60 FPS
              </span>
            </div>
          </div>

          {/* PANEL INFERIOR: POSICIONES ABIERTAS */}
          <div className="h-44 border-t border-[#ded5c5] bg-white flex flex-col shrink-0">
            <div className="h-8 px-4 border-b border-slate-200 flex items-center justify-between text-xs bg-[#fbf9f4]">
              <span className="font-black text-slate-900">
                {isEs ? 'Posiciones Abiertas (2)' : 'Open Positions (2)'}
              </span>
              <span className="text-[11px] font-mono text-emerald-600 font-bold">
                PnL No Realizado: +442.78 USDT
              </span>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar p-2">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <th className="pb-1 px-2">Par</th>
                    <th className="pb-1 px-2">Lado</th>
                    <th className="pb-1 px-2">Tamaño</th>
                    <th className="pb-1 px-2">Precio Entrada</th>
                    <th className="pb-1 px-2">Precio Marca</th>
                    <th className="pb-1 px-2">PnL (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((pos) => (
                    <tr key={pos.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-2 px-2 font-bold text-slate-900">{pos.symbol}</td>
                      <td className="py-2 px-2 text-emerald-600 font-bold">{pos.side}</td>
                      <td className="py-2 px-2 text-slate-800">{pos.size}</td>
                      <td className="py-2 px-2 text-slate-600">${pos.entry.toFixed(2)}</td>
                      <td className="py-2 px-2 text-slate-900 font-bold">${pos.mark.toFixed(2)}</td>
                      <td className="py-2 px-2 text-emerald-600 font-bold">{pos.pnl} ({pos.pnlPercent})</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* LADO DERECHO: ORDER ENTRY WIDGET & ORDER BOOK */}
        <div className="lg:col-span-3 flex flex-col bg-[#fbf9f4] p-4 border-t lg:border-t-0 overflow-y-auto no-scrollbar">
          
          {/* SELECTOR COMPRA / VENTA */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-[#ede5d6] mb-4">
            <button
              type="button"
              onClick={() => setSide('buy')}
              className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                side === 'buy'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-800 hover:text-emerald-700'
              }`}
            >
              {isEs ? 'Comprar / Long' : 'Buy / Long'}
            </button>
            <button
              type="button"
              onClick={() => setSide('sell')}
              className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                side === 'sell'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-800 hover:text-red-700'
              }`}
            >
              {isEs ? 'Vender / Short' : 'Sell / Short'}
            </button>
          </div>

          {/* TOGGLE MARKET / LIMIT */}
          <div className="flex items-center justify-between text-xs mb-3">
            <span className="font-bold text-slate-700">{isEs ? 'Tipo de Orden' : 'Order Type'}</span>
            <div className="flex gap-1 bg-white p-0.5 rounded-lg border border-[#ded5c5]">
              <button
                type="button"
                onClick={() => setOrderType('market')}
                className={`px-2.5 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                  orderType === 'market' ? 'bg-[#eab308] text-slate-950' : 'text-slate-600'
                }`}
              >
                Market
              </button>
              <button
                type="button"
                onClick={() => setOrderType('limit')}
                className={`px-2.5 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                  orderType === 'limit' ? 'bg-[#eab308] text-slate-950' : 'text-slate-600'
                }`}
              >
                Limit
              </button>
            </div>
          </div>

          {/* FORMULARIO DE ORDEN */}
          <form onSubmit={handlePlaceOrder} className="flex flex-col gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isEs ? 'Monto (USDT)' : 'Amount (USDT)'}
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#ded5c5] text-xs font-mono font-bold text-slate-950 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* APALANCAMIENTO */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                <span>{isEs ? 'Apalancamiento' : 'Leverage'}</span>
                <span className="font-mono text-amber-800">{leverage}x</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="50" 
                value={leverage} 
                onChange={(e) => setLeverage(parseInt(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* BOTÓN EJECUTAR */}
            <button
              type="submit"
              className={`w-full py-3 rounded-2xl text-xs sm:text-sm font-black text-slate-950 shadow-md transition-all transform hover:scale-[1.02] active:scale-98 cursor-pointer flex items-center justify-center gap-2 mt-2 ${
                side === 'buy' ? 'bg-[#eab308] hover:bg-[#ca8a04]' : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              <Zap className="w-4 h-4 stroke-[2.5] fill-current" />
              <span>
                {side === 'buy' 
                  ? (isEs ? `Abrir Long (${leverage}x)` : `Open Long (${leverage}x)`)
                  : (isEs ? `Abrir Short (${leverage}x)` : `Open Short (${leverage}x)`)}
              </span>
            </button>
          </form>

          {orderSuccess && (
            <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold text-center animate-zoom-in">
              {orderSuccess}
            </div>
          )}

          {/* MINI LIBRO DE ÓRDENES (DEPTH) */}
          <div className="mt-6 pt-4 border-t border-[#ded5c5]">
            <span className="text-[11px] font-mono font-black text-slate-500 uppercase tracking-wider block mb-2">
              {isEs ? 'Libro de Órdenes en Vivo' : 'Live Order Book'}
            </span>
            <div className="flex flex-col gap-1 text-[11px] font-mono">
              <div className="flex justify-between text-red-600">
                <span>68,454.50</span>
                <span>0.84 BTC</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>68,452.00</span>
                <span>1.42 BTC</span>
              </div>
              <div className="flex justify-between font-black text-slate-950 py-1 border-y border-slate-200 bg-white px-1 rounded">
                <span>68,450.20</span>
                <span>Spread: $0.50</span>
              </div>
              <div className="flex justify-between text-emerald-600">
                <span>68,449.70</span>
                <span>2.10 BTC</span>
              </div>
              <div className="flex justify-between text-emerald-600">
                <span>68,448.00</span>
                <span>0.95 BTC</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default TradingTerminal;
