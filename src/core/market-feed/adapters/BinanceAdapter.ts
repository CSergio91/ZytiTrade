/**
 * ZYTI Trade - Binance Native Adapter (Spot & USDT-M Futures)
 * Conexión WSS pura a Binance sin la librería pesada de CCXT.
 * Soporta multiplexado de Kline, Ticker L1 y OrderBook L2 (depth20@100ms).
 */

import { MarketType, KLineBar, OrderBookPayload, MarketStats } from '../types';
import { BaseMarketAdapter } from './BaseMarketAdapter';

export class BinanceAdapter extends BaseMarketAdapter {
  private lastStats: Map<string, MarketStats> = new Map();
  private lastBars: Map<string, KLineBar> = new Map();

  constructor() {
    super({
      exchangeId: 'binance',
      baseDelayMs: 1000,
      maxDelayMs: 30000,
      maxCommandsPerSec: 5,
      idleDisconnectDelayMs: 4000,
      heartbeatIntervalMs: 180000 // Binance envía ping cada 3m y el cliente responde pong
    });
  }

  protected getEndpointUrl(marketType: MarketType): string {
    return marketType === 'futures'
      ? 'wss://fstream.binance.com/stream'
      : 'wss://stream.binance.com:9443/stream';
  }

  private normalizeSymbol(symbol: string): string {
    return symbol.replace('/', '').toLowerCase();
  }

  private denormalizeSymbol(raw: string): string {
    const upper = raw.toUpperCase();
    if (upper.endsWith('USDT')) {
      const base = upper.replace('USDT', '');
      return `${base}/USDT`;
    }
    return upper;
  }

  protected sendSubscription(symbol: string, timeframe: string, marketType: MarketType): void {
    const raw = this.normalizeSymbol(symbol);
    const tf = timeframe.toLowerCase();

    const streams = [
      `${raw}@kline_${tf}`,
      `${raw}@trade`,
      `${raw}@depth20@100ms`,
      `${raw}@ticker`
    ];

    this.sendCommand(marketType, {
      method: 'SUBSCRIBE',
      params: streams,
      id: Date.now()
    });
  }

  protected sendUnsubscription(symbol: string, marketType: MarketType): void {
    const raw = this.normalizeSymbol(symbol);
    const key = `${marketType}:${symbol}`;
    const tf = (this.symbolTimeframes.get(key) || '15m').toLowerCase();

    const streams = [
      `${raw}@kline_${tf}`,
      `${raw}@trade`,
      `${raw}@depth20@100ms`,
      `${raw}@ticker`
    ];

    this.sendCommand(marketType, {
      method: 'UNSUBSCRIBE',
      params: streams,
      id: Date.now()
    });
  }

  protected handleRawMessage(rawData: string, marketType: MarketType): void {
    try {
      const msg = JSON.parse(rawData);
      if (!msg || !msg.data) return;

      const data = msg.data;
      const stream = msg.stream || '';

      // 1. Mensaje de Velas KLine
      if (data.e === 'kline' && data.k) {
        const k = data.k;
        const symbol = this.denormalizeSymbol(k.s);

        const bar: KLineBar = {
          timestamp: k.t,
          open: parseFloat(k.o),
          high: parseFloat(k.h),
          low: parseFloat(k.l),
          close: parseFloat(k.c),
          volume: parseFloat(k.v)
        };

        this.lastBars.set(`${marketType}:${symbol}`, bar);

        const stats = this.lastStats.get(`${marketType}:${symbol}`) || {
          symbol,
          exchange: this.exchangeId,
          marketType,
          lastPrice: bar.close,
          change24h: 0,
          high24h: bar.high,
          low24h: bar.low,
          volume24h: bar.volume
        };

        stats.lastPrice = bar.close;

        this.emit({
          type: 'TICK_UPDATE',
          payload: { symbol, bar, stats }
        });
      }

      // 2. Mensaje de Ticker 24h
      else if (data.e === '24hrTicker') {
        const symbol = this.denormalizeSymbol(data.s);
        const stats: MarketStats = {
          symbol,
          exchange: this.exchangeId,
          marketType,
          lastPrice: parseFloat(data.c),
          change24h: parseFloat(data.P),
          high24h: parseFloat(data.h),
          low24h: parseFloat(data.l),
          volume24h: parseFloat(data.v)
        };

        this.lastStats.set(`${marketType}:${symbol}`, stats);
      }

      // 3. Libro de Órdenes L2 (depth20)
      else if (stream.includes('@depth20')) {
        const rawSym = stream.split('@')[0];
        const symbol = this.denormalizeSymbol(rawSym);

        const bids = (data.bids || []).slice(0, 10).map((b: string[]) => ({
          price: parseFloat(b[0]),
          amount: parseFloat(b[1]),
          total: parseFloat(b[1])
        }));

        const asks = (data.asks || []).slice(0, 10).map((a: string[]) => ({
          price: parseFloat(a[0]),
          amount: parseFloat(a[1]),
          total: parseFloat(a[1])
        }));

        const payload: OrderBookPayload = {
          symbol,
          exchange: this.exchangeId,
          marketType,
          timestamp: Date.now(),
          bids,
          asks
        };

        this.emit({
          type: 'ORDERBOOK_UPDATE',
          payload
        });
      }
    } catch {}
  }

  protected startHeartbeat(marketType: MarketType): void {
    // Binance maneja el ping del lado del servidor, pero enviamos un pong proactivo cada 3m
    const timer = setInterval(() => {
      const ws = this.sockets.get(marketType);
      if (ws && ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(JSON.stringify({ pong: Date.now() }));
        } catch {}
      }
    }, this.heartbeatIntervalMs);

    this.heartbeatTimers.set(marketType, timer);
  }

  protected stopHeartbeat(marketType: MarketType): void {
    const timer = this.heartbeatTimers.get(marketType);
    if (timer) {
      clearInterval(timer);
      this.heartbeatTimers.delete(marketType);
    }
  }
}
