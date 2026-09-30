---
name: zyti-trade-terminal-and-api-governance
description: Especificación arquitectónica, contratos de API, protocolo de webhooks y gobernanza técnica para la terminal autónoma ZYTI Trade.
version: 1.0.0
category: Trading Terminal OS & Infrastructure
status: Active
---

# ZYTI TRADE — TERMINAL OS & API GOVERNANCE

## 1. VISIÓN DEL PRODUCTO
**ZYTI Trade** es una Terminal de Trading de Grado Institucional (Trading OS) 100% independiente de cualquier broker, exchange o empresa de fondeo específica.

Funciona como:
1. **Trading Terminal Autónoma:** Frontend Web y Mobile (APK Android) con renderizado en Canvas GPU (KLineChart v10 a 60 FPS).
2. **Broker & Prop-Firm Gateway:** Expone una API REST y un despachador de Webhooks para que empresas de fondeo (como Global City Funding) y brokers puedan aprovisionar cuentas de trading vía API y recibir ejecuciones en tiempo real.
3. **Multi-Venue Connectivity:** Conectores desacoplados para Binance, Bybit, OKX y MT5 Bridge.

---

## 2. FLUJO DE APROVISIONAMIENTO VÍA API (PROVISIONING FLOW)

Cuando una empresa de fondeo o broker integra ZYTI Trade:
1. La empresa llama a: `POST /api/v1/accounts/provision`
   - Parámetros: `firm_id`, `trader_email`, `initial_balance`, `currency`, `leverage`, `webhook_url`.
2. ZYTI Trade genera:
   - `account_id` único.
   - `access_token` / Token de sesión de un solo clic.
   - Credenciales de trading (Login ID + Passkey).
3. El trader puede acceder:
   - Vía Deep-Link SSO: `https://trade.zyti.com/?account={id}&token={sso_token}`
   - O iniciando sesión en ZYTI Trade con sus credenciales.

---

## 3. CONTRATOS DE API DE ZYTI TRADE

### Endpoints REST
- `POST /api/v1/accounts/provision`: Crea una cuenta de trading vinculada a un webhook.
- `GET /api/v1/accounts/:id/summary`: Balance, Equity, Margen utilizado, Margen libre, PnL no realizado.
- `POST /api/v1/orders`: Envío de orden (MARKET, LIMIT, STOP).
- `DELETE /api/v1/orders/:id`: Cancelación de orden pendiente.
- `POST /api/v1/positions/close-all`: Cierre forzoso de emergencia (ejecutable por el Risk Engine de la Prop Firm).
- `POST /api/v1/accounts/:id/lock`: Bloqueo inmediato de operativa por infracción de reglas de fondeo.

### Protocolo de Webhooks Salientes
ZYTI Trade emite eventos HTTP POST firmados criptográficamente (HMAC-SHA256) hacia el `webhook_url` registrado:
- `trade.executed`: Orden ejecutada con precio de llenado, slippage y comisión.
- `position.updated`: Cambio de PnL no realizado tras tick de mercado.
- `position.closed`: Posición cerrada con PnL neto realizado.
- `account.margin_warning`: Nivel de margen crítico.

---

## 4. REGLAS ARQUITECTÓNICAS INVIOLABLES
1. **Cero Secretos en el Repositorio:** Ni claves de Supabase, ni API secrets de exchanges, ni tokens privados deben commitearse. Toda configuración se inyecta por `.env` ignorado por Git.
2. **Autenticación Desacoplada:** El login de ZYTI soporta Supabase Auth pero nunca depende de un único esquema de base de datos. Las cuentas de fondeo se validan mediante tokens firmados o API keys de cuenta.
3. **Canvas a 60 FPS:** KLineChart v10 debe operar con ciclo de vida limpio sin fugas de memoria ni re-renders innecesarios de React.
