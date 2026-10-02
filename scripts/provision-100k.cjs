const { Client } = require('pg');

const client = new Client({
  host: 'aws-0-eu-west-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.ujcnglkdwzqlwqgrkspz',
  password: 'Carlos910221Ca*',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    await client.connect();
    console.log('Connected to PostgreSQL database!');

    // 1. Asegurar firma de fondeo predeterminada 'ZYTI Funding'
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.prop_firms (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await client.query(`ALTER TABLE public.prop_firms ALTER COLUMN api_key_hash DROP NOT NULL;`);

    let firmRes = await client.query(`SELECT id FROM public.prop_firms WHERE name = 'ZYTI Funding' LIMIT 1;`);
    let defaultFirmId;
    if (firmRes.rows.length === 0) {
      const insertedFirm = await client.query(`
        INSERT INTO public.prop_firms (name, api_key_hash, webhook_secret, is_active) 
        VALUES ('ZYTI Funding', 'hash_zyti_funding_internal', 'sec_zyti_funding_internal', true) 
        RETURNING id;
      `);
      defaultFirmId = insertedFirm.rows[0].id;
      console.log('Created default prop firm: ZYTI Funding with ID:', defaultFirmId);
    } else {
      defaultFirmId = firmRes.rows[0].id;
    }

    // Permitir firm_id nullable para cuentas demo directas
    await client.query(`ALTER TABLE public.trading_accounts ALTER COLUMN firm_id DROP NOT NULL;`);
    await client.query(`DROP POLICY IF EXISTS "Allow public access to trading_accounts" ON public.trading_accounts;`);
    await client.query(`CREATE POLICY "Allow public access to trading_accounts" ON public.trading_accounts FOR ALL USING (true) WITH CHECK (true);`);

    await client.query(`ALTER TABLE public.account_trades ENABLE ROW LEVEL SECURITY;`);
    await client.query(`DROP POLICY IF EXISTS "Allow public access to account_trades" ON public.account_trades;`);
    await client.query(`CREATE POLICY "Allow public access to account_trades" ON public.account_trades FOR ALL USING (true) WITH CHECK (true);`);

    // 2. Usuarios a aprovisionar con cuenta estándar de 100K
    const users = [
      { email: 'servtecempmant1991@gmail.com', num: 'ZYTI-100K-CM991' },
      { email: 'servtecempmant19911@gmail.com', num: 'ZYTI-100K-ST911' },
      { email: 'servtecempmant@gmail.com', num: 'ZYTI-100K-TF001' }
    ];

    const rules = JSON.stringify({
      maxDailyDrawdownPct: 5.0,
      maxTotalDrawdownPct: 10.0,
      maxLeverage: 100,
      profitTargetPct: 8.0,
      minTradingDays: 5,
      drawdownType: 'EOD'
    });

    await client.query(`ALTER TABLE public.trading_accounts ALTER COLUMN access_token DROP NOT NULL;`);

    for (const u of users) {
      const res = await client.query(
        `SELECT id FROM public.trading_accounts WHERE LOWER(trader_email) = LOWER($1)`,
        [u.email]
      );

      const token = `sso_${u.num.toLowerCase()}_${Date.now()}`;

      if (res.rows.length === 0) {
        await client.query(
          `INSERT INTO public.trading_accounts (
            firm_id, account_number, trader_email, initial_balance, current_balance, equity,
            peak_equity, daily_start_equity, status, rules_config, access_token
          ) VALUES ($1, $2, $3, 100000.00, 100000.00, 100000.00, 100000.00, 100000.00, 'ACTIVE', $4, $5)`,
          [defaultFirmId, u.num, u.email, rules, token]
        );
        console.log(`Created 100K account for ${u.email}`);
      } else {
        await client.query(
          `UPDATE public.trading_accounts 
           SET initial_balance = 100000.00, current_balance = 100000.00, equity = 100000.00, 
               peak_equity = 100000.00, daily_start_equity = 100000.00, rules_config = $2
           WHERE LOWER(trader_email) = LOWER($1)`,
          [u.email, rules]
        );
        console.log(`Updated 100K account for ${u.email}`);
      }
    }

    const finalAccounts = await client.query(
      `SELECT id, account_number, trader_email, initial_balance, current_balance, equity, status 
       FROM public.trading_accounts ORDER BY created_at DESC`
    );
    console.log('Resulting Trading Accounts in Database:');
    console.table(finalAccounts.rows);

    await client.end();
  } catch (err) {
    console.error('Error during execution:', err);
    process.exit(1);
  }
}

main();
