import { FastifyInstance } from 'fastify'
import { authenticate } from '../../plugins/authenticate'
import { ok, erro } from '../../utils/resposta'
import { registroSchema, loginSchema, criarDomicilioSchema, entrarDomicilioSchema } from './auth.schema'
import * as authService from './auth.service'

export async function authRoutes(app: FastifyInstance) {
  app.post('/registro', async (request, reply) => {
    const parsed = registroSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send(erro('Dados inválidos: ' + parsed.error.issues[0].message))
    }
    try {
      const result = await authService.registrar(parsed.data)
      return reply.status(201).send(ok(result, 'Conta criada com sucesso'))
    } catch (e: unknown) {
      return reply.status(400).send(erro(e instanceof Error ? e.message : 'Erro ao registrar'))
    }
  })

  app.post('/login', async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send(erro('Dados inválidos'))
    }
    try {
      const result = await authService.login(parsed.data)
      return reply.send(ok(result, 'Login realizado com sucesso'))
    } catch (e: unknown) {
      return reply.status(401).send(erro(e instanceof Error ? e.message : 'Erro ao fazer login'))
    }
  })

  app.post('/domicilio', { preHandler: authenticate }, async (request, reply) => {
    const parsed = criarDomicilioSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send(erro('Dados inválidos'))
    }
    try {
      const result = await authService.criarDomicilio(
        request.usuario.authId,
        request.usuario.token,
        parsed.data,
      )
      return reply.status(201).send(ok(result, 'Domicílio criado com sucesso'))
    } catch (e: unknown) {
      return reply.status(400).send(erro(e instanceof Error ? e.message : 'Erro ao criar domicílio'))
    }
  })

  app.post('/domicilio/entrar', { preHandler: authenticate }, async (request, reply) => {
    const parsed = entrarDomicilioSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send(erro('Código de convite inválido'))
    }
    try {
      const result = await authService.entrarDomicilio(
        request.usuario.authId,
        request.usuario.token,
        parsed.data,
      )
      return reply.send(ok(result, 'Bem-vindo ao domicílio!'))
    } catch (e: unknown) {
      return reply.status(400).send(erro(e instanceof Error ? e.message : 'Erro ao entrar no domicílio'))
    }
  })
}
