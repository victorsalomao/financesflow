import { z } from 'zod'

export const criarCategoriaSchema = z.object({
  nome: z.string().min(1).max(100),
  icone: z.string().optional(),
  cor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  tipo: z.enum(['despesa', 'receita']).default('despesa'),
})

export type CriarCategoriaInput = z.infer<typeof criarCategoriaSchema>
