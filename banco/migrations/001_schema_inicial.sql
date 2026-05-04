-- ============================================================
-- FinanceFlow — Schema Inicial
-- Migration: 001_schema_inicial.sql
-- ============================================================

-- Extensão para geração de UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Função para atualizar o campo atualizado_em automaticamente
CREATE OR REPLACE FUNCTION fn_atualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- TABELAS
-- ============================================================

-- Usuários (espelho do Supabase Auth)
CREATE TABLE usuarios (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id       UUID UNIQUE NOT NULL,
  nome          VARCHAR(255) NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  avatar_url    TEXT,
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Domicílios (unidade do casal)
CREATE TABLE domicilios (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome            VARCHAR(255) NOT NULL,
  codigo_convite  VARCHAR(20) UNIQUE NOT NULL,
  criado_em       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Relação usuário <-> domicílio
CREATE TABLE membros_domicilio (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id    UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  domicilio_id  UUID NOT NULL REFERENCES domicilios(id) ON DELETE CASCADE,
  papel         VARCHAR(20) NOT NULL DEFAULT 'membro' CHECK (papel IN ('admin', 'membro')),
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (usuario_id, domicilio_id)
);

-- Categorias (padrão globais + customizadas por domicílio)
CREATE TABLE categorias (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  domicilio_id  UUID REFERENCES domicilios(id) ON DELETE CASCADE, -- NULL = categoria padrão do sistema
  nome          VARCHAR(100) NOT NULL,
  icone         VARCHAR(50),
  cor           VARCHAR(7),
  tipo          VARCHAR(10) NOT NULL DEFAULT 'despesa' CHECK (tipo IN ('despesa', 'receita')),
  eh_padrao     BOOLEAN NOT NULL DEFAULT FALSE,
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Contas bancárias / cartões sincronizados
CREATE TABLE contas_bancarias (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  domicilio_id  UUID NOT NULL REFERENCES domicilios(id) ON DELETE CASCADE,
  usuario_id    UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  nome          VARCHAR(255) NOT NULL,
  tipo          VARCHAR(30) NOT NULL CHECK (tipo IN ('corrente', 'poupanca', 'cartao_credito', 'cartao_debito', 'dinheiro')),
  saldo         DECIMAL(15, 2) NOT NULL DEFAULT 0,
  cor           VARCHAR(7),
  icone         VARCHAR(50),
  ativo         BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Transações (coração do sistema)
CREATE TABLE transacoes (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  domicilio_id       UUID NOT NULL REFERENCES domicilios(id) ON DELETE CASCADE,
  usuario_id         UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  conta_bancaria_id  UUID REFERENCES contas_bancarias(id) ON DELETE SET NULL,
  categoria_id       UUID REFERENCES categorias(id) ON DELETE SET NULL,
  descricao          VARCHAR(500) NOT NULL,
  valor              DECIMAL(15, 2) NOT NULL CHECK (valor > 0),
  tipo               VARCHAR(20) NOT NULL CHECK (tipo IN ('despesa', 'receita', 'transferencia')),
  data_transacao     DATE NOT NULL,
  categoria_ia       VARCHAR(100),   -- sugestão retornada pelo microsserviço de IA
  confianca_ia       DECIMAL(4, 3),  -- score entre 0.000 e 1.000
  observacoes        TEXT,
  criado_em          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Metas financeiras conjuntas
CREATE TABLE metas (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  domicilio_id  UUID NOT NULL REFERENCES domicilios(id) ON DELETE CASCADE,
  nome          VARCHAR(255) NOT NULL,
  descricao     TEXT,
  valor_alvo    DECIMAL(15, 2) NOT NULL CHECK (valor_alvo > 0),
  valor_atual   DECIMAL(15, 2) NOT NULL DEFAULT 0,
  data_limite   DATE,
  concluida     BOOLEAN NOT NULL DEFAULT FALSE,
  icone         VARCHAR(50),
  cor           VARCHAR(7),
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Contas recorrentes / boletos com vencimento
CREATE TABLE contas_recorrentes (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  domicilio_id     UUID NOT NULL REFERENCES domicilios(id) ON DELETE CASCADE,
  categoria_id     UUID REFERENCES categorias(id) ON DELETE SET NULL,
  nome             VARCHAR(255) NOT NULL,
  valor            DECIMAL(15, 2) NOT NULL CHECK (valor > 0),
  dia_vencimento   INTEGER NOT NULL CHECK (dia_vencimento BETWEEN 1 AND 31),
  ativa            BOOLEAN NOT NULL DEFAULT TRUE,
  observacoes      TEXT,
  criado_em        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- TRIGGERS — atualizado_em automático
-- ============================================================

CREATE TRIGGER trg_usuarios_atualizado_em
  BEFORE UPDATE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION fn_atualizar_timestamp();

CREATE TRIGGER trg_domicilios_atualizado_em
  BEFORE UPDATE ON domicilios
  FOR EACH ROW EXECUTE FUNCTION fn_atualizar_timestamp();

CREATE TRIGGER trg_membros_domicilio_atualizado_em
  BEFORE UPDATE ON membros_domicilio
  FOR EACH ROW EXECUTE FUNCTION fn_atualizar_timestamp();

CREATE TRIGGER trg_categorias_atualizado_em
  BEFORE UPDATE ON categorias
  FOR EACH ROW EXECUTE FUNCTION fn_atualizar_timestamp();

CREATE TRIGGER trg_contas_bancarias_atualizado_em
  BEFORE UPDATE ON contas_bancarias
  FOR EACH ROW EXECUTE FUNCTION fn_atualizar_timestamp();

CREATE TRIGGER trg_transacoes_atualizado_em
  BEFORE UPDATE ON transacoes
  FOR EACH ROW EXECUTE FUNCTION fn_atualizar_timestamp();

CREATE TRIGGER trg_metas_atualizado_em
  BEFORE UPDATE ON metas
  FOR EACH ROW EXECUTE FUNCTION fn_atualizar_timestamp();

CREATE TRIGGER trg_contas_recorrentes_atualizado_em
  BEFORE UPDATE ON contas_recorrentes
  FOR EACH ROW EXECUTE FUNCTION fn_atualizar_timestamp();


-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE usuarios          ENABLE ROW LEVEL SECURITY;
ALTER TABLE domicilios         ENABLE ROW LEVEL SECURITY;
ALTER TABLE membros_domicilio  ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias         ENABLE ROW LEVEL SECURITY;
ALTER TABLE contas_bancarias   ENABLE ROW LEVEL SECURITY;
ALTER TABLE transacoes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE metas              ENABLE ROW LEVEL SECURITY;
ALTER TABLE contas_recorrentes ENABLE ROW LEVEL SECURITY;

-- Helper: retorna o domicilio_id do usuário autenticado
CREATE OR REPLACE FUNCTION fn_domicilio_do_usuario()
RETURNS UUID AS $$
  SELECT md.domicilio_id
  FROM membros_domicilio md
  INNER JOIN usuarios u ON u.id = md.usuario_id
  WHERE u.auth_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper: retorna o usuarios.id do usuário autenticado
CREATE OR REPLACE FUNCTION fn_id_do_usuario()
RETURNS UUID AS $$
  SELECT id FROM usuarios WHERE auth_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- usuarios: cada usuário acessa apenas o próprio registro
CREATE POLICY pol_usuarios_select ON usuarios
  FOR SELECT USING (auth_id = auth.uid());

CREATE POLICY pol_usuarios_update ON usuarios
  FOR UPDATE USING (auth_id = auth.uid());

-- domicilios: apenas membros do domicílio
CREATE POLICY pol_domicilios_select ON domicilios
  FOR SELECT USING (id = fn_domicilio_do_usuario());

CREATE POLICY pol_domicilios_update ON domicilios
  FOR UPDATE USING (id = fn_domicilio_do_usuario());

-- membros_domicilio: apenas do próprio domicílio
CREATE POLICY pol_membros_select ON membros_domicilio
  FOR SELECT USING (domicilio_id = fn_domicilio_do_usuario());

CREATE POLICY pol_membros_insert ON membros_domicilio
  FOR INSERT WITH CHECK (domicilio_id = fn_domicilio_do_usuario());

CREATE POLICY pol_membros_delete ON membros_domicilio
  FOR DELETE USING (domicilio_id = fn_domicilio_do_usuario());

-- categorias: padrão (sem domicilio_id) visível para todos + customizadas do próprio domicílio
CREATE POLICY pol_categorias_select ON categorias
  FOR SELECT USING (domicilio_id IS NULL OR domicilio_id = fn_domicilio_do_usuario());

CREATE POLICY pol_categorias_insert ON categorias
  FOR INSERT WITH CHECK (domicilio_id = fn_domicilio_do_usuario());

CREATE POLICY pol_categorias_update ON categorias
  FOR UPDATE USING (domicilio_id = fn_domicilio_do_usuario());

CREATE POLICY pol_categorias_delete ON categorias
  FOR DELETE USING (domicilio_id = fn_domicilio_do_usuario());

-- contas_bancarias: apenas do próprio domicílio
CREATE POLICY pol_contas_bancarias_select ON contas_bancarias
  FOR SELECT USING (domicilio_id = fn_domicilio_do_usuario());

CREATE POLICY pol_contas_bancarias_insert ON contas_bancarias
  FOR INSERT WITH CHECK (domicilio_id = fn_domicilio_do_usuario());

CREATE POLICY pol_contas_bancarias_update ON contas_bancarias
  FOR UPDATE USING (domicilio_id = fn_domicilio_do_usuario());

CREATE POLICY pol_contas_bancarias_delete ON contas_bancarias
  FOR DELETE USING (domicilio_id = fn_domicilio_do_usuario());

-- transacoes: apenas do próprio domicílio
CREATE POLICY pol_transacoes_select ON transacoes
  FOR SELECT USING (domicilio_id = fn_domicilio_do_usuario());

CREATE POLICY pol_transacoes_insert ON transacoes
  FOR INSERT WITH CHECK (domicilio_id = fn_domicilio_do_usuario());

CREATE POLICY pol_transacoes_update ON transacoes
  FOR UPDATE USING (domicilio_id = fn_domicilio_do_usuario());

CREATE POLICY pol_transacoes_delete ON transacoes
  FOR DELETE USING (domicilio_id = fn_domicilio_do_usuario());

-- metas: apenas do próprio domicílio
CREATE POLICY pol_metas_select ON metas
  FOR SELECT USING (domicilio_id = fn_domicilio_do_usuario());

CREATE POLICY pol_metas_insert ON metas
  FOR INSERT WITH CHECK (domicilio_id = fn_domicilio_do_usuario());

CREATE POLICY pol_metas_update ON metas
  FOR UPDATE USING (domicilio_id = fn_domicilio_do_usuario());

CREATE POLICY pol_metas_delete ON metas
  FOR DELETE USING (domicilio_id = fn_domicilio_do_usuario());

-- contas_recorrentes: apenas do próprio domicílio
CREATE POLICY pol_contas_recorrentes_select ON contas_recorrentes
  FOR SELECT USING (domicilio_id = fn_domicilio_do_usuario());

CREATE POLICY pol_contas_recorrentes_insert ON contas_recorrentes
  FOR INSERT WITH CHECK (domicilio_id = fn_domicilio_do_usuario());

CREATE POLICY pol_contas_recorrentes_update ON contas_recorrentes
  FOR UPDATE USING (domicilio_id = fn_domicilio_do_usuario());

CREATE POLICY pol_contas_recorrentes_delete ON contas_recorrentes
  FOR DELETE USING (domicilio_id = fn_domicilio_do_usuario());


-- ============================================================
-- ÍNDICES
-- ============================================================

CREATE INDEX idx_membros_usuario    ON membros_domicilio (usuario_id);
CREATE INDEX idx_membros_domicilio  ON membros_domicilio (domicilio_id);
CREATE INDEX idx_transacoes_domicilio ON transacoes (domicilio_id);
CREATE INDEX idx_transacoes_data    ON transacoes (data_transacao DESC);
CREATE INDEX idx_transacoes_categoria ON transacoes (categoria_id);
CREATE INDEX idx_categorias_domicilio ON categorias (domicilio_id);
CREATE INDEX idx_metas_domicilio    ON metas (domicilio_id);
CREATE INDEX idx_contas_rec_domicilio ON contas_recorrentes (domicilio_id);


-- ============================================================
-- SEED — Categorias padrão do sistema (domicilio_id = NULL)
-- ============================================================

INSERT INTO categorias (id, domicilio_id, nome, icone, cor, tipo, eh_padrao) VALUES
  (uuid_generate_v4(), NULL, 'Alimentação',  'utensils',      '#FF6B6B', 'despesa', TRUE),
  (uuid_generate_v4(), NULL, 'Transporte',   'car',           '#4ECDC4', 'despesa', TRUE),
  (uuid_generate_v4(), NULL, 'Moradia',      'home',          '#45B7D1', 'despesa', TRUE),
  (uuid_generate_v4(), NULL, 'Saúde',        'heart-pulse',   '#96CEB4', 'despesa', TRUE),
  (uuid_generate_v4(), NULL, 'Lazer',        'gamepad',       '#FFEAA7', 'despesa', TRUE),
  (uuid_generate_v4(), NULL, 'Educação',     'book-open',     '#DDA0DD', 'despesa', TRUE),
  (uuid_generate_v4(), NULL, 'Vestuário',    'shirt',         '#F0A500', 'despesa', TRUE),
  (uuid_generate_v4(), NULL, 'Receita',      'trending-up',   '#6BCB77', 'receita', TRUE),
  (uuid_generate_v4(), NULL, 'Outros',       'ellipsis',      '#B2BEC3', 'despesa', TRUE);
