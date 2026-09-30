/**
 * ZYTI Trade - High-Frequency Market Data Web Worker
 * Ejecuta la ingesta, normalización de ticks, agregación de velas KLine y OrderBook L2
 * en un hilo secundario independiente del navegador para preservar 60 FPS ininterrumpidos en la UI.
 */

export interface KLineBar {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface OrderBookLevel {
  price: number;
  amount: number;
  total: number;
}

export interface OrderBookPayload {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
}

export interface MarketStats {
  symbol: string;
  lastPrice: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
}

// Estado local del Worker
let activeSymbol = 'BTC/USDT';
let activeTimeframe = '15m';
let currentPrice = 68450.0;
let currentBar: KLineBar | null = null;
let tickTimer: ReturnType<typeof setInterval> | null = null;
let orderBookTimer: ReturnType<typeof setInterval> | null = null;

// Map de precios base iniciales por par
const BASE_PRICES: Record<string, number> = {
  'BTC/USDT': 68450.0,
  'ETH/USDT': 3520.0,
  'SOL/USDT': 188.5,
  'BNB/USDT': 592.0,
  'XRP/USDT': 0.624
};

// Generador de historial inicial de velas (300 barras)
function generateHistoricalBars(symbol: string, timeframe: string, count = 250): KLineBar[] {
  const base = BASE_PRICES[symbol] || 68450.0;
  const bars: KLineBar[] = [];
  
  // Intervalo en milisegundos según timeframe
  const timeframeMs: Record<string, number> = {
    '1s': 1000,
    '5s': 5 * 1000,
    '15s': 15 * 1000,
    '30s': 30 * 1000,
    '1m': 60 * 1000,
    '3m': 3 * 60 * 1000,
    '5m': 5 * 60 * 1000,
    '15m': 15 * 60 * 1000,
    '30m': 30 * 60 * 1000,
    '45m': 45 * 60 * 1000,
    '1h': 60 * 60 * 1000,
    '2h': 2 * 60 * 60 * 1000,
    '4h': 4 * 60 * 60 * 1000,
    '12h': 12 * 60 * 60 * 1000,
    '1d': 24 * 60 * 60 * 1000,
    '1D': 24 * 60 * 60 * 1000,
    '3d': 3 * 24 * 60 * 60 * 1000,
    '1w': 7 * 24 * 60 * 60 * 1000,
    '1M': 30 * 24 * 60 * 60 * 1000,
    '3M': 90 * 24 * 60 * 60 * 1000,
    '6M': 180 * 24 * 60 * 60 * 1000,
    '12M': 365 * 24 * 60 * 60 * 1000,
    '1Y': 365 * 24 * 60 * 60 * 1000
  };
  
  const stepMs = timeframeMs[timeframe] || 15 * 60 * 1000;
  const now = Date.now();
  let price = base * 0.94; // Inicio un poco por debajo para dar tendencia realista
  
  for (let i = count; i >= 1; i--) {
    const timestamp = now - i * stepMs;
    // Movimiento aleatorio con reversión a la media
    const drift = (base - price) * 0.005;
    const volatility = base * 0.0035;
    const delta = drift + (Math.random() - 0.49) * volatility;
    
    const open = price;
    const close = Math.max(open * 0.5, open + delta);
    const wick1 = Math.random() * (volatility * 0.8);
    const wick2 = Math.random() * (volatility * 0.8);
    const high = Math.max(open, close) + wick1;
    const low = Math.min(open, close) - wick2;
    const volume = Math.floor(10 + Math.random() * 85);

    bars.push({
      timestamp,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume
    });

    price = close;
  }

  currentPrice = price;
  currentBar = { ...bars[bars.length - 1] };
  return bars;
}

// Generador de OrderBook L2 realista (10 niveles Bids / Asks)
function generateOrderBook(midPrice: number): OrderBookPayload {
  const spread = midPrice * 0.00015;
  const bids: OrderBookLevel[] = [];
  const asks: OrderBookLevel[] = [];
  
  let cumBid = 0;
  let cumAsk = 0;
  const step = midPrice * 0.0002;

  for (let i = 1; i <= 8; i++) {
    const bPrice = parseFloat((midPrice - spread - (i - 1) * step).toFixed(2));
    const bAmount = parseFloat((0.2 + Math.random() * 3.5).toFixed(4));
    cumBid += bAmount;
    bids.push({ price: bPrice, amount: bAmount, total: parseFloat(cumBid.toFixed(4)) });

    const aPrice = parseFloat((midPrice + spread + (i - 1) * step).toFixed(2));
    const aAmount = parseFloat((0.2 + Math.random() * 3.5).toFixed(4));
    cumAsk += aAmount;
    asks.push({ price: aPrice, amount: aAmount, total: parseFloat(cumAsk.toFixed(4)) });
  }

  return { bids, asks };
}

// Inicia el bucle de streaming del Worker
function startStreaming(symbol: string, timeframe: string) {
  if (tickTimer) clearInterval(tickTimer);
  if (orderBookTimer) clearInterval(orderBookTimer);

  activeSymbol = symbol;
  activeTimeframe = timeframe;

  // 1. Enviar historial inicial
  const bars = generateHistoricalBars(symbol, timeframe);
  self.postMessage({
    type: 'HISTORICAL_BARS',
    payload: {
      symbol,
      timeframe,
      bars
    }
  });

  // 2. Ticks de alta frecuencia (cada 400ms para simular streaming WSS)
  tickTimer = setInterval(() => {
    if (!currentBar) return;

    const base = BASE_PRICES[symbol] || 68450.0;
    const tickDelta = (Math.random() - 0.495) * (base * 0.0006);
    currentPrice = parseFloat(Math.max(1, currentPrice + tickDelta).toFixed(2));

    // Actualizar la vela viva actual
    currentBar.close = currentPrice;
    if (currentPrice > currentBar.high) currentBar.high = currentPrice;
    if (currentPrice < currentBar.low) currentBar.low = currentPrice;
    currentBar.volume += Math.floor(Math.random() * 3);

    // Calcular estadísticas 24h
    const change24h = parseFloat((((currentPrice - base) / base) * 100).toFixed(2));
    const high24h = parseFloat((base * 1.025).toFixed(2));
    const low24h = parseFloat((base * 0.975).toFixed(2));
    const volume24h = 42890;

    const stats: MarketStats = {
      symbol: activeSymbol,
      lastPrice: currentPrice,
      change24h,
      high24h,
      low24h,
      volume24h
    };

    self.postMessage({
      type: 'TICK_UPDATE',
      payload: {
        symbol: activeSymbol,
        bar: { ...currentBar },
        stats
      }
    });
  }, 400);

  // 3. Order Book L2 updates (cada 600ms)
  orderBookTimer = setInterval(() => {
    const ob = generateOrderBook(currentPrice);
    self.postMessage({
      type: 'ORDERBOOK_UPDATE',
      payload: ob
    });
  }, 600);
}

// Receptor de comandos desde el hilo principal de React
self.onmessage = (e: MessageEvent) => {
  const { type, payload } = e.data || {};

  switch (type) {
    case 'SUBSCRIBE': {
      const { symbol, timeframe } = payload;
      startStreaming(symbol || 'BTC/USDT', timeframe || '15m');
      break;
    }
    case 'CHANGE_TIMEFRAME': {
      const { timeframe } = payload;
      startStreaming(activeSymbol, timeframe || '15m');
      break;
    }
    case 'UNSUBSCRIBE': {
      if (tickTimer) clearInterval(tickTimer);
      if (orderBookTimer) clearInterval(orderBookTimer);
      break;
    }
    default:
      break;
  }
};
