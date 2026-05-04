import { supabase, supabaseAuth } from '../../lib/supabase'
import type { RegistroInput, LoginInput, CriarDomicilioInput, EntrarDomicilioInput } from './auth.schema'

function gerarCodigoConvite(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase()
}

export async function registrar(input: RegistroInput) {
  // admin.createUser com email_confirm:true evita envio de email de confirmação
  const { data: authData, error: erroAuth } = await supabase.auth.admin.createUser({
    email: input.email,
    password: input.senha,
    email_confirm: true,
  })
  if (erroAuth || !authData.user) throw new Error(erroAuth?.message ?? 'Erro ao criar conta')

  // Login imediato para obter JWT
  const { data: session, error: erroLogin } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.senha,
  })
  if (erroLogin || !session.session) {
    await supabase.auth.admin.deleteUser(authData.user.id)
    throw new Error('Erro ao iniciar sessão após registro')
  }

  const db = supabaseAuth(session.session.access_token)
  const { data: usuarioRows, error: erroUsuario } = await db.rpc('fn_criar_usuario', {
    p_auth_id: authData.user.id,
    p_nome: input.nome,
    p_email: input.email,
  })

  if (erroUsuario || !usuarioRows?.length) {
    await supabase.auth.admin.deleteUser(authData.user.id)
    throw new Error('Erro ao salvar usuário')
  }

  const u = usuarioRows[0]
  return {
    access_token: session.session.access_token,
    usuario: {
      id: u.id,
      auth_id: u.auth_id,
      nome: u.nome,
      email: u.email,
      domicilio_id: null as string | null,
    },
  }
}

export async function login(input: LoginInput) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.senha,
  })
  if (error || !data.session) throw new Error('Email ou senha incorretos')

  const db = supabaseAuth(data.session.access_token)

  // Busca perfil customizado na tabela usuarios
  const { data: perfil } = await db
    .from('usuarios')
    .select('id, auth_id, nome, email')
    .eq('auth_id', data.user.id)
    .single()

  // Busca domicilio_id via SECURITY DEFINER (contorna RLS de membros_domicilio)
  const { data: domicilioId } = await db.rpc('fn_domicilio_do_usuario')

  return {
    access_token: data.session.access_token,
    usuario: {
      id: perfil?.id ?? data.user.id,
      auth_id: data.user.id,
      nome: perfil?.nome ?? '',
      email: data.user.email ?? '',
      domicilio_id: (domicilioId as string | null) ?? null,
    },
  }
}

export async function criarDomicilio(authId: string, token: string, input: CriarDomicilioInput) {
  const db = supabaseAuth(token)

  const { data: usuario } = await db
    .from('usuarios')
    .select('id, auth_id, nome, email')
    .eq('auth_id', authId)
    .single()
  if (!usuario) throw new Error('Usuário não encontrado')

  // Gera código único
  let codigo = gerarCodigoConvite()
  for (let i = 0; i < 5; i++) {
    const { data: existe } = await db.rpc('fn_convite_existe', { p_codigo: codigo })
    if (!existe) break
    codigo = gerarCodigoConvite()
  }

  const { data, error } = await db.rpc('fn_criar_domicilio', {
    p_nome: input.nome,
    p_codigo: codigo,
    p_usuario_id: usuario.id,
  })
  if (error || !data?.length) throw new Error('Erro ao criar domicílio')

  const dom = data[0]
  return {
    domicilio: {
      id: dom.id as string,
      nome: dom.nome as string,
      codigo_convite: dom.codigo_convite as string,
    },
    usuario: {
      id: usuario.id,
      auth_id: authId,
      nome: usuario.nome,
      email: usuario.email,
      domicilio_id: dom.id as string,
    },
  }
}

export async function entrarDomicilio(authId: string, token: string, input: EntrarDomicilioInput) {
  const db = supabaseAuth(token)

  const { data: usuario } = await db
    .from('usuarios')
    .select('id, auth_id, nome, email')
    .eq('auth_id', authId)
    .single()
  if (!usuario) throw new Error('Usuário não encontrado')

  const { data, error } = await db.rpc('fn_entrar_domicilio', {
    p_codigo: input.codigo_convite,
    p_usuario_id: usuario.id,
  })
  if (error) throw new Error(error.message)
  if (!data?.length) throw new Error('Código de convite inválido')

  const dom = data[0]
  return {
    domicilio: {
      id: dom.id as string,
      nome: dom.nome as string,
      codigo_convite: input.codigo_convite,
    },
    usuario: {
      id: usuario.id,
      auth_id: authId,
      nome: usuario.nome,
      email: usuario.email,
      domicilio_id: dom.id as string,
    },
  }
}
