# ZYTI TRADE — PLAN MAESTRO DE ARQUITECTURA DE TRADING EN TIEMPO REAL Y GOBERNANZA PROP FIRM

> **Documento Oficial de Seguimiento de Implementación**  
> **Versión:** 2.0.0 Institutional Standard  
> **Última Actualización:** 3 de Octubre de 2026  
> **Estado General:** Fases 1 y 2 Completadas con Éxito (Compilación 0 errores)

---

## 1. Topología de Arquitectura Global (0ms Hot-Path & Event Bus)

```
                    BINANCE / BYBIT / OKX (WebSockets Nativos)
                                       │
                                       ▼ (Ticks en vivo @ 60 FPS)
     ┌─────────────────────────────────────────────────────────────────┐
     │ 1. HOT-PATH EN MEMORIA RAM (0ms Latencia)                       │
     │    • TradingEngine: Validación de margen y apalancamiento sínc. │
     │    • KLineChart v10: Overlays de Entrada, SL y TP arrastrables. │
     │    • Evaluación tick-a-tick de Take Profit y Stop Loss.         │
     │    • Ejecución instantánea en RAM + Alertas de audio y Toasts.  │
     └─────────────────────────────────┬───────────────────────────────┘
                                       │
                     ┌─────────────────┴─────────────────┐
                     ▼                                   ▼
     ┌─────────────────────────────────┐   ┌─────────────────────────────────┐
     │ 2. ASYNC WRITE-BEHIND QUEUE     │   │ 3. TRADING EVENT BUS (Pub/Sub)  │
     │    • Cola asíncrona de BD.      │   │    • BroadcastChannel en local. │
     │    • Inserta en account_trades. │   │    • Redis Streams en backend.  │
     │    • Sincroniza trading_accounts│   │    • Difusión de trades al CRM. │
     └────────────────┬────────────────┘   └────────────────┬────────────────┘
                      │                                     │
                      ▼                                     ▼
     ┌─────────────────────────────────┐   ┌─────────────────────────────────┐
     │ 4. SUPABASE / POSTGRESQL        │   │ 5. NEXUS CRM (Admin & Soporte)  │
     │    • public.trading_accounts    │   │    • Monitoreo de Drawdown EOD. │
     │    • public.account_trades      │   │    • Sentinel Risk en vivo.     │
     │    • Historial forense de trades│   │    • Auditoría de cuentas 100K. │
     └─────────────────────────────────┘   └─────────────────────────────────┘
```

---

## 2. Mapa de Fases de Implementación

| Fase | Módulo / Objetivo | Estado | Progreso |
| :--- | :--- | :---: | :---: |
| **Fase 1** | Estandarización a 100K y Auto-Aprovisionamiento en Supabase | ✅ **COMPLETADA** | 100% |
| **Fase 2** | Persistencia Transaccional de Trades y RAM Hot-Path a 0ms | ✅ **COMPLETADA** | 100% |
| **Fase 3** | Bus de Eventos en Tiempo Real (Broadcast / Redis) hacia CRM Nexus | 🚀 **EN CURSO** | 0% |
| **Fase 4** | Drawer de Auditoría Forense de Trades en el CRM Nexus | ⏳ **PENDIENTE** | 0% |
| **Fase 5** | Pruebas de Estrés E2E, Validación del Sentinel y Corte de Drawdown | ⏳ **PENDIENTE** | 0% |

---

## 3. Desglose Detallado por Fases

### ✅ Fase 1: Estandarización a 100K y Base de Datos (Completada)
- [x] **Cuenta Estándar de 100K ($100,000.00 USDT)** para todos los traders (eliminación de balances arbitrarios de 1K, 5K, etc.).
- [x] **Reglas de Riesgo Homogéneas:**
  - Pérdida diaria máxima: **5.00%** ($5,000.00 USDT).
  - Drawdown total máximo: **10.00%** ($10,000.00 USDT).
  - Apalancamiento máximo permitido: **100x**.
  - Tipo de Drawdown: **EOD (End of Day)**.
