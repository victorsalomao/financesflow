-- Fix: coluna "auth_id" era ambígua entre o RETURNS TABLE e a coluna
-- da tabela usuarios. Solução: prefixar com alias de tabela em todo o corpo.
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
  IF EXISTS (SELECT 1 FROM usuarios u WHERE u.auth_id = p_auth_id) THEN
    RETURN QUERY
      SELECT u.id, u.auth_id, u.nome, u.email, u.criado_em, u.atualizado_em
      FROM usuarios u
      WHERE u.auth_id = p_auth_id;
    RETURN;
  END IF;

  RETURN QUERY
    INSERT INTO usuarios AS u (auth_id, nome, email)
    VALUES (p_auth_id, p_nome, p_email)
    RETURNING u.id, u.auth_id, u.nome, u.email, u.criado_em, u.atualizado_em;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
