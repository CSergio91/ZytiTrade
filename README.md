# ⚡ ZYTI Trade — Institutional Trading OS & Prop Firm Gateway

Plataforma de trading multiactivo de grado institucional para traders profesionales, brokers y empresas de fondeo (**Prop Firms**). Motor KLineChart v10 Canvas a 60 FPS, arquitectura Fan-Out con Redis, autenticación multi-proveedor con Cloudflare Turnstile anti-bot, y soporte híbrido **Cloud / On-Premise**.

🌐 **Demo en vivo:** [https://zytitrade-tradingplatform.vercel.app](https://zytitrade-tradingplatform.vercel.app)

---

## 📑 Tabla de Contenidos

1. [Stack Tecnológico](#-stack-tecnológico)
2. [Arquitectura del Sistema](#-arquitectura-del-sistema)
3. [Puesta en Marcha Rápida](#-puesta-en-marcha-rápida)
4. [Variables de Entorno (.env)](#-variables-de-entorno-env)
5. [Autenticación Multi-Proveedor](#-autenticación-multi-proveedor)
6. [Cloudflare Turnstile — Anti-Bot CAPTCHA](#-cloudflare-turnstile--anti-bot-captcha)
7. [Supabase Cloud (Fase 1)](#-supabase-cloud-fase-1)
8. [Supabase Local con CLI (Fase 2)](#-supabase-local-con-cli-fase-2)
9. [Migración a On-Premise con Docker](#-migración-a-on-premise-con-docker)
10. [Arquitectura Fan-Out con Redis](#-arquitectura-fan-out-con-redis)
11. [Contratos de API & Webhooks para Prop Firms](#-contratos-de-api--webhooks-para-prop-firms)
12. [Despliegue en Vercel](#-despliegue-en-vercel)

---

## 🛠 Stack Tecnológico

| Capa | Tecnología |
|---|---|
| **Frontend** | React 18 + TypeScript + Vite + Tailwind CSS v4 |
| **Gráficos** | KLineChart v10 (Canvas GPU 60 FPS) |
| **Auth** | Supabase Auth (Email, Google, GitHub, Telegram) |
| **CAPTCHA** | Cloudflare Turnstile (anti-bot, 100% gratuito) |
| **Base de datos** | PostgreSQL 15 (vía Supabase Cloud o Docker) |
| **Tiempo real** | Redis Pub/Sub + WebSocket Fan-Out |
| **Animaciones** | Lottie + CSS custom (Glassmorphism Warm Cream) |
| **Despliegue** | Vercel (frontend) + Docker (infra) |

---

## 🏛️ Arquitectura del Sistema

```text
       [ EMPRESA DE FONDEO (B2B) ]
                    │
                    │ 1. POST /api/v1/accounts/provision
                    ▼
          [ ZYTI API GATEWAY ]
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
 [ POSTGRESQL / AUTH ]   [ TRADER → ZYTI TERMINAL ]
 (Cuentas, Reglas, PnL)         │
                                │ Suscripción WS mercado
                                ▼
                    [ ZYTI WEBSOCKET GATEWAY ]
                                ▲
                                │ Pub/Sub en memoria
                      [ REDIS IN-MEMORY BUS ]
                                ▲
                                │ 1 conexión WS centralizada por par
                     [ INGESTION WORKER CENTRAL ]
                                ▲
                     [ BINANCE / BYBIT / OKX ]
```

---

## 🚀 Puesta en Marcha Rápida

```bash
# 1. Clonar el repositorio
git clone https://github.com/CSergio91/ZytiTrade.git
cd ZytiTrade

# 2. Instalar dependencias
npm install

# 3. Copiar y configurar variables de entorno
cp .env.example .env   # Edita .env con tus claves

# 4. Iniciar el servidor de desarrollo
npm run dev

# 5. (Opcional) Servidor con tunnel público Cloudflare
npm run dev --tunnel
```

La plataforma estará disponible en `http://localhost:3000`.

---

## 🔐 Variables de Entorno (.env)

Crea un archivo `.env` en la raíz con estas variables:

```env
# ── Supabase (Cloud o Local) ─────────────────────────────────
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui

# ── Dominio de producción ─────────────────────────────────────
VITE_APP_URL=https://zytitrade-tradingplatform.vercel.app

# ── Telegram Bot ──────────────────────────────────────────────
VITE_TELEGRAM_BOT_NAME=ZytiTarde_bot
TELEGRAM_BOT_TOKEN=tu-bot-token

# ── Cloudflare Turnstile (anti-bot CAPTCHA) ───────────────────
# Claves de TEST para desarrollo (siempre pasan):
#   VITE_TURNSTILE_SITE_KEY=1x00000000000000000000AA
#   TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
# Claves reales: https://dash.cloudflare.com → Turnstile
VITE_TURNSTILE_SITE_KEY=tu-site-key
TURNSTILE_SECRET_KEY=tu-secret-key   # Solo para servidor/Edge Function

# ── OAuth Providers (para Supabase Local) ────────────────────
GOOGLE_CLIENT_ID=tu-google-client-id
GOOGLE_CLIENT_SECRET=tu-google-secret
GITHUB_CLIENT_ID=tu-github-client-id
GITHUB_CLIENT_SECRET=tu-github-secret

# ── Base de datos directa (Worker y Backend) ─────────────────
DATABASE_URL=postgresql://postgres:password@localhost:5432/zyti_trade

# ── Redis (Fan-Out) ───────────────────────────────────────────
REDIS_URL=redis://localhost:6379

# ── Seguridad interna ─────────────────────────────────────────
ZYTI_ADMIN_SECRET=clave_maestra_panel_admin

# ── Entorno ───────────────────────────────────────────────────
VITE_APP_ENV=development
```

---

## 🔑 Autenticación Multi-Proveedor

ZYTI Trade soporta 4 métodos de login implementados en [`AuthModal.tsx`](src/components/AuthModal.tsx):

| Proveedor | Estado | Requisito |
|---|---|---|
| **Email + Contraseña** | ✅ Funciona en local y prod | Solo Supabase |
| **Google OAuth** | ✅ Popup centrado | Credenciales Google Cloud Console |
| **GitHub OAuth** | ✅ Popup centrado | OAuth App en GitHub |
| **Telegram Widget** | ✅ Widget oficial | Dominio HTTPS + `/setdomain` en BotFather |

### Configurar Google OAuth

1. [console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → Credentials
2. Create OAuth 2.0 Client ID → Web Application
3. Authorized redirect URIs: `https://ujcnglkdwzqlwqgrkspz.supabase.co/auth/v1/callback`
4. Añadir en Supabase: **Authentication → Providers → Google**

### Configurar GitHub OAuth

1. [github.com/settings/developers](https://github.com/settings/developers) → OAuth Apps → New
2. Homepage URL: `https://zytitrade-tradingplatform.vercel.app`
3. Callback URL: `https://ujcnglkdwzqlwqgrkspz.supabase.co/auth/v1/callback`
4. Añadir en Supabase: **Authentication → Providers → GitHub**

### Configurar Telegram Login Widget

1. Abre Telegram → **@BotFather** → `/mybots` → tu bot
2. **Bot Settings → Domain** → escribe (sin `https://`):
   ```
   zytitrade-tradingplatform.vercel.app
   ```
3. El widget oficial se inyecta automáticamente en el modal de login.

### Configurar Supabase Redirect URLs

En [Supabase Dashboard](https://supabase.com/dashboard) → **Authentication → URL Configuration**:
```
https://zytitrade-tradingplatform.vercel.app
http://localhost:3000
http://127.0.0.1:3000
```

---

## 🛡 Cloudflare Turnstile — Anti-Bot CAPTCHA

ZYTI usa [Cloudflare Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile) para proteger los formularios de login y registro de ataques de bots. Es **100% gratuito** y no requiere resolver puzzles (invisible para humanos normales).

### Configurar Turnstile (producción)

1. [dash.cloudflare.com](https://dash.cloudflare.com) → **Turnstile** → **Add site**
2. Domain: `zytitrade-tradingplatform.vercel.app` *(sin https://)*
3. Widget type: **Managed** (recomendado)
4. Copiar **Site Key** → `VITE_TURNSTILE_SITE_KEY` en `.env`
5. Copiar **Secret Key** → `TURNSTILE_SECRET_KEY` en `.env` *(solo backend)*

> `localhost` y `127.0.0.1` se añaden automáticamente — funciona en local sin configuración extra.

### Claves de test (desarrollo)

```env
# Siempre pasa la verificacion
VITE_TURNSTILE_SITE_KEY=1x00000000000000000000AA
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
```

El componente [`TurnstileWidget.tsx`](src/components/TurnstileWidget.tsx) lee `VITE_TURNSTILE_SITE_KEY` automáticamente y usa la clave de test como fallback si la variable no está definida.

---

## ☁️ Supabase Cloud (Fase 1)

Para empezar sin Docker ni configuración local:

1. [supabase.com](https://supabase.com) → **New Project**
2. SQL Editor → pega el contenido de [`docker/init.sql`](docker/init.sql) → **Run**
3. Project Settings → API → copia `Project URL` y `Anon Key`
4. Añade en `.env`:
   ```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key
   ```

Esto crea automáticamente las tablas:
- `prop_firms` — empresas clientes B2B y sus API Keys
- `trading_accounts` — cuentas de traders con reglas de riesgo dinámicas
- `account_trades` — histórico de órdenes con PnL
- `equity_snapshots` — auditoría continua de drawdown

---

## 🖥️ Supabase Local con CLI (Fase 2)

El archivo [`supabase/config.toml`](supabase/config.toml) ya tiene toda la configuración pre-cargada (OAuth, redirect URLs, rate limiting). Solo necesitas:

```powershell
# 1. Instalar el CLI de Supabase (una vez)
winget install Supabase.CLI

# 2. Iniciar todos los servicios en local
supabase start

# 3. Linkear con el proyecto cloud para sincronizar migraciones
supabase link --project-ref ujcnglkdwzqlwqgrkspz

# 4. Subir migraciones a produccion
supabase db push
```

| Servicio local | URL |
|---|---|
| API Supabase | `http://127.0.0.1:54321` |
| Studio (UI web) | `http://127.0.0.1:54323` |
| Inbucket (emails de prueba) | `http://127.0.0.1:54324` |
| PostgreSQL directo | `localhost:54322` |

> **Sin configuración manual** — todo está en `supabase/config.toml` versionado en git.

---

## 🐳 Migración a On-Premise con Docker

### Opción A: Stack Supabase Completo (Postgres + Auth + Studio)

```bash
git clone --depth 1 https://github.com/supabase/supabase
cd supabase/docker
cp .env.example .env
# Configura POSTGRES_PASSWORD, JWT_SECRET, ANON_KEY, SERVICE_ROLE_KEY
docker compose up -d
```

Paneles disponibles:
- **Studio:** `http://tu-servidor:8000`
- **PostgreSQL:** puerto `5432`
- **Auth & REST:** `http://tu-servidor:8000/auth/v1`

Cargar esquema ZYTI:
```bash
docker exec -i supabase-db psql -U postgres -d postgres < docker/init.sql
```

### Opción B: Stack Completo de Infraestructura (PostgreSQL + Redis + ZYTI Gateway)

```bash
# Levantar PostgreSQL 16 + Redis 7 + ZYTI Trading Gateway en Docker
docker compose -f docker-compose.infra.yml up -d --build

# Verificar que los 3 contenedores estén saludables
docker compose -f docker-compose.infra.yml ps

# Ver logs del gateway en tiempo real
docker compose -f docker-compose.infra.yml logs -f zyti-gateway
```

El archivo [`docker-compose.infra.yml`](docker-compose.infra.yml) monta [`docker/init.sql`](docker/init.sql) automáticamente al primer inicio y enlaza el clúster Redis en memoria con el servidor WebSocket institucional en el puerto `8080`.

---

## ⚡ ZYTI Trading WebSocket & Redis Gateway (Hot State <2ms)

Microservicio de sincronización multi-dispositivo y baja latencia para terminales y plataformas de fondeo. Permite que cuando un trader abre o cierra una posición en su ordenador, la tablet, el teléfono y todas las pestañas abiertas reciban la orden en sub-5 milisegundos.

### 💻 1. Ejecución Local en Terminal (Directo en Windows/macOS SIN Docker)

No necesitas tener Docker abierto para desarrollar o probar el clúster. El servidor cuenta con **fallback inteligente In-Memory**:

```powershell
# En una terminal dedicada, arrancar el servidor Gateway:
npm run server
```

Salida esperada en terminal:
```text
===============================================================
🚀 ZYTI TRADING WEBSOCKET & REDIS GATEWAY ACTIVO
===============================================================
• Puerto WebSocket & HTTP : http://localhost:8080
• URL WebSocket           : ws://localhost:8080
• Health Check            : http://localhost:8080/health
===============================================================

⚡ [ZYTI Hub] Modo Local In-Memory Activo (Ejecución directa en Windows sin Docker)
```

> **Nota:** Si tienes Redis corriendo en `localhost:6379`, el servidor detectará el clúster automáticamente activando `REDIS_CLUSTER`. Si no hay Redis, opera en `LOCAL_IN_MEMORY` sin fallar.

### 🐳 2. Despliegue con Docker Compose (Para Servidores / VPS)

```bash
# 1. Compilar y levantar PostgreSQL + Redis + Gateway
docker compose -f docker-compose.infra.yml up -d --build

# 2. Consultar el estado de salud del Gateway
curl http://localhost:8080/health
```

Respuesta JSON del Health Check:
```json
{
  "status": "healthy",
  "name": "ZYTI Trading WebSocket & Redis Gateway",
  "version": "1.0.0",
  "uptimeSeconds": 120,
  "activeAccounts": 3,
  "connectedSockets": 6,
  "mode": "REDIS_CLUSTER",
  "redisUrl": "redis://zyti-redis:6379",
  "timestamp": "2026-10-03T02:20:00.000Z"
}
```

### 🌐 3. Despliegue en Producción en VPS (Ubuntu / Debian + Nginx + SSL)

Configuración recomendada con Nginx como proxy inverso para SSL (`wss://api.tudominio.com`):

```nginx
# /etc/nginx/sites-available/zyti-gateway
server {
    server_name api.tudominio.com;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
}
```

Activar y certificar con SSL Let's Encrypt:
```bash
sudo ln -s /etc/nginx/sites-available/zyti-gateway /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d api.tudominio.com
```

### 📦 4. Integración del SDK para Empresas de Fondeo (npm)

Las empresas de fondeo pueden instalar el paquete o importar el cliente SDK directamente en su frontend o backend:

```typescript
import { zytiTradingClient } from '@zyti/trading-sdk';

// 1. Conectar a la pasarela institucional con el ID de la cuenta
zytiTradingClient.connect('ZYTI-100K-TF001');

// 2. Escuchar eventos de trading sincronizados (Aperturas, Cierres, SL/TP, Balance)
const unsubscribe = zytiTradingClient.onEvent((event) => {
  console.log(`Evento recibido [${event.type}]:`, event.payload);
  
  if (event.type === 'TRADE_OPENED') {
    // Sincronizar en UI de la prop firm
  } else if (event.type === 'TRADE_CLOSED') {
    // Actualizar balance y métricas de consistencia
  }
});

// 3. Emitir evento cuando el trader opere
zytiTradingClient.publishEvent({
  type: 'TRADE_OPENED',
  payload: {
    symbol: 'BTC/USDT',
    side: 'LONG',
    size: 0.5,
    entryPrice: 96450.00
  }
});
```

---

## 📡 Contratos de API & Webhooks para Prop Firms

Especificación técnica completa:
👉 [`.agents/skills/zyti-prop-firm-api-and-risk-gateway/SKILL.md`](.agents/skills/zyti-prop-firm-api-and-risk-gateway/SKILL.md)

### Endpoints principales:

| Método | Endpoint | Descripción |
|---|---|---|
| `POST` | `/api/v1/accounts/provision` | Emite cuenta de trader con reglas de riesgo |
| `GET` | `/api/v1/accounts/:id/metrics` | Balance, equity, drawdown en vivo |
| `POST` | `/api/v1/webhooks/verify` | Verifica firma HMAC-SHA256 |

### Webhooks salientes (firma HMAC-SHA256):
- `account.breached` — liquidación forzosa y descalificación
- `account.passed` — objetivo de beneficio alcanzado cumpliendo reglas

---

## 🚀 Despliegue en Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel --prod
```

### Variables de entorno en Vercel

En **Vercel → Settings → Environment Variables** añade todas las variables del `.env` excepto las que empiezan por `DATABASE_URL` y `REDIS_URL` (esas son solo para el servidor/worker).

Variables críticas para Vercel:

| Variable | Tipo |
|---|---|
| `VITE_SUPABASE_URL` | Config |
| `VITE_SUPABASE_ANON_KEY` | Config |
| `VITE_TURNSTILE_SITE_KEY` | Config |
| `TURNSTILE_SECRET_KEY` | Secret |
| `VITE_TELEGRAM_BOT_NAME` | Config |
| `TELEGRAM_BOT_TOKEN` | Secret |
| `VITE_APP_URL` | Config |

Tras añadir las variables: **Deployments → Redeploy** para que tomen efecto.

---

© 2026 **ZYTI Trade**. Todos los derechos reservados.
