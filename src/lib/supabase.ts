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
  telegramUsername?: string;
  role?: 'admin' | 'trader';
  accounts?: PropFirmAccount[];
  activeAccountId?: string;
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
    localStorage.setItem('zyti_user_session', JSON.stringify(user));
  } else {
    localStorage.removeItem('zyti_user_session');
  }
};

/**
 * Consulta en Supabase las cuentas de fondeo asignadas al correo del trader
 */
export async function fetchTraderAccounts(email: string): Promise<PropFirmAccount[]> {
  try {
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
      .eq('trader_email', email.trim().toLowerCase());

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
