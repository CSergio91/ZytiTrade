import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Zap, CheckCircle2, AlertCircle, Shield, Sparkles, Smartphone, ArrowLeft, Mail, Lock, ArrowRight } from 'lucide-react';
import { Language } from '../i18n/translations';
import { supabase, setStoredSession, UserSession, fetchTraderAccounts, bootstrapUserSession, saveUserProfile } from '../lib/supabase';
import { convertImageUrlToWebP } from '../utils/imageOptimizer';
import { LottieAnimation } from './LottieAnimation';
import loginAnimationData from '../assets/animations/login.json';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: Language;
  onLoginSuccess?: (user: UserSession) => void;
}

const fetchTelegramAvatarUrl = async (token: string, userId: number): Promise<string | undefined> => {
  if (!token || !userId) return undefined;
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/getUserProfilePhotos?user_id=${userId}&limit=1`);
    if (!res.ok) return undefined;
    const data = await res.json();
    if (data.ok && data.result?.total_count > 0) {
      const photos = data.result.photos?.[0];
      if (photos && photos.length > 0) {
        const bestPhoto = photos[photos.length - 1];
        const fileRes = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${bestPhoto.file_id}`);
        if (!fileRes.ok) return undefined;
        const fileData = await fileRes.json();
        if (fileData.ok && fileData.result?.file_path) {
          return `https://api.telegram.org/file/bot${token}/${fileData.result.file_path}`;
        }
      }
    }
  } catch (e) {
    console.warn('[Telegram photo fetch] failed:', e);
  }
  return undefined;
};

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentLang,
  onLoginSuccess
}) => {
  const isEs = currentLang === 'es';
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [telegramWaiting, setTelegramWaiting] = useState(false);
  const [awaitingOnboarding, setAwaitingOnboarding] = useState(false);
  const [telegramAuthCode, setTelegramAuthCode] = useState<string | null>(null);
  const [showPhoneWidget, setShowPhoneWidget] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const phoneWidgetRef = useRef<HTMLDivElement>(null);
  const botName = (import.meta as any).env.VITE_TELEGRAM_BOT_NAME || 'ZytiTarde_bot';
  const botToken = (import.meta as any).env.VITE_TELEGRAM_BOT_TOKEN || '';
  const telegramPopupRef = useRef<Window | null>(null);
  const detectedTelegramIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setMounted(true), 20);
      return () => clearTimeout(timer);
    } else {
      setMounted(false);
      setTelegramWaiting(false);
      setAwaitingOnboarding(false);
      setShowPhoneWidget(false);
    }
  }, [isOpen]);

  const handleTelegramAuthSuccess = useCallback(async (tgUser: {
    id: number; first_name: string; last_name?: string;
    username?: string; photo_url?: string; auth_date: number; hash: string;
    email?: string; userId?: string;
  }) => {
    setLoading(true); setErrorMsg(null);
    try {
      let registeredEmail = tgUser.email || '';
      let supaUserId = tgUser.userId || String(tgUser.id);
      let existingAvatar = tgUser.photo_url;
      let existingName = [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ') || (tgUser.username ? `@${tgUser.username}` : `Trader #${tgUser.id}`);

      // 1. Consultar perfil existente para preservar nombre personalizado o avatar ya guardado
      const { data: profList } = await supabase
        .from('profiles')
        .select('id, email, full_name, avatar_url')
        .or(`telegram_id.eq.${tgUser.id}${registeredEmail ? `,email.eq.${registeredEmail}` : ''}`)
        .order('updated_at', { ascending: false });

      const prof = profList?.find((p) => p.email && p.email.includes('@')) || profList?.[0];
      if (prof) {
        if (prof.email) registeredEmail = prof.email;
        if (prof.id) supaUserId = prof.id;
        if (prof.full_name) existingName = prof.full_name;
        if (prof.avatar_url) existingAvatar = prof.avatar_url;
      }

      // Si no hay foto registrada ni en tgUser ni en el perfil, intentar descargar del bot
      if (!existingAvatar && botToken) {
        const rawTgAvatar = await fetchTelegramAvatarUrl(botToken, tgUser.id);
        if (rawTgAvatar) {
          existingAvatar = await convertImageUrlToWebP(rawTgAvatar);
        }
      }

      if (!registeredEmail) {
        detectedTelegramIdRef.current = tgUser.id;
        setTelegramAuthCode('phone_' + tgUser.id);
        setAwaitingOnboarding(true);
        setTelegramWaiting(true);
        setShowPhoneWidget(false);
        setErrorMsg(
          isEs
            ? '⚠️ Cuenta verificada en Telegram. Por favor completa tu correo institucional y acepta los Términos para activar tu cuenta.'
            : '⚠️ Telegram verified. Please complete your email and accept Terms to activate your account.'
        );
        return;
      }

      const fullName = existingName;
      const propAccounts = await fetchTraderAccounts(registeredEmail || `${tgUser.id}@telegram.org`);
      const userSession: UserSession = {
        id: supaUserId, 
        email: registeredEmail,
        name: fullName,
        avatarUrl: existingAvatar, 
        provider: 'telegram', 
        telegramId: tgUser.id,
        telegramUsername: tgUser.username,
        role: 'trader', 
        accounts: propAccounts,
        isVerified: true,
        activeAccountId: propAccounts.length > 0 ? propAccounts[0].id : undefined
      };

      // Si obtuvimos un avatar nuevo de Telegram que no estaba en profiles, guardarlo de inmediato
      if (existingAvatar && !prof?.avatar_url) {
        saveUserProfile(userSession, { avatarUrl: existingAvatar, name: fullName }).catch(() => {});
      }

      setStoredSession(userSession);
      setSuccessMsg(isEs ? `¡Bienvenido, ${fullName}!` : `Welcome, ${fullName}!`);
      if (onLoginSuccess) onLoginSuccess(userSession);
      setTimeout(onClose, 500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al autenticar con Telegram');
    } finally { setLoading(false); }
  }, [isEs, onLoginSuccess, onClose, botToken]);

  const openCenteredPopup = (url: string, title: string, w = 550, h = 650) => {
    const left = Math.max(0, (window.screen.width - w) / 2);
    const top = Math.max(0, (window.screen.height - h) / 2);
    const popup = window.open(url, title, `width=${w},height=${h},top=${top},left=${left},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`);
    if (popup) popup.focus();
    return popup;
  };

  const closeTelegramPopup = () => {
    if (telegramPopupRef.current && !telegramPopupRef.current.closed) {
      try {
        telegramPopupRef.current.close();
      } catch (_) {}
      telegramPopupRef.current = null;
    }
  };

  const sendTelegramWelcomeMessage = async (chatId: number, from: any) => {
    if (!botToken) return;
    const fullName = [from.first_name, from.last_name].filter(Boolean).join(' ') || from.username || 'Trader';
    const appUrl = (import.meta as any).env.VITE_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://zytitrade-tradingplatform.vercel.app');

    const text = isEs
      ? `🎉 <b>¡Bienvenido de vuelta a ZYTI Trade, ${fullName}!</b>\n\nTu sesión ha sido verificada y activada con éxito. Ya puedes abrir la plataforma desde el botón de abajo:`
      : `🎉 <b>Welcome back to ZYTI Trade, ${fullName}!</b>\n\nYour account has been verified. You can now open the platform from the button below:`;

    const btnText = isEs ? '🚀 Abrir Terminal ZYTI Trade' : '🚀 Open ZYTI Trade Terminal';

    try {
      await fetch(`https://api.telegram.org/bot${botToken}/setChatMenuButton`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          menu_button: {
            type: 'web_app',
            text: '🚀 Abrir App',
            web_app: { url: appUrl }
          }
        })
      });

      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [[{ text: btnText, web_app: { url: appUrl } }]]
          }
        })
      });
    } catch (e) {
      console.warn('[Telegram sendWelcome] failed:', e);
    }
  };

  const hasSentMiniAppRef = useRef<Record<string, boolean>>({});
  const onboardingMessagesRef = useRef<Record<string, { chatId: number; messageId: number }>>({});

  const sendTelegramOnboardingMiniApp = async (chatId: number, from: any, code: string) => {
    if (!botToken) return;
    const key = `${chatId}_${code}`;
    if (hasSentMiniAppRef.current[key]) return;
    hasSentMiniAppRef.current[key] = true;

    const fullName = [from.first_name, from.last_name].filter(Boolean).join(' ') || from.username || 'Trader';
    const appUrl = (import.meta as any).env.VITE_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://zytitrade-tradingplatform.vercel.app');
    const onboardingUrl = `${appUrl}/tg-onboarding?code=${code}&tg_id=${from.id}&username=${from.username || ''}&name=${encodeURIComponent(fullName)}`;

    const text = isEs
      ? `👋 <b>¡Hola, ${fullName}! Bienvenido a ZYTI Trade.</b>\n\nPara activar tu cuenta de trading por primera vez, pulsa el botón de abajo para completar tu registro:`
      : `👋 <b>Hello, ${fullName}! Welcome to ZYTI Trade.</b>\n\nTo activate your trading account, tap the button below to complete registration:`;

    const btnText = isEs ? '📝 Completar Registro ZYTI (Mini App)' : '📝 Complete ZYTI Registration (Mini App)';

    try {
      const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [[{ text: btnText, web_app: { url: onboardingUrl } }]]
          }
        })
      });

      const data = await res.json();
      if (data?.ok && data.result?.message_id) {
        onboardingMessagesRef.current[code] = { chatId, messageId: data.result.message_id };
        await supabase
          .from('telegram_auth_sessions')
          .upsert({
            code,
            telegram_id: chatId,
            message_id: data.result.message_id
          });
      }
    } catch (e) {
      console.warn('[Telegram sendOnboardingMiniApp] failed:', e);
    }
  };

  const handleTelegramDeepLinkStart = () => {
    const code = Math.random().toString(36).substring(2, 9);
    setTelegramAuthCode(code);
    setTelegramWaiting(true);
    setAwaitingOnboarding(false);
    detectedTelegramIdRef.current = null;
    setErrorMsg(null);
    const deepLinkUrl = `https://t.me/${botName}?start=login_${code}`;
    telegramPopupRef.current = openCenteredPopup(deepLinkUrl, 'TelegramAuthPopup', 560, 680);
  };

  useEffect(() => {
    if (!telegramWaiting || !telegramAuthCode) return;

    let active = true;
    let timer: any = null;

    const pollUpdates = async () => {
      try {
        // 1. Consultar sesión por código (usando limit(1) para evitar fallos de múltiples filas)
        const { data: sessionList } = await supabase
          .from('telegram_auth_sessions')
          .select('*')
          .eq('code', telegramAuthCode)
          .order('created_at', { ascending: false })
          .limit(1);

        const sessionData = sessionList?.[0];

        if (sessionData && sessionData.user_id && sessionData.email) {
          active = false;
          setTelegramWaiting(false);
          setAwaitingOnboarding(false);
          closeTelegramPopup();

          const appUrl = (import.meta as any).env.VITE_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://zytitrade-tradingplatform.vercel.app');
          const targetChatId = sessionData.telegram_id || onboardingMessagesRef.current[telegramAuthCode]?.chatId;
          const targetMsgId = sessionData.message_id || onboardingMessagesRef.current[telegramAuthCode]?.messageId;

          if (botToken && targetChatId) {
            fetch(`https://api.telegram.org/bot${botToken}/setChatMenuButton`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: targetChatId,
                menu_button: {
                  type: 'web_app',
                  text: '🚀 Abrir App',
                  web_app: { url: appUrl }
                }
              })
            }).catch(() => {});

            if (targetMsgId) {
              fetch(`https://api.telegram.org/bot${botToken}/editMessageText`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  chat_id: targetChatId,
                  message_id: targetMsgId,
                  text: `✅ <b>¡Registro completado con éxito, ${sessionData.full_name || 'Trader'}!</b>\n\nTu cuenta institucional en ZYTI Trade ya está activa y verificada.`,
                  parse_mode: 'HTML',
                  reply_markup: {
                    inline_keyboard: [[{ text: '🚀 Abrir Terminal ZYTI Trade', web_app: { url: appUrl } }]]
                  }
                })
              }).catch(() => {});
            }
          }

          setTimeout(() => {
            supabase.from('telegram_auth_sessions').delete().eq('code', telegramAuthCode).then();
          }, 3500);

          let avatarUrl = sessionData.avatar_url;
          if (!avatarUrl && sessionData.telegram_id && botToken) {
            const rawAvatar = await fetchTelegramAvatarUrl(botToken, sessionData.telegram_id);
            if (rawAvatar) avatarUrl = await convertImageUrlToWebP(rawAvatar);
          }
          const propAccounts = await fetchTraderAccounts(sessionData.email || '');
          const userSession: UserSession = {
            id: sessionData.user_id,
            email: sessionData.email || '',
            name: sessionData.full_name || 'Trader',
            avatarUrl,
            provider: 'telegram',
            telegramId: sessionData.telegram_id,
            telegramUsername: sessionData.telegram_username,
            role: 'trader',
            accounts: propAccounts,
            isVerified: true,
            activeAccountId: propAccounts.length > 0 ? propAccounts[0].id : undefined
          };

          if (avatarUrl) {
            saveUserProfile(userSession, { avatarUrl }).catch(() => {});
          }

          setStoredSession(userSession);
          setSuccessMsg(isEs ? `¡Bienvenido a ZYTI Trade, ${userSession.name}!` : `Welcome to ZYTI Trade, ${userSession.name}!`);
          if (onLoginSuccess) onLoginSuccess(userSession);
          setTimeout(onClose, 500);
          return;
        }

        // 2. Si ya detectamos el telegram_id del usuario, verificar directamente en public.profiles
        if (detectedTelegramIdRef.current) {
          const { data: profileList } = await supabase
            .from('profiles')
            .select('id, email, full_name, avatar_url, telegram_username')
            .eq('telegram_id', detectedTelegramIdRef.current)
            .order('updated_at', { ascending: false });

          const syncedProfile = profileList?.find((p) => p.email && p.email.includes('@'));
          if (syncedProfile && syncedProfile.email) {
            active = false;
            setTelegramWaiting(false);
            setAwaitingOnboarding(false);
            closeTelegramPopup();
            handleTelegramAuthSuccess({
              id: detectedTelegramIdRef.current,
              first_name: syncedProfile.full_name || 'Trader',
              username: syncedProfile.telegram_username,
              photo_url: syncedProfile.avatar_url,
              auth_date: Date.now(),
              hash: 'profile_sync_' + telegramAuthCode,
              email: syncedProfile.email,
              userId: syncedProfile.id
            });
            return;
          }
        }

        // 3. Consultar actualizaciones del bot de Telegram
        if (botToken) {
          const res = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates?offset=-10&limit=10`);
          if (res.ok) {
            const data = await res.json();
            if (active && data.ok && Array.isArray(data.result)) {
              const match = data.result.find((u: any) => {
                const text = u.message?.text || '';
                return text.includes(`login_${telegramAuthCode}`) || text.includes(telegramAuthCode);
              });

              if (match && match.message?.from) {
                const from = match.message.from;
                const chatId = match.message.chat.id;
                detectedTelegramIdRef.current = from.id;

                const { data: profileList } = await supabase
                  .from('profiles')
                  .select('id, email, full_name, avatar_url, telegram_username')
                  .eq('telegram_id', from.id)
                  .order('updated_at', { ascending: false });

                const existingProfile = profileList?.find((p) => p.email && p.email.includes('@'));

                if (existingProfile && existingProfile.email) {
                  active = false;
                  setTelegramWaiting(false);
                  setAwaitingOnboarding(false);
                  closeTelegramPopup();
                  sendTelegramWelcomeMessage(chatId, from);
                  let photoUrl = existingProfile.avatar_url;
                  if (!photoUrl && botToken) {
                    const rawTg = await fetchTelegramAvatarUrl(botToken, from.id);
                    if (rawTg) photoUrl = await convertImageUrlToWebP(rawTg);
                  }
                  handleTelegramAuthSuccess({
                    id: from.id,
                    first_name: from.first_name,
                    last_name: from.last_name,
                    username: from.username,
                    photo_url: photoUrl,
                    auth_date: match.message.date,
                    hash: 'deep_link_' + telegramAuthCode,
                    email: existingProfile.email,
                    userId: existingProfile.id
                  });
                  return;
                } else {
                  setAwaitingOnboarding(true);
                  sendTelegramOnboardingMiniApp(chatId, from, telegramAuthCode);
                }
              }
            }
          }
        }
      } catch (e) {
        console.warn('[Telegram Poll] error:', e);
      }

      if (active) {
        timer = setTimeout(pollUpdates, 1500);
      }
    };

    pollUpdates();

    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [telegramWaiting, telegramAuthCode, botToken, isEs, handleTelegramAuthSuccess, onClose, onLoginSuccess]);

  const handleCheckLatestTelegram = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      // 1. Primero comprobar si ya se guardó la sesión con email en telegram_auth_sessions
      if (telegramAuthCode) {
        const { data: sessionList } = await supabase
          .from('telegram_auth_sessions')
          .select('*')
          .eq('code', telegramAuthCode)
          .order('created_at', { ascending: false })
          .limit(1);

        const sessionData = sessionList?.[0];
        if (sessionData && sessionData.user_id && sessionData.email) {
          setTelegramWaiting(false);
          setAwaitingOnboarding(false);
          closeTelegramPopup();
          let avatarUrl = sessionData.avatar_url;
          if (!avatarUrl && sessionData.telegram_id && botToken) {
            const rawAvatar = await fetchTelegramAvatarUrl(botToken, sessionData.telegram_id);
            if (rawAvatar) avatarUrl = await convertImageUrlToWebP(rawAvatar);
          }
          const propAccounts = await fetchTraderAccounts(sessionData.email);
          const userSession: UserSession = {
            id: sessionData.user_id,
            email: sessionData.email,
            name: sessionData.full_name || 'Trader',
            avatarUrl,
            provider: 'telegram',
            telegramId: sessionData.telegram_id,
            telegramUsername: sessionData.telegram_username,
            role: 'trader',
            accounts: propAccounts,
            isVerified: true,
            activeAccountId: propAccounts.length > 0 ? propAccounts[0].id : undefined
          };
          if (avatarUrl) {
            saveUserProfile(userSession, { avatarUrl }).catch(() => {});
          }
          setStoredSession(userSession);
          setSuccessMsg(isEs ? `¡Bienvenido, ${userSession.name}!` : `Welcome, ${userSession.name}!`);
          if (onLoginSuccess) onLoginSuccess(userSession);
          setTimeout(onClose, 500);
          return;
        }
      }

      // 2. Si ya tenemos el telegram_id detectado, verificar directamente en public.profiles
      if (detectedTelegramIdRef.current) {
        const { data: profileList } = await supabase
          .from('profiles')
          .select('id, email, full_name, avatar_url, telegram_username')
          .eq('telegram_id', detectedTelegramIdRef.current)
          .order('updated_at', { ascending: false });

        const existingProfile = profileList?.find((p) => p.email && p.email.includes('@'));
        if (existingProfile && existingProfile.email) {
          setTelegramWaiting(false);
          setAwaitingOnboarding(false);
          closeTelegramPopup();
          let photoUrl = existingProfile.avatar_url;
          if (!photoUrl && botToken) {
            const rawTg = await fetchTelegramAvatarUrl(botToken, detectedTelegramIdRef.current);
            if (rawTg) photoUrl = await convertImageUrlToWebP(rawTg);
          }
          await handleTelegramAuthSuccess({
            id: detectedTelegramIdRef.current,
            first_name: existingProfile.full_name || 'Trader',
            username: existingProfile.telegram_username,
            photo_url: photoUrl,
            auth_date: Date.now(),
            hash: 'manual_verify_' + Date.now(),
            email: existingProfile.email,
            userId: existingProfile.id
          });
          return;
        }
      }

      // 3. Comprobar actualizaciones recientes del bot de Telegram
      const res = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates?offset=-10&limit=10`);
      const data = await res.json();
      if (data.ok && Array.isArray(data.result) && data.result.length > 0) {
        const lastMsg = [...data.result].reverse().find((u: any) => u.message?.from && !u.message.from.is_bot);
        if (lastMsg && lastMsg.message?.from) {
          const from = lastMsg.message.from;
          const chatId = lastMsg.message.chat.id;
          detectedTelegramIdRef.current = from.id;

          const { data: profileList } = await supabase
            .from('profiles')
            .select('id, email, full_name, avatar_url, telegram_username')
            .eq('telegram_id', from.id)
            .order('updated_at', { ascending: false });

          const existingProfile = profileList?.find((p) => p.email && p.email.includes('@'));

          if (existingProfile && existingProfile.email) {
            setTelegramWaiting(false);
            setAwaitingOnboarding(false);
            closeTelegramPopup();
            sendTelegramWelcomeMessage(chatId, from);
            let photoUrl = existingProfile.avatar_url;
            if (!photoUrl && botToken) {
              const rawTg = await fetchTelegramAvatarUrl(botToken, from.id);
              if (rawTg) photoUrl = await convertImageUrlToWebP(rawTg);
            }
            await handleTelegramAuthSuccess({
              id: from.id,
              first_name: from.first_name,
              last_name: from.last_name,
              username: from.username,
              photo_url: photoUrl,
              auth_date: lastMsg.message.date,
              hash: 'manual_verify_' + Date.now(),
              email: existingProfile.email,
              userId: existingProfile.id
            });
            return;
          } else {
            // Usuario NUEVO: Aún no ha completado el formulario de la Mini App ni aceptado términos
            setAwaitingOnboarding(true);
            sendTelegramOnboardingMiniApp(chatId, from, telegramAuthCode || 'login');
            setErrorMsg(
              isEs
                ? '⚠️ Detectamos tu /start en Telegram. Para nuevos usuarios es obligatorio pulsar «Completar Registro» en el chat del bot, registrar tu correo y aceptar los Términos y Condiciones.'
                : '⚠️ We detected your /start in Telegram. New users must tap «Complete Registration» in the bot chat, register an email, and accept Terms and Conditions.'
            );
            return;
          }
        }
      }
      setErrorMsg(isEs ? 'No se detectó ningún mensaje en el bot. Pulsa Iniciar en @ZytiTarde_bot.' : 'No message detected. Please press Start in @ZytiTarde_bot.');
    } catch (e: any) {
      setErrorMsg(e.message || 'Error al conectar con Telegram');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(err.message || (isEs ? 'Error al iniciar sesión con Google' : 'Error signing in with Google'));
      setLoading(false);
    }
  };

  // Carga e inyección dinámica del widget de Telegram (para inicio con número telefónico)
  useEffect(() => {
    if (!showPhoneWidget || !phoneWidgetRef.current) return;
    const container = phoneWidgetRef.current;
    container.innerHTML = '';

    (window as any).onTelegramWidgetAuth = (user: any) => {
      handleTelegramAuthSuccess(user);
    };

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', botName);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-radius', '12');
    script.setAttribute('data-request-access', 'write');
    script.setAttribute('data-userpic', 'true');
    script.setAttribute('data-onauth', 'onTelegramWidgetAuth(user)');
    script.async = true;
    container.appendChild(script);
  }, [showPhoneWidget, botName, handleTelegramAuthSuccess]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setErrorMsg(isEs ? 'Por favor completa todos los campos' : 'Please fill all fields');
      return;
    }

    if (isSignUp && cleanPassword !== confirmPassword.trim()) {
      setErrorMsg(isEs ? 'Las contraseñas no coinciden' : 'Passwords do not match');
      return;
    }

    if (cleanPassword.length < 6) {
      setErrorMsg(isEs ? 'La contraseña debe tener al menos 6 caracteres' : 'Password must have at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: cleanPassword
        });
        if (error) throw error;
        if (data.user) {
          const propAccounts = await fetchTraderAccounts(data.user.email || cleanEmail);
          const userSession: UserSession = {
            id: data.user.id,
            email: data.user.email || cleanEmail,
            name: cleanEmail.split('@')[0],
            provider: 'email',
            role: cleanEmail.toLowerCase().includes('admin@') ? 'admin' : 'trader',
            accounts: propAccounts,
            activeAccountId: propAccounts.length > 0 ? propAccounts[0].id : undefined
          };
          setStoredSession(userSession);
          setSuccessMsg(isEs ? '¡Cuenta creada con éxito!' : 'Account created successfully!');
          if (onLoginSuccess) onLoginSuccess(userSession);
          setTimeout(onClose, 500);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPassword
        });
        if (error) throw error;
        if (data.user) {
          const bootstrapped = await bootstrapUserSession({ userId: data.user.id, email: data.user.email });
          const propAccounts = bootstrapped?.accounts || await fetchTraderAccounts(data.user.email || cleanEmail);
          const userSession: UserSession = bootstrapped || {
            id: data.user.id,
            email: data.user.email || cleanEmail,
            name: data.user.user_metadata?.full_name || cleanEmail.split('@')[0],
            avatarUrl: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture,
            provider: 'email',
            role: cleanEmail.toLowerCase().includes('admin@') ? 'admin' : 'trader',
            accounts: propAccounts,
            activeAccountId: propAccounts.length > 0 ? propAccounts[0].id : undefined
          };
          setStoredSession(userSession);
          setSuccessMsg(isEs ? '¡Inicio de sesión exitoso!' : 'Signed in successfully!');
          if (onLoginSuccess) onLoginSuccess(userSession);
          setTimeout(onClose, 500);
        }
      }
    } catch (err: any) {
      setErrorMsg(
        err.message?.includes('Failed to fetch')
          ? (isEs ? 'Error de red. Verifica tu conexión.' : 'Network error. Check your connection.')
          : (err.message || 'Error al autenticar')
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-6 bg-slate-950/30 backdrop-blur-xs md:backdrop-blur-sm transition-opacity duration-300 ease-out ${mounted ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
      onClick={onClose}
    >
      <div 
        className={`warm-card auth-modal-window rounded-t-[28px] md:rounded-3xl shadow-2xl relative border border-white/60 bg-[#fbf9f4]/85 backdrop-blur-2xl overflow-hidden no-scrollbar transform transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-full md:translate-y-12 opacity-0'}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          type="button" 
          onClick={onClose} 
          className="absolute top-3 right-3.5 z-30 p-1.5 sm:p-2 rounded-full text-slate-500 hover:text-slate-950 hover:bg-[#ede5d6] transition-colors cursor-pointer bg-white/70 backdrop-blur-md shadow-xs border border-white/60" 
          aria-label={isEs ? 'Cerrar modal' : 'Close modal'}
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <div className="auth-modal-grid">
          {/* PANEL IZQUIERDO TRASLÚCIDO */}
          <div className="auth-modal-left text-center relative">
            <div className="w-10 h-1 bg-[#d4c8b5] rounded-full mx-auto mb-1 shrink-0 block md:hidden" />
            <div className="w-full flex items-center justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 md:px-3.5 md:py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-white/70 shadow-xs">
                <img src="/logo-zyti.png" alt="ZYTI Trade Logo" className="w-5 h-5 sm:w-6 sm:h-6 object-contain" />
                <span className="font-black text-xs sm:text-sm tracking-tight text-slate-950">ZYTI <span className="font-light text-slate-500">Trade</span></span>
              </div>
            </div>
            
            <div className="hidden md:block w-full mt-2">
              <h3 className="text-lg md:text-xl font-black text-slate-950 tracking-tight">
                {isEs ? 'Inicia Sesión en ZYTI OS' : 'Sign in to ZYTI OS'}
              </h3>
              <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                {isEs ? 'Terminal institucional multi-exchange' : 'Multi-exchange institutional terminal'}
              </p>
            </div>

            <div className="flex-1 flex items-center justify-center w-full min-h-0 py-2">
              <LottieAnimation animationData={loginAnimationData} className="h-full w-full max-h-36 sm:max-h-40 md:max-h-44 object-contain drop-shadow-xs" />
            </div>

            <div className="w-full shrink-0 p-2.5 rounded-2xl bg-sky-500/10 border border-sky-300/60 text-center backdrop-blur-sm">
              <span className="text-[11px] font-black text-sky-950 flex items-center justify-center gap-1.5">
                <Zap className="w-3.5 h-3.5 fill-sky-500 text-sky-500" />
                {isEs ? 'Acceso Seguro y Cero Custodia' : 'Secure Zero-Custody Access'}
              </span>
              <span className="text-[9.5px] text-sky-900/90 font-medium block mt-0.5 leading-snug">
                {isEs ? 'Conéctate mediante Telegram, Google o credenciales institucionales.' : 'Connect via Telegram, Google, or institutional credentials.'}
              </span>
            </div>
          </div>

          {/* PANEL DERECHO TRASLÚCIDO */}
          <div className="auth-modal-right no-scrollbar flex flex-col justify-center gap-2.5">
            <div className="text-center md:text-left mb-0.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900/5 border border-slate-900/10 text-slate-800 text-[10px] font-mono font-bold mb-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>{isEs ? 'ACCESO INSTITUCIONAL' : 'INSTITUTIONAL ACCESS'}</span>
              </div>
              <h4 className="text-base sm:text-lg font-black text-slate-950 tracking-tight leading-snug">
                {isSignUp 
                  ? (isEs ? 'Crea tu cuenta institucional' : 'Create institutional account') 
                  : (isEs ? 'Conecta tu cuenta para operar' : 'Connect your account to trade')}
              </h4>
              <p className="text-[11px] text-slate-600 font-medium">
                {isSignUp 
                  ? (isEs ? 'Completa tus datos o usa accesos rápidos para ingresar.' : 'Complete your details or use fast social access.') 
                  : (isEs ? 'Inicia sesión con Telegram, Google o tu correo institucional.' : 'Sign in with Telegram, Google, or institutional email.')}
              </p>
            </div>

            {errorMsg && (
              <div className="p-2 rounded-xl bg-red-50/90 border border-red-200 text-red-700 text-xs font-medium flex items-start gap-2 leading-snug">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="p-2 rounded-xl bg-emerald-50/90 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* TELEGRAM WAITING STATE */}
            {telegramWaiting ? (
              awaitingOnboarding ? (
                /* PASO 2: EL BOT YA ENVIÓ LA MINI APP CON TÉRMINOS Y CORREO */
                <div className="w-full p-4 rounded-2xl bg-amber-500/10 border border-amber-300/80 text-center flex flex-col items-center gap-2.5 backdrop-blur-md">
                  <div className="w-11 h-11 rounded-full bg-amber-500 flex items-center justify-center text-white shadow-sm animate-pulse">
                    <Sparkles className="w-5 h-5 fill-white" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-amber-950 block">
                      {isEs ? '¡Paso 2: Completa tu Registro!' : 'Step 2: Complete Your Registration!'}
                    </span>
                    <span className="text-[10.5px] text-amber-900/90 block mt-1 leading-snug">
                      {isEs 
                        ? 'Abre tu Telegram y pulsa el botón «📝 Completar Registro ZYTI» para ingresar tu correo y aceptar los Términos y Condiciones.' 
                        : 'Open Telegram and tap the «📝 Complete ZYTI Registration» button to enter your email and accept Terms.'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2 w-full mt-1">
                    <button
                      type="button"
                      onClick={handleCheckLatestTelegram}
                      disabled={loading}
                      className="w-full py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                    >
                      <span>{isEs ? '🔄 Ya completé el registro en Telegram' : '🔄 I completed registration in Telegram'}</span>
                    </button>
                    <a
                      href={`https://t.me/${botName}?start=login_${telegramAuthCode}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-bold text-amber-700 hover:underline block text-center"
                    >
                      {isEs ? 'Abrir chat con el bot en Telegram' : 'Open bot chat in Telegram'}
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        setTelegramWaiting(false);
                        setAwaitingOnboarding(false);
                      }}
                      className="text-[10px] text-slate-500 hover:text-slate-800 transition-colors cursor-pointer pt-0.5"
                    >
                      {isEs ? '← Volver a opciones' : '← Back to options'}
                    </button>
                  </div>
                </div>
              ) : (
                /* PASO 1: ESPERANDO PULSAR /START */
                <div className="w-full p-4 rounded-2xl bg-sky-50/80 border border-sky-200/80 text-center flex flex-col items-center gap-2.5 backdrop-blur-md">
                  <div className="w-11 h-11 rounded-full bg-[#54a9eb] flex items-center justify-center text-white shadow-sm animate-pulse">
                    <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/></svg>
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-900 block">{isEs ? 'Paso 1: Inicia en Telegram' : 'Step 1: Start in Telegram'}</span>
                    <span className="text-[10.5px] text-slate-600 block mt-0.5 leading-snug">
                      {isEs ? 'Pulsa «INICIAR» o «START» en el chat con el bot.' : 'Press «START» in the bot chat.'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2 w-full mt-1">
                    <button
                      type="button"
                      onClick={handleCheckLatestTelegram}
                      disabled={loading}
                      className="w-full py-2 px-3 rounded-xl bg-[#229ED9] hover:bg-[#1b8bc2] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                    >
                      <span>{isEs ? '⚡ Ya envié /start (Verificar)' : '⚡ I sent /start (Verify)'}</span>
                    </button>
                    <a
                      href={`https://t.me/${botName}?start=login_${telegramAuthCode}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-bold text-sky-600 hover:underline block text-center"
                    >
                      {isEs ? '¿No se abrió Telegram? Clic aquí' : 'Didn\'t open Telegram? Click here'}
                    </a>
                    <button
                      type="button"
                      onClick={() => setTelegramWaiting(false)}
                      className="text-[10px] text-slate-500 hover:text-slate-800 transition-colors cursor-pointer pt-0.5"
                    >
                      {isEs ? '← Volver a opciones' : '← Back to options'}
                    </button>
                  </div>
                </div>
              )
            ) : showPhoneWidget ? (
              /* VISTA DE TELEGRAM CON NÚMERO TELEFÓNICO (WIDGET OFICIAL) */
              <div className="w-full p-4 rounded-2xl bg-white/95 border border-slate-200/90 text-center flex flex-col items-center gap-2.5 backdrop-blur-md shadow-xs animate-in fade-in duration-200">
                <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-teal-400 shadow-xs">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-black text-slate-900 block">
                    {isEs ? 'Acceso con Teléfono (Telegram Widget)' : 'Phone Login (Telegram Widget)'}
                  </span>
                  <span className="text-[10px] text-slate-600 block mt-0.5 leading-snug">
                    {isEs 
                      ? 'Pulsa el botón oficial de Telegram para ingresar tu número y confirmar la notificación en tu app:' 
                      : 'Click the official Telegram button to enter your phone number and confirm notification in app:'}
                  </span>
                </div>

                <div ref={phoneWidgetRef} className="w-full flex items-center justify-center min-h-[46px] my-1" />

                <button
                  type="button"
                  onClick={() => setShowPhoneWidget(false)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer pt-1"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>{isEs ? 'Volver a otros métodos' : 'Back to other methods'}</span>
                </button>
              </div>
            ) : (
              /* PANEL PRINCIPAL: ICONOS COMPACTOS + FORMULARIO */
              <div className="flex flex-col gap-2 pt-0.5">
                {/* 3 ICONOS PEQUEÑOS JUNTOS LADO A LADO */}
                <div className="grid grid-cols-3 gap-2">
                  {/* 1. TELEGRAM BOT (AZUL TELEGRAM #229ED9) */}
                  <button
                    type="button"
                    onClick={handleTelegramDeepLinkStart}
                    disabled={loading}
                    className="py-2 px-1.5 rounded-xl bg-[#229ED9] hover:bg-[#1b8bc2] text-white font-bold text-xs shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                    title={isEs ? 'Iniciar con Bot de Telegram' : 'Sign in with Telegram Bot'}
                  >
                    <svg className="w-3.5 h-3.5 fill-white shrink-0" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                    </svg>
                    <span className="truncate">{isEs ? 'Bot' : 'Bot'}</span>
                  </button>

                  {/* 2. TELEGRAM TELÉFONO WIDGET (DARK OBSIDIAN / TEAL) */}
                  <button
                    type="button"
                    onClick={() => { setShowPhoneWidget(true); setErrorMsg(null); }}
                    disabled={loading}
                    className="py-2 px-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 border border-slate-700/60"
                    title={isEs ? 'Iniciar con Teléfono (Telegram Widget)' : 'Sign in with Phone (Telegram Widget)'}
                  >
                    <Smartphone className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span className="truncate">{isEs ? 'Teléfono' : 'Phone'}</span>
                  </button>

                  {/* 3. GOOGLE (BLANCO INSTITUCIONAL) */}
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="py-2 px-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-xs shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                    title={isEs ? 'Continuar con Google' : 'Continue with Google'}
                  >
                    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span className="truncate">Google</span>
                  </button>
                </div>

                {/* SEPARADOR DIVISOR */}
                <div className="relative flex items-center justify-center my-0.5">
                  <div className="border-t border-slate-200/80 w-full" />
                  <span className="bg-[#fbf9f4] px-2 text-[9.5px] font-mono text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    {isEs ? 'o con correo y contraseña' : 'or with email & password'}
                  </span>
                  <div className="border-t border-slate-200/80 w-full" />
                </div>

                {/* FORMULARIO DE ACCESO Y CREACIÓN DE CUENTA */}
                <form onSubmit={handleEmailAuth} className="flex flex-col gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 mb-0.5">
                      {isEs ? 'Correo Electrónico' : 'Email Address'}
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="trader@zytitrade.com"
                        className="w-full pl-9 pr-3 py-1.5 sm:py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 mb-0.5">
                      {isEs ? 'Contraseña' : 'Password'}
                    </label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3 py-1.5 sm:py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-xs"
                      />
                    </div>
                  </div>

                  {isSignUp && (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-800 mb-0.5">
                        {isEs ? 'Confirmar Contraseña' : 'Confirm Password'}
                      </label>
                      <div className="relative">
                        <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-9 pr-3 py-1.5 sm:py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-xs"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-0.5 py-2 sm:py-2.5 px-4 rounded-xl bg-[#eab308] hover:bg-[#ca8a04] text-slate-950 font-black text-xs sm:text-sm shadow-xs transition-all transform hover:scale-[1.01] active:scale-99 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Zap className="w-3.5 h-3.5 stroke-[2.5] fill-slate-950" />
                    <span>
                      {loading 
                        ? (isEs ? 'Procesando...' : 'Processing...') 
                        : (isSignUp 
                            ? (isEs ? 'Crear Cuenta Institucional' : 'Create Account') 
                            : (isEs ? 'Entrar a la Terminal' : 'Sign In to Terminal')
                          )}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </form>

                {/* TOGGLE ENTRE LOGIN Y SIGNUP */}
                <div className="text-center pt-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setErrorMsg(null);
                    }}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer bg-transparent border-none"
                  >
                    {isSignUp 
                      ? (isEs ? '¿Ya tienes una cuenta? Inicia sesión' : 'Already have an account? Sign in') 
                      : (isEs ? '¿No tienes cuenta? Crea una aquí' : "Don't have an account? Sign up")}
                  </button>
                </div>
              </div>
            )}

            {/* BADGES DE CONFIANZA INSTITUCIONAL */}
            <div className="pt-1.5 flex items-center justify-center gap-3 text-[10px] text-slate-500 font-mono">
              <span className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-emerald-600" />
                {isEs ? 'Cero Custodia' : 'Zero Custody'}
              </span>
              <span>•</span>
              <span>TLS Directo Binance/Bybit</span>
              <span>•</span>
              <span>60 FPS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
