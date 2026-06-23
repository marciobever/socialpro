"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, Trash2, Plus, Loader2, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

interface ScheduledPost {
  id: string;
  carousel_id: string;
  caption: string | null;
  scheduled_for: string;
  status: 'pending' | 'published' | 'failed' | 'canceled';
  published_at: string | null;
  error_message: string | null;
}

const STATUS_MAP = {
  pending:   { label: 'Agendado',  cls: 'bg-accent-purple/10 border-accent-purple/20 text-accent-purple' },
  published: { label: 'Publicado', cls: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
  failed:    { label: 'Falhou',    cls: 'bg-red-500/10 border-red-500/20 text-red-400' },
  canceled:  { label: 'Cancelado', cls: 'bg-white/5 border-white/10 text-dark-muted' },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function groupByDate(posts: ScheduledPost[]) {
  const groups: Record<string, ScheduledPost[]> = {};
  posts.forEach(p => {
    const date = new Date(p.scheduled_for).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
    if (!groups[date]) groups[date] = [];
    groups[date].push(p);
  });
  return groups;
}

function PostCard({ post, onDelete, deleting }: { post: ScheduledPost; onDelete: (id: string) => void; deleting: boolean }) {
  const status = STATUS_MAP[post.status];
  return (
    <div className="glass-panel rounded-2xl border border-dark-border p-4 flex items-start gap-4 hover:border-white/10 transition-colors">
      <div className="p-2.5 rounded-xl bg-pink-500/10 border border-pink-500/20 flex-shrink-0">
        <Calendar className="h-4 w-4 text-pink-400" />
      </div>
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border tracking-wider ${status.cls}`}>
            {status.label}
          </span>
          <div className="flex items-center gap-1 text-[10px] text-dark-muted">
            <Clock className="h-3 w-3" />
            {formatDate(post.scheduled_for)}
          </div>
        </div>
        {post.caption && (
          <p className="text-xs text-dark-muted line-clamp-2 leading-relaxed">{post.caption}</p>
        )}
        {post.status === 'published' && post.published_at && (
          <div className="flex items-center gap-1 text-[10px] text-emerald-400">
            <CheckCircle2 className="h-3 w-3" />
            Publicado em {formatDate(post.published_at)}
          </div>
        )}
        {post.status === 'failed' && post.error_message && (
          <div className="flex items-center gap-1 text-[10px] text-red-400">
            <AlertCircle className="h-3 w-3" />
            {post.error_message}
          </div>
        )}
      </div>
      {post.status === 'pending' && (
        <button onClick={() => onDelete(post.id)} disabled={deleting}
          className="p-1.5 rounded-lg text-dark-muted hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50 flex-shrink-0">
          {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
        </button>
      )}
    </div>
  );
}

export default function CalendarPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/schedule');
      if (res.ok) { const { posts: p } = await res.json(); setPosts(p ?? []); }
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    await fetch('/api/schedule', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    setPosts(prev => prev.filter(p => p.id !== id));
    setDeleting(null);
  };

  const pending   = posts.filter(p => p.status === 'pending');
  const published = posts.filter(p => p.status === 'published');
  const groups    = groupByDate(pending);

  return (
    <div className="min-h-[calc(100vh-64px)] py-8 px-4 md:px-8 max-w-4xl mx-auto space-y-8 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-text flex items-center gap-2">
            <Calendar className="h-6 w-6 text-accent-purple" />
            Calendário Editorial
          </h1>
          <p className="text-sm text-dark-muted mt-0.5">Posts agendados e histórico de publicações</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dark-border text-xs text-dark-muted hover:text-dark-text hover:bg-white/5 transition-all disabled:opacity-50">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
          <button onClick={() => router.push('/app/dashboard')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-accent-purple to-accent-cyan hover:shadow-[0_0_12px_rgba(139,92,246,0.4)] transition-all">
            <Plus className="h-3.5 w-3.5" /> Criar carrossel
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-accent-purple" />
        </div>
      )}

      {!loading && posts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 space-y-4 text-center">
          <div className="p-4 rounded-2xl bg-accent-purple/10 border border-accent-purple/20">
            <Calendar className="h-8 w-8 text-accent-purple" />
          </div>
          <h2 className="text-lg font-bold text-dark-text">Calendário vazio</h2>
          <p className="text-sm text-dark-muted max-w-sm">
            Gere um carrossel no Estúdio e agende a publicação para uma data específica.
          </p>
          <button onClick={() => router.push('/app/dashboard')}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-accent-purple to-accent-cyan">
            Ir para o Estúdio
          </button>
        </div>
      )}

      {!loading && posts.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Agendados',  value: pending.length,   color: 'text-accent-purple' },
            { label: 'Publicados', value: published.length, color: 'text-emerald-400' },
            { label: 'Total',      value: posts.length,     color: 'text-white' },
          ].map(({ label, value, color }) => (
            <div key={label} className="glass-panel rounded-2xl border border-dark-border p-4 text-center">
              <p className={`text-2xl font-black ${color}`}>{value}</p>
              <p className="text-[10px] text-dark-muted mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {!loading && Object.keys(groups).length > 0 && (
        <div className="space-y-6">
          <h2 className="text-sm font-bold text-dark-text">Próximas publicações</h2>
          {Object.entries(groups).map(([date, datePosts]) => (
            <div key={date} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-accent-cyan capitalize">{date}</span>
                <div className="flex-1 h-px bg-white/5" />
              </div>
              {datePosts.map(post => (
                <PostCard key={post.id} post={post} onDelete={handleDelete} deleting={deleting === post.id} />
              ))}
            </div>
          ))}
        </div>
      )}

      {!loading && published.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-dark-text">Publicados recentemente</h2>
          {published.slice(0, 10).map(post => (
            <PostCard key={post.id} post={post} onDelete={handleDelete} deleting={deleting === post.id} />
          ))}
        </div>
      )}
    </div>
  );
}
