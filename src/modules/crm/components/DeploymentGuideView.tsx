import React, { useState, useEffect } from 'react';
import { CrmLang } from '../types/i18n';
import { 
  Server, Terminal, Copy, Check, Cpu, Globe, 
  Layers, ShieldCheck, Activity, RefreshCw, Box
} from 'lucide-react';

interface DeploymentGuideViewProps {
  lang?: CrmLang;
}

interface CodeSnippetBoxProps {
  title: string;
  language: string;
  code: string;
  isEs: boolean;
}

const CodeSnippetBox: React.FC<CodeSnippetBoxProps> = ({ title, language, code, isEs }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-[#0A0D14] overflow-hidden shadow-lg my-3 font-mono">
      {/* Barra superior estilo terminal institucional */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-[#121620] border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block"></span>
          </div>
          <span className="text-[11px] font-bold text-slate-300 font-sans tracking-tight ml-2">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400 font-bold px-1.5 py-0.5 rounded bg-slate-800/70 uppercase">
            {language}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold font-sans bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer border border-slate-700 active:scale-95"
            title={isEs ? 'Copiar código' : 'Copy code'}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">{isEs ? '¡Copiado!' : 'Copied!'}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>{isEs ? 'Copiar' : 'Copy'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Bloque de código */}
      <div className="p-3.5 overflow-x-auto text-[11.5px] leading-relaxed text-slate-200 custom-scrollbar selection:bg-amber-500/30 selection:text-amber-200">
        <pre>{code}</pre>
      </div>
    </div>
  );
};

export const DeploymentGuideView: React.FC<DeploymentGuideViewProps> = ({ lang = 'es' }) => {
  const isEs = lang === 'es';
  const [activeTab, setActiveTab] = useState<'local' | 'docker' | 'vps' | 'sdk'>('local');

  // Estado del servidor Gateway consultado en vivo
  const [gatewayStatus, setGatewayStatus] = useState<{
    online: boolean;
    mode?: string;
    sockets?: number;
    uptime?: number;
  }>({ online: false });

  const checkGatewayHealth = async () => {
    try {
      const res = await fetch('http://localhost:8080/health', { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        setGatewayStatus({
          online: true,
          mode: data.mode,
          sockets: data.connectedSockets,
          uptime: data.uptimeSeconds
        });
      } else {
        setGatewayStatus({ online: false });
      }
    } catch {
      setGatewayStatus({ online: false });
    }
  };

  useEffect(() => {
    checkGatewayHealth();
    const interval = setInterval(checkGatewayHealth, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* CABECERA PRINCIPAL CON ESTADO EN VIVO */}
      <div className="p-5 rounded-2xl bg-[#0A0D14] border border-slate-800 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-amber-500/10 via-emerald-500/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {isEs ? 'Panel DevOps & Arquitectura' : 'DevOps & Architecture Hub'}
              </span>
              <span className="text-slate-500 text-xs">•</span>
              <span className="text-slate-400 text-xs font-mono">v1.0.0 Institutional</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight font-sans">
              {isEs ? 'Guía de Despliegue & Infraestructura Gateway' : 'Deployment & Gateway Infrastructure Guide'}
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl mt-1">
              {isEs
                ? 'Manual técnico paso a paso para levantar el clúster de WebSockets y Redis en local (sin Docker), empaquetar con Docker Compose para VPS e integrar el SDK en Prop Firms.'
                : 'Step-by-step guide to run the WebSocket & Redis cluster locally (no Docker), deploy with Docker Compose to VPS and integrate the Prop Firm SDK.'}
            </p>
          </div>

          {/* CHIP DE ESTADO EN VIVO DE LA PASARELA */}
          <div className="p-3 rounded-xl bg-[#141923] border border-slate-700/80 flex items-center gap-3 shrink-0 shadow-inner">
            <div className="relative flex items-center justify-center">
              <span className={`w-3 h-3 rounded-full ${gatewayStatus.online ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
              {gatewayStatus.online && (
                <span className="absolute w-5 h-5 rounded-full bg-emerald-500/30 animate-ping"></span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-200">
                  {gatewayStatus.online ? 'Gateway Local: ACTIVO' : 'Gateway Local: DETENIDO'}
                </span>
                <span className="text-[9px] font-mono px-1 rounded bg-slate-800 text-slate-400">
                  :8080
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                {gatewayStatus.online 
                  ? `Modo: ${gatewayStatus.mode} • ${gatewayStatus.sockets || 0} sockets vivos`
                  : (isEs ? 'Ejecuta npm run server en tu terminal' : 'Run npm run server in your terminal')}
              </div>
            </div>
            <button
              type="button"
              onClick={checkGatewayHealth}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              title={isEs ? 'Reverificar estado' : 'Recheck status'}
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* SELECTOR DE PESTAÑAS TÉCNICAS */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-800/80 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('local')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'local'
                ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/50'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>{isEs ? '1. Local sin Docker' : '1. Local no Docker'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('docker')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'docker'
                ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/50'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>{isEs ? '2. Docker Compose (Stack)' : '2. Docker Compose'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('vps')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'vps'
                ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/50'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>{isEs ? '3. Servidor VPS (Nginx + SSL)' : '3. Production VPS'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sdk')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'sdk'
                ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isEs ? '4. SDK para Prop Firms (npm)' : '4. Prop Firm SDK'}</span>
          </button>
        </div>
      </div>

      {/* CONTENIDO DE LA PESTAÑA SELECCIONADA */}
      <div className="p-6 rounded-2xl bg-white border border-[#ded5c5] shadow-xs">
        
        {/* ==================================================================== */}
        {/* PESTAÑA 1: LOCAL SIN DOCKER */}
        {/* ==================================================================== */}
        {activeTab === 'local' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-extrabold text-[#0F172A] flex items-center gap-2">
                <Terminal className="w-5 h-5 text-amber-600" />
                <span>{isEs ? 'Puesta en Marcha Local Rápida (Windows / macOS / Linux)' : 'Quick Local Setup (Windows / macOS / Linux)'}</span>
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                {isEs
                  ? 'El servidor microservicio no requiere tener Docker Desktop abierto. Cuenta con un motor de eventos en memoria RAM automático.'
                  : 'The server microservice does not require Docker. It automatically falls back to an in-memory event bus.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-2">
              <div className="p-3.5 rounded-xl bg-[#fbf9f4] border border-[#ded5c5]">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{isEs ? 'Puerto WebSocket' : 'WebSocket Port'}</div>
                <div className="text-lg font-black font-mono text-slate-900 mt-0.5">8080</div>
                <div className="text-[11px] text-slate-500 mt-1 font-mono">ws://localhost:8080</div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#fbf9f4] border border-[#ded5c5]">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{isEs ? 'Health Check HTTP' : 'Health Check HTTP'}</div>
                <div className="text-lg font-black font-mono text-slate-900 mt-0.5">GET /health</div>
                <div className="text-[11px] text-slate-500 mt-1 font-mono">http://localhost:8080/health</div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#fbf9f4] border border-[#ded5c5]">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{isEs ? 'Modo de Memoria' : 'Memory Engine'}</div>
                <div className="text-lg font-black font-mono text-slate-900 mt-0.5">In-Memory ⚡</div>
                <div className="text-[11px] text-slate-500 mt-1">{isEs ? 'Sub-2ms sin dependencias' : 'Sub-2ms zero dependencies'}</div>
              </div>
            </div>

            <CodeSnippetBox
              title={isEs ? 'Paso 1: Arrancar el Servidor Gateway en Terminal' : 'Step 1: Start Gateway Server in Terminal'}
              language="powershell / bash"
              isEs={isEs}
              code={`# En la raíz del proyecto, ejecuta el script npm preconfigurado:
npm run server

# O ejecutándolo directamente con Node.js:
node server/tradingHub.js`}
            />

            <CodeSnippetBox
              title={isEs ? 'Paso 2: Comprobar el Health Check en Terminal' : 'Step 2: Verify Health Check in Terminal'}
              language="bash"
              isEs={isEs}
              code={`# Consultar el estado de salud del Gateway con curl o PowerShell:
curl http://localhost:8080/health`}
            />

            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">{isEs ? 'Detección Automática de Redis:' : 'Automatic Redis Detection:'}</strong>{' '}
                {isEs
                  ? 'Si levantas Redis en localhost:6379, el servidor cambiará automáticamente a modo REDIS_CLUSTER sin que tengas que reiniciar tu código.'
                  : 'If you start Redis on localhost:6379, the server automatically promotes to REDIS_CLUSTER mode without restarts.'}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* PESTAÑA 2: DOCKER COMPOSE */}
        {/* ==================================================================== */}
        {activeTab === 'docker' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-extrabold text-[#0F172A] flex items-center gap-2">
                <Box className="w-5 h-5 text-blue-600" />
                <span>{isEs ? 'Stack Completo con Docker Compose (PostgreSQL 16 + Redis 7 + Gateway)' : 'Complete Stack with Docker Compose'}</span>
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                {isEs
                  ? 'Levanta la infraestructura completa en 3 contenedores coordinados con persistencia de volúmenes y red privada.'
                  : 'Spins up the complete stack in 3 coordinated containers with volume persistence and private network.'}
              </p>
            </div>

            <CodeSnippetBox
              title={isEs ? 'Comandos para compilar y levantar todo el stack' : 'Commands to build and run the complete stack'}
              language="bash"
              isEs={isEs}
              code={`# 1. Compilar y levantar PostgreSQL + Redis + Gateway en segundo plano
docker compose -f docker-compose.infra.yml up -d --build

# 2. Verificar que los 3 contenedores estén saludables (healthy)
docker compose -f docker-compose.infra.yml ps

# 3. Ver los logs en tiempo real del Gateway WebSocket
docker compose -f docker-compose.infra.yml logs -f zyti-gateway`}
            />

            <CodeSnippetBox
              title={isEs ? 'Detalle de docker-compose.infra.yml' : 'docker-compose.infra.yml snippet'}
              language="yaml"
              isEs={isEs}
              code={`services:
  zyti-db:
    image: postgres:16-alpine
    container_name: zyti-postgres
    ports: ["5432:5432"]

  zyti-redis:
    image: redis:7-alpine
    container_name: zyti-redis
    ports: ["6379:6379"]

  zyti-gateway:
    build:
      context: .
      dockerfile: Dockerfile.server
    container_name: zyti-trading-gateway
    ports: ["8080:8080"]
    environment:
      PORT: 8080
      REDIS_URL: redis://zyti-redis:6379`}
            />
          </div>
        )}

        {/* ==================================================================== */}
        {/* PESTAÑA 3: SERVIDOR VPS / NGINX / SSL */}
        {/* ==================================================================== */}
        {activeTab === 'vps' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-extrabold text-[#0F172A] flex items-center gap-2">
                <Server className="w-5 h-5 text-purple-600" />
                <span>{isEs ? 'Despliegue On-Premise en VPS (Ubuntu / Debian con Nginx y SSL)' : 'Production VPS Deployment (Ubuntu / Debian with Nginx & SSL)'}</span>
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                {isEs
                  ? 'Configura Nginx como terminador de SSL para exponer wss://api.tudominio.com hacia el puerto 8080 del Gateway.'
                  : 'Configure Nginx as reverse proxy with SSL termination for wss://api.yourdomain.com.'}
              </p>
            </div>

            <CodeSnippetBox
              title={isEs ? '1. Configuración de Nginx (/etc/nginx/sites-available/zyti-gateway)' : '1. Nginx Virtualhost configuration'}
              language="nginx"
              isEs={isEs}
              code={`server {
    server_name api.tudominio.com;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
}`}
            />

            <CodeSnippetBox
              title={isEs ? '2. Activar sitio y generar certificado SSL gratuito Let\'s Encrypt' : '2. Enable site and issue free SSL certificate'}
              language="bash"
              isEs={isEs}
              code={`# Enlazar configuración de Nginx
sudo ln -s /etc/nginx/sites-available/zyti-gateway /etc/nginx/sites-enabled/

# Verificar sintaxis y recargar Nginx
sudo nginx -t && sudo systemctl reload nginx

# Obtener certificado SSL con renovación automática
sudo certbot --nginx -d api.tudominio.com`}
            />

            <CodeSnippetBox
              title={isEs ? '3. Opcional: Systemd Service para Node.js (Si no usas Docker)' : '3. Optional: Systemd Service for Node.js (If running without Docker)'}
              language="ini"
              isEs={isEs}
              code={`# /etc/systemd/system/zyti-gateway.service
[Unit]
Description=ZYTI Trading WebSocket & Redis Gateway
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/var/www/zytitrade
ExecStart=/usr/bin/node server/tradingHub.js
Restart=always
RestartSec=3
Environment=NODE_ENV=production
Environment=PORT=8080
Environment=REDIS_URL=redis://127.0.0.1:6379

[Install]
WantedBy=multi-user.target`}
            />
          </div>
        )}

        {/* ==================================================================== */}
        {/* PESTAÑA 4: SDK PARA EMPRESAS DE FONDEO (NPM) */}
        {/* ==================================================================== */}
        {activeTab === 'sdk' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-extrabold text-[#0F172A] flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-600" />
                <span>{isEs ? 'Integración del SDK de Trading para Prop Firms (@zyti/trading-sdk)' : 'Trading SDK Integration for Prop Firms (@zyti/trading-sdk)'}</span>
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                {isEs
                  ? 'Cualquier empresa de fondeo puede copiar este módulo o instalar el paquete de npm en su código para conectar terminales al clúster.'
                  : 'Any funding firm can copy this module or import the npm package to connect terminals to the gateway.'}
              </p>
            </div>

            <CodeSnippetBox
              title={isEs ? 'Código Drop-In para Frontend o Terminal de la Prop Firm' : 'Drop-In Code for Prop Firm Frontend or Terminal'}
              language="typescript"
              isEs={isEs}
              code={`import { zytiTradingClient } from '@zyti/trading-sdk';

// 1. Conectar a la pasarela institucional con el ID de la cuenta de evaluación
zytiTradingClient.connect('ZYTI-100K-TF001');

// 2. Suscribirse a eventos sincronizados en vivo (< 5ms)
const unsubscribe = zytiTradingClient.onEvent((event) => {
  switch (event.type) {
    case 'TRADE_OPENED':
      console.log('Nueva orden abierta en otro dispositivo:', event.payload);
      // Actualizar tabla de posiciones abiertas
      break;

    case 'TRADE_CLOSED':
      console.log('Posición cerrada con PnL neto:', event.payload.realizedPnl);
      console.log('Nuevo balance de la cuenta:', event.payload.newBalance);
      break;

    case 'SL_TP_UPDATED':
      console.log('Stop Loss o Take Profit movido:', event.payload);
      break;

    case 'ACCOUNT_RESET':
      console.log('Cuenta restablecida a saldo inicial de evaluación');
      break;
  }
});

// 3. Emitir una operación desde la interfaz del trader
zytiTradingClient.publishEvent({
  type: 'TRADE_OPENED',
  payload: {
    symbol: 'BTC/USDT',
    side: 'LONG',
    size: 0.5,
    entryPrice: 96450.00,
    leverage: 20
  }
});`}
            />

            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 flex items-start gap-3">
              <Check className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">{isEs ? 'Beneficio de la Arquitectura:' : 'Architecture Advantage:'}</strong>{' '}
                {isEs
                  ? 'La Prop Firm no necesita tocar la base de datos de ZYTI directamente. El WebSocket Gateway con Redis maneja toda la concurrencia, sincronización de saldo y límites de riesgo.'
                  : 'The Prop Firm does not need direct database access. The WebSocket Gateway with Redis handles all concurrency and risk compliance.'}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
