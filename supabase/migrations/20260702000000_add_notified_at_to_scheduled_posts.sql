-- Track whether the user has already been shown a toast for a failed scheduled post
ALTER TABLE public.scheduled_posts
ADD COLUMN IF NOT EXISTS notified_at TIMESTAMPTZ;
