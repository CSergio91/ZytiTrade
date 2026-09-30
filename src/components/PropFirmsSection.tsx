import React, { useState } from 'react';
import { Award, Zap, ArrowRight, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { translations, Language } from '../i18n/translations';
import { PropFirmLogo } from './PropFirmLogo';
import { LottieAnimation } from './LottieAnimation';
import networkAnimationData from '../assets/animations/services-network.json';

interface PropFirmsSectionProps {
  currentLang: Language;
  isActive: boolean;
}

export const PropFirmsSection: React.FC<PropFirmsSectionProps> = ({ currentLang, isActive }) => {
  const t = translations[currentLang].propFirmsSection || {
    tag: '/prop-firms-auditadas',
    title: currentLang === 'es' ? 'Directorio y Auditoría de Prop Firms.' : 'Audited Prop Firms Directory.',
    subtitle: currentLang === 'es'
      ? 'Compara firmas de fondeo, reglas de drawdown y opera cuentas de evaluación directamente desde ZYTI Trade.'
      : 'Benchmark drawdown rules, profit targets, and trade official funded accounts directly within ZYTI Trade.',
  };
  const isEs = currentLang === 'es';
  const [currentPage, setCurrentPage] = useState(0);

  // 16 Prop Firms líderes limpias sin saturación de etiquetas
  const allFirms = [
    // PÁGINA 1: GIGANTES MUNDIALES
    {
      id: 'ftmo',
      name: 'FTMO',
      country: 'CZ',
      split: '90% Profit Split',
      maxCapital: '$200,000 USD',
      model: isEs ? 'Reto Evaluatorio en 2 Fases' : '2-Step Evaluation Challenge',
      affiliateUrl: 'https://ftmo.com/',
    },
    {
      id: 'fundednext',
      name: 'FundedNext',
      country: 'AE',
      split: '90% Profit Split',
      maxCapital: '$300,000 USD',
      model: isEs ? '15% de Ganancia en Fase de Reto' : '15% Profit Share in Challenge',
      affiliateUrl: 'https://fundednext.com/',
    },
    {
      id: 'wemastertrade',
      name: 'We Master Trade',
      country: 'US',
      split: '80% Profit Split',
      maxCapital: '$100,000 USD',
      model: isEs ? 'Fondeo Inmediato Sin Desafío' : 'Direct Instant Funding',
      affiliateUrl: 'https://wemastertrade.com/',
    },
    {
      id: 'the5ers',
      name: 'The 5%ers',
      country: 'UK',
      split: '100% Profit Split',
      maxCapital: '$4,000,000 USD',
      model: isEs ? 'Cuentas Fondeadas y Escalado Real' : 'Real Funded Accounts & Scaling',
      affiliateUrl: 'https://the5ers.com/',
    },

    // PÁGINA 2: CRIPTO & FLEXIBLES
    {
      id: 'fundingpips',
      name: 'Funding Pips',
      country: 'AE',
      split: '90% Profit Split',
      maxCapital: '$100,000 USD',
      model: isEs ? 'Pagos Cada 5 Días en Cripto' : '5-Day Payouts in Crypto',
      affiliateUrl: 'https://fundingpips.com/',
    },
    {
      id: 'e8',
      name: 'E8 Markets',
      country: 'US',
      split: '80% Profit Split',
      maxCapital: '$200,000 USD',
      model: isEs ? 'Retiros en 8 Días y E8 Track' : '8-Day Payouts & E8 Track',
      affiliateUrl: 'https://e8markets.com/',
    },
    {
      id: 'alphacapital',
      name: 'Alpha Capital Group',
      country: 'UK',
      split: '80% Profit Split',
      maxCapital: '$200,000 USD',
      model: isEs ? '0% Comisiones de Ejecución MT5' : 'Zero Commissions on MT5',
      affiliateUrl: 'https://alphacapitalgroup.uk/',
    },
    {
      id: 'goat',
      name: 'Goat Funded Trader',
      country: 'ES',
      split: '95% Profit Split',
      maxCapital: '$200,000 USD',
      model: isEs ? 'Desafíos Sin Límite de Tiempo' : 'No Time Limit Challenges',
      affiliateUrl: 'https://goatfundedtrader.com/',
    },

    // PÁGINA 3: FUTUROS & TRADING INSTITUCIONAL
    {
      id: 'topstep',
      name: 'Topstep',
      country: 'US',
      split: '90% Profit Split',
      maxCapital: '$150,000 USD',
      model: isEs ? 'Trading Combine Futuros CME' : 'Official CME Futures Combine',
      affiliateUrl: 'https://www.topstep.com/',
    },
    {
      id: 'apex',
      name: 'Apex Trader Funding',
      country: 'US',
      split: '90% Profit Split',
      maxCapital: '$300,000 USD',
      model: isEs ? 'Futuros con NinjaTrader & Tradovate' : 'NinjaTrader & Tradovate Futures',
      affiliateUrl: 'https://apextraderfunding.com/',
    },
    {
      id: 'myfundedfx',
      name: 'MyFundedFX',
      country: 'US',
      split: '80% Profit Split',
      maxCapital: '$300,000 USD',
      model: isEs ? 'Evaluaciones de 1 y 2 Pasos' : '1 & 2 Step Evaluations',
      affiliateUrl: 'https://myfundedfx.com/',
    },
    {
      id: 'aquafunded',
      name: 'AquaFunded',
      country: 'AE',
      split: '90% Profit Split',
      maxCapital: '$200,000 USD',
      model: isEs ? 'Retiros en Cripto Procesados en 24h' : '24h Crypto Payouts Processed',
      affiliateUrl: 'https://aquafunded.com/',
    },

    // PÁGINA 4: ECOSISTEMA & PLATAFORMAS PROPIETARIAS
    {
      id: 'globalcity',
      name: 'Global City Funding',
      country: 'Global',
      split: '90% Profit Split',
      maxCapital: '$200,000 USD',
      model: isEs ? 'Fondeo Inmediato & Terminal ZYTI Nativa' : 'Instant Funding & Native ZYTI OS',
      affiliateUrl: 'https://globalcityfunding.com/',
    },
    {
      id: 'funderpro',
      name: 'FunderPro',
      country: 'MT',
      split: '80% Profit Split',
      maxCapital: '$200,000 USD',
      model: isEs ? 'Cuentas con Broker STP Real' : 'Real STP Broker Accounts',
      affiliateUrl: 'https://funderpro.com/',
    },
    {
      id: 'citytraders',
      name: 'City Traders Imperium',
      country: 'UK',
      split: '80% Profit Split',
      maxCapital: '$2,000,000 USD',
      model: isEs ? 'Mesa Institucional de Londres' : 'London Dealing Desk Portfolio',
      affiliateUrl: 'https://citytradersimperium.com/',
    },
    {
      id: 'pipfarm',
      name: 'PipFarm',
      country: 'SG',
      split: '90% Profit Split',
      maxCapital: '$300,000 USD',
      model: isEs ? 'Fondeo Dinámico con Puntos XP' : 'Dynamic XP Gamified Model',
      affiliateUrl: 'https://pipfarm.com/',
    },
  ];

  const pageSize = 4;
  const totalPages = Math.ceil(allFirms.length / pageSize);
  const currentFirms = allFirms.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

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
          
          {/* LADO IZQUIERDO (4 COLUMNAS): CABECERA + ANIMACIÓN LOTTIE + CTA */}
          <div className={`lg:col-span-4 flex flex-col justify-between transition-all duration-500 ${
            isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f4edd9] text-[#855e15] text-xs font-mono font-bold tracking-tight mb-3">
                <Award className="w-3.5 h-3.5 text-amber-600" />
                <span>{t.tag || '/prop-firms-auditadas'}</span>
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
              <LottieAnimation animationData={networkAnimationData} className="w-52 h-52" />
            </div>

            {/* BOTÓN CTA ACTIVO */}
            <div className="mt-3 flex items-center">
              <button 
                className="flex items-center gap-2.5 px-6 py-3 text-xs sm:text-sm font-black text-slate-950 bg-[#eab308] hover:bg-[#ca8a04] rounded-2xl shadow-sm transition-all duration-150 cursor-pointer transform hover:scale-105 active:scale-95"
              >
                <Zap className="w-4 h-4 stroke-[2.5] fill-slate-950" />
                <span>{isEs ? 'Operar en Prop Firms' : 'Trade Prop Firms'}</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* LADO DERECHO (8 COLUMNAS): 4 CARDS GRANDES Y CONTROLES EN LA PARTE INFERIOR */}
          <div className="lg:col-span-8 flex flex-col justify-between gap-5">
            
            {/* GRID DE 4 CARDS HORIZONTALES GRANDES (2x2) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {currentFirms.map((firm, idx) => (
                <div
                  key={firm.id}
                  style={{ animationDelay: `${idx * 50}ms` }}
                  className={`warm-card rounded-3xl p-5 sm:p-6 flex flex-col justify-between hover:border-slate-500 transition-all duration-200 hover:-translate-y-1 shadow-md ${
                    isActive ? 'animate-card-in' : 'opacity-0'
                  }`}
                >
                  <div>
                    {/* CABECERA: LOGO + NOMBRE + PAÍS + SPLIT */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-[#f4ede0] flex items-center justify-center shrink-0">
                          <PropFirmLogo name={firm.name} size={30} />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-base sm:text-lg font-black text-slate-950 truncate">
                              {firm.name}
                            </h3>
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#ede5d6] text-slate-800">
                              {firm.country}
                            </span>
                          </div>
                          <span className="text-xs text-slate-600 font-medium truncate mt-0.5">
                            {firm.model}
                          </span>
                        </div>
                      </div>

                      {/* SPLIT EN VERDE ESMERALDA */}
                      <span className="text-xs font-mono font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60 shrink-0 ml-2">
                        {firm.split}
                      </span>
                    </div>

                    {/* CAPITAL MÁXIMO DISPONIBLE */}
                    <div className="my-2.5">
                      <span className="text-xs font-mono font-bold text-slate-900 bg-[#ede5d6]/80 px-3 py-1.5 rounded-xl border border-slate-300/60 inline-flex items-center gap-1.5">
                        <span className="text-slate-500 font-semibold">{isEs ? 'Capital Máximo:' : 'Max Capital:'}</span>
                        <span className="font-black text-slate-950">{firm.maxCapital}</span>
                      </span>
                    </div>
                  </div>

                  {/* PIE DE CARD: BOTÓN CREAR CUENTA */}
                  <div className="pt-3.5 border-t border-[#ede8df] flex items-center justify-end">
                    <a
                      href={firm.affiliateUrl}
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
                  {allFirms.length} Prop Firms
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

export default PropFirmsSection;
