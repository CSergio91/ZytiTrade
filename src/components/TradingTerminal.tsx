import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  ArrowLeft, 
  Zap, 
  LogOut,
  TrendingUp,
  Cpu,
  Layers,
  ChevronDown,
  BookOpen,
  Star,
  MoreHorizontal,
  Search,
  X,
  Check
} from 'lucide-react';
import { init, dispose, Chart, DeepPartial, Styles } from 'klinecharts';
import { Language } from '../i18n/translations';
import { UserSession } from '../lib/supabase';
import { MarketStats, OrderBookPayload } from '../workers/marketData.worker';

interface TradingTerminalProps {
  currentLang: Language;
  user: UserSession | null;
  onExit: () => void;
}

const SUPPORTED_PAIRS = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'XRP/USDT'];

export interface TimeframeOption {
  value: string;
  label: string;
  category: 'seconds' | 'minutes' | 'hours' | 'days' | 'periods';
}

const ALL_TIMEFRAMES: TimeframeOption[] = [
  // Segundos
  { value: '1s', label: '1s', category: 'seconds' },
  { value: '5s', label: '5s', category: 'seconds' },
  { value: '15s', label: '15s', category: 'seconds' },
  { value: '30s', label: '30s', category: 'seconds' },
  // Minutos
  { value: '1m', label: '1m', category: 'minutes' },
  { value: '3m', label: '3m', category: 'minutes' },
  { value: '5m', label: '5m', category: 'minutes' },
  { value: '15m', label: '15m', category: 'minutes' },
  { value: '30m', label: '30m', category: 'minutes' },
  { value: '45m', label: '45m', category: 'minutes' },
  // Horas
  { value: '1h', label: '1h', category: 'hours' },
  { value: '2h', label: '2h', category: 'hours' },
  { value: '4h', label: '4h', category: 'hours' },
  { value: '12h', label: '12h', category: 'hours' },
  // Días y Semanas
  { value: '1D', label: '1D', category: 'days' },
  { value: '3d', label: '3D', category: 'days' },
  { value: '1w', label: '1S', category: 'days' },
  // Meses y Anuales
  { value: '1M', label: '1M', category: 'periods' },
  { value: '3M', label: '3M', category: 'periods' },
  { value: '6M', label: '6M', category: 'periods' },
  { value: '12M', label: '12M (1A)', category: 'periods' }
];

const DEFAULT_FAV_TIMEFRAMES = ['1m', '5m', '15m', '1h', '4h', '1D'];

export interface IndicatorOption {
  name: string;
  label: string;
  category: 'main' | 'sub';
  paneId: string;
  description: string;
}

const ALL_INDICATORS: IndicatorOption[] = [
  // Gráfico Principal (Superpuestos)
  { name: 'MA', label: 'Media Móvil Simple', category: 'main', paneId: 'candle_pane', description: 'Moving Average sobre el precio' },
  { name: 'EMA', label: 'Media Móvil Exponencial', category: 'main', paneId: 'candle_pane', description: 'Mayor ponderación a precios recientes' },
  { name: 'SMA', label: 'Simple Moving Average', category: 'main', paneId: 'candle_pane', description: 'Promedio móvil suavizado' },
  { name: 'BOLL', label: 'Bandas de Bollinger', category: 'main', paneId: 'candle_pane', description: 'Volatilidad y desviaciones estándar' },
  { name: 'SAR', label: 'Parabolic SAR', category: 'main', paneId: 'candle_pane', description: 'Detección de puntos de reversión' },
  { name: 'BBI', label: 'Bull and Bear Index', category: 'main', paneId: 'candle_pane', description: 'Índice de fuerza alcista/bajista' },
  // Subpaneles
  { name: 'VOL', label: 'Volumen', category: 'sub', paneId: 'pane_vol', description: 'Volumen transaccionado por vela' },
  { name: 'RSI', label: 'Fuerza Relativa (RSI)', category: 'sub', paneId: 'pane_rsi', description: 'Oscilador de sobrecompra y sobreventa' },
  { name: 'MACD', label: 'MACD Oscilador', category: 'sub', paneId: 'pane_macd', description: 'Convergencia y divergencia de medias' },
  { name: 'KDJ', label: 'Oscilador Estocástico (KDJ)', category: 'sub', paneId: 'pane_kdj', description: 'Momento de precios a corto plazo' },
  { name: 'ATR', label: 'Rango Verdadero Medio (ATR)', category: 'sub', paneId: 'pane_atr', description: 'Medición de volatilidad absoluta' },
  { name: 'CCI', label: 'Commodity Channel Index', category: 'sub', paneId: 'pane_cci', description: 'Identificación de ciclos de precio' },
  { name: 'WR', label: 'Williams %R', category: 'sub', paneId: 'pane_wr', description: 'Oscilador de impulso entre 0 y -100' },
  { name: 'OBV', label: 'On-Balance Volume', category: 'sub', paneId: 'pane_obv', description: 'Flujo acumulativo de volumen de compra/venta' }
];

