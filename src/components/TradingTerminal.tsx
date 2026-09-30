import React, { useState, useEffect, useRef } from 'react';
import { init, dispose, Chart, DeepPartial, Styles } from 'klinecharts';
import { Language } from '../i18n/translations';
import { UserSession } from '../lib/supabase';
import { MarketStats, OrderBookPayload } from '../workers/marketData.worker';

import { 
  PositionItem, 
  DEFAULT_FAV_TIMEFRAMES, 
  DEFAULT_FAV_INDICATORS, 
  ALL_INDICATORS 
} from './terminal/types';
import { TerminalHeader } from './terminal/TerminalHeader';
import { TerminalToolbar } from './terminal/TerminalToolbar';
import { TerminalSideNav } from './terminal/TerminalSideNav';
import { TerminalOrderBook } from './terminal/TerminalOrderBook';
import { TerminalOrderForm } from './terminal/TerminalOrderForm';
import { TerminalPositions } from './terminal/TerminalPositions';
import { TerminalMobileSheet } from './terminal/TerminalMobileSheet';
import { TerminalExchangeModal } from './terminal/TerminalExchangeModal';
import { PositionChartOverlay } from './terminal/PositionChartOverlay';

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

  // Hoja activa en móvil: null (cerrada) o 'order' | 'book' | 'positions'
  const [mobileSheet, setMobileSheet] = useState<'order' | 'book' | 'positions' | null>(null);

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
        if (activeChart && payload.bars) {
          activeChart.applyNewData(payload.bars);
        }
      } else if (type === 'TICK_UPDATE') {
        if (activeChart && payload.bar) {
          activeChart.updateData(payload.bar);
        }
        if (payload.stats) {
          setStats(payload.stats);
          const currentP = payload.stats.lastPrice;

          setPositions((prevPositions) => {
            if (prevPositions.length === 0) return prevPositions;
            let balanceDelta = 0;
            const updatedPositions: PositionItem[] = [];

            for (const pos of prevPositions) {
              if (pos.symbol !== payload.stats.symbol) {
                updatedPositions.push(pos);
                continue;
              }
              const isLong = pos.side === 'LONG';

              // 1. Verificación Take Profit
              if (pos.tpPrice) {
                const hitTP = isLong ? currentP >= pos.tpPrice : currentP <= pos.tpPrice;
                if (hitTP) {
                  const pnlWin = Math.abs(pos.tpPrice - pos.entry) * pos.sizeUnits * pos.leverage;
                  balanceDelta += pnlWin;
                  setOrderSuccess(
                    isEs
                      ? `¡Take Profit alcanzado en ${pos.symbol}! (+${pnlWin.toFixed(2)} USDT)`
                      : `Take Profit hit on ${pos.symbol}! (+${pnlWin.toFixed(2)} USDT)`
                  );
                  continue; // Posición cerrada con ganancia
                }
              }

              // 2. Verificación Stop Loss
              if (pos.slPrice) {
                const hitSL = isLong ? currentP <= pos.slPrice : currentP >= pos.slPrice;
                if (hitSL) {
                  const pnlLoss = -Math.abs(pos.slPrice - pos.entry) * pos.sizeUnits * pos.leverage;
                  balanceDelta += pnlLoss;
                  setOrderSuccess(
                    isEs
                      ? `Stop Loss ejecutado en ${pos.symbol}. (${pnlLoss.toFixed(2)} USDT)`
                      : `Stop Loss triggered on ${pos.symbol}. (${pnlLoss.toFixed(2)} USDT)`
                  );
                  continue; // Posición cerrada con pérdida
                }
              }

              // 3. Actualización de PnL no realizado en vivo
              const priceDiff = isLong ? (currentP - pos.entry) : (pos.entry - currentP);
              const pnlUsdt = priceDiff * pos.sizeUnits * pos.leverage;
              const pnlPercentNum = pos.collateralUsdt > 0 ? (pnlUsdt / pos.collateralUsdt) * 100 : 0;
              const isProfit = pnlUsdt >= 0;

              updatedPositions.push({
                ...pos,
                mark: currentP,
                pnlUsdt,
                pnlPercentNum,
                pnl: `${isProfit ? '+' : ''}${pnlUsdt.toFixed(2)} USDT`,
                pnlPercent: `${isProfit ? '+' : ''}${pnlPercentNum.toFixed(2)}%`,
                isProfit
              });
            }

            if (balanceDelta !== 0) {
              setDemoBalance((prevB) => {
                const nextB = Number((prevB + balanceDelta).toFixed(2));
                try {
                  localStorage.setItem('zyti_demo_balance', nextB.toString());
                } catch {}
                return nextB;
              });
            }

            return updatedPositions;
          });
        }
      } else if (type === 'ORDERBOOK_UPDATE') {
        if (payload.bids && payload.asks) {
          setOrderBook(payload);
        }
      }
    };

    worker.postMessage({
      type: 'SUBSCRIBE',
      payload: { symbol: selectedPair, timeframe }
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

  // Handlers
  const handleSelectPair = (pair: string) => {
    setSelectedPair(pair);
    if (workerRef.current) {
      workerRef.current.postMessage({
        type: 'SUBSCRIBE',
        payload: { symbol: pair, timeframe }
      });
    }
  };

  const handleSelectTimeframe = (tf: string) => {
    setTimeframe(tf);
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

  const handleUpdatePositionSLTP = (id: number, slPrice?: number, tpPrice?: number) => {
    setPositions((prev) =>
      prev.map((pos) => {
        if (pos.id !== id) return pos;
        return {
          ...pos,
          slPrice: slPrice !== undefined ? slPrice : pos.slPrice,
          tpPrice: tpPrice !== undefined ? tpPrice : pos.tpPrice
        };
      })
    );
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const currentP = stats.lastPrice;
    const isLong = side === 'buy';

    const riskAmountUsd = (demoBalance * riskPercent) / 100;
    const effectiveAmountUsd = orderMode === 'risk'
      ? Math.max(10, Math.round(riskAmountUsd / (slPercent / 100)))
      : parseFloat(amount) || 1000;

    const sizeUnits = (effectiveAmountUsd * leverage) / currentP;
    const calculatedSlPrice = isLong
      ? Number((currentP * (1 - slPercent / 100)).toFixed(2))
      : Number((currentP * (1 + slPercent / 100)).toFixed(2));
    const calculatedTpPrice = isLong
      ? Number((currentP * (1 + tpPercent / 100)).toFixed(2))
      : Number((currentP * (1 - tpPercent / 100)).toFixed(2));

    const newPos: PositionItem = {
      id: Date.now(),
      symbol: selectedPair,
      side: isLong ? 'LONG' : 'SHORT',
      size: sizeUnits.toFixed(4) + ' ' + selectedPair.split('/')[0],
      sizeUnits,
      entry: currentP,
      mark: currentP,
      slPrice: calculatedSlPrice,
      tpPrice: calculatedTpPrice,
      riskPercent,
      slPercent,
      tpPercent,
      leverage,
      collateralUsdt: effectiveAmountUsd,
      pnlUsdt: 0,
      pnlPercentNum: 0,
      pnl: '$0.00 USDT',
      pnlPercent: '0.00%',
      isProfit: true
    };

    setPositions([newPos, ...positions]);
    setOrderSuccess(
      isEs
        ? `¡Orden ${isLong ? 'LONG' : 'SHORT'} ejecutada a $${currentP.toLocaleString()} con SL/TP!`
        : `Order ${isLong ? 'LONG' : 'SHORT'} executed at $${currentP.toLocaleString()} with SL/TP!`
    );
    setTimeout(() => setOrderSuccess(null), 3000);
  };

  const bestBid = orderBook.bids[0]?.price || Number((stats.lastPrice * 0.9998).toFixed(2));
  const bestAsk = orderBook.asks[0]?.price || Number((stats.lastPrice * 1.0002).toFixed(2));

  const handleQuickTrade = (quickSide: 'buy' | 'sell') => {
    // Comprar se ejecuta al Ask, Vender se ejecuta al Bid
    const currentP = quickSide === 'buy' ? bestAsk : bestBid;
    const isLong = quickSide === 'buy';
    const defaultAmount = 1000;
    const sizeUnits = (defaultAmount * leverage) / currentP;
    const calculatedSlPrice = isLong
      ? Number((currentP * (1 - slPercent / 100)).toFixed(2))
      : Number((currentP * (1 + slPercent / 100)).toFixed(2));
    const calculatedTpPrice = isLong
      ? Number((currentP * (1 + tpPercent / 100)).toFixed(2))
      : Number((currentP * (1 - tpPercent / 100)).toFixed(2));

    const newPos: PositionItem = {
      id: Date.now(),
      symbol: selectedPair,
      side: isLong ? 'LONG' : 'SHORT',
      size: sizeUnits.toFixed(4) + ' ' + selectedPair.split('/')[0],
      sizeUnits,
      entry: currentP,
      mark: currentP,
      slPrice: calculatedSlPrice,
      tpPrice: calculatedTpPrice,
      riskPercent,
      slPercent,
      tpPercent,
      leverage,
      collateralUsdt: defaultAmount,
      pnlUsdt: 0,
      pnlPercentNum: 0,
      pnl: '$0.00 USDT',
      pnlPercent: '0.00%',
      isProfit: true
    };

    setPositions([newPos, ...positions]);
    setOrderSuccess(
      isEs
        ? `¡Orden 1-Toque ${isLong ? 'COMPRA (Ask)' : 'VENTA (Bid)'} ejecutada a $${currentP.toLocaleString()}!`
        : `1-Tap ${isLong ? 'BUY (Ask)' : 'SELL (Bid)'} filled at $${currentP.toLocaleString()}!`
    );
    setTimeout(() => setOrderSuccess(null), 3000);
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
    <TerminalOrderBook orderBook={orderBook} />
  );

  return (
    <div className="h-screen w-screen bg-[#fbf9f4] text-slate-900 flex flex-col font-sans overflow-hidden select-none">
      
      {/* 1. TOP HEADER INSTITUCIONAL */}
      <TerminalHeader
        isEs={isEs}
        user={user}
        selectedPair={selectedPair}
        supportedPairs={SUPPORTED_PAIRS}
        stats={stats}
        isMobileNavOpen={isMobileNavOpen}
        unrealizedPnL={positions.reduce((acc, p) => acc + (p.pnlUsdt ?? 0), 0)}
        positionsCount={positions.length}
        activeSection={activeSection}
        onSelectSection={(sec) => setActiveSection(sec === 'exchange' ? 'exchange' : 'none')}
        onSelectPair={handleSelectPair}
        onToggleMobileNav={() => setIsMobileNavOpen(!isMobileNavOpen)}
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

            {/* OVERLAY INTERACTIVO: ENTRADA, TAKE PROFIT (VERDE) Y STOP LOSS (ROJO) ARRASTRABLES */}
            <PositionChartOverlay
              chart={chartInstanceRef.current}
              position={positions.find((p) => p.symbol === selectedPair) || null}
              currentPrice={stats.lastPrice}
              isEs={isEs}
              onUpdatePositionSLTP={handleUpdatePositionSLTP}
              onClosePosition={(id) => setPositions(positions.filter((p) => p.id !== id))}
            />
          </div>

          {/* DESKTOP: TABLA INFERIOR DE POSICIONES ABIERTAS (h-36) */}
          <TerminalPositions
            isEs={isEs}
            positions={positions}
            onClosePosition={(id) => setPositions(positions.filter((p) => p.id !== id))}
          />

        </div>

        {/* DESKTOP (>= 1024px): PANEL LATERAL ESTRECHO (280px) */}
        <div className="terminal-desktop-sidebar no-scrollbar">
          {renderOrderBook()}
          {renderOrderForm()}
        </div>

        {/* NAVEGACIÓN LATERAL EN ESCRITORIO (DERECHA) */}
        {navPosition === 'right' && (
          <TerminalSideNav
            isEs={isEs}
            navPosition={navPosition}
            isMobileNavOpen={isMobileNavOpen}
            activeSection={activeSection}
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
          quickTradeEnabled={quickTradeEnabled}
          lastPrice={stats.lastPrice}
          bestBid={bestBid}
          bestAsk={bestAsk}
          selectedPair={selectedPair}
          onQuickTrade={handleQuickTrade}
          setActiveSheet={setMobileSheet}
          renderOrderForm={renderOrderForm}
          renderOrderBook={renderOrderBook}
          onClosePosition={(id) => setPositions(positions.filter((p) => p.id !== id))}
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
          onToggleNavPosition={toggleNavPosition}
          onSelectSection={(sec) => setActiveSection(sec === 'exchange' ? 'exchange' : 'none')}
          onCloseMobileNav={() => setIsMobileNavOpen(false)}
          onExit={onExit}
        />
      )}

    </div>
  );
};

export default TradingTerminal;
