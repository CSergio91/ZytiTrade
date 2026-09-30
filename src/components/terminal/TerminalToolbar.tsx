import React, { useState } from 'react';
import { Star, MoreHorizontal, Search, X, Check } from 'lucide-react';
import { ALL_TIMEFRAMES, ALL_INDICATORS, IndicatorOption } from './types';

interface TerminalToolbarProps {
  isEs: boolean;
  timeframe: string;
  favoriteTimeframes: string[];
  activeIndicators: string[];
  favoriteIndicators: string[];
  onSelectTimeframe: (tf: string) => void;
  onToggleIndicator: (name: string) => void;
  onToggleFavoriteTimeframe: (tf: string, e?: React.MouseEvent) => void;
  onToggleFavoriteIndicator: (ind: string, e?: React.MouseEvent) => void;
}

export const TerminalToolbar: React.FC<TerminalToolbarProps> = ({
  isEs,
  timeframe,
  favoriteTimeframes,
  activeIndicators,
  favoriteIndicators,
  onSelectTimeframe,
  onToggleIndicator,
  onToggleFavoriteTimeframe,
  onToggleFavoriteIndicator
}) => {
  const [isTimeframeMenuOpen, setIsTimeframeMenuOpen] = useState(false);
  const [isIndicatorMenuOpen, setIsIndicatorMenuOpen] = useState(false);
  const [indicatorSearchQuery, setIndicatorSearchQuery] = useState('');

  // Lista de temporalidades visibles en la barra (favoritas + activa si no está entre favoritas)
  const visibleTimeframes = favoriteTimeframes.includes(timeframe)
    ? favoriteTimeframes
    : [...favoriteTimeframes, timeframe];

  // Indicadores filtrados por el buscador
  const filteredIndicators = ALL_INDICATORS.filter((ind) => 
    ind.name.toLowerCase().includes(indicatorSearchQuery.toLowerCase()) ||
    ind.label.toLowerCase().includes(indicatorSearchQuery.toLowerCase()) ||
    ind.description.toLowerCase().includes(indicatorSearchQuery.toLowerCase())
  );

  return (
    <div className="h-9 sm:h-10 px-2 sm:px-4 border-b border-[#ded5c5] flex items-center justify-between text-xs shrink-0 bg-white/60 overflow-x-auto no-scrollbar relative z-20">
      {/* SELECTOR DE TIMEFRAMES */}
      <div className="flex items-center gap-1 shrink-0">
        {visibleTimeframes.map((tf) => (
          <button
            key={tf}
            type="button"
            onClick={() => onSelectTimeframe(tf)}
            className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg font-mono font-bold text-[10px] sm:text-xs transition-colors cursor-pointer ${
              timeframe === tf 
                ? 'bg-slate-950 text-white shadow-xs' 
                : 'text-slate-600 hover:bg-slate-200/60 text-slate-900'
            }`}
          >
            {tf}
          </button>
        ))}

        {/* BOTÓN 3 PUNTITOS: MÁS TEMPORALIDADES (1s a Anuales) */}
        <button
          type="button"
          onClick={() => {
            setIsTimeframeMenuOpen(!isTimeframeMenuOpen);
            setIsIndicatorMenuOpen(false);
          }}
          className={`p-1 sm:p-1.5 rounded-lg border transition-colors cursor-pointer flex items-center justify-center ${
            isTimeframeMenuOpen
              ? 'bg-amber-100 border-amber-400 text-amber-950 shadow-xs'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-950'
          }`}
          title={isEs ? 'Más temporalidades (1s a Anual, Favoritos ★)' : 'More timeframes (1s to Yearly, Favorites ★)'}
        >
          <MoreHorizontal className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* INDICADORES TÉCNICOS */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0 pl-2">
        <span className="text-[10px] font-mono text-slate-400 uppercase hidden sm:inline">Indicadores:</span>
        {favoriteIndicators.map((ind) => {
          const isActive = activeIndicators.includes(ind);
          return (
            <button
              key={ind}
              type="button"
              onClick={() => onToggleIndicator(ind)}
              className={`px-1.5 sm:px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                isActive 
                  ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-xs' 
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {ind}
            </button>
          );
        })}

        {/* BOTÓN 3 PUNTITOS: BIBLIOTECA DE INDICADORES */}
        <button
          type="button"
          onClick={() => {
            setIsIndicatorMenuOpen(!isIndicatorMenuOpen);
            setIsTimeframeMenuOpen(false);
          }}
          className={`p-1 sm:p-1.5 rounded-lg border transition-colors cursor-pointer flex items-center justify-center ${
            isIndicatorMenuOpen
              ? 'bg-amber-100 border-amber-400 text-amber-950 shadow-xs'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-950'
          }`}
          title={isEs ? 'Biblioteca de Indicadores (Favoritos ★)' : 'Indicator Library (Favorites ★)'}
        >
          <MoreHorizontal className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* DROPDOWN / POPOVER DE TEMPORALIDADES */}
      {isTimeframeMenuOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[1px]" 
            onClick={() => setIsTimeframeMenuOpen(false)} 
          />
          <div className="absolute top-11 left-2 sm:left-4 z-50 w-[300px] sm:w-[350px] bg-white rounded-2xl border border-[#ded5c5] shadow-2xl p-3 animate-zoom-in text-slate-900 max-h-[75vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
              <div>
                <h4 className="text-xs font-black text-slate-950">
                  {isEs ? 'Intervalos de Tiempo' : 'Time Intervals'}
                </h4>
                <p className="text-[10px] text-slate-500">
                  {isEs ? 'Marca la estrella ★ para anclar a la barra' : 'Star ★ to pin to toolbar'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsTimeframeMenuOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {(['seconds', 'minutes', 'hours', 'days', 'periods'] as const).map((cat) => {
                const catLabels: Record<string, string> = {
                  seconds: isEs ? 'Segundos' : 'Seconds',
                  minutes: isEs ? 'Minutos' : 'Minutes',
                  hours: isEs ? 'Horas' : 'Hours',
                  days: isEs ? 'Días y Semanas' : 'Days & Weeks',
                  periods: isEs ? 'Meses y Anuales' : 'Months & Years'
                };
                return (
                  <div key={cat}>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      {catLabels[cat]}
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {ALL_TIMEFRAMES.filter((t) => t.category === cat).map((tf) => (
                        <div 
                          key={tf.value}
                          onClick={() => {
                            onSelectTimeframe(tf.value);
                            setIsTimeframeMenuOpen(false);
                          }}
                          className={`flex items-center justify-between px-2.5 py-1 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
                            timeframe === tf.value
                              ? 'bg-amber-100/70 border-amber-400 text-amber-950 font-black'
                              : 'bg-[#fbf9f4] border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-white'
                          }`}
                        >
                          <span className="font-bold">{tf.label}</span>
                          <button
                            type="button"
                            onClick={(e) => onToggleFavoriteTimeframe(tf.value, e)}
                            className="p-1 transition-colors cursor-pointer"
                          >
                            <Star 
                              className={`w-3.5 h-3.5 ${
                                favoriteTimeframes.includes(tf.value) 
                                  ? 'fill-amber-400 text-amber-500' 
                                  : 'text-slate-300 hover:text-amber-400'
                              }`} 
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* DROPDOWN / POPOVER DE INDICADORES */}
      {isIndicatorMenuOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[1px]" 
            onClick={() => setIsIndicatorMenuOpen(false)} 
          />
          <div className="absolute top-11 right-2 sm:right-4 z-50 w-[320px] sm:w-[380px] bg-white rounded-2xl border border-[#ded5c5] shadow-2xl p-3 animate-zoom-in text-slate-900 max-h-[75vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 shrink-0">
              <div>
                <h4 className="text-xs font-black text-slate-950">
                  {isEs ? 'Biblioteca de Indicadores' : 'Indicator Library'}
                </h4>
                <p className="text-[10px] text-slate-500">
                  {isEs ? 'Activa en el gráfico y marca favoritos ★' : 'Toggle on chart & star favorites ★'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsIndicatorMenuOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* BUSCADOR */}
            <div className="relative mb-2 shrink-0">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={indicatorSearchQuery}
                onChange={(e) => setIndicatorSearchQuery(e.target.value)}
                placeholder={isEs ? 'Buscar indicador (ej. RSI, BOLL)...' : 'Search indicators (e.g. RSI, BOLL)...'}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-amber-500 bg-[#fbf9f4]"
              />
            </div>

            {/* LISTA DE INDICADORES SCROLLABLE */}
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-1.5 pr-0.5">
              {filteredIndicators.map((ind: IndicatorOption) => {
                const isActive = activeIndicators.includes(ind.name);
                const isFav = favoriteIndicators.includes(ind.name);
                return (
                  <div
                    key={ind.name}
                    onClick={() => onToggleIndicator(ind.name)}
                    className={`flex items-center justify-between p-2 rounded-xl border text-xs transition-all cursor-pointer ${
                      isActive
                        ? 'bg-amber-50/80 border-amber-300 text-slate-950 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <div className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 ${
                        isActive
                          ? 'bg-amber-500 border-amber-500 text-white'
                          : 'border-slate-300 bg-[#fbf9f4]'
                      }`}>
                        {isActive && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-black text-slate-950">{ind.name}</span>
                          <span className="text-[10px] text-slate-500 truncate">{ind.label}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">{ind.description}</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => onToggleFavoriteIndicator(ind.name, e)}
                      className="p-1 transition-colors shrink-0 cursor-pointer"
                      title={isFav ? (isEs ? 'Quitar de favoritos' : 'Remove favorite') : (isEs ? 'Añadir a favoritos' : 'Add favorite')}
                    >
                      <Star 
                        className={`w-3.5 h-3.5 ${
                          isFav 
                            ? 'fill-amber-400 text-amber-500' 
                            : 'text-slate-300 hover:text-amber-400'
                        }`} 
                      />
                    </button>
                  </div>
                );
              })}
              {filteredIndicators.length === 0 && (
                <div className="text-center py-6 text-xs text-slate-400">
                  {isEs ? 'No se encontraron indicadores' : 'No indicators found'}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
