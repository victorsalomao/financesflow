import 'dotenv/config'
import './types'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import { env } from './config/env'
import { authRoutes } from './modules/auth/auth.routes'
import { transacoesRoutes } from './modules/transacoes/transacoes.routes'
import { categoriasRoutes } from './modules/categorias/categorias.routes'
import { dashboardRoutes } from './modules/dashboard/dashboard.routes'
import { metasRoutes } from './modules/metas/metas.routes'

const app = Fastify({ logger: true })

async function bootstrap() {
  await app.register(cors, { origin: true })

  await app.register(authRoutes, { prefix: '/auth' })
  await app.register(transacoesRoutes, { prefix: '/transacoes' })
  await app.register(categoriasRoutes, { prefix: '/categorias' })
  await app.register(dashboardRoutes, { prefix: '/dashboard' })
  await app.register(metasRoutes, { prefix: '/metas' })

  app.get('/health', async () => ({ status: 'ok' }))

  await app.listen({ port: env.PORT, host: '0.0.0.0' })
}

bootstrap().catch((err) => {
  console.error(err)
  process.exit(1)
})
