import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface ExchangeLottieProps {
  className?: string;
  width?: string | number;
  height?: string | number;
}

export const ExchangeLottie: React.FC<ExchangeLottieProps> = ({ 
  className = '', 
  width = '100%', 
  height = '100%' 
}) => {
  return (
    <div className={`flex items-center justify-center overflow-hidden bg-transparent ${className}`}>
      <DotLottieReact
        src="/animations/exchange-radar.lottie"
        loop
        autoplay
        style={{ width, height, backgroundColor: 'transparent' }}
      />
    </div>
  );
};
