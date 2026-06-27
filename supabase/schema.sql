-- ============================================================
-- SocialPro — Supabase Schema
-- Execute este arquivo no SQL Editor do Supabase
-- ============================================================

-- Tabela de conexões com redes sociais por usuário
CREATE TABLE IF NOT EXISTS social_connections (
  id                        UUID        DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Identidade do usuário (email vindo do NextAuth)
  user_id                   TEXT        NOT NULL,

  -- Provedor: 'instagram' | 'facebook' | ...
  provider                  TEXT        NOT NULL DEFAULT 'instagram',

  -- Token Meta (long-lived, válido ~60 dias)
  access_token              TEXT        NOT NULL,
  token_expires_at          TIMESTAMPTZ,

  -- Facebook Page vinculada à conta Instagram Business
  facebook_page_id          TEXT,
  facebook_page_name        TEXT,

  -- Instagram Business Account
  instagram_account_id      TEXT,
  instagram_username        TEXT,

  -- Generic Provider Account fields (X, LinkedIn, etc.)
  provider_account_id       TEXT,
  provider_username         TEXT,
  refresh_token             TEXT,

  -- Timestamps
  connected_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at                TIMESTAMPTZ DEFAULT NOW(),

  -- Só uma conexão por provedor por usuário
  CONSTRAINT uq_user_provider UNIQUE (user_id, provider)
);

-- Índice para buscas por user_id
CREATE INDEX IF NOT EXISTS idx_social_connections_user_id
  ON social_connections (user_id);

-- Atualiza updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_social_connections_updated_at
  BEFORE UPDATE ON social_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS: habilita, mas o acesso é feito via service-role key no servidor
ALTER TABLE social_connections ENABLE ROW LEVEL SECURITY;

-- Política permissiva para a service-role (bypass RLS automático)
-- Nenhuma política para usuários anônimos = tabela fechada para o front

-- ============================================================
-- Tabela de carrosséis gerados
-- ============================================================

CREATE TABLE IF NOT EXISTS carousels (
  id                UUID        DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Identidade do usuário (email vindo do NextAuth)
  user_id           TEXT        NOT NULL,

  -- Metadados da geração
  topic             TEXT        NOT NULL,
  tone              TEXT        NOT NULL DEFAULT 'autoridade',
  style             TEXT        NOT NULL DEFAULT 'lifestyle',
  slide_count       INT         NOT NULL DEFAULT 5,

  -- Conteúdo
  slides            JSONB       NOT NULL DEFAULT '[]',
  caption           TEXT,
  cover_image_url   TEXT,

  -- Estado
  status            TEXT        NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft', 'published')),
  platform          TEXT        NOT NULL DEFAULT 'instagram',
  published_at      TIMESTAMPTZ,

  -- Timestamps
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_carousels_user_id
  ON carousels (user_id);

CREATE INDEX IF NOT EXISTS idx_carousels_created_at
  ON carousels (user_id, created_at DESC);

-- Trigger de updated_at (reutiliza a função criada acima)
CREATE OR REPLACE TRIGGER trg_carousels_updated_at
  BEFORE UPDATE ON carousels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE carousels ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Tabela de perfis de criador
-- ============================================================

CREATE TABLE IF NOT EXISTS profiles (
  user_id       TEXT        PRIMARY KEY,
  brand_name    TEXT        NOT NULL DEFAULT '',
  brand_handle  TEXT        NOT NULL DEFAULT '',
  avatar_url    TEXT        NOT NULL DEFAULT '',
  ai_bio        TEXT        NOT NULL DEFAULT '',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Tabela de assinaturas (billing)
-- ============================================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id                        UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id                   TEXT        NOT NULL UNIQUE,

  stripe_customer_id        TEXT,
  stripe_subscription_id    TEXT,
  stripe_price_id           TEXT,

  status                    TEXT        NOT NULL DEFAULT 'free'
                            CHECK (status IN ('free', 'active', 'trialing', 'past_due', 'canceled')),
  plan_id                   TEXT        NOT NULL DEFAULT 'free'
                            CHECK (plan_id IN ('free', 'intro', 'pro', 'agency')),

  carousel_limit            INT         NOT NULL DEFAULT 0,
  carousels_used            INT         NOT NULL DEFAULT 0,

  period_start              TIMESTAMPTZ,
  period_end                TIMESTAMPTZ,

  created_at                TIMESTAMPTZ DEFAULT NOW(),
  updated_at                TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id
  ON subscriptions (user_id);

CREATE OR REPLACE TRIGGER trg_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Incrementa o contador de carrosséis usados de forma atômica
CREATE OR REPLACE FUNCTION increment_carousel_usage(p_user_id TEXT)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE subscriptions
  SET carousels_used = carousels_used + 1
  WHERE user_id = p_user_id;
END;
$$;

-- ============================================================
-- Tabela de posts agendados
-- ============================================================

CREATE TABLE IF NOT EXISTS scheduled_posts (
  id             UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id        TEXT        NOT NULL,
  carousel_id    UUID        REFERENCES carousels(id) ON DELETE CASCADE,
  caption        TEXT,
  scheduled_for  TIMESTAMPTZ NOT NULL,
  status         TEXT        NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending', 'published', 'failed', 'canceled')),
  published_at   TIMESTAMPTZ,
  error_message  TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scheduled_posts_user_id ON scheduled_posts (user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_scheduled_for ON scheduled_posts (scheduled_for);

CREATE OR REPLACE TRIGGER trg_scheduled_posts_updated_at
  BEFORE UPDATE ON scheduled_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Storage bucket para imagens dos carrosséis
-- Execute também no dashboard: Storage → New bucket
-- ============================================================

-- Cria o bucket público (imagens precisam ser acessíveis pelo Instagram)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'carousel-images',
  'carousel-images',
  true,
  10485760,  -- 10 MB
  ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Política: qualquer um pode ler (necessário para o Instagram acessar as imagens)
CREATE POLICY "Public read carousel images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'carousel-images');

-- Política: só o service-role pode fazer upload/delete (feito no servidor)
-- O service-role bypassa RLS automaticamente, sem necessidade de política adicional
