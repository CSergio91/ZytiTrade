import { useState, useEffect, useCallback, useRef } from 'react';

export interface ZytiEngineTelemetry {
  wsStatus: 'ON' | 'OFF';
  wsLatency: number; // en ms RTT medido por WebSocket
  connectedSockets: number;
  uptimeSeconds: number;
  redisMode: 'REDIS_CLUSTER' | 'LOCAL_IN_MEMORY' | 'OFFLINE';
  redisStatus: 'ON' | 'OFF';
  memoryHeapMb: number;
  memoryRssMb: number;
  riskSentinelLatency: number; // en ms (0.1ms en RAM)
  riskSentinelStatus: 'ON' | 'OFF';
  lastChecked: Date;
  isChecking: boolean;
}

export function useZytiEngineTelemetry() {
  const [telemetry, setTelemetry] = useState<ZytiEngineTelemetry>({
    wsStatus: 'OFF',
    wsLatency: 0,
    connectedSockets: 0,
    uptimeSeconds: 0,
    redisMode: 'LOCAL_IN_MEMORY',
    redisStatus: 'OFF',
    memoryHeapMb: 0,
    memoryRssMb: 0,
    riskSentinelLatency: 0.1,
    riskSentinelStatus: 'ON',
    lastChecked: new Date(),
    isChecking: false
  });

  const wsRef = useRef<WebSocket | null>(null);
  const pingTimeRef = useRef<number>(0);

  // Determinar URL de WebSocket local o túnel
  const getWsUrl = useCallback(() => {
    if (typeof window === 'undefined') return 'ws://localhost:8080';
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocalhost) {
      return 'ws://localhost:8080';
    }
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}/ws-gateway`;
  }, []);

  // 0. Bootstrap rápido vía /health para datos inmediatos en frío (< 5ms)
  useEffect(() => {
    let active = true;
    const fetchBootstrapHealth = async () => {
      try {
        const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
        const url = isLocalhost ? 'http://localhost:8080/health' : '/gateway-health';
        const res = await fetch(url);
        if (res.ok && active) {
          const data = await res.json();
          setTelemetry(prev => ({
            ...prev,
            wsStatus: 'ON',
            connectedSockets: data.connectedSockets !== undefined ? data.connectedSockets : prev.connectedSockets,
            uptimeSeconds: data.uptimeSeconds || prev.uptimeSeconds,
            redisMode: data.mode === 'REDIS_CLUSTER' ? 'REDIS_CLUSTER' : 'LOCAL_IN_MEMORY',
            redisStatus: 'ON',
            riskSentinelStatus: 'ON',
            lastChecked: new Date()
          }));
        }
      } catch (_) {}
    };

    fetchBootstrapHealth();
    return () => { active = false; };
  }, []);

  // 1. Conexión WebSocket Real Streaming a la Pasarela
  useEffect(() => {
    let isCancelled = false;
    let pingInterval: any = null;
    let reconnectTimeout: any = null;

    const connectWs = () => {
      if (isCancelled) return;
      const wsUrl = getWsUrl();

      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          if (isCancelled) return;
          // Suscribirse al canal continuo de telemetría institucional
          ws.send(JSON.stringify({ action: 'SUBSCRIBE_TELEMETRY', type: 'SUBSCRIBE_TELEMETRY' }));
          
          // Medir RTT inmediatamente
          pingTimeRef.current = performance.now();
          ws.send(JSON.stringify({ action: 'PING', type: 'PING', timestamp: Date.now() }));

          setTelemetry(prev => ({
            ...prev,
            wsStatus: 'ON',
            redisStatus: 'ON',
            riskSentinelStatus: 'ON',
            isChecking: false
          }));

          // Ticker de medición de ping RTT cada 2 segundos por WebSocket
          clearInterval(pingInterval);
          pingInterval = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
              pingTimeRef.current = performance.now();
              ws.send(JSON.stringify({ action: 'PING', type: 'PING', timestamp: Date.now() }));
            }
          }, 2000);
        };

        ws.onmessage = (event) => {
          if (isCancelled) return;
          try {
            const data = JSON.parse(event.data);

            if (data.type === 'PONG') {
              const rtt = Math.max(1, Math.round(performance.now() - pingTimeRef.current));
              setTelemetry(prev => ({
                ...prev,
                wsStatus: 'ON',
                wsLatency: rtt,
                connectedSockets: typeof data.connectedSockets === 'number' ? data.connectedSockets : prev.connectedSockets,
                uptimeSeconds: typeof data.uptimeSeconds === 'number' ? data.uptimeSeconds : prev.uptimeSeconds,
                redisMode: data.mode === 'REDIS_CLUSTER' ? 'REDIS_CLUSTER' : 'LOCAL_IN_MEMORY',
                redisStatus: 'ON',
                memoryHeapMb: typeof data.memoryHeapMb === 'number' ? data.memoryHeapMb : prev.memoryHeapMb,
                memoryRssMb: typeof data.memoryRssMb === 'number' ? data.memoryRssMb : prev.memoryRssMb,
                lastChecked: new Date(),
                isChecking: false
              }));
            } else if (data.type === 'TELEMETRY_UPDATE') {
              setTelemetry(prev => ({
                ...prev,
                wsStatus: 'ON',
                connectedSockets: typeof data.connectedSockets === 'number' ? data.connectedSockets : prev.connectedSockets,
                uptimeSeconds: typeof data.uptimeSeconds === 'number' ? data.uptimeSeconds : prev.uptimeSeconds,
                redisMode: data.mode === 'REDIS_CLUSTER' ? 'REDIS_CLUSTER' : 'LOCAL_IN_MEMORY',
                redisStatus: 'ON',
                memoryHeapMb: typeof data.memoryHeapMb === 'number' ? data.memoryHeapMb : prev.memoryHeapMb,
                memoryRssMb: typeof data.memoryRssMb === 'number' ? data.memoryRssMb : prev.memoryRssMb,
                lastChecked: new Date()
              }));
            }
          } catch {}
        };

        ws.onerror = () => {
          // Si falla WS, se encarga el onclose
        };

        ws.onclose = () => {
          clearInterval(pingInterval);
          if (!isCancelled) {
            setTelemetry(prev => ({
              ...prev,
              wsStatus: 'OFF',
              redisStatus: 'OFF',
              redisMode: 'OFFLINE',
              riskSentinelStatus: 'OFF'
            }));
            // Reintentar conexión en 3.5 segundos
            reconnectTimeout = setTimeout(connectWs, 3500);
          }
        };
      } catch {
        if (!isCancelled) {
          reconnectTimeout = setTimeout(connectWs, 3500);
        }
      }
    };

    connectWs();

    return () => {
      isCancelled = true;
      clearInterval(pingInterval);
      clearTimeout(reconnectTimeout);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [getWsUrl]);

  // Forzar refresco manual
  const refreshTelemetry = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      setTelemetry(prev => ({ ...prev, isChecking: true }));
      pingTimeRef.current = performance.now();
      wsRef.current.send(JSON.stringify({ action: 'PING', type: 'PING', timestamp: Date.now() }));
    }
  }, []);

  return { ...telemetry, refreshTelemetry };
}
