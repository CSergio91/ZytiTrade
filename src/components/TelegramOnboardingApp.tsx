import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, CheckCircle2, Lock, Mail, User, Eye, EyeOff, 
  ExternalLink, Sparkles, ArrowRight, AlertCircle 
} from 'lucide-react';
import { supabase, setStoredSession, UserSession } from '../lib/supabase';

export const TelegramOnboardingApp: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Parámetros de Telegram y código de sesión
  const [authCode, setAuthCode] = useState<string | null>(null);
  const [tgId, setTgId] = useState<number | null>(null);
  const [tgUsername, setTgUsername] = useState<string | null>(null);
  const [isTelegramContext, setIsTelegramContext] = useState(false);

  useEffect(() => {
    // 1. Inicializar SDK oficial de Telegram si está presente
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      try {
        tg.ready();
        tg.expand();
        if (typeof tg.setHeaderColor === 'function') tg.setHeaderColor('#fbf9f4');
        if (typeof tg.setBackgroundColor === 'function') tg.setBackgroundColor('#fbf9f4');
        setIsTelegramContext(true);
      } catch (e) {
        console.warn('Telegram WebApp init warning:', e);
      }
    }

    // 2. Extraer parámetros de URL y de initDataUnsafe
    const params = new URLSearchParams(window.location.search);
    const codeFromUrl = params.get('code');
    const tgIdFromUrl = params.get('tg_id');
    const usernameFromUrl = params.get('username');
    const nameFromUrl = params.get('name');

    const tgUser = tg?.initDataUnsafe?.user;

    const finalTgId = tgUser?.id || (tgIdFromUrl ? Number(tgIdFromUrl) : null);
    const finalUsername = tgUser?.username || usernameFromUrl || null;
    const finalName = [tgUser?.first_name, tgUser?.last_name].filter(Boolean).join(' ') || nameFromUrl || tgUser?.username || '';

    if (codeFromUrl) setAuthCode(codeFromUrl);
    if (finalTgId) setTgId(finalTgId);
    if (finalUsername) setTgUsername(finalUsername);
    if (finalName) setName(finalName);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('Por favor ingresa tu nombre o alias de trader.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Ingresa un correo electrónico válido.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Las contraseñas no coinciden.');
      return;
    }
    if (!acceptTerms) {
      setErrorMsg('Debes aceptar los Términos y Condiciones para continuar.');
      return;
    }

    setLoading(true);
    try {
      // 1. Registrar usuario en Supabase con su email real y contraseña
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: name.trim(),
            telegram_id: tgId || undefined,
            telegram_username: tgUsername || undefined,
            provider: 'telegram'
          }
        }
      });

      let userId = signUpData?.user?.id;

      // Si el email ya estaba registrado, intentar iniciar sesión para vincular
      if (signUpError) {
        if (signUpError.message?.toLowerCase().includes('already registered')) {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password
          });
          if (signInError) {
            throw new Error('Este correo ya está registrado con otra contraseña. Por favor usa tu contraseña correcta o un correo nuevo.');
          }
          userId = signInData?.user?.id;
        } else {
          throw signUpError;
        }
      }

      // 2. Actualizar perfil en public.profiles con los datos exactos
      if (userId) {
        try {
          await supabase
            .from('profiles')
            .upsert({
              id: userId,
              email: email.trim(),
              full_name: name.trim(),
              telegram_id: tgId || undefined,
              telegram_username: tgUsername || undefined,
              provider: 'telegram',
              is_verified: true,
              updated_at: new Date().toISOString()
            });
        } catch (profileErr) {
          console.warn('[Telegram Onboarding] Profile upsert warning:', profileErr);
        }
      }

      // 3. Sincronizar sesión con la ventana web mediante telegram_auth_sessions
      if (authCode) {
        try {
          await supabase
            .from('telegram_auth_sessions')
            .upsert({
              code: authCode,
              user_id: userId,
              email: email.trim(),
              full_name: name.trim(),
              telegram_id: tgId || undefined,
              telegram_username: tgUsername || undefined
            });
        } catch (syncErr) {
          console.warn('[Telegram Onboarding] Auth session sync warning:', syncErr);
        }
      }

      // 4. Guardar sesión local
      const userSession: UserSession = {
        id: userId,
        email: email.trim(),
        name: name.trim(),
        provider: 'telegram',
        telegramUsername: tgUsername || undefined,
        role: 'trader',
        isVerified: true
      };
      setStoredSession(userSession);

      // 5. Notificar éxito en el chat de Telegram del usuario si tenemos token
      const botToken = (import.meta as any).env.VITE_TELEGRAM_BOT_TOKEN || '';
      if (botToken && tgId) {
        try {
          const appUrl = (import.meta as any).env.VITE_APP_URL || window.location.origin;
          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: tgId,
              text: `🎉 <b>¡Registro completado con éxito, ${name.trim()}!</b>\n\nTu cuenta institucional en ZYTI Trade ha sido verificada y activada.\n📧 Correo: <code>${email.trim()}</code>\n\nYa puedes acceder a la terminal de trading desde cualquier dispositivo.`,
              parse_mode: 'HTML',
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: '🚀 Abrir Terminal ZYTI Trade',
                      url: appUrl
                    }
                  ]
                ]
              }
            })
          });
        } catch (e) {
          console.warn('Bot welcome message send error:', e);
        }
      }

      setSuccess(true);

      // Feedback háptico si estamos en Telegram
      const tg = (window as any).Telegram?.WebApp;
      if (tg?.HapticFeedback) {
        tg.HapticFeedback.notificationOccurred('success');
      }

      // Cerrar la Mini App tras 1.5 segundos
      setTimeout(() => {
        if (tg && typeof tg.close === 'function') {
          tg.close();
        } else {
          // Si está en navegador normal, redirigir a inicio o terminal
          window.location.href = '/';
        }
      }, 1600);

    } catch (err: any) {
      console.error('[Telegram Onboarding] Error:', err);
      setErrorMsg(err.message || 'Error al completar el registro.');
      const tg = (window as any).Telegram?.WebApp;
      if (tg?.HapticFeedback) {
        tg.HapticFeedback.notificationOccurred('error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-[#fbf9f4] text-slate-900 font-sans flex flex-col justify-between p-4 sm:p-6 select-none relative overflow-x-hidden">
      {/* GLOW DECORATIVO DE FONDO */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* CABECERA INSTITUCIONAL ZYTI TRADE */}
      <header className="pt-2 pb-4 text-center relative z-10">
        <div className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-white border border-[#ded5c5] shadow-xs mb-3">
          <div className="w-2 h-2 rounded-full bg-[#229ED9] animate-pulse" />
          <span className="text-[11px] font-bold text-slate-700 tracking-wide uppercase">
            Telegram Verified Onboarding
          </span>
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight leading-tight">
          Bienvenido a <span className="text-amber-700">ZYTI Trade</span>
        </h1>
        <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto">
          Configura tus credenciales reales para activar tu cuenta de trading institucional.
        </p>

        {tgUsername && (
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#229ED9]/10 text-[#1b8bc2] border border-[#229ED9]/30 text-xs font-bold">
            <svg className="w-3.5 h-3.5 fill-[#229ED9]" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
            </svg>
            <span>@{tgUsername}</span>
          </div>
        )}
      </header>

      {/* CUERPO PRINCIPAL / FORMULARIO */}
      <main className="flex-1 flex flex-col justify-center max-w-sm w-full mx-auto relative z-10">
        {success ? (
          <div className="p-6 rounded-3xl bg-white border border-[#ded5c5] shadow-xl text-center space-y-3 animate-zoom-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-300 shadow-md">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h2 className="text-lg font-black text-slate-900">
              ¡Cuenta Activada con Éxito!
            </h2>
            <p className="text-xs text-slate-600">
              Tu cuenta ha sido verificada y vinculada a Telegram. Cerrando la Mini App...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-5 rounded-3xl bg-white/95 backdrop-blur-md border border-[#ded5c5] shadow-xl space-y-3.5">
            {errorMsg && (
              <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2 animate-zoom-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* CAMPO 1: NOMBRE / ALIAS */}
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                Nombre Completo / Alias
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Alex Trader"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20 transition-all"
                  required
                />
              </div>
            </div>

            {/* CAMPO 2: CORREO ELECTRÓNICO REAL */}
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                Correo Electrónico Real
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu.correo@gmail.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20 transition-all"
                  required
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Lo usarás para notificaciones y acceso directo web.
              </span>
            </div>

            {/* CAMPO 3: CONTRASEÑA */}
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20 transition-all"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* CAMPO 4: REPETIR CONTRASEÑA */}
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite tu contraseña"
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl border bg-slate-50 text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                    confirmPassword && confirmPassword !== password 
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-400/20' 
                      : 'border-slate-300 focus:border-amber-500 focus:ring-amber-400/20'
                  }`}
                  required
                />
              </div>
            </div>

            {/* CHECKBOX: TÉRMINOS Y CONDICIONES */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300 cursor-pointer shrink-0"
                />
                <span className="text-[11px] text-slate-600 leading-tight">
                  Acepto los{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowTermsModal(true);
                    }}
                    className="font-bold text-amber-700 underline hover:text-amber-900"
                  >
                    Términos y Condiciones
                  </button>{' '}
                  y la Política de Riesgo de ZYTI Trade.
                </span>
              </label>
            </div>

            {/* BOTÓN SUBMIT */}
            <button
              type="submit"
              disabled={loading || !acceptTerms}
              className="w-full mt-2 py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-amber-950 font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-98"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-amber-950 border-t-transparent rounded-full animate-spin" />
                  <span>Activando cuenta...</span>
                </>
              ) : (
                <>
                  <span>Crear y Activar Cuenta</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </main>

      {/* FOOTER DISCRETO */}
      <footer className="pt-3 pb-1 text-center text-[10px] text-slate-400 relative z-10">
        ZYTI Trade Institutional Architecture • Conexión Cifrada SSL
      </footer>

      {/* MODAL DE TÉRMINOS Y CONDICIONES */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-[#fbf9f4] border border-[#ded5c5] rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 max-h-[80dvh] flex flex-col justify-between animate-slide-up-sheet">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <h3 className="text-xs font-black text-slate-900 uppercase">Términos y Condiciones</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="text-slate-400 hover:text-slate-800 text-xs font-bold"
              >
                Cerrar
              </button>
            </div>

            <div className="flex-1 overflow-y-auto my-3 text-xs text-slate-600 space-y-2 leading-relaxed pr-1">
              <p className="font-bold text-slate-800">
                1. Naturaleza del Servicio:
              </p>
              <p>
                ZYTI Trade provee una plataforma de tecnología de trading y conectividad con libros de órdenes institucionales y programas de evaluación Prop Firm.
              </p>
              <p className="font-bold text-slate-800">
                2. Gestión de Riesgo y Apalancamiento:
              </p>
              <p>
                El usuario reconoce los riesgos asociados a los mercados financieros y se compromete a operar dentro de los parámetros de drawdown y reglas fijadas por su programa de cuenta.
              </p>
              <p className="font-bold text-slate-800">
                3. Privacidad y Datos Personales:
              </p>
              <p>
                Los datos recolectados se utilizan exclusivamente para autenticación segura multi-dispositivo y comunicaciones operativas del terminal.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setAcceptTerms(true);
                setShowTermsModal(false);
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold text-xs cursor-pointer shadow-xs transition-colors"
            >
              Entendido y Aceptar Términos
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
