/**
-- ============================================================================
-- ZYTI TRADE / PROP FIRM CRM — TIPOS DE DATOS INSTITUCIONALES (ERP)
-- ============================================================================
*/

export type CrmModuleId = 
  | 'hub' 
  | 'risk_engine' 
  | 'apis' 
  | 'challenges' 
  | 'plans' 
  | 'exchanges' 
  | 'prop_firms' 
  | 'support' 
  | 'marketing';

export type ApiKeyType = 'prop_firm' | 'ai_agent' | 'webhook';

export type ApiScope = 
  | 'trade:read' 
  | 'trade:order_create' 
  | 'trade:order_cancel' 
  | 'accounts:provision' 
  | 'accounts:freeze' 
  | 'metrics:read'
  | 'webhooks:write';

export interface ApiCredentialEntity {
  id: string;
  name: string;
  key_type: ApiKeyType;
  api_key_public: string;
  key_hash: string;
  scopes: ApiScope[];
  ip_whitelist: string[];
  rate_limit_rpm: number;
  is_active: boolean;
  last_used_at?: string | null;
  expires_at?: string | null;
  created_at?: string;
  raw_secret_key?: string;
}

export interface RiskRuleConfigEntity {
  id: string;
  firm_id?: string | null;
  name: string;
  max_daily_loss_percent: number;
  max_total_drawdown_percent: number;
  max_trailing_drawdown_percent?: number | null;
  drawdown_type: 'EOD' | 'TRAILING_EQUITY';
  max_leverage: number;
  mandatory_stop_loss: boolean;
  weekend_holding_allowed: boolean;
  consistency_rule_percent: number;
  min_trading_days: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CrmKpiStats {
  totalAccounts: number;
  activeAccounts: number;
  breachedAccounts: number;
  fundedCapitalUsd: number;
  activeApiKeys: number;
  aiAgentsConnected: number;
  liveFloatingPnL: number;
  riskStatus: 'HEALTHY' | 'WARNING' | 'ALERT';
}

export type UserCrmRole = 'trader' | 'soporte' | 'admin' | 'marketing';
export type CrmStaffRole = 'admin' | 'soporte' | 'marketing';

export const CRM_ALLOWED_ROLES: CrmStaffRole[] = ['admin', 'soporte', 'marketing'];

export const ROLE_CARD_PERMISSIONS: Record<CrmStaffRole, CrmModuleId[]> = {
  admin: [
    'risk_engine',
    'apis',
    'challenges',
    'plans',
    'exchanges',
    'prop_firms',
    'support',
    'marketing'
  ],
  soporte: [
    'support',
    'risk_engine',
    'challenges'
  ],
  marketing: [
    'marketing',
    'exchanges',
    'prop_firms',
    'plans'
  ]
};

export interface TraderClientEntity {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  provider: 'telegram' | 'google' | 'email' | 'demo';
  telegramId?: number;
  telegramUsername?: string;
  role: UserCrmRole;
  isVerified: boolean;
  createdAt: string;
  
  // Cuenta Demo Oficial de ZYTI vinculada
  accountNumber: string;
  accountSize: number;       // $10,000, $25,000, $50,000, $100,000
  currentBalance: number;
  equity: number;
  floatingPnl: number;
  dailyDrawdownPct: number;
  totalDrawdownPct: number;
  status: 'ACTIVE' | 'WARNING' | 'BREACHED' | 'FROZEN';
  lastActivity: string;
}

export interface MonitoredPosition {
  id: string;
  accountNumber: string;
  traderEmail: string;
  traderName: string;
  accountSize: number;       // Tamaño de cuenta del trader
  symbol: string;
  side: 'LONG' | 'SHORT';
  sizeUnits: number;
  leverage: number;
  entryPrice: number;
  currentPrice: number;
  floatingPnl: number;
  dailyDrawdownPct: number;
  totalDrawdownPct: number;
  ruleHealth: 'HEALTHY' | 'WARNING' | 'BREACHED';
  breachReason?: string;
  openedAt: string;
}

export interface ExchangeAffiliateItem {
  id: string;
  name: string;
  logo: string;
  affiliateUrl: string;
  commissionRebatePct: number;
  isActive: boolean;
  status: 'ONLINE' | 'MAINTENANCE';
}

export interface PropFirmAffiliateItem {
  id: string;
  name: string;
  logo: string;
  affiliateUrl: string;
  discountCode: string;
  payoutSplitPct: number;
  isActive: boolean;
}