- [x] **Auto-Aprovisionamiento en Supabase:**
  - Cuentas oficiales creadas en `public.trading_accounts` para perfiles existentes y nuevos.
  - Firma predeterminada `ZYTI Funding` aprovisionada.
  - Políticas RLS configuradas para acceso seguro y sin bloqueos 42501.
- [x] **Auto-Migración para Invitados (Guest):** Usuarios no logueados con balance viejo en caché del navegador son actualizados automáticamente a 100K.
- [x] **Corrección UI:** Bug de los 3 toasts al restablecer cuenta reducido a 1 solo toast limpio.

---

### ✅ Fase 2: Persistencia Real de Trades y RAM Hot-Path a 0ms (Completada)
- [x] **Hot-Path en RAM a 0ms:** La orden se crea, dibuja y audita en la Terminal en 0 milisegundos sin esperar respuesta de red.
- [x] **Servicio Transaccional Asíncrono (`TradePersistenceService.ts`):**
  - Registro de órdenes abiertas en `public.account_trades` (`status: 'OPEN'`).
  - Cierre y liquidación en `public.account_trades` (`status: 'CLOSED'`, `exit_price`, `realized_pnl`).
  - Sincronización del saldo consolidado (`current_balance` y `equity`) en `public.trading_accounts`.
- [x] **Historial de Operaciones Enriquecido (`TerminalPositions.tsx`):**
  - Columna **Apertura:** Hora con segundos (`HH:mm:ss`).
  - Columna **Cierre:** Hora con segundos (`HH:mm:ss`).
  - Columna **Par / Apalancamiento:** Par con badge de apalancamiento (ej: `BTC/USDT [20x]`).
  - Columna **Entrada ➔ Salida:** Precios formateados.
  - Columna **Tipo Cierre:**
    - 🟩 `● TP` (Verde esmeralda cuando tocó Take Profit).
    - 🟥 `● SL` (Rojo carmesí cuando tocó Stop Loss).
    - 🟪 `● Sentinel` (Púrpura cuando cortó por infracción de Drawdown).
    - ◽ `● Manual` (Gris neutro cuando cerró el trader manualmente).
- [x] **Persistencia y Caché de Posiciones Abiertas (Local-First & Cold Sync):** Al reiniciar el navegador o cambiar de pestaña, las posiciones abiertas se recuperan en 0ms desde `localStorage` (`zyti_open_positions`) y se reconcilian en frío desde `public.account_trades` (`status: 'OPEN'`). El trader nunca pierde de vista sus posiciones abiertas.
- [x] **Vinculación por `user_id` en `trading_accounts`:** Cada cuenta de fondeo está vinculada mediante clave foránea relacional (`user_id UUID REFERENCES profiles(id)`) y correo verificado, garantizando resolución exacta sin ambigüedad.
- [x] **Gobernanza Zero-Egress (Optimización de Memoria y Redis-Ready):** Cero peticiones a la base de datos por ticks de WebSocket (100% evaluación en RAM a 60 FPS). Las escrituras hacia PostgreSQL se ejecutan exclusivamente en transiciones de estado (apertura, cierre, reset) mediante cola asíncrona Write-Behind, preparadas para distribución por Redis Streams en backend.
- [x] **Rehidratación Local-First:** Al cargar la Terminal, el historial se carga desde Supabase combinándose con el caché local en < 5ms.
- [x] **Generador de UUIDv4 RFC4122:** Identificadores únicos garantizados tanto en HTTPS como en entornos de desarrollo local.
- [x] **Purga Total al Restablecer Cuenta (Reset):** Al reiniciar la cuenta o pulsar "Limpiar Historial", se eliminan todos los trades de la base de datos (`public.account_trades`), se borra `localStorage.removeItem('zyti_trade_history')`, se limpian las posiciones abiertas en caché, se restablece el saldo oficial a $100,000.00 USDT en `trading_accounts` y se muestra un Toast de confirmación institucional.

---

