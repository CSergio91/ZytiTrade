export interface TimeframeOption {
  value: string;
  label: string;
  category: 'seconds' | 'minutes' | 'hours' | 'days' | 'periods';
}

export const ALL_TIMEFRAMES: TimeframeOption[] = [
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

export const DEFAULT_FAV_TIMEFRAMES = ['1m', '5m', '15m', '1h', '4h', '1D'];

export interface IndicatorOption {
  name: string;
  label: string;
  category: 'main' | 'sub';
  paneId: string;
  description: string;
}

export const ALL_INDICATORS: IndicatorOption[] = [
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

export const DEFAULT_FAV_INDICATORS = ['MA', 'EMA', 'VOL', 'RSI', 'MACD'];

export interface PositionItem {
  id: number;
  symbol: string;
  side: 'LONG' | 'SHORT';
  size: string;
  entry: number;
  mark: number;
  pnl: string;
  pnlPercent: string;
  isProfit: boolean;
}
