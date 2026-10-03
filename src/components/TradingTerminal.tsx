import React, { useState, useEffect, useRef, useCallback } from 'react';
import { init, dispose, Chart, DeepPartial, Styles } from 'klinecharts';
import { Language } from '../i18n/translations';
import { supabase, UserSession, PropFirmAccount, fetchTraderAccounts } from '../lib/supabase';
import { MarketStats, OrderBookPayload } from '../workers/marketData.worker';
import { MarketType, AdapterConnectionStatus } from '../core/market-feed/types';

import { 
  DEFAULT_FAV_TIMEFRAMES, 
  DEFAULT_FAV_INDICATORS, 
  ALL_INDICATORS,
  ClosedTradeItem,
  sortTimeframes
} from './terminal/types';
import { 
  TradingEngine, 
  RiskEngine,
  DEFAULT_PROP_FIRM_RULES,
  PropFirmRuleConfig,
  PositionItem, 
  LimitOrderItem,
  OrderRequest, 
  AccountMetrics,
  generateTradeId,
  TradePersistenceService,
  zytiTradingClient
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
import { SlidersHorizontal, X, AlertTriangle, RotateCcw } from 'lucide-react';

interface TradingTerminalProps {
  currentLang: Language;
  user: UserSession | null;
  initialSymbol?: string;
  onExit: () => void;
  onOpenAuth?: () => void;
  onLanguageChange?: (lang: Language) => void;
  onUpdateUser?: (updated: UserSession) => void;
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

const getStoredDailyStartEquity = (currentBalance: number): number => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const saved = localStorage.getItem('zyti_daily_start_equity');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.date === today && typeof parsed.equity === 'number' && parsed.equity > 0) {
        if (parsed.equity < 50000 && currentBalance >= 100000) {
          localStorage.setItem('zyti_daily_start_equity', JSON.stringify({ date: today, equity: currentBalance }));
          return currentBalance;
        }
        return parsed.equity;
      }
    }
    localStorage.setItem('zyti_daily_start_equity', JSON.stringify({ date: today, equity: currentBalance }));
    return currentBalance;
  } catch {
    return currentBalance;
  }
};

