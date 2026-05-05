import { env } from '../config/env'

interface RespostaCategorizacao {
  categoria: string
  confianca: number
}

export async function categorizarTransacao(
  descricao: string,
  valor: number,
): Promise<RespostaCategorizacao | null> {
  try {
    const response = await fetch(`${env.IA_SERVICE_URL}/categorizar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ descricao, valor }),
    })
    if (!response.ok) return null
    return (await response.json()) as RespostaCategorizacao
  } catch {
    return null
  }
}

export interface RespostaInterpretacao {
  descricao: string | null
  valor: number | null
  data: string | null
  tipo: 'despesa' | 'receita' | null
  categoria: string | null
  confianca_geral: number
}

export async function interpretarTransacao(
  texto: string,
  dataReferencia: string,
  categoriasDisponiveis: string[],
): Promise<RespostaInterpretacao | null> {
  try {
    const response = await fetch(`${env.IA_SERVICE_URL}/interpretar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        texto,
        data_referencia: dataReferencia,
        categorias_disponiveis: categoriasDisponiveis,
      }),
    })
    if (!response.ok) return null
    return (await response.json()) as RespostaInterpretacao
  } catch {
    return null
  }
}
