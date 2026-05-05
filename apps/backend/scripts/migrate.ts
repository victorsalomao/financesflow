import 'dotenv/config'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import { Client } from 'pg'

// Aplica todas as migrations em banco/migrations/ na ordem alfanumérica.
// Pré-requisito: DATABASE_URL no .env (formato pooler do Supabase recomendado).
// As migrations não são idempotentes — rodar apenas em banco zerado ou
// num que não tenha as migrations já aplicadas.

const MIGRATIONS_DIR = join(__dirname, '../../../banco/migrations')

async function migrate() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error('Erro: DATABASE_URL não está definida no .env do backend.')
    console.error('Formato esperado: postgresql://<user>:<password>@<host>:<port>/<database>')
    process.exit(1)
  }

  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort()

  if (files.length === 0) {
    console.error(`Erro: nenhum arquivo .sql encontrado em ${MIGRATIONS_DIR}`)
    process.exit(1)
  }

  console.log(`Encontradas ${files.length} migration(s):`)
  files.forEach((f) => console.log(`  - ${f}`))
  console.log('')

  const client = new Client({ connectionString: databaseUrl })
  await client.connect()
  console.log('Conectado ao banco.')

  try {
    for (const file of files) {
      const sql = readFileSync(join(MIGRATIONS_DIR, file), 'utf8')
      process.stdout.write(`Aplicando ${file}... `)
      await client.query(sql)
      console.log('OK')
    }
    console.log('')
    console.log(`Todas as ${files.length} migration(s) aplicadas com sucesso.`)
  } finally {
    await client.end()
  }
}

migrate().catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err)
  console.error('')
  console.error('Erro na migration:', msg)
  process.exit(1)
})
