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
  await client.connect();
  const cols = await client.query(`
    SELECT column_name, data_type, is_nullable 
    FROM information_schema.columns 
    WHERE table_name = 'account_trades'
    ORDER BY ordinal_position
  `);
  console.log('Columns in account_trades:');
  console.table(cols.rows);
  await client.end();
}

main().catch(console.error);
