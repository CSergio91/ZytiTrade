---
name: zyti-trade-seo-and-ai-search-governance
description: Gobernanza integral de SEO técnico dinámico por activo, indexación para motores de búsqueda tradicionales (Google, Bing) y optimización para bots de Inteligencia Artificial (ChatGPT, Perplexity, Claude, Gemini). Incluye arquitectura de rutas por par (/trade/:symbol), metadatos OpenGraph dinámicos, esquema JSON-LD FinancialProduct, modo Guest/Observer sin muro de login y sitemap multiactivo.
version: 2.0.0
category: SEO & AI Search Discoverability
status: Authoritative
---

# ZYTI TRADE — SEO & AI SEARCH DISCOVERABILITY GOVERNANCE

## 1. OBJETIVO
Posicionar **ZYTI Trade** como la plataforma líder en terminales de trading multi-exchange, copy trading y gráficos financieros institucionales, tanto en motores de búsqueda tradicionales (Google, Bing) como en respuestas generativas de asistentes de IA (SearchGPT, Perplexity, Claude, Gemini), emulando el modelo de alto tráfico orgánico de TradingView y Binance.

---

## 2. ARQUITECTURA DE RUTAS DINÁMICAS POR SÍMBOLO (/trade/:symbol)
Para maximizar la indexación de cada par y permitir compartir enlaces directos entre traders y comunidades:
1. **Patrón de URL canónico:**
   ```text
   https://zytitrade.com/es/trade/:symbol       (Ej: /es/trade/BTCUSDT)
   https://zytitrade.com/en/trade/:symbol       (Ej: /en/trade/BTCUSDT)
   ```
2. **Navegación fluida SPA (Sin recargas):**
   * Al alternar de par dentro de la terminal, el estado de React y la suscripción WebSocket cambian en memoria en sub-50ms.
   * La barra de direcciones se actualiza de forma síncrona sin refrescar la página mediante:
     ```typescript
     window.history.replaceState(null, '', `/${lang}/trade/${selectedSymbol}`);
     ```
3. **Deep-Linking y Acceso Directo:**
   * Si un visitante o crawler accede directamente a una URL con símbolo, la terminal se inicializa inmediatamente centrada en ese par.

---

## 3. MODELO "GUEST / OBSERVER" (CERO MURO DE LOGIN PARA BOTS Y VISITANTES)
**Principio inviolable:** Ningún bot de búsqueda ni visitante primerizo debe toparse con una pantalla de login obligatoria para ver un gráfico.

1. **Lectura Pública Irrestricta (Read-Only):**
   * El gráfico KLineChart v10, el libro de órdenes L2 y las cotizaciones en streaming vía WebSocket deben renderizarse públicamente.
   * Googlebot, Bingbot, GPTBot y PerplexityBot deben tener acceso total al DOM rendered para extraer contenido, precios y estructura.
2. **Escritura Protegida (Order Execution):**
   * Toda acción que implique ejecución (Comprar/Long, Vender/Short, programar alertas o abrir posiciones) abre de forma elegante el modal de autenticación (`AuthModal`) con acceso en 1 clic a la Cuenta Demo de $100,000 o login con Telegram.

---

## 4. METADATOS Y HEAD DINÁMICOS POR ACTIVO
Al cargar o cambiar de par, el cliente debe hidratar los metadatos del documento dinámicamente:

### 1. Title Tags Dinámicos
* **ES:** `${symbol} Gráfico en Vivo, Precio y Libro de Órdenes | ZYTI Trade`
  *(Ej: "BTC/USDT Gráfico en Vivo, Precio y Libro de Órdenes | ZYTI Trade")*
* **EN:** `${symbol} Live Chart, Real-Time Price & Order Book | ZYTI Trade`
  *(Ej: "BTC/USDT Live Chart, Real-Time Price & Order Book | ZYTI Trade")*

### 2. Meta Descriptions Específicas
* **ES:** `Analiza ${baseAsset}/${quoteAsset} en tiempo real a 60 FPS con libro de órdenes L2 institucional, arbitraje multi-exchange y ejecución directa en ZYTI Trade.`
* **EN:** `Analyze ${baseAsset}/${quoteAsset} in real-time at 60 FPS with institutional L2 depth, multi-exchange arbitrage, and direct execution on ZYTI Trade.`

