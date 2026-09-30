import React from 'react';

interface PropFirmLogoProps {
  name: string;
  size?: number;
  className?: string;
}

export const PropFirmLogo: React.FC<PropFirmLogoProps> = ({ name, size = 24, className = '' }) => {
  const norm = name.toLowerCase().replace(/[^a-z0-9]/g, '');

  // 1. FTMO (Azul Eléctrico / Cyan)
  if (norm.includes('ftmo')) {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={`shrink-0 ${className}`}>
        <rect width="32" height="32" rx="8" fill="#002554" />
        <path d="M7 10h18v3.5H7V10zm0 6h14v3.5H7V16zm0 6h8v3.5H7V22z" fill="#00D2FF" />
      </svg>
    );
  }

  // 2. FundedNext (Púrpura y Oro)
  if (norm.includes('fundednext')) {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={`shrink-0 ${className}`}>
        <rect width="32" height="32" rx="8" fill="#18002E" />
        <path d="M10 8h4.5l7.5 11V8h4v16h-4.5L14 13v11h-4V8z" fill="#8B5CF6" />
        <circle cx="23" cy="9" r="2" fill="#F59E0B" />
      </svg>
    );
  }

  // 3. We Master Trade (Corona & W Dorada / Violeta)
  if (norm.includes('wemastertrade') || norm.includes('mastertrade')) {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={`shrink-0 ${className}`}>
        <rect width="32" height="32" rx="8" fill="#1C1427" />
        <path d="M8 20L11 11L16 16L21 11L24 20H8Z" fill="#EAB308" />
        <circle cx="11" cy="9.5" r="1.5" fill="#FACC15" />
        <circle cx="16" cy="14" r="1.5" fill="#FACC15" />
        <circle cx="21" cy="9.5" r="1.5" fill="#FACC15" />
      </svg>
    );
  }

  // 4. The 5%ers (Naranja Institucional)
  if (norm.includes('5ers') || norm.includes('5percent')) {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={`shrink-0 ${className}`}>
        <rect width="32" height="32" rx="8" fill="#FF5E00" />
        <text x="16" y="22" textAnchor="middle" fill="#FFFFFF" fontSize="15" fontWeight="900" fontFamily="sans-serif">5%</text>
      </svg>
    );
  }

  // 5. Funding Pips (Diamante Esmeralda)
  if (norm.includes('pips')) {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={`shrink-0 ${className}`}>
        <rect width="32" height="32" rx="8" fill="#061817" />
        <path d="M16 6L24 16L16 26L8 16L16 6Z" fill="#10B981" />
        <path d="M16 10L20.5 16L16 22L11.5 16L16 10Z" fill="#34D399" />
      </svg>
    );
  }

  // 6. E8 Markets (Azul E8)
  if (norm.includes('e8')) {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={`shrink-0 ${className}`}>
        <rect width="32" height="32" rx="8" fill="#0B132B" />
        <text x="16" y="22" textAnchor="middle" fill="#3B82F6" fontSize="14" fontWeight="900" fontFamily="sans-serif">E8</text>
      </svg>
    );
  }

  // 7. Alpha Capital Group (Alfa Griega Oro)
  if (norm.includes('alpha')) {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={`shrink-0 ${className}`}>
        <rect width="32" height="32" rx="8" fill="#0F172A" />
        <path d="M16 8L9 24h3.5l1.8-4.5h3.4L19.5 24H23L16 8zm-1 8.5l1-3 1 3h-2z" fill="#E2B755" />
      </svg>
    );
  }

  // 8. Topstep (Chevron Verde Chicago)
  if (norm.includes('topstep')) {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={`shrink-0 ${className}`}>
        <rect width="32" height="32" rx="8" fill="#042F2E" />
        <path d="M16 8L24 16h-5v8h-6v-8H8L16 8z" fill="#22C55E" />
      </svg>
    );
  }

  // 9. Apex Trader Funding (Pico Triangular Rojo/Blanco)
  if (norm.includes('apex')) {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={`shrink-0 ${className}`}>
        <rect width="32" height="32" rx="8" fill="#1C1917" />
        <path d="M16 6L25 24H7L16 6zm0 6l-4.5 9h9L16 12z" fill="#EF4444" />
      </svg>
    );
  }

  // 10. Global City Funding (Astro Dorado & Enclave Oficial)
  if (norm.includes('globalcity')) {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={`shrink-0 ${className}`}>
        <rect width="32" height="32" rx="8" fill="#1E1B4B" />
        <path d="M16 6L18.5 12.5L25 13L20 17.5L21.5 24L16 20.5L10.5 24L12 17.5L7 13L13.5 12.5L16 6Z" fill="#F59E0B" />
      </svg>
    );
  }

  // Fallback con iniciales estilizadas
  const initials = name.slice(0, 2).toUpperCase();
  return (
    <div 
      style={{ width: size, height: size }}
      className={`rounded-lg bg-slate-900 text-amber-400 font-mono font-black flex items-center justify-center text-[10px] shrink-0 shadow-sm ${className}`}
    >
      {initials}
    </div>
  );
};
