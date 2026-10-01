import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, CheckCircle2, Lock, Mail, User, Eye, EyeOff, 
  ExternalLink, Sparkles, ArrowRight, AlertCircle, Loader2, Check 
} from 'lucide-react';
import { supabase, setStoredSession, UserSession } from '../lib/supabase';

interface PasswordCriteria {
  minLength: boolean;
  hasNumberOrSpecial: boolean;
}

const getPasswordCriteria = (pwd: string): PasswordCriteria => ({
  minLength: pwd.length >= 6,
  hasNumberOrSpecial: /[\d\W_]/.test(pwd)
});

const getPasswordStrength = (pwd: string): { label: string; colorBg: string; colorText: string; percent: number } => {
  if (!pwd) return { label: '', colorBg: '', colorText: '', percent: 0 };
  let score = 0;
  if (pwd.length >= 6) score++;
  if (pwd.length >= 8) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[a-zA-Z]/.test(pwd)) score++;
  if (/[^a-zA-Z0-9]/.test(pwd)) score++;

  if (score <= 2) return { label: 'Débil', colorBg: 'bg-red-500', colorText: 'text-red-600', percent: 33 };
  if (score <= 3) return { label: 'Media', colorBg: 'bg-amber-500', colorText: 'text-amber-600', percent: 66 };
  return { label: 'Fuerte', colorBg: 'bg-emerald-500', colorText: 'text-emerald-600', percent: 100 };
};

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

  // Validación de correo en tiempo real
  const [emailStatus, setEmailStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [emailFeedback, setEmailFeedback] = useState<string | null>(null);

  const passwordCriteria = getPasswordCriteria(password);
  const passwordStrength = getPasswordStrength(password);

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

  // Validación de correo en tiempo real contra Supabase (profiles)
  useEffect(() => {
    const clean = email.trim().toLowerCase();
    if (!clean) {
      setEmailStatus('idle');
      setEmailFeedback(null);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(clean)) {
      setEmailStatus('invalid');
      setEmailFeedback('Formato de correo no válido');
      return;
    }

    setEmailStatus('checking');
    setEmailFeedback('Comprobando disponibilidad...');

    const timer = setTimeout(async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, email')
          .eq('email', clean)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.warn('[Email Check] query notice:', error);
          setEmailStatus('available');
          setEmailFeedback(null);
          return;
        }

        if (data && data.email) {
          setEmailStatus('taken');
          setEmailFeedback('Este correo ya está registrado en ZYTI Trade');
        } else {
          setEmailStatus('available');
          setEmailFeedback('Correo disponible');
        }
      } catch (_) {
        setEmailStatus('available');
        setEmailFeedback(null);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('Por favor ingresa tu nombre o alias de trader.');
      return;
    }
    if (!email.trim() || emailStatus === 'invalid') {
      setErrorMsg('Ingresa un correo electrónico válido.');
      return;
    }
    if (emailStatus === 'taken') {
      setErrorMsg('Este correo ya está registrado. Por favor usa otro correo electrónico.');
      return;
    }
    if (emailStatus === 'checking') {
      setErrorMsg('Estamos comprobando la disponibilidad del correo, espera un segundo...');
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

      // En Supabase Auth, si el correo ya existe, signUp puede devolver error O identities: []
      const isAlreadyRegistered =
        signUpError?.message?.toLowerCase().includes('already registered') ||
        (signUpData?.user && Array.isArray(signUpData.user.identities) && signUpData.user.identities.length === 0);

      if (signUpError || isAlreadyRegistered) {
        if (isAlreadyRegistered) {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password
          });
          if (signInError) {
            throw new Error('Este correo ya está registrado con otra contraseña. Por favor usa tu contraseña correcta o un correo nuevo.');
          }
          userId = signInData?.user?.id;
        } else if (signUpError) {
          throw signUpError;
        }
      }

      // 2. Actualizar perfil en public.profiles con los datos exactos
      if (userId) {
        const { error: profileErr } = await supabase
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

        if (profileErr) {
          console.warn('[Telegram Onboarding] Profile upsert warning:', profileErr);
        }

        // Asegurar consistencia actualizando también por telegram_id
        if (tgId) {
          await supabase
            .from('profiles')
            .update({
              email: email.trim(),
              full_name: name.trim(),
              telegram_username: tgUsername || undefined,
              is_verified: true,
              updated_at: new Date().toISOString()
            })
            .eq('telegram_id', tgId);
        }
      }

      // 3. Sincronizar sesión con la ventana web mediante telegram_auth_sessions
      let oldMessageId: number | null = null;
      if (tgId) {
        try {
          await supabase
            .from('telegram_auth_sessions')
            .update({
              user_id: userId,
              email: email.trim(),
              full_name: name.trim(),
              telegram_username: tgUsername || undefined
            })
            .eq('telegram_id', tgId);
        } catch (e) {
          console.warn('[Telegram Onboarding] tgId session update notice:', e);
        }
      }

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

      // 5. Configurar Telegram Bot: Botón en la barra de escribir, actualizar mensaje obsoleto y confirmación
      const botToken = (import.meta as any).env.VITE_TELEGRAM_BOT_TOKEN || '';
      if (botToken && tgId) {
        try {
          const appUrl = (import.meta as any).env.VITE_APP_URL || window.location.origin;

          // A. Configurar botón permanente en la barra de escribir (Telegram Menu Button)
          await fetch(`https://api.telegram.org/bot${botToken}/setChatMenuButton`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: tgId,
              menu_button: {
                type: 'web_app',
                text: '🚀 Abrir App',
                web_app: { url: appUrl }
              }
            })
          });

          // B. Modificar el mensaje previo eliminando el botón viejo de "Completar Registro" y dejando "🚀 Abrir Terminal"
          if (oldMessageId) {
            await fetch(`https://api.telegram.org/bot${botToken}/editMessageText`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: tgId,
                message_id: oldMessageId,
                text: `✅ <b>¡Registro completado con éxito, ${name.trim()}!</b>\n\nTu cuenta institucional en ZYTI Trade ya está activa y verificada.`,
                parse_mode: 'HTML',
                reply_markup: {
                  inline_keyboard: [
                    [
                      {
                        text: '🚀 Abrir Terminal ZYTI Trade',
                        web_app: { url: appUrl }
                      }
                    ]
                  ]
                }
              })
            }).catch(() => {});
          }

          // C. Enviar mensaje de confirmación con teclado persistente en la barra inferior
          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: tgId,
              text: `🎉 <b>¡Registro completado con éxito, ${name.trim()}!</b>\n\nTu cuenta institucional en ZYTI Trade ha sido verificada y activada.\n📧 Correo: <code>${email.trim()}</code>\n\nTienes el botón <b>🚀 Abrir App</b> directamente en tu barra de escribir para acceder en cualquier momento con un solo toque.`,
              parse_mode: 'HTML',
              reply_markup: {
                keyboard: [
                  [
                    {
                      text: '🚀 Abrir App',
                      web_app: { url: appUrl }
                    }
                  ]
                ],
                resize_keyboard: true,
                is_persistent: true
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

            {/* CAMPO 2: CORREO ELECTRÓNICO REAL CON VALIDACIÓN EN TIEMPO REAL */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold uppercase text-slate-600">
                  Correo Electrónico Real
                </label>
                {emailStatus === 'checking' && (
                  <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin text-amber-500" />
                    Comprobando...
                  </span>
                )}
                {emailStatus === 'available' && (
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Disponible
                  </span>
                )}
                {emailStatus === 'taken' && (
                  <span className="text-[10px] text-red-600 font-bold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Ya registrado
                  </span>
                )}
                {emailStatus === 'invalid' && email.length > 3 && (
                  <span className="text-[10px] text-amber-600 font-medium">
                    Formato incompleto
                  </span>
                )}
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu.correo@gmail.com"
                  className={`w-full pl-9 pr-9 py-2.5 rounded-xl border text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                    emailStatus === 'taken'
                      ? 'border-red-400 bg-red-50/40 focus:border-red-500 focus:ring-red-400/20'
                      : emailStatus === 'available'
                      ? 'border-emerald-400 bg-emerald-50/20 focus:border-emerald-500 focus:ring-emerald-400/20'
                      : 'border-slate-300 bg-slate-50 focus:border-amber-500 focus:ring-amber-400/20'
                  }`}
                  required
                />
                {emailStatus === 'available' && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                )}
                {emailStatus === 'taken' && (
                  <AlertCircle className="w-4 h-4 text-red-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                )}
              </div>
              {emailStatus === 'taken' ? (
                <span className="text-[10.5px] text-red-600 font-semibold mt-1 block leading-snug">
                  Este correo ya está registrado en ZYTI. Por favor usa otro correo diferente.
                </span>
              ) : (
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Lo usarás para notificaciones y acceso directo institucional.
                </span>
              )}
            </div>

            {/* CAMPO 3: CONTRASEÑA CON VALIDACIÓN Y FUERZA EN TIEMPO REAL */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold uppercase text-slate-600">
                  Contraseña
                </label>
                {password && (
                  <span className={`text-[10px] font-bold ${passwordStrength.colorText}`}>
                    Seguridad: {passwordStrength.label}
                  </span>
                )}
              </div>
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

              {/* Barra de progreso y criterios en tiempo real */}
              {password && (
                <div className="mt-1.5 space-y-1">
                  <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${passwordStrength.colorBg}`}
                      style={{ width: `${passwordStrength.percent}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-3 text-[10px] pt-0.5">
                    <span className={`flex items-center gap-1 font-medium transition-colors ${passwordCriteria.minLength ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {passwordCriteria.minLength ? <Check className="w-3 h-3 text-emerald-600" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 inline-block" />}
                      Mínimo 6 caracteres
                    </span>
                    <span className={`flex items-center gap-1 font-medium transition-colors ${passwordCriteria.hasNumberOrSpecial ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {passwordCriteria.hasNumberOrSpecial ? <Check className="w-3 h-3 text-emerald-600" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 inline-block" />}
                      Número o símbolo
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* CAMPO 4: REPETIR CONTRASEÑA EN TIEMPO REAL */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold uppercase text-slate-600">
                  Confirmar Contraseña
                </label>
                {confirmPassword && (
                  confirmPassword === password ? (
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Coinciden
                    </span>
                  ) : (
                    <span className="text-[10px] text-red-600 font-bold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      No coinciden
                    </span>
                  )
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite tu contraseña"
                  className={`w-full pl-9 pr-9 py-2.5 rounded-xl border text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                    confirmPassword && confirmPassword !== password 
                      ? 'border-red-400 bg-red-50/40 focus:border-red-500 focus:ring-red-400/20' 
                      : confirmPassword && confirmPassword === password
                      ? 'border-emerald-400 bg-emerald-50/20 focus:border-emerald-500 focus:ring-emerald-400/20'
                      : 'border-slate-300 bg-slate-50 focus:border-amber-500 focus:ring-amber-400/20'
                  }`}
                  required
                />
                {confirmPassword && confirmPassword === password && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                )}
                {confirmPassword && confirmPassword !== password && (
                  <AlertCircle className="w-4 h-4 text-red-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                )}
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
              disabled={
                loading || 
                !acceptTerms || 
                emailStatus === 'taken' || 
                emailStatus === 'invalid' || 
                emailStatus === 'checking' ||
                password.length < 6 ||
                password !== confirmPassword ||
                !name.trim()
              }
              className="w-full mt-2 py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-amber-950 font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-98"
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
