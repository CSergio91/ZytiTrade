---
name: zyti-trade-seo-and-ai-search-governance
description: Gobernanza integral de SEO técnico, indexación para motores de búsqueda tradicionales (Google, Bing) y optimización para bots de Inteligencia Artificial (ChatGPT, Perplexity, Claude, Gemini). Incluye metadatos OpenGraph, Twitter Cards, favicons, JSON-LD Schema.org bilingüe, sitemap.xml y robots.txt.
version: 1.0.0
category: SEO & AI Search Discoverability
status: Authoritative
---

# ZYTI TRADE — SEO & AI SEARCH DISCOVERABILITY GOVERNANCE

## 1. OBJETIVO
Posicionar **ZYTI Trade** como la plataforma líder en terminales de trading multi-exchange, copy trading y pasarela de prop firms, tanto en resultados de búsqueda web tradicionales (Google, Bing) como en respuestas generativas de asistentes de IA (SearchGPT, Perplexity, Claude, Gemini).

---

## 2. REGLAS TÉCNICAS DE SEO MULTILINGÜE (/es y /en)
1. **Etiquetas Hreflang Obligatorias en cada página:**
   ```html
   <link rel="alternate" hreflang="es" href="https://zytitrade.com/es" />
   <link rel="alternate" hreflang="en" href="https://zytitrade.com/en" />
   <link rel="alternate" hreflang="x-default" href="https://zytitrade.com/en" />
   ```
2. **Canonical URLs precisas:** Nunca duplicar contenido entre la raíz y los subdirectorios de idioma.
3. **Títulos y Meta-Descripciones Atractivas:**
   - ES: "ZYTI Trade — Terminal de Trading Profesional Multi-Exchange, Copy Trading & Prop Firms"
   - EN: "ZYTI Trade — Institutional Multi-Exchange Trading OS, Copy Trading & Prop Firm Gateway"

---

## 3. OPEN GRAPH & SOCIAL SHARE SPECIFICATION
Toda URL debe incluir metadatos enriquecidos para que al compartir en Telegram, WhatsApp, Discord, X/Twitter o LinkedIn se renderice la tarjeta oficial:
- `og:site_name`: ZYTI Trade
- `og:title`: ZYTI Trade | Institutional Trading OS & Multi-Exchange Terminal
- `og:description`: Opera en Binance, Bybit, OKX y prop firms desde una única terminal ultrarrápida a 60 FPS con copy trading y arbitraje.
- `og:image`: `https://zytitrade.com/og-image.png` (1200x630 píxeles, proporción 1.91:1)
- `og:image:width`: 1200
- `og:image:height`: 630
- `twitter:card`: summary_large_image
- `twitter:image`: `https://zytitrade.com/og-image.png`

---

## 4. IA BOT OPTIMIZATION (ROBOTS.TXT & JSON-LD SCHEMA)
### Robots.txt amigable para rastreadores de IA:
Permitir explícitamente el acceso a los bots de entrenamiento y búsqueda de LLMs:
- `User-agent: Googlebot`
- `User-agent: Bingbot`
- `User-agent: GPTBot`
- `User-agent: ChatGPT-User`
- `User-agent: PerplexityBot`
- `User-agent: ClaudeBot`
- `User-agent: Google-Extended`

### JSON-LD Schema.org:
Inyectar marcado estructurado en formato JSON-LD:
- Tipo: `SoftwareApplication` y `FinancialService`
- Propiedades: `name`, `applicationCategory`, `operatingSystem`, `offers`, `featureList` (Multi-Exchange, Copy Trading, Arbitrage, Prop Firm Gateway).

---

## 5. ESPECIFICACIÓN DE FAVICONS
Para compatibilidad con todos los navegadores y dispositivos móviles:
- `/favicon.ico`: 32x32 y 16x16 multi-layer.
- `/favicon-32x32.png` y `/favicon-16x16.png`
- `/apple-touch-icon.png`: 180x180 para iOS.
- `/android-chrome-192x192.png` y `/android-chrome-512x512.png`
- `/site.webmanifest` con theme_color institucional.
