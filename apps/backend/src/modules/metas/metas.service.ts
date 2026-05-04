import { supabaseAuth } from '../../lib/supabase'
import type { CriarMetaInput, AtualizarMetaInput } from './metas.schema'

async function getDomicilioId(db: ReturnType<typeof supabaseAuth>): Promise<string> {
  const { data, error } = await db.rpc('fn_domicilio_do_usuario')
  if (error || !data) throw new Error('Domicílio não encontrado')
  return data as string
}

export async function listar(authId: string, token: string) {
  const db = supabaseAuth(token)
  const domicilioId = await getDomicilioId(db)

  const { data, error } = await db
    .from('metas')
    .select('*')
    .eq('domicilio_id', domicilioId)
    .order('concluida')
    .order('data_limite', { ascending: true, nullsFirst: false })

  if (error) throw new Error('Erro ao buscar metas')
  return data
}

export async function criar(authId: string, token: string, input: CriarMetaInput) {
  const db = supabaseAuth(token)
  const domicilioId = await getDomicilioId(db)

  const { data, error } = await db
    .from('metas')
    .insert({ ...input, domicilio_id: domicilioId })
    .select()
    .single()

  if (error) throw new Error('Erro ao criar meta')
  return data
}

export async function atualizar(authId: string, token: string, id: string, input: AtualizarMetaInput) {
  const db = supabaseAuth(token)
  const domicilioId = await getDomicilioId(db)

  const atualizacao = { ...input }
  if (input.valor_atual !== undefined && input.valor_alvo === undefined) {
    const { data: metaAtual } = await db
      .from('metas')
      .select('valor_alvo')
      .eq('id', id)
      .eq('domicilio_id', domicilioId)
      .single()
    if (metaAtual && input.valor_atual >= Number(metaAtual.valor_alvo)) {
      atualizacao.concluida = true
    }
  }

  const { data, error } = await db
    .from('metas')
    .update(atualizacao)
    .eq('id', id)
    .eq('domicilio_id', domicilioId)
    .select()
    .single()

  if (error) throw new Error('Erro ao atualizar meta')
  if (!data) throw new Error('Meta não encontrada')
  return data
}

export async function deletar(authId: string, token: string, id: string) {
  const db = supabaseAuth(token)
  const domicilioId = await getDomicilioId(db)

  const { error } = await db
    .from('metas')
    .delete()
    .eq('id', id)
    .eq('domicilio_id', domicilioId)

  if (error) throw new Error('Erro ao deletar meta')
}
