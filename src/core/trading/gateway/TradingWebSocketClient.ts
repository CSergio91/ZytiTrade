/**
 * ============================================================================
 * ZYTI TRADE - CLIENT SDK & WEBSOCKET GATEWAY ADAPTER
 * ============================================================================
 * SDK institucional para Prop Firms y terminales frontend.
 * Conecta a la pasarela WebSocket de ZYTI (con respaldo de Redis Pub/Sub).
 * 
 * Preparado para publicación como paquete npm (@zyti/trading-sdk).
 */

export interface TradingEvent {
  id?: string;
  type: 
    | 'TRADE_OPENED'
    | 'TRADE_CLOSED'
    | 'SL_TP_UPDATED'
    | 'LIMIT_ORDER_PLACED'
    | 'LIMIT_ORDER_CANCELLED'
    | 'LIMIT_ORDER_UPDATED'
    | 'ALL_LIMIT_ORDERS_CANCELLED'
    | 'BALANCE_UPDATED'
    | 'ACCOUNT_RESET'
    | 'DRAWDOWN_BREACH';
  payload: any;
  timestamp?: number;
}

export type TradingEventCallback = (event: TradingEvent) => void;

export class TradingWebSocketClient {
  private ws: WebSocket | null = null;
  private gatewayUrl: string;
  private activeAccountId: string | null = null;
  private listeners: Set<TradingEventCallback> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectTimer: any = null;
  private isExplicitlyClosed = false;

  constructor(customUrl?: string) {
    // Configuración dinámica de URL de la pasarela
    if (customUrl) {
      this.gatewayUrl = customUrl;
    } else if (typeof window !== 'undefined' && (window as any).VITE_WS_GATEWAY_URL) {
      this.gatewayUrl = (window as any).VITE_WS_GATEWAY_URL;
    } else if (typeof window !== 'undefined' && (import.meta as any)?.env?.VITE_WS_GATEWAY_URL) {
      this.gatewayUrl = (import.meta as any).env.VITE_WS_GATEWAY_URL;
    } else {
      if (typeof window !== 'undefined') {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        // Auto-enrutamiento: si se accede por túnel o red local, usa el proxy /ws-gateway del mismo servidor
        this.gatewayUrl = `${protocol}//${window.location.host}/ws-gateway`;
      } else {
        this.gatewayUrl = 'ws://localhost:8080';
      }
    }
  }

  /**
   * Conecta al clúster de WebSockets y suscribe a una cuenta de trading
   */
  public connect(accountId: string): void {
    this.activeAccountId = accountId;
    this.isExplicitlyClosed = false;
    this.initializeSocket();
  }

  private initializeSocket(): void {
    if (typeof window === 'undefined' || typeof WebSocket === 'undefined') return;
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      this.ws = new WebSocket(this.gatewayUrl);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        console.log(`[ZYTI SDK] Conectado a Trading Gateway en ${this.gatewayUrl}`);

        if (this.activeAccountId) {
          this.sendAction({
            action: 'SUBSCRIBE',
            accountId: this.activeAccountId
          });
        }
      };

      this.ws.onmessage = (messageEvent) => {
        try {
          const data = JSON.parse(messageEvent.data);

          if (data.type === 'TRADING_EVENT' && data.event) {
            this.listeners.forEach((callback) => {
              try {
                callback(data.event);
              } catch (cbErr) {
                console.warn('[ZYTI SDK] Error en callback de evento:', cbErr);
              }
            });
          }
        } catch (_) {}
      };

      this.ws.onclose = () => {
        if (!this.isExplicitlyClosed) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = () => {
        // Silencioso para no ensuciar la consola si el servidor aún no está levantado
        this.ws?.close();
      };
    } catch (_) {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }

    const delay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), 10000);
    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (!this.isExplicitlyClosed && this.activeAccountId) {
        this.initializeSocket();
      }
    }, delay);
  }

  /**
   * Despacha un evento de trading hacia la pasarela (para ser distribuido a todos los dispositivos)
   */
  public publishEvent(event: TradingEvent): void {
    if (!this.activeAccountId) return;

    this.sendAction({
      action: 'DISPATCH_EVENT',
      accountId: this.activeAccountId,
      event: {
        ...event,
        timestamp: Date.now()
      }
    });
  }

  /**
   * Suscribe un listener para reaccionar a eventos en tiempo real
   */
  public onEvent(callback: TradingEventCallback): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private sendAction(payload: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(payload));
      } catch (_) {}
    }
  }

  /**
   * Desconecta limpiamente el socket
   */
  public disconnect(): void {
    this.isExplicitlyClosed = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      if (this.activeAccountId) {
        this.sendAction({ action: 'UNSUBSCRIBE', accountId: this.activeAccountId });
      }
      this.ws.close();
      this.ws = null;
    }
    this.listeners.clear();
  }

  public isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

// Instancia singleton para el frontend de la terminal
export const zytiTradingClient = new TradingWebSocketClient();
