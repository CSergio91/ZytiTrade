import React, { useState } from 'react';
import { Star, MoreHorizontal, Search, X, Check } from 'lucide-react';
import { ALL_TIMEFRAMES, ALL_INDICATORS, IndicatorOption, sortTimeframes } from './types';

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
  const [isTimeframeModalOpen, setIsTimeframeModalOpen] = useState(false);
  const [isIndicatorModalOpen, setIsIndicatorModalOpen] = useState(false);
  const [indicatorSearchQuery, setIndicatorSearchQuery] = useState('');

  // Lista de temporalidades visibles en la barra siempre organizadas de menor a mayor
  const visibleTimeframes = sortTimeframes(
    favoriteTimeframes.includes(timeframe)
      ? favoriteTimeframes
      : [...favoriteTimeframes, timeframe]
  );

  // Indicadores filtrados por el buscador
  const filteredIndicators = ALL_INDICATORS.filter((ind) => 
    ind.name.toLowerCase().includes(indicatorSearchQuery.toLowerCase()) ||
    ind.label.toLowerCase().includes(indicatorSearchQuery.toLowerCase()) ||
    ind.description.toLowerCase().includes(indicatorSearchQuery.toLowerCase())
  );

  return (
    <>
      <div className="h-9 sm:h-10 px-2 sm:px-4 border-b border-[#ded5c5] flex items-center justify-between text-xs shrink-0 bg-white/70 overflow-x-auto no-scrollbar relative z-20">
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
              setIsTimeframeModalOpen(true);
              setIsIndicatorModalOpen(false);
            }}
            className={`p-1 sm:p-1.5 rounded-lg border transition-colors cursor-pointer flex items-center justify-center ${
              isTimeframeModalOpen
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
              setIsIndicatorModalOpen(true);
              setIsTimeframeModalOpen(false);
            }}
            className={`p-1 sm:p-1.5 rounded-lg border transition-colors cursor-pointer flex items-center justify-center ${
              isIndicatorModalOpen
                ? 'bg-amber-100 border-amber-400 text-amber-950 shadow-xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-950'
            }`}
            title={isEs ? 'Biblioteca de Indicadores (Favoritos ★)' : 'Indicator Library (Favorites ★)'}
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* MODAL RESPONSIVO DE TEMPORALIDADES (MÓVIL Y ESCRITORIO) */}
      {isTimeframeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/45 backdrop-blur-xs select-none">
          <div 
            className="fixed inset-0 -z-10" 
            onClick={() => setIsTimeframeModalOpen(false)} 
          />
          <div className="w-full max-w-md max-h-[85vh] bg-white rounded-3xl border border-[#ded5c5] shadow-2xl p-4 flex flex-col animate-zoom-in text-slate-900 overflow-hidden">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 shrink-0">
              <div>
                <h4 className="text-sm font-black text-slate-950 flex items-center gap-2">
                  <span>{isEs ? 'Intervalos de Tiempo' : 'Time Intervals'}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold">
                    1s - 1Y
                  </span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isEs ? 'Marca la estrella ★ para fijar en tu barra de acceso rápido' : 'Star ★ to pin to your quick toolbar'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsTimeframeModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                title={isEs ? 'Cerrar' : 'Close'}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-3.5 pr-1">
              {(['seconds', 'minutes', 'hours', 'days', 'periods'] as const).map((cat) => {
                const catLabels: Record<string, string> = {
                  seconds: isEs ? 'Segundos (Tick / Scalping)' : 'Seconds (Tick / Scalping)',
                  minutes: isEs ? 'Minutos (Intradía)' : 'Minutes (Intraday)',
                  hours: isEs ? 'Horas (Swing)' : 'Hours (Swing)',
                  days: isEs ? 'Días y Semanas (Posición)' : 'Days & Weeks (Position)',
                  periods: isEs ? 'Meses y Anuales (Macro)' : 'Months & Years (Macro)'
                };
                return (
                  <div key={cat}>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                      {catLabels[cat]}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                      {ALL_TIMEFRAMES.filter((t) => t.category === cat).map((tf) => {
                        const isFav = favoriteTimeframes.includes(tf.value);
                        const isSelected = timeframe === tf.value;
                        return (
                          <div 
                            key={tf.value}
                            onClick={() => {
                              onSelectTimeframe(tf.value);
                              setIsTimeframeModalOpen(false);
                            }}
                            className={`flex items-center justify-between px-3 py-1.5 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-amber-100/90 border-amber-400 text-amber-950 font-black shadow-xs'
                                : 'bg-[#fbf9f4] border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-white'
                            }`}
                          >
                            <span className="font-bold">{tf.label}</span>
                            <button
                              type="button"
                              onClick={(e) => onToggleFavoriteTimeframe(tf.value, e)}
                              className="p-1 transition-colors cursor-pointer hover:scale-110"
                              title={isFav ? (isEs ? 'Desmarcar favorito' : 'Unfavorite') : (isEs ? 'Marcar favorito' : 'Favorite')}
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
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL RESPONSIVO DE INDICADORES (MÓVIL Y ESCRITORIO) */}
      {isIndicatorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/45 backdrop-blur-xs select-none">
          <div 
            className="fixed inset-0 -z-10" 
            onClick={() => setIsIndicatorModalOpen(false)} 
          />
          <div className="w-full max-w-lg max-h-[85vh] bg-white rounded-3xl border border-[#ded5c5] shadow-2xl p-4 flex flex-col animate-zoom-in text-slate-900 overflow-hidden">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 shrink-0">
              <div>
                <h4 className="text-sm font-black text-slate-950 flex items-center gap-2">
                  <span>{isEs ? 'Biblioteca de Indicadores' : 'Indicator Library'}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold">
                    {ALL_INDICATORS.length}
                  </span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isEs ? 'Activa indicadores en el gráfico o márcalos con ★ para tu barra' : 'Activate indicators on chart or star ★ for toolbar'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsIndicatorModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                title={isEs ? 'Cerrar' : 'Close'}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* BUSCADOR */}
            <div className="relative mb-3 shrink-0">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={indicatorSearchQuery}
                onChange={(e) => setIndicatorSearchQuery(e.target.value)}
                placeholder={isEs ? 'Buscar indicador (ej. RSI, OHLC, BOLL, EMA)...' : 'Search indicators (e.g. RSI, OHLC, BOLL, EMA)...'}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-amber-500 bg-[#fbf9f4]"
              />
            </div>

            {/* LISTA DE INDICADORES SCROLLABLE */}
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pr-1">
              {filteredIndicators.map((ind: IndicatorOption) => {
                const isActive = activeIndicators.includes(ind.name);
                const isFav = favoriteIndicators.includes(ind.name);
                return (
                  <div
                    key={ind.name}
                    onClick={() => onToggleIndicator(ind.name)}
                    className={`flex items-center justify-between p-2.5 rounded-2xl border text-xs transition-all cursor-pointer ${
                      isActive
                        ? 'bg-amber-50/90 border-amber-300 text-slate-950 font-bold shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div className={`w-4.5 h-4.5 rounded-lg flex items-center justify-center border shrink-0 transition-colors ${
                        isActive
                          ? 'bg-amber-500 border-amber-500 text-white shadow-xs'
                          : 'border-slate-300 bg-[#fbf9f4]'
                      }`}>
                        {isActive && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-black text-slate-950 text-xs">{ind.name}</span>
                          <span className="text-[11px] text-slate-600 font-semibold truncate">{ind.label}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate mt-0.5">{ind.description}</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => onToggleFavoriteIndicator(ind.name, e)}
                      className="p-1.5 transition-colors shrink-0 cursor-pointer hover:scale-110"
                      title={isFav ? (isEs ? 'Quitar de favoritos' : 'Remove favorite') : (isEs ? 'Añadir a favoritos' : 'Add favorite')}
                    >
                      <Star 
                        className={`w-4 h-4 ${
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
                <div className="text-center py-8 text-xs text-slate-400">
                  {isEs ? 'No se encontraron indicadores con ese término' : 'No indicators found matching that query'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
