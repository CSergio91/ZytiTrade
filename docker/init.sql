-- ============================================================================
-- ZYTI TRADE — ESQUEMA RELACIONAL INSTITUCIONAL (SUPABASE / POSTGRESQL 16)
-- Compatible con Multi-Tenant Prop Firms, Risk Engine y Trading Terminal
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Empresas de Fondeo (Prop Firms clientes de ZYTI)
CREATE TABLE IF NOT EXISTS prop_firms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  api_key_hash VARCHAR(255) NOT NULL UNIQUE,
  webhook_url TEXT,
  webhook_secret VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Cuentas de Trading de los Traders
CREATE TABLE IF NOT EXISTS trading_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id UUID NOT NULL REFERENCES prop_firms(id) ON DELETE CASCADE,
  account_number VARCHAR(50) NOT NULL UNIQUE,
  trader_email VARCHAR(150) NOT NULL,
  initial_balance NUMERIC(15, 2) NOT NULL,
  current_balance NUMERIC(15, 2) NOT NULL,
  equity NUMERIC(15, 2) NOT NULL,
  peak_equity NUMERIC(15, 2) NOT NULL,
  daily_start_equity NUMERIC(15, 2) NOT NULL,
  daily_start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  breach_reason TEXT,
  trading_days_count INT DEFAULT 0,
  last_trade_date DATE,
  rules_config JSONB NOT NULL,
  access_token VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trading_accounts_token ON trading_accounts(access_token);
CREATE INDEX IF NOT EXISTS idx_trading_accounts_firm ON trading_accounts(firm_id);
CREATE INDEX IF NOT EXISTS idx_trading_accounts_status ON trading_accounts(status);

-- 3. Historial de Operaciones
CREATE TABLE IF NOT EXISTS account_trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES trading_accounts(id) ON DELETE CASCADE,
  exchange VARCHAR(30) NOT NULL,
  symbol VARCHAR(30) NOT NULL,
  side VARCHAR(10) NOT NULL,
  size NUMERIC(15, 4) NOT NULL,
  leverage INT NOT NULL DEFAULT 1,
  entry_price NUMERIC(15, 2) NOT NULL,
  exit_price NUMERIC(15, 2),
  sl_price NUMERIC(15, 2),
  tp_price NUMERIC(15, 2),
  realized_pnl NUMERIC(15, 2),
  commission NUMERIC(15, 2) DEFAULT 0.00,
  status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
  close_reason VARCHAR(30),
  opened_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_account_trades_account ON account_trades(account_id);
CREATE INDEX IF NOT EXISTS idx_account_trades_status ON account_trades(status);

-- 4. Snapshots de Equidad para Auditoría y Gráfico de Rendimiento
CREATE TABLE IF NOT EXISTS equity_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES trading_accounts(id) ON DELETE CASCADE,
  equity NUMERIC(15, 2) NOT NULL,
  balance NUMERIC(15, 2) NOT NULL,
  drawdown_daily_pct NUMERIC(6, 2) NOT NULL,
  drawdown_total_pct NUMERIC(6, 2) NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_equity_snapshots_account ON equity_snapshots(account_id, recorded_at);
