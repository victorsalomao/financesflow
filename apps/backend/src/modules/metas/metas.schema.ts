import { z } from 'zod'

export const criarMetaSchema = z.object({
  nome: z.string().min(1).max(255),
  descricao: z.string().optional(),
  valor_alvo: z.number().positive(),
  data_limite: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  icone: z.string().optional(),
  cor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
})

export const atualizarMetaSchema = z.object({
  nome: z.string().min(1).max(255).optional(),
  descricao: z.string().optional(),
  valor_alvo: z.number().positive().optional(),
  valor_atual: z.number().min(0).optional(),
  data_limite: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  concluida: z.boolean().optional(),
  icone: z.string().optional(),
  cor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
})

export type CriarMetaInput = z.infer<typeof criarMetaSchema>
export type AtualizarMetaInput = z.infer<typeof atualizarMetaSchema>
