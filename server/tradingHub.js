/**
 * ============================================================================
 * ZYTI TRADE - INSTITUTIONAL WEBSOCKET & REDIS TRADING HUB
 * ============================================================================
 * Microservicio de alta concurrencia para Fan-Out y sincronización multi-dispositivo.
 *
 * Capacidades:
 * 1. Conexión nativa a Redis Clúster (Pub/Sub + Hot State Cache) con fallback
 *    in-memory automático si no hay Redis levantado (Desarrollo local sin Docker).
 * 2. Distribución en sub-5ms hacia PC, móviles, tablets y pestañas concurrentes.
 * 3. Heartbeat / Ping-Pong institucional para erradicar sockets zombis.
 * 4. Endpoint HTTP /health para monitoreo de orquestadores (Docker / Kubernetes / VPS).
 */

import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import Redis from 'ioredis';

const PORT = process.env.PORT || process.env.WS_PORT || 8080;
const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

// Registro de clientes WebSocket conectados agrupados por cuenta
// Map<accountId, Set<WebSocket>>
const accountSubscriptions = new Map();

// Caché de estado en memoria caliente para desarrollo local y aceleración
const localHotState = new Map();

// ----------------------------------------------------------------------------
// 1. CONFIGURACIÓN DEL CLIENTE REDIS CON DETECCIÓN INTELIGENTE
// ----------------------------------------------------------------------------
let isRedisActive = false;
let redisPub = null;
let redisSub = null;

try {
  redisPub = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 1,
    connectTimeout: 2500,
    retryStrategy(times) {
      if (times > 3) {
        return null; // Deja de reintentar si no hay Docker/Redis local
      }
      return Math.min(times * 500, 2000);
    }
  });

  redisSub = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 1,
    connectTimeout: 2500,
    retryStrategy: () => null
  });

  redisPub.on('connect', () => {
    isRedisActive = true;
    console.log(`\x1b[32m✔ [ZYTI Hub] Redis conectado en ${REDIS_URL} (Modo Clúster Activado)\x1b[0m`);
    
    // Suscribirse al canal global de eventos de cuentas
    redisSub.psubscribe('channel:account:*', (err) => {
      if (err) console.warn('[ZYTI Hub] Error al suscribirse a Redis Pub/Sub:', err.message);
    });
  });

  redisSub.on('pmessage', (_pattern, channel, message) => {
    try {
      const accountId = channel.replace('channel:account:', '');
      const parsedEvent = JSON.parse(message);
      fanOutToClients(accountId, parsedEvent, parsedEvent.senderId);
    } catch (err) {
      console.warn('[ZYTI Hub] Error procesando mensaje de Redis:', err);
    }
  });

  redisPub.on('error', () => {
    if (isRedisActive) {
      console.warn('\x1b[33m⚠ [ZYTI Hub] Conexión con Redis perdida. Cambiando a In-Memory Bus...\x1b[0m');
    }
    isRedisActive = false;
  });

  redisSub.on('error', () => {
    isRedisActive = false;
  });
} catch (e) {
  isRedisActive = false;
}

// Mensaje inicial de diagnóstico para el desarrollador
setTimeout(() => {
  if (!isRedisActive) {
    console.log('\x1b[36m⚡ [ZYTI Hub] Modo Local In-Memory Activo (Ejecución directa en Windows sin Docker)\x1b[0m');
  }
}, 1200);

