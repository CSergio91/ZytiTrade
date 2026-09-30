# ⚡ ZYTI Trade — Institutional Trading OS & Multi-Venue Terminal

[![License: Proprietary](https://img.shields.io/badge/License-Proprietary-blue.svg)](LICENSE)
[![Engine: KLineChart v10](https://img.shields.io/badge/Engine-KLineChart_v10_(GPU_Canvas)-purple.svg)](https://klinecharts.com)
[![Platform: Web & Android APK](https://img.shields.io/badge/Platform-Web_%7C_Android_APK-emerald.svg)](#roadmap-mobile)
[![Architecture: Open Gateway & Webhooks](https://img.shields.io/badge/Architecture-REST_%2B_Webhooks_Gateway-amber.svg)](#api--webhooks-architecture)

> **ZYTI Trade** es un Sistema Operativo de Trading (Trading OS) de grado institucional diseñado para traders profesionales, plataformas de trading, brokers y empresas de fondeo (Prop Firms). Cuenta con renderizado en Canvas nativo acelerado por GPU a 60 FPS, conectividad agnóstica multi-exchange y un Gateway abierto de aprovisionamiento vía API y Webhooks en tiempo real.

---

## 🌟 Pilares Fundamentales

1. **Terminal Propietaria de Alto Rendimiento:**
   - Motor gráfico KLineChart v10 Canvas a 60 FPS con soporte para velas volumétricas, Order Blocks, Liquidity Sweeps y arrastre directo de niveles de SL/TP sobre el gráfico.
   - Panel de entrada de órdenes institucional (Market, Limit, Stop, Trailing Stop, calculadora de riesgo por % de equity).
   - Orderbook L2 (Depth) y Time & Sales (Tape) en tiempo real con streaming sin cortes.

2. **Aprovisionamiento de Cuentas vía API (Prop Firm / Broker Ready):**
   - Cualquier empresa de fondeo (como Global City Funding u otras firmas) puede crear cuentas de usuario en ZYTI Trade automáticamente mediante una simple llamada a la API:
     ```http
     POST /api/v1/accounts/provision
     ```
   - ZYTI Trade devuelve las credenciales de la cuenta y un token de inicio de sesión directo con un solo clic (**SSO Deep-Link**), para que el trader comience a operar de inmediato sin fricciones.

3. **Arquitectura de Webhooks Salientes:**
   - La terminal emite eventos HTTP en tiempo real hacia la plataforma que gestiona la cuenta:
     - `trade.executed`: ejecución instantánea de órdenes.
     - `position.closed`: resultado de la posición y PnL realizado.
     - `account.equity_tick`: cálculo del balance/equity en caliente para que los motores de riesgo externos puedan auditar drawdowns sin tocar la terminal.
   - Si una cuenta infringe una regla de riesgo externa, la plataforma conectada puede ordenar a ZYTI Trade:
     ```http
     POST /api/v1/positions/close-all
     POST /api/v1/accounts/:id/lock
     ```

4. **Multi-Venue Connectivity (Exchanges & Brokers):**
   - Conectores desacoplados para Binance, Bybit, OKX y puentes hacia MetaTrader 5 (MT5).
   - Motor de simulación interno de alta precisión para cuentas demo o de evaluación.

5. **Flexibilidad Total de Autenticación y Cero Secretos:**
   - Soporte nativo para Supabase Auth sin acoplamiento forzado a un único proyecto.
   - Posibilidad futura de autenticación multi-tenant o bases de datos locales/independientes.
   - **Estricta política de seguridad:** Ninguna clave privada, secret de Supabase o credencial de exchange se almacena en el repositorio. Toda configuración se gestiona vía variables de entorno (`.env` protegido).

---

## 🏗️ Arquitectura del Sistema

```text
                                ┌───────────────────────────┐
                                │        ZYTI TRADE         │
                                │   (Web & Android APK)     │
                                └─────────────┬─────────────┘
                                              │
                        ┌─────────────────────┴─────────────────────┐
                        ▼                                           ▼
             ┌─────────────────────┐                     ┌─────────────────────┐
             │   KLINECHART v10    │                     │   TERMINAL GATEWAY  │
             │   (Canvas Engine)   │                     │    (REST & WSS)     │
             └─────────────────────┘                     └──────────┬──────────┘
                                                                    │
                    ┌───────────────────────────────────────────────┴──────────────────────────────┐
                    ▼                                                                              ▼
         ┌─────────────────────┐                                                        ┌─────────────────────┐
         │  OUTGOING WEBHOOKS  │                                                        │   MARKET CONNECT    │
         │  (To Prop Firms &   │                                                        │  (Binance / Bybit / │
         │   Risk Auditors)    │                                                        │   Simulator / MT5)  │
         └─────────────────────┘                                                        └─────────────────────┘
```

---

## 📱 Roadmap Mobile (Android APK)

ZYTI Trade está preparado para ser empaquetado directamente como **APK oficial para Android**:
- Renderizado nativo vía Capacitor / WebView optimizado para hardware.
- Gestos multitáctiles para navegación rápida de temporalidades y niveles de precio.
- Notificaciones push de ejecuciones y órdenes limit activadas.

---

## 🚀 Inicio Rápido en Desarrollo

```bash
# 1. Clonar el repositorio
git clone <repo-url> zyti-trade
cd zyti-trade

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno (copiar la plantilla)
cp .env.example .env

# 4. Iniciar servidor de desarrollo
npm run dev
```

---

## 🔒 Seguridad y Privacidad

- El archivo `.gitignore` incluye reglas estrictas para evitar fugas de claves o credenciales.
- Nunca comparta ni suba archivos `.env` al repositorio remoto.
- Todas las comunicaciones con webhooks externos utilizan firmas criptográficas HMAC.

---

© 2026 ZYTI Trade. Todos los derechos reservados.
