import { supabaseAuth } from '../../lib/supabase'
import type { CriarCategoriaInput } from './categorias.schema'

async function getDomicilioId(db: ReturnType<typeof supabaseAuth>): Promise<string> {
  const { data, error } = await db.rpc('fn_domicilio_do_usuario')
  if (error || !data) throw new Error('Domicílio não encontrado')
  return data as string
}

export async function listar(authId: string, token: string) {
  const db = supabaseAuth(token)
  const domicilioId = await getDomicilioId(db)

  // Retorna padrões (domicilio_id = null) + customizadas do domicílio
  const { data, error } = await db
    .from('categorias')
    .select('*')
    .or(`domicilio_id.is.null,domicilio_id.eq.${domicilioId}`)
    .order('eh_padrao', { ascending: false })
    .order('nome')

  if (error) throw new Error('Erro ao buscar categorias')
  return data
}

export async function criar(authId: string, token: string, input: CriarCategoriaInput) {
  const db = supabaseAuth(token)
  const domicilioId = await getDomicilioId(db)

  const { data, error } = await db
    .from('categorias')
    .insert({ ...input, domicilio_id: domicilioId, eh_padrao: false })
    .select()
    .single()

  if (error) throw new Error('Erro ao criar categoria')
  return data
}

export async function deletar(authId: string, token: string, id: string) {
  const db = supabaseAuth(token)
  const domicilioId = await getDomicilioId(db)

  const { data: categoria } = await db
    .from('categorias')
    .select('eh_padrao')
    .eq('id', id)
    .eq('domicilio_id', domicilioId)
    .single()

  if (!categoria) throw new Error('Categoria não encontrada')
  if (categoria.eh_padrao) throw new Error('Categorias padrão não podem ser removidas')

  const { error } = await db.from('categorias').delete().eq('id', id).eq('domicilio_id', domicilioId)
  if (error) throw new Error('Erro ao deletar categoria')
}
