-- Migration to add generic provider columns to social_connections table
ALTER TABLE public.social_connections
ADD COLUMN IF NOT EXISTS provider_account_id text,
ADD COLUMN IF NOT EXISTS provider_username text,
ADD COLUMN IF NOT EXISTS refresh_token text;

-- Create unique index if not exists to avoid duplicate connections
CREATE UNIQUE INDEX IF NOT EXISTS social_connections_user_provider_unique
ON public.social_connections (user_id, provider);
