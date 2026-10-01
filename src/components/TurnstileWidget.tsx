import React, { useEffect, useRef, useId } from 'react';

interface TurnstileWidgetProps {
  /** Callback cuando el token es generado exitosamente */
  onVerify: (token: string) => void;
  /** Callback cuando el widget expira (el token ya no es válido) */
  onExpire?: () => void;
  /** Callback cuando hay un error */
  onError?: () => void;
  /** Tema del widget */
  theme?: 'light' | 'dark' | 'auto';
  /** Tamaño del widget */
  size?: 'normal' | 'compact' | 'flexible';
  className?: string;
}

// Clave de test de Cloudflare (siempre pasa — para desarrollo local)
// Reemplazar con la clave real en producción via VITE_TURNSTILE_SITE_KEY
// Claves de test oficiales:
//   1x00000000000000000000AA → siempre pasa (para desarrollo)
//   2x00000000000000000000AB → siempre bloquea (para testing de rechazo)
const DEV_SITE_KEY = '1x00000000000000000000AA';

export const TurnstileWidget: React.FC<TurnstileWidgetProps> = ({
  onVerify,
  onExpire,
  onError,
  theme = 'light',
  size = 'normal',
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const uniqueId = useId().replace(/:/g, '');

  const siteKey = (import.meta as any).env.VITE_TURNSTILE_SITE_KEY || DEV_SITE_KEY;

  useEffect(() => {
    const tryRender = () => {
      const turnstile = (window as any).turnstile;
      if (!turnstile || !containerRef.current) return false;

      // Evitar doble-render
      if (widgetIdRef.current !== null) return true;

      try {
        widgetIdRef.current = turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme,
          size,
          callback: (token: string) => { onVerify(token); },
          'expired-callback': () => {
            widgetIdRef.current = null;
            if (onExpire) onExpire();
          },
          'error-callback': () => {
            widgetIdRef.current = null;
            if (onError) onError();
          }
        });
        return true;
      } catch (err) {
        console.warn('[Turnstile] Error al renderizar:', err);
        return false;
      }
    };

    // Intentar renderizar inmediatamente si el script ya cargó
    if (tryRender()) return;

    // Si el script aún no cargó, esperar con polling
    const interval = setInterval(() => {
      if (tryRender()) clearInterval(interval);
    }, 100);

    return () => {
      clearInterval(interval);
      const turnstile = (window as any).turnstile;
      if (turnstile && widgetIdRef.current !== null) {
        try { turnstile.remove(widgetIdRef.current); } catch {}
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, theme, size]);

  return (
    <div
      ref={containerRef}
      id={`turnstile-${uniqueId}`}
      className={`flex justify-center ${className}`}
    />
  );
};

export default TurnstileWidget;