### 3. Canonical & Hreflang por Par
```html
<link rel="canonical" href="https://zytitrade.com/es/trade/BTCUSDT" />
<link rel="alternate" hreflang="es" href="https://zytitrade.com/es/trade/BTCUSDT" />
<link rel="alternate" hreflang="en" href="https://zytitrade.com/en/trade/BTCUSDT" />
<link rel="alternate" hreflang="x-default" href="https://zytitrade.com/en/trade/BTCUSDT" />
```

---

## 5. OPEN GRAPH & SOCIAL PREVIEW (CARDS PARA TELEGRAM, TWITTER, WHATSAPP)
Cuando un usuario comparta un análisis de un activo en redes o mensajería:
* `og:site_name`: ZYTI Trade
* `og:title`: `${symbol} • Gráfico Institucional & Profundidad L2 | ZYTI Trade`
* `og:description`: `Cotizaciones en vivo, profundidad de libro de órdenes y arbitraje para ${symbol}. Conexión multi-exchange de ultra-baja latencia.`
* `og:url`: `https://zytitrade.com/${lang}/trade/${symbol}`
* `og:image`: `https://zytitrade.com/og-image.png` (o tarjeta dinámica de par, 1200x630 píxeles)
* `twitter:card`: `summary_large_image`
* `twitter:title`: `${symbol} • ZYTI Trade Terminal`

---

## 6. DATOS ESTRUCTURADOS JSON-LD SCHEMA.ORG
Para que Google reconozca el par como un activo financiero indexable:
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "FinancialProduct",
      "name": "BTC/USDT Perpetual Market",
      "tickerSymbol": "BTCUSDT",
      "category": "Cryptocurrency Derivative",
      "provider": {
        "@type": "FinancialService",
        "name": "ZYTI Trade",
        "url": "https://zytitrade.com"
      }
    },
    {
      "@type": "SoftwareApplication",
      "name": "ZYTI Trade Terminal",
      "applicationCategory": "FinanceApplication",
      "operatingSystem": "Web, Windows, macOS, Android, iOS",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    }
  ]
}
</script>
```

---

## 7. OPTIMIZACIÓN PARA RASTREADORES DE IA & ROBOTS.TXT
Asegurar que los bots de los modelos generativos tengan acceso explícito a las rutas públicas:
* `User-agent: Googlebot`
* `User-agent: Bingbot`
* `User-agent: GPTBot`
* `User-agent: ChatGPT-User`
* `User-agent: PerplexityBot`
* `User-agent: ClaudeBot`
* `User-agent: Google-Extended`

Permitir expresamente:
```text
Allow: /
Allow: /es/
Allow: /en/
Allow: /es/trade/*
Allow: /en/trade/*
Disallow: /api/
Disallow: /admin/
```

---

## 8. SITEMAP DINÁMICO DE PARES (sitemap.xml)
El mapa del sitio debe incluir todos los pares soportados de forma exhaustiva:
```xml
<url>
  <loc>https://zytitrade.com/es/trade/BTCUSDT</loc>
  <xhtml:link rel="alternate" hreflang="es" href="https://zytitrade.com/es/trade/BTCUSDT"/>
  <xhtml:link rel="alternate" hreflang="en" href="https://zytitrade.com/en/trade/BTCUSDT"/>
  <changefreq>daily</changefreq>
  <priority>0.9</priority>
</url>
```
Se deben incluir los pares de alta liquidez: `BTCUSDT`, `ETHUSDT`, `SOLUSDT`, `XRPUSDT`, `BNBUSDT`, `ADAUSDT`, `DOGEUSDT`, `AVAXUSDT`, `LINKUSDT`, etc.

---

## 9. CHECKLIST DE VERIFICACIÓN
- [ ] La URL refleja el símbolo activo (`/es/trade/BTCUSDT`) sin recarga de página completa.
- [ ] Usuarios no autenticados y bots pueden ver el gráfico en tiempo real sin ser expulsados a un login.
- [ ] Intentar enviar una orden sin sesión abre fluidamente el modal de registro/cuenta demo.
- [ ] `document.title` y etiquetas `meta` se actualizan al cambiar de par.
- [ ] Al pegar la URL en Telegram o Discord se genera una tarjeta de previsualización rica con el ticker.
- [ ] El archivo `sitemap.xml` incluye las URLs bilingües de cada símbolo con prioridad alta.
