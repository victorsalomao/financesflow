import { useEffect, useRef, useState } from 'react';
import { api, SugestaoCategoria } from '../services/api';

const DEBOUNCE_MS = 600;
const MIN_CHARS = 4;

export function useSugestaoCategoria(
  descricao: string,
  valor: number,
  token: string | null,
): SugestaoCategoria | null {
  const [sugestao, setSugestao] = useState<SugestaoCategoria | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (abortRef.current) abortRef.current.abort();

    const trimmed = descricao.trim();
    if (!token || trimmed.length < MIN_CHARS || valor <= 0) {
      setSugestao(null);
      return;
    }

    timerRef.current = setTimeout(async () => {
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      try {
        const data = await api.transacoes.sugerirCategoria(
          { descricao: trimmed, valor },
          token,
        );
        if (!ctrl.signal.aborted) setSugestao(data);
      } catch {
        if (!ctrl.signal.aborted) setSugestao(null);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [descricao, valor, token]);

  return sugestao;
}
