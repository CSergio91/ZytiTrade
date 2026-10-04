import { createClient } from '@supabase/supabase-js';

const sb = createClient('https://ujcnglkdwzqlwqgrkspz.supabase.co', 'sb_publishable_Vg2Hc-cvEpBj0TKBXB3Tmw_1PCxN9C0');

async function run() {
  const { data: accs } = await sb.from('trading_accounts').select('*');
  console.log('--- TRADING ACCOUNTS ---');
  for (const a of accs || []) {
    console.log(`ID: ${a.id}, Num: ${a.account_number}, Status: ${a.status}, Bal: ${a.current_balance}, Reason: ${a.breach_reason}, RulesConfig:`, a.rules_config);
  }

  const { data: rules } = await sb.from('risk_rule_configs').select('*');
  console.log('\n--- RISK RULES ---');
  for (const r of rules || []) {
    console.log(`ID: ${r.id}, Name: ${r.name}, MaxDaily: ${r.max_daily_loss_percent}%, MaxTotal: ${r.max_total_drawdown_percent}%, DefaultDemo: ${r.is_default_demo}`);
  }
}

run();
