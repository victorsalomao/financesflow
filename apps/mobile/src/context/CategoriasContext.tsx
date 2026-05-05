import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { api, CategoriaCatalogo } from '../services/api';

interface CategoriasContextType {
  categorias: CategoriaCatalogo[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  getById: (id: string) => CategoriaCatalogo | null;
  getByNome: (nome: string) => CategoriaCatalogo | null;
}

const CategoriasContext = createContext<CategoriasContextType | null>(null);

export function CategoriasProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [categorias, setCategorias] = useState<CategoriaCatalogo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) {
      setCategorias([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await api.categorias.listar(token);
      setCategorias(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar categorias');
      setCategorias([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const getById = useCallback(
    (id: string) => categorias.find(c => c.id === id) ?? null,
    [categorias],
  );

  const getByNome = useCallback(
    (nome: string) => categorias.find(c => c.nome === nome) ?? null,
    [categorias],
  );

  return (
    <CategoriasContext.Provider value={{ categorias, loading, error, reload: load, getById, getByNome }}>
      {children}
    </CategoriasContext.Provider>
  );
}

export function useCategorias() {
  const ctx = useContext(CategoriasContext);
  if (!ctx) throw new Error('useCategorias deve ser usado dentro de CategoriasProvider');
  return ctx;
}
