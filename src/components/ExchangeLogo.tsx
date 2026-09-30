import React from 'react';
import { 
  SiBinance, 
  SiCoinbase, 
  SiKucoin, 
  SiOkx 
} from '@icons-pack/react-simple-icons';

interface ExchangeLogoProps {
  name: string;
  size?: number;
  className?: string;
}

export const ExchangeLogo: React.FC<ExchangeLogoProps> = ({ name, size = 22, className = '' }) => {
  const norm = name.toLowerCase().replace(/[^a-z0-9]/g, '');

  // 1. Binance Oficial
  if (norm.includes('binance')) {
    return <SiBinance size={size} color="#F3BA2F" className={`shrink-0 ${className}`} />;
  }

  // 2. Coinbase Oficial
  if (norm.includes('coinbase')) {
    return <SiCoinbase size={size} color="#0052FF" className={`shrink-0 ${className}`} />;
  }

  // 3. KuCoin Oficial
  if (norm.includes('kucoin')) {
    return <SiKucoin size={size} color="#24AE8F" className={`shrink-0 ${className}`} />;
  }

  // 4. OKX Oficial (Blanco en Dark / Negro en Light)
  if (norm.includes('okx')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={`shrink-0 text-slate-950 dark:text-white ${className}`}>
        <path d="M6.77 0C3.03 0 0 3.03 0 6.77v10.46C0 20.97 3.03 24 6.77 24h10.46c3.74 0 6.77-3.03 6.77-6.77V6.77C24 3.03 20.97 0 17.23 0H6.77zm0 3.42h10.46c1.85 0 3.35 1.5 3.35 3.35v10.46c0 1.85-1.5 3.35-3.35 3.35H6.77c-1.85 0-3.35-1.5-3.35-3.35V6.77c0-1.85 1.5-3.35 3.35-3.35zM7.5 7.5v9h2.5v-9H7.5zm6.5 0v9h2.5v-9H14z" />
      </svg>
    );
  }

  // 5. Bybit Oficial (Isotipo puro B en Naranja / Amarillo oficial sin fondo)
  if (norm.includes('bybit')) {
    return (
      <svg width={size} height={size} viewBox="0 0 28 28" fill="none" className={`shrink-0 ${className}`}>
        <path d="M3 4h8.2c3.5 0 6 1.8 6 4.6 0 1.9-1.2 3.3-2.9 4 2.3.8 3.7 2.4 3.7 4.9 0 3.2-2.7 5.1-6.5 5.1H3V4zm7.6 7.6c1.8 0 3.1-.9 3.1-2.4 0-1.6-1.3-2.3-3.1-2.3H6.4v4.7h4.2zm.6 7.7c2.1 0 3.5-1 3.5-2.7 0-1.7-1.4-2.5-3.5-2.5H6.4v5.2h4.8z" fill="#FFA500" />
        <path d="M20 4h3.5v18.6H20z" fill="#F7A600" />
      </svg>
    );
  }

  // 6. Kraken Oficial (Isotipo Pulpo / Tentáculos Púrpura puro sin fondo)
  if (norm.includes('kraken')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="#5841D8" className={`shrink-0 ${className}`}>
        <path d="M4 3a2 2 0 00-2 2v9a5 5 0 005 5h1v-3H7a2 2 0 01-2-2V5h14v9a2 2 0 01-2 2h-1v3h1a5 5 0 005-5V5a2 2 0 00-2-2H4zm5 3v13h2V6H9zm4 0v13h2V6h-2z" />
      </svg>
    );
  }

  // 7. Bitget Oficial (Doble Flecha Cyan/Teal sin fondo)
  if (norm.includes('bitget')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`shrink-0 ${className}`}>
        <path d="M3 12l8-8 2.5 2.5L7.5 12l6 5.5L11 20l-8-8zm10-8l8 8-8 8-2.5-2.5L16.5 12l-6-5.5L13 4z" fill="#00D0DB" />
      </svg>
    );
  }

  // 8. Gate.io Oficial (Arco Verde Esmeralda puro sin fondo)
  if (norm.includes('gate')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`shrink-0 ${className}`}>
        <circle cx="12" cy="12" r="10" stroke="#00B897" strokeWidth="3" />
        <path d="M12 7v5l4 2.5" stroke="#00B897" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }

  // 9. BingX Oficial (Logo Azul Eléctrico puro sin fondo)
  if (norm.includes('bingx')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="#1C55FF" className={`shrink-0 ${className}`}>
        <path d="M4 3h7.5c4 0 6.5 2 6.5 5 0 2-1.3 3.5-3 4.2 2.3.8 3.8 2.5 3.8 5 0 3.5-3 5.8-7.3 5.8H4V3zm6.8 7.2c1.7 0 2.8-.8 2.8-2.1 0-1.4-1.1-2-2.8-2H7.2v4.1h3.6zm.5 7.6c2 0 3.2-.9 3.2-2.4s-1.2-2.3-3.2-2.3H7.2v4.7h4.1z" />
      </svg>
    );
  }

  // 10. MEXC Global Oficial (Isotipo M Verde/Cian brillante sin fondo)
  if (norm.includes('mexc')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`shrink-0 ${className}`}>
        <path d="M3 19V5l6 8 6-8v14h-3.5v-7.5l-2.5 3.5-2.5-3.5V19H3z" fill="#2ED197" />
      </svg>
    );
  }

  // 11. dYdX Oficial (X Geométrica Índigo sin fondo)
  if (norm.includes('dydx')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="#6966FF" className={`shrink-0 ${className}`}>
        <path d="M3 4h4.5l4.5 7 4.5-7H21l-7 10 7 10h-4.5L12 17l-4.5 7H3l7-10L3 4z" />
      </svg>
    );
  }

  // 12. Hyperliquid Oficial (H Verde Neón pura sin fondo)
  if (norm.includes('hyperliquid')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="#5BF29F" className={`shrink-0 ${className}`}>
        <path d="M4 4h4v6h8V4h4v16h-4v-6H8v6H4V4z" />
      </svg>
    );
  }

  // 13. Vertex Protocol Oficial (V Púrpura pura sin fondo)
  if (norm.includes('vertex')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="#8B5CF6" className={`shrink-0 ${className}`}>
        <path d="M2 4l10 16L22 4h-4.5L12 14 6.5 4H2z" />
      </svg>
    );
  }

  // 14. Bitfinex Oficial (Hoja Verde Esmeralda pura sin fondo)
  if (norm.includes('bitfinex')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="#16B157" className={`shrink-0 ${className}`}>
        <path d="M6 3h12l-4 8h5l-9 10 2-9H7l3-9H6z" />
      </svg>
    );
  }

  // 15. Prop Firms Direct (Escudo Dorado puro sin fondo)
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#EAB308" className={`shrink-0 ${className}`}>
      <path d="M12 2l9 4v7c0 5.5-3.8 10.7-9 12-5.2-1.3-9-6.5-9-12V6l9-4zm0 4.2L6 8.8v4.2c0 3.8 2.5 7.4 6 8.5 3.5-1.1 6-4.7 6-8.5V8.8l-6-2.6z" />
    </svg>
  );
};
