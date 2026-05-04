import { z } from 'zod'

export const registroSchema = z.object({
  nome: z.string().min(2),
  email: z.string().email(),
  senha: z.string().min(6),
})

export const loginSchema = z.object({
  email: z.string().email(),
  senha: z.string(),
})

export const criarDomicilioSchema = z.object({
  nome: z.string().min(2),
})

export const entrarDomicilioSchema = z.object({
  codigo_convite: z.string().length(8),
})

export type RegistroInput = z.infer<typeof registroSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type CriarDomicilioInput = z.infer<typeof criarDomicilioSchema>
export type EntrarDomicilioInput = z.infer<typeof entrarDomicilioSchema>
