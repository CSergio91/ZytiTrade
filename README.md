<div align="center">

# ⚡ ZYTI Trade — Institutional Trading OS & Multi-Venue Terminal

**Plataforma de Trading Multiactivo de Grado Institucional, Arquitectura Desacoplada y Pasarela Prop Firm**

[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Deploy on Vercel](https://img.shields.io/badge/Vercel-Deployment_Ready-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

---

### 🌐 [Explorar Plataforma](#) · 📚 [Arquitectura](#-arquitectura-del-sistema) · 🐛 [Reportar Incidencia](https://github.com/CSergio91/ZytiTrade/issues)

</div>

---

## 📖 Acerca de ZYTI Trade

**ZYTI Trade** es un Sistema Operativo de Trading (**Trading OS**) de alto rendimiento diseñado para traders profesionales, brokers y empresas de fondeo (**Prop Firms**).

La plataforma combina una interfaz de usuario avanzada inspirada en *Glassmorphism* (con paletas de diseño *Warm Cream* y *Dark Obsidian*) con una arquitectura completamente modular, reactiva y optimizada para el flujo de trabajo tanto en escritorios profesionales como en dispositivos móviles.

---

## 🌟 Lo Que Hemos Construido

### 📱 1. Experiencia Móvil Optimizada (Mobile-First)
- **Hoja Deslizante a Mitad de Pantalla (`50dvh`):** Las secciones críticas (Formulario de Órdenes, Libro de Órdenes L2 y Posiciones Abiertas) emergen desde la parte inferior ocupando solo la mitad de la pantalla, permitiendo al trader vigilar la acción del precio sin obstruir el área de análisis.
- **Botones Flotantes de Operar con 1 Toque (Quick Trade):** Interruptor configurable que activa accesos directos flotantes para compra y venta inmediata con el precio del activo actualizado en tiempo real.
- **Navegación Táctil Inferior:** Barra ergonómica fija pensada para operación rápida con un solo pulgar.

### 💻 2. Entorno de Trading de Escritorio
- **Riel Lateral Conmutable:** Navegación vertical ultraligera que puede posicionarse a la izquierda o derecha según la preferencia del operador, desplegándose suavemente al pasar el cursor (hover) sin desplazar los paneles de trabajo.
- **Gestión Avanzada de Órdenes:** Ejecución de órdenes Market y Limit, selector de apalancamiento dinámico (1x a 125x) y calculadora de margen en vivo.
- **Libro de Órdenes L2 (Order Book):** Profundidad de mercado bid/ask en tiempo real con barras de volumen relativo.
- **Control de Posiciones y PnL:** Monitorización continua de posiciones abiertas, precio de entrada, precio de liquidación y beneficios/pérdidas no realizados.

### ⏱️ 3. Selector Dinámico de Temporalidades e Indicadores
- Selector rápido con menú desplegable que abarca desde temporalidades en segundos (1s, 5s) hasta mensuales y anuales (1M, 1Y).
- Sistema interactivo de favoritos con estrellas (★) para anclar o desanclar temporalidades e indicadores según la estrategia del usuario.

### 🧩 4. Arquitectura Modular y Desacoplada
- Estructura organizada en componentes independientes y reutilizables dentro de `src/components/terminal/` para garantizar máxima mantenibilidad, escalabilidad y rendimiento sin sobrecargar la vista principal.

### 🏢 5. Integración con Prop Firms y Webhooks
- **Aprovisionamiento Automatizado:** Preparado para recibir y autenticar cuentas de trading emitidas por firmas de evaluación o brokers externos.
- **Webhooks Salientes:** Emisión de eventos en caliente (`trade.executed`, `position.closed`, `account.equity_tick`) para auditoría de métricas de riesgo y control de drawdown.

### 🔒 6. Cero Secretos y Seguridad
- Repositorio completamente sanitizado: sin claves privadas, tokens de acceso ni credenciales expuestas.
- Entorno aislado configurado mediante variables seguras (`.env.example`).

---

## 🏗️ Arquitectura del Sistema

```text
ZYTI-Trade/
├── .agents/skills/          # Especificaciones de diseño y directrices del ecosistema
├── src/
│   ├── components/
│   │   ├── terminal/        # Componentes desacoplados del Trading Terminal
│   │   │   ├── TerminalHeader.tsx         # Barra superior institucional & perfil
│   │   │   ├── TerminalToolbar.tsx        # Toolbar de temporalidades e indicadores
│   │   │   ├── TerminalOrderForm.tsx      # Formulario de órdenes y Quick Trade
│   │   │   ├── TerminalOrderBook.tsx      # Libro de órdenes L2
│   │   │   ├── TerminalPositions.tsx      # Gestor de posiciones y PnL
│   │   │   ├── TerminalMobileSheet.tsx    # Hoja modal 50dvh y botones flotantes
│   │   │   ├── TerminalSideNav.tsx        # Navegación lateral conmutable y hover flyout
│   │   │   ├── TerminalExchangeModal.tsx  # Pantallas modales glassmorphism
│   │   │   └── types.ts                   # Tipos y catálogos normalizados
│   │   ├── TradingTerminal.tsx            # Orquestador del Trading OS
│   │   ├── AuthModal.tsx                  # Autenticación y acceso
│   │   └── ...
│   ├── lib/                 # Utilidades y conectores
│   ├── index.css            # Estilos globales y tokens glassmorphism
│   └── main.tsx             # Entrada de la aplicación
├── vercel.json              # Configuración de rutas SPA para Vercel
├── .env.example             # Plantilla de variables de entorno
└── package.json
```

---

## 🚀 Puesta en Marcha Local

### Prerrequisitos
- **Node.js** (v18+ recomendado)
- Gestor de paquetes (**npm**, **pnpm** o **yarn**)

### Pasos de Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/CSergio91/ZytiTrade.git
cd ZytiTrade

# 2. Instalar dependencias
npm install

# 3. Preparar variables de entorno
cp .env.example .env

# 4. Iniciar entorno de desarrollo
npm run dev
```

La terminal estará disponible en `http://localhost:5173`.

---

## ☁️ Despliegue en Vercel

El proyecto incluye el archivo [vercel.json](vercel.json) configurado para despliegue directo con reescritura de rutas para Single Page Applications (SPA):

1. Conecta tu cuenta de Vercel con el repositorio `https://github.com/CSergio91/ZytiTrade`.
2. Vercel detectará automáticamente el framework **Vite**.
3. Haz clic en **Deploy**.

---

## 🛠️ Tecnologías

| Área | Stack |
| :--- | :--- |
| **Frontend** | React 19 + TypeScript |
| **Herramientas de Construcción** | Vite 6 |
| **Estilos & Animaciones** | TailwindCSS v4 + Lucide Icons + Glassmorphism UI |
| **Despliegue** | Vercel (SPA Routing) |

---

## 🛡️ Licencia y Propiedad

© 2026 **ZYTI Trade**. Todos los derechos reservados.
Desarrollado para entornos de trading cuantitativo, brokers y firmas de fondeo.
