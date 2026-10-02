-- ============================================================================
-- MIGRATION: ADD HIGH-PERFORMANCE DATABASE INDEXES FOR ZERO-EGRESS & INSTANT QUERIES
-- ============================================================================
-- Aligned with:
-- 1. zyti-trade-performance-asset-caching-and-zero-egress-governance
-- 2. zyti-prop-firm-api-and-risk-gateway
-- Eradicates full table scans on profiles, trading_accounts, risk_rule_configs,
-- api_credentials, and telegram_auth_sessions as database scales.

-- Habilitar extensión pg_trgm para acelerar búsquedas de texto LIKE / ILIKE
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 1. ÍNDICES DE ALTO RENDIMIENTO EN public.profiles
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_telegram_id ON public.profiles(telegram_id);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at_desc ON public.profiles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_email_lower ON public.profiles(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_profiles_full_name ON public.profiles(full_name);
CREATE INDEX IF NOT EXISTS idx_profiles_name_trgm ON public.profiles USING gin (full_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_profiles_email_trgm ON public.profiles USING gin (email gin_trgm_ops);

-- 2. ÍNDICES DE ALTO RENDIMIENTO EN public.trading_accounts
CREATE INDEX IF NOT EXISTS idx_trading_accounts_trader_email ON public.trading_accounts(trader_email);
CREATE INDEX IF NOT EXISTS idx_trading_accounts_email_lower ON public.trading_accounts(LOWER(trader_email));
CREATE INDEX IF NOT EXISTS idx_trading_accounts_status ON public.trading_accounts(status);
CREATE INDEX IF NOT EXISTS idx_trading_accounts_firm_id ON public.trading_accounts(firm_id);
CREATE INDEX IF NOT EXISTS idx_trading_accounts_access_token ON public.trading_accounts(access_token);
CREATE INDEX IF NOT EXISTS idx_trading_accounts_created_at_desc ON public.trading_accounts(created_at DESC);

-- 3. ÍNDICES EN public.telegram_auth_sessions
CREATE INDEX IF NOT EXISTS idx_telegram_auth_sessions_code ON public.telegram_auth_sessions(code);
CREATE INDEX IF NOT EXISTS idx_telegram_auth_sessions_tg_id ON public.telegram_auth_sessions(telegram_id);
CREATE INDEX IF NOT EXISTS idx_telegram_auth_sessions_created ON public.telegram_auth_sessions(created_at);

-- 4. ÍNDICES EN public.account_trades (si existe)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'account_trades') THEN
    CREATE INDEX IF NOT EXISTS idx_account_trades_account_status ON public.account_trades(account_id, status);
    CREATE INDEX IF NOT EXISTS idx_account_trades_opened_at_desc ON public.account_trades(opened_at DESC);
  END IF;
END $$;

-- 5. ÍNDICES EN public.equity_snapshots (si existe)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'equity_snapshots') THEN
    CREATE INDEX IF NOT EXISTS idx_equity_snapshots_account ON public.equity_snapshots(account_id);
    CREATE INDEX IF NOT EXISTS idx_equity_snapshots_recorded ON public.equity_snapshots(recorded_at DESC);
  END IF;
END $$;

-- 6. ÍNDICES EN public.risk_rule_configs (si existe)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'risk_rule_configs') THEN
    CREATE INDEX IF NOT EXISTS idx_risk_rule_configs_firm_active ON public.risk_rule_configs(firm_id, is_active);
    CREATE INDEX IF NOT EXISTS idx_risk_rule_configs_created ON public.risk_rule_configs(created_at DESC);
  END IF;
END $$;

-- 7. ÍNDICES EN public.api_credentials (si existe)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'api_credentials') THEN
    CREATE INDEX IF NOT EXISTS idx_api_credentials_key_active ON public.api_credentials(api_key_public, is_active);
    CREATE INDEX IF NOT EXISTS idx_api_credentials_type ON public.api_credentials(key_type);
    CREATE INDEX IF NOT EXISTS idx_api_credentials_created ON public.api_credentials(created_at DESC);
  END IF;
END $$;
