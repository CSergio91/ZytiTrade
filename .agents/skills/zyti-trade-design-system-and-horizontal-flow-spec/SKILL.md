---
name: zyti-trade-design-system-and-horizontal-flow-spec
description: Sistema de diseño visual, paleta cromática editorial (Warm Cream y Dark Obsidian), arquitectura de navegación horizontal fluida, animaciones con zoom y levitación orgánica para ZYTI Trade.
version: 1.0.0
category: Design System & Motion Engineering
status: Authoritative
---

# ZYTI TRADE — DESIGN SYSTEM & HORIZONTAL MOTION FLOW SPECIFICATION

## 1. FILOSOFÍA VISUAL: EDITORIAL MINIMALISTA & HIGH-PERFORMANCE
ZYTI Trade rechaza las plantillas genéricas sobrecargadas con badges artificiales y cajitas de iconos repetitivas.
Se inspira en productos de diseño de autor (como Linear, Raycast y Scopebird), combinando un fondo editorial cálido y sereno con una terminal de trading de ultra alta precisión.

---

## 2. PALETA CROMÁTICA EXACTA Y PATRONES DE COLOR

### A. Modo Claro (Warm Cream Editorial)
- **Lienzo Base (Canvas & Body):** `#FBF9F4` (Marfil cálido sereno).
- **Tarjetas Principales (Warm Card):** `#FFFFFF` con bisel fino `rgba(220, 214, 202, 0.7)` y sombra orgánica suave `box-shadow: 0 25px 50px -12px rgba(27, 24, 18, 0.08)`.
- **Texto Principal (Headings):** `#020617` / `#0F172A` (Negro azabache absoluto de imprenta).
- **Texto Secundario (Párrafos y Datos):** `#1E293B` (Carbón profundo con contraste 12:1).
- **Acento Hero (Degradado Eléctrico Vanguardista):**
  `linear-gradient(135deg, #7C3AED 0%, #9333EA 45%, #2563EB 100%)`
- **Botón Primario:** Amarillo Mostaza Cálido `#EAB308` (`hover: #CA8A04`) con texto negro.
- **Botón Secundario:** Borde fino de trazo `#0F172A` sobre fondo transparente.
- **Verde de Ejecución Óptima:** `#65A30D` (Verde oliva institucional).
- **Rojo de Alerta de Spread:** `#DC2626` (Rojo carmesí puro).

### B. Modo Oscuro (Dark Obsidian)
- **Lienzo Base:** `#0A0D14` (Obsidiana profundo).
- **Tarjetas:** `#111726` con bisel `#1F293D` y sombra profunda.
- **Texto:** `#F8FAFC` (Blanco limpio) y `#94A3B8` (Slate secundario).

---

## 3. ARQUITECTURA DE NAVEGACIÓN HORIZONTAL FLUIDA
En lugar del scroll vertical convencional:
1. **Paneles Horizontales de Pantalla Completa:**
   - Panel 1: **Hero & Trading Plan en Vivo** (`w-screen`).
   - Panel 2: **Exchanges Soportados & Conectividad WSS** (`w-screen`).
   - Panel 3: **Ecosistema de Servicios (Prop Firms, MultiExchange, Copy, Arbitraje)** (`w-screen`).
2. **Control Multicanal:**
   - Rueda del ratón / Trackpad sincronizada con scroll horizontal.
   - Paginador horizontal en Navbar con indicadores interactivos (`01`, `02`, `03`) y botones anterior/siguiente.
   - Snap fluido (`snap-x snap-mandatory`) para anclaje magnético perfecto.

---

## 4. SISTEMA DE MOTION Y ANIMACIONES
1. **Entrada de Secciones con Zoom (Zoom-in Reveal):**
   - Transición de escala (`scale-95` a `scale-100`) con opacidad progresiva (`opacity-0` a `opacity-100`) y curva `cubic-bezier(0.16, 1, 0.3, 1)`.
2. **Levitación Orgánica (Float Physics):**
   - Las tarjetas satélite de arbitraje y copy trading flotan sutilmente con keyframes de gravedad cero (`translateY(-6px)` con ciclo de 4 segundos).
3. **Barra de Progreso Viva:**
   - Animación de llenado suave del checklist de condiciones cumplidas.
