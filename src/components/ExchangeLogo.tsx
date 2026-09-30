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

export const ExchangeLogo: React.FC<ExchangeLogoProps> = ({ name, size = 18, className = '' }) => {
  const norm = name.toLowerCase().replace(/[^a-z0-9]/g, '');

  // 1. Iconos oficiales de Simple Icons
  if (norm.includes('binance')) {
    return <SiBinance size={size} color="#F3BA2F" className={className} />;
  }
  if (norm.includes('coinbase')) {
    return <SiCoinbase size={size} color="#0052FF" className={className} />;
  }
  if (norm.includes('kucoin')) {
    return <SiKucoin size={size} color="#24AE8F" className={className} />;
  }
  if (norm.includes('okx')) {
    return <SiOkx size={size} className={className} />;
  }

  // 2. Logos Vectoriales SVG Oficiales de Alta Fidelidad
  if (norm.includes('bybit')) {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
        <rect width="32" height="32" rx="7" fill="#121212" />
        <path d="M7 10h5.5c2.5 0 4.2 1.3 4.2 3.3 0 1.3-.8 2.3-2 2.8 1.6.5 2.6 1.7 2.6 3.4 0 2.2-1.9 3.5-4.5 3.5H7V10zm5.3 5.4c1.3 0 2.2-.6 2.2-1.7 0-1.1-.9-1.6-2.2-1.6H9.4v3.3h2.9zm.4 5.4c1.5 0 2.5-.7 2.5-1.9 0-1.2-1-1.8-2.5-1.8H9.4v3.7h3.3z" fill="#FFA500" />
        <path d="M19 10h2.4v13H19z" fill="#FFA500" />
        <path d="M23 10h2.4v13H23z" fill="#FFFFFF" />
      </svg>
    );
  }

  if (norm.includes('kraken')) {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
        <rect width="32" height="32" rx="7" fill="#5841D8" />
        <path d="M9 10c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2v9c0 1.7-1.3 3-3 3h-2v2h2v2h-3v-4h-2v4h-3v-2h2v-2H12c-1.7 0-3-1.3-3-3v-9zm3 3h8v-3h-8v3z" fill="#FFFFFF" />
      </svg>
    );
  }

  if (norm.includes('bitget')) {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
        <rect width="32" height="32" rx="7" fill="#00F0FF" />
        <path d="M16 8l7 7-7 7-2.2-2.2L18.6 15H9v-2h9.6l-4.8-4.8L16 8z" fill="#0A0D14" />
      </svg>
    );
  }

  if (norm.includes('gate')) {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
        <rect width="32" height="32" rx="7" fill="#00B897" />
        <path d="M16 7a9 9 0 00-9 9v9h9a9 9 0 000-18zm0 14h-5v-5a5 5 0 0110 0 5 5 0 01-5 5z" fill="#FFFFFF" />
      </svg>
    );
  }

  if (norm.includes('bingx')) {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
        <rect width="32" height="32" rx="7" fill="#1C55FF" />
        <path d="M10 9h6a5 5 0 010 10H10V9zm4 7h2a2 2 0 000-4h-2v4zM10 19h6.5l5.5 7h-4.2l-3.8-5H14v5h-4v-7z" fill="#FFFFFF" />
      </svg>
    );
  }

  if (norm.includes('mexc')) {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
        <rect width="32" height="32" rx="7" fill="#0E192B" />
        <path d="M8 22V10l5 7 5-7v12h-3v-6.5l-2 2.8-2-2.8V22H8zm12-3l3-7 3 7h-6zm1.2-2h3.6l-1.8-4.2L21.2 17z" fill="#2ED197" />
      </svg>
    );
  }

  if (norm.includes('dydx')) {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
        <rect width="32" height="32" rx="7" fill="#6966FF" />
        <path d="M9 9h4l4.5 7L22 9h4l-6.5 9.5L26 23h-4l-4.5-7L13 23H9l6.5-9.5L9 9z" fill="#FFFFFF" />
      </svg>
    );
  }

  if (norm.includes('hyperliquid')) {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
        <rect width="32" height="32" rx="7" fill="#9BF0B2" />
        <path d="M10 9h3v5.5h6V9h3v14h-3v-5.5h-6V23h-3V9z" fill="#0A1813" />
      </svg>
    );
  }

  if (norm.includes('vertex')) {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
        <rect width="32" height="32" rx="7" fill="#6038D0" />
        <path d="M8 9l8 14 8-14h-4l-4 7.5L12 9H8z" fill="#E6DEFF" />
      </svg>
    );
  }

  if (norm.includes('bitfinex')) {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
        <rect width="32" height="32" rx="7" fill="#16B157" />
        <path d="M11 9h10l-4 7h4l-8 9 2-8h-4l3-8h-3z" fill="#FFFFFF" />
      </svg>
    );
  }

  // Prop Firms & Genérico
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <rect width="32" height="32" rx="7" fill="#ca8a04" />
      <path d="M16 7l7 4v6c0 5-3.5 9-7 10-3.5-1-7-5-7-10v-6l7-4zm0 4.5l-4 2.3v3.7c0 3 2 5.5 4 6.3 2-.8 4-3.3 4-6.3v-3.7l-4-2.3z" fill="#FFFFFF" />
    </svg>
  );
};
