import pg from 'pg';

const client = new pg.Client({
  host: 'aws-0-eu-west-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.ujcnglkdwzqlwqgrkspz',
  password: 'Carlos910221Ca*',
  ssl: { rejectUnauthorized: false }
});

const sqlQueries = `
SET ROLE postgres;

-- 1. Habilitar extensión trigram para búsquedas de texto ultrarrápidas
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. ÍNDICES DE ALTO RENDIMIENTO EN public.profiles
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_telegram_id ON public.profiles(telegram_id);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at_desc ON public.profiles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_email_lower ON public.profiles(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_profiles_full_name ON public.profiles(full_name);
CREATE INDEX IF NOT EXISTS idx_profiles_name_trgm ON public.profiles USING gin (full_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_profiles_email_trgm ON public.profiles USING gin (email gin_trgm_ops);

-- 3. ÍNDICES DE ALTO RENDIMIENTO EN public.trading_accounts
CREATE INDEX IF NOT EXISTS idx_trading_accounts_trader_email ON public.trading_accounts(trader_email);
CREATE INDEX IF NOT EXISTS idx_trading_accounts_email_lower ON public.trading_accounts(LOWER(trader_email));
CREATE INDEX IF NOT EXISTS idx_trading_accounts_status ON public.trading_accounts(status);
CREATE INDEX IF NOT EXISTS idx_trading_accounts_firm_id ON public.trading_accounts(firm_id);
CREATE INDEX IF NOT EXISTS idx_trading_accounts_access_token ON public.trading_accounts(access_token);
CREATE INDEX IF NOT EXISTS idx_trading_accounts_created_at_desc ON public.trading_accounts(created_at DESC);

-- 4. ÍNDICES EN public.telegram_auth_sessions
CREATE INDEX IF NOT EXISTS idx_telegram_auth_sessions_code ON public.telegram_auth_sessions(code);
CREATE INDEX IF NOT EXISTS idx_telegram_auth_sessions_tg_id ON public.telegram_auth_sessions(telegram_id);
CREATE INDEX IF NOT EXISTS idx_telegram_auth_sessions_created ON public.telegram_auth_sessions(created_at);

-- 5. ÍNDICES EN public.account_trades
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'account_trades') THEN
    CREATE INDEX IF NOT EXISTS idx_account_trades_account_status ON public.account_trades(account_id, status);
    CREATE INDEX IF NOT EXISTS idx_account_trades_opened_at_desc ON public.account_trades(opened_at DESC);
  END IF;
END $$;

-- 6. ÍNDICES EN public.equity_snapshots
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'equity_snapshots') THEN
    CREATE INDEX IF NOT EXISTS idx_equity_snapshots_account ON public.equity_snapshots(account_id);
    CREATE INDEX IF NOT EXISTS idx_equity_snapshots_recorded ON public.equity_snapshots(recorded_at DESC);
  END IF;
END $$;

-- 7. ÍNDICES EN public.risk_rule_configs (si existe)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'risk_rule_configs') THEN
    CREATE INDEX IF NOT EXISTS idx_risk_rule_configs_firm_active ON public.risk_rule_configs(firm_id, is_active);
    CREATE INDEX IF NOT EXISTS idx_risk_rule_configs_created ON public.risk_rule_configs(created_at DESC);
  END IF;
END $$;

-- 8. ÍNDICES EN public.api_credentials (si existe)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'api_credentials') THEN
    CREATE INDEX IF NOT EXISTS idx_api_credentials_key_active ON public.api_credentials(api_key_public, is_active);
    CREATE INDEX IF NOT EXISTS idx_api_credentials_type ON public.api_credentials(key_type);
    CREATE INDEX IF NOT EXISTS idx_api_credentials_created ON public.api_credentials(created_at DESC);
  END IF;
END $$;
`;

async function main() {
  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL via aws-0-eu-west-1.pooler.supabase.com');
    console.log('Applying performance indexes with SET ROLE postgres...');
    await client.query(sqlQueries);
    console.log('✅ ALL PERFORMANCE INDEXES APPLIED SUCCESSFULLY!');

    const res = await client.query(`
      SELECT
        tablename,
        indexname,
        indexdef
      FROM
        pg_indexes
      WHERE
        schemaname = 'public'
      ORDER BY
        tablename,
        indexname;
    `);
    console.log(`\nVerified ${res.rows.length} total indexes in public schema:`);
    for (const row of res.rows) {
      console.log(`- [${row.tablename}] ${row.indexname}`);
    }
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await client.end();
  }
}

main();
