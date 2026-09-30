<div align="center">

# ⚡ ZYTI Trade — Next-Gen Institutional Trading OS

**Plataforma de Trading Multiactivo, Motor Gráfico KLineChart v10 y Pasarela de Prop Firms**

[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![KLineChart](https://img.shields.io/badge/Engine-KLineChart_v10_(GPU_Canvas)-9333EA?style=for-the-badge)](https://klinecharts.com)
[![Deploy on Vercel](https://img.shields.io/badge/Vercel-Deployment_Ready-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

---

### 🌐 [Explorar Demo en Vivo](#) · 📚 [Documentación de API](#api--webhooks-architecture) · 🐛 [Reportar Incidencia](https://github.com/CSergio91/ZytiTrade/issues)

</div>

---

## 📖 Acerca de ZYTI Trade

**ZYTI Trade** es un Sistema Operativo de Trading (**Trading OS**) de grado institucional diseñado para traders profesionales, brokers y empresas de fondeo (**Prop Firms**). Diseñado bajo una estética de vanguardia *Glassmorphism* (paletas editoriales *Warm Cream* y *Dark Obsidian*), combina la fluidez gráfica acelerada por hardware de **KLineChart v10** a 60 FPS con una arquitectura modular desacoplada y un Gateway agnóstico para múltiples exchanges.

---

## 🌟 Características Destacadas

### 📊 1. Motor Gráfico Canvas KLineChart v10 (60 FPS)
- **Aceleración GPU pura:** Renderizado sin lag incluso con miles de velas históricas y actualización tick-by-tick sin parpadeos.
- **Selector Dinámico de Temporalidades:** Navegación rápida (1s, 1m, 5m, 15m, 1h, 4h, 1D, 1W, 1M, 1Y) con menú desplegable extensible y sistema de favoritos con estrellas (★).
- **Indicadores Técnicos Desacoplados:** EMA, SMA, Bollinger Bands, MACD, RSI, SuperTrend, VWAP, Order Blocks y Liquidity Sweeps.
- **Trading Directo en Pantalla:** Arrastre táctil y visual de niveles de Stop Loss (SL) y Take Profit (TP).

### 📱 2. Experiencia Móvil de Primera Clase (Mobile-First)
- **Hoja Deslizante a Mitad de Pantalla (`50dvh`):** Las secciones de Operar, Orderbook y Posiciones se abren desde abajo ocupando solo la mitad de la pantalla, manteniendo siempre visible el gráfico en tiempo real.
- **Botones Flotantes de 1 Toque (Quick Trade):** Interruptor en el formulario para activar botones flotantes de Compra/Venta rápida sobre el gráfico con precio spot en directo.
- **Navegación Fija Inferior:** Acceso ergonómico con un solo pulgar a los módulos esenciales.

### 💻 3. Entorno de Escritorio Ultra Fluido
- **Barra Lateral Conmutable (Izquierda / Derecha):** Riel vertical compacto que se despliega suavemente en hover por encima del gráfico sin desplazar el canvas ni provocar relayouts.
- **Distribución de Grado Institucional:** Panel de órdenes lateral, libro de órdenes L2 y tabla inferior de posiciones abiertas con cálculo de PnL no realizado en vivo.

### 🏢 4. Aprovisionamiento Prop Firm & Webhooks
- **SSO Deep-Link & Provisioning API:** Aprovisionamiento automático de cuentas y credenciales para firmas de evaluación.
- **Webhooks Salientes en Tiempo Real:** Emisión de eventos criptográficamente firmados (`trade.executed`, `position.closed`, `account.equity_tick`) para auditoría de drawdown y motores de riesgo externos.

### 🔒 5. Privacidad y Seguridad Total (Cero Secretos)
- Repositorio sanitizado: ninguna credencial, API Key o llave privada reside en el código fuente.
- Gobernanza estricta de variables de entorno mediante `.env.example`.

---

## 🏗️ Arquitectura del Proyecto

```text
ZYTI-Trade/
├── .agents/skills/          # Especificaciones institucionales y directrices de diseño
├── src/
│   ├── components/
│   │   ├── terminal/        # Componentes modulares desacoplados del Terminal
│   │   │   ├── TerminalHeader.tsx         # Barra superior institucional & auth toggle
│   │   │   ├── TerminalToolbar.tsx        # Toolbar de temporalidades e indicadores
│   │   │   ├── TerminalOrderForm.tsx      # Formulario de órdenes y Quick Trade switch
│   │   │   ├── TerminalOrderBook.tsx      # Libro de órdenes L2 en tiempo real
│   │   │   ├── TerminalPositions.tsx      # Gestor de posiciones y PnL
│   │   │   ├── TerminalMobileSheet.tsx    # Bottom sheet 50dvh y botones 1-toque
│   │   │   ├── TerminalSideNav.tsx        # Riel lateral conmutable y flyout hover
│   │   │   ├── TerminalExchangeModal.tsx  # Pantallas cristalinas estilo glassmorphism
│   │   │   └── types.ts                   # Interfaces y catálogos normalizados
│   │   ├── TradingTerminal.tsx            # Orquestador del Trading OS
│   │   ├── AuthModal.tsx                  # Modal de autenticación reactivo
│   │   └── ...
│   ├── lib/                 # Clientes desacoplados (Supabase, Webhooks, API)
│   ├── index.css            # Tokens de diseño, animaciones y glassmorphism
│   └── main.tsx             # Punto de entrada de la aplicación
├── vercel.json              # Configuración de reescritura SPA para despliegue en Vercel
├── .env.example             # Plantilla de variables de entorno sanitizada
└── package.json
```

---

## 🚀 Puesta en Marcha Local

### Prerrequisitos
- **Node.js** v18+ o v20+
- **npm**, **pnpm** o **yarn**

### Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/CSergio91/ZytiTrade.git
cd ZytiTrade

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env

# 4. Iniciar el servidor local de desarrollo
npm run dev
```

La aplicación se abrirá en `http://localhost:5173`.

---

## ☁️ Despliegue en Vercel

Este proyecto incluye [vercel.json](vercel.json) preconfigurado para manejar el enrutamiento SPA sin errores 404:

1. Importa el repositorio `https://github.com/CSergio91/ZytiTrade` desde tu panel de **Vercel**.
2. Framework Preset: **Vite**.
3. Configura tus variables de entorno correspondientes (opcionales según tus integraciones de Supabase o API externa).
4. Haz clic en **Deploy**.

---

## 🛠️ Tecnologías Utilizadas

| Categoría | Tecnología |
| :--- | :--- |
| **Frontend Framework** | React 19 + TypeScript |
| **Bundler & Tooling** | Vite 6 |
| **Motor Gráfico** | KLineChart v10 (Canvas 2D / WebGL) |
| **Estilos & UI** | TailwindCSS + Lucide Icons + Canvas Glassmorphism |
| **Estado & Reactividad**| React Hooks + Streaming WebSockets / L2 Mock Data |
| **Despliegue** | Vercel (SPA Re-writes) / Capacitor Ready (Android APK) |

---

## 🛡️ Licencia y Derechos

© 2026 **ZYTI Trade**. Todos los derechos reservados.
Diseñado para la comunidad global de trading cuantitativo e institucional.
