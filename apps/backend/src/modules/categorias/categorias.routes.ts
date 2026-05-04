import { FastifyInstance } from 'fastify'
import { authenticate } from '../../plugins/authenticate'
import { ok, erro } from '../../utils/resposta'
import { criarCategoriaSchema } from './categorias.schema'
import * as categoriasService from './categorias.service'

export async function categoriasRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate)

  app.get('/', async (request, reply) => {
    try {
      const result = await categoriasService.listar(request.usuario.authId, request.usuario.token)
      return reply.send(ok(result))
    } catch (e: unknown) {
      return reply.status(400).send(erro(e instanceof Error ? e.message : 'Erro ao buscar categorias'))
    }
  })

  app.post('/', async (request, reply) => {
    const parsed = criarCategoriaSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send(erro('Dados inválidos: ' + parsed.error.issues[0].message))
    }
    try {
      const result = await categoriasService.criar(
        request.usuario.authId,
        request.usuario.token,
        parsed.data,
      )
      return reply.status(201).send(ok(result, 'Categoria criada com sucesso'))
    } catch (e: unknown) {
      return reply.status(400).send(erro(e instanceof Error ? e.message : 'Erro ao criar categoria'))
    }
  })

  app.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    try {
      await categoriasService.deletar(request.usuario.authId, request.usuario.token, id)
      return reply.send(ok(null, 'Categoria removida com sucesso'))
    } catch (e: unknown) {
      return reply.status(400).send(erro(e instanceof Error ? e.message : 'Erro ao deletar categoria'))
    }
  })
}
