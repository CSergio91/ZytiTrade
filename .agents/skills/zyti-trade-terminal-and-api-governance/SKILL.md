---
name: zyti-trade-terminal-and-api-governance
description: Especificación arquitectónica, contratos de API, protocolo de webhooks, heartbeat/ping-pong de alta disponibilidad y gobernanza de despliegue On-Premise para ZYTI Trade.
version: 1.1.0
category: Trading Terminal OS & Infrastructure
status: Active
---

# ZYTI TRADE — TERMINAL OS, HEARTBEAT & DEPLOYMENT GOVERNANCE

## 1. VISIÓN DEL PRODUCTO & REPLICABILIDAD ON-PREMISE
**ZYTI Trade** es un Sistema Operativo de Trading Institucional diseñado para ser:
1. **100% Desacoplado:** Ninguna dependencia forzada de una empresa de fondeo, broker o exchange particular.
2. **Replicable On-Premise / Bare-Metal:** Todo el stack debe poder desplegarse con un solo comando (`docker compose up -d`) en servidores de clientes, VPS privados o clusters en la nube sin configuraciones manuales complejas.
3. **Distribución en Memoria de Ultra Baja Latencia:** Patrón Fan-Out con Redis en caliente + Nginx Reverse Proxy + Gateway WebSocket.

---

## 2. PROTOCOLO DE HEARTBEAT, PING-PONG Y GESTIÓN DE CONEXIONES ZOMBI

### A. Capa Externa (Ingestion Worker <-> Exchanges: Binance/OKX)
1. **Binance WebSocket Rules:**
   - Binance envía un marco `ping` cada pocos minutos. El Worker DEBE responder inmediatamente con un marco `pong`.
   - Si no se reciben mensajes en 60 segundos, se declara la conexión como estancada y se destruye el socket (`socket.terminate()`) iniciando reconexión exponencial con jitter.
2. **OKX WebSocket Rules:**
   - OKX requiere que el cliente envíe una cadena de texto literal `"ping"` cada 20-30 segundos y responderá con `"pong"`.
   - Si en 30 segundos no hay respuesta, reinicio inmediato del conector.

### B. Capa Interna (ZYTI Gateway Server <-> Terminal Frontend & Apps)
1. **Detección Activa de Conexiones Muertas (Half-Open TCP Detection):**
   - El Gateway ejecuta un ciclo de heartbeat cada **30 segundos**:
     ```typescript
     wss.on('connection', (ws) => {
       ws.isAlive = true;
       ws.on('pong', () => { ws.isAlive = true; });
     });

     const heartbeatInterval = setInterval(() => {
       wss.clients.forEach((ws) => {
         if (!ws.isAlive) {
           console.warn('[ZYTI Gateway] Pruning zombie connection');
           return ws.terminate(); // Libera file descriptors y memoria RAM inmediatamente
         }
         ws.isAlive = false;
         ws.ping();
       });
     }, 30000);
     ```
2. **Client-Side Watchdog (Frontend KLineChart / App):**
   - El cliente vigila la llegada de ticks o pings. Si transcurren más de 10 segundos sin actividad en un par suscrito, marca el estado en la UI como `RECONNECTING` con badge ambar y reabre el stream con backoff exponencial (1s, 2s, 4s, máx 10s).

---

## 3. PIPELINE DE DATOS FAN-OUT & DISTRIBUCIÓN EN MEMORIA

```text
                  [ EXCHANGES: BINANCE / OKX ]
                               │ (1 sola conexión WSS por par)
                               ▼
                [ MARKET DATA INGESTION WORKER ]
                               │
               ┌───────────────┴───────────────┐
               │ Pub/Sub: 'stream:{symbol}'    │ Cache: ZSET klines
               ▼                               ▼
                     [ REDIS IN-MEMORY BUS ]
                               │
                               ▼
                     [ ZYTI WSS GATEWAY ]
                               │ (Heartbeat + Zombie Pruner)
                               ▼
                   [ NGINX REVERSE PROXY ]
                               │ (TLS + WSS Upgrade)
               ┌───────────────┴───────────────┐
               ▼                               ▼
       [ TERMINAL WEB ]              [ ANDROID MOBILE APK ]
```

---

## 4. ESTÁNDAR DE DESPLIEGUE REPLICABLE (CLIENT-READY)

Todo despliegue para clientes o servidores propios se compone de 4 contenedores dockerizados orquestados:
1. `zyti-frontend`: Nginx sirviendo la SPA de React con compresión gzip/brotli y proxying a WS.
2. `zyti-gateway`: Servidor Node.js / TypeScript WebSocket y REST API.
3. `zyti-worker`: Ingestion Worker que mantiene el enlace con Binance/OKX y escribe en Redis.
4. `zyti-redis`: Redis Alpine con políticas de desalojo LRU y snapshotting para estado caliente.

Variables obligatorias en `.env` (sin secretos en el repo):
- `PORT_HTTP`, `PORT_WSS`, `REDIS_URL`, `EXCHANGE_PAIRS_DEFAULT`, `ZYTI_AUTH_SECRET`.

---

## 5. FLUJO DE APROVISIONAMIENTO Y WEBHOOKS EXTERNOS
- `POST /api/v1/accounts/provision`: Registra y crea cuentas de fondeo o brokers vía API con SSO token.
- `POST /api/v1/positions/close-all`: Cierre forzoso ante margin-call / violación de riesgo.
- Webhooks criptográficamente firmados con HMAC-SHA256 para eventos de trade en tiempo real.
