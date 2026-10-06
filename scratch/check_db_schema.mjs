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

  const cols = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'risk_rule_configs'
    ORDER BY ordinal_position
  `);
  console.log('Columns in risk_rule_configs:');
  console.table(cols.rows);

  const rows = await client.query('SELECT * FROM public.risk_rule_configs');
  console.log('Rows in risk_rule_configs count:', rows.rows.length);
  console.log('Rows in risk_rule_configs:', rows.rows);

  const accs = await client.query('SELECT id, account_number, trader_email, initial_balance, status, rules_config FROM public.trading_accounts LIMIT 5');
  console.log('Sample trading_accounts:');
  console.log(JSON.stringify(accs.rows, null, 2));

  await client.end();
}

main().catch(console.error);
