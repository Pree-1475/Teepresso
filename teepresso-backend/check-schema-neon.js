const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function main() {
  const result = await sql`SELECT * FROM products LIMIT 1`;
  console.log(result);
}
main().catch(console.error);
