import React, { useState } from 'react';
import { Activity, ShieldCheck, Zap, ArrowRight, ChevronLeft, ChevronRight, ExternalLink, Sparkles } from 'lucide-react';
import { translations, Language } from '../i18n/translations';
import { ExchangeLogo } from './ExchangeLogo';
import { LottieAnimation } from './LottieAnimation';
import exchangeRadarData from '../assets/animations/exchange-radar.json';

interface ExchangesSectionProps {
  currentLang: Language;
  isActive: boolean;
}

export const ExchangesSection: React.FC<ExchangesSectionProps> = ({ currentLang, isActive }) => {
  const t = translations[currentLang].exchangesSection;
  const isEs = currentLang === 'es';
  const [currentPage, setCurrentPage] = useState(0);

  // 16 Exchanges preparados para hidratación desde base de datos con campos de afiliación
  const allVenues = [
    // PÁGINA 1: GIGANTES TIER-1
    {
      id: 'binance',
      name: 'Binance',
      type: isEs ? 'Spot, Futuros USD-M & COIN-M' : 'Spot, USD-M & COIN-M Futures',
      latency: '1.2ms',
      badge: 'Tier 1 Global',
      rebate: isEs ? 'Descuento 20% en Fees' : '20% Fee Kickback',
      features: isEs ? ['API v3 & WSS Directo', 'Libro L2 Completo'] : ['Direct API v3 & WSS', 'Full L2 Orderbook'],
      affiliateUrl: 'https://accounts.binance.com/register',
    },
    {
      id: 'bybit',
      name: 'Bybit',
      type: isEs ? 'Perpetuos USDT API v5 & Opciones' : 'USDT Perpetuals API v5 & Options',
      latency: '1.8ms',
      badge: 'Líder Derivados',
      rebate: isEs ? 'Bono VIP $1,000 USDT' : 'VIP $1,000 Bonus',
      features: isEs ? ['Ejecución Ultra-Fast', 'Subcuentas Ilimitadas'] : ['Ultra-Fast Execution', 'Unlimited Sub-accounts'],
      affiliateUrl: 'https://partner.bybit.com/',
    },
    {
      id: 'okx',
      name: 'OKX',
      type: isEs ? 'Swaps Perpetuos & Cartera Web3' : 'Perpetual Swaps & Web3 Wallet',
      latency: '2.1ms',
      badge: 'Multi-Asset Prime',
      rebate: isEs ? 'Caja Sorpresa hasta $10k' : 'Mystery Box up to $10k',
      features: isEs ? ['Cuentas Unificadas', 'Trailing Stop Nativo'] : ['Unified Accounts', 'Native Trailing Stop'],
      affiliateUrl: 'https://www.okx.com/join',
    },
    {
      id: 'coinbase',
      name: 'Coinbase Advanced',
      type: isEs ? 'Liquidez Institucional Prime' : 'Prime Institutional Liquidity',
      latency: '4.2ms',
      badge: 'Prime USA',
      rebate: isEs ? 'Custodia Regulada' : 'Regulated Custody',
      features: isEs ? ['Banca Directa USD/EUR', 'Cero Slippage'] : ['Direct USD/EUR Banking', 'Zero Slippage'],
      affiliateUrl: 'https://advanced.coinbase.com/',
    },

    // PÁGINA 2: DERIVADOS & COPY TRADING
    {
      id: 'bitget',
      name: 'Bitget',
      type: isEs ? 'Copy Trading Oficial API & Derivados' : 'Official Copy Trading API & Derivatives',
      latency: '2.0ms',
      badge: 'Copy Trading',
      rebate: isEs ? 'Fondo Protección $400M' : '$400M Protection Fund',
      features: isEs ? ['Replicación < 3.5ms', 'Sin KYC Obligatorio'] : ['Replication < 3.5ms', 'No Mandatory KYC'],
      affiliateUrl: 'https://partner.bitget.com/',
    },
    {
      id: 'kucoin',
      name: 'KuCoin',
      type: isEs ? 'Más de 700 Altcoins & Mercados Spot' : '700+ Altcoin & Spot Markets',
      latency: '2.8ms',
      badge: 'Altcoins Hub',
      rebate: isEs ? 'Descuento 20% con KCS' : '20% KCS Discount',
      features: isEs ? ['Trading Bots API', 'Depth de Alta Frecuencia'] : ['Trading Bots API', 'High Frequency Depth'],
      affiliateUrl: 'https://www.kucoin.com/',
    },
    {
      id: 'gate',
      name: 'Gate.io',
      type: isEs ? 'Mercados Globales & Startup IEO' : 'Global Markets & Startup IEO',
      latency: '3.1ms',
      badge: '1400+ Pares',
      rebate: isEs ? 'Nivel VIP Instantáneo' : 'Instant VIP Tier',
      features: isEs ? ['Futuros de Margen Cruzado', 'WebSocket Multihilo'] : ['Cross-Margin Futures', 'Multi-thread WebSocket'],
      affiliateUrl: 'https://www.gate.io/',
    },
    {
      id: 'bingx',
      name: 'BingX',
      type: isEs ? 'Contratos Estándar & Copy Trading' : 'Standard & Perpetual Contracts',
      latency: '2.4ms',
      badge: 'Copy & Derivados',
      rebate: isEs ? 'Bono Bienvenida $500' : '$500 Welcome Bonus',
      features: isEs ? ['Cuentas Demo MT5', 'Ejecución Instantánea'] : ['MT5 Demo Accounts', 'Instant Execution'],
      affiliateUrl: 'https://bingx.com/',
    },

    // PÁGINA 3: DEX ON-CHAIN & ALTA FRECUENCIA
    {
      id: 'dydx',
      name: 'dYdX v4',
      type: isEs ? 'Perpetuos On-Chain Cosmos L1' : 'On-Chain Cosmos L1 Perpetuals',
      latency: '1.9ms',
      badge: '100% Descentralizado',
      rebate: isEs ? 'Cero Comisiones de Gas' : 'Zero Gas Fees',
      features: isEs ? ['Libro de Órdenes Descentralizado', 'Autocustodia Total'] : ['Decentralized Orderbook', 'Full Self-Custody'],
      affiliateUrl: 'https://dydx.exchange/',
    },
    {
      id: 'hyperliquid',
      name: 'Hyperliquid',
      type: isEs ? 'L1 Nativa para Derivados Cripto' : 'Native L1 for Derivatives',
      latency: '1.1ms',
      badge: 'Sub-Segundo L1',
      rebate: isEs ? 'Rebates por Aportar Liquidez' : 'Maker Liquidity Rebates',
      features: isEs ? ['Capacidad 200,000 TPS', 'Vaults de Arbitraje'] : ['200,000 TPS Capacity', 'Arbitrage Vaults'],
      affiliateUrl: 'https://hyperliquid.xyz/',
    },
    {
      id: 'vertex',
      name: 'Vertex Protocol',
      type: isEs ? 'Orderbook Híbrido Arbitrum' : 'Hybrid Arbitrum Orderbook',
      latency: '1.5ms',
      badge: 'DEX Híbrido',
      rebate: isEs ? 'Recompensas VRTX' : 'VRTX Rewards',
      features: isEs ? ['Margen Cruzado Unificado', 'Latencia de CEX'] : ['Unified Cross Margin', 'CEX-grade Latency'],
      affiliateUrl: 'https://vertexprotocol.com/',
    },
    {
      id: 'mexc',
      name: 'MEXC Global',
      type: isEs ? 'Cero Comisiones en Spot' : 'Zero Fee Spot Markets',
      latency: '2.9ms',
      badge: '0% Comisiones Spot',
      rebate: isEs ? '0% Maker & 0% Taker Spot' : '0% Maker & Taker Spot',
      features: isEs ? ['Listados en Tiempo Récord', 'Apalancamiento hasta 200x'] : ['Record Time Listings', 'Up to 200x Leverage'],
      affiliateUrl: 'https://www.mexc.com/',
    },

    // PÁGINA 4: INSTITUCIONALES & PUENTES DIRECTOS
    {
      id: 'kraken',
      name: 'Kraken',
      type: isEs ? 'Spot EUR/USD Banking & Pro' : 'EUR/USD Banking Spot & Pro',
      latency: '3.4ms',
      badge: 'Banca Segura',
      rebate: isEs ? 'Auditoría Proof of Reserves' : 'Proof of Reserves Audited',
      features: isEs ? ['Puente Bancario SEPA', 'API REST & WSS v2'] : ['SEPA Banking Bridge', 'REST & WSS API v2'],
      affiliateUrl: 'https://www.kraken.com/',
    },
    {
      id: 'bitfinex',
      name: 'Bitfinex',
      type: isEs ? 'Libro de Órdenes Profundo & Margin' : 'Deep Institutional Orderbook',
      latency: '3.6ms',
      badge: 'Prime Desk',
      rebate: isEs ? 'Funding P2P & Préstamos' : 'P2P Margin Funding',
      features: isEs ? ['Órdenes Algorítmicas TWAP', 'Conectividad Directa'] : ['TWAP Algo Orders', 'Direct Connectivity'],
      affiliateUrl: 'https://www.bitfinex.com/',
    },
    {
      id: 'woox',
      name: 'WOO X',
      type: isEs ? 'Liquidez Profunda & Cero Slippage' : 'Deep Liquidity & Zero Slippage',
      latency: '2.2ms',
      badge: 'Red WOO',
      rebate: isEs ? 'Staking Fee Reduction' : 'Staking Fee Reduction',
      features: isEs ? ['Espacios de Trabajo Modulares', 'Sub-cuentas API'] : ['Modular Workspaces', 'Sub-accounts API'],
      affiliateUrl: 'https://x.woo.org/',
    },
    {
      id: 'deribit',
      name: 'Deribit',
      type: isEs ? 'Líder Mundial en Opciones BTC/ETH' : 'World Leader in BTC/ETH Options',
      latency: '1.7ms',
      badge: 'Opciones & Futuros',
      rebate: isEs ? 'Descuento 10% en Fees' : '10% Fee Discount',
      features: isEs ? ['Superficie de Volatilidad', 'Margen de Cartera Portfolio'] : ['Volatility Surface', 'Portfolio Margin'],
      affiliateUrl: 'https://www.deribit.com/',
    },
  ];

  const pageSize = 4;
  const totalPages = Math.ceil(allVenues.length / pageSize);
  const currentVenues = allVenues.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  const handlePrev = () => {
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : totalPages - 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => (prev < totalPages - 1 ? prev + 1 : 0));
  };

  return (
    <section className="min-w-full w-screen h-screen flex items-center justify-center snap-center px-6 lg:px-12 pt-16">
      <div className="w-full max-w-7xl mx-auto">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* LADO IZQUIERDO (4 COLUMNAS): CABECERA + ANIMACIÓN LOTTIE DEL RADAR + CTA */}
          <div className={`lg:col-span-4 flex flex-col justify-between transition-all duration-500 ${
            isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f4edd9] text-[#855e15] text-xs font-mono font-bold tracking-tight mb-3">
                <Activity className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                <span>{t.tag || '/venues-conectados'}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight leading-tight">
                {t.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-800 font-medium mt-2 leading-relaxed">
                {t.subtitle}
              </p>
            </div>

            {/* ANIMACIÓN LOTTIE 100% TRANSPARENTE */}
            <div className="mt-4 flex items-center justify-center bg-transparent border-none">
              <LottieAnimation animationData={exchangeRadarData} className="w-52 h-52" />
            </div>

            {/* BOTÓN CTA ACTIVO */}
            <div className="mt-3 flex items-center">
              <button 
                className="flex items-center gap-2.5 px-6 py-3 text-xs sm:text-sm font-black text-slate-950 bg-[#eab308] hover:bg-[#ca8a04] rounded-2xl shadow-sm transition-all duration-150 cursor-pointer transform hover:scale-105 active:scale-95"
              >
                <Zap className="w-4 h-4 stroke-[2.5] fill-slate-950" />
                <span>{isEs ? 'Operar Ahora' : 'Trade Now'}</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* LADO DERECHO (8 COLUMNAS): CARRUSEL DE CARDS HORIZONTALES GRANDES (4 EN 4) */}
          <div className="lg:col-span-8 flex flex-col justify-between">
            
            {/* BARRA SUPERIOR DEL CARRUSEL: CONTADOR Y CONTROLES DE NAVEGACIÓN */}
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200/80">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-black text-slate-950 uppercase tracking-wider">
                  {isEs ? 'Exchanges Conectados' : 'Direct Venues'}
                </span>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#ede5d6] text-slate-800">
                  {currentPage * pageSize + 1} - {Math.min((currentPage + 1) * pageSize, allVenues.length)} {isEs ? 'de' : 'of'} {allVenues.length}
                </span>
              </div>

              {/* BOTONES DE NAVEGACIÓN (ANTERIOR / SIGUIENTE) + INDICADORES DE PÁGINA */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 mr-2">
                  {Array.from({ length: totalPages }).map((_, dotIdx) => (
                    <button
                      key={dotIdx}
                      onClick={() => setCurrentPage(dotIdx)}
                      aria-label={`Ir a página ${dotIdx + 1}`}
                      className={`h-2 rounded-full transition-all cursor-pointer border-none p-0 ${
                        currentPage === dotIdx 
                          ? 'w-6 bg-slate-950' 
                          : 'w-2 bg-slate-300 hover:bg-slate-400'
                      }`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label={isEs ? 'Página anterior' : 'Previous page'}
                  className="w-8 h-8 rounded-xl border border-slate-300 bg-white hover:bg-[#ede5d6] text-slate-950 flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-90"
                >
                  <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  aria-label={isEs ? 'Página siguiente' : 'Next page'}
                  className="w-8 h-8 rounded-xl border border-slate-300 bg-white hover:bg-[#ede5d6] text-slate-950 flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-90"
                >
                  <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* GRID DE 4 CARDS HORIZONTALES GRANDES (2x2) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentVenues.map((venue, idx) => (
                <div
                  key={venue.id}
                  style={{ animationDelay: `${idx * 60}ms` }}
                  className={`warm-card rounded-3xl p-5 flex flex-col justify-between hover:border-slate-500 transition-all duration-200 hover:-translate-y-1 shadow-md ${
                    isActive ? 'animate-card-in' : 'opacity-0'
                  }`}
                >
                  <div>
                    {/* CABECERA DE LA CARD: LOGO GRANDE + NOMBRE + LATENCIA */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-[#f4ede0] flex items-center justify-center shrink-0">
                          <ExchangeLogo name={venue.name} size={30} />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-black text-slate-950 truncate">
                              {venue.name}
                            </h3>
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#ede5d6] text-slate-800">
                              {venue.badge}
                            </span>
                          </div>
                          <span className="text-xs text-slate-600 font-medium truncate mt-0.5">
                            {venue.type}
                          </span>
                        </div>
                      </div>

                      {/* LATENCIA CON PULSO VERDE */}
                      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-950 shrink-0 ml-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>{venue.latency}</span>
                      </div>
                    </div>

                    {/* FEATURES DE CONECTIVIDAD INSTITUCIONAL */}
                    <div className="flex flex-wrap gap-1.5 mb-3 pt-2 border-t border-[#ede8df]">
                      {venue.features.map((feat, fIdx) => (
                        <span key={fIdx} className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-[#f4efe5] text-slate-700">
                          ✓ {feat}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* PIE DE CARD: BENEFICIO / REBATE + ENLACE AFILIADO / CTA */}
                  <div className="pt-3 border-t border-[#ede8df] flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono font-bold text-amber-800 bg-[#fef3c7] px-2 py-1 rounded-lg border border-amber-200/80 truncate">
                      ★ {venue.rebate}
                    </span>

                    <a
                      href={venue.affiliateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-slate-950 hover:bg-slate-800 text-white flex items-center gap-1.5 transition-all shadow-sm shrink-0"
                    >
                      <span className="!text-white">{isEs ? 'Operar' : 'Trade'}</span>
                      <ExternalLink className="w-3 h-3 text-white" />
                    </a>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

export default ExchangesSection;