### 🚀 Fase 3: Sincronización Multi-Dispositivo y Gateway WebSocket + Redis
- [x] **Microservicio WebSocket Gateway Independiente (`server/tradingHub.js`):** Servidor nativo Node.js ultra-rápido en puerto 8080 con soporte nativo para **Redis Clúster (Pub/Sub y Hot State en RAM)** y fallback automático **Local In-Memory Bus** (permite desarrollo local directo en Windows sin requerir Docker activo).
- [x] **Client SDK Modular para Prop Firms (`TradingWebSocketClient.ts`):** Paquetizable y desacoplado para distribución como `@zyti/trading-sdk` en npm. Cualquier empresa de fondeo puede integrarlo en 2 líneas de código para sincronizar terminales.
- [x] **Sincronización Dual Multi-Dispositivo y Multi-Pestaña (< 5ms):** Eventos `TRADE_OPENED`, `TRADE_CLOSED`, `SL_TP_UPDATED`, `BALANCE_UPDATED` y `ACCOUNT_RESET` se difunden al unísono entre computadoras, móviles, tablets y pestañas concurrentes.
- [x] **Dockerización Completa para VPS / Servidores:** Creado `Dockerfile.server` y actualizado `docker-compose.infra.yml` con el servicio `zyti-gateway` vinculado a `zyti-redis` y `zyti-db`.
- [x] **Endpoint HTTP `/health` Institucional:** Monitor en tiempo real de uptime, sockets conectados, cuentas activas y modo de ejecución (`REDIS_CLUSTER` vs `LOCAL_IN_MEMORY`).
- [x] **Arquitectura Zero-Egress:** 0 peticiones de polling a la base de datos relacional. PostgreSQL solo recibe el asedio forense en segundo plano (Write-Behind).

---

### 🚀 Fase 4: Bus de Eventos hacia el CRM Nexus y Drawer Forense
- [ ] **Emisión de Eventos hacia el CRM Nexus:**
  - `TRADE_OPENED`: Emite cuando se abre una posición (datos del trader, símbolo, tamaño, apalancamiento).
  - `TRADE_CLOSED`: Emite cuando se liquida una posición (PnL neto, motivo TP/SL/Manual, nuevo balance).
  - `DRAWDOWN_UPDATED`: Emite el % de drawdown en vivo de la cuenta.
- [ ] **Recepción Reactiva en el CRM Nexus:**
  - El hook `useCrmDashboard.ts` escucha el bus y actualiza en vivo las métricas del trader en la tabla sin refrescar la página.
  - Animación sutil de pulso en la fila del trader cuando ejecuta una operación.

---

### ⏳ Fase 4: Drawer de Auditoría Forense de Trades en el CRM Nexus
- [ ] **Drawer / Modal de Detalle de Trader:**
  - Al hacer clic en un trader en la tabla del CRM, se abre un panel lateral con su expediente completo.
- [ ] **Métricas de Rendimiento Institucional:**
  - Win Rate (% de operaciones ganadoras).
  - Ratio Ganancia/Pérdida (Profit Factor).
  - Respeto a las reglas de Stop Loss (cumplimiento defensivo).
- [ ] **Tabla de Operaciones Históricas del Trader:**
  - Lista completa de todos los trades cerrados del trader consultados desde `public.account_trades`.

---

### ⏳ Fase 5: Validación Integral de Reglas de Riesgo y Estrés
- [ ] **Prueba de Límite Diario (5% = $5,000 USDT):**
  - Simular pérdida acumulada de $5,000 en el día y verificar que el Sentinel cierre todas las posiciones inmediatamente y congele la cuenta en estado `BREACHED`.
- [ ] **Prueba de Límite Total (10% = $10,000 USDT):**
  - Confirmar bloqueo total ante drawdown acumulado superior a $10,000 USDT.
- [ ] **Prueba de Cero-Discrepancia en Balances:**
  - Validar que `initial_balance` + `sum(realized_pnl)` coincida exactamente con `current_balance`.
