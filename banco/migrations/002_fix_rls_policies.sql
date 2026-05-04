-- ============================================================
-- Migration 002: Correção das políticas RLS
-- Contexto: as chaves sb_publishable_/sb_secret_ são opaque
-- tokens que o PostgREST não reconhece como service_role JWT,
-- então o bypass de RLS via cliente admin não funciona.
-- Solução: políticas específicas por operação + funções
-- SECURITY DEFINER para ops privilegiadas.
-- ============================================================

-- ── domicilios ───────────────────────────────────────────────
-- Qualquer usuário autenticado pode criar um domicílio
CREATE POLICY pol_domicilios_insert ON domicilios
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ── membros_domicilio ────────────────────────────────────────
-- Remove política anterior (baseada em fn_domicilio_do_usuario,
-- que retorna NULL quando o usuário ainda não tem domicílio)
DROP POLICY pol_membros_insert ON membros_domicilio;

-- Usuário só pode inserir a si mesmo como membro
CREATE POLICY pol_membros_insert ON membros_domicilio
  FOR INSERT WITH CHECK (usuario_id = fn_id_do_usuario());

-- ── funções SECURITY DEFINER ─────────────────────────────────
-- Busca domicílio por código de convite (bypassa RLS — necessário
-- porque quem está entrando ainda não pertence a nenhum domicílio)
CREATE OR REPLACE FUNCTION fn_buscar_por_convite(p_codigo TEXT)
RETURNS TABLE (id UUID, nome VARCHAR) AS $$
  SELECT id, nome FROM domicilios WHERE codigo_convite = p_codigo LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Verifica se código de convite já existe (para geração de código único)
CREATE OR REPLACE FUNCTION fn_convite_existe(p_codigo TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM domicilios WHERE codigo_convite = p_codigo);
$$ LANGUAGE sql SECURITY DEFINER;
