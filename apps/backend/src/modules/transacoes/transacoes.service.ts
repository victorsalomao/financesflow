import { supabaseAuth } from '../../lib/supabase'
import { categorizarTransacao } from '../../lib/ia'
import type { CriarTransacaoInput, AtualizarTransacaoInput, FiltrosTransacaoInput } from './transacoes.schema'

// Usa fn SECURITY DEFINER — bypassa RLS e retorna o domicilio_id pelo JWT do usuário
async function getDomicilioId(db: ReturnType<typeof supabaseAuth>): Promise<string> {
  const { data, error } = await db.rpc('fn_domicilio_do_usuario')
  if (error || !data) throw new Error('Domicílio não encontrado. Crie ou entre em um domicílio primeiro.')
  return data as string
}

// Usa fn SECURITY DEFINER — retorna o usuarios.id pelo JWT do usuário
async function getUsuarioId(db: ReturnType<typeof supabaseAuth>): Promise<string> {
  const { data, error } = await db.rpc('fn_id_do_usuario')
  if (error || !data) throw new Error('Usuário não encontrado')
  return data as string
}

export async function listar(authId: string, token: string, filtros: FiltrosTransacaoInput) {
  const db = supabaseAuth(token)
  const domicilioId = await getDomicilioId(db)

  let query = db
    .from('transacoes')
    .select('*, categorias(id, nome, icone, cor), usuarios(id, nome)', { count: 'exact' })
    .eq('domicilio_id', domicilioId)
    .order('data_transacao', { ascending: false })

  if (filtros.data_inicio) query = query.gte('data_transacao', filtros.data_inicio)
  if (filtros.data_fim) query = query.lte('data_transacao', filtros.data_fim)
  if (filtros.tipo) query = query.eq('tipo', filtros.tipo)
  if (filtros.categoria_id) query = query.eq('categoria_id', filtros.categoria_id)

  const offset = (filtros.pagina - 1) * filtros.limite
  query = query.range(offset, offset + filtros.limite - 1)

  const { data, count, error } = await query
  if (error) {
    console.error('[transacoes.listar] Supabase error:', error)
    throw new Error(error.message || 'Erro ao buscar transações')
  }

  return {
    transacoes: data,
    total: count ?? 0,
    pagina: filtros.pagina,
    limite: filtros.limite,
  }
}

export async function criar(authId: string, token: string, input: CriarTransacaoInput) {
  const db = supabaseAuth(token)
  const [domicilioId, usuarioId] = await Promise.all([getDomicilioId(db), getUsuarioId(db)])

  const sugestaoIA = await categorizarTransacao(input.descricao, input.valor)

  const { data, error } = await db
    .from('transacoes')
    .insert({
      domicilio_id: domicilioId,
      usuario_id: usuarioId,
      ...input,
      categoria_ia: sugestaoIA?.categoria ?? null,
      confianca_ia: sugestaoIA?.confianca ?? null,
    })
    .select()
    .single()

  if (error) {
    console.error('[transacoes.criar] Supabase error:', error)
    throw new Error(error.message || 'Erro ao criar transação')
  }
  return data
}

export async function atualizar(authId: string, token: string, id: string, input: AtualizarTransacaoInput) {
  const db = supabaseAuth(token)
  const domicilioId = await getDomicilioId(db)

  const { data, error } = await db
    .from('transacoes')
    .update(input)
    .eq('id', id)
    .eq('domicilio_id', domicilioId)
    .select()
    .single()

  if (error) {
    console.error('[transacoes.atualizar] Supabase error:', error)
    throw new Error(error.message || 'Erro ao atualizar transação')
  }
  if (!data) throw new Error('Transação não encontrada')
  return data
}

export async function deletar(authId: string, token: string, id: string) {
  const db = supabaseAuth(token)
  const domicilioId = await getDomicilioId(db)

  const { error } = await db
    .from('transacoes')
    .delete()
    .eq('id', id)
    .eq('domicilio_id', domicilioId)

  if (error) {
    console.error('[transacoes.deletar] Supabase error:', error)
    throw new Error(error.message || 'Erro ao deletar transação')
  }
}
