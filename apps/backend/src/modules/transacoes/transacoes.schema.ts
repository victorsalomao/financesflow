import { z } from 'zod'

export const criarTransacaoSchema = z.object({
  conta_bancaria_id: z.string().uuid().optional(),
  categoria_id: z.string().uuid().optional(),
  descricao: z.string().min(1).max(500),
  valor: z.number().positive(),
  tipo: z.enum(['despesa', 'receita', 'transferencia']),
  data_transacao: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  observacoes: z.string().optional(),
})

export const atualizarTransacaoSchema = criarTransacaoSchema.partial()

export const filtrosTransacaoSchema = z.object({
  data_inicio: z.string().optional(),
  data_fim: z.string().optional(),
  tipo: z.enum(['despesa', 'receita', 'transferencia']).optional(),
  categoria_id: z.string().uuid().optional(),
  pagina: z.coerce.number().int().positive().default(1),
  limite: z.coerce.number().int().min(1).max(100).default(20),
})

export const sugerirCategoriaSchema = z.object({
  descricao: z.string().min(1).max(500),
  valor: z.number().positive(),
})

export type CriarTransacaoInput = z.infer<typeof criarTransacaoSchema>
export type AtualizarTransacaoInput = z.infer<typeof atualizarTransacaoSchema>
export type FiltrosTransacaoInput = z.infer<typeof filtrosTransacaoSchema>
export type SugerirCategoriaInput = z.infer<typeof sugerirCategoriaSchema>
