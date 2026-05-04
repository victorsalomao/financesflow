-- ============================================================
-- Migration 004: Função SECURITY DEFINER para criar usuário
-- na tabela usuarios após o registro no Supabase Auth.
-- Necessária porque o admin client com sb_secret_ (opaque token)
-- não tem bypass de RLS no PostgREST desta versão do Supabase.
-- ============================================================

CREATE OR REPLACE FUNCTION fn_criar_usuario(
  p_auth_id   UUID,
  p_nome      TEXT,
  p_email     TEXT
)
RETURNS TABLE (
  id            UUID,
  auth_id       UUID,
  nome          VARCHAR,
  email         VARCHAR,
  criado_em     TIMESTAMPTZ,
  atualizado_em TIMESTAMPTZ
) AS $$
BEGIN
  -- Garante idempotência: se já existir, retorna o existente
  IF EXISTS (SELECT 1 FROM usuarios WHERE auth_id = p_auth_id) THEN
    RETURN QUERY SELECT u.id, u.auth_id, u.nome, u.email, u.criado_em, u.atualizado_em
    FROM usuarios u WHERE u.auth_id = p_auth_id;
    RETURN;
  END IF;

  RETURN QUERY
    INSERT INTO usuarios (auth_id, nome, email)
    VALUES (p_auth_id, p_nome, p_email)
    RETURNING usuarios.id, usuarios.auth_id, usuarios.nome, usuarios.email,
              usuarios.criado_em, usuarios.atualizado_em;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
