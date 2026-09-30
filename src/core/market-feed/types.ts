/**
 * ZYTI Trade - Market Data Feed Contracts
 * Modelos de datos universales para streaming WebSocket de exchanges reales (Binance, Bybit, OKX, CCXT)
 * y el motor de agregación de velas a 60 FPS en Web Worker.
 */

export type SupportedExchange = 
  | 'binance' 
  | 'bybit' 
  | 'okx' 
  | 'kraken' 
  | 'coinbase' 
  | 'bitget' 
  | 'simulated';

export interface MarketTick {
  symbol: string;
  price: number;
  volume: number;
  timestamp: number;
  side: 'buy' | 'sell';
}

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

export type MarketFeedCommand = 
  | { type: 'SUBSCRIBE'; payload: { symbol: string; timeframe: string; exchange?: SupportedExchange } }
  | { type: 'UNSUBSCRIBE'; payload?: { symbol?: string } }
  | { type: 'CHANGE_TIMEFRAME'; payload: { timeframe: string } }
  | { type: 'SET_EXCHANGE'; payload: { exchange: SupportedExchange } };

export type MarketFeedEvent = 
  | { type: 'HISTORICAL_BARS'; payload: { bars: KLineBar[]; symbol: string; timeframe: string } }
  | { type: 'TICK_UPDATE'; payload: { bar: KLineBar; stats: MarketStats } }
  | { type: 'ORDERBOOK_UPDATE'; payload: OrderBookPayload }
  | { type: 'CONNECTION_STATUS'; payload: { status: 'connected' | 'connecting' | 'disconnected' | 'reconnecting'; exchange: SupportedExchange } };
