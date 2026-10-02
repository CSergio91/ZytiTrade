import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Registro de Service Worker para caché persistente de imágenes y assets (Zero-Egress)
if (typeof window !== 'undefined' && 'serviceWorker' in navigator && (import.meta as any).env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('[SW] Registration notice:', err);
    });
  });
}

