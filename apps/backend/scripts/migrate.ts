import 'dotenv/config'
import { readFileSync } from 'fs'
import { join } from 'path'
import { Client } from 'pg'

const sql = readFileSync(
  join(__dirname, '../../../banco/migrations/001_schema_inicial.sql'),
  'utf8',
)

async function migrate() {
  const client = new Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()
  console.log('Conectado ao banco. Aplicando migration...')
  await client.query(sql)
  console.log('Migration aplicada com sucesso.')
  await client.end()
}

migrate().catch((err) => {
  console.error('Erro na migration:', err.message)
  process.exit(1)
})
