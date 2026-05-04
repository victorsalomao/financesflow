import { FastifyInstance } from 'fastify'
import { authenticate } from '../../plugins/authenticate'
import { ok, erro } from '../../utils/resposta'
import { criarMetaSchema, atualizarMetaSchema } from './metas.schema'
import * as metasService from './metas.service'

export async function metasRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate)

  app.get('/', async (request, reply) => {
    try {
      const result = await metasService.listar(request.usuario.authId, request.usuario.token)
      return reply.send(ok(result))
    } catch (e: unknown) {
      return reply.status(400).send(erro(e instanceof Error ? e.message : 'Erro ao buscar metas'))
    }
  })

  app.post('/', async (request, reply) => {
    const parsed = criarMetaSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send(erro('Dados inválidos: ' + parsed.error.issues[0].message))
    }
    try {
      const result = await metasService.criar(
        request.usuario.authId,
        request.usuario.token,
        parsed.data,
      )
      return reply.status(201).send(ok(result, 'Meta criada com sucesso'))
    } catch (e: unknown) {
      return reply.status(400).send(erro(e instanceof Error ? e.message : 'Erro ao criar meta'))
    }
  })

  app.put('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const parsed = atualizarMetaSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send(erro('Dados inválidos'))
    }
    try {
      const result = await metasService.atualizar(
        request.usuario.authId,
        request.usuario.token,
        id,
        parsed.data,
      )
      return reply.send(ok(result, 'Meta atualizada com sucesso'))
    } catch (e: unknown) {
      return reply.status(400).send(erro(e instanceof Error ? e.message : 'Erro ao atualizar meta'))
    }
  })

  app.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    try {
      await metasService.deletar(request.usuario.authId, request.usuario.token, id)
      return reply.send(ok(null, 'Meta removida com sucesso'))
    } catch (e: unknown) {
      return reply.status(400).send(erro(e instanceof Error ? e.message : 'Erro ao deletar meta'))
    }
  })
}
