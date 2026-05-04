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
