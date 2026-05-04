-- ============================================================
-- Migration 003: Funções SECURITY DEFINER para operações de
-- bootstrap que precisam operar fora do contexto RLS do usuário
-- (criar domicílio, entrar por convite).
-- ============================================================

-- Cria domicílio e já adiciona o criador como admin em uma transação atômica
CREATE OR REPLACE FUNCTION fn_criar_domicilio(
  p_nome          TEXT,
  p_codigo        TEXT,
  p_usuario_id    UUID
)
RETURNS TABLE (
  id              UUID,
  nome            VARCHAR,
  codigo_convite  VARCHAR,
  criado_em       TIMESTAMPTZ,
  atualizado_em   TIMESTAMPTZ
) AS $$
DECLARE
  v_domicilio_id UUID;
BEGIN
  INSERT INTO domicilios (nome, codigo_convite)
  VALUES (p_nome, p_codigo)
  RETURNING domicilios.id INTO v_domicilio_id;

  INSERT INTO membros_domicilio (usuario_id, domicilio_id, papel)
  VALUES (p_usuario_id, v_domicilio_id, 'admin');

  RETURN QUERY
    SELECT d.id, d.nome, d.codigo_convite, d.criado_em, d.atualizado_em
    FROM domicilios d
    WHERE d.id = v_domicilio_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Entra em um domicílio pelo código de convite
CREATE OR REPLACE FUNCTION fn_entrar_domicilio(
  p_codigo        TEXT,
  p_usuario_id    UUID
)
RETURNS TABLE (
  id    UUID,
  nome  VARCHAR
) AS $$
DECLARE
  v_id   UUID;
  v_nome VARCHAR;
BEGIN
  SELECT d.id, d.nome INTO v_id, v_nome
  FROM domicilios d
  WHERE d.codigo_convite = p_codigo
  LIMIT 1;

  IF v_id IS NULL THEN
    RAISE EXCEPTION 'Código de convite inválido';
  END IF;

  IF EXISTS (
    SELECT 1 FROM membros_domicilio
    WHERE usuario_id = p_usuario_id AND domicilio_id = v_id
  ) THEN
    RAISE EXCEPTION 'Você já faz parte deste domicílio';
  END IF;

  INSERT INTO membros_domicilio (usuario_id, domicilio_id, papel)
  VALUES (p_usuario_id, v_id, 'membro');

  RETURN QUERY SELECT v_id, v_nome;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
