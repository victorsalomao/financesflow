import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { authenticate } from '../../plugins/authenticate'
import { ok, erro } from '../../utils/resposta'
import * as dashboardService from './dashboard.service'

export async function dashboardRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate)

  app.get('/', async (request, reply) => {
    try {
      const result = await dashboardService.resumo(request.usuario.authId, request.usuario.token)
      return reply.send(ok(result))
    } catch (e: unknown) {
      return reply.status(400).send(erro(e instanceof Error ? e.message : 'Erro ao buscar dashboard'))
    }
  })

  app.get('/categorias', async (request, reply) => {
    const mesSchema = z.object({ mes: z.string().regex(/^\d{4}-\d{2}$/).default(() => {
      const d = new Date()
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    }) })

    const parsed = mesSchema.safeParse(request.query)
    if (!parsed.success) {
      return reply.status(400).send(erro('Formato de mês inválido. Use YYYY-MM'))
    }
    try {
      const result = await dashboardService.gastosPorCategoria(
        request.usuario.authId,
        request.usuario.token,
        parsed.data.mes,
      )
      return reply.send(ok(result))
    } catch (e: unknown) {
      return reply.status(400).send(erro(e instanceof Error ? e.message : 'Erro ao buscar gastos'))
    }
  })

  app.get('/divisao', async (request, reply) => {
    const schema = z.object({
      percentual: z.coerce.number().min(0).max(100).default(50),
      mes: z.string().regex(/^\d{4}-\d{2}$/).default(() => {
        const d = new Date()
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      }),
    })

    const parsed = schema.safeParse(request.query)
    if (!parsed.success) {
      return reply.status(400).send(erro('Parâmetros inválidos'))
    }
    try {
      const result = await dashboardService.divisaoDespesas(
        request.usuario.authId,
        request.usuario.token,
        parsed.data.percentual,
        parsed.data.mes,
      )
      return reply.send(ok(result))
    } catch (e: unknown) {
      return reply.status(400).send(erro(e instanceof Error ? e.message : 'Erro ao calcular divisão'))
    }
  })
}
