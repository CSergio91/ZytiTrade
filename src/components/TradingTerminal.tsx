import React, { useState, useEffect, useRef, useCallback } from 'react';
import { init, dispose, Chart, DeepPartial, Styles } from 'klinecharts';
import { Language } from '../i18n/translations';
import { UserSession } from '../lib/supabase';
import { MarketStats, OrderBookPayload } from '../workers/marketData.worker';
import { MarketType, AdapterConnectionStatus } from '../core/market-feed/types';

import { 
  DEFAULT_FAV_TIMEFRAMES, 
  DEFAULT_FAV_INDICATORS, 
  ALL_INDICATORS,
  ClosedTradeItem
} from './terminal/types';
import { 
  TradingEngine, 
  PositionItem, 
  OrderRequest, 
  AccountMetrics,
  generateTradeId 
} from '../core/trading';
import { TerminalHeader } from './terminal/TerminalHeader';
import { TerminalToolbar } from './terminal/TerminalToolbar';
import { TerminalSideNav } from './terminal/TerminalSideNav';
import { TerminalOrderBook } from './terminal/TerminalOrderBook';
import { TerminalOrderForm } from './terminal/TerminalOrderForm';
import { TerminalPositions } from './terminal/TerminalPositions';
import { TerminalMobileSheet } from './terminal/TerminalMobileSheet';
import { TerminalExchangeModal } from './terminal/TerminalExchangeModal';
import { PositionChartOverlay } from './terminal/PositionChartOverlay';
import { CandleInfoModal } from './terminal/CandleInfoModal';
import { TerminalToast, ToastNotification } from './terminal/TerminalToast';
import { KLineBar } from '../core/market-feed/types';
import { playOrderFilledSound } from '../utils/audioAlerts';
import { SlidersHorizontal, X } from 'lucide-react';

interface TradingTerminalProps {
  currentLang: Language;
  user: UserSession | null;
  onExit: () => void;
}

const SUPPORTED_PAIRS = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'XRP/USDT'];

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
      showRule: 'none' as any,
      showType: 'standard' as any,
      text: {
        size: 9,
        color: '#475569'
      }
    }
  },
  indicator: {
    tooltip: {
      showRule: 'always' as any,
      showType: 'standard' as any,
      text: {
        size: 9,
        color: '#475569'
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
        dashedValue: [4, 4],
        size: 1,
        color: '#64748b'
      },
      text: {
        show: true,
        color: '#ffffff',
        size: 10,
        family: 'JetBrains Mono, monospace',
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
        dashedValue: [4, 4],
        size: 1,
        color: '#64748b'
      },
      text: {
        show: true,
        color: '#ffffff',
        size: 10,
        family: 'JetBrains Mono, monospace',
        paddingLeft: 4,
        paddingRight: 4,
        paddingTop: 2,
        paddingBottom: 2,
        borderSize: 1,
        borderColor: '#0f172a',
        borderRadius: 3,
      }
    }
  }
};

// Generador de ID robusto compatible con HTTP en móviles y túneles locales
const generateId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch {}
  }
  return 'pos_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
};

