import React, { useState, useEffect } from 'react';
import { X, Zap, Mail, Lock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { translations, Language } from '../i18n/translations';
import { supabase, setStoredSession, UserSession } from '../lib/supabase';
import { LottieAnimation } from './LottieAnimation';
import loginAnimationData from '../assets/animations/login.json';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: Language;
  onLoginSuccess?: (user: UserSession) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentLang,
  onLoginSuccess
}) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => setMounted(true), 20);
      return () => clearTimeout(t);
    } else {
      setMounted(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const t = translations[currentLang].authModal;

  const handleDemoAccess = () => {
    setLoading(true);
    setErrorMsg(null);
    setEmail('demo@zyti.trade');
    setPassword('demo1234');
    
    setTimeout(() => {
      const demoUser: UserSession = {
        email: 'demo@zyti.trade',
        name: 'Demo Trader (Pro)'
      };
      setStoredSession(demoUser);
      setSuccessMsg(currentLang === 'es' ? '¡Bienvenido a la Terminal ZYTI OS!' : 'Welcome to ZYTI OS Terminal!');
      setLoading(false);
      if (onLoginSuccess) {
        onLoginSuccess(demoUser);
      }
      setTimeout(onClose, 600);
    }, 400);
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(
        err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')
          ? 'Instancia local de Supabase (127.0.0.1:54321) desconectada. Puedes acceder instantáneamente con el botón "Acceso Demo".'
          : err.message || 'Error al autenticar'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (email === 'demo@zyti.trade' && password === 'demo1234') {
      handleDemoAccess();
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      setErrorMsg(currentLang === 'es' ? 'Las contraseñas no coinciden' : 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password
        });
        if (error) throw error;
        if (data.user) {
          const userSession: UserSession = { email: data.user.email || email, name: email.split('@')[0] };
          setStoredSession(userSession);
          setSuccessMsg(currentLang === 'es' ? '¡Cuenta creada con éxito!' : 'Account created successfully!');
          if (onLoginSuccess) onLoginSuccess(userSession);
          setTimeout(onClose, 500);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        if (data.user) {
          const userSession: UserSession = { email: data.user.email || email, name: email.split('@')[0] };
          setStoredSession(userSession);
          setSuccessMsg(currentLang === 'es' ? '¡Inicio de sesión exitoso!' : 'Signed in successfully!');
          if (onLoginSuccess) onLoginSuccess(userSession);
          setTimeout(onClose, 500);
        }
      }
    } catch (err: any) {
      setErrorMsg(
        err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')
          ? 'Instancia local de Supabase (127.0.0.1:54321) desconectada. Puedes acceder instantáneamente con el botón "Acceso Demo".'
          : err.message || 'Error al autenticar'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-6 bg-slate-950/65 backdrop-blur-md transition-opacity duration-300 ease-out ${
        mounted ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={onClose}
    >
      <div 
        className={`warm-card auth-modal-window rounded-t-[28px] md:rounded-3xl shadow-2xl relative border border-[#ded5c5] bg-[#fbf9f4] overflow-hidden no-scrollbar transform transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          mounted ? 'translate-y-0 opacity-100' : 'translate-y-full md:translate-y-12 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* BOTÓN CERRAR */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2.5 right-3.5 z-30 p-1.5 sm:p-2 rounded-full text-slate-500 hover:text-slate-950 hover:bg-[#ede5d6] transition-colors cursor-pointer bg-white/80 backdrop-blur-sm shadow-xs border border-[#ded5c5]/80"
          aria-label="Cerrar modal"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* LAYOUT SPLIT: 40% ARRIBA / 60% ABAJO EN MÓVIL, 2 COLUMNAS EN TABLET Y DESKTOP */}
        <div className="auth-modal-grid">
          
          {/* LADO IZQUIERDO: PORTADA VISUAL EN MÓVIL / COLUMNA IZQUIERDA EN TABLET Y DESKTOP */}
          <div className="auth-modal-left bg-gradient-to-b from-[#f5ede0] via-[#f2e9dc] to-[#ede3d1] text-center relative">
            {/* DRAG HANDLE NATIVO DE APP (SOLO MÓVIL) */}
            <div className="w-10 h-1 bg-[#d4c8b5] rounded-full mx-auto mb-1 shrink-0 block md:hidden" />

            {/* LOGO OFICIAL DE ZYTI: CENTRADO */}
            <div className="w-full flex items-center justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 md:px-3.5 md:py-1.5 rounded-full bg-white/90 backdrop-blur-sm border border-[#ded5c5] shadow-xs">
                <img 
                  src="/logo-zyti.png" 
                  alt="ZYTI Trade Logo" 
                  className="w-5 h-5 sm:w-6 sm:h-6 md:w-6 md:h-6 lg:w-7 lg:h-7 object-contain" 
                />
                <span className="font-black text-xs sm:text-sm md:text-base tracking-tight text-slate-950">
                  ZYTI <span className="font-light text-slate-500">Trade</span>
                </span>
              </div>
            </div>

            {/* TÍTULO EN TABLET Y DESKTOP */}
            <div className="hidden md:block w-full mt-2.5 lg:mt-3">
              <h3 className="text-lg md:text-xl lg:text-2xl font-black text-slate-950 tracking-tight">
                {isSignUp ? t.signUpTitle : t.signInTitle}
              </h3>
            </div>

            {/* ANIMACIÓN LOTTIE: TAMAÑO EQUILIBRADO PARA NO EMPUJAR EL BOTÓN DEMO */}
            <div className="flex-1 flex items-center justify-center w-full min-h-0 py-1">
              <LottieAnimation 
                animationData={loginAnimationData} 
                className="h-full w-full max-h-32 sm:max-h-36 md:max-h-36 lg:max-h-44 xl:max-h-48 object-contain drop-shadow-xs" 
              />
            </div>

            {/* BOTÓN DESTACADO DEMO EN PANEL IZQUIERDO: SIEMPRE VISIBLE EN DESKTOP Y TABLET */}
            <div className="w-full shrink-0 mt-2 block">
              <button
                type="button"
                onClick={handleDemoAccess}
                disabled={loading}
                className="w-full py-2 sm:py-2.5 px-3 rounded-xl bg-white/95 hover:bg-white text-slate-950 font-bold text-xs shadow-xs border border-[#ded5c5] transition-all transform hover:scale-[1.01] active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                <Zap className="w-3.5 h-3.5 fill-[#eab308] text-[#eab308]" />
                <span>{t.demoBtn}</span>
              </button>
              <span className="text-[10px] text-slate-500 font-mono block mt-1 hidden sm:block">
                {t.demoNotice}
              </span>
            </div>
          </div>

          {/* LADO DERECHO: FORMULARIO DE LOGIN COMPLETO */}
          <div className="auth-modal-right no-scrollbar">
            
            {/* TÍTULO EN MÓVIL */}
            <div className="block md:hidden mb-2 text-center">
              <h3 className="text-base sm:text-lg font-black text-slate-950 tracking-tight">
                {isSignUp ? t.signUpTitle : t.signInTitle}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {isSignUp ? t.subtitleSignUp : t.subtitleSignIn}
              </p>
            </div>

            {/* BOTÓN ACCESO DEMO INSTANTÁNEO EN FORMULARIO: DISPONIBLE PARA TODOS LOS DISPOSITIVOS */}
            <div className="mb-2.5 sm:mb-3 block">
              <button
                type="button"
                onClick={handleDemoAccess}
                disabled={loading}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-50 to-amber-100/80 hover:from-amber-100 hover:to-amber-200/80 text-slate-950 font-bold text-xs shadow-xs border border-amber-300/80 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Zap className="w-3.5 h-3.5 fill-[#eab308] text-[#eab308]" />
                <span>{t.demoBtn}</span>
              </button>
            </div>
            
            {/* SOCIAL AUTH: GOOGLE & GITHUB */}
            <div className="grid grid-cols-2 gap-2 mb-2 sm:mb-3">
              <button
                type="button"
                onClick={() => handleOAuth('google')}
                disabled={loading}
                className="flex items-center justify-center gap-2 py-1.5 sm:py-2.5 px-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs transition-all shadow-xs cursor-pointer active:scale-98"
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={() => handleOAuth('github')}
                disabled={loading}
                className="flex items-center justify-center gap-2 py-1.5 sm:py-2.5 px-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs transition-all shadow-xs cursor-pointer active:scale-98"
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-slate-900" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                </svg>
                <span>GitHub</span>
              </button>
            </div>

            {/* DIVIDER */}
            <div className="relative flex items-center justify-center mb-2 sm:mb-3">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-[#fbf9f4] px-2 text-[10px] sm:text-[11px] font-mono text-slate-500 uppercase tracking-wider whitespace-nowrap">
                {t.orDivider}
              </span>
              <div className="border-t border-slate-200 w-full" />
            </div>

            {/* MENSAJES DE ESTADO */}
            {errorMsg && (
              <div className="mb-2 p-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start gap-1.5 leading-snug">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-2 p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* FORMULARIO */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:gap-2.5">
              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-slate-800 mb-0.5">
                  {t.emailLabel}
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.emailPlaceholder}
                    className="w-full pl-9 pr-3 py-1.5 sm:py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-slate-800 mb-0.5">
                  {t.passLabel}
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-1.5 sm:py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-xs"
                  />
                </div>
              </div>

              {isSignUp && (
                <div>
                  <label className="block text-[11px] sm:text-xs font-bold text-slate-800 mb-0.5">
                    {t.confirmPassLabel}
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-1.5 sm:py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-xs"
                    />
                  </div>
                </div>
              )}

              {/* BOTÓN AMARILLO OFICIAL DE ENTRAR A LA TERMINAL */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-1 py-2 sm:py-3 px-4 rounded-xl bg-[#eab308] hover:bg-[#ca8a04] text-slate-950 font-black text-xs sm:text-sm shadow-sm transition-all transform hover:scale-[1.01] active:scale-99 cursor-pointer flex items-center justify-center gap-2"
              >
                <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5] fill-slate-950" />
                <span>{isSignUp ? t.submitSignUp : t.submitSignIn}</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
              </button>
            </form>

            {/* TOGGLE ENTRE LOGIN Y SIGNUP */}
            <div className="mt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setErrorMsg(null);
                }}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer bg-transparent border-none"
              >
                {isSignUp ? t.haveAccount : t.noAccount}
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default AuthModal;
