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
  console.log('Connected to PostgreSQL');

  // Check columns of risk_rule_configs
  const colsRes = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'risk_rule_configs'
  `);
  console.log('Current columns in risk_rule_configs:', colsRes.rows.map(r => r.column_name));

  // Add default_account_balance and is_default_demo if they don't exist
  await client.query(`
    ALTER TABLE public.risk_rule_configs 
    ADD COLUMN IF NOT EXISTS default_account_balance NUMERIC(15, 2) NOT NULL DEFAULT 100000.00;

    ALTER TABLE public.risk_rule_configs 
    ADD COLUMN IF NOT EXISTS is_default_demo BOOLEAN NOT NULL DEFAULT false;

    -- Ensure exactly one default demo rule
    UPDATE public.risk_rule_configs 
    SET is_default_demo = true, default_account_balance = 100000.00 
    WHERE name = 'Standard Challenge 100K';

    UPDATE public.risk_rule_configs 
    SET default_account_balance = 100000.00 
    WHERE name = 'Strict Swing 100K';

    UPDATE public.risk_rule_configs 
    SET default_account_balance = 50000.00 
    WHERE name = 'Aggressive Scalper 50K';

    NOTIFY pgrst, 'reload schema';
  `);

  console.log('Columns verified and updated!');

  const rulesRes = await client.query(`
    SELECT id, name, default_account_balance, is_default_demo, max_daily_loss_percent, max_total_drawdown_percent 
    FROM public.risk_rule_configs
  `);
  console.log('Updated risk_rule_configs in DB:');
  console.table(rulesRes.rows);

  await client.end();
}

main().catch(console.error);
