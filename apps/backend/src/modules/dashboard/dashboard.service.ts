import { supabaseAuth } from '../../lib/supabase'

async function getDomicilioId(db: ReturnType<typeof supabaseAuth>): Promise<string> {
  const { data, error } = await db.rpc('fn_domicilio_do_usuario')
  if (error || !data) throw new Error('Domicílio não encontrado')
  return data as string
}

export async function resumo(authId: string, token: string) {
  const db = supabaseAuth(token)
  const domicilioId = await getDomicilioId(db)

  const agora = new Date()
  const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1).toISOString().split('T')[0]
  const fimMes = new Date(agora.getFullYear(), agora.getMonth() + 1, 0).toISOString().split('T')[0]

  const [transacoesMes, ultimasTransacoes, metas] = await Promise.all([
    db
      .from('transacoes')
      .select('tipo, valor')
      .eq('domicilio_id', domicilioId)
      .gte('data_transacao', inicioMes)
      .lte('data_transacao', fimMes),

    db
      .from('transacoes')
      .select('*, categorias(id, nome, icone, cor), usuarios(id, nome)')
      .eq('domicilio_id', domicilioId)
      .order('data_transacao', { ascending: false })
      .limit(10),

    db
      .from('metas')
      .select('id, nome, valor_alvo, valor_atual, data_limite, concluida')
      .eq('domicilio_id', domicilioId)
      .eq('concluida', false)
      .order('data_limite', { ascending: true })
      .limit(3),
  ])

  const totalReceitas = (transacoesMes.data ?? [])
    .filter((t) => t.tipo === 'receita')
    .reduce((acc, t) => acc + Number(t.valor), 0)

  const totalDespesas = (transacoesMes.data ?? [])
    .filter((t) => t.tipo === 'despesa')
    .reduce((acc, t) => acc + Number(t.valor), 0)

  return {
    mes_atual: { inicio: inicioMes, fim: fimMes },
    saldo_mes: totalReceitas - totalDespesas,
    total_receitas: totalReceitas,
    total_despesas: totalDespesas,
    ultimas_transacoes: ultimasTransacoes.data ?? [],
    metas_em_andamento: metas.data ?? [],
  }
}

export async function gastosPorCategoria(authId: string, token: string, mes: string) {
  const db = supabaseAuth(token)
  const domicilioId = await getDomicilioId(db)

  const [ano, mesNum] = mes.split('-').map(Number)
  const inicio = new Date(ano, mesNum - 1, 1).toISOString().split('T')[0]
  const fim = new Date(ano, mesNum, 0).toISOString().split('T')[0]

  const { data, error } = await db
    .from('transacoes')
    .select('valor, categorias(id, nome, icone, cor)')
    .eq('domicilio_id', domicilioId)
    .eq('tipo', 'despesa')
    .gte('data_transacao', inicio)
    .lte('data_transacao', fim)

  if (error) throw new Error('Erro ao buscar gastos por categoria')

  const agrupado = new Map<string, { categoria: unknown; total: number }>()
  for (const t of data ?? []) {
    const cat = t.categorias as { id: string } | { id: string }[] | null
    const catObj = Array.isArray(cat) ? cat[0] : cat
    const catId = catObj?.id ?? 'sem_categoria'
    const existente = agrupado.get(catId)
    if (existente) {
      existente.total += Number(t.valor)
    } else {
      agrupado.set(catId, { categoria: t.categorias, total: Number(t.valor) })
    }
  }

  return Array.from(agrupado.values()).sort((a, b) => b.total - a.total)
}

export async function divisaoDespesas(
  authId: string,
  token: string,
  percentualUsuario: number,
  mes: string,
) {
  if (percentualUsuario < 0 || percentualUsuario > 100) {
    throw new Error('Percentual deve ser entre 0 e 100')
  }

  const db = supabaseAuth(token)
  const domicilioId = await getDomicilioId(db)

  const [ano, mesNum] = mes.split('-').map(Number)
  const inicio = new Date(ano, mesNum - 1, 1).toISOString().split('T')[0]
  const fim = new Date(ano, mesNum, 0).toISOString().split('T')[0]

  const { data: membros } = await db
    .from('membros_domicilio')
    .select('usuario_id, usuarios(id, nome)')
    .eq('domicilio_id', domicilioId)

  const { data: transacoes } = await db
    .from('transacoes')
    .select('usuario_id, valor')
    .eq('domicilio_id', domicilioId)
    .eq('tipo', 'despesa')
    .gte('data_transacao', inicio)
    .lte('data_transacao', fim)

  const totalGeral = (transacoes ?? []).reduce((acc, t) => acc + Number(t.valor), 0)
  const percentualOutro = 100 - percentualUsuario
  const valorDevido = {
    usuario: (totalGeral * percentualUsuario) / 100,
    outro: (totalGeral * percentualOutro) / 100,
  }

  const gastosPorMembro = new Map<string, number>()
  for (const t of transacoes ?? []) {
    const atual = gastosPorMembro.get(t.usuario_id) ?? 0
    gastosPorMembro.set(t.usuario_id, atual + Number(t.valor))
  }

  return {
    total_despesas: totalGeral,
    divisao: membros?.map((m) => ({
      usuario: m.usuarios,
      gasto_real: gastosPorMembro.get(m.usuario_id) ?? 0,
      deve_pagar: m.usuario_id === membros[0]?.usuario_id ? valorDevido.usuario : valorDevido.outro,
    })) ?? [],
  }
}
