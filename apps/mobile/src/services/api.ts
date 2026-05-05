const BASE_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3333');

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface ApiResponse<T> {
  sucesso: boolean;
  dados: T;
  mensagem?: string;
}

async function request<T>(
  method: Method,
  path: string,
  body?: unknown,
  token?: string | null,
): Promise<T> {
  const headers: Record<string, string> = {};
  // Só seta Content-Type quando há body — Fastify rejeita DELETE/GET com header
  // 'application/json' e body vazio (FST_ERR_CTP_EMPTY_JSON_BODY).
  if (body != null) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
  });

  const json = (await res.json()) as ApiResponse<T>;
  if (!res.ok || !json.sucesso) throw new Error(json.mensagem ?? 'Erro inesperado');
  return json.dados;
}

export const api = {
  auth: {
    login: (email: string, senha: string) =>
      request<AuthData>('POST', '/auth/login', { email, senha }),
    registro: (nome: string, email: string, senha: string) =>
      request<AuthData>('POST', '/auth/registro', { nome, email, senha }),
    criarDomicilio: (nome: string, token: string) =>
      request<DomicilioData>('POST', '/auth/domicilio', { nome }, token),
    entrarDomicilio: (codigo_convite: string, token: string) =>
      request<DomicilioData>('POST', '/auth/domicilio/entrar', { codigo_convite }, token),
  },
  dashboard: {
    resumo: async (token: string): Promise<DashboardData> => {
      const raw = await request<RawDashboardResponse>('GET', '/dashboard', undefined, token);
      return {
        saldo: raw.saldo_mes,
        total_receitas: raw.total_receitas,
        total_despesas: raw.total_despesas,
        transacoes_recentes: (raw.ultimas_transacoes ?? []).map((t) => ({
          id: t.id,
          descricao: t.descricao,
          valor: t.valor,
          tipo: t.tipo,
          data: t.data_transacao,
          categoria_id: t.categoria_id,
          categoria_nome: Array.isArray(t.categorias) ? t.categorias[0]?.nome : t.categorias?.nome,
          usuario_nome: Array.isArray(t.usuarios) ? t.usuarios[0]?.nome : t.usuarios?.nome,
        })),
      };
    },
    categorias: async (token: string, mes?: string): Promise<CategoriaData[]> => {
      const raw = await request<RawCategoriaResponse[]>(
        'GET',
        `/dashboard/categorias${mes ? `?mes=${mes}` : ''}`,
        undefined,
        token,
      );
      return raw.map((c) => {
        const cat = Array.isArray(c.categoria) ? c.categoria[0] : c.categoria;
        return {
          categoria_id: cat?.id ?? 'sem_categoria',
          categoria_nome: cat?.nome ?? 'Sem categoria',
          total: c.total,
          cor: cat?.cor,
        };
      });
    },
    divisao: async (token: string, mes: string): Promise<DivisaoData> => {
      const raw = await request<RawDivisaoResponse>(
        'GET',
        `/dashboard/divisao?mes=${mes}`,
        undefined,
        token,
      );
      return {
        total_despesas: raw.total_despesas,
        divisao: (raw.divisao ?? []).map((d) => {
          const u = Array.isArray(d.usuario) ? d.usuario[0] : d.usuario;
          return {
            usuario_id: u?.id ?? '',
            usuario_nome: u?.nome ?? '',
            gasto_real: Number(d.gasto_real ?? 0),
          };
        }),
      };
    },
  },
  transacoes: {
    listar: async (token: string, params?: Record<string, string>): Promise<TransacaoData[]> => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      const result = await request<ListarTransacoesResponse>('GET', `/transacoes${qs}`, undefined, token);
      return result.transacoes.map(t => ({
        id: t.id,
        descricao: t.descricao,
        valor: t.valor,
        tipo: t.tipo,
        data: t.data_transacao,
        categoria_id: t.categoria_id,
        categoria_nome: t.categorias?.nome,
        usuario_nome: t.usuarios?.nome,
      }));
    },
    criar: (data: CriarTransacaoData, token: string) =>
      request<TransacaoData>('POST', '/transacoes', data, token),
    atualizar: (
      id: string,
      data: AtualizarTransacaoData,
      token: string,
    ) => request<TransacaoData>('PUT', `/transacoes/${id}`, data, token),
    deletar: (id: string, token: string) =>
      request<null>('DELETE', `/transacoes/${id}`, undefined, token),
    sugerirCategoria: (data: { descricao: string; valor: number }, token: string) =>
      request<SugestaoCategoria>('POST', '/transacoes/sugerir-categoria', data, token),
  },
  metas: {
    listar: (token: string) =>
      request<MetaData[]>('GET', '/metas', undefined, token),
    criar: (data: CriarMetaData, token: string) =>
      request<MetaData>('POST', '/metas', data, token),
    atualizar: (id: string, data: Partial<CriarMetaData>, token: string) =>
      request<MetaData>('PUT', `/metas/${id}`, data, token),
    deletar: (id: string, token: string) =>
      request<null>('DELETE', `/metas/${id}`, undefined, token),
  },
  categorias: {
    listar: (token: string) =>
      request<CategoriaCatalogo[]>('GET', '/categorias', undefined, token),
  },
};

