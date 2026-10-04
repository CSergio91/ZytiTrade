import { createClient } from '@supabase/supabase-js';

const sb = createClient('https://ujcnglkdwzqlwqgrkspz.supabase.co', 'sb_publishable_Vg2Hc-cvEpBj0TKBXB3Tmw_1PCxN9C0');

async function unbreach() {
  // 1. Restaurar ZYTI-100K-TF001 a ACTIVE
  const { data, error } = await sb
    .from('trading_accounts')
    .update({
      status: 'ACTIVE',
      breach_reason: null,
      current_balance: 100000,
      equity: 100000,
      peak_equity: 100000,
      daily_start_equity: 100000,
      updated_at: new Date().toISOString()
    })
    .eq('account_number', 'ZYTI-100K-TF001')
    .select();

  console.log('UNBREACH RESULT:', error ? error.message : 'SUCCESS', data);

  // 2. Llamar al endpoint del servidor
  try {
    const res = await fetch('http://localhost:8080/api/crm/account/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId: 'ZYTI-100K-TF001', initialBalance: 100000 })
    });
    console.log('SERVER RESET HTTP:', res.status);
  } catch (e) {
    console.log('SERVER RESET ERROR:', e.message);
  }
}

unbreach();
