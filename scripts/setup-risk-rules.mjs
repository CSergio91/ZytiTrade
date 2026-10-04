import pg from 'pg';

const client = new pg.Client({
  host: 'aws-0-eu-west-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.ujcnglkdwzqlwqgrkspz',
  password: 'Carlos910221Ca*',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  console.log('Connected to eu-west-1 pooler');

  const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
  console.log('Existing public tables:', res.rows.map(r => r.table_name));

  // Check if risk_rule_configs exists; if not, create it
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.risk_rule_configs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      firm_id UUID,
      name VARCHAR(100) NOT NULL,
      max_daily_loss_percent NUMERIC(5, 2) NOT NULL DEFAULT 5.00,
      max_total_drawdown_percent NUMERIC(5, 2) NOT NULL DEFAULT 10.00,
      max_trailing_drawdown_percent NUMERIC(5, 2) DEFAULT NULL,
      drawdown_type VARCHAR(30) NOT NULL DEFAULT 'EOD',
      max_leverage INT NOT NULL DEFAULT 100,
      mandatory_stop_loss BOOLEAN NOT NULL DEFAULT false,
      weekend_holding_allowed BOOLEAN NOT NULL DEFAULT true,
      consistency_rule_percent NUMERIC(5, 2) DEFAULT 40.00,
      min_trading_days INT DEFAULT 5,
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS public.api_credentials (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(100) NOT NULL,
      key_type VARCHAR(30) NOT NULL,
      api_key_public VARCHAR(64) UNIQUE NOT NULL,
      key_hash VARCHAR(128) NOT NULL,
      scopes TEXT[] NOT NULL DEFAULT '{}',
      ip_whitelist TEXT[] DEFAULT '{}',
      rate_limit_rpm INT DEFAULT 120,
      is_active BOOLEAN NOT NULL DEFAULT true,
      last_used_at TIMESTAMPTZ,
      expires_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
    GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
    GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;

    NOTIFY pgrst, 'reload schema';
  `);

  console.log('Tables created, permissions granted, and pgrst reloaded!');

  // Insert default risk rules if table is empty
  const countRes = await client.query('SELECT count(*) FROM public.risk_rule_configs');
  if (parseInt(countRes.rows[0].count, 10) === 0) {
    await client.query(`
      INSERT INTO public.risk_rule_configs (name, max_daily_loss_percent, max_total_drawdown_percent, max_leverage, mandatory_stop_loss)
      VALUES 
        ('Standard Challenge 100K', 5.00, 10.00, 100, false),
        ('Strict Swing 100K', 4.00, 8.00, 50, true),
        ('Aggressive Scalper 50K', 6.00, 12.00, 100, false);
    `);
    console.log('Default risk rules inserted!');
  }

  const finalCheck = await client.query('SELECT name, max_daily_loss_percent, max_total_drawdown_percent FROM public.risk_rule_configs');
  console.log('risk_rule_configs in DB:', finalCheck.rows);

  await client.end();
}

main().catch(console.error);
