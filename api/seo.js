export default async function handler(req, res) {
  const { symbol = 'BTCUSDT', lang = 'es' } = req.query;
  const cleanSymbol = (symbol || 'BTCUSDT').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const currentLang = (lang || 'es').toLowerCase().startsWith('en') ? 'en' : 'es';
  const isEs = currentLang === 'es';

  // Base URL dinámica basada en el host que hizo la petición
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'zytitrade.com';
  const origin = `${proto}://${host}`;

  // Formatear par visual: ej BTC/USDT, ETH/USDT
  let formattedSymbol = cleanSymbol;
  if (cleanSymbol.endsWith('USDT')) {
    formattedSymbol = `${cleanSymbol.slice(0, -4)}/USDT`;
  } else if (cleanSymbol.endsWith('USD')) {
    formattedSymbol = `${cleanSymbol.slice(0, -3)}/USD`;
  }

  // Precios estimados de respaldo institucional por si la API pública demora más de 1s
  const fallbackData = {
    BTCUSDT: { price: 84650.0, change: 1.25, high: 85900.0, low: 83200.0 },
    ETHUSDT: { price: 2688.0, change: -0.45, high: 2750.0, low: 2640.0 },
    SOLUSDT: { price: 218.5, change: 3.80, high: 224.0, low: 210.0 },
    BNBUSDT: { price: 685.0, change: 0.90, high: 695.0, low: 678.0 },
    XRPUSDT: { price: 2.45, change: 4.10, high: 2.58, low: 2.32 }
  };

  let ticker = fallbackData[cleanSymbol] || { price: null, change: null, high: null, low: null };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1200);
    const apiRes = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${cleanSymbol}`, {
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (apiRes.ok) {
      const data = await apiRes.json();
      if (data?.lastPrice) {
        ticker = {
          price: parseFloat(data.lastPrice),
          change: parseFloat(data.priceChangePercent || '0'),
          high: parseFloat(data.highPrice || '0'),
          low: parseFloat(data.lowPrice || '0')
        };
      }
    }
  } catch (_) {
    // Si la conexión pública falla o excede 1.2s, continúa con los datos de respaldo
  }

  const formatPrice = (p) => {
    if (!p) return '';
    return p >= 1 
      ? p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : p.toFixed(4);
  };

  const priceStr = ticker.price ? formatPrice(ticker.price) : '';
  const changeStr = typeof ticker.change === 'number' 
    ? `${ticker.change >= 0 ? '+' : ''}${ticker.change.toFixed(2)}%`
    : '';

  const displayTitle = priceStr 
    ? `📈 ${formattedSymbol} $${priceStr} ${changeStr ? `(${changeStr}) ` : ''}• Gráfico & Order Book | ZYTI Trade`
    : `📈 ${formattedSymbol} • Gráfico en Vivo & Order Book | ZYTI Trade`;

  const displayDesc = isEs
    ? `Cotización en tiempo real de ${formattedSymbol}${priceStr ? ` ($${priceStr})` : ''} a 60 FPS con libro de órdenes L2 institucional, arbitraje multi-exchange y ejecución directa en ZYTI Trade.`
    : `Real-time quotes for ${formattedSymbol}${priceStr ? ` ($${priceStr})` : ''} at 60 FPS with institutional L2 depth, multi-exchange arbitrage, and direct execution on ZYTI Trade.`;

  const canonicalUrl = `${origin}/${currentLang}/zytiterminal/${cleanSymbol}`;
  const imageUrl = `${origin}/og-image.png`;

  const html = `<!doctype html>
<html lang="${currentLang}">
<head>
  <meta charset="UTF-8" />
  <title>${displayTitle}</title>
  <meta name="title" content="${displayTitle}" />
  <meta name="description" content="${displayDesc}" />
  
  <!-- Open Graph / Telegram / WhatsApp / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="ZYTI Trade" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:title" content="${displayTitle}" />
  <meta property="og:description" content="${displayDesc}" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="og:image:secure_url" content="${imageUrl}" />
  <meta property="og:image:type" content="image/png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${formattedSymbol} ZYTI Trade Terminal" />

  <!-- Twitter / X -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content="${canonicalUrl}" />
  <meta name="twitter:title" content="${displayTitle}" />
  <meta name="twitter:description" content="${displayDesc}" />
  <meta name="twitter:image" content="${imageUrl}" />

  <!-- Canonical & hreflang -->
  <link rel="canonical" href="${canonicalUrl}" />
  <link rel="alternate" hreflang="es" href="${origin}/es/zytiterminal/${cleanSymbol}" />
  <link rel="alternate" hreflang="en" href="${origin}/en/zytiterminal/${cleanSymbol}" />
  <link rel="alternate" hreflang="x-default" href="${origin}/en/zytiterminal/${cleanSymbol}" />

  <!-- Redirección inmediata si un navegador humano accede directamente a este endpoint -->
  <meta http-equiv="refresh" content="0;url=/${currentLang}/zytiterminal/${cleanSymbol}">
  <script>
    if (typeof window !== 'undefined') {
      window.location.replace("/${currentLang}/zytiterminal/${cleanSymbol}");
    }
  </script>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #fbf9f4; color: #0f172a; padding: 2rem;">
  <h2>${displayTitle}</h2>
  <p>${displayDesc}</p>
  <p>Cargando terminal ZYTI Trade... <a href="/${currentLang}/zytiterminal/${cleanSymbol}">Haz clic aquí si no redirige automáticamente</a>.</p>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate=45');
  res.status(200).send(html);
}
