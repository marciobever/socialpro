"use client";
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from '@/components/Toast';
import { useTranslations } from 'next-intl';

type FailedPost = {
  id: string;
  error_message: string | null;
  scheduled_for: string;
};

// Polls once on mount for scheduled posts that failed since the user's last visit
// and surfaces each one as a toast — the cron job that publishes them runs in the
// background, so this is the only place the user finds out something went wrong.
export function FailedPostToasts() {
  const { status } = useSession();
  const t = useTranslations('notifications');

  useEffect(() => {
    if (status !== 'authenticated') return;

    fetch('/api/notifications/failed-posts')
      .then(res => (res.ok ? res.json() : { posts: [] }))
      .then((data: { posts?: FailedPost[] }) => {
        for (const post of data.posts ?? []) {
          toast.error(t('publishFailedTitle'), post.error_message || t('publishFailedGeneric'));
        }
      })
      .catch(() => {});
  }, [status, t]);

  return null;
}
