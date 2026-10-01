import React, { useEffect, useState } from 'react';
import { Lottie } from 'lottie-react';

export interface LottieAnimationProps {
  /**
   * Datos JSON de la animación (Carga instantánea en 0ms y empaquetada)
   */
  animationData?: any;
  /**
   * URL remota o local del archivo JSON/Lottie
   */
  src?: string;
  /**
   * Reproducción continua en bucle (por defecto: true)
   */
  loop?: boolean;
  /**
   * Auto-reproducción al montar el componente (por defecto: true)
   */
  autoplay?: boolean;
  className?: string;
  style?: React.CSSProperties;
  width?: string | number;
  height?: string | number;
}

export const LottieAnimation: React.FC<LottieAnimationProps> = ({
  animationData: directData,
  src,
  loop = true,
  autoplay = true,
  className = '',
  style,
  width = '100%',
  height = '100%'
}) => {
  const [data, setData] = useState<any>(directData || null);
  const [isLoading, setIsLoading] = useState<boolean>(!directData && !!src);

  useEffect(() => {
    if (directData) {
      setData(directData);
      setIsLoading(false);
      return;
    }

    if (src) {
      setIsLoading(true);
      fetch(src)
        .then((res) => {
          if (!res.ok) throw new Error(`Failed to fetch Lottie from ${src}: ${res.status}`);
          return res.json();
        })
        .then((json) => {
          // Garantizar transparencia total eliminando capas de fondo blanco incrustadas
          if (json && Array.isArray(json.layers)) {
            json.layers = json.layers.filter(
              (l: any) => l.nm !== 'White Solid 1' && l.sc !== '#ffffff'
            );
          }
          setData(json);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error('[LottieAnimation] Error cargando animación:', err);
          setIsLoading(false);
        });
    }
  }, [directData, src]);

  if (isLoading || !data) {
    return (
      <div 
        className={`flex items-center justify-center bg-transparent ${className}`} 
        style={{ width, height, ...style }} 
      />
    );
  }

  return (
    <div 
      className={`flex items-center justify-center overflow-hidden bg-transparent ${className}`} 
      style={{ width, height, ...style }}
    >
      <Lottie
        src={data}
        loop={loop}
        autoplay={autoplay}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default LottieAnimation;

