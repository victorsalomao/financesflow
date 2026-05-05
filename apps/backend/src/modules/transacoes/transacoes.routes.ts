import { FastifyInstance } from 'fastify'
import { authenticate } from '../../plugins/authenticate'
import { ok, erro } from '../../utils/resposta'
import { criarTransacaoSchema, atualizarTransacaoSchema, filtrosTransacaoSchema, sugerirCategoriaSchema } from './transacoes.schema'
import * as transacoesService from './transacoes.service'

export async function transacoesRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate)

  app.get('/', async (request, reply) => {
    const parsed = filtrosTransacaoSchema.safeParse(request.query)
    if (!parsed.success) {
      return reply.status(400).send(erro('Filtros inválidos'))
    }
    try {
      const result = await transacoesService.listar(
        request.usuario.authId,
        request.usuario.token,
        parsed.data,
      )
      return reply.send(ok(result))
    } catch (e: unknown) {
      return reply.status(400).send(erro(e instanceof Error ? e.message : 'Erro ao buscar transações'))
    }
  })

  app.post('/', async (request, reply) => {
    const parsed = criarTransacaoSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send(erro('Dados inválidos: ' + parsed.error.issues[0].message))
    }
    try {
      const result = await transacoesService.criar(
        request.usuario.authId,
        request.usuario.token,
        parsed.data,
      )
      return reply.status(201).send(ok(result, 'Transação criada com sucesso'))
    } catch (e: unknown) {
      return reply.status(400).send(erro(e instanceof Error ? e.message : 'Erro ao criar transação'))
    }
  })

  app.post('/sugerir-categoria', async (request, reply) => {
    const parsed = sugerirCategoriaSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send(erro('Dados inválidos: ' + parsed.error.issues[0].message))
    }
    try {
      const result = await transacoesService.sugerirCategoria(
        request.usuario.authId,
        request.usuario.token,
        parsed.data,
      )
      return reply.send(ok(result))
    } catch (e: unknown) {
      return reply.status(400).send(erro(e instanceof Error ? e.message : 'Erro ao sugerir categoria'))
    }
  })

  app.put('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const parsed = atualizarTransacaoSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send(erro('Dados inválidos'))
    }
    try {
      const result = await transacoesService.atualizar(
        request.usuario.authId,
        request.usuario.token,
        id,
        parsed.data,
      )
      return reply.send(ok(result, 'Transação atualizada com sucesso'))
    } catch (e: unknown) {
      return reply.status(400).send(erro(e instanceof Error ? e.message : 'Erro ao atualizar transação'))
    }
  })

  app.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    try {
      await transacoesService.deletar(request.usuario.authId, request.usuario.token, id)
      return reply.send(ok(null, 'Transação removida com sucesso'))
    } catch (e: unknown) {
      return reply.status(400).send(erro(e instanceof Error ? e.message : 'Erro ao deletar transação'))
    }
  })
}
