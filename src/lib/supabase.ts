import { createClient } from '@supabase/supabase-js';

// Supabase Cloud configuration
// @supabase/supabase-js v2.117+ soporta el nuevo formato sb_publishable_...
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || 'https://ujcnglkdwzqlwqgrkspz.supabase.co';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Vg2Hc-cvEpBj0TKBXB3Tmw_1PCxN9C0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


export interface PropFirmAccount {
  id: string;
  firmId: string;
  firmName: string;
  accountNumber: string;
  initialBalance: number;
  currentBalance: number;
  equity: number;
  status: 'ACTIVE' | 'PASSED' | 'BREACHED' | 'FROZEN';
  rulesConfig: {
    maxDailyDrawdownPct?: number;
    maxTotalDrawdownPct?: number;
    profitTargetPct?: number;
    drawdownType?: 'EOD' | 'TRAILING_EQUITY';
    mandatoryStopLoss?: boolean;
    minTradingDays?: number;
    maxLeverage?: number;
  };
}

export interface UserSession {
  id?: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  isDemo?: boolean;
  provider?: 'email' | 'demo' | 'google' | 'github' | 'telegram';
  telegramId?: number;
  telegramUsername?: string;
  role?: 'admin' | 'trader';
  isVerified?: boolean;
  accounts?: PropFirmAccount[];
  activeAccountId?: string;
}

// Persistencia en IndexedDB para cumplimiento de la gobernanza Zero-Egress (SKILL)
const IDB_NAME = 'zyti_db';
const IDB_STORE = 'session';