export interface AuthData {
  access_token: string;
  usuario: UsuarioData;
}

export interface UsuarioData {
  id: string;
  auth_id: string;
  nome: string;
  email: string;
  domicilio_id: string | null;
}

export interface DomicilioData {
  domicilio: { id: string; nome: string; codigo_convite: string };
  usuario: UsuarioData;
}

export interface DashboardData {
  saldo: number;
  total_receitas: number;
  total_despesas: number;
  transacoes_recentes: TransacaoData[];
}

export interface CategoriaData {
  categoria_id: string;
  categoria_nome: string;
  total: number;
  cor?: string;
}

export interface DivisaoMembro {
  usuario_id: string;
  usuario_nome: string;
  gasto_real: number;
}

export interface DivisaoData {
  total_despesas: number;
  divisao: DivisaoMembro[];
}

export interface TransacaoData {
  id: string;
  descricao: string;
  valor: number;
  tipo: 'receita' | 'despesa';
  data: string;
  categoria_id?: string;
  categoria_nome?: string;
  usuario_nome?: string;
}

export interface CriarTransacaoData {
  descricao: string;
  valor: number;
  tipo: 'receita' | 'despesa';
  data_transacao: string;
  categoria_id?: string;
}

export interface SugestaoCategoria {
  categoria_id: string | null;
  categoria_nome: string;
  confianca: number;
}

export interface CategoriaCatalogo {
  id: string;
  nome: string;
  icone?: string | null;
  cor?: string | null;
  eh_padrao: boolean;
  domicilio_id: string | null;
}

// Mantém os mesmos campos editáveis do create, mas SEM `tipo` —
// o tipo (despesa/receita) não é editável por decisão de UX.
export type AtualizarTransacaoData = Omit<Partial<CriarTransacaoData>, 'tipo'>;

export interface MetaData {
  id: string;
  nome: string;
  valor_alvo: number;
  valor_atual: number;
  data_limite?: string;
  icone?: string;
  cor?: string;
}

export interface CriarMetaData {
  nome: string;
  valor_alvo: number;
  data_limite?: string;
  icone?: string;
  cor?: string;
}

interface RawTransacaoData {
  id: string;
  descricao: string;
  valor: number;
  tipo: 'receita' | 'despesa';
  data_transacao: string;
  categoria_id?: string;
  categorias?: { id: string; nome: string; icone?: string; cor?: string } | null;
  usuarios?: { id: string; nome: string } | null;
}

interface ListarTransacoesResponse {
  transacoes: RawTransacaoData[];
  total: number;
  pagina: number;
  limite: number;
}

interface RawDashboardResponse {
  mes_atual: { inicio: string; fim: string };
  saldo_mes: number;
  total_receitas: number;
  total_despesas: number;
  ultimas_transacoes: RawTransacaoData[];
  metas_em_andamento: unknown[];
}

interface RawCategoriaResponse {
  categoria: { id: string; nome: string; icone?: string; cor?: string } | { id: string; nome: string; icone?: string; cor?: string }[] | null;
  total: number;
}

interface RawDivisaoMembro {
  usuario: { id: string; nome: string } | { id: string; nome: string }[] | null;
  gasto_real: number;
  deve_pagar?: number;
}

interface RawDivisaoResponse {
  total_despesas: number;
  divisao: RawDivisaoMembro[];
}