export const TradingTerminal: React.FC<TradingTerminalProps> = ({
  currentLang,
  user,
  initialSymbol,
  onExit,
  onOpenAuth,
  onLanguageChange,
  onUpdateUser
}) => {
  const isEs = currentLang === 'es';
  const normalizePair = (sym?: string): string => {
    if (!sym) return 'BTC/USDT';
    const clean = sym.replace('/', '').toUpperCase();
    const found = SUPPORTED_PAIRS.find(p => p.replace('/', '').toUpperCase() === clean);
    return found || 'BTC/USDT';
  };

  const [selectedPair, setSelectedPair] = useState(() => normalizePair(initialSymbol));
  const selectedPairRef = useRef<string>(selectedPair);
  selectedPairRef.current = selectedPair;

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
  const [timeframe, setTimeframe] = useState<string>(() => {
    try {
      return localStorage.getItem('zyti_selected_timeframe') || '15m';
    } catch {
      return '15m';
    }
  });
  const [activeIndicators, setActiveIndicators] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('zyti_active_indicators');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return ['MA', 'VOL'];
  });
  const activeIndicatorsRef = useRef<string[]>(activeIndicators);
  activeIndicatorsRef.current = activeIndicators;
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

  // Hoja activa en móvil: null (cerrada) o 'order' | 'book' | 'positions' | 'history' | 'profile'
  const [mobileSheet, setMobileSheet] = useState<'order' | 'book' | 'positions' | 'history' | 'profile' | null>(null);

  // Favoritos de temporalidades e indicadores con persistencia
  const [favoriteTimeframes, setFavoriteTimeframes] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('zyti_fav_timeframes');
      return sortTimeframes(saved ? JSON.parse(saved) : DEFAULT_FAV_TIMEFRAMES);
    } catch {
      return sortTimeframes(DEFAULT_FAV_TIMEFRAMES);
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

  // Posiciones abiertas con persistencia Local-First (0ms al recargar el navegador)
  const [positions, setPositions] = useState<PositionItem[]>(() => {
    try {
      const saved = localStorage.getItem('zyti_open_positions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const positionsRef = useRef<PositionItem[]>(positions);
  positionsRef.current = positions;

  useEffect(() => {
    try {
      localStorage.setItem('zyti_open_positions', JSON.stringify(positions));
    } catch {}
  }, [positions]);

  // Órdenes Límites pendientes con persistencia en localStorage
  const [limitOrders, setLimitOrders] = useState<LimitOrderItem[]>(() => {
    try {
      const saved = localStorage.getItem('zyti_limit_orders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const limitOrdersRef = useRef<LimitOrderItem[]>(limitOrders);
  limitOrdersRef.current = limitOrders;

  useEffect(() => {
    try {
      localStorage.setItem('zyti_limit_orders', JSON.stringify(limitOrders));
    } catch {}
  }, [limitOrders]);

  // Precio límite configurado en el formulario
  const [limitPrice, setLimitPrice] = useState<string>('');
  const lastInitializedPairRef = useRef<string>('');

  useEffect(() => {
    if (stats.lastPrice > 0) {
      if (!limitPrice || lastInitializedPairRef.current !== selectedPair) {
        lastInitializedPairRef.current = selectedPair;
        setLimitPrice(stats.lastPrice.toString());
      }
    }
  }, [selectedPair, stats.lastPrice, limitPrice]);

  // Registro de IDs cerrados para evitar duplicación de eventos o toasts
  const closedPositionIdsRef = useRef<Set<string>>(new Set());

  // Registro de IDs de órdenes límites ejecutadas para evitar ejecuciones concurrentes por ticks
  const filledLimitOrderIdsRef = useRef<Set<string>>(new Set());

  // Seguro contra clics múltiples rápidos en colocación de órdenes
  const isSubmittingOrderRef = useRef<boolean>(false);

  // Cuenta de fondeo oficial activa (100K)
  const [activeAccountId, setActiveAccountId] = useState<string | undefined>(() => {
    return user?.activeAccountId || user?.accounts?.[0]?.id || localStorage.getItem('zyti_active_account_id') || undefined;
  });

  // Asegurar resolución de la cuenta oficial del usuario autenticado
  useEffect(() => {
    if (user?.activeAccountId) {
      setActiveAccountId(user.activeAccountId);
      try { localStorage.setItem('zyti_active_account_id', user.activeAccountId); } catch {}
    } else if (user?.accounts && user.accounts.length > 0) {
      setActiveAccountId(user.accounts[0].id);
      try { localStorage.setItem('zyti_active_account_id', user.accounts[0].id); } catch {}
    } else if (user?.email) {
      fetchTraderAccounts(user.email).then((accs) => {
        if (accs.length > 0) {
          setActiveAccountId(accs[0].id);
          try { localStorage.setItem('zyti_active_account_id', accs[0].id); } catch {}
        }
      });
    }
  }, [user]);

  // Historial de operaciones cerradas con persistencia local y sincronización con Supabase
  const [tradeHistory, setTradeHistory] = useState<ClosedTradeItem[]>(() => {
    try {
      const saved = localStorage.getItem('zyti_trade_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Reconciliar y cargar historial y posiciones abiertas desde Supabase (Cold Sync)
  useEffect(() => {
    const targetId = activeAccountId || user?.activeAccountId || user?.accounts?.[0]?.id;
    if (targetId || user?.id || user?.email) {
      // 1. Cargar historial de trades cerrados
      TradePersistenceService.fetchAccountTradesHistory(targetId, user?.id, user?.email).then((dbHistory) => {
        if (dbHistory && dbHistory.length > 0) {
          setTradeHistory(dbHistory);
          try { localStorage.setItem('zyti_trade_history', JSON.stringify(dbHistory)); } catch {}
        }
      }).catch(() => {});

      // 2. Reconciliación en frío de posiciones abiertas desde la base de datos
      TradePersistenceService.fetchOpenPositions(targetId, user?.id, user?.email).then((dbPositions) => {
        if (dbPositions && dbPositions.length > 0) {
          setPositions((prev) => {
            const map = new Map<string, PositionItem>();
            dbPositions.forEach((p) => map.set(p.id, p));
            prev.forEach((p) => {
              if (map.has(p.id)) {
                map.set(p.id, {
                  ...map.get(p.id)!,
                  mark: p.mark,
                  pnlUsdt: p.pnlUsdt,
                  pnl: p.pnl,
                  pnlPercent: p.pnlPercent,
                  pnlPercentNum: p.pnlPercentNum,
                  isProfit: p.isProfit
                });
              }
            });
            const merged = Array.from(map.values());
            positionsRef.current = merged;
            try { localStorage.setItem('zyti_open_positions', JSON.stringify(merged)); } catch {}
            return merged;
          });
        }
      }).catch(() => {});

      // 3. Reconciliación en frío del Balance General de la cuenta desde Supabase
      const identifier = targetId || user?.id || user?.email;
      if (identifier) {
        fetchTraderAccounts(identifier).then((accounts) => {
          if (accounts && accounts.length > 0) {
            const activeAcc = (targetId ? accounts.find((a) => a.id === targetId) : null) || accounts[0];
            if (activeAcc && typeof activeAcc.currentBalance === 'number' && !isNaN(activeAcc.currentBalance) && activeAcc.currentBalance > 0) {
              setDemoBalance(activeAcc.currentBalance);
              demoBalanceRef.current = activeAcc.currentBalance;
              try { localStorage.setItem('zyti_demo_balance', activeAcc.currentBalance.toString()); } catch {}
            }
          }
        }).catch(() => {});
      }
    }
  }, [activeAccountId, user]);

  // Sincronización Multi-Dispositivo en Tiempo Real (PC <-> Móvil <-> Tablet) vía Supabase Realtime
  // Zero-Egress: Solo transmite ~200 bytes ante un evento real de apertura/cierre de ESTA cuenta.
  useEffect(() => {
    const targetAccountId = activeAccountId || user?.activeAccountId || user?.accounts?.[0]?.id;
    if (!targetAccountId) return;

    const channel = supabase
      .channel(`sync_trades_${targetAccountId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'account_trades',
          filter: `account_id=eq.${targetAccountId}`
        },
        (payload: any) => {
          if (payload.eventType === 'INSERT') {
            const row = payload.new;
            if (row && row.status === 'OPEN') {
              setPositions((prev) => {
                if (prev.some((p) => p.id === row.id)) return prev;
                const entry = Number(row.entry_price) || 1;
                const sizeUnits = Number(row.size) || 0;
                const leverage = Number(row.leverage) || 10;
                const newPos: PositionItem = {
                  id: row.id,
                  userId: row.user_id,
                  symbol: row.symbol,
                  exchange: row.exchange || 'binance',
                  side: (row.side as 'LONG' | 'SHORT') || 'LONG',
                  orderType: 'market',
                  status: 'OPEN',
                  size: `${sizeUnits.toFixed(4)} ${row.symbol.split('/')[0] || ''}`.trim(),
                  sizeUnits,
                  entry,
                  entryTimestamp: new Date(row.opened_at).getTime(),
                  mark: entry,
                  slPrice: row.sl_price ? Number(row.sl_price) : null,
                  tpPrice: row.tp_price ? Number(row.tp_price) : null,
                  leverage,
                  collateralUsdt: (sizeUnits * entry) / leverage,
                  pnlUsdt: 0,
                  pnlPercentNum: 0,
                  pnl: '$0.00',
                  pnlPercent: '0.00%',
                  isProfit: true,
                  createdAt: row.opened_at
                };
                playOrderFilledSound();
                return [newPos, ...prev];
              });
            }
          } else if (payload.eventType === 'UPDATE') {
            const row = payload.new;
            if (row && row.status === 'CLOSED') {
              // Posición liquidada o cerrada en otro dispositivo (ej: desde el ordenador)
              setPositions((prev) => prev.filter((p) => p.id !== row.id));
              closedPositionIdsRef.current.add(row.id);

              // Actualizar saldo de inmediato si el payload incluye el PnL realizado
              if (typeof row.realized_pnl !== 'undefined' && row.realized_pnl !== null) {
                const pnlDelta = Number(row.realized_pnl) || 0;
                setDemoBalance((prev) => {
                  const nextBal = Number((prev + pnlDelta).toFixed(2));
                  try { localStorage.setItem('zyti_demo_balance', nextBal.toString()); } catch {}
                  return nextBal;
                });
              }

              // Recargar historial para que aparezca de inmediato en la pestaña de historial del tablet/móvil
              TradePersistenceService.fetchAccountTradesHistory(targetAccountId, user?.id, user?.email).then((dbHist) => {
                if (dbHist && dbHist.length > 0) {
                  setTradeHistory(dbHist);
                  try { localStorage.setItem('zyti_trade_history', JSON.stringify(dbHist)); } catch {}
                }
              });
            } else if (row && row.status === 'OPEN') {
              // Actualización de SL o TP arrastrado desde otro dispositivo
              setPositions((prev) =>
                prev.map((p) =>
                  p.id === row.id
                    ? {
                        ...p,
                        slPrice: row.sl_price ? Number(row.sl_price) : null,
                        tpPrice: row.tp_price ? Number(row.tp_price) : null
                      }
                    : p
                )
              );
            }
          } else if (payload.eventType === 'DELETE') {
            // Se ejecutó una purga/reset desde otro dispositivo
            setPositions([]);
            setTradeHistory([]);
            setDemoBalance(100000);
            try { localStorage.removeItem('zyti_open_positions'); } catch {}
            try { localStorage.removeItem('zyti_trade_history'); } catch {}
            try { localStorage.setItem('zyti_demo_balance', '100000'); } catch {}
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'trading_accounts',
          filter: `id=eq.${targetAccountId}`
        },
        (payload: any) => {
          const row = payload.new;
          if (row && typeof row.current_balance !== 'undefined') {
            const newBal = Number(row.current_balance);
            if (!isNaN(newBal) && newBal > 0) {
              setDemoBalance(newBal);
              try { localStorage.setItem('zyti_demo_balance', newBal.toString()); } catch {}
            }
            if (row.status === 'BREACHED') {
              setIsAccountBreached(true);
              isBreachedRef.current = true;
              setBreachReason(row.breach_reason || (isEs ? 'Infracción de reglas de riesgo' : 'Risk rules breached'));
            } else if (row.status === 'ACTIVE') {
              setIsAccountBreached(false);
              isBreachedRef.current = false;
              setBreachReason('');
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeAccountId, user, isEs]);

  // Sincronización instantánea inter-pestañas en la misma máquina (Zero-Egress total a 0ms)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.BroadcastChannel) return;
    const targetAccountId = activeAccountId || user?.activeAccountId || user?.accounts?.[0]?.id;
    if (!targetAccountId) return;

    const bc = new BroadcastChannel('zyti_trading_sync');
    bc.onmessage = (event) => {
      const msg = event.data;
      if (!msg || msg.accountId !== targetAccountId) return;
      if (msg.type === 'BALANCE_SYNC' && typeof msg.balance === 'number') {
        setDemoBalance(msg.balance);
        try { localStorage.setItem('zyti_demo_balance', msg.balance.toString()); } catch {}
      } else if (msg.type === 'RESET_SYNC') {
        setDemoBalance(100000);
        setPositions([]);
        setTradeHistory([]);
        try { localStorage.removeItem('zyti_open_positions'); } catch {}
        try { localStorage.removeItem('zyti_trade_history'); } catch {}
        try { localStorage.setItem('zyti_demo_balance', '100000'); } catch {}
      }
    };

    return () => {
      bc.close();
    };
  }, [activeAccountId, user]);

  // Sincronización Institucional mediante ZYTI Trading WebSocket Gateway (Redis Pub/Sub)
  useEffect(() => {
    const targetAccountId = activeAccountId || user?.activeAccountId || user?.accounts?.[0]?.id;
    if (!targetAccountId) return;

    zytiTradingClient.connect(targetAccountId);

    const unsubscribe = zytiTradingClient.onEvent((event) => {
      switch (event.type) {
        case 'TRADE_OPENED': {
          const pos = event.payload;
          if (pos && pos.id) {
            setPositions((prev) => {
              if (prev.some((p) => p.id === pos.id)) return prev;
              playOrderFilledSound();
              return [pos, ...prev];
            });
          }
          break;
        }
        case 'TRADE_CLOSED': {
          const { id, newBalance: remoteBal } = event.payload || {};
          if (id) {
            setPositions((prev) => prev.filter((p) => p.id !== id));
            closedPositionIdsRef.current.add(id);
          }
          if (typeof remoteBal === 'number') {
            setDemoBalance(remoteBal);
            try { localStorage.setItem('zyti_demo_balance', remoteBal.toString()); } catch {}
          }
          TradePersistenceService.fetchAccountTradesHistory(targetAccountId, user?.id, user?.email).then((dbHist) => {
            if (dbHist && dbHist.length > 0) {
              setTradeHistory(dbHist);
              try { localStorage.setItem('zyti_trade_history', JSON.stringify(dbHist)); } catch {}
            }
          });
          break;
        }
        case 'SL_TP_UPDATED': {
          const { id, slPrice, tpPrice } = event.payload || {};
          if (id) {
            setPositions((prev) => {
              const next = prev.map((p) => (p.id === id ? { ...p, slPrice, tpPrice } : p));
              positionsRef.current = next;
              try { localStorage.setItem('zyti_open_positions', JSON.stringify(next)); } catch {}
              return next;
            });
          }
          break;
        }
        case 'BALANCE_UPDATED': {
          const { balance } = event.payload || {};
          if (typeof balance === 'number') {
            setDemoBalance(balance);
            demoBalanceRef.current = balance;
            try { localStorage.setItem('zyti_demo_balance', balance.toString()); } catch {}
          }
          break;
        }
        case 'LIMIT_ORDER_PLACED': {
          const { order } = event.payload || {};
          if (order && order.id) {
            setLimitOrders((prev) => {
              if (prev.some((o) => o.id === order.id)) return prev;
              const next = [order, ...prev];
              limitOrdersRef.current = next;
              try { localStorage.setItem('zyti_limit_orders', JSON.stringify(next)); } catch {}
              return next;
            });
            playOrderFilledSound();
          }
          break;
        }
        case 'LIMIT_ORDER_CANCELLED': {
          const { orderId } = event.payload || {};
          if (orderId) {
            setLimitOrders((prev) => {
              const next = prev.filter((o) => o.id !== orderId);
              limitOrdersRef.current = next;
              try { localStorage.setItem('zyti_limit_orders', JSON.stringify(next)); } catch {}
              return next;
            });
          }
          break;
        }
        case 'ALL_LIMIT_ORDERS_CANCELLED': {
          setLimitOrders([]);
          limitOrdersRef.current = [];
          try { localStorage.removeItem('zyti_limit_orders'); } catch {}
          break;
        }
        case 'LIMIT_ORDER_UPDATED': {
          const { orderId, newLimitPrice, newSlPrice, newTpPrice } = event.payload || {};
          if (orderId) {
            setLimitOrders((prev) => {
              const next = TradingEngine.updateLimitOrder(prev, orderId, newLimitPrice, newSlPrice, newTpPrice);
              limitOrdersRef.current = next;
              try { localStorage.setItem('zyti_limit_orders', JSON.stringify(next)); } catch {}
              return next;
            });
          }
          break;
        }
        case 'ACCOUNT_RESET': {
          setPositions([]);
          setTradeHistory([]);
          setDemoBalance(100000);
          try { localStorage.removeItem('zyti_open_positions'); } catch {}
          try { localStorage.removeItem('zyti_trade_history'); } catch {}
          try { localStorage.setItem('zyti_demo_balance', '100000'); } catch {}
          break;
        }
        case 'DRAWDOWN_BREACH': {
          setIsAccountBreached(true);
          isBreachedRef.current = true;
          setBreachReason(event.payload?.reason || (isEs ? 'Infracción de reglas de riesgo' : 'Risk rules breached'));
          break;
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [activeAccountId, user, isEs]);

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
      createdAt?: string;
      openedAt?: string;
      leverage?: number;
    },
    reason: 'TP' | 'SL' | 'MANUAL' | 'LIQUIDATION_BREACH',
    newBalance?: number
  ) => {
    const isProfit = item.pnlUsdt >= 0;
    const nowIso = new Date().toISOString();
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
      openedAt: item.createdAt || item.openedAt || nowIso,
      closedAt: nowIso,
      leverage: item.leverage || 10,
      closeReason: reason
    };

    setTradeHistory((prev) => {
      const updated = [record, ...prev.filter((p) => p.id !== item.id)].slice(0, 100);
      try { localStorage.setItem('zyti_trade_history', JSON.stringify(updated)); } catch {}
      return updated;
    });

    // Write-Behind Queue: persistir cierre asíncronamente en Supabase y sincronizar balance de la cuenta
    const targetAccountId = activeAccountId || user?.activeAccountId || user?.accounts?.[0]?.id;
    if (newBalance !== undefined) {
      try {
        const bc = new BroadcastChannel('zyti_trading_sync');
        bc.postMessage({ type: 'BALANCE_SYNC', balance: newBalance, accountId: targetAccountId });
        bc.close();
      } catch {}
    }

    // Difundir al WebSocket Gateway / Redis
    zytiTradingClient.publishEvent({
      type: 'TRADE_CLOSED',
      payload: { id: item.id, realizedPnl: item.pnlUsdt, newBalance }
    });

    if (newBalance !== undefined) {
      zytiTradingClient.publishEvent({
        type: 'BALANCE_UPDATED',
        payload: { balance: newBalance }
      });
    }

    TradePersistenceService.persistClosedTrade({
      tradeId: item.id,
      accountId: targetAccountId,
      userId: user?.id,
      traderEmail: user?.email,
      exitPrice: item.mark,
      realizedPnl: Number(item.pnlUsdt.toFixed(2)),
      closeReason: reason,
      closedAt: nowIso,
      newBalance
    }).catch(() => {});
  }, [activeAccountId, user]);

  const recordClosedTradeRef = useRef(recordClosedTrade);
  recordClosedTradeRef.current = recordClosedTrade;

  // Saldo de cuenta Demo y gestión de riesgo en % (Estandarizado a 100K para usuarios logueados y no logueados)
  const [demoBalance, setDemoBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('zyti_demo_balance');
      // Si es un usuario invitado que tenía un balance previo inferior o antiguo, migrarlo a 100K
      if (!saved || saved === '10000' || saved === '1000' || saved === '5000' || saved === '15000' || saved === '25000' || saved === '50000' || saved === '200000') {
        localStorage.setItem('zyti_demo_balance', '100000');
        return 100000;
      }
      return Number(saved) || 100000;
    } catch {
      return 100000;
    }
  });
  const demoBalanceRef = useRef(demoBalance);
  demoBalanceRef.current = demoBalance;

  const [riskPercent, setRiskPercent] = useState<number>(1);
  const [slPercent, setSlPercent] = useState<number>(2);
  const [tpPercent, setTpPercent] = useState<number>(4);
  const [orderMode, setOrderMode] = useState<'amount' | 'risk'>('amount');

  // Control de visibilidad y minimizado de paneles con persistencia en localStorage
  const [isTradingSidebarOpen, setIsTradingSidebarOpen] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('zyti_trading_sidebar_open');
      return saved !== null ? saved !== 'false' : true;
    } catch {
      return true;
    }
  });

  const [showOrderForm, setShowOrderForm] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('zyti_show_orderform');
      return saved !== null ? saved !== 'false' : true;
    } catch {
      return true;
    }
  });

  const [showOrderBook, setShowOrderBook] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('zyti_show_orderbook');
      return saved !== null ? saved !== 'false' : true;
    } catch {
      return true;
    }
  });

  const [showPositions, setShowPositions] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('zyti_show_positions');
      return saved !== null ? saved !== 'false' : true;
    } catch {
      return true;
    }
  });

  const [isOrderFormMinimized, setIsOrderFormMinimized] = useState<boolean>(false);
  const [isOrderBookMinimized, setIsOrderBookMinimized] = useState<boolean>(false);

  const isOrderFormClosed = !showOrderForm;
  const isOrderBookClosed = !showOrderBook;

  const handleToggleTradingSidebar = useCallback(() => {
    setIsTradingSidebarOpen((prev) => {
      const next = !prev;
      try { localStorage.setItem('zyti_trading_sidebar_open', String(next)); } catch {}
      setTimeout(() => chartInstanceRef.current?.resize(), 60);
      return next;
    });
  }, []);

  const handleOpenTradingPanel = useCallback(() => {
    setIsTradingSidebarOpen(true);
    setShowOrderForm(true);
    setIsOrderFormMinimized(false);
    try {
      localStorage.setItem('zyti_trading_sidebar_open', 'true');
      localStorage.setItem('zyti_show_orderform', 'true');
    } catch {}
    setTimeout(() => chartInstanceRef.current?.resize(), 60);
  }, []);

  const handleToggleOrderForm = useCallback(() => {
    setShowOrderForm((prev) => {
      const next = !prev;
      try { localStorage.setItem('zyti_show_orderform', String(next)); } catch {}
      setTimeout(() => chartInstanceRef.current?.resize(), 60);
      return next;
    });
  }, []);

  const handleToggleOrderBook = useCallback(() => {
    setShowOrderBook((prev) => {
      const next = !prev;
      try { localStorage.setItem('zyti_show_orderbook', String(next)); } catch {}
      setTimeout(() => chartInstanceRef.current?.resize(), 60);
      return next;
    });
  }, []);

  const handleTogglePositions = useCallback(() => {
    setShowPositions((prev) => {
      const next = !prev;
      try { localStorage.setItem('zyti_show_positions', String(next)); } catch {}
      setTimeout(() => chartInstanceRef.current?.resize(), 60);
      return next;
    });
  }, []);

  // Centinela de Drawdown en vivo y Gobernanza de Riesgo para Prop Firm
  const propFirmRulesRef = useRef<PropFirmRuleConfig>(DEFAULT_PROP_FIRM_RULES);
  const dailyStartEquityRef = useRef<number>(getStoredDailyStartEquity(demoBalance));
  const [isAccountBreached, setIsAccountBreached] = useState<boolean>(false);
  const [breachReason, setBreachReason] = useState<string>('');
  const isBreachedRef = useRef<boolean>(false);
  isBreachedRef.current = isAccountBreached;

  // Menú contextual flotante de clic derecho en el gráfico
  const [chartContextMenu, setChartContextMenu] = useState<{
    x: number;
    y: number;
    price: number;
  } | null>(null);

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

  // Escuchar clics fuera y tecla Escape para cerrar el menú contextual del gráfico
  useEffect(() => {
    const handleDismiss = () => setChartContextMenu(null);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setChartContextMenu(null);
    };
    window.addEventListener('click', handleDismiss);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('click', handleDismiss);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Liquidación de Emergencia ante infracción de Drawdown de Prop Firm
  const handleEmergencyLiquidation = useCallback((reason: string) => {
    const currentPositions = positionsRef.current;
    let totalRealized = 0;
    currentPositions.forEach((pos) => {
      totalRealized += (pos.pnlUsdt ?? 0);
    });

    const nextB = Number((demoBalanceRef.current + totalRealized).toFixed(2));
    currentPositions.forEach((pos) => {
      closedPositionIdsRef.current.add(pos.id);
      recordClosedTradeRef.current(pos, 'LIQUIDATION_BREACH', nextB);
    });

    positionsRef.current = [];
    setPositions([]);

    limitOrdersRef.current = [];
    setLimitOrders([]);
    try { localStorage.removeItem('zyti_limit_orders'); } catch {}

    setDemoBalance(() => {
      try { localStorage.setItem('zyti_demo_balance', nextB.toString()); } catch {}
      return nextB;
    });

    addToastRef.current({
      type: 'sl',
      title: isEs ? '¡Límite de Riesgo Prop Firm Superado!' : 'Prop Firm Risk Breach!',
      message: reason,
      pnlUsdt: totalRealized
    });
  }, [isEs]);

  const handleEmergencyLiquidationRef = useRef(handleEmergencyLiquidation);
  handleEmergencyLiquidationRef.current = handleEmergencyLiquidation;

  // Verificación reactiva en cada tick del límite de pérdida diaria y total (5% DD diario / 10% total)
  const checkLiveRiskAndDrawdown = useCallback((livePositions: PositionItem[], currentBalanceVal: number) => {
    if (isBreachedRef.current) return;
    const metrics = TradingEngine.calculateAccountMetrics(
      currentBalanceVal,
      livePositions,
      limitOrdersRef.current
    );
    const status = RiskEngine.checkPropFirmStatus(
      metrics,
      dailyStartEquityRef.current,
      propFirmRulesRef.current
    );
    if (status.breached && !isBreachedRef.current) {
      isBreachedRef.current = true;
      setIsAccountBreached(true);
      setBreachReason(status.reason || (isEs ? 'Límite máximo de Drawdown superado' : 'Maximum Drawdown limit breached'));
      handleEmergencyLiquidationRef.current(status.reason || 'Drawdown limit reached');
    }
  }, [isEs]);

  const checkLiveRiskAndDrawdownRef = useRef(checkLiveRiskAndDrawdown);
  checkLiveRiskAndDrawdownRef.current = checkLiveRiskAndDrawdown;

  // Colocación inmediata de orden pendiente desde el menú contextual de clic derecho en el gráfico
  const handlePlacePendingOrderFromChart = (orderSide: 'buy' | 'sell', targetPrice: number) => {
    setChartContextMenu(null);
    if (!user) {
      onOpenAuth?.();
      return;
    }
    if (isAccountBreached) {
      addToast({
        type: 'warning',
        title: isEs ? 'Operativa Bloqueada' : 'Trading Blocked',
        message: isEs
          ? 'Cuenta en infracción de Drawdown de la Prop Firm. Restablece la cuenta para continuar.'
          : 'Account in Drawdown breach. Reset account to continue.'
      });
      return;
    }

    const orderReq: OrderRequest = {
      symbol: selectedPair,
      exchange: currentExchange,
      marketType: currentMarketType,
      side: orderSide,
      orderType: 'limit',
      orderMode: 'amount',
      amountUsdt: parseFloat(amount) || 1000,
      riskPercent,
      slPercent,
      tpPercent,
      leverage
    };

    const currentMetrics = TradingEngine.calculateAccountMetrics(demoBalance, positionsRef.current, limitOrdersRef.current);
    const result = TradingEngine.createLimitOrder(
      orderReq,
      targetPrice,
      stats.lastPrice,
      currentMetrics
    );

    if (!result.success || !result.limitOrder) {
      addToast({
        type: 'warning',
        title: isEs ? 'Error al crear orden' : 'Order Creation Error',
        message: result.error || 'Error'
      });
      return;
    }

    limitOrdersRef.current = [result.limitOrder!, ...limitOrdersRef.current];
    setLimitOrders(limitOrdersRef.current);
    try {
      localStorage.setItem('zyti_limit_orders', JSON.stringify(limitOrdersRef.current));
    } catch {}

    // Difundir orden límite por WebSocket Gateway a todos los dispositivos
    zytiTradingClient.publishEvent({
      type: 'LIMIT_ORDER_PLACED',
      payload: { order: result.limitOrder }
    });

    playOrderFilledSound();
    const isBuy = orderSide === 'buy';
    const subtype = result.limitOrder.orderSubtype || (isBuy ? (targetPrice <= stats.lastPrice ? 'LIMIT' : 'STOP') : (targetPrice >= stats.lastPrice ? 'LIMIT' : 'STOP'));
    const orderLabel = `${isBuy ? 'Buy' : 'Sell'} ${subtype === 'LIMIT' ? 'Limit' : 'Stop'}`;

    addToast({
      type: isBuy ? 'buy' : 'sell',
      title: isEs ? `¡Orden ${orderLabel} Colocada!` : `${orderLabel} Order Placed!`,
      message: `${orderLabel.toUpperCase()} • ${result.limitOrder.size} @ $${targetPrice.toLocaleString()}`,
      symbol: selectedPair,
      price: targetPrice
    });

    setOrderSuccess(
      isEs
        ? `¡Orden ${orderLabel} colocada a $${targetPrice.toLocaleString()}!`
        : `${orderLabel} order placed at $${targetPrice.toLocaleString()}!`
    );
    setTimeout(() => setOrderSuccess(null), 3000);
  };

  // Función reutilizable para montar o restaurar los indicadores técnicos activos en KLineChart
  const applyIndicatorsToChart = useCallback((chart: Chart, indicators: string[]) => {
    if (!chart) return;
    const hasOhlc = indicators.includes('OHLC');
    chart.setStyles({
      candle: {
        tooltip: {
          showRule: (hasOhlc ? 'always' : 'none') as any,
          text: { size: 9, color: '#475569' }
        }
      }
    });

    indicators.forEach((name) => {
      if (name === 'OHLC') return;
      const indOption = ALL_INDICATORS.find((i) => i.name === name);
      if (!indOption) return;
      const targetPane = indOption.paneId || (indOption.category === 'main' ? 'candle_pane' : `pane_${name.toLowerCase()}`);
      try {
        chart.createIndicator(name, false, { id: targetPane });
      } catch (_) {}
    });
  }, []);

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

    // Restaurar los indicadores guardados en el navegador por el usuario
    applyIndicatorsToChart(chart, activeIndicatorsRef.current || ['MA', 'VOL']);

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
          // Descartar si las barras pertenecen a un par que ya no es el seleccionado en el chart
          if (payload.symbol && payload.symbol !== selectedPairRef.current) {
            return;
          }
          const precision = (payload.symbol || '').includes('XRP') ? 4 : 2;
          activeChart.setPriceVolumePrecision(precision, 4);
          activeChart.clearData();
          activeChart.applyNewData(payload.bars, false);
          activeChart.scrollToRealTime();

          // Restaurar indicadores técnicos activos sobre el nuevo lienzo
          applyIndicatorsToChart(activeChart, activeIndicatorsRef.current || ['MA', 'VOL']);
        }
      } else if (type === 'TICK_UPDATE') {
        // 1. Alimentar el gráfico y las estadísticas SOLO si el tick pertenece al par activo del canvas
        const isCurrentPair = payload.symbol === selectedPairRef.current;
        if (isCurrentPair) {
          if (activeChart && payload.bar) {
            activeChart.updateData(payload.bar);
          }
          if (payload.stats && payload.stats.lastPrice > 0 && !isNaN(payload.stats.lastPrice)) {
            setStats(payload.stats);
          }
        }

        const tickSymbol = payload.stats?.symbol || payload.symbol;
        const tickExchange = payload.exchange || payload.stats?.exchange;
        const currentP = payload.stats?.lastPrice || payload.bar?.close;

        // 2. Evaluar posiciones abiertas para este símbolo (continúa en vivo aunque el usuario esté en otro par)
        if (!payload.isInitialBars && currentP > 0 && tickSymbol) {
          const currentPositions = positionsRef.current;
          if (currentPositions.some((p) => p.symbol === tickSymbol)) {
            const evaluation = TradingEngine.evaluatePositionsOnTick(
              currentPositions,
              currentP,
              tickSymbol,
              tickExchange
            );

            // Actualizar posiciones sincrónicamente en la referencia y en el estado
            positionsRef.current = evaluation.updatedPositions;
            setPositions(evaluation.updatedPositions);
            checkLiveRiskAndDrawdownRef.current(evaluation.updatedPositions, demoBalanceRef.current);

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
            const nextB = evaluation.balanceDelta !== 0 ? Number((demoBalanceRef.current + evaluation.balanceDelta).toFixed(2)) : undefined;
            evaluation.events.forEach((evt) => {
              if (closedPositionIdsRef.current.has(evt.position.id)) return;
              closedPositionIdsRef.current.add(evt.position.id);

              // Registrar en Historial y sincronizar en Supabase
              recordClosedTradeRef.current(evt.position, evt.type === 'TP_HIT' ? 'TP' : 'SL', nextB);

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

          // 3. Evaluación de Órdenes Límite pendientes para este símbolo
          const currentLimits = limitOrdersRef.current.filter(
            (o) => o.symbol === tickSymbol && o.status === 'PENDING' && !filledLimitOrderIdsRef.current.has(o.id)
          );
          if (currentLimits.length > 0) {
            const limitEval = TradingEngine.evaluateLimitOrdersOnTick(
              currentLimits,
              currentP,
              tickSymbol,
              tickExchange
            );

              if (limitEval.filledOrders.length > 0) {
                // Registrar inmediatamente los IDs ejecutados para prevenir cualquier ejecución duplicada por ticks concurrentes
                limitEval.filledOrders.forEach((filled) => {
                  filledLimitOrderIdsRef.current.add(filled.id);
                });

                // Actualizar inmediatamente y de forma síncrona las referencias mutables antes del próximo mensaje de WebSocket
                limitOrdersRef.current = limitEval.remainingOrders;
                positionsRef.current = [...limitEval.newlyOpenedPositions, ...positionsRef.current];

                try {
                  localStorage.setItem('zyti_limit_orders', JSON.stringify(limitEval.remainingOrders));
                } catch {}

                setLimitOrders(limitEval.remainingOrders);
                setPositions((prev) => [...limitEval.newlyOpenedPositions, ...prev]);
                playOrderFilledSound();

                // Persistir órdenes límites ejecutadas como posiciones en Supabase
                limitEval.newlyOpenedPositions.forEach((pos) => {
                  const targetAccountId = activeAccountId || user?.activeAccountId || user?.accounts?.[0]?.id;
                  TradePersistenceService.persistOpenedTrade({
                    id: pos.id,
                    accountId: targetAccountId,
                    userId: user?.id,
                    traderEmail: user?.email,
                    exchange: pos.exchange || currentExchange,
                    symbol: pos.symbol,
                    side: pos.side,
                    size: pos.sizeUnits,
                    leverage: pos.leverage,
                    entryPrice: pos.entry,
                    slPrice: pos.slPrice,
                    tpPrice: pos.tpPrice,
                    openedAt: pos.createdAt
                  }).catch(() => {});
                });

                limitEval.filledOrders.forEach((filled) => {
                  const isBuy = filled.side === 'buy';
                  const subtype = filled.orderSubtype || (isBuy ? (filled.limitPrice <= filled.placedAtPrice ? 'LIMIT' : 'STOP') : (filled.limitPrice >= filled.placedAtPrice ? 'LIMIT' : 'STOP'));
                  const orderLabel = `${isBuy ? 'Buy' : 'Sell'} ${subtype === 'LIMIT' ? 'Limit' : 'Stop'}`;
                  addToastRef.current({
                    type: isBuy ? 'buy' : 'sell',
                    title: isEs ? `¡Orden ${orderLabel} Ejecutada!` : `${orderLabel} Filled!`,
                    message: `${orderLabel.toUpperCase()} • ${filled.size} (${filled.leverage}x)`,
                    symbol: filled.symbol,
                    price: filled.limitPrice
                  });
                  setOrderSuccess(
                    isEs
                      ? `¡Orden ${orderLabel} ejecutada a $${filled.limitPrice.toLocaleString()}!`
                      : `${orderLabel} order filled at $${filled.limitPrice.toLocaleString()}!`
                  );
                  setTimeout(() => setOrderSuccess(null), 3500);
                });
              }
            }
          }
        } else if (type === 'TICKER') {
        if (payload.stats && payload.stats.lastPrice > 0 && !isNaN(payload.stats.lastPrice)) {
          if (payload.stats.symbol === selectedPairRef.current) {
            setStats(payload.stats);
          }
          const currentP = payload.stats.lastPrice;
          const currentPositions = positionsRef.current;
          if (currentPositions.length > 0) {
            const tickSymbol = payload.stats?.symbol || payload.symbol;
            const tickExchange = payload.exchange || payload.stats?.exchange;
            const evaluation = TradingEngine.evaluatePositionsOnTick(
              currentPositions,
              currentP,
              tickSymbol,
              tickExchange
            );
            positionsRef.current = evaluation.updatedPositions;
            setPositions(evaluation.updatedPositions);
            checkLiveRiskAndDrawdownRef.current(evaluation.updatedPositions, demoBalanceRef.current);
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
            const nextB = evaluation.balanceDelta !== 0 ? Number((demoBalanceRef.current + evaluation.balanceDelta).toFixed(2)) : undefined;
            evaluation.events.forEach((evt) => {
              if (closedPositionIdsRef.current.has(evt.position.id)) return;
              closedPositionIdsRef.current.add(evt.position.id);

              recordClosedTradeRef.current(evt.position, evt.type === 'TP_HIT' ? 'TP' : 'SL', nextB);

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

          // Evaluación de Órdenes Límite pendientes en TICKER
          const currentLimitsTicker = limitOrdersRef.current.filter(
            (o) => o.status === 'PENDING' && !filledLimitOrderIdsRef.current.has(o.id)
          );
          if (currentLimitsTicker.length > 0) {
            const tickSymbol = payload.stats?.symbol || payload.symbol;
            const tickExchange = payload.exchange || payload.stats?.exchange;
            const limitEval = TradingEngine.evaluateLimitOrdersOnTick(
              currentLimitsTicker,
              currentP,
              tickSymbol,
              tickExchange
            );

            if (limitEval.filledOrders.length > 0) {
              // Registrar inmediatamente los IDs ejecutados para prevenir cualquier ejecución duplicada por ticks concurrentes
              limitEval.filledOrders.forEach((filled) => {
                filledLimitOrderIdsRef.current.add(filled.id);
              });

              // Actualizar inmediatamente y de forma síncrona las referencias mutables antes del próximo mensaje de WebSocket
              limitOrdersRef.current = limitEval.remainingOrders;
              positionsRef.current = [...limitEval.newlyOpenedPositions, ...positionsRef.current];

              try {
                localStorage.setItem('zyti_limit_orders', JSON.stringify(limitEval.remainingOrders));
              } catch {}

              setLimitOrders(limitEval.remainingOrders);
              setPositions((prev) => [...limitEval.newlyOpenedPositions, ...prev]);
              playOrderFilledSound();

              // Persistir órdenes límites ejecutadas como posiciones en Supabase
              limitEval.newlyOpenedPositions.forEach((pos) => {
                const targetAccountId = activeAccountId || user?.activeAccountId || user?.accounts?.[0]?.id;
                TradePersistenceService.persistOpenedTrade({
                  id: pos.id,
                  accountId: targetAccountId,
                  userId: user?.id,
                  traderEmail: user?.email,
                  exchange: pos.exchange || currentExchange,
                  symbol: pos.symbol,
                  side: pos.side,
                  size: pos.sizeUnits,
                  leverage: pos.leverage,
                  entryPrice: pos.entry,
                  slPrice: pos.slPrice,
                  tpPrice: pos.tpPrice,
                  openedAt: pos.createdAt
                }).catch(() => {});
              });

              limitEval.filledOrders.forEach((filled) => {
                const isBuy = filled.side === 'buy';
                const subtype = filled.orderSubtype || (isBuy ? (filled.limitPrice <= filled.placedAtPrice ? 'LIMIT' : 'STOP') : (filled.limitPrice >= filled.placedAtPrice ? 'LIMIT' : 'STOP'));
                const orderLabel = `${isBuy ? 'Buy' : 'Sell'} ${subtype === 'LIMIT' ? 'Limit' : 'Stop'}`;
                addToastRef.current({
                  type: isBuy ? 'buy' : 'sell',
                  title: isEs ? `¡Orden ${orderLabel} Ejecutada!` : `${orderLabel} Filled!`,
                  message: `${orderLabel.toUpperCase()} • ${filled.size} (${filled.leverage}x)`,
                  symbol: filled.symbol,
                  price: filled.limitPrice
                });
                setOrderSuccess(
                  isEs
                    ? `¡Orden ${orderLabel} ejecutada a $${filled.limitPrice.toLocaleString()}!`
                    : `${orderLabel} order filled at $${filled.limitPrice.toLocaleString()}!`
                );
                setTimeout(() => setOrderSuccess(null), 3500);
              });
            }
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
    selectedPairRef.current = pair;
    // Limpiar gráfico de inmediato para que la escala del par previo no quede anclada en el eje
    if (chartInstanceRef.current) {
      chartInstanceRef.current.clearData();
    }
    // Sincronizar URL dinámica para compartir y SEO (/es/zytiterminal/BTCUSDT)
    const cleanPair = pair.replace('/', '').toUpperCase();
    const targetPath = `/${currentLang}/zytiterminal/${cleanPair}`;
    if (typeof window !== 'undefined' && window.location.pathname.toLowerCase() !== targetPath.toLowerCase()) {
      window.history.replaceState({ view: 'terminal', symbol: cleanPair }, '', targetPath);
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
    if (typeof document !== 'undefined') {
      const p = estPrice || stats.lastPrice;
      const formattedPrice = p >= 1
        ? p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : p.toFixed(4);
      document.title = `${formattedPrice} | ${pair} • ZYTI Trade`;
      const ogUrl = document.querySelector('meta[property="og:url"]');
      if (ogUrl) ogUrl.setAttribute('content', `https://zytitrade.com${targetPath}`);
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', `${pair} • ZYTI Trade Terminal`);
    }
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
      // Sincronizar de inmediato las posiciones abiertas para que el worker mantenga ambos streams vivos
      const activeSymbols = Array.from(
        new Set([
          ...positionsRef.current.map((p) => p.symbol),
          ...limitOrdersRef.current.filter((o) => o.status === 'PENDING').map((o) => o.symbol)
        ])
      );
      workerRef.current.postMessage({
        type: 'SYNC_TRACKED_SYMBOLS',
        payload: { symbols: activeSymbols }
      });
    }
  };

  // Sincronizar en segundo plano los símbolos de posiciones y órdenes límites activas con el worker
  // para que sus marcas de precio y PnL sigan actualizándose en vivo aunque el usuario navegue a otros pares
  useEffect(() => {
    if (!workerRef.current) return;
    const activeSymbols = Array.from(
      new Set([
        ...positions.map((p) => p.symbol),
        ...limitOrders.filter((o) => o.status === 'PENDING').map((o) => o.symbol)
      ])
    );
    workerRef.current.postMessage({
      type: 'SYNC_TRACKED_SYMBOLS',
      payload: { symbols: activeSymbols }
    });
  }, [positions, limitOrders]);

  useEffect(() => {
    if (initialSymbol) {
      const match = normalizePair(initialSymbol);
      if (match && match !== selectedPair) {
        handleSelectPair(match);
      }
    }
  }, [initialSymbol]);

  // ── Pestaña del navegador: precio en vivo en tiempo real vía WebSocket (sin conexiones adicionales, reusando el feed del chart)
  useEffect(() => {
    if (typeof document !== 'undefined' && stats.lastPrice > 0) {
      const formattedPrice = stats.lastPrice >= 1
        ? stats.lastPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : stats.lastPrice.toFixed(4);
      document.title = `${formattedPrice} | ${selectedPair} • ZYTI Trade`;
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.title = 'ZYTI Trade | Institutional Trading OS & Multi-Exchange Terminal';
      }
    };
  }, [stats.lastPrice, selectedPair]);

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
    try {
      localStorage.setItem('zyti_selected_timeframe', tf);
    } catch {}
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
      const next = willBeActive ? [...activeIndicators, 'OHLC'] : activeIndicators.filter((i) => i !== 'OHLC');
      setActiveIndicators(next);
      try {
        localStorage.setItem('zyti_active_indicators', JSON.stringify(next));
      } catch {}
      return;
    }

    const indOption = ALL_INDICATORS.find((i) => i.name === name);
    const targetPane = indOption?.paneId || (indOption?.category === 'main' ? 'candle_pane' : `pane_${name.toLowerCase()}`);

    if (activeIndicators.includes(name)) {
      chart.removeIndicator(targetPane, name);
      const next = activeIndicators.filter((i) => i !== name);
      setActiveIndicators(next);
      try {
        localStorage.setItem('zyti_active_indicators', JSON.stringify(next));
      } catch {}
    } else {
      chart.createIndicator(name, false, { id: targetPane });
      const next = [...activeIndicators, name];
      setActiveIndicators(next);
      try {
        localStorage.setItem('zyti_active_indicators', JSON.stringify(next));
      } catch {}
    }
  };

  const toggleFavoriteTimeframe = (tf: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavoriteTimeframes((prev) => {
      const next = prev.includes(tf) ? prev.filter((item) => item !== tf) : [...prev, tf];
      const sorted = sortTimeframes(next);
      try {
        localStorage.setItem('zyti_fav_timeframes', JSON.stringify(sorted));
      } catch {}
      return sorted;
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

  // Métricas de cuenta centralizadas por el TradingEngine (incluyendo margen comprometido en órdenes pendientes)
  const accountMetrics = TradingEngine.calculateAccountMetrics(demoBalance, positions, limitOrders);

  const handleUpdatePositionSLTP = (id: string, slPrice?: number | null, tpPrice?: number | null) => {
    const target = positionsRef.current.find((p) => p.id === id);
    if (!target) return;

    const slChanged = slPrice !== undefined && (
      (slPrice === null && target.slPrice !== null && target.slPrice !== undefined) ||
      (slPrice !== null && (target.slPrice === null || target.slPrice === undefined || Math.abs(slPrice - target.slPrice) >= 0.02))
    );
    const tpChanged = tpPrice !== undefined && (
      (tpPrice === null && target.tpPrice !== null && target.tpPrice !== undefined) ||
      (tpPrice !== null && (target.tpPrice === null || target.tpPrice === undefined || Math.abs(tpPrice - target.tpPrice) >= 0.02))
    );

    if (!slChanged && !tpChanged) {
      return;
    }

    setPositions((prev) => {
      const next = TradingEngine.updatePositionSLTP(prev, id, slPrice, tpPrice);
      positionsRef.current = next;
      try { localStorage.setItem('zyti_open_positions', JSON.stringify(next)); } catch {}
      return next;
    });

    // 1. Difundir modificación de SL/TP a otros dispositivos vía WebSocket Gateway
    zytiTradingClient.publishEvent({
      type: 'SL_TP_UPDATED',
      payload: { id, slPrice, tpPrice }
    });

    // 2. Persistir en Base de Datos Supabase (Write-Behind) para que no se pierda al recargar
    TradePersistenceService.updateTradeSLTP(id, slPrice, tpPrice);

    if (slPrice !== undefined) {
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

    // Posición en ganancia o equilibrio: fijar SL en el precio de entrada delegando a handleUpdatePositionSLTP.
    // Esto difunde el evento por WebSocket a todos los dispositivos, actualiza la base de datos Supabase y persiste en caché local.
    handleUpdatePositionSLTP(pos.id, pos.entry, pos.tpPrice ?? null);
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

    const nextB = Number((demoBalanceRef.current + realizedPnL).toFixed(2));
    // Registrar en Historial de operaciones cerradas y sincronizar Supabase
    recordClosedTrade(closedPosition, 'MANUAL', nextB);

    setPositions(remainingPositions);
    setDemoBalance(() => {
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
      totalRealizedPnL += (pos.pnlUsdt ?? 0);
    });

    const nextB = Number((demoBalanceRef.current + totalRealizedPnL).toFixed(2));
    currentPositions.forEach((pos) => {
      closedPositionIdsRef.current.add(pos.id);
      recordClosedTrade(pos, 'MANUAL', nextB);
    });

    setPositions([]);
    setDemoBalance(() => {
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

  // Resetear el saldo demo al valor inicial de $100,000, eliminar historial local y purgar Supabase
  const resetDemoBalance = () => {
    // 1. Limpieza de posiciones y órdenes en memoria RAM
    closedPositionIdsRef.current.clear();
    filledLimitOrderIdsRef.current.clear();
    setPositions([]);
    positionsRef.current = [];
    setLimitOrders([]);
    limitOrdersRef.current = [];

    // 2. Limpieza radical de LocalStorage e historial de trades
    try { localStorage.removeItem('zyti_limit_orders'); } catch {}
    try { localStorage.removeItem('zyti_trade_history'); } catch {}
    try { localStorage.removeItem('zyti_open_positions'); } catch {}
    setTradeHistory([]);

    // 3. Restauración de Saldo y Métricas a 100K
    setDemoBalance(100000);
    try { localStorage.setItem('zyti_demo_balance', '100000'); } catch {}

    // 4. Resetear centinela de Drawdown y nuevo baseline diario a 100K
    const today = new Date().toISOString().split('T')[0];
    dailyStartEquityRef.current = 100000;
    try { localStorage.setItem('zyti_daily_start_equity', JSON.stringify({ date: today, equity: 100000 })); } catch {}
    isBreachedRef.current = false;
    setIsAccountBreached(false);
    setBreachReason('');

    // 5. Purgar historial forense en la nube (Supabase) para la cuenta activa y difundir por Broadcast
    const targetAccountId = activeAccountId || user?.activeAccountId || user?.accounts?.[0]?.id;
    try {
      const bc = new BroadcastChannel('zyti_trading_sync');
      bc.postMessage({ type: 'RESET_SYNC', accountId: targetAccountId });
      bc.close();
    } catch {}
    TradePersistenceService.purgeAccountTrades(targetAccountId, user?.id, user?.email).catch(() => {});

    // 6. Toast de confirmación institucional
    addToast({
      type: 'info',
      title: isEs ? '¡Cuenta e Historial Restablecidos!' : 'Account & History Cleared!',
      message: isEs
        ? 'Saldo restablecido a $100,000.00 USDT y todo el historial de trades fue purgado de la base de datos y memoria local.'
        : 'Balance reset to $100,000.00 USDT and all trade history was purged from cloud database and local storage.'
    });
  };

  const handleSelectAccount = useCallback((account: PropFirmAccount | null) => {
    if (account) {
      setActiveAccountId(account.id);
      closedPositionIdsRef.current.clear();
      filledLimitOrderIdsRef.current.clear();
      setPositions([]);
      positionsRef.current = [];
      setLimitOrders([]);
      limitOrdersRef.current = [];
      try { localStorage.removeItem('zyti_limit_orders'); } catch {}
      setDemoBalance(account.initialBalance);
      try { localStorage.setItem('zyti_demo_balance', account.initialBalance.toString()); } catch {}
      if (account.rulesConfig) {
        propFirmRulesRef.current = {
          id: account.id,
          firmName: account.firmName,
          initialBalance: account.initialBalance,
          maxDailyLossPercent: account.rulesConfig.maxDailyDrawdownPct ?? 5,
          maxTotalDrawdownPercent: account.rulesConfig.maxTotalDrawdownPct ?? 10,
          maxLeverage: account.rulesConfig.maxLeverage ?? 100
        };
      }
      dailyStartEquityRef.current = account.initialBalance;
      setIsAccountBreached(false);
      isBreachedRef.current = false;
      addToast({
        type: 'info',
        title: isEs ? 'Cuenta de Fondeo Vinculada' : 'Prop Firm Account Linked',
        message: `${account.firmName} • ${account.accountNumber}`
      });
    } else {
      setActiveAccountId(undefined);
      resetDemoBalance();
      propFirmRulesRef.current = DEFAULT_PROP_FIRM_RULES;
      addToast({
        type: 'info',
        title: isEs ? 'Simulador Demo ZYTI' : 'ZYTI Demo Simulator',
        message: isEs ? 'Operando en simulación libre' : 'Trading in free simulation'
      });
    }
  }, [isEs, addToast]);

  // Cancelar orden límite individual
  const handleCancelLimitOrder = useCallback((orderId: string) => {
    const { remainingOrders } = TradingEngine.cancelLimitOrder(limitOrdersRef.current, orderId);
    limitOrdersRef.current = remainingOrders;
    setLimitOrders(remainingOrders);
    try { localStorage.setItem('zyti_limit_orders', JSON.stringify(remainingOrders)); } catch {}

    // Difundir cancelación por WebSocket Gateway a todos los dispositivos
    zytiTradingClient.publishEvent({
      type: 'LIMIT_ORDER_CANCELLED',
      payload: { orderId }
    });

    addToast({
      type: 'info',
      title: isEs ? 'Orden Límite Cancelada' : 'Limit Order Cancelled',
      message: isEs ? 'La orden pendiente fue cancelada y se liberó su margen.' : 'Pending limit order cancelled and margin unlocked.'
    });
  }, [isEs, addToast]);

  // Cancelar todas las órdenes límites pendientes
  const handleCancelAllLimitOrders = useCallback(() => {
    const count = limitOrdersRef.current.length;
    if (count === 0) return;
    limitOrdersRef.current = [];
    setLimitOrders([]);
    try { localStorage.removeItem('zyti_limit_orders'); } catch {}

    // Difundir cancelación masiva por WebSocket Gateway a todos los dispositivos
    zytiTradingClient.publishEvent({
      type: 'ALL_LIMIT_ORDERS_CANCELLED',
      payload: {}
    });

    addToast({
      type: 'info',
      title: isEs ? 'Órdenes Límites Canceladas' : 'All Limit Orders Cancelled',
      message: isEs ? `Se cancelaron ${count} órdenes pendientes y se liberó el margen.` : `${count} pending limit orders cancelled.`
    });
  }, [isEs, addToast]);

  // Modificar orden límite pendiente de forma interactiva (arrastrar en gráfico o editar en tabla)
  const handleUpdateLimitOrder = useCallback((
    orderId: string,
    newLimitPrice?: number,
    newSlPrice?: number | null,
    newTpPrice?: number | null
  ) => {
    const existing = limitOrdersRef.current.find((o) => o.id === orderId);
    if (!existing) return;

    const priceChanged = newLimitPrice !== undefined && Math.abs(newLimitPrice - existing.limitPrice) >= 0.02;
    const slChanged = newSlPrice !== undefined && (
      (newSlPrice === null && existing.slPrice !== null && existing.slPrice !== undefined) ||
      (newSlPrice !== null && (existing.slPrice === null || existing.slPrice === undefined || Math.abs(newSlPrice - existing.slPrice) >= 0.02))
    );
    const tpChanged = newTpPrice !== undefined && (
      (newTpPrice === null && existing.tpPrice !== null && existing.tpPrice !== undefined) ||
      (newTpPrice !== null && (existing.tpPrice === null || existing.tpPrice === undefined || Math.abs(newTpPrice - existing.tpPrice) >= 0.02))
    );

    if (!priceChanged && !slChanged && !tpChanged) {
      return;
    }

    const updated = TradingEngine.updateLimitOrder(
      limitOrdersRef.current,
      orderId,
      newLimitPrice,
      newSlPrice,
      newTpPrice,
      stats.lastPrice
    );
    limitOrdersRef.current = updated;
    setLimitOrders(updated);
    try {
      localStorage.setItem('zyti_limit_orders', JSON.stringify(updated));
    } catch {}

    // Difundir actualización por WebSocket Gateway a todos los dispositivos
    zytiTradingClient.publishEvent({
      type: 'LIMIT_ORDER_UPDATED',
      payload: { orderId, newLimitPrice, newSlPrice, newTpPrice }
    });

    const ord = updated.find((o) => o.id === orderId);
    if (ord) {
      addToast({
        type: 'info',
        title: isEs ? 'Orden Límite Modificada' : 'Limit Order Updated',
        message: `${ord.side.toUpperCase()} • ${ord.size} @ $${(newLimitPrice ?? ord.limitPrice).toLocaleString()}`,
        symbol: ord.symbol,
        price: newLimitPrice ?? ord.limitPrice
      });
    }
  }, [stats.lastPrice, isEs, addToast]);

  // Arrastre interactivo de la línea de entrada preview (modo Limit) en el gráfico
  const handleUpdatePreviewEntry = useCallback((newPrice: number) => {
    if (newPrice > 0 && !isNaN(newPrice)) {
      setLimitPrice(newPrice.toFixed(2));
    }
  }, []);

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth?.();
      return;
    }
    if (isAccountBreached) {
      addToast({
        type: 'warning',
        title: isEs ? 'Operativa Bloqueada' : 'Trading Blocked',
        message: isEs
          ? 'Has alcanzado el límite de Drawdown de la Prop Firm. Restablece la cuenta para continuar.'
          : 'You reached the Prop Firm Drawdown limit. Reset account to continue.'
      });
      return;
    }
    if (isSubmittingOrderRef.current) return;
    isSubmittingOrderRef.current = true;
    setTimeout(() => { isSubmittingOrderRef.current = false; }, 600);

    const entryTs = (() => {
      const d = chartInstanceRef.current?.getDataList();
      return d && d.length > 0 ? d[d.length - 1].timestamp : Math.floor(Date.now() / 60000) * 60000;
    })();

    if (orderType === 'limit') {
      const limitP = parseFloat(limitPrice);
      if (!limitP || isNaN(limitP) || limitP <= 0) {
        setOrderSuccess(isEs ? 'Introduce un precio límite válido' : 'Enter a valid limit price');
        setTimeout(() => setOrderSuccess(null), 3000);
        return;
      }

      const orderReq: OrderRequest = {
        symbol: selectedPair,
        exchange: currentExchange,
        marketType: currentMarketType,
        side,
        orderType: 'limit',
        orderMode,
        amountUsdt: parseFloat(amount) || 1000,
        riskPercent,
        slPercent,
        tpPercent,
        leverage
      };

      const result = TradingEngine.createLimitOrder(
        orderReq,
        limitP,
        stats.lastPrice,
        accountMetrics
      );

      if (!result.success || !result.limitOrder) {
        setOrderSuccess(result.error || (isEs ? 'Error al crear orden límite' : 'Limit order error'));
        setTimeout(() => setOrderSuccess(null), 4000);
        return;
      }

      limitOrdersRef.current = [result.limitOrder!, ...limitOrdersRef.current];
      setLimitOrders(limitOrdersRef.current);
      try {
        localStorage.setItem('zyti_limit_orders', JSON.stringify(limitOrdersRef.current));
      } catch {}

      // Difundir orden límite por WebSocket Gateway a todos los dispositivos
      zytiTradingClient.publishEvent({
        type: 'LIMIT_ORDER_PLACED',
        payload: { order: result.limitOrder }
      });

      playOrderFilledSound();
      const isBuy = side === 'buy';
      const subtype = result.limitOrder.orderSubtype || (isBuy ? (limitP <= stats.lastPrice ? 'LIMIT' : 'STOP') : (limitP >= stats.lastPrice ? 'LIMIT' : 'STOP'));
      const orderLabel = `${isBuy ? 'Buy' : 'Sell'} ${subtype === 'LIMIT' ? 'Limit' : 'Stop'}`;
      addToast({
        type: isBuy ? 'buy' : 'sell',
        title: isEs ? `¡Orden ${orderLabel} Colocada!` : `${orderLabel} Order Placed!`,
        message: `${orderLabel.toUpperCase()} • ${result.limitOrder.size} @ $${limitP.toLocaleString()}`,
        symbol: selectedPair,
        price: limitP
      });

      setOrderSuccess(
        isEs
          ? `¡Orden ${orderLabel} colocada a $${limitP.toLocaleString()}!`
          : `${orderLabel} order placed at $${limitP.toLocaleString()}!`
      );
      setTimeout(() => setOrderSuccess(null), 3000);
      return;
    }

    const orderReq: OrderRequest = {
      symbol: selectedPair,
      exchange: currentExchange,
      marketType: currentMarketType,
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

    // Persistir orden abierta asíncronamente en public.account_trades
    const targetAccountId = activeAccountId || user?.activeAccountId || user?.accounts?.[0]?.id;
    if (result.position) {
      // Difundir al WebSocket Gateway / Redis para sync multi-dispositivo instantáneo
      zytiTradingClient.publishEvent({
        type: 'TRADE_OPENED',
        payload: result.position
      });

      TradePersistenceService.persistOpenedTrade({
        id: result.position.id,
        accountId: targetAccountId,
        userId: user?.id,
        traderEmail: user?.email,
        exchange: currentExchange,
        symbol: result.position.symbol,
        side: result.position.side,
        size: result.position.sizeUnits,
        leverage: result.position.leverage,
        entryPrice: result.position.entry,
        slPrice: result.position.slPrice,
        tpPrice: result.position.tpPrice,
        openedAt: result.position.createdAt
      }).catch(() => {});
    }

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
    if (!user) {
      onOpenAuth?.();
      return;
    }
    if (isAccountBreached) {
      addToast({
        type: 'warning',
        title: isEs ? 'Operativa Bloqueada' : 'Trading Blocked',
        message: isEs
          ? 'Has alcanzado el límite de Drawdown de la Prop Firm. Restablece la cuenta para continuar.'
          : 'You reached the Prop Firm Drawdown limit. Reset account to continue.'
      });
      return;
    }

    // Comprar se ejecuta al Ask, Vender se ejecuta al Bid
    const currentP = quickSide === 'buy' ? bestAsk : bestBid;
    const entryTs = (() => {
      const d = chartInstanceRef.current?.getDataList();
      return d && d.length > 0 ? d[d.length - 1].timestamp : Math.floor(Date.now() / 60000) * 60000;
    })();

    const defaultAmount = Math.min(1000, accountMetrics.availableBalance > 10 ? accountMetrics.availableBalance : 1000);

    const orderReq: OrderRequest = {
      symbol: selectedPair,
      exchange: currentExchange,
      marketType: currentMarketType,
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

      // Persistir orden rápida abierta asíncronamente en public.account_trades
      const targetAccId = activeAccountId || user?.activeAccountId || user?.accounts?.[0]?.id;
      if (result.position) {
        // Difundir al WebSocket Gateway / Redis para sync multi-dispositivo instantáneo
        zytiTradingClient.publishEvent({
          type: 'TRADE_OPENED',
          payload: result.position
        });

        TradePersistenceService.persistOpenedTrade({
          id: result.position.id,
          accountId: targetAccId,
          userId: user?.id,
          traderEmail: user?.email,
          exchange: currentExchange,
          symbol: result.position.symbol,
          side: result.position.side,
          size: result.position.sizeUnits,
          leverage: result.position.leverage,
          entryPrice: result.position.entry,
          slPrice: result.position.slPrice,
          tpPrice: result.position.tpPrice,
          openedAt: result.position.createdAt
        }).catch(() => {});
      }
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

  // Al hacer clic sobre cualquier posición en la lista, cambiar de inmediato al par y exchange que se está operando
  const handleSelectPositionItem = useCallback((pos: PositionItem) => {
    if (pos.symbol && pos.symbol !== selectedPair) {
      handleSelectPair(pos.symbol);
    }
    if (pos.exchange && pos.exchange !== currentExchange) {
      handleSelectExchange(pos.exchange);
    }
    if (pos.marketType && pos.marketType !== currentMarketType) {
      handleSelectMarketType(pos.marketType as MarketType);
    }
    setMobileSheet(null);
  }, [selectedPair, currentExchange, currentMarketType, handleSelectPair, handleSelectExchange, handleSelectMarketType]);

  const handleSelectOrderType = useCallback((type: 'market' | 'limit') => {
    setOrderType(type);
    if (type === 'limit' && stats.lastPrice > 0) {
      setLimitPrice(stats.lastPrice.toString());
    }
  }, [stats.lastPrice]);

  // Al hacer clic sobre cualquier orden límite en la lista, cambiar de inmediato al par, exchange y cargar en panel
  const handleSelectLimitOrderItem = useCallback((ord: LimitOrderItem) => {
    if (ord.symbol && ord.symbol !== selectedPair) {
      handleSelectPair(ord.symbol);
    }
    if (ord.exchange && ord.exchange !== currentExchange) {
      handleSelectExchange(ord.exchange);
    }
    if (ord.marketType && ord.marketType !== currentMarketType) {
      handleSelectMarketType(ord.marketType as MarketType);
    }
    setOrderType('limit');
    setSide(ord.side);
    setLimitPrice(ord.limitPrice.toString());
    if (ord.slPercent) setSlPercent(ord.slPercent);
    if (ord.tpPercent) setTpPercent(ord.tpPercent);
    if (ord.leverage) setLeverage(ord.leverage);
    setIsTradingSidebarOpen(true);
    setShowOrderForm(true);
    setIsOrderFormMinimized(false);
    setMobileSheet(null);
  }, [selectedPair, currentExchange, currentMarketType, handleSelectPair, handleSelectExchange, handleSelectMarketType]);

  const renderOrderForm = () => (
    <TerminalOrderForm
      isEs={isEs}
      selectedPair={selectedPair}
      currentPrice={stats.lastPrice}
      demoBalance={demoBalance}
      side={side}
      orderType={orderType}
      limitPrice={limitPrice}
      setLimitPrice={setLimitPrice}
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
        setShowOrderForm(false);
        try { localStorage.setItem('zyti_show_orderform', 'false'); } catch {}
        setTimeout(() => chartInstanceRef.current?.resize(), 60);
      }}
      onToggleQuickTrade={toggleQuickTrade}
      setSide={setSide}
      setOrderType={handleSelectOrderType}
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
        setShowOrderBook(false);
        try { localStorage.setItem('zyti_show_orderbook', 'false'); } catch {}
        setTimeout(() => chartInstanceRef.current?.resize(), 60);
      }}
    />
  );

  // Cálculos de configuración previa de trading para proyectar en el gráfico
  const isPreviewLong = side === 'buy';
  const effectiveRefPrice = (orderType === 'limit' && parseFloat(limitPrice) > 0)
    ? parseFloat(limitPrice)
    : stats.lastPrice;

  const previewSlPrice = isPreviewLong
    ? Number((effectiveRefPrice * (1 - slPercent / 100)).toFixed(2))
    : Number((effectiveRefPrice * (1 + slPercent / 100)).toFixed(2));
  const previewTpPrice = isPreviewLong
    ? Number((effectiveRefPrice * (1 + tpPercent / 100)).toFixed(2))
    : Number((effectiveRefPrice * (1 - tpPercent / 100)).toFixed(2));

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
        activeAccountId={activeAccountId}
        onSelectExchange={handleSelectExchange}
        onSelectMarketType={handleSelectMarketType}
        onSelectPair={handleSelectPair}
        onSelectBalanceAmount={handleSelectBalanceAmount}
        onSelectAccount={handleSelectAccount}
        onSelectSection={(sec) => setActiveSection(sec === 'exchange' ? 'exchange' : 'none')}
        onToggleMobileNav={() => setIsMobileNavOpen(!isMobileNavOpen)}
        onResetBalance={resetDemoBalance}
        onExit={onExit}
        onOpenAuth={onOpenAuth}
      />

      {/* 2. ÁREA PRINCIPAL: NAVEGACIÓN + GRÁFICO CENTRAL + PANEL LATERAL */}
      <div className="terminal-main-layout flex-1 overflow-hidden relative">
        
        {/* NAVEGACIÓN LATERAL EN ESCRITORIO (IZQUIERDA) */}
        {navPosition === 'left' && (
          <TerminalSideNav
            isEs={isEs}
            currentLang={currentLang}
            onLanguageChange={onLanguageChange}
            onUpdateUser={onUpdateUser}
            quickTradeEnabled={quickTradeEnabled}
            onToggleQuickTrade={toggleQuickTrade}
            navPosition={navPosition}
            isMobileNavOpen={isMobileNavOpen}
            activeSection={activeSection}
            user={user}
            isTradingSidebarOpen={isTradingSidebarOpen}
            showOrderForm={showOrderForm}
            showOrderBook={showOrderBook}
            showPositions={showPositions}
            onOpenTradingPanel={handleOpenTradingPanel}
            onToggleTradingSidebar={handleToggleTradingSidebar}
            onToggleOrderForm={handleToggleOrderForm}
            onToggleOrderBook={handleToggleOrderBook}
            onTogglePositions={handleTogglePositions}
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
          <div 
            className="terminal-chart-canvas-box overflow-hidden bg-[#fbf9f4] relative"
            onContextMenu={(e) => {
              e.preventDefault();
              if (!chartInstanceRef.current || !chartContainerRef.current) return;
              const rect = chartContainerRef.current.getBoundingClientRect();
              const pixelY = e.clientY - rect.top;
              try {
                const converted = (chartInstanceRef.current as any).convertFromPixel([{ y: pixelY }], { paneId: 'candle_pane' });
                const priceVal = converted?.[0]?.value;
                if (typeof priceVal === 'number' && !isNaN(priceVal) && priceVal > 0) {
                  const roundedPrice = Number(priceVal.toFixed(2));
                  setChartContextMenu({
                    x: Math.min(e.clientX, window.innerWidth - 240),
                    y: Math.min(e.clientY, window.innerHeight - 200),
                    price: roundedPrice
                  });
                }
              } catch {}
            }}
          >
            <div 
              ref={chartContainerRef} 
              id="trading-terminal-chart" 
              className="w-full h-full block" 
            />

            {/* BOTONES FLOTANTES SUPERIORES DE COMPRA / VENTA 1-CLICK EN ESCRITORIO (SOLO CUANDO EL PANEL DE TRADING ESTÁ OCULTO) */}
            {isDesktop && (!isTradingSidebarOpen || !showOrderForm) && (
              <div className="absolute top-3 right-16 z-30 flex items-center gap-1.5 pointer-events-auto bg-[#fbf9f4]/90 backdrop-blur-md p-1 rounded-xl border border-[#ded5c5] shadow-lg animate-in fade-in zoom-in-95 duration-200">
                {/* BOTÓN VENTA 1-CLICK */}
                <button
                  type="button"
                  onClick={() => handleQuickTrade('sell')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-700 border border-red-500/30 hover:border-red-500/70 font-mono font-bold text-xs transition-all active:scale-95 cursor-pointer shadow-xs group"
                  title={isEs ? 'Venta a Mercado Inmediata (1-Click)' : '1-Click Immediate Market Sell'}
                >
                  <span className="font-sans font-black text-[11px] uppercase tracking-wider text-red-700 group-hover:text-red-900">
                    {isEs ? 'Vender' : 'Sell'}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-red-800">
                    ${stats.lastPrice > 0 ? stats.lastPrice.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '---'}
                  </span>
                </button>

                {/* BOTÓN COMPRA 1-CLICK */}
                <button
                  type="button"
                  onClick={() => handleQuickTrade('buy')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 border border-emerald-500/30 hover:border-emerald-500/70 font-mono font-bold text-xs transition-all active:scale-95 cursor-pointer shadow-xs group"
                  title={isEs ? 'Compra a Mercado Inmediata (1-Click)' : '1-Click Immediate Market Buy'}
                >
                  <span className="font-sans font-black text-[11px] uppercase tracking-wider text-emerald-700 group-hover:text-emerald-900">
                    {isEs ? 'Comprar' : 'Buy'}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-emerald-800">
                    ${stats.lastPrice > 0 ? stats.lastPrice.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '---'}
                  </span>
                </button>
              </div>
            )}

            {/* BANNER DE INFRACCIÓN DE DRAWDOWN DE PROP FIRM (5% DIARIO O 10% TOTAL) */}
            {isAccountBreached && (
              <div className="absolute top-2 left-4 right-4 z-40 bg-red-950/95 border border-red-500/90 text-red-100 rounded-xl p-3 shadow-2xl backdrop-blur-md flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-900/80 text-red-200">
                    <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse" />
                  </div>
                  <div>
                    <div className="font-black text-xs text-red-200 uppercase tracking-wider">
                      {isEs ? 'Infracción de Reglas de Prop Firm' : 'Prop Firm Rule Breach'}
                    </div>
                    <div className="text-[11px] text-red-300 font-mono">
                      {breachReason}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={resetDemoBalance}
                  className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-black text-xs cursor-pointer shadow-md flex items-center gap-1.5 active:scale-95 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isEs ? 'Reiniciar Evaluación' : 'Reset Evaluation'}</span>
                </button>
              </div>
            )}

            {/* MENÚ CONTEXTUAL FLOTANTE DE CLIC DERECHO EN EL GRÁFICO */}
            {chartContextMenu && (
              <div
                style={{ top: `${chartContextMenu.y}px`, left: `${chartContextMenu.x}px` }}
                onClick={(e) => e.stopPropagation()}
                className="fixed z-50 min-w-56 bg-slate-950/95 backdrop-blur-md border border-slate-700/80 rounded-xl shadow-2xl p-2 font-mono text-xs"
              >
                <div className="px-2.5 py-1.5 border-b border-slate-800 flex items-center justify-between mb-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    {selectedPair}
                  </span>
                  <span className="text-amber-400 font-black">
                    ${chartContextMenu.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="space-y-1">
                  {/* Botón Buy Limit / Buy Stop */}
                  <button
                    type="button"
                    onClick={() => handlePlacePendingOrderFromChart('buy', chartContextMenu.price)}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-950/70 border border-emerald-900/40 hover:border-emerald-500/80 transition-all cursor-pointer font-bold"
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      {chartContextMenu.price <= stats.lastPrice ? 'Buy Limit' : 'Buy Stop'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {chartContextMenu.price <= stats.lastPrice ? (isEs ? 'Retroceso' : 'Dip') : (isEs ? 'Ruptura' : 'Breakout')}
                    </span>
                  </button>

                  {/* Botón Sell Limit / Sell Stop */}
                  <button
                    type="button"
                    onClick={() => handlePlacePendingOrderFromChart('sell', chartContextMenu.price)}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-rose-300 hover:text-white hover:bg-rose-950/70 border border-rose-900/40 hover:border-rose-500/80 transition-all cursor-pointer font-bold"
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                      {chartContextMenu.price >= stats.lastPrice ? 'Sell Limit' : 'Sell Stop'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {chartContextMenu.price >= stats.lastPrice ? (isEs ? 'Repunte' : 'Rally') : (isEs ? 'Ruptura' : 'Breakdown')}
                    </span>
                  </button>

                  {/* Configurar en panel */}
                  <button
                    type="button"
                    onClick={() => {
                      setLimitPrice(chartContextMenu.price.toFixed(2));
                      setOrderType('limit');
                      setIsTradingSidebarOpen(true);
                      setShowOrderForm(true);
                      setChartContextMenu(null);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent transition-all cursor-pointer text-[11px]"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                    <span>{isEs ? 'Configurar en Panel' : 'Set in Order Form'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* OVERLAY INTERACTIVO: ENTRADAS (AZUL), TAKE PROFIT (VERDE) Y STOP LOSS (ROJO) ARRASTRABLES + PREVIEW + ÓRDENES LÍMITES */}
            <PositionChartOverlay
              chart={chartInstanceRef.current}
              positions={positions.filter((p) => p.symbol === selectedPair)}
              limitOrders={limitOrders.filter((o) => o.symbol === selectedPair)}
              currentPrice={stats.lastPrice}
              demoBalance={demoBalance}
              isEs={isEs}
              tradeSetupPreview={{
                enabled: isTradingSidebarOpen && showOrderForm && !isOrderFormMinimized,
                orderType,
                side,
                entryPrice: effectiveRefPrice,
                slPercent,
                tpPercent,
                slPrice: previewSlPrice,
                tpPrice: previewTpPrice,
                estimatedLossUsd: previewEstimatedLossUsd,
                estimatedProfitUsd: previewEstimatedProfitUsd
              }}
              onUpdatePositionSLTP={handleUpdatePositionSLTP}
              onClosePosition={handleClosePosition}
              onCancelLimitOrder={handleCancelLimitOrder}
              onUpdateLimitOrder={handleUpdateLimitOrder}
              onUpdatePreviewSLTP={handleUpdatePreviewSLTP}
              onUpdatePreviewEntry={handleUpdatePreviewEntry}
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

          {/* DESKTOP: TABLA INFERIOR DE POSICIONES ABIERTAS Y ÓRDENES LÍMITES (h-36 / RESIZABLE) */}
          {showPositions && (
            <TerminalPositions
              isEs={isEs}
              positions={positions}
              limitOrders={limitOrders}
              history={tradeHistory}
              demoBalance={demoBalance}
              onClosePosition={handleClosePosition}
              onCloseAllPositions={handleCloseAllPositions}
              onCancelLimitOrder={handleCancelLimitOrder}
              onCancelAllLimitOrders={handleCancelAllLimitOrders}
              onUpdateLimitOrder={handleUpdateLimitOrder}
              onSetBreakEven={handleSetBreakEven}
              onSelectPosition={handleSelectPositionItem}
              onSelectLimitOrder={handleSelectLimitOrderItem}
              onClearHistory={resetDemoBalance}
            />
          )}

        </div>

        {/* DESKTOP (>= 1024px): PANEL LATERAL ESTRECHO (280px) CON TRADING ARRIBA Y LIBRO ABAJO */}
        {isTradingSidebarOpen && (showOrderForm || showOrderBook) && (
          <div className="terminal-desktop-sidebar no-scrollbar">
            {/* 1. PANEL DE TRADING ARRIBA */}
            {showOrderForm && renderOrderForm()}

            {/* 2. LIBRO DE ÓRDENES ABAJO */}
            {showOrderBook && renderOrderBook()}
          </div>
        )}

        {/* NAVEGACIÓN LATERAL EN ESCRITORIO (DERECHA) */}
        {navPosition === 'right' && (
          <TerminalSideNav
            isEs={isEs}
            currentLang={currentLang}
            onLanguageChange={onLanguageChange}
            onUpdateUser={onUpdateUser}
            quickTradeEnabled={quickTradeEnabled}
            onToggleQuickTrade={toggleQuickTrade}
            navPosition={navPosition}
            isMobileNavOpen={isMobileNavOpen}
            activeSection={activeSection}
            user={user}
            isTradingSidebarOpen={isTradingSidebarOpen}
            showOrderForm={showOrderForm}
            showOrderBook={showOrderBook}
            showPositions={showPositions}
            onOpenTradingPanel={handleOpenTradingPanel}
            onToggleTradingSidebar={handleToggleTradingSidebar}
            onToggleOrderForm={handleToggleOrderForm}
            onToggleOrderBook={handleToggleOrderBook}
            onTogglePositions={handleTogglePositions}
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
          currentLang={currentLang}
          onLanguageChange={onLanguageChange}
          onUpdateUser={onUpdateUser}
          activeSheet={mobileSheet}
          positions={positions}
          limitOrders={limitOrders}
          history={tradeHistory}
          demoBalance={demoBalance}
          riskPercent={riskPercent}
          onSetRiskPercent={setRiskPercent}
          quickTradeEnabled={quickTradeEnabled}
          onToggleQuickTrade={toggleQuickTrade}
          navPosition={navPosition}
          onToggleNavPosition={toggleNavPosition}
          lastPrice={stats.lastPrice}
          bestBid={bestBid}
          bestAsk={bestAsk}
          selectedPair={selectedPair}
          user={user}
          onExit={onExit}
          onQuickTrade={handleQuickTrade}
          setActiveSheet={setMobileSheet}
          renderOrderForm={renderOrderForm}
          renderOrderBook={renderOrderBook}
          onClosePosition={handleClosePosition}
          onCloseAllPositions={handleCloseAllPositions}
          onCancelLimitOrder={handleCancelLimitOrder}
          onCancelAllLimitOrders={handleCancelAllLimitOrders}
          onSetBreakEven={handleSetBreakEven}
          onSelectPosition={handleSelectPositionItem}
          onSelectLimitOrder={handleSelectLimitOrderItem}
          onClearHistory={resetDemoBalance}
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
          currentLang={currentLang}
          onLanguageChange={onLanguageChange}
          onUpdateUser={onUpdateUser}
          quickTradeEnabled={quickTradeEnabled}
          onToggleQuickTrade={toggleQuickTrade}
          navPosition={navPosition}
          isMobileNavOpen={isMobileNavOpen}
          activeSection={activeSection}
          user={user}
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