export const TradingTerminal: React.FC<TradingTerminalProps> = ({
  currentLang,
  user,
  onExit
}) => {
  const isEs = currentLang === 'es';
  const [selectedPair, setSelectedPair] = useState('BTC/USDT');
  const [currentExchange, setCurrentExchange] = useState<string>(() => {
    try {
      return localStorage.getItem('zyti_exchange') || 'binance';
    } catch {
      return 'binance';
    }
  });
  const [currentMarketType, setCurrentMarketType] = useState<MarketType>(() => {
    try {
      return (localStorage.getItem('zyti_market_type') as MarketType) || 'futures';
    } catch {
      return 'futures';
    }
  });
  const [connectionStatus, setConnectionStatus] = useState<AdapterConnectionStatus>('CONNECTING');
  const [selectedCandle, setSelectedCandle] = useState<KLineBar | null>(null);
  const [timeframe, setTimeframe] = useState('15m');
  const [activeIndicators, setActiveIndicators] = useState<string[]>(['MA', 'VOL']);
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('1000');
  const [leverage, setLeverage] = useState(10);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  // Navegación lateral en escritorio y drawer en móvil
  const [navPosition, setNavPosition] = useState<'left' | 'right'>(() => {
    try {
      return (localStorage.getItem('zyti_nav_position') as 'left' | 'right') || 'left';
    } catch {
      return 'left';
    }
  });
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'none' | 'exchange'>('none');

  // Hoja activa en móvil: null (cerrada) o 'order' | 'book' | 'positions' | 'history'
  const [mobileSheet, setMobileSheet] = useState<'order' | 'book' | 'positions' | 'history' | null>(null);

  // Favoritos de temporalidades e indicadores con persistencia
  const [favoriteTimeframes, setFavoriteTimeframes] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('zyti_fav_timeframes');
      return saved ? JSON.parse(saved) : DEFAULT_FAV_TIMEFRAMES;
    } catch {
      return DEFAULT_FAV_TIMEFRAMES;
    }
  });

  const [favoriteIndicators, setFavoriteIndicators] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('zyti_fav_indicators');
      return saved ? JSON.parse(saved) : DEFAULT_FAV_INDICATORS;
    } catch {
      return DEFAULT_FAV_INDICATORS;
    }
  });

  // Botones flotantes de 1 toque (quick trade) para móviles
  const [quickTradeEnabled, setQuickTradeEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('zyti_quick_trade');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const toggleQuickTrade = () => {
    setQuickTradeEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('zyti_quick_trade', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Detección reactiva de escritorio (>= 1024px)
  const [isDesktop, setIsDesktop] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? window.innerWidth >= 1024 : true;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // Posiciones abiertas (por defecto vacío, sin operaciones predeterminadas)
  const [positions, setPositions] = useState<PositionItem[]>([]);
  const positionsRef = useRef<PositionItem[]>(positions);
  positionsRef.current = positions;

  // Registro de IDs cerrados para evitar duplicación de eventos o toasts
  const closedPositionIdsRef = useRef<Set<string>>(new Set());

  // Historial de operaciones cerradas con persistencia local
  const [tradeHistory, setTradeHistory] = useState<ClosedTradeItem[]>(() => {
    try {
      const saved = localStorage.getItem('zyti_trade_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const recordClosedTrade = useCallback((
    item: {
      id: string;
      symbol: string;
      side: 'LONG' | 'SHORT';
      size: string;
      sizeUnits: number;
      entry: number;
      mark: number;
      pnlUsdt: number;
      pnlPercentNum: number;
    },
    reason: 'TP' | 'SL' | 'MANUAL'
  ) => {
    const isProfit = item.pnlUsdt >= 0;
    const record: ClosedTradeItem = {
      id: item.id,
      symbol: item.symbol,
      side: item.side,
      size: item.size,
      sizeUnits: item.sizeUnits,
      entry: item.entry,
      exitPrice: item.mark,
      pnlUsdt: Number(item.pnlUsdt.toFixed(2)),
      pnlPercentNum: Number(item.pnlPercentNum.toFixed(2)),
      pnlPercent: `${isProfit ? '+' : ''}${item.pnlPercentNum.toFixed(2)}%`,
      isProfit,
      closedAt: new Date().toISOString(),
      closeReason: reason
    };
    setTradeHistory((prev) => {
      const updated = [record, ...prev.filter((p) => p.id !== item.id)].slice(0, 100);
      try { localStorage.setItem('zyti_trade_history', JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, []);

  const recordClosedTradeRef = useRef(recordClosedTrade);
  recordClosedTradeRef.current = recordClosedTrade;

  // Saldo de cuenta Demo y gestión de riesgo en %
  const [demoBalance, setDemoBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('zyti_demo_balance');
      return saved !== null ? Number(saved) : 10000;
    } catch {
      return 10000;
    }
  });
  const [riskPercent, setRiskPercent] = useState<number>(1);
  const [slPercent, setSlPercent] = useState<number>(2);
  const [tpPercent, setTpPercent] = useState<number>(4);
  const [orderMode, setOrderMode] = useState<'amount' | 'risk'>('amount');

  // Control de apertura, minimizado y cierre individual del panel de trading y libro de órdenes
  const [isTradingSidebarOpen, setIsTradingSidebarOpen] = useState<boolean>(true);
  const [isOrderFormMinimized, setIsOrderFormMinimized] = useState<boolean>(false);
  const [isOrderFormClosed, setIsOrderFormClosed] = useState<boolean>(false);
  const [isOrderBookMinimized, setIsOrderBookMinimized] = useState<boolean>(false);
  const [isOrderBookClosed, setIsOrderBookClosed] = useState<boolean>(false);

  const handleToggleTradingSidebar = useCallback(() => {
    setIsTradingSidebarOpen((prev) => {
      const next = !prev;
      if (next) {
        setIsOrderFormClosed(false);
        setIsOrderBookClosed(false);
      }
      setTimeout(() => chartInstanceRef.current?.resize(), 60);
      return next;
    });
  }, []);

  // Sistema de notificaciones Toast sonoras para TP, SL y ejecución
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const addToast = useCallback((toast: Omit<ToastNotification, 'id'>) => {
    const newToast: ToastNotification = {
      ...toast,
      id: generateTradeId()
    };
    setToasts((prev) => [...prev.slice(-3), newToast]);
  }, []);

  const addToastRef = useRef(addToast);
  addToastRef.current = addToast;

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);
  const workerRef = useRef<Worker | null>(null);

  // 1. Inicialización de KLineChart Canvas y Web Worker
  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;

    const chart = init(container, {
      styles: ZYTI_CHART_THEME,
      locale: isEs ? 'es' : 'en'
    });
    if (!chart) return;
    chartInstanceRef.current = chart;

    chart.setPriceVolumePrecision(2, 4);
    chart.createIndicator('MA', false, { id: 'candle_pane' });
    chart.createIndicator('VOL', false, { id: 'pane_vol' });

    // Suscripción al clic de vela para mostrar modalito con información detallada
    chart.subscribeAction('onCandleBarClick' as any, (data: any) => {
      if (data && data.kLineData) {
        setSelectedCandle(data.kLineData);
      }
    });

    // Soporte táctil nativo y fluido para alejar/acercar en la barra lateral de precios (Y-Axis)
    // y la barra inferior de tiempo (X-Axis) en dispositivos móviles y tablets
    const chartEvent = (chart as any)._chartEvent;
    if (chartEvent) {
      const origTouchStart = chartEvent.touchStartEvent.bind(chartEvent);
      const origTouchMove = chartEvent.touchMoveEvent.bind(chartEvent);
      const origTouchEnd = chartEvent.touchEndEvent.bind(chartEvent);

      let isTouchDraggingAxis = false;
      let lastYAxisTapTime = 0;

      chartEvent.touchStartEvent = function (e: any) {
        const found = chartEvent._findWidgetByEvent(e);
        const name = found?.widget?.getName?.();
        if (name === 'yAxis' || name === 'xAxis') {
          isTouchDraggingAxis = true;

          // Doble toque rápido en el eje lateral de precios para restablecer el auto-escalado (análogo al doble clic en escritorio)
          if (name === 'yAxis') {
            const now = Date.now();
            if (now - lastYAxisTapTime < 350) {
              const yAxis = found?.pane?.getAxisComponent?.();
              if (yAxis && !yAxis.getAutoCalcTickFlag?.()) {
                yAxis.setAutoCalcTickFlag(true);
                (chart as any).adjustPaneViewport(false, true, true, true);
                isTouchDraggingAxis = false;
                lastYAxisTapTime = 0;
                return true;
              }
            }
            lastYAxisTapTime = now;
          }

          return chartEvent.mouseDownEvent(e);
        }
        isTouchDraggingAxis = false;
        return origTouchStart(e);
      };

      chartEvent.touchMoveEvent = function (e: any) {
        if (isTouchDraggingAxis) {
          if (e.preventDefault) {
            try { e.preventDefault(); } catch {}
          }
          return chartEvent.pressedMouseMoveEvent(e);
        }
        return origTouchMove(e);
      };

      chartEvent.touchEndEvent = function (e: any) {
        if (isTouchDraggingAxis) {
          isTouchDraggingAxis = false;
          return chartEvent.mouseUpEvent(e);
        }
        return origTouchEnd(e);
      };
    }

    // Instanciar Web Worker
    const worker = new Worker(
      new URL('../workers/marketData.worker.ts', import.meta.url),
      { type: 'module' }
    );
    workerRef.current = worker;

    worker.onmessage = (e: MessageEvent) => {
      const { type, payload } = e.data || {};
      const activeChart = chartInstanceRef.current;
      if (type === 'HISTORICAL_BARS') {
        if (activeChart && payload.bars && payload.bars.length > 0) {
          const precision = (payload.symbol || '').includes('XRP') ? 4 : 2;
          activeChart.setPriceVolumePrecision(precision, 4);
          activeChart.clearData();
          activeChart.applyNewData(payload.bars, false);
          activeChart.scrollToRealTime();
        }
      } else if (type === 'TICK_UPDATE') {
        if (activeChart && payload.bar) {
          activeChart.updateData(payload.bar);
        }
        if (payload.stats && payload.stats.lastPrice > 0 && !isNaN(payload.stats.lastPrice)) {
          setStats(payload.stats);
          const currentP = payload.stats.lastPrice;

          const currentPositions = positionsRef.current;
          if (currentPositions.length > 0) {
            const evaluation = TradingEngine.evaluatePositionsOnTick(
              currentPositions,
              currentP,
              payload.stats.symbol
            );

            // Actualizar posiciones
            setPositions(evaluation.updatedPositions);

            // Actualizar saldo realizado si hubo ejecuciones de TP o SL
            if (evaluation.balanceDelta !== 0) {
              setDemoBalance((prevB) => {
                const nextB = Number((prevB + evaluation.balanceDelta).toFixed(2));
                try {
                  localStorage.setItem('zyti_demo_balance', nextB.toString());
                } catch {}
                return nextB;
              });
            }

            // Despachar Toasts, registrar en historial y alertas sonoras de TP o SL FUERA del setState (exactamente una vez)
            evaluation.events.forEach((evt) => {
              if (closedPositionIdsRef.current.has(evt.position.id)) return;
              closedPositionIdsRef.current.add(evt.position.id);

              // Registrar en Historial
              recordClosedTradeRef.current(evt.position, evt.type === 'TP_HIT' ? 'TP' : 'SL');

              if (evt.type === 'TP_HIT') {
                addToastRef.current({
                  type: 'tp',
                  title: isEs ? '¡Take Profit Alcanzado!' : 'Take Profit Triggered!',
                  symbol: evt.position.symbol,
                  pnlUsdt: evt.realizedPnL,
                  pnlPercent: evt.position.pnlPercentNum,
                  price: evt.price
                });
                setOrderSuccess(
                  isEs
                    ? `¡Take Profit alcanzado en ${evt.position.symbol}! (+${evt.realizedPnL.toFixed(2)} USDT)`
                    : `Take Profit hit on ${evt.position.symbol}! (+${evt.realizedPnL.toFixed(2)} USDT)`
                );
                setTimeout(() => setOrderSuccess(null), 4000);
              } else if (evt.type === 'SL_HIT') {
                addToastRef.current({
                  type: 'sl',
                  title: isEs ? 'Stop Loss Ejecutado' : 'Stop Loss Triggered',
                  symbol: evt.position.symbol,
                  pnlUsdt: evt.realizedPnL,
                  pnlPercent: evt.position.pnlPercentNum,
                  price: evt.price
                });
                setOrderSuccess(
                  isEs
                    ? `Stop Loss ejecutado en ${evt.position.symbol}. (${evt.realizedPnL.toFixed(2)} USDT)`
                    : `Stop Loss triggered on ${evt.position.symbol}. (${evt.realizedPnL.toFixed(2)} USDT)`
                );
                setTimeout(() => setOrderSuccess(null), 4000);
              }
            });
          }
        }
      } else if (type === 'TICKER') {
        if (payload.stats && payload.stats.lastPrice > 0 && !isNaN(payload.stats.lastPrice)) {
          setStats(payload.stats);
          const currentP = payload.stats.lastPrice;
          const currentPositions = positionsRef.current;
          if (currentPositions.length > 0) {
            const evaluation = TradingEngine.evaluatePositionsOnTick(
              currentPositions,
              currentP,
              payload.stats.symbol
            );
            setPositions(evaluation.updatedPositions);
            if (evaluation.balanceDelta !== 0) {
              setDemoBalance((prevB) => {
                const nextB = Number((prevB + evaluation.balanceDelta).toFixed(2));
                try {
                  localStorage.setItem('zyti_demo_balance', nextB.toString());
                } catch {}
                return nextB;
              });
            }

            // Despachar Toasts, registrar en historial si ocurrió TP o SL en TICKER
            evaluation.events.forEach((evt) => {
              if (closedPositionIdsRef.current.has(evt.position.id)) return;
              closedPositionIdsRef.current.add(evt.position.id);

              recordClosedTradeRef.current(evt.position, evt.type === 'TP_HIT' ? 'TP' : 'SL');

              if (evt.type === 'TP_HIT') {
                addToastRef.current({
                  type: 'tp',
                  title: isEs ? '¡Take Profit Alcanzado!' : 'Take Profit Triggered!',
                  symbol: evt.position.symbol,
                  pnlUsdt: evt.realizedPnL,
                  pnlPercent: evt.position.pnlPercentNum,
                  price: evt.price
                });
              } else if (evt.type === 'SL_HIT') {
                addToastRef.current({
                  type: 'sl',
                  title: isEs ? 'Stop Loss Ejecutado' : 'Stop Loss Triggered',
                  symbol: evt.position.symbol,
                  pnlUsdt: evt.realizedPnL,
                  pnlPercent: evt.position.pnlPercentNum,
                  price: evt.price
                });
              }
            });
          }
        }
      } else if (type === 'ORDERBOOK_UPDATE') {
        if (payload.bids && payload.asks && payload.bids.length > 0) {
          setOrderBook(payload);
        }
      } else if (type === 'STATUS_CHANGE') {
        if (payload?.status) {
          setConnectionStatus(payload.status);
        }
      }
    };

    worker.postMessage({
      type: 'SUBSCRIBE',
      payload: { 
        exchange: currentExchange, 
        symbol: selectedPair, 
        timeframe, 
        marketType: currentMarketType 
      }
    });

    const resizeObserver = new ResizeObserver(() => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.resize();
      }
    });
    resizeObserver.observe(container);

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

  // 1.B Soporte de gestos táctiles para zoom en eje lateral (precio) e inferior (tiempo) en móviles
  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;

    let activeTouchAxis: 'yAxis' | 'xAxis' | null = null;
    let startTouchX = 0;
    let startTouchY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      const rect = container.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      // Eje lateral derecho (Precio): zona derecha (últimos 70px)
      const isRightAxis = x >= rect.width - 70;
      // Eje inferior (Tiempo): base (últimos 36px)
      const isBottomAxis = y >= rect.height - 36;

      if (isRightAxis) {
        activeTouchAxis = 'yAxis';
        startTouchX = touch.clientX;
        startTouchY = touch.clientY;
        const synthDown = new MouseEvent('mousedown', {
          clientX: touch.clientX,
          clientY: touch.clientY,
          bubbles: true,
          cancelable: true,
          button: 0
        });
        container.dispatchEvent(synthDown);
      } else if (isBottomAxis) {
        activeTouchAxis = 'xAxis';
        startTouchX = touch.clientX;
        startTouchY = touch.clientY;
        const synthDown = new MouseEvent('mousedown', {
          clientX: touch.clientX,
          clientY: touch.clientY,
          bubbles: true,
          cancelable: true,
          button: 0
        });
        container.dispatchEvent(synthDown);
      } else {
        activeTouchAxis = null;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!activeTouchAxis || e.touches.length !== 1) return;
      const touch = e.touches[0];
      if (e.cancelable) {
        e.preventDefault();
      }

      const synthMove = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY,
        bubbles: true,
        cancelable: true,
        buttons: 1
      });
      container.dispatchEvent(synthMove);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!activeTouchAxis) return;
      const touch = e.changedTouches[0];
      const synthUp = new MouseEvent('mouseup', {
        clientX: touch ? touch.clientX : startTouchX,
        clientY: touch ? touch.clientY : startTouchY,
        bubbles: true,
        cancelable: true,
        button: 0
      });
      container.dispatchEvent(synthUp);
      activeTouchAxis = null;
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: false });
    container.addEventListener('touchcancel', handleTouchEnd, { passive: false });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, []);

  // Handlers de Exchange, Mercado, Par y Saldo Institucional
  const handleSelectExchange = (exchange: string) => {
    setCurrentExchange(exchange);
    try {
      localStorage.setItem('zyti_exchange', exchange);
    } catch {}
    if (chartInstanceRef.current) {
      chartInstanceRef.current.clearData();
    }
    if (workerRef.current) {
      workerRef.current.postMessage({
        type: 'SUBSCRIBE',
        payload: {
          exchange,
          symbol: selectedPair,
          timeframe,
          marketType: currentMarketType
        }
      });
    }
  };

  const handleSelectMarketType = (mType: MarketType) => {
    setCurrentMarketType(mType);
    try {
      localStorage.setItem('zyti_market_type', mType);
    } catch {}
    if (chartInstanceRef.current) {
      chartInstanceRef.current.clearData();
    }
    if (workerRef.current) {
      workerRef.current.postMessage({
        type: 'SUBSCRIBE',
        payload: {
          exchange: currentExchange,
          symbol: selectedPair,
          timeframe,
          marketType: mType
        }
      });
    }
  };

  const handleSelectPair = (pair: string) => {
    setSelectedPair(pair);
    // Limpiar gráfico de inmediato para que la escala del par previo no quede anclada en el eje
    if (chartInstanceRef.current) {
      chartInstanceRef.current.clearData();
    }
    // Pre-cargar precio base para eliminar desfases de escala en el eje derecho
    const pairPriceEstimates: Record<string, number> = {
      'BTC/USDT': 96450.0,
      'ETH/USDT': 2688.0,
      'SOL/USDT': 218.5,
      'BNB/USDT': 685.0,
      'XRP/USDT': 2.45
    };
    const estPrice = pairPriceEstimates[pair];
    if (estPrice) {
      setStats((prev) => ({
        ...prev,
        symbol: pair,
        lastPrice: estPrice
      }));
    }
    if (workerRef.current) {
      workerRef.current.postMessage({
        type: 'SUBSCRIBE',
        payload: {
          exchange: currentExchange,
          symbol: pair,
          timeframe,
          marketType: currentMarketType
        }
      });
    }
  };

  const handleSelectBalanceAmount = (amountNum: number) => {
    closedPositionIdsRef.current.clear();
    setPositions([]);
    setDemoBalance(amountNum);
    try {
      localStorage.setItem('zyti_demo_balance', amountNum.toString());
    } catch {}
    addToast({
      type: 'info',
      title: isEs ? 'Tamaño de Cuenta Actualizado' : 'Account Size Updated',
      message: isEs
        ? `Cuenta configurada en $${amountNum.toLocaleString()}.00 USDT. Parámetros de riesgo recalculados.`
        : `Account set to $${amountNum.toLocaleString()}.00 USDT. Risk parameters recalibrated.`
    });
  };

  const handleSelectTimeframe = (tf: string) => {
    setTimeframe(tf);
    if (chartInstanceRef.current) {
      chartInstanceRef.current.clearData();
    }
    if (workerRef.current) {
      workerRef.current.postMessage({
        type: 'CHANGE_TIMEFRAME',
        payload: { timeframe: tf }
      });
    }
  };

  const handleToggleIndicator = (name: string) => {
    const chart = chartInstanceRef.current;
    if (!chart) return;

    if (name === 'OHLC') {
      const willBeActive = !activeIndicators.includes('OHLC');
      chart.setStyles({
        candle: {
          tooltip: {
            showRule: willBeActive ? ('always' as any) : ('none' as any),
            text: {
              size: 9,
              color: '#475569'
            }
          }
        }
      });
      setActiveIndicators(willBeActive ? [...activeIndicators, 'OHLC'] : activeIndicators.filter((i) => i !== 'OHLC'));
      return;
    }

    const indOption = ALL_INDICATORS.find((i) => i.name === name);
    const targetPane = indOption?.paneId || (indOption?.category === 'main' ? 'candle_pane' : `pane_${name.toLowerCase()}`);

    if (activeIndicators.includes(name)) {
      chart.removeIndicator(targetPane, name);
      setActiveIndicators(activeIndicators.filter((i) => i !== name));
    } else {
      chart.createIndicator(name, false, { id: targetPane });
      setActiveIndicators([...activeIndicators, name]);
    }
  };

  const toggleFavoriteTimeframe = (tf: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavoriteTimeframes((prev) => {
      const next = prev.includes(tf) ? prev.filter((item) => item !== tf) : [...prev, tf];
      try {
        localStorage.setItem('zyti_fav_timeframes', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const toggleFavoriteIndicator = (ind: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavoriteIndicators((prev) => {
      const next = prev.includes(ind) ? prev.filter((item) => item !== ind) : [...prev, ind];
      try {
        localStorage.setItem('zyti_fav_indicators', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const toggleNavPosition = () => {
    setNavPosition((prev) => {
      const next = prev === 'left' ? 'right' : 'left';
      try {
        localStorage.setItem('zyti_nav_position', next);
      } catch {}
      return next;
    });
  };

  // Métricas de cuenta centralizadas por el TradingEngine
  const accountMetrics = TradingEngine.calculateAccountMetrics(demoBalance, positions);

  const handleUpdatePositionSLTP = (id: string, slPrice?: number | null, tpPrice?: number | null) => {
    setPositions((prev) => TradingEngine.updatePositionSLTP(prev, id, slPrice, tpPrice));

    const target = positionsRef.current.find((p) => p.id === id);
    if (target && slPrice !== undefined) {
      if (slPrice !== null) {
        const isLong = target.side === 'LONG';
        const isBE = Math.abs(slPrice - target.entry) < 0.05;
        const isProtectedProfit = isLong ? slPrice > target.entry + 0.05 : slPrice < target.entry - 0.05;

        if (isBE) {
          addToast({
            type: 'info',
            title: isEs ? 'Stop Loss en Break-Even' : 'Stop Loss at Break-Even',
            message: isEs
              ? `SL colocado al precio de entrada ($${slPrice.toLocaleString()}). Operación protegida sin riesgo.`
              : `SL placed at entry price ($${slPrice.toLocaleString()}). Trade protected risk-free.`
          });
        } else if (isProtectedProfit) {
          addToast({
            type: 'tp',
            title: isEs ? 'Operación Protegida (SL en Beneficio)' : 'Protected Trade (SL in Profit)',
            message: isEs
              ? `Stop Loss asegurado a $${slPrice.toLocaleString()} protegiendo beneficios acumulados.`
              : `Stop Loss secured at $${slPrice.toLocaleString()} locking in accumulated profits.`
          });
        }
      }
    }
  };

  // Activación o validación de Stop Loss en Break-Even (precio de entrada exacto)
  const handleSetBreakEven = useCallback((pos: PositionItem) => {
    const isLong = pos.side === 'LONG';
    const currentSymbolPrice = (pos.symbol === selectedPair && stats.lastPrice > 0)
      ? stats.lastPrice
      : pos.mark;

    // Verificamos si la posición está actualmente en pérdidas respecto al precio de entrada
    const isLoss = isLong
      ? currentSymbolPrice < pos.entry
      : currentSymbolPrice > pos.entry;

    if (isLoss) {
      const unrealizedLoss = Math.abs(pos.pnlUsdt);
      addToast({
        type: 'warning',
        title: isEs ? 'No se puede activar Break-Even' : 'Cannot Activate Break-Even',
        message: isEs
          ? `La posición en ${pos.symbol} está actualmente en pérdidas (-$${unrealizedLoss.toFixed(2)} USDT). Para colocar Break-Even sin riesgo de liquidación inmediata, el precio debe alcanzar o superar la entrada ($${pos.entry.toLocaleString()} USDT).`
          : `Position on ${pos.symbol} is currently in loss (-$${unrealizedLoss.toFixed(2)} USDT). To set Break-Even without immediate liquidation risk, the price must reach or surpass entry ($${pos.entry.toLocaleString()} USDT).`
      });
      return;
    }

    // Si ya está colocada la orden en Break-Even exacto
    if (pos.slPrice && Math.abs(pos.slPrice - pos.entry) < 0.05) {
      addToast({
        type: 'info',
        title: isEs ? 'Ya en Break-Even' : 'Already at Break-Even',
        message: isEs
          ? `La operación en ${pos.symbol} ya cuenta con Stop Loss en su precio de entrada ($${pos.entry.toLocaleString()} USDT). Puedes arrastrar el badge de SL en el gráfico hacia arriba para ir protegiendo ganancias a medida que el precio avance.`
          : `Trade on ${pos.symbol} already has Stop Loss at entry ($${pos.entry.toLocaleString()} USDT). You can drag the SL badge on the chart to lock in profits as the price advances.`
      });
      return;
    }

    // Posición en ganancia o equilibrio: fijar SL en el precio de entrada exacto
    setPositions((prev) => TradingEngine.updatePositionSLTP(prev, pos.id, pos.entry, pos.tpPrice ?? null));
    addToast({
      type: 'info',
      title: isEs ? 'Stop Loss en Break-Even' : 'Stop Loss at Break-Even',
      message: isEs
        ? `Operación ${pos.side} en ${pos.symbol} asegurada al precio de entrada ($${pos.entry.toLocaleString()} USDT). Riesgo cero.`
        : `${pos.side} trade on ${pos.symbol} secured at entry price ($${pos.entry.toLocaleString()} USDT). Zero risk.`
    });
  }, [selectedPair, stats.lastPrice, isEs, addToast]);

  const handleUpdatePreviewSLTP = useCallback((newSlPct?: number, newTpPct?: number) => {
    if (newSlPct !== undefined && !isNaN(newSlPct) && newSlPct > 0) {
      setSlPercent(Math.max(0.1, Number(newSlPct.toFixed(1))));
    }
    if (newTpPct !== undefined && !isNaN(newTpPct) && newTpPct > 0) {
      setTpPercent(Math.max(0.1, Number(newTpPct.toFixed(1))));
    }
  }, []);

  // Cerrar posición manualmente: calcula PnL realizado y actualiza el saldo de la cuenta
  const handleClosePosition = (id: string) => {
    if (closedPositionIdsRef.current.has(id)) return;
    
    const currentPositions = positionsRef.current;
    const { remainingPositions, closedPosition, realizedPnL } = TradingEngine.closePosition(currentPositions, id);
    if (!closedPosition) return;

    closedPositionIdsRef.current.add(id);

    // Registrar en Historial de operaciones cerradas
    recordClosedTrade(closedPosition, 'MANUAL');

    setPositions(remainingPositions);
    setDemoBalance((prevB) => {
      const nextB = Number((prevB + realizedPnL).toFixed(2));
      try { localStorage.setItem('zyti_demo_balance', nextB.toString()); } catch {}
      return nextB;
    });

    // Toast sonoro al cerrar manualmente (despachado una sola vez)
    addToast({
      type: realizedPnL >= 0 ? 'tp' : 'sl',
      title: isEs
        ? (realizedPnL >= 0 ? 'Posición Cerrada (Beneficio)' : 'Posición Cerrada (Pérdida)')
        : (realizedPnL >= 0 ? 'Position Closed (Profit)' : 'Position Closed (Loss)'),
      symbol: closedPosition.symbol,
      pnlUsdt: realizedPnL,
      pnlPercent: closedPosition.pnlPercentNum,
      price: closedPosition.mark
    });

    setOrderSuccess(
      isEs
        ? `Posición ${closedPosition.symbol} cerrada. PnL: ${realizedPnL >= 0 ? '+' : ''}$${realizedPnL.toFixed(2)} USDT`
        : `Position ${closedPosition.symbol} closed. PnL: ${realizedPnL >= 0 ? '+' : ''}$${realizedPnL.toFixed(2)} USDT`
    );
    setTimeout(() => setOrderSuccess(null), 3000);
  };

  // Cerrar todas las posiciones abiertas en una sola acción atómica a precio de mercado
  const handleCloseAllPositions = () => {
    const currentPositions = positionsRef.current;
    if (currentPositions.length === 0) return;

    let totalRealizedPnL = 0;
    currentPositions.forEach((pos) => {
      closedPositionIdsRef.current.add(pos.id);
      recordClosedTrade(pos, 'MANUAL');
      totalRealizedPnL += (pos.pnlUsdt ?? 0);
    });

    setPositions([]);
    setDemoBalance((prevB) => {
      const nextB = Number((prevB + totalRealizedPnL).toFixed(2));
      try { localStorage.setItem('zyti_demo_balance', nextB.toString()); } catch {}
      return nextB;
    });

    addToast({
      type: totalRealizedPnL >= 0 ? 'tp' : 'sl',
      title: isEs
        ? (totalRealizedPnL >= 0 ? 'Posiciones Cerradas (Beneficio)' : 'Posiciones Cerradas (Pérdida)')
        : (totalRealizedPnL >= 0 ? 'Positions Closed (Profit)' : 'Positions Closed (Loss)'),
      message: isEs
        ? `${currentPositions.length} operaciones liquidadas a mercado`
        : `${currentPositions.length} positions settled at market`,
      pnlUsdt: totalRealizedPnL
    });

    setOrderSuccess(
      isEs
        ? `Todas las posiciones (${currentPositions.length}) cerradas. PnL: ${totalRealizedPnL >= 0 ? '+' : ''}$${totalRealizedPnL.toFixed(2)} USDT`
        : `All positions (${currentPositions.length}) closed. PnL: ${totalRealizedPnL >= 0 ? '+' : ''}$${totalRealizedPnL.toFixed(2)} USDT`
    );
    setTimeout(() => setOrderSuccess(null), 3000);
  };

  // Resetear el saldo demo al valor inicial de $10,000
  const resetDemoBalance = () => {
    closedPositionIdsRef.current.clear();
    setPositions([]); // Cierra todas las posiciones
    setDemoBalance(10000);
    try { localStorage.setItem('zyti_demo_balance', '10000'); } catch {}
    addToast({
      type: 'info',
      title: isEs ? 'Cuenta Demo Restablecida' : 'Demo Account Reset',
      message: isEs ? 'Saldo restablecido a $10,000.00 USDT iniciales.' : 'Balance reset to initial $10,000.00 USDT.'
    });
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const entryTs = (() => {
      const d = chartInstanceRef.current?.getDataList();
      return d && d.length > 0 ? d[d.length - 1].timestamp : Math.floor(Date.now() / 60000) * 60000;
    })();

    const orderReq: OrderRequest = {
      symbol: selectedPair,
      side,
      orderType,
      orderMode,
      amountUsdt: parseFloat(amount) || 1000,
      riskPercent,
      slPercent,
      tpPercent,
      leverage
    };

    const result = TradingEngine.openPosition(
      orderReq,
      stats.lastPrice,
      entryTs,
      accountMetrics
    );

    if (!result.success || !result.position) {
      setOrderSuccess(result.error || (isEs ? 'Error al validar orden' : 'Order validation error'));
      setTimeout(() => setOrderSuccess(null), 4000);
      return;
    }

    setPositions((prev) => [result.position!, ...prev]);
    playOrderFilledSound();
    const isBuy = side === 'buy';
    addToast({
      type: isBuy ? 'buy' : 'sell',
      title: isEs ? (isBuy ? '¡Compra Ejecutada!' : '¡Venta Ejecutada!') : (isBuy ? 'Buy Filled!' : 'Sell Filled!'),
      message: `${result.position.side} • ${result.position.size} (${result.position.leverage}x)`,
      symbol: selectedPair,
      price: stats.lastPrice
    });

    setOrderSuccess(
      isEs
        ? `¡Orden ${result.position.side} ejecutada a $${stats.lastPrice.toLocaleString()}!`
        : `Order ${result.position.side} executed at $${stats.lastPrice.toLocaleString()}!`
    );
    setTimeout(() => setOrderSuccess(null), 3000);
  };

  const bestBid = orderBook.bids[0]?.price || Number((stats.lastPrice * 0.9998).toFixed(2));
  const bestAsk = orderBook.asks[0]?.price || Number((stats.lastPrice * 1.0002).toFixed(2));

  const handleQuickTrade = (quickSide: 'buy' | 'sell') => {
    // Comprar se ejecuta al Ask, Vender se ejecuta al Bid
    const currentP = quickSide === 'buy' ? bestAsk : bestBid;
    const entryTs = (() => {
      const d = chartInstanceRef.current?.getDataList();
      return d && d.length > 0 ? d[d.length - 1].timestamp : Math.floor(Date.now() / 60000) * 60000;
    })();

    const defaultAmount = Math.min(1000, accountMetrics.availableBalance > 10 ? accountMetrics.availableBalance : 1000);

    const orderReq: OrderRequest = {
      symbol: selectedPair,
      side: quickSide,
      orderType: 'market',
      orderMode: 'amount',
      amountUsdt: defaultAmount,
      slPercent,
      tpPercent,
      leverage
    };

    const result = TradingEngine.openPosition(
      orderReq,
      currentP,
      entryTs,
      accountMetrics
    );

    if (result.success && result.position) {
      setPositions((prev) => [result.position!, ...prev]);
      playOrderFilledSound();
      const isQuickBuy = quickSide === 'buy';
      addToast({
        type: isQuickBuy ? 'buy' : 'sell',
        title: isEs ? (isQuickBuy ? '¡Compra Rápida!' : '¡Venta Rápida!') : (isQuickBuy ? '1-Tap Buy Filled!' : '1-Tap Sell Filled!'),
        message: `${result.position.side} • ${result.position.size} (${result.position.leverage}x)`,
        symbol: selectedPair,
        price: currentP
      });

      setOrderSuccess(
        isEs
          ? `¡Orden 1-Toque ${result.position.side} ejecutada a $${currentP.toLocaleString()}!`
          : `1-Tap ${result.position.side} filled at $${currentP.toLocaleString()}!`
      );
      setTimeout(() => setOrderSuccess(null), 3000);
    }
  };

  const renderOrderForm = () => (
    <TerminalOrderForm
      isEs={isEs}
      selectedPair={selectedPair}
      currentPrice={stats.lastPrice}
      demoBalance={demoBalance}
      side={side}
      orderType={orderType}
      amount={amount}
      leverage={leverage}
      riskPercent={riskPercent}
      slPercent={slPercent}
      tpPercent={tpPercent}
      orderMode={orderMode}
      orderSuccess={orderSuccess}
      quickTradeEnabled={quickTradeEnabled}
      isDesktop={isDesktop}
      isMinimized={isOrderFormMinimized}
      onToggleMinimize={() => setIsOrderFormMinimized((m) => !m)}
      onClose={() => {
        setIsOrderFormClosed(true);
        if (isOrderBookClosed) {
          setIsTradingSidebarOpen(false);
        }
        setTimeout(() => chartInstanceRef.current?.resize(), 60);
      }}
      onToggleQuickTrade={toggleQuickTrade}
      setSide={setSide}
      setOrderType={setOrderType}
      setAmount={setAmount}
      setLeverage={setLeverage}
      setRiskPercent={setRiskPercent}
      setSlPercent={setSlPercent}
      setTpPercent={setTpPercent}
      setOrderMode={setOrderMode}
      onSubmit={handlePlaceOrder}
    />
  );

  const renderOrderBook = () => (
    <TerminalOrderBook
      orderBook={orderBook}
      isMinimized={isOrderBookMinimized}
      onToggleMinimize={() => setIsOrderBookMinimized((m) => !m)}
      onClose={() => {
        setIsOrderBookClosed(true);
        if (isOrderFormClosed) {
          setIsTradingSidebarOpen(false);
        }
        setTimeout(() => chartInstanceRef.current?.resize(), 60);
      }}
    />
  );

  // Cálculos de configuración previa de trading para proyectar en el gráfico
  const isPreviewLong = side === 'buy';
  const previewSlPrice = isPreviewLong
    ? Number((stats.lastPrice * (1 - slPercent / 100)).toFixed(2))
    : Number((stats.lastPrice * (1 + slPercent / 100)).toFixed(2));
  const previewTpPrice = isPreviewLong
    ? Number((stats.lastPrice * (1 + tpPercent / 100)).toFixed(2))
    : Number((stats.lastPrice * (1 - tpPercent / 100)).toFixed(2));

  const previewRiskAmountUsd = (demoBalance * riskPercent) / 100;
  const previewNotionalUsd = orderMode === 'risk'
    ? (slPercent > 0 ? previewRiskAmountUsd / (slPercent / 100) : 1000)
    : (parseFloat(amount) || 1000) * leverage;
  const previewEstimatedLossUsd = orderMode === 'risk'
    ? previewRiskAmountUsd
    : previewNotionalUsd * (slPercent / 100);
  const previewEstimatedProfitUsd = previewNotionalUsd * (tpPercent / 100);

  return (
    <div className="h-screen w-screen bg-[#fbf9f4] text-slate-900 flex flex-col font-sans overflow-hidden select-none">
      
      {/* 1. TOP HEADER INSTITUCIONAL */}
      <TerminalHeader
        isEs={isEs}
        user={user}
        selectedPair={selectedPair}
        supportedPairs={SUPPORTED_PAIRS}
        stats={stats}
        demoBalance={demoBalance}
        availableBalance={accountMetrics.availableBalance}
        equity={accountMetrics.equity}
        isMobileNavOpen={isMobileNavOpen}
        unrealizedPnL={accountMetrics.unrealizedPnL}
        positionsCount={positions.length}
        activeSection={activeSection}
        currentExchange={currentExchange}
        currentMarketType={currentMarketType}
        connectionStatus={connectionStatus}
        onSelectExchange={handleSelectExchange}
        onSelectMarketType={handleSelectMarketType}
        onSelectPair={handleSelectPair}
        onSelectBalanceAmount={handleSelectBalanceAmount}
        onSelectSection={(sec) => setActiveSection(sec === 'exchange' ? 'exchange' : 'none')}
        onToggleMobileNav={() => setIsMobileNavOpen(!isMobileNavOpen)}
        onResetBalance={resetDemoBalance}
        onExit={onExit}
      />

      {/* 2. ÁREA PRINCIPAL: NAVEGACIÓN + GRÁFICO CENTRAL + PANEL LATERAL */}
      <div className="terminal-main-layout flex-1 overflow-hidden relative">
        
        {/* NAVEGACIÓN LATERAL EN ESCRITORIO (IZQUIERDA) */}
        {navPosition === 'left' && (
          <TerminalSideNav
            isEs={isEs}
            navPosition={navPosition}
            isMobileNavOpen={isMobileNavOpen}
            activeSection={activeSection}
            isTradingSidebarOpen={isTradingSidebarOpen}
            onToggleTradingSidebar={handleToggleTradingSidebar}
            onToggleNavPosition={toggleNavPosition}
            onSelectSection={(sec) => setActiveSection(sec === 'exchange' ? 'exchange' : 'none')}
            onCloseMobileNav={() => setIsMobileNavOpen(false)}
            onExit={onExit}
          />
        )}

        {/* COLUMNA CENTRAL: TOOLBAR + KLINECHART + POSICIONES (Desktop) / MOBILE SHEET */}
        <div className="terminal-chart-wrapper relative">
          
          <TerminalToolbar
            isEs={isEs}
            timeframe={timeframe}
            favoriteTimeframes={favoriteTimeframes}
            activeIndicators={activeIndicators}
            favoriteIndicators={favoriteIndicators}
            onSelectTimeframe={handleSelectTimeframe}
            onToggleIndicator={handleToggleIndicator}
            onToggleFavoriteTimeframe={toggleFavoriteTimeframe}
            onToggleFavoriteIndicator={toggleFavoriteIndicator}
          />

          {/* CONTENEDOR KLINECHART v9.8.6 OFICIAL */}
          <div className="terminal-chart-canvas-box overflow-hidden bg-[#fbf9f4] relative">
            <div 
              ref={chartContainerRef} 
              id="trading-terminal-chart" 
              className="w-full h-full block" 
            />

            {/* OVERLAY INTERACTIVO: ENTRADAS (AZUL), TAKE PROFIT (VERDE) Y STOP LOSS (ROJO) ARRASTRABLES + PREVIEW */}
            <PositionChartOverlay
              chart={chartInstanceRef.current}
              positions={positions.filter((p) => p.symbol === selectedPair)}
              currentPrice={stats.lastPrice}
              demoBalance={demoBalance}
              isEs={isEs}
              tradeSetupPreview={{
                enabled: isTradingSidebarOpen && !isOrderFormClosed && !isOrderFormMinimized,
                side,
                entryPrice: stats.lastPrice,
                slPercent,
                tpPercent,
                slPrice: previewSlPrice,
                tpPrice: previewTpPrice,
                estimatedLossUsd: previewEstimatedLossUsd,
                estimatedProfitUsd: previewEstimatedProfitUsd
              }}
              onUpdatePositionSLTP={handleUpdatePositionSLTP}
              onClosePosition={handleClosePosition}
              onUpdatePreviewSLTP={handleUpdatePreviewSLTP}
              onSetBreakEven={handleSetBreakEven}
            />

            {/* MODALITO FLOTANTE CON DETALLES DE VELA AL CLICAR DIRECTAMENTE (OHLC, VOL, CAMBIO %) */}
            <CandleInfoModal
              candle={selectedCandle}
              symbol={selectedPair}
              isEs={isEs}
              onClose={() => setSelectedCandle(null)}
            />

          </div>

          {/* DESKTOP: TABLA INFERIOR DE POSICIONES ABIERTAS (h-36 / RESIZABLE) */}
          <TerminalPositions
            isEs={isEs}
            positions={positions}
            history={tradeHistory}
            demoBalance={demoBalance}
            onClosePosition={handleClosePosition}
            onCloseAllPositions={handleCloseAllPositions}
            onSetBreakEven={handleSetBreakEven}
          />

        </div>

        {/* DESKTOP (>= 1024px): PANEL LATERAL ESTRECHO (280px) CON TRADING ARRIBA Y LIBRO ABAJO */}
        {isTradingSidebarOpen && (!isOrderFormClosed || !isOrderBookClosed) && (
          <div className="terminal-desktop-sidebar no-scrollbar">
            {/* 1. PANEL DE TRADING ARRIBA */}
            {!isOrderFormClosed && renderOrderForm()}

            {/* 2. LIBRO DE ÓRDENES ABAJO */}
            {!isOrderBookClosed && renderOrderBook()}
          </div>
        )}

        {/* NAVEGACIÓN LATERAL EN ESCRITORIO (DERECHA) */}
        {navPosition === 'right' && (
          <TerminalSideNav
            isEs={isEs}
            navPosition={navPosition}
            isMobileNavOpen={isMobileNavOpen}
            activeSection={activeSection}
            isTradingSidebarOpen={isTradingSidebarOpen}
            onToggleTradingSidebar={handleToggleTradingSidebar}
            onToggleNavPosition={toggleNavPosition}
            onSelectSection={(sec) => setActiveSection(sec === 'exchange' ? 'exchange' : 'none')}
            onCloseMobileNav={() => setIsMobileNavOpen(false)}
            onExit={onExit}
          />
        )}

      </div>

      {/* 3. MÓVIL EXCLUSIVO (< 1024px): BARRA DE BOTONES INFERIOR FIJA + HOJA A MITAD DE PANTALLA (50dvh) + BOTONES 1-TOQUE */}
      {!isDesktop && (
        <TerminalMobileSheet
          isEs={isEs}
          activeSheet={mobileSheet}
          positions={positions}
          history={tradeHistory}
          demoBalance={demoBalance}
          riskPercent={riskPercent}
          onSetRiskPercent={setRiskPercent}
          quickTradeEnabled={quickTradeEnabled}
          lastPrice={stats.lastPrice}
          bestBid={bestBid}
          bestAsk={bestAsk}
          selectedPair={selectedPair}
          onQuickTrade={handleQuickTrade}
          setActiveSheet={setMobileSheet}
          renderOrderForm={renderOrderForm}
          renderOrderBook={renderOrderBook}
          onClosePosition={handleClosePosition}
          onCloseAllPositions={handleCloseAllPositions}
          onSetBreakEven={handleSetBreakEven}
        />
      )}

      {/* 4. PANTALLA CRISTALINA GLASSMORPHISM PARA LA SECCIÓN EXCHANGE */}
      {activeSection === 'exchange' && (
        <TerminalExchangeModal
          isEs={isEs}
          onClose={() => setActiveSection('none')}
        />
      )}

      {/* 4. DRAWER MÓVIL (CUANDO EL HAMBURGUESA ESTÁ ABIERTO) */}
      {isMobileNavOpen && (
        <TerminalSideNav
          isEs={isEs}
          navPosition={navPosition}
          isMobileNavOpen={isMobileNavOpen}
          activeSection={activeSection}
          isTradingSidebarOpen={isTradingSidebarOpen}
          onToggleTradingSidebar={handleToggleTradingSidebar}
          onToggleNavPosition={toggleNavPosition}
          onSelectSection={(sec) => setActiveSection(sec === 'exchange' ? 'exchange' : 'none')}
          onCloseMobileNav={() => setIsMobileNavOpen(false)}
          onExit={onExit}
        />
      )}

      {/* 5. SISTEMA DE TOAST NOTIFICATIONS CON SONIDO (TP, SL, EJECUCIÓN) */}
      <TerminalToast
        toasts={toasts}
        onDismiss={dismissToast}
        isEs={isEs}
      />

    </div>
  );
};

export default TradingTerminal;