// ----------------------------------------------------------------------------
// 2. SERVIDOR HTTP (Healthcheck + Inspección de Estado en Memoria)
// ----------------------------------------------------------------------------
const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/health' || url.pathname === '/') {
    let totalSubscribers = 0;
    accountSubscriptions.forEach((clients) => {
      totalSubscribers += clients.size;
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      name: 'ZYTI Trading WebSocket & Redis Gateway',
      version: '1.0.0',
      uptimeSeconds: Math.floor(process.uptime()),
      activeAccounts: accountSubscriptions.size,
      connectedSockets: totalSubscribers,
      mode: isRedisActive ? 'REDIS_CLUSTER' : 'LOCAL_IN_MEMORY',
      redisUrl: isRedisActive ? REDIS_URL : null,
      memoryHeapMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      memoryRssMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
      timestamp: new Date().toISOString()
    }, null, 2));
    return;
  }

  if (url.pathname.startsWith('/api/state/')) {
    const accountId = url.pathname.replace('/api/state/', '');
    const state = localHotState.get(accountId) || null;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ accountId, state }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not Found' }));
});

// ----------------------------------------------------------------------------
// 3. WEBSOCKET SERVER (Gestión de Canales por Cuenta y Fan-Out)
// ----------------------------------------------------------------------------
const wss = new WebSocketServer({ server });

/**
 * Difunde un evento a todos los clientes conectados a una cuenta específica
 */
function fanOutToClients(accountId, event, excludeSenderId = null) {
  const clients = accountSubscriptions.get(accountId);
  if (!clients || clients.size === 0) return;

  const payloadString = JSON.stringify({
    type: 'TRADING_EVENT',
    accountId,
    event,
    timestamp: Date.now()
  });

  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      if (excludeSenderId && client.clientId === excludeSenderId) {
        return; // Evita eco al dispositivo originador
      }
      try {
        client.send(payloadString);
      } catch (err) {
        console.warn('[ZYTI Hub] Error enviando frame WebSocket a cliente:', err.message);
      }
    }
  });
}

/**
 * Publica un evento en Redis o lo despacha directamente en memoria
 */
async function publishTradingEvent(accountId, event, senderId = null) {
  // Actualizar caché de estado en memoria
  if (event.type === 'BALANCE_UPDATED' && event.payload?.balance) {
    const cur = localHotState.get(accountId) || {};
    cur.balance = event.payload.balance;
    localHotState.set(accountId, cur);
  }

  if (isRedisActive && redisPub) {
    try {
      const redisPayload = { ...event, senderId };
      await redisPub.publish(`channel:account:${accountId}`, JSON.stringify(redisPayload));
      return;
    } catch (_) {}
  }

  // Fallback in-memory inmediato
  fanOutToClients(accountId, event, senderId);
}