const DEFAULT_FAV_INDICATORS = ['MA', 'EMA', 'VOL', 'RSI', 'MACD'];

// Estilo institucional de KLineChart integrado con el tema Warm Cream de ZYTI Trade
const ZYTI_CHART_THEME: DeepPartial<Styles> = {
  grid: {
    show: true,
    horizontal: {
      show: true,
      size: 1,
      color: 'rgba(214, 206, 192, 0.45)',
      style: 'dashed' as any,
      dashedValue: [3, 3]
    },
    vertical: {
      show: true,
      size: 1,
      color: 'rgba(214, 206, 192, 0.45)',
      style: 'dashed' as any,
      dashedValue: [3, 3]
    }
  },
  candle: {
    type: 'candle_solid' as any,
    bar: {
      upColor: '#16a34a',
      downColor: '#dc2626',
      noChangeColor: '#888888',
      upBorderColor: '#16a34a',
      downBorderColor: '#dc2626',
      noChangeBorderColor: '#888888',
      upWickColor: '#16a34a',
      downWickColor: '#dc2626',
      noChangeWickColor: '#888888'
    },
    priceMark: {
      show: true,
      high: {
        show: true,
        color: '#64748b',
        textOffset: 5,
        textSize: 10
      },
      low: {
        show: true,
        color: '#64748b',
        textOffset: 5,
        textSize: 10
      },
      last: {
        show: true,
        upColor: '#16a34a',
        downColor: '#dc2626',
        noChangeColor: '#888888',
        line: {
          show: true,
          style: 'dashed' as any,
          dashedValue: [4, 4],
          size: 1
        },
        text: {
          show: true,
          style: 'fill' as any,
          size: 11,
          paddingLeft: 4,
          paddingTop: 4,
          paddingRight: 4,
          paddingBottom: 4,
          color: '#ffffff',
          borderRadius: 4
        }
      }
    },
    tooltip: {
      showRule: 'always' as any,
      showType: 'standard' as any,
      text: {
        size: 11,
        color: '#334155'
      }
    }
  },
  xAxis: {
    show: true,
    size: 'auto' as any,
    axisLine: {
      show: true,
      color: '#ded5c5',
      size: 1
    },
    tickText: {
      show: true,
      color: '#64748b',
      size: 10,
      family: 'JetBrains Mono, monospace'
    },
    tickLine: {
      show: true,
      size: 1,
      length: 3,
      color: '#ded5c5'
    }
  },
  yAxis: {
    show: true,
    size: 'auto' as any,
    position: 'right' as any,
    axisLine: {
      show: true,
      color: '#ded5c5',
      size: 1
    },
    tickText: {
      show: true,
      color: '#64748b',
      size: 10,
      family: 'JetBrains Mono, monospace'
    },
    tickLine: {
      show: true,
      size: 1,
      length: 3,
      color: '#ded5c5'
    }
  },
  crosshair: {
    show: true,
    horizontal: {
      show: true,
      line: {
        show: true,
        style: 'dashed' as any,
        dashedValue: [4, 2],
        size: 1,
        color: '#94a3b8'
      },
      text: {
        show: true,
        style: 'fill' as any,
        color: '#ffffff',
        size: 11,
        paddingLeft: 4,
        paddingRight: 4,
        paddingTop: 2,
        paddingBottom: 2,
        borderSize: 1,
        borderColor: '#0f172a',
        borderRadius: 3,
        backgroundColor: '#0f172a'
      }
    },
    vertical: {
      show: true,
      line: {
        show: true,
        style: 'dashed' as any,
        dashedValue: [4, 2],
        size: 1,
        color: '#94a3b8'
      },
      text: {
        show: true,
        style: 'fill' as any,
        color: '#ffffff',
        size: 11,
        paddingLeft: 4,
        paddingRight: 4,
        paddingTop: 2,
        paddingBottom: 2,
        borderSize: 1,
        borderColor: '#0f172a',
        borderRadius: 3,
        backgroundColor: '#0f172a'
      }
    }
  }
};

