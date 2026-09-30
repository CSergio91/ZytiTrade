import React, { useState } from 'react';
import { Activity, Zap, ArrowRight, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
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

  // 16 Exchanges limpios, sin saturación de etiquetas ni milisegundos
  const allVenues = [
    // PÁGINA 1: GIGANTES TIER-1
    {
      id: 'binance',
      name: 'Binance',
      type: isEs ? 'Spot, Futuros USD-M & Opciones' : 'Spot, USD-M Futures & Options',
      rebate: isEs ? 'Descuento 20% en Fees de Trading' : '20% Trading Fee Kickback',
      affiliateUrl: 'https://accounts.binance.com/register',
    },
    {
      id: 'bybit',
      name: 'Bybit',
      type: isEs ? 'Perpetuos USDT API v5 & Copy Trading' : 'USDT Perpetuals API v5 & Copy',
      rebate: isEs ? 'Bono de Bienvenida hasta $1,000 USDT' : 'Up to $1,000 Welcome Bonus',
      affiliateUrl: 'https://partner.bybit.com/',
    },
    {
      id: 'okx',
      name: 'OKX',
      type: isEs ? 'Swaps Perpetuos & Cartera Web3' : 'Perpetual Swaps & Web3 Ecosystem',
      rebate: isEs ? 'Caja Misteriosa con Cripto de Regalo' : 'Mystery Box Crypto Gift',
      affiliateUrl: 'https://www.okx.com/join',
    },
    {
      id: 'coinbase',
      name: 'Coinbase Advanced',
      type: isEs ? 'Liquidez Institucional Regulada' : 'Regulated Prime Liquidity',
      rebate: isEs ? 'Custodia Institucional 100% Segura' : '100% Secure Institutional Custody',
      affiliateUrl: 'https://advanced.coinbase.com/',
    },

    // PÁGINA 2: DERIVADOS & ALTCOINS
    {
      id: 'bitget',
      name: 'Bitget',
      type: isEs ? 'Derivados y Copy Trading Oficial' : 'Official Copy Trading & Derivatives',
      rebate: isEs ? 'Fondo de Protección de $400M USD' : '$400M User Protection Fund',
      affiliateUrl: 'https://partner.bitget.com/',
    },
    {
      id: 'kucoin',
      name: 'KuCoin',
      type: isEs ? 'Más de 700 Altcoins & Mercados Spot' : '700+ Altcoins & Spot Markets',
      rebate: isEs ? 'Descuento del 20% en Comisiones' : '20% Commission Discount',
      affiliateUrl: 'https://www.kucoin.com/',
    },
    {
      id: 'gate',
      name: 'Gate.io',
      type: isEs ? 'Mercados Globales & Nuevos Listados' : 'Global Markets & Early Listings',
      rebate: isEs ? 'Nivel VIP y Bonificaciones de Bienvenida' : 'Instant VIP Tier & Welcome Bonus',
      affiliateUrl: 'https://www.gate.io/',
    },
    {
      id: 'bingx',
      name: 'BingX',
      type: isEs ? 'Contratos Estándar & Perpetuos' : 'Standard & Perpetual Contracts',
      rebate: isEs ? 'Bono Exclusivo de Registro de $500' : 'Exclusive $500 Signup Bonus',
      affiliateUrl: 'https://bingx.com/',
    },

    // PÁGINA 3: DEX ON-CHAIN & ALTA FRECUENCIA
    {
      id: 'dydx',
      name: 'dYdX v4',
      type: isEs ? 'Perpetuos Descentralizados Cosmos' : 'Decentralized Cosmos Perpetuals',
      rebate: isEs ? 'Cero Comisiones de Red (Gas Free)' : 'Zero Gas Fees on Trades',
      affiliateUrl: 'https://dydx.exchange/',
    },
    {
      id: 'hyperliquid',
      name: 'Hyperliquid',
      type: isEs ? 'L1 Nativa para Derivados Cripto' : 'Native L1 for Crypto Derivatives',
      rebate: isEs ? 'Rebates por Aportar Liquidez Maker' : 'Maker Liquidity Rebates',
      affiliateUrl: 'https://hyperliquid.xyz/',
    },
    {
      id: 'vertex',
      name: 'Vertex Protocol',
      type: isEs ? 'Orderbook Híbrido en Arbitrum' : 'Hybrid Arbitrum Orderbook',
      rebate: isEs ? 'Recompensas de Trading en Tokens VRTX' : 'Trading Rewards in VRTX Tokens',
      affiliateUrl: 'https://vertexprotocol.com/',
    },
    {
      id: 'mexc',
      name: 'MEXC Global',
      type: isEs ? 'Cero Comisiones en Mercados Spot' : 'Zero Fee Spot Trading',
      rebate: isEs ? '0% Comisiones Maker y Taker en Spot' : '0% Maker & Taker Fees in Spot',
      affiliateUrl: 'https://www.mexc.com/',
    },

    // PÁGINA 4: INSTITUCIONALES & PUENTES
    {
      id: 'kraken',
      name: 'Kraken',
      type: isEs ? 'Banca Segura en EUR/USD & Spot Pro' : 'EUR/USD Banking & Pro Spot',
      rebate: isEs ? 'Auditoría Proof of Reserves Certificada' : 'Certified Proof of Reserves',
      affiliateUrl: 'https://www.kraken.com/',
    },
    {
      id: 'bitfinex',
      name: 'Bitfinex',
      type: isEs ? 'Libro de Órdenes Profundo & Margin' : 'Deep Institutional Orderbook',
      rebate: isEs ? 'Financiamiento P2P y Órdenes Algorítmicas' : 'P2P Margin Funding & TWAP Orders',
      affiliateUrl: 'https://www.bitfinex.com/',
    },
    {
      id: 'woox',
      name: 'WOO X',
      type: isEs ? 'Liquidez Profunda con Cero Slippage' : 'Deep Liquidity & Zero Slippage',
      rebate: isEs ? 'Reducción de Tarifas mediante Staking' : 'Fee Reduction via Staking',
      affiliateUrl: 'https://x.woo.org/',
    },
    {
      id: 'deribit',
      name: 'Deribit',
      type: isEs ? 'Líder Mundial en Opciones BTC y ETH' : 'World Leader in BTC/ETH Options',
      rebate: isEs ? 'Descuento del 10% en Opciones y Futuros' : '10% Discount on Options & Futures',
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

          {/* LADO DERECHO (8 COLUMNAS): 4 CARDS GRANDES Y CONTROLES EN LA PARTE INFERIOR */}
          <div className="lg:col-span-8 flex flex-col justify-between gap-5">
            
            {/* GRID DE 4 CARDS HORIZONTALES GRANDES (2x2) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {currentVenues.map((venue, idx) => (
                <div
                  key={venue.id}
                  style={{ animationDelay: `${idx * 50}ms` }}
                  className={`warm-card rounded-3xl p-5 sm:p-6 flex flex-col justify-between hover:border-slate-500 transition-all duration-200 hover:-translate-y-1 shadow-md ${
                    isActive ? 'animate-card-in' : 'opacity-0'
                  }`}
                >
                  <div>
                    {/* CABECERA DE LA CARD: LOGO GRANDE + NOMBRE + SUBTÍTULO */}
                    <div className="flex items-center gap-3.5 mb-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#f4ede0] flex items-center justify-center shrink-0">
                        <ExchangeLogo name={venue.name} size={30} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <h3 className="text-base sm:text-lg font-black text-slate-950 truncate">
                          {venue.name}
                        </h3>
                        <span className="text-xs text-slate-600 font-medium truncate mt-0.5">
                          {venue.type}
                        </span>
                      </div>
                    </div>

                    {/* BENEFICIO DESTACADO */}
                    <div className="my-2.5">
                      <span className="text-xs font-mono font-bold text-amber-900 bg-[#fef3c7] px-3 py-1.5 rounded-xl border border-amber-200/80 inline-block">
                        ★ {venue.rebate}
                      </span>
                    </div>
                  </div>

                  {/* PIE DE CARD: BOTÓN CREAR CUENTA */}
                  <div className="pt-3.5 border-t border-[#ede8df] flex items-center justify-end">
                    <a
                      href={venue.affiliateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-black bg-slate-950 hover:bg-slate-800 text-white flex items-center justify-center gap-2 transition-all shadow-sm"
                    >
                      <span className="!text-white">{isEs ? 'Crear Cuenta' : 'Create Account'}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-white" />
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* CONTROLES DE NAVEGACIÓN EN LA PARTE INFERIOR (ANTERIOR / SIGUIENTE / PÁGINAS) */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200/80 mt-1">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-slate-600">
                  {isEs ? 'Página' : 'Page'} {currentPage + 1} {isEs ? 'de' : 'of'} {totalPages}
                </span>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#ede5d6] text-slate-800">
                  {allVenues.length} Exchanges
                </span>
              </div>

              {/* BOTONES ANTERIOR / SIGUIENTE + PUNTOS DE PÁGINA */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 mr-1">
                  {Array.from({ length: totalPages }).map((_, dotIdx) => (
                    <button
                      key={dotIdx}
                      type="button"
                      onClick={() => setCurrentPage(dotIdx)}
                      aria-label={`Página ${dotIdx + 1}`}
                      className={`h-2 rounded-full transition-all cursor-pointer border-none p-0 ${
                        currentPage === dotIdx 
                          ? 'w-6 bg-slate-950' 
                          : 'w-2 bg-slate-300 hover:bg-slate-400'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrev}
                    aria-label={isEs ? 'Página anterior' : 'Previous page'}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-[#ede5d6] text-slate-950 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-sm active:scale-95"
                  >
                    <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                    <span>{isEs ? 'Atrás' : 'Prev'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    aria-label={isEs ? 'Página siguiente' : 'Next page'}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-300 bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-sm active:scale-95"
                  >
                    <span className="!text-white">{isEs ? 'Siguiente' : 'Next'}</span>
                    <ChevronRight className="w-4 h-4 stroke-[2.5] text-white" />
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

export default ExchangesSection;