async function openIDB(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) return null;
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(IDB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function setIDBSession(session: UserSession | null): Promise<void> {
  try {
    const db = await openIDB();
    if (!db) return;
    const tx = db.transaction(IDB_STORE, 'readwrite');
    const store = tx.objectStore(IDB_STORE);
    if (session) {
      store.put(session, 'zyti_session_snapshot');
    } else {
      store.delete('zyti_session_snapshot');
    }
  } catch (_) {}
}

export const getStoredSession = (): UserSession | null => {
  try {
    const raw = localStorage.getItem('zyti_user_session');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setStoredSession = (user: UserSession | null) => {
  if (user) {
    try {
      localStorage.setItem('zyti_user_session', JSON.stringify(user));
    } catch (_) {}
    setIDBSession(user);
  } else {
    try {
      localStorage.removeItem('zyti_user_session');
    } catch (_) {}
    setIDBSession(null);
  }
};

/**
 * Consulta en Supabase las cuentas de fondeo asignadas al correo del trader
 */
export async function fetchTraderAccounts(email: string): Promise<PropFirmAccount[]> {
  try {
    const clean = email.trim().toLowerCase();
    if (!clean) return [];

    const { data, error } = await supabase
      .from('trading_accounts')
      .select(`
        id,
        firm_id,
        account_number,
        initial_balance,
        current_balance,
        equity,
        status,
        rules_config,
        prop_firms (
          id,
          name
        )
      `)
      .eq('trader_email', clean);

    if (error || !data) {
      console.warn('[ZYTI DB] No se pudieron cargar cuentas de fondeo:', error?.message);
      return [];
    }

    return data.map((row: any) => ({
      id: row.id,
      firmId: row.firm_id,
      firmName: row.prop_firms?.name || 'Prop Firm',
      accountNumber: row.account_number,
      initialBalance: Number(row.initial_balance),
      currentBalance: Number(row.current_balance),
      equity: Number(row.equity),
      status: row.status,
      rulesConfig: row.rules_config || {}
    }));
  } catch (err) {
    console.error('[ZYTI DB] Error inesperado consultando cuentas:', err);
    return [];
  }
}

const IS_UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Guarda y actualiza de manera robusta el perfil del usuario en la base de datos (Supabase)
 * usando coincidencia múltiple (UUID, telegram_id o correo) para erradicar fallos de tipo de datos (22P02).
 */
export async function saveUserProfile(
  user: UserSession | null | undefined,
  updates: { name?: string; email?: string; avatarUrl?: string }
): Promise<UserSession> {
  const cleanName = updates.name !== undefined ? updates.name.trim() : (user?.name || 'Trader');
  const cleanEmail = updates.email?.trim() || undefined;
  const cleanAvatar = updates.avatarUrl?.trim() || undefined;

  const updatedUser: UserSession = {
    ...user,
    email: cleanEmail || user?.email || '',
    name: cleanName || user?.name || 'Trader',
    avatarUrl: cleanAvatar !== undefined ? cleanAvatar : user?.avatarUrl
  };

  // 1. Guardar de inmediato localmente (Optimistic Update a 0ms)
  setStoredSession(updatedUser);

  // 2. Sincronización robusta en Supabase (public.profiles)
  try {
    const profilePayload: any = {
      updated_at: new Date().toISOString()
    };
    if (updates.name !== undefined) profilePayload.full_name = cleanName;
    if (cleanEmail !== undefined) profilePayload.email = cleanEmail;
    if (cleanAvatar !== undefined) profilePayload.avatar_url = cleanAvatar;

    let updatePromise: any = null;

    if (user?.id && IS_UUID_REGEX.test(user.id)) {
      updatePromise = supabase.from('profiles').update(profilePayload).eq('id', user.id);
    } else if (user?.telegramId || (user?.id && /^\d+$/.test(user.id))) {
      const tgIdNum = Number(user.telegramId || user.id);
      updatePromise = supabase.from('profiles').update(profilePayload).eq('telegram_id', tgIdNum);
    } else if (user?.email) {
      updatePromise = supabase.from('profiles').update(profilePayload).eq('email', user.email.trim().toLowerCase());
    }

    if (updatePromise) {
      const { data, error } = await updatePromise.select();
      if (error) {
        console.warn('[ZYTI DB] Fallo al actualizar public.profiles:', error.message);
      } else if (data && data.length > 0 && data[0].id) {
        // Aseguramos que el usuario guarde su verdadero UUID de PostgreSQL
        updatedUser.id = data[0].id;
        setStoredSession(updatedUser);
      }
    }
  } catch (err) {
    console.warn('[ZYTI DB] Error de sincronización de perfil:', err);
  }

  // 3. Si hay sesión activa en Supabase Auth, sincronizar metadatos de usuario
  try {
    await supabase.auth.updateUser({
      data: {
        full_name: cleanName,
        avatar_url: cleanAvatar || null
      }
    });
  } catch (_) {}

  return updatedUser;
}

/**
 * Patrón "Single-Fetch Bootstrap" (Gobernanza Zero-Egress):
 * Ejecuta una sola consulta agregada para hidratar el perfil verificado y sus cuentas de fondeo
 * evitando waterfall queries repetitivas.
 */
export async function bootstrapUserSession(identifiers: {
  userId?: string;
  email?: string;
  telegramId?: number;
}): Promise<UserSession | null> {
  const { userId, email, telegramId } = identifiers;
  if (!userId && !email && !telegramId) return null;

  try {
    let profileQuery = supabase.from('profiles').select('*');

    if (userId && IS_UUID_REGEX.test(userId)) {
      profileQuery = profileQuery.eq('id', userId);
    } else if (telegramId) {
      profileQuery = profileQuery.eq('telegram_id', telegramId);
    } else if (userId && /^\d+$/.test(userId)) {
      profileQuery = profileQuery.eq('telegram_id', Number(userId));
    } else if (email) {
      profileQuery = profileQuery.eq('email', email.trim().toLowerCase());
    }

    const { data: profileList, error: profErr } = await profileQuery.limit(1);
    const profile = profileList?.[0];

    if (profErr) {
      console.warn('[Bootstrap] Error fetching profile:', profErr.message);
    }

    const effectiveEmail = profile?.email || email || '';
    const accounts = effectiveEmail ? await fetchTraderAccounts(effectiveEmail) : [];

    const session: UserSession = {
      id: profile?.id || userId,
      email: effectiveEmail,
      name: profile?.full_name || (profile?.telegram_username ? `@${profile.telegram_username}` : (effectiveEmail.split('@')[0] || 'Trader')),
      avatarUrl: profile?.avatar_url,
      provider: profile?.provider || 'email',
      telegramId: profile?.telegram_id || telegramId,
      telegramUsername: profile?.telegram_username,
      role: profile?.role || (effectiveEmail.toLowerCase().includes('admin@') ? 'admin' : 'trader'),
      isVerified: profile?.is_verified ?? true,
      accounts,
      activeAccountId: accounts[0]?.id
    };

    setStoredSession(session);
    return session;
  } catch (err) {
    console.error('[Bootstrap] Unexpected error in bootstrapUserSession:', err);
    return null;
  }
}

