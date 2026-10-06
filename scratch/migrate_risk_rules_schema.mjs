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
  console.log('Connected to PostgreSQL Supabase');

  // 1. Añadir columnas faltantes a public.risk_rule_configs
  console.log('Adding missing columns to risk_rule_configs...');
  await client.query(`
    ALTER TABLE public.risk_rule_configs
    ADD COLUMN IF NOT EXISTS model_type VARCHAR(30) NOT NULL DEFAULT 'ONE_PHASE',
    ADD COLUMN IF NOT EXISTS profit_target_percent NUMERIC(5, 2) NOT NULL DEFAULT 10.00,
    ADD COLUMN IF NOT EXISTS profit_target_phase2_percent NUMERIC(5, 2) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS profit_split_percent NUMERIC(5, 2) NOT NULL DEFAULT 80.00,
    ADD COLUMN IF NOT EXISTS inactivity_days_limit INT NOT NULL DEFAULT 30,
    ADD COLUMN IF NOT EXISTS max_positions_per_symbol_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS max_positions_per_symbol INT NOT NULL DEFAULT 2,
    ADD COLUMN IF NOT EXISTS max_total_open_positions_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS max_total_open_positions INT NOT NULL DEFAULT 5,
    ADD COLUMN IF NOT EXISTS anti_hedging_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS max_risk_per_trade_percent NUMERIC(5, 2) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS min_trade_duration_seconds INT NOT NULL DEFAULT 10,
    ADD COLUMN IF NOT EXISTS news_trading_allowed BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS min_daily_profit_type VARCHAR(20) NOT NULL DEFAULT 'PERCENT',
    ADD COLUMN IF NOT EXISTS min_daily_profit_value NUMERIC(10, 2) NOT NULL DEFAULT 0.50;
  `);

  console.log('Columns added successfully.');

  // 2. Verificar si en trading_accounts hay cuentas con retos personalizados para sincronizarlos en risk_rule_configs
  const accsRes = await client.query(`
    SELECT id, account_number, trader_email, initial_balance, rules_config 
    FROM public.trading_accounts 
    WHERE rules_config IS NOT NULL AND rules_config != '{}'::jsonb
  `);

  console.log(`Found ${accsRes.rows.length} accounts with rules_config:`);
  for (const acc of accsRes.rows) {
    const rc = acc.rules_config || {};
    const challengeName = rc.challengeName || `Plan ${acc.account_number}`;
    const ddDaily = Number(rc.maxDailyDrawdownPct || 5);
    const ddTotal = Number(rc.maxTotalDrawdownPct || 10);
    const pTarget = Number(rc.profitTargetPct || 8);
    const initBal = Number(acc.initial_balance || 100000);

    console.log(`Account ${acc.account_number} (${acc.trader_email}): Daily DD = ${ddDaily}%, Total DD = ${ddTotal}%, Target = ${pTarget}%`);

    // Comprobar si ya existe una regla con este nombre o características
    const existingRule = await client.query(`
      SELECT id FROM public.risk_rule_configs WHERE name = $1
    `, [challengeName]);

    if (existingRule.rows.length === 0) {
      console.log(`Creating challenge in risk_rule_configs for "${challengeName}"...`);
      await client.query(`
        INSERT INTO public.risk_rule_configs (
          name, model_type, default_account_balance, is_default_demo,
          max_daily_loss_percent, max_total_drawdown_percent, profit_target_percent,
          profit_split_percent, max_leverage, mandatory_stop_loss, weekend_holding_allowed,
          consistency_rule_percent, min_trading_days, is_active
        ) VALUES (
          $1, $2, $3, false,
          $4, $5, $6,
          80.00, $7, $8, $9,
          $10, $11, true
        )
      `, [
        challengeName,
        rc.modelType || 'ONE_PHASE',
        initBal,
        ddDaily,
        ddTotal,
        pTarget,
        rc.maxLeverage || 100,
        !!rc.mandatoryStopLoss,
        rc.weekendHoldingAllowed !== false,
        rc.consistencyRulePercent || 40,
        rc.minTradingDays || 5
      ]);
    }
  }

  // 3. Actualizar la regla por defecto para que coincida exactamente con el estándar oficial 100K
  await client.query(`
    UPDATE public.risk_rule_configs
    SET 
      profit_target_percent = 10.00,
      profit_split_percent = 80.00,
      model_type = 'ONE_PHASE',
      default_account_balance = 100000.00,
      is_default_demo = true
    WHERE name = 'Standard Challenge 100K';

    UPDATE public.risk_rule_configs
    SET 
      profit_target_percent = 8.00,
      profit_split_percent = 80.00,
      model_type = 'ONE_PHASE',
      default_account_balance = 100000.00
    WHERE name = 'Strict Swing 100K';

    UPDATE public.risk_rule_configs
    SET 
      profit_target_percent = 12.00,
      profit_split_percent = 85.00,
      model_type = 'ONE_PHASE',
      default_account_balance = 50000.00
    WHERE name = 'Aggressive Scalper 50K';

    NOTIFY pgrst, 'reload schema';
  `);

  // 4. Listar todas las reglas finales en la BD
  const finalRules = await client.query(`
    SELECT id, name, model_type, default_account_balance, max_daily_loss_percent, max_total_drawdown_percent, profit_target_percent, profit_split_percent, is_default_demo
    FROM public.risk_rule_configs
    ORDER BY created_at ASC
  `);

  console.log('--- ALL RISK RULE CONFIGS IN SUPABASE POSTGRESQL ---');
  console.table(finalRules.rows);

  await client.end();
}

main().catch(console.error);
