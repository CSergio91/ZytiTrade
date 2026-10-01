# ⚡ ZYTI Trade — Institutional Trading OS & Prop Firm Gateway

Plataforma de trading multiactivo de grado institucional diseñada para traders profesionales, brokers y empresas de fondeo (**Prop Firms**), con motor KLineChart v10 Canvas a 60 FPS, arquitectura distribuida Fan-Out con Redis, y soporte híbrido **Cloud / On-Premise**.

---

## 📑 Tabla de Contenidos
1. [Arquitectura del Sistema](#-arquitectura-del-sistema)
2. [Puesta en Marcha Rápida (Entorno de Desarrollo)](#-puesta-en-marcha-rápida-entorno-de-desarrollo)
3. [Configuración de Base de Datos & Auth (Fase 1: Supabase Cloud)](#-configuración-de-base-de-datos--auth-fase-1-supabase-cloud)
4. [Guía Paso a Paso: Migración a Servidor Propio / Local (On-Premise con Docker)](#-guía-paso-a-paso-migración-a-servidor-propio--local-on-premise-con-docker)
5. [Arquitectura Fan-Out con Redis (1 Sola Conexión Central a Binance)](#-arquitectura-fan-out-con-redis-1-sola-conexión-central-a-binance)
6. [Contratos de API & Webhooks para Empresas de Fondeo](#-contratos-de-api--webhooks-para-empresas-de-fondeo)
7. [Variables de Entorno (.env)](#-variables-de-entorno-env)

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
 [ POSTGRESQL / AUTH ]   [ TRADER ENTRA A ZYTI TERMINAL ]
 (Cuentas, Reglas, PnL)         │
                                │ Suscripción WS de mercado
                                ▼
                    [ ZYTI WEBSOCKET GATEWAY ]
                                ▲
                                │ Pub/Sub en memoria
                                │
                      [ REDIS IN-MEMORY BUS ]
                                ▲
                                │ 1 conexión WebSocket centralizada por par
                                │
                    [ INGESTION WORKER CENTRAL ]
                                ▲
                                │
                     [ BINANCE / BYBIT / OKX ]
```

---

## 🚀 Puesta en Marcha Rápida (Entorno de Desarrollo)

```bash
# 1. Clonar el repositorio
git clone https://github.com/CSergio91/ZytiTrade.git
cd ZytiTrade

# 2. Instalar dependencias
npm install

# 3. Iniciar el servidor local de desarrollo
npm run dev
```

La plataforma estará disponible en `http://localhost:5173`.

---

## ☁️ Configuración de Base de Datos & Auth (Fase 1: Supabase Cloud)

Para empezar a desarrollar y probar de inmediato sin complicaciones de virtualización en Windows:

1. Entra a [supabase.com](https://supabase.com) y crea una cuenta gratuita.
2. Haz clic en **"New Project"**, nómbralo `zyti-trade` y define una contraseña segura para tu base de datos.
3. En el menú lateral izquierdo, ve a **SQL Editor**, haz clic en **"New Query"** y pega el contenido completo de nuestro archivo:
   - [`docker/init.sql`](docker/init.sql)
4. Haz clic en **"Run"**. En 2 segundos se crearán automáticamente:
   - Tabla `prop_firms` (empresas clientes de ZYTI y sus API Keys).
   - Tabla `trading_accounts` (cuentas emitidas a los traders con reglas dinámicas de riesgo).
   - Tabla `account_trades` (histórico de órdenes ejecutadas con PnL).
   - Tabla `equity_snapshots` (auditoría continua de drawdown).
5. Ve a **Project Settings > API** y copia:
   - **Project URL**
   - **Anon public key**
6. Agrégalas en tu archivo `.env`:
   ```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
   ```

---

## 🖥️ Guía Paso a Paso: Migración a Servidor Propio / Local (On-Premise con Docker)

Cuando decidas llevar ZYTI a tu propio servidor físico o a un VPS de producción (Hetzner, OVH, AWS, Ubuntu/Debian), **no tendrás que cambiar nada de código**, solo apuntar la conexión.

### Opción A: Stack Completo Supabase On-Premise (Postgres + Auth + Studio Web)

En tu servidor Linux (o local con Docker funcionando):

```bash
# 1. Clonar el repositorio oficial de Supabase Docker
git clone --depth 1 https://github.com/supabase/supabase
cd supabase/docker

# 2. Copiar el archivo de entorno de ejemplo
cp .env.example .env

# 3. Generar tus claves JWT secretas y contraseñas seguras en .env
# (Configura POSTGRES_PASSWORD, JWT_SECRET, ANON_KEY y SERVICE_ROLE_KEY)

# 4. Iniciar todos los servicios de Supabase (Postgres, Auth, Kong, Studio)
docker compose up -d
```

Una vez levantado:
- **Supabase Studio (Panel Web visual):** `http://tu-servidor:8000`
- **PostgreSQL Directo:** Puerto `5432`
- **Auth & REST API:** `http://tu-servidor:8000/auth/v1` y `/rest/v1`

Para cargar el esquema inicial de ZYTI en tu servidor propio:
```bash
docker exec -i supabase-db psql -U postgres -d postgres < /ruta/a/ZYTI-Trade/docker/init.sql
```

### Opción B: Stack Ligero ZYTI (PostgreSQL 16 + Redis Alpine)
Si prefieres un entorno ultraligero que solo use Postgres y Redis sin la sobrecarga del panel completo:

```bash
# Desde la raíz de ZYTI-Trade:
docker compose -f docker-compose.infra.yml up -d
```
El archivo [`docker-compose.infra.yml`](docker-compose.infra.yml) ya monta automáticamente el script [`docker/init.sql`](docker/init.sql) al iniciar por primera vez.

---

## ⚡ Arquitectura Fan-Out con Redis (1 Sola Conexión Central a Binance)

En lugar de que cada navegador de usuario abra un WebSocket a Binance (lo que provoca baneos de IP por exceso de conexiones):

1. **Worker Central (`src/server/worker.ts`):**
   - Se ejecuta en segundo plano con Node.js (`npm run worker`).
   - Mantiene **1 sola conexión WebSocket persistente** con Binance por instrumento (ej: `btcusdt@kline_15m` y `btcusdt@depth20`).
   - Escribe en Redis Pub/Sub:
     - Canal: `stream:kline:BTC/USDT:15m`
     - Canal: `stream:orderbook:BTC/USDT`
2. **Gateway Server (`src/server/gateway.ts`):**
   - Escucha los canales de Redis en memoria.
   - Distribuye en milisegundos a todos los terminales conectados (10, 100 o 10.000 traders concurrentes) sin abrir ninguna conexión adicional hacia Binance.

---

## 📡 Contratos de API & Webhooks para Empresas de Fondeo

Consulta la especificación técnica completa en:
👉 [`.agents/skills/zyti-prop-firm-api-and-risk-gateway/SKILL.md`](.agents/skills/zyti-prop-firm-api-and-risk-gateway/SKILL.md)

### Resumen de Endpoints:
- `POST /api/v1/accounts/provision`: Emite una cuenta de trader con reglas de riesgo personalizadas (capital inicial, drawdown diario máx, profit target, SL obligatorio).
- `GET /api/v1/accounts/:id/metrics`: Consulta en vivo el balance, equidad, drawdown y estadísticas de un trader.
- **Webhooks Salientes con firma HMAC-SHA256**:
  - `account.breached`: Notificación inmediata de liquidación forzosa y descalificación.
  - `account.passed`: Notificación de objetivo de beneficio alcanzado cumpliendo las reglas.

---

## 🔐 Variables de Entorno (.env)

Crea un archivo `.env` en la raíz del proyecto basándote en este modelo:

```env
# Cliente Supabase (Cloud o Servidor Propio)
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui

# Conexión Directa a Base de Datos (Para Worker y Backend)
DATABASE_URL=postgresql://postgres:tu_password@localhost:5432/zyti_trade

# Redis para Fan-Out
REDIS_URL=redis://localhost:6379

# Firma de Seguridad de ZYTI Gateway
ZYTI_ADMIN_SECRET=clave_maestra_para_panel_admin
```

---

© 2026 **ZYTI Trade**. Todos los derechos reservados.