export const TradingTerminal: React.FC<TradingTerminalProps> = ({
  currentLang,
  user,
  onExit
}) => {
  const isEs = currentLang === 'es';
  const [selectedPair, setSelectedPair] = useState('BTC/USDT');
  const [timeframe, setTimeframe] = useState('15m');
  const [activeIndicators, setActiveIndicators] = useState<string[]>(['MA', 'VOL']);
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('1000');
  const [leverage, setLeverage] = useState(10);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  // Pestaña activa en móvil: orden / libro / posiciones
  const [mobileTab, setMobileTab] = useState<'order' | 'book' | 'positions'>('order');

  // Estadísticas del par desde el Worker
  const [stats, setStats] = useState<MarketStats>({
    symbol: 'BTC/USDT',
    lastPrice: 68450.0,
    change24h: 2.42,
    high24h: 69120.0,
    low24h: 66800.0,
    volume24h: 42890
  });

  // Order Book L2 en vivo emitido por el Worker
  const [orderBook, setOrderBook] = useState<OrderBookPayload>({
    bids: [],
    asks: []
  });

  // Lista de posiciones simuladas
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

  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);
  const workerRef = useRef<Worker | null>(null);

  // 1. Inicialización de KLineChart Canvas y el Web Worker
  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;

    // A. Inicializar motor oficial KLineChart
    const chart = init(container, {
      styles: ZYTI_CHART_THEME,
      locale: isEs ? 'es' : 'en'
    });
    if (!chart) return;
    chartInstanceRef.current = chart;

    // Configurar precisión de precios e indicadores por defecto
    chart.setPriceVolumePrecision(2, 4);
    chart.createIndicator('MA', false, { id: 'candle_pane' });
    chart.createIndicator('VOL', false, { id: 'pane_vol' });

    // B. Instanciar Web Worker dedicado para datos de mercado
    const worker = new Worker(
      new URL('../workers/marketData.worker.ts', import.meta.url),
      { type: 'module' }
    );
    workerRef.current = worker;

    // C. Manejador reactivo de eventos del Worker
    worker.onmessage = (e: MessageEvent) => {
      const { type, payload } = e.data || {};
      const activeChart = chartInstanceRef.current;

      if (type === 'HISTORICAL_BARS') {
        if (activeChart && payload.bars) {
          activeChart.applyNewData(payload.bars);
        }
      } else if (type === 'TICK_UPDATE') {
        if (activeChart && payload.bar) {
          activeChart.updateData(payload.bar);
        }
        if (payload.stats) {
          setStats(payload.stats);
        }
      } else if (type === 'ORDERBOOK_UPDATE') {
        if (payload.bids && payload.asks) {
          setOrderBook(payload);
        }
      }
    };

    // D. Iniciar suscripción del par y timeframe inicial
    worker.postMessage({
      type: 'SUBSCRIBE',
      payload: { symbol: selectedPair, timeframe }
    });

    // E. ResizeObserver reactivo a 60 FPS
    const resizeObserver = new ResizeObserver(() => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.resize();
      }
    });
    resizeObserver.observe(container);

    // F. Limpieza estricta al desmontar
    return () => {
      resizeObserver.disconnect();
      if (workerRef.current) {
        workerRef.current.postMessage({ type: 'UNSUBSCRIBE' });
        workerRef.current.terminate();
        workerRef.current = null;
      }
      if (chartInstanceRef.current) {
        dispose(container);
        chartInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Cambio reactivo de Par
  const handleSelectPair = (pair: string) => {
    setSelectedPair(pair);
    if (workerRef.current) {
      workerRef.current.postMessage({
        type: 'SUBSCRIBE',
        payload: { symbol: pair, timeframe }
      });
    }
  };

  // 3. Cambio reactivo de Timeframe
  const handleSelectTimeframe = (tf: string) => {
    setTimeframe(tf);
    if (workerRef.current) {
      workerRef.current.postMessage({
        type: 'CHANGE_TIMEFRAME',
        payload: { timeframe: tf }
      });
    }
  };

  // 4. Toggle de Indicadores Técnicos y Perfil de Volumen
  const handleToggleIndicator = (name: string) => {
    const chart = chartInstanceRef.current;
    if (!chart) return;

    const paneMap: Record<string, string> = {
      MA: 'candle_pane',
      EMA: 'candle_pane',
      VOL: 'pane_vol',
      RSI: 'pane_rsi',
      MACD: 'pane_macd'
    };

    const targetPane = paneMap[name] || 'candle_pane';

    if (activeIndicators.includes(name)) {
      chart.removeIndicator(targetPane, name);
      setActiveIndicators(activeIndicators.filter((i) => i !== name));
    } else {
      chart.createIndicator(name, false, { id: targetPane });
      setActiveIndicators([...activeIndicators, name]);
    }
  };

  // 5. Ejecución de Órdenes
  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const currentP = stats.lastPrice;
    const sizeNumber = parseFloat(amount) / currentP;
    
    const newPos = {
      id: Date.now(),
      symbol: selectedPair,
      side: side === 'buy' ? 'LONG' : 'SHORT',
      size: sizeNumber.toFixed(4) + ' ' + selectedPair.split('/')[0],
      entry: currentP,
      mark: currentP,
      pnl: '0.00 USDT',
      pnlPercent: '0.00%',
      isProfit: true
    };

    setPositions([newPos, ...positions]);
    setOrderSuccess(
      isEs
        ? `¡Orden ${side === 'buy' ? 'LONG' : 'SHORT'} ejecutada por el Worker!`
        : `Order ${side === 'buy' ? 'LONG' : 'SHORT'} filled via Worker!`
    );
    setTimeout(() => setOrderSuccess(null), 2500);
  };

  // Renderizador del OrderBook para reutilizar entre Desktop y Móvil
  const renderOrderBookContent = () => (
    <div className="p-2 sm:p-2.5 rounded-xl bg-white border border-[#ded5c5] shadow-xs">
      <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100">
        <span className="text-[11px] font-black text-slate-900 flex items-center gap-1.5">
          <Activity className="w-3 h-3 text-slate-600" />
          <span>Order Book L2</span>
        </span>
        <span className="text-[9px] font-mono text-slate-400">Profundidad</span>
      </div>

      {/* ASKS (VENTAS - ROJO) */}
      <div className="space-y-0.5 font-mono text-[10px]">
        {orderBook.asks.slice(-5).reverse().map((ask, i) => (
          <div key={i} className="relative flex justify-between px-1.5 py-0.5">
            <div 
              className="absolute inset-y-0 right-0 bg-red-100/60 rounded-xs pointer-events-none" 
              style={{ width: `${Math.min(100, (ask.total / 15) * 100)}%` }}
            />
            <span className="relative z-10 text-red-600 font-bold">${ask.price.toFixed(2)}</span>
            <span className="relative z-10 text-slate-600">{ask.amount.toFixed(4)}</span>
          </div>
        ))}
      </div>

      {/* SPREAD Y PRECIO MEDIO */}
      <div className="my-1.5 py-0.5 px-2 rounded-lg bg-[#ede5d6]/70 border border-[#ded5c5] flex items-center justify-between font-mono text-[11px]">
        <span className="font-black text-slate-950">${stats.lastPrice.toFixed(2)}</span>
        <span className="text-[9px] text-slate-500 font-medium">Spread: $0.10</span>
      </div>

      {/* BIDS (COMPRAS - VERDE) */}
      <div className="space-y-0.5 font-mono text-[10px]">
        {orderBook.bids.slice(0, 5).map((bid, i) => (
          <div key={i} className="relative flex justify-between px-1.5 py-0.5">
            <div 
              className="absolute inset-y-0 right-0 bg-emerald-100/60 rounded-xs pointer-events-none" 
              style={{ width: `${Math.min(100, (bid.total / 15) * 100)}%` }}
            />
            <span className="relative z-10 text-emerald-600 font-bold">${bid.price.toFixed(2)}</span>
            <span className="relative z-10 text-slate-600">{bid.amount.toFixed(4)}</span>
          </div>
        ))}
      </div>
    </div>
  );

  // Renderizador del Formulario de Orden para Desktop y Móvil
  const renderOrderFormContent = () => (
    <div className="p-2.5 rounded-xl bg-white border border-[#ded5c5] shadow-xs">
      {/* SELECTOR COMPRA / VENTA */}
      <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#ede5d6] mb-2.5">
        <button
          type="button"
          onClick={() => setSide('buy')}
          className={`py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
            side === 'buy'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-800 hover:text-emerald-700'
          }`}
        >
          {isEs ? 'Comprar / Long' : 'Buy / Long'}
        </button>
        <button
          type="button"
          onClick={() => setSide('sell')}
          className={`py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
            side === 'sell'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-800 hover:text-red-700'
          }`}
        >
          {isEs ? 'Vender / Short' : 'Sell / Short'}
        </button>
      </div>

      {/* TIPO DE ORDEN */}
      <div className="flex gap-1.5 mb-2.5">
        <button
          type="button"
          onClick={() => setOrderType('market')}
          className={`flex-1 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
            orderType === 'market'
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white text-slate-600 border-slate-200'
          }`}
        >
          Market
        </button>
        <button
          type="button"
          onClick={() => setOrderType('limit')}
          className={`flex-1 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
            orderType === 'limit'
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white text-slate-600 border-slate-200'
          }`}
        >
          Limit
        </button>
      </div>

      {/* FORMULARIO */}
      <form onSubmit={handlePlaceOrder} className="space-y-2.5">
        <div>
          <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
            {isEs ? 'Monto (USDT)' : 'Order Value (USDT)'}
          </label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-2.5 pr-10 py-1.5 rounded-lg border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-amber-500"
              placeholder="1000"
              required
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400">
              USDT
            </span>
          </div>
        </div>

        {/* APALANCAMIENTO */}
        <div>
          <div className="flex justify-between text-[10px] font-bold text-slate-700 mb-0.5">
            <span>{isEs ? 'Apalancamiento' : 'Leverage'}</span>
            <span className="text-amber-600 font-mono font-black">{leverage}x</span>
          </div>
          <input
            type="range"
            min="1"
            max="100"
            value={leverage}
            onChange={(e) => setLeverage(Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer h-1.5"
          />
        </div>

        {/* FEEDBACK DE ÉXITO */}
        {orderSuccess && (
          <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold flex items-center gap-1.5">
            <TrendingUp className="w-3 h-3 shrink-0" />
            <span>{orderSuccess}</span>
          </div>
        )}

        {/* BOTÓN DISPARADOR */}
        <button
          type="submit"
          className={`w-full py-2 rounded-xl text-xs font-black shadow-xs transition-all transform active:scale-98 cursor-pointer flex items-center justify-center gap-1.5 text-white ${
            side === 'buy' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          <Zap className="w-3.5 h-3.5 fill-white" />
          <span>
            {side === 'buy'
              ? isEs ? `Comprar ${selectedPair.split('/')[0]}` : `Buy ${selectedPair.split('/')[0]}`
              : isEs ? `Vender ${selectedPair.split('/')[0]}` : `Sell ${selectedPair.split('/')[0]}`
            }
          </span>
        </button>
      </form>
    </div>
  );

  return (
    <div className="h-screen w-screen bg-[#fbf9f4] text-slate-900 flex flex-col font-sans overflow-hidden select-none">
      
      {/* 1. TOP HEADER INSTITUCIONAL */}
      <header className="h-12 sm:h-14 border-b border-[#ded5c5] bg-[#fbf9f4] px-3 sm:px-4 flex items-center justify-between shrink-0 z-30">
        
        {/* PARTE IZQUIERDA: VOLVER + SELECTOR DE PAR + PRECIO EN VIVO */}
        <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto no-scrollbar">
          <button 
            type="button"
            onClick={onExit}
            className="flex items-center gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold border border-[#ded5c5] transition-all cursor-pointer shadow-xs shrink-0"
            title="Volver al Inicio"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isEs ? 'Inicio' : 'Home'}</span>
          </button>

          <div className="h-4 w-px bg-slate-300 hidden sm:block" />

          {/* SELECTOR DE PARES DESPLEGABLE */}
          <div className="relative group shrink-0">
            <button 
              type="button"
              className="flex items-center gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-white border border-[#ded5c5] hover:border-slate-400 font-black text-xs sm:text-sm text-slate-950 cursor-pointer shadow-xs"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{selectedPair}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
            <div className="absolute top-full left-0 mt-1 w-36 bg-white border border-[#ded5c5] rounded-xl shadow-lg py-1 hidden group-hover:block z-50">
              {SUPPORTED_PAIRS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handleSelectPair(p)}
                  className={`w-full text-left px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer hover:bg-amber-50 ${
                    selectedPair === p ? 'text-amber-600 bg-amber-50/50' : 'text-slate-800'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* PRECIO ACTUAL Y ESTADÍSTICAS 24H */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <span className={`text-xs sm:text-sm font-mono font-black ${stats.change24h >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              ${stats.lastPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className={`text-[10px] sm:text-xs font-mono font-bold px-1.5 py-0.5 rounded ${stats.change24h >= 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {stats.change24h >= 0 ? '+' : ''}{stats.change24h}%
            </span>
          </div>

          <div className="hidden xl:flex items-center gap-4 text-xs font-mono text-slate-600 pl-2">
            <span>24h High: <strong className="text-slate-900">${stats.high24h.toLocaleString()}</strong></span>
            <span>24h Low: <strong className="text-slate-900">${stats.low24h.toLocaleString()}</strong></span>
            <span>24h Vol: <strong className="text-slate-900">{stats.volume24h.toLocaleString()} BTC</strong></span>
          </div>
        </div>

        {/* PARTE DERECHA: STATUS WORKER + USUARIO + LOGOUT */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <div className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-mono font-bold border border-emerald-200 shadow-xs">
            <Cpu className="w-3 h-3 text-emerald-600 animate-pulse" />
            <span>Worker 60 FPS</span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 bg-[#ede5d6] px-2 sm:px-3 py-1 rounded-xl border border-[#ded5c5]">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-xs font-bold text-slate-900 truncate max-w-[85px] sm:max-w-[140px]">
              {user?.name || user?.email || 'Demo Trader'}
            </span>
          </div>

          <button
            type="button"
            onClick={onExit}
            className="p-1 sm:p-2 rounded-xl text-slate-600 hover:text-slate-950 hover:bg-[#ede5d6] cursor-pointer transition-colors"
            title="Cerrar sesión y volver"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. ÁREA PRINCIPAL: GRÁFICO CENTRAL + PANEL LATERAL ESTRECHO */}
      <div className="terminal-main-layout flex-1 overflow-hidden">
        
        {/* COLUMNA CENTRAL: TOOLBAR + KLINECHART ENGINE + POSICIONES (Desktop) */}
        <div className="terminal-chart-wrapper">
          
          {/* BARRA DE HERRAMIENTAS Y TIMEFRAMES */}
          <div className="h-9 sm:h-10 px-2 sm:px-4 border-b border-[#ded5c5] flex items-center justify-between text-xs shrink-0 bg-white/60 overflow-x-auto no-scrollbar">
            {/* SELECTOR DE TIMEFRAMES */}
            <div className="flex items-center gap-1 shrink-0">
              {TIMEFRAMES.map((tf) => (
                <button
                  key={tf}
                  type="button"
                  onClick={() => handleSelectTimeframe(tf)}
                  className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg font-mono font-bold text-[10px] sm:text-xs transition-colors cursor-pointer ${
                    timeframe === tf 
                      ? 'bg-slate-950 text-white shadow-xs' 
                      : 'text-slate-600 hover:bg-slate-200/60 text-slate-900'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>

            {/* INDICADORES TÉCNICOS Y PERFIL DE VOLUMEN */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0 pl-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase hidden sm:inline">Indicadores:</span>
              {['MA', 'EMA', 'VOL', 'RSI', 'MACD'].map((ind) => {
                const isActive = activeIndicators.includes(ind);
                return (
                  <button
                    key={ind}
                    type="button"
                    onClick={() => handleToggleIndicator(ind)}
                    className={`px-1.5 sm:px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                      isActive 
                        ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-xs' 
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {ind}
                  </button>
                );
              })}
            </div>
          </div>

          {/* CONTENEDOR KLINECHART v9.8.6 OFICIAL */}
          <div className="terminal-chart-canvas-box overflow-hidden bg-[#fbf9f4]">
            <div 
              ref={chartContainerRef} 
              id="trading-terminal-chart" 
              className="w-full h-full block" 
            />
          </div>

          {/* DESKTOP: TABLA INFERIOR DE POSICIONES ABIERTAS (h-36 COMPACTA) */}
          <div className="terminal-desktop-positions bg-white">
            <div className="h-7 px-3 border-b border-slate-200 flex items-center justify-between text-xs bg-[#fbf9f4]">
              <span className="font-black text-slate-900 flex items-center gap-1.5 text-[11px]">
                <Layers className="w-3 h-3 text-slate-600" />
                <span>{isEs ? `Posiciones Abiertas (${positions.length})` : `Open Positions (${positions.length})`}</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-600 font-bold">
                PnL No Realizado: +442.78 USDT
              </span>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar p-1.5">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="text-[9px] text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <th className="pb-1 px-2">Par</th>
                    <th className="pb-1 px-2">Lado</th>
                    <th className="pb-1 px-2">Tamaño</th>
                    <th className="pb-1 px-2">Entrada</th>
                    <th className="pb-1 px-2">Marca</th>
                    <th className="pb-1 px-2">PnL (%)</th>
                    <th className="pb-1 px-2 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((pos) => (
                    <tr key={pos.id} className="border-b border-slate-100 hover:bg-slate-50 text-[11px]">
                      <td className="py-1 px-2 font-bold text-slate-900">{pos.symbol}</td>
                      <td className={`py-1 px-2 font-bold ${pos.side === 'LONG' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {pos.side}
                      </td>
                      <td className="py-1 px-2 text-slate-800">{pos.size}</td>
                      <td className="py-1 px-2 text-slate-600">${pos.entry.toFixed(2)}</td>
                      <td className="py-1 px-2 text-slate-900 font-bold">${stats.lastPrice.toFixed(2)}</td>
                      <td className="py-1 px-2 text-emerald-600 font-bold">{pos.pnl} ({pos.pnlPercent})</td>
                      <td className="py-1 px-2 text-right">
                        <button
                          type="button"
                          onClick={() => setPositions(positions.filter((p) => p.id !== pos.id))}
                          className="px-1.5 py-0.2 text-[9px] rounded bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 font-bold transition-colors cursor-pointer"
                        >
                          Cerrar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* MÓVIL (< 1024px): PESTAÑAS Y CONTROLES INFERIORES */}
          <div className="terminal-mobile-controls">
            {/* BARRA DE PESTAÑAS TÁCTILES INFERIORES */}
            <div className="h-10 border-y border-[#ded5c5] bg-white shrink-0 flex">
              <button
                type="button"
                onClick={() => setMobileTab('order')}
                className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-black transition-colors ${
                  mobileTab === 'order'
                    ? 'border-b-2 border-amber-500 text-slate-950 bg-amber-50/50'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>{isEs ? 'Operar' : 'Trade'}</span>
              </button>
              <button
                type="button"
                onClick={() => setMobileTab('book')}
                className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-black transition-colors ${
                  mobileTab === 'book'
                    ? 'border-b-2 border-amber-500 text-slate-950 bg-amber-50/50'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-slate-600" />
                <span>Order Book</span>
              </button>
              <button
                type="button"
                onClick={() => setMobileTab('positions')}
                className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-black transition-colors ${
                  mobileTab === 'positions'
                    ? 'border-b-2 border-amber-500 text-slate-950 bg-amber-50/50'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-slate-600" />
                <span>{isEs ? `Posiciones (${positions.length})` : `Positions (${positions.length})`}</span>
              </button>
            </div>

            {/* MÓVIL: VISTA ACTIVA DE LA PESTAÑA INFERIOR */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-2.5 bg-[#fbf9f4]">
              {mobileTab === 'order' && renderOrderFormContent()}
              {mobileTab === 'book' && renderOrderBookContent()}
              {mobileTab === 'positions' && (
                <div className="p-2 rounded-xl bg-white border border-[#ded5c5] shadow-xs">
                  {positions.map((pos) => (
                    <div key={pos.id} className="p-2 border-b border-slate-100 last:border-b-0 flex items-center justify-between font-mono text-xs">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-slate-900">{pos.symbol}</span>
                          <span className={`px-1 py-0.2 rounded text-[9px] font-bold ${pos.side === 'LONG' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                            {pos.side}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Entrada: ${pos.entry} • Tam: {pos.size}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-emerald-600 font-bold">{pos.pnl}</div>
                        <button
                          type="button"
                          onClick={() => setPositions(positions.filter((p) => p.id !== pos.id))}
                          className="text-[10px] text-red-600 font-bold hover:underline cursor-pointer mt-0.5"
                        >
                          {isEs ? 'Cerrar' : 'Close'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* DESKTOP: PANEL LATERAL ESTRECHO (280px) */}
        <div className="terminal-desktop-sidebar no-scrollbar">
          {renderOrderBookContent()}
          {renderOrderFormContent()}
        </div>

      </div>

    </div>
  );
};

export default TradingTerminal;