wss.on('connection', (ws, req) => {
  ws.isAlive = true;
  ws.clientId = `client_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  ws.subscribedAccount = null;

  // Manejo de Ping-Pong
  ws.on('pong', () => {
    ws.isAlive = true;
  });

  // Mensaje de bienvenida con metadatos
  ws.send(JSON.stringify({
    type: 'CONNECTED',
    clientId: ws.clientId,
    gateway: 'ZYTI-Realtime-v1',
    mode: isRedisActive ? 'REDIS_CLUSTER' : 'LOCAL_IN_MEMORY'
  }));

  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data.toString());

      switch (message.action || message.type) {
        // Suscribir este socket a una cuenta de trading
        case 'SUBSCRIBE': {
          const { accountId } = message;
          if (!accountId) return;

          ws.subscribedAccount = accountId;

          if (!accountSubscriptions.has(accountId)) {
            accountSubscriptions.set(accountId, new Set());
          }
          accountSubscriptions.get(accountId).add(ws);

          ws.send(JSON.stringify({
            type: 'SUBSCRIBED',
            accountId,
            connectedClients: accountSubscriptions.get(accountId).size
          }));

          // Enviar estado en memoria caliente si existe
          const cached = localHotState.get(accountId);
          if (cached) {
            ws.send(JSON.stringify({
              type: 'HOT_STATE_SNAPSHOT',
              accountId,
              state: cached
            }));
          }
          break;
        }

        // Cancelar suscripción
        case 'UNSUBSCRIBE': {
          const { accountId } = message;
          if (accountId && accountSubscriptions.has(accountId)) {
            accountSubscriptions.get(accountId).delete(ws);
          }
          ws.subscribedAccount = null;
          break;
        }

        // Despachar evento de trading (Apertura, Cierre, SL/TP, Balance, Reset)
        case 'DISPATCH_EVENT': {
          const { accountId, event } = message;
          if (!accountId || !event) return;

          await publishTradingEvent(accountId, event, ws.clientId);

          // Confirmación al originador
          ws.send(JSON.stringify({
            type: 'EVENT_ACK',
            eventId: event.id || null,
            status: 'DISPATCHED'
          }));
          break;
        }

        case 'PING': {
          ws.send(JSON.stringify({ 
            type: 'PONG', 
            clientPingTimestamp: message.timestamp || null,
            serverTime: Date.now(),
            uptimeSeconds: Math.floor(process.uptime()),
            connectedSockets: wss.clients.size,
            mode: isRedisActive ? 'REDIS_CLUSTER' : 'LOCAL_IN_MEMORY',
            memoryHeapMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
            memoryRssMb: Math.round(process.memoryUsage().rss / 1024 / 1024)
          }));
          break;
        }

        case 'SUBSCRIBE_TELEMETRY': {
          ws.isTelemetrySubscriber = true;
          ws.send(JSON.stringify({
            type: 'TELEMETRY_UPDATE',
            uptimeSeconds: Math.floor(process.uptime()),
            connectedSockets: wss.clients.size,
            mode: isRedisActive ? 'REDIS_CLUSTER' : 'LOCAL_IN_MEMORY',
            memoryHeapMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
            memoryRssMb: Math.round(process.memoryUsage().rss / 1024 / 1024)
          }));
          break;
        }

        default:
          break;
      }
    } catch (err) {
      console.warn('[ZYTI Hub] Error procesando payload WebSocket:', err.message);
    }
  });

  ws.on('close', () => {
    if (ws.subscribedAccount && accountSubscriptions.has(ws.subscribedAccount)) {
      accountSubscriptions.get(ws.subscribedAccount).delete(ws);
      if (accountSubscriptions.get(ws.subscribedAccount).size === 0) {
        accountSubscriptions.delete(ws.subscribedAccount);
      }
    }
  });
});

// ----------------------------------------------------------------------------
// 4. HEARTBEAT PERIODICO (Erradica conexiones muertas cada 25 segundos)
// ----------------------------------------------------------------------------
const heartbeatInterval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (!ws.isAlive) {
      return ws.terminate();
    }
    ws.isAlive = false;
    ws.ping();
  });
}, 25000);

// Streaming continuo de telemetría institucional por WebSocket (1.2s ticker sin coste de egress)
const telemetryStreamInterval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isTelemetrySubscriber && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'TELEMETRY_UPDATE',
        uptimeSeconds: Math.floor(process.uptime()),
        connectedSockets: wss.clients.size,
        mode: isRedisActive ? 'REDIS_CLUSTER' : 'LOCAL_IN_MEMORY',
        memoryHeapMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        memoryRssMb: Math.round(process.memoryUsage().rss / 1024 / 1024)
      }));
    }
  });
}, 1200);

wss.on('close', () => {
  clearInterval(heartbeatInterval);
  clearInterval(telemetryStreamInterval);
});

// ----------------------------------------------------------------------------
// 5. INICIO DEL SERVIDOR
// ----------------------------------------------------------------------------
server.listen(PORT, () => {
  console.log(`\n===============================================================`);
  console.log(`🚀 ZYTI TRADING WEBSOCKET & REDIS GATEWAY ACTIVO`);
  console.log(`===============================================================`);
  console.log(`• Puerto WebSocket & HTTP : \x1b[32mhttp://localhost:${PORT}\x1b[0m`);
  console.log(`• URL WebSocket           : \x1b[32mws://localhost:${PORT}\x1b[0m`);
  console.log(`• Health Check            : \x1b[34mhttp://localhost:${PORT}/health\x1b[0m`);
  console.log(`===============================================================\n`);
});
