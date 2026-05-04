import { FastifyRequest, FastifyReply } from 'fastify'
import { supabase } from '../lib/supabase'
import { erro } from '../utils/resposta'

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return reply.status(401).send(erro('Token não fornecido'))
  }

  const token = authHeader.slice(7)
  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) {
    return reply.status(401).send(erro('Não autorizado'))
  }

  request.usuario = { authId: user.id, token }
}
