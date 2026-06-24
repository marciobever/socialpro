"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import { CarouselCard } from '@/components/cards/CarouselCard';
import { TextPostCard } from '@/components/cards/TextPostCard';
import { Linkedin, Twitter, Instagram } from '@/components/icons';
import type { PlatformType, Slide, CarouselStyleModel } from '@/types';
import {
  Copy, Check, Loader2, Send, X, Info, Clock,
  Download, Plus, RefreshCw, ImageIcon, Wand2, ExternalLink, Calendar, Sparkles, Zap,
  ChevronLeft, ChevronRight, Trash2, Pencil, ChevronDown, AlertTriangle,
} from 'lucide-react';
import { toast, Toaster } from '@/components/Toast';
import { Modal, ConfirmDialog } from '@/components/Modal';

const ease = [0.16, 1, 0.3, 1] as const;
const spring = { type: 'spring' as const, stiffness: 400, damping: 28 };

// ── Contextual inline alert (prerequisites / warnings) ────────────────────────
function ContextAlert({ tone = 'info', children }: { tone?: 'info' | 'warn' | 'ok'; children: React.ReactNode }) {
  const styles = {
    info: 'border-accent-cyan/20 bg-accent-cyan/[0.05] text-white/55',
    warn: 'border-amber-500/25 bg-amber-500/[0.06] text-amber-200/80',
    ok:   'border-emerald-500/25 bg-emerald-500/[0.06] text-emerald-300/80',
  }[tone];
  const Icon = tone === 'warn' ? AlertTriangle : tone === 'ok' ? Check : Info;
  const iconColor = tone === 'warn' ? 'text-amber-400' : tone === 'ok' ? 'text-emerald-400' : 'text-accent-cyan';
  return (
    <div className={`flex items-start gap-2 px-3 py-2 rounded-xl border ${styles}`}>
      <Icon className={`h-3.5 w-3.5 flex-shrink-0 mt-0.5 ${iconColor}`} />
      <p className="text-[10.5px] leading-relaxed">{children}</p>
    </div>
  );
}

// ── Reusable premium panel header ────────────────────────────────────────────
const PanelHeader = React.memo(function PanelHeader({
  icon, label, accent = 'text-white/45', children,
}: {
  icon?: React.ReactNode; label: string; accent?: string; children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] flex-shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        {icon && <span className={`flex-shrink-0 ${accent}`}>{icon}</span>}
        <span className="text-[11px] font-bold text-white/55 uppercase tracking-[0.14em] truncate">{label}</span>
      </div>
      {children && <div className="flex items-center gap-2 flex-shrink-0">{children}</div>}
    </div>
  );
});

// ─── Style definitions ───────────────────────────────────────────────────────

const PHOTO_STYLES: { id: CarouselStyleModel; name: string; swatch: string }[] = [
  { id: 'lifestyle',  name: 'Lifestyle', swatch: 'linear-gradient(135deg,#d97706,#1c1713)' },
  { id: 'tech',       name: 'Cyber',     swatch: 'linear-gradient(135deg,#8b5cf6,#06b6d4)' },
  { id: 'alert',      name: 'Alerta',    swatch: 'linear-gradient(135deg,#7f1d1d,#f59e0b)' },
  { id: 'minimalist', name: 'Minimal',   swatch: 'linear-gradient(135deg,#0b0c10,#374151)' },
  { id: 'feminino',   name: 'Feminino',  swatch: 'linear-gradient(135deg,#f43f5e,#ec4899,#f9a8d4)' },
  { id: 'neutro',     name: 'Neutro',    swatch: 'linear-gradient(135deg,#d4b896,#f5f0e8,#c9a87a)' },
  { id: 'retro',      name: 'Retrô',     swatch: 'linear-gradient(135deg,#92400e,#b45309,#fbbf24)' },
];

const AVATAR_STYLES: { id: CarouselStyleModel; name: string; swatch: string }[] = [
  { id: 'infantil',   name: 'Infantil',  swatch: 'linear-gradient(135deg,#fb923c,#facc15,#4ade80)' },
  { id: 'pixar',      name: '3D Pixar',  swatch: 'linear-gradient(135deg,#60a5fa,#a78bfa,#f472b6)' },
  { id: 'anime',      name: 'Anime',     swatch: 'linear-gradient(135deg,#f472b6,#fb923c,#facc15)' },
  { id: 'aquarela',   name: 'Aquarela',  swatch: 'linear-gradient(135deg,#7dd3fc,#86efac,#fde68a)' },
  { id: 'flat',       name: 'Flat Art',  swatch: 'linear-gradient(135deg,#10b981,#3b82f6,#8b5cf6)' },
  { id: 'cartoon',    name: 'Cartoon',   swatch: 'linear-gradient(135deg,#ef4444,#f97316,#facc15)' },
];

const AVATAR_IDS: CarouselStyleModel[] = AVATAR_STYLES.map(s => s.id);

// One-line contextual description per visual style (pt — matches dashboard copy)
const STYLE_DESC: Record<string, string> = {
  lifestyle:  'Fotografia real, tom quente e aspiracional',
  tech:       'Futurista, neon e grid cibernético',
  alert:      'Urgência e impacto, vermelho/âmbar',
  minimalist: 'Limpo, escuro e elegante',
  feminino:   'Suave, rosado e delicado',
  neutro:     'Bege sóbrio e atemporal',
  retro:      'Vintage âmbar, vibe anos 80',
  aquarela:   'Pintura suave em tons pastel',
  infantil:   'Avatar ilustrado e lúdico',
  pixar:      'Avatar 3D estilo animação',
  anime:      'Avatar estilo mangá/anime',
  flat:       'Avatar flat art geométrico',
  cartoon:    'Avatar cartoon expressivo',
};

function StyleChip({ name, swatch, active, disabled, onClick, title }: {
  id: CarouselStyleModel; name: string; swatch: string;
  active: boolean; disabled: boolean; onClick: () => void; title?: string;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      whileTap={{ scale: 0.95 }}
      transition={spring}
      className={`group relative flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-[11px] font-semibold border transition-all disabled:opacity-50 cursor-pointer ${
        active
          ? 'border-accent-purple/60 bg-accent-purple/[0.14] text-white shadow-[0_0_0_1px_rgba(139,92,246,0.3),0_0_14px_rgba(139,92,246,0.18)]'
          : 'border-white/[0.07] bg-white/[0.03] text-white/45 hover:text-white/85 hover:border-white/[0.16] hover:bg-white/[0.05]'
      }`}
    >
      <span
        className={`w-3 h-3 rounded-md flex-shrink-0 transition-transform group-hover:scale-110 ${active ? 'ring-1 ring-white/40' : ''}`}
        style={{ background: swatch }}
      />
      <span className="truncate">{name}</span>
    </motion.button>
  );
}

// 8 estilos de foto + 1 trigger de avatar = 9 total (3×3)
const PHOTO_STYLES_9: { id: CarouselStyleModel; name: string; swatch: string }[] = [
  { id: 'lifestyle',  name: 'Lifestyle', swatch: 'linear-gradient(135deg,#d97706,#1c1713)' },
  { id: 'tech',       name: 'Cyber',     swatch: 'linear-gradient(135deg,#8b5cf6,#06b6d4)' },
  { id: 'alert',      name: 'Alerta',    swatch: 'linear-gradient(135deg,#7f1d1d,#f59e0b)' },
  { id: 'minimalist', name: 'Minimal',   swatch: 'linear-gradient(135deg,#0b0c10,#374151)' },
  { id: 'feminino',   name: 'Feminino',  swatch: 'linear-gradient(135deg,#f43f5e,#ec4899,#f9a8d4)' },
  { id: 'neutro',     name: 'Neutro',    swatch: 'linear-gradient(135deg,#d4b896,#f5f0e8,#c9a87a)' },
  { id: 'retro',      name: 'Retrô',     swatch: 'linear-gradient(135deg,#92400e,#b45309,#fbbf24)' },
  { id: 'aquarela',   name: 'Aquarela',  swatch: 'linear-gradient(135deg,#7dd3fc,#86efac,#fde68a)' },
  // slot 9 = Infantil (avatar toggle) — adicionado inline no StylePicker
];

const AVATAR_STYLES_SUB: { id: CarouselStyleModel; name: string; swatch: string }[] = [
  { id: 'infantil', name: 'Infantil', swatch: 'linear-gradient(135deg,#fb923c,#facc15,#4ade80)' },
  { id: 'pixar',    name: '3D Pixar', swatch: 'linear-gradient(135deg,#60a5fa,#a78bfa,#f472b6)' },
  { id: 'anime',    name: 'Anime',    swatch: 'linear-gradient(135deg,#f472b6,#fb923c,#facc15)' },
  { id: 'flat',     name: 'Flat Art', swatch: 'linear-gradient(135deg,#10b981,#3b82f6,#8b5cf6)' },
  { id: 'cartoon',  name: 'Cartoon',  swatch: 'linear-gradient(135deg,#ef4444,#f97316,#facc15)' },
];
const AVATAR_IDS_SUB = AVATAR_STYLES_SUB.map(s => s.id);

function StylePicker({ styleModel, onSelect, disabled }: {
  styleModel: CarouselStyleModel;
  onSelect: (s: CarouselStyleModel) => void;
  disabled: boolean;
}) {
  const tStyles = useTranslations('styles');
  const [open, setOpen] = React.useState(true);
  const isAvatar = AVATAR_IDS_SUB.includes(styleModel);

  // Find active style for header display
  const activeStyle =
    PHOTO_STYLES_9.find(s => s.id === styleModel) ??
    AVATAR_STYLES_SUB.find(s => s.id === styleModel) ??
    PHOTO_STYLES_9[0];

  return (
    <div className="rounded-3xl border border-white/[0.07] overflow-hidden flex-shrink-0" style={{ background: '#181b25' }}>
      {/* Header colapsável */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-6 h-6 rounded-lg flex-shrink-0 ring-1 ring-white/15" style={{ background: activeStyle.swatch }} />
          <div className="text-left leading-tight min-w-0">
            <span className="text-[11px] font-bold text-white/65 uppercase tracking-[0.14em] block">Estilo visual</span>
            <span className="text-[11px] text-white/85 font-semibold truncate block">{tStyles(activeStyle.id as Parameters<typeof tStyles>[0])}</span>
          </div>
        </div>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-white/30 text-[10px] flex-shrink-0"
        >▼</motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="p-3 space-y-3 border-t border-white/[0.06]">
              {/* Grid 3×3 de fotos + Infantil como 9º slot */}
              <div className="grid grid-cols-3 gap-2">
                {PHOTO_STYLES_9.map(s => (
                  <StyleChip
                    key={s.id}
                    {...s}
                    name={tStyles(s.id as Parameters<typeof tStyles>[0])}
                    title={STYLE_DESC[s.id]}
                    active={styleModel === s.id}
                    disabled={disabled}
                    onClick={() => onSelect(s.id)}
                  />
                ))}
                {/* Infantil — 9º slot, toggle de avatar */}
                <StyleChip
                  id="infantil"
                  name="Avatar"
                  swatch="linear-gradient(135deg,#fb923c,#facc15,#4ade80)"
                  title="Ativar estilos de avatar ilustrado"
                  active={isAvatar}
                  disabled={disabled}
                  onClick={() => onSelect(isAvatar ? 'lifestyle' : 'infantil')}
                />
              </div>

              {/* Sub-estilos de avatar — aparecem quando isAvatar */}
              <AnimatePresence>
                {isAvatar && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="pt-2 border-t border-white/[0.06]">
                      <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mb-2 px-0.5">Estilo do Avatar</p>
                      <div className="grid grid-cols-3 gap-2">
                        {AVATAR_STYLES_SUB.map(s => (
                          <StyleChip
                            key={s.id}
                            {...s}
                            name={tStyles(s.id as Parameters<typeof tStyles>[0])}
                            title={STYLE_DESC[s.id]}
                            active={styleModel === s.id}
                            disabled={disabled}
                            onClick={() => onSelect(s.id)}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Contextual description of the active style */}
              <div className="flex items-start gap-2 px-2.5 py-2 rounded-xl bg-accent-purple/[0.05] border border-accent-purple/[0.12]">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-purple flex-shrink-0 mt-1" />
                <p className="text-[10px] text-white/55 leading-relaxed">
                  {STYLE_DESC[styleModel] ?? 'Define o visual gerado em todos os slides.'}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const FORMATS: { id: PlatformType; label: string; icon: React.FC<{ className?: string }>; color: string }[] = [
  { id: 'instagram', label: 'Instagram',  icon: Instagram, color: 'text-pink-400'  },
  { id: 'x',         label: 'X / Twitter', icon: Twitter,   color: 'text-sky-400'   },
  { id: 'linkedin',  label: 'LinkedIn',    icon: Linkedin,  color: 'text-blue-400'  },
];

const GRADIENTS = [
  'linear-gradient(135deg,#4f46e5,#7c3aed,#c084fc)',
  'linear-gradient(135deg,#0891b2,#06b6d4,#22d3ee)',
  'linear-gradient(135deg,#f97316,#ea580c,#f43f5e)',
  'linear-gradient(135deg,#a855f7,#ec4899,#f43f5e)',
  'linear-gradient(135deg,#059669,#10b981,#34d399)',
  'linear-gradient(135deg,#111827,#1f2937,#374151)',
  'linear-gradient(135deg,#7c3aed,#4f46e5,#0891b2)',
  'linear-gradient(135deg,#dc2626,#ea580c,#f59e0b)',
];

function PublishModal({ platform, open, onClose }: { platform: PlatformType; open: boolean; onClose: () => void }) {
  const label = FORMATS.find(f => f.id === platform)?.label ?? platform;
  const tPub = useTranslations('publish');
  const publishSteps = [tPub('connect'), tPub('configure'), tPub('authorize')];
  return (
    <Modal
      open={open}
      onClose={onClose}
      icon={<Send className="h-5 w-5" />}
      title={`${tPub('title')} ${label}`}
      description={tPub('subtitle')}
      footer={
        <button onClick={onClose} className="w-full py-2.5 rounded-xl text-[13px] font-bold text-white bg-gradient-to-r from-accent-purple to-accent-cyan cursor-pointer">
          {tPub('understood')}
        </button>
      }
    >
      <div className="space-y-2">
        {publishSteps.map((s, i) => (
          <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <span className="h-5 w-5 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
              <Clock className="h-3 w-3 text-amber-400" />
            </span>
            <span className="text-[12px] text-white/55">{s}</span>
          </div>
        ))}
        <div className="p-3 rounded-xl bg-accent-cyan/5 border border-accent-cyan/15 flex gap-2 mt-1">
          <Info className="h-3.5 w-3.5 text-accent-cyan flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-white/55 leading-relaxed">{tPub('comingSoon')}</p>
        </div>
      </div>
    </Modal>
  );
}

const SlideQuickAction = React.memo(function SlideQuickAction({ icon, title, onClick, danger }: {
  icon: React.ReactNode; title: string; onClick: () => void; danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={e => { e.stopPropagation(); onClick(); }}
      className={`h-6 w-6 rounded-lg flex items-center justify-center backdrop-blur-md border transition-colors cursor-pointer ${
        danger
          ? 'bg-black/50 border-white/15 text-white/70 hover:bg-rose-500/90 hover:text-white hover:border-rose-400'
          : 'bg-black/50 border-white/15 text-white/70 hover:bg-white/20 hover:text-white'
      }`}
    >
      {icon}
    </button>
  );
});

const SlideCard = React.memo(function SlideCard({
  slide, index, isActive, total, isOutdated,
  onSelect, onDelete, onRegenerate, onDuplicate, canDuplicate,
}: {
  slide: Slide; index: number; isActive: boolean; total: number; isOutdated: boolean;
  onSelect: (i: number) => void; onDelete: (i: number) => void; onRegenerate: (i: number) => void;
  onDuplicate: (i: number) => void; canDuplicate: boolean;
}) {
  const canRegen = !!(slide.imageUrl && slide.imagePrompt);
  return (
    <div className="relative group">
      <button
        onClick={() => onSelect(index)}
        className={`relative w-full aspect-[4/5] rounded-2xl overflow-hidden border transition-all duration-200 block cursor-pointer ${
          isActive
            ? 'border-accent-purple shadow-[0_0_0_2px_rgba(139,92,246,0.25),0_10px_30px_rgba(139,92,246,0.18)] z-10'
            : 'border-white/[0.08] hover:border-accent-purple/45 hover:shadow-[0_6px_20px_rgba(0,0,0,0.5)]'
        }`}
      >
        {slide.imageUrl ? (
          <motion.img
            key={slide.imageUrl}
            initial={{ opacity: 0, scale: 1.06, filter: 'blur(12px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.6, ease }}
            src={slide.imageUrl}
            alt={slide.title}
            className="w-full h-full object-cover"
          />
        ) : slide.isGeneratingImage ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2" style={{ background: '#14161e' }}>
            <Loader2 className="h-5 w-5 text-accent-purple animate-spin" />
            <span className="text-[9px] text-white/40 font-semibold">Gerando...</span>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col justify-between p-3" style={{ background: slide.background }}>
            <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Slide {index + 1}</span>
            <div className="space-y-1">
              <p className="text-[11px] font-extrabold text-white leading-tight line-clamp-3" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.5)' }}>{slide.title || 'Título'}</p>
              <p className="text-[9px] text-white/75 leading-snug line-clamp-2">{slide.subtitle}</p>
            </div>
          </div>
        )}

        {/* Top scrim for legible controls on image slides */}
        <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-black/45 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        {/* Number badge */}
        <span className="absolute top-2 left-2 text-[9px] font-black text-white bg-black/60 backdrop-blur-sm rounded-md px-1.5 py-0.5 leading-tight tabular-nums">
          {index + 1}<span className="text-white/45">/{total}</span>
        </span>

        {/* Outdated dot */}
        {isOutdated && (
          <span className="absolute bottom-2 left-2 flex items-center gap-1 text-[8px] font-bold text-amber-300 bg-black/55 backdrop-blur-sm rounded-md px-1.5 py-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]" /> editado
          </span>
        )}

        {/* Selected check */}
        {isActive && !isOutdated && (
          <span className="absolute bottom-2 left-2 h-4 w-4 rounded-full bg-accent-purple flex items-center justify-center shadow-[0_0_10px_rgba(139,92,246,0.6)]">
            <Check className="h-2.5 w-2.5 text-white" />
          </span>
        )}

        {/* Missing image indicator */}
        {!slide.imageUrl && !slide.isGeneratingImage && (
          <div className="absolute bottom-2 right-2 p-1 rounded-md bg-black/40 border border-white/10">
            <ImageIcon className="h-3 w-3 text-white/40" />
          </div>
        )}
      </button>

      {/* Hover quick actions */}
      <div className="absolute top-2 right-2 z-20 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {canRegen && <SlideQuickAction icon={<RefreshCw className="h-3 w-3" />} title="Regerar imagem" onClick={() => onRegenerate(index)} />}
        {canDuplicate && <SlideQuickAction icon={<Copy className="h-3 w-3" />} title="Duplicar slide" onClick={() => onDuplicate(index)} />}
        {total > 1 && <SlideQuickAction icon={<X className="h-3 w-3" />} title="Excluir slide" onClick={() => onDelete(index)} danger />}
      </div>
    </div>
  );
});

// ── Painel de instruções (coluna direita vazia) ──────────────────────────────
function InstructionsPanel({ brandName, hasActivePlan, hasTopic }: {
  brandName: string; hasActivePlan: boolean; hasTopic: boolean;
}) {
  const profileDone = !!brandName && !['', 'Seu Nome', 'Meu perfil'].includes(brandName);

  const checklist = [
    { done: profileDone,   label: 'Perfil e Brand Kit configurados', hint: 'Nome, @ e identidade visual' },
    { done: hasActivePlan, label: 'Plano ativo',                     hint: 'Necessário para gerar com IA' },
    { done: hasTopic,      label: 'Tema do carrossel definido',      hint: 'Descreva no painel à esquerda' },
  ];
  const doneCount = checklist.filter(c => c.done).length;
  const progress = Math.round((doneCount / checklist.length) * 100);

  const steps = [
    { n: '01', icon: <Sparkles className="h-4 w-4" />, color: 'text-accent-cyan',   title: 'Escolha a plataforma e o estilo', desc: 'Selecione Instagram, X ou LinkedIn. Depois defina o visual: Lifestyle, Cyber, Feminino...' },
    { n: '02', icon: <Wand2    className="h-4 w-4" />, color: 'text-accent-purple', title: 'Descreva o tema do carrossel',       desc: 'Seja específico. Ex: "5 erros que destroem seu alcance no Instagram em 2025"' },
    { n: '03', icon: <Zap      className="h-4 w-4" />, color: 'text-accent-cyan',   title: 'Clique em Gerar carrossel',         desc: 'A IA pesquisa, cria os textos de cada slide e gera as imagens com GPT-Image-2.' },
    { n: '04', icon: <Copy     className="h-4 w-4" />, color: 'text-accent-purple', title: 'Revise e edite',                    desc: 'Clique num slide para editar o título e texto. Regenere imagens individualmente.' },
    { n: '05', icon: <Send     className="h-4 w-4" />, color: 'text-accent-cyan',   title: 'Baixe ou publique',                 desc: 'Baixe todos os slides, copie a legenda gerada e publique onde quiser.' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-8 min-h-0 flex items-center justify-center" style={{ scrollbarWidth: 'thin' }}>
      <div className="w-full max-w-md space-y-7">
        {/* Header */}
        <div className="space-y-2 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-accent-purple/25 bg-accent-purple/[0.07] text-[10px] font-bold uppercase tracking-[0.16em] text-accent-purple">
            <Sparkles className="h-3 w-3" /> Bem-vindo ao estúdio
          </span>
          <h2 className="font-display text-2xl font-extrabold text-white">Crie seu primeiro carrossel</h2>
          <p className="text-sm text-white/45 leading-relaxed">Conteúdo profissional com IA em menos de 1 minuto.</p>
        </div>

        {/* Getting-started checklist */}
        <div className="rounded-2xl border border-white/[0.07] p-4 space-y-3" style={{ background: '#14161e' }}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-white/70 uppercase tracking-[0.12em]">Primeiros passos</span>
            <span className="text-[10px] font-bold text-accent-cyan tabular-nums">{doneCount}/{checklist.length}</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-accent-purple to-accent-cyan transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <div className="space-y-2 pt-1">
            {checklist.map((c, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <span className={`h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 border ${
                  c.done ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' : 'bg-white/[0.03] border-white/[0.10] text-white/20'
                }`}>
                  {c.done ? <Check className="h-3 w-3" /> : <span className="h-1.5 w-1.5 rounded-full bg-white/20" />}
                </span>
                <div className="min-w-0">
                  <p className={`text-[12px] font-semibold leading-tight ${c.done ? 'text-white/70 line-through decoration-white/20' : 'text-white/75'}`}>{c.label}</p>
                  <p className="text-[10px] text-white/35">{c.hint}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How it works (compact) */}
        <div className="space-y-0">
          {steps.map((s, i) => (
            <div key={i} className="flex gap-3.5 group">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                  i === 0 ? 'border-accent-purple/40 bg-accent-purple/10' : 'border-white/[0.08] bg-white/[0.03]'
                } ${s.color}`}>
                  {s.icon}
                </div>
                {i < steps.length - 1 && <div className="w-px flex-1 my-1.5" style={{ background: 'rgba(255,255,255,0.06)', minHeight: 18 }} />}
              </div>
              <div className={`${i === steps.length - 1 ? 'pb-0' : 'pb-5'}`}>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-bold text-white/20 tabular-nums">{s.n}</span>
                  <h3 className="text-[13px] font-semibold text-white/80">{s.title}</h3>
                </div>
                <p className="text-[11.5px] text-white/35 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tip */}
        <div className="p-4 rounded-2xl border border-accent-purple/15 flex items-start gap-3" style={{ background: 'rgba(139,92,246,0.06)' }}>
          <Sparkles className="h-4 w-4 text-accent-purple flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[12px] font-semibold text-white/70 mb-0.5">Dica de ouro</p>
            <p className="text-[11px] text-white/40 leading-relaxed">
              Quanto mais específico o tema, melhor o resultado. Inclua números, emoções ou problemas reais do seu público.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardPage() {
  const t = useTranslations('dashboard');
  const tPublish = useTranslations('publish');
  const searchParams = useSearchParams();
  const {
    platform, setPlatform,
    tone, setTone,
    content, setContent,
    slides, setSlides,
    activeSlideIndex, setActiveSlideIndex,
    isGenerating,
    styleModel, setStyleModel,
    watermarkType, setWatermarkType,
    brandKit,
    carouselTopic, setCarouselTopic,
    carouselSlideCount, setCarouselSlideCount,
    referenceImage, setReferenceImage,
    isGeneratingCarousel, lastCarouselSource,
    handleGenerateCarousel, handleRegenerateSlideImage, handleRegenerateAllImages,
    handleRefineCaption, handleGenerateTextPost,
    subscription,
    upgradeModalOpen, setUpgradeModalOpen, upgradeReason,
    loadSubscription,
  } = useAppContext();

  // Load carousel from history when ?load=<id> is in the URL
  React.useEffect(() => {
    const carouselId = searchParams?.get('load');
    if (!carouselId) return;
    fetch(`/api/carousels/${carouselId}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data?.carousel) return;
        const { carousel } = data;
        const dbSlides: Slide[] = (carousel.slides ?? []).map((s: Slide) => ({
          ...s,
          isGeneratingImage: false,
        }));
        if (dbSlides.length) {
          setSlides(dbSlides);
          setActiveSlideIndex(0);
          if (carousel.topic) setCarouselTopic(carousel.topic);
          if (carousel.caption) setContent(carousel.caption);
          setPlatform('instagram');
        }
      })
      .catch(console.error);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [copied,           setCopied]           = React.useState(false);
  const [showPublish,      setShowPublish]       = React.useState(false);
  const [isExportingAll,   setIsExportingAll]   = React.useState(false);
  const [isRegeneratingAll, setIsRegeneratingAll] = React.useState(false);
  const [outdatedSlideIds, setOutdatedSlideIds] = React.useState<Set<string>>(new Set());
  const [confirmDeleteIndex, setConfirmDeleteIndex] = React.useState<number | null>(null);

  // Instagram publish state machine
  type PublishState = 'idle' | 'publishing' | 'success' | 'error';
  const [publishState,   setPublishState]   = React.useState<PublishState>('idle');
  const [publishError,   setPublishError]   = React.useState('');
  const [publishPermalink, setPublishPermalink] = React.useState('');

  // Caption variations
  const [captionVariations, setCaptionVariations] = React.useState<{angle: string; caption: string}[]>([]);
  const [loadingVariations,  setLoadingVariations]  = React.useState(false);
  const [showVariations,     setShowVariations]     = React.useState(false);

  // Schedule
  const [showSchedule,  setShowSchedule]  = React.useState(false);
  const [scheduleDate,  setScheduleDate]  = React.useState('');
  const [schedulingSave, setSchedulingSave] = React.useState(false);
  const [scheduleOk,    setScheduleOk]    = React.useState(false);

  // Refine (with presets)
  const [isRefining,     setIsRefining]     = React.useState(false);
  const [showRefineMenu, setShowRefineMenu] = React.useState(false);

  const isCarousel    = platform === 'instagram';
  const readyToPublish = isCarousel ? slides.some(s => s.imageUrl) : content.trim().length > 0;
  const activeSlide   = slides[activeSlideIndex];
  const imagesReady   = slides.filter(s => s.imageUrl).length;
  const missingImages = isCarousel ? Math.max(slides.length - imagesReady, 0) : 0;

  const REFINE_PRESETS = [
    { label: 'Mais persuasivo', instruction: 'Torne o texto muito mais persuasivo e convincente.' },
    { label: 'Mais curto',      instruction: 'Reduza o texto pela metade, mantendo só o essencial.' },
    { label: 'Mais emocional',  instruction: 'Aumente a carga emocional e a conexão com o leitor.' },
    { label: 'Mais autoridade', instruction: 'Use um tom de autoridade com dados e credibilidade.' },
  ];

  // Generic refine runner — optional preset instruction
  const runRefine = async (instruction?: string) => {
    if (!content.trim() || isRefining) return;
    setShowRefineMenu(false);
    setIsRefining(true);
    const tid = toast.loading(instruction ? 'Refinando legenda…' : 'Refinando com IA…', instruction);
    try {
      const res = await fetch('/api/ai/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, tone, aiBio: brandKit.aiBio, instruction }),
      });
      toast.dismiss(tid);
      if (!res.ok) throw new Error('falha');
      const data = await res.json();
      if (data?.refinedText) {
        setContent(data.refinedText);
        toast.success('Legenda refinada', instruction ? undefined : 'A IA reescreveu seu texto');
      } else {
        throw new Error('vazio');
      }
    } catch {
      toast.dismiss(tid);
      toast.error('Não foi possível refinar', 'Tente novamente em instantes.');
    } finally {
      setIsRefining(false);
    }
  };

  // Toast when the carousel structure finishes generating
  const prevGenRef = React.useRef(isGeneratingCarousel);
  React.useEffect(() => {
    if (prevGenRef.current && !isGeneratingCarousel && slides.length > 0) {
      toast.success('Carrossel gerado', 'Gerando as imagens dos slides…');
    }
    prevGenRef.current = isGeneratingCarousel;
  }, [isGeneratingCarousel, slides.length]);

  const handleGenerateVariations = async () => {
    if (!slides.length && !content.trim()) return;
    setLoadingVariations(true);
    setShowVariations(true);
    try {
      const res = await fetch('/api/ai/caption-variations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: carouselTopic,
          tone,
          slides: slides.map(s => ({ title: s.title, subtitle: s.subtitle })),
          aiBio: brandKit.aiBio,
        }),
      });
      if (res.ok) {
        const { variations } = await res.json();
        setCaptionVariations(variations ?? []);
        toast.success('3 versões geradas', 'Escolha a que mais combina');
      } else { throw new Error('falha'); }
    } catch { toast.error('Erro ao gerar versões'); }
    finally { setLoadingVariations(false); }
  };

  const handleSchedulePost = async () => {
    if (!scheduleDate) return;
    setSchedulingSave(true);
    try {
      // Find the current carousel ID from the URL
      const urlParams = new URLSearchParams(window.location.search);
      const carouselId = urlParams.get('load');
      const res = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carouselId, caption: content, scheduledFor: new Date(scheduleDate).toISOString() }),
      });
      if (res.ok) {
        setScheduleOk(true);
        toast.success('Publicação agendada', new Date(scheduleDate).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }));
        setTimeout(() => { setScheduleOk(false); setShowSchedule(false); }, 2000);
      } else { throw new Error('falha'); }
    } catch { toast.error('Erro ao agendar', 'Verifique a data e tente novamente.'); }
    finally { setSchedulingSave(false); }
  };

  const handleCopyCaption = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success('Legenda copiada');
      setTimeout(() => setCopied(false), 1800);
    } catch { toast.error('Não foi possível copiar'); }
  };

  const renderGradientSlide = (slide: Slide, index: number): HTMLCanvasElement | null => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080; canvas.height = 1350;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const grad = ctx.createLinearGradient(0, 0, 0, 1350);
    grad.addColorStop(0, '#0b0c10'); grad.addColorStop(1, '#171923');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, 1080, 1350);
    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 64px sans-serif';
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText(slide?.title || '', 80, 260);
    return canvas;
  };

  const handleDownloadAll = async () => {
    if (isExportingAll) return;
    setIsExportingAll(true);
    try {
      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        const link = document.createElement('a');
        link.download = `socialpro-slide-${i + 1}.png`;
        link.href = slide?.imageUrl ?? (renderGradientSlide(slide, i)?.toDataURL('image/png') ?? '');
        link.click();
        await new Promise(r => setTimeout(r, 350));
      }
      toast.success('Download concluído', `${slides.length} slides baixados`);
    } finally { setIsExportingAll(false); }
  };

  const handleDownloadActive = () => {
    const slide = slides[activeSlideIndex];
    const link = document.createElement('a');
    link.download = `socialpro-slide-${activeSlideIndex + 1}.png`;
    link.href = slide?.imageUrl ?? (renderGradientSlide(slide, activeSlideIndex)?.toDataURL('image/png') ?? '');
    link.click();
    toast.success('Slide baixado', `Slide ${activeSlideIndex + 1}`);
  };

  const handlePublishToInstagram = async () => {
    if (publishState === 'publishing') return;
    setPublishState('publishing');
    setPublishError('');
    setPublishPermalink('');
    try {
      const res = await fetch('/api/instagram/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slides: slides.map(s => ({ imageUrl: s.imageUrl ?? '', title: s.title, subtitle: s.subtitle })),
          caption: content,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? 'Erro ao publicar.');
      setPublishState('success');
      if (data.permalink) setPublishPermalink(data.permalink);
      toast.success('Publicado no Instagram', 'Seu carrossel já está no ar 🎉');
      // Reset after 8s
      setTimeout(() => { setPublishState('idle'); setPublishPermalink(''); }, 8000);
    } catch (err) {
      setPublishState('error');
      setPublishError(err instanceof Error ? err.message : 'Erro desconhecido.');
      toast.error('Falha ao publicar', err instanceof Error ? err.message : undefined);
      setTimeout(() => setPublishState('idle'), 6000);
    }
  };

  const handleRegenerateSlide = (slideId: string, title: string, subtitle: string, imagePrompt: string) => {
    setOutdatedSlideIds(prev => { const next = new Set(prev); next.delete(slideId); return next; });
    handleRegenerateSlideImage(slideId, title, subtitle, imagePrompt);
    toast.info('Regerando imagem do slide…');
  };

  const handleRegenerateAll = async () => {
    if (isRegeneratingAll) return;
    setIsRegeneratingAll(true);
    setOutdatedSlideIds(new Set());
    toast.info('Regerando todas as imagens…');
    try {
      await handleRegenerateAllImages();
    } finally {
      setIsRegeneratingAll(false);
    }
  };

  const handleAddSlide = () => {
    if (slides.length >= 8) return;
    const newSlide: Slide = {
      id: Math.random().toString(36).slice(2, 9),
      title: `Slide ${slides.length + 1}`,
      subtitle: 'Texto de apoio do slide.',
      background: GRADIENTS[slides.length % GRADIENTS.length],
      imagePrompt: carouselTopic ? `Professional illustration related to "${carouselTopic}"` : 'Abstract professional illustration, dark premium aesthetic',
    };
    const newCount = slides.length + 1;
    setSlides([...slides, newSlide]);
    setActiveSlideIndex(slides.length);
    setCarouselSlideCount(newCount);
  };

  const handleDeleteSlide = (index: number) => {
    if (slides.length <= 1) return;
    const updated = slides.filter((_, i) => i !== index);
    setSlides(updated);
    setCarouselSlideCount(updated.length);
    if (activeSlideIndex >= updated.length) setActiveSlideIndex(updated.length - 1);
  };

  const handleDuplicateSlide = (index: number) => {
    if (slides.length >= 8) return;
    const src = slides[index];
    if (!src) return;
    const copy: Slide = {
      ...src,
      id: Math.random().toString(36).slice(2, 9),
      imageUrl: undefined,        // copy text/prompt but force a fresh image
      isGeneratingImage: false,
    };
    const updated = [...slides.slice(0, index + 1), copy, ...slides.slice(index + 1)];
    setSlides(updated);
    setCarouselSlideCount(updated.length);
    setActiveSlideIndex(index + 1);
  };

  const handleMoveSlide = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= slides.length) return;
    const updated = [...slides];
    [updated[index], updated[target]] = [updated[target], updated[index]];
    setSlides(updated);
    setActiveSlideIndex(target);
  };

  const handleUpdateActiveSlide = (field: 'title' | 'subtitle', value: string) => {
    const updated = slides.map((s, i) => (i === activeSlideIndex ? { ...s, [field]: value } : s));
    setSlides(updated);
  };

  // ── Stable per-index callbacks for memoized SlideCard ──────────────────────
  // Refs keep handlers identity-stable so editing the caption/topic does not
  // re-render the 8 slide cards.
  const slidesRef = React.useRef(slides);
  slidesRef.current = slides;
  const regenRef = React.useRef(handleRegenerateSlideImage);
  regenRef.current = handleRegenerateSlideImage;

  const selectSlide = React.useCallback((i: number) => setActiveSlideIndex(i), [setActiveSlideIndex]);
  const requestDeleteSlide = React.useCallback((i: number) => setConfirmDeleteIndex(i), []);
  const duplicateSlideStable = React.useCallback((i: number) => {
    const cur = slidesRef.current;
    if (cur.length >= 8) return;
    const src = cur[i];
    if (!src) return;
    const copy: Slide = { ...src, id: Math.random().toString(36).slice(2, 9), imageUrl: undefined, isGeneratingImage: false };
    const updated = [...cur.slice(0, i + 1), copy, ...cur.slice(i + 1)];
    setSlides(updated);
    setCarouselSlideCount(updated.length);
    setActiveSlideIndex(i + 1);
  }, [setSlides, setCarouselSlideCount, setActiveSlideIndex]);
  const regenerateSlideStable = React.useCallback((i: number) => {
    const s = slidesRef.current[i];
    if (!s) return;
    setOutdatedSlideIds(prev => { const n = new Set(prev); n.delete(s.id); return n; });
    regenRef.current(s.id, s.title, s.subtitle, s.imagePrompt || '');
    toast.info('Regerando imagem do slide…');
  }, []);

  // ── Tiny plan badge (replaces the big bar) ───────────────────────────────
  const PlanBadge = subscription ? (() => {
    const used      = subscription.carousels_used;
    const limit     = subscription.carousel_limit;
    const remaining = Math.max(limit - used, 0);
    const isEmpty   = limit === 0 || !['active', 'trialing'].includes(subscription.status);
    const isWarning = !isEmpty && remaining <= 3;
    const planLabels: Record<string, string> = { free: 'Free', intro: 'Intro', pro: 'Pro', agency: 'Agency' };
    const planLabel = planLabels[subscription.plan_id] ?? subscription.plan_id;
    return (
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border bg-accent-purple/8 border-accent-purple/20 text-accent-purple tracking-wider">
          {planLabel}
        </span>
        <span className={`text-[11px] font-semibold ${isEmpty ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-white/35'}`}>
          {isEmpty ? 'Sem plano' : `${remaining}/${limit} gerações`}
        </span>
        {(isWarning || remaining === 0 || isEmpty) && (
          <button onClick={() => setUpgradeModalOpen(true)} className="text-[10px] font-bold text-accent-cyan hover:text-accent-cyan/80 transition-colors cursor-pointer">
            Upgrade →
          </button>
        )}
      </div>
    );
  })() : null;

  return (
    <>
      <Toaster />
      <PublishModal platform={platform} open={showPublish} onClose={() => setShowPublish(false)} />

      {/* ── App layout: fixed-viewport shell on desktop, document flow on mobile ── */}
      <div className="flex flex-col gap-3 py-3 lg:h-[calc(100dvh-92px)] lg:overflow-hidden">

        {/* ── Studio bar: title + plan badge ── */}
        <div className="flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-xl bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5 text-accent-purple" />
            </div>
            <div className="leading-tight">
              <h1 className="text-[13px] font-bold text-white">Estúdio de Criação</h1>
              <p className="text-[10px] text-white/35">{isCarousel ? 'Carrossel para Instagram' : platform === 'x' ? 'Post para X / Twitter' : 'Post para LinkedIn'}</p>
            </div>
          </div>
          {PlanBadge}
        </div>

        {/* ── Main grid: LEFT controls | CENTER slides | RIGHT caption+publish ── */}
        <div
          className={`flex-1 grid gap-4 min-h-0 ${isCarousel ? 'grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)_340px]' : 'grid-cols-1 max-w-2xl mx-auto w-full'}`}
        >
          {/* ── Left column: controls ── */}
          <div className="flex flex-col gap-4 min-h-0 lg:overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.06) transparent' }}>

            {/* Card 1: Channel selector */}
            <div className="rounded-3xl border border-white/[0.07] flex-shrink-0 p-3 space-y-2.5" style={{ background: '#181b25' }}>
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.16em] px-0.5">Canal de publicação</span>
              <div className="flex gap-1 p-1 rounded-2xl bg-black/30 border border-white/[0.04]">
                {FORMATS.map(f => {
                  const Icon = f.icon;
                  const active = platform === f.id;
                  return (
                    <motion.button
                      key={f.id}
                      onClick={() => setPlatform(f.id)}
                      whileTap={{ scale: 0.96 }}
                      transition={spring}
                      className={`relative flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-semibold transition-colors cursor-pointer ${
                        active ? 'text-white' : 'text-white/35 hover:text-white/65'
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="channel-active-pill"
                          transition={spring}
                          className="absolute inset-0 rounded-xl bg-white/[0.07] border border-white/[0.1] shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
                        />
                      )}
                      <Icon className={`relative z-10 h-3.5 w-3.5 flex-shrink-0 ${active ? f.color : ''}`} />
                      <span className="relative z-10 hidden lg:inline">{f.label}</span>
                      <span className="relative z-10 lg:hidden">{f.label.split(' ')[0]}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {isCarousel && <StylePicker styleModel={styleModel} onSelect={setStyleModel} disabled={isGeneratingCarousel} />}
            <div className="flex-shrink-0">
              {isCarousel ? (
                <CarouselCard
                  slides={slides} activeSlideIndex={activeSlideIndex}
                  onUpdateSlides={setSlides} onSetActiveSlide={setActiveSlideIndex}
                  styleModel={styleModel} onUpdateStyleModel={setStyleModel}
                  watermarkType={watermarkType} onUpdateWatermarkType={setWatermarkType}
                  brandName={brandKit.brandName} brandHandle={brandKit.brandHandle} avatarUrl={brandKit.avatarUrl}
                  carouselTopic={carouselTopic} onUpdateCarouselTopic={setCarouselTopic}
                  carouselSlideCount={carouselSlideCount} onUpdateCarouselSlideCount={setCarouselSlideCount}
                  isGeneratingCarousel={isGeneratingCarousel} lastCarouselSource={lastCarouselSource}
                  onGenerateCarousel={handleGenerateCarousel} onRegenerateSlideImage={handleRegenerateSlideImage}
                  tone={tone} onUpdateTone={setTone}
                  referenceImage={referenceImage} onUpdateReferenceImage={setReferenceImage}
                />
              ) : (
                <TextPostCard
                  platform={platform} topic={carouselTopic} onUpdateTopic={setCarouselTopic}
                  tone={tone} onUpdateTone={setTone} content={content} onUpdateContent={setContent}
                  isGenerating={isGenerating} onGenerate={handleGenerateTextPost} onRefine={handleRefineCaption}
                />
              )}
            </div>

          </div>

          {/* ── CENTER column: instruções (vazio) ou slides ── */}
          <div className={`flex flex-col min-h-0 ${isCarousel ? 'max-lg:min-h-[480px]' : ''}`}>

        {/* Instruções enquanto não há slides */}
        {isCarousel && slides.length === 0 && !isGeneratingCarousel && (
          <InstructionsPanel
            brandName={brandKit.brandName}
            hasActivePlan={subscription ? ['active', 'trialing'].includes(subscription.status) : false}
            hasTopic={carouselTopic.trim().length > 0}
          />
        )}

        {/* ── Slides grid ── */}
        {isCarousel && (slides.length > 0 || isGeneratingCarousel) && (
          <div className="flex-1 flex flex-col rounded-3xl border border-white/[0.07] overflow-hidden min-h-0" style={{ background: '#181b25' }}>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-sm font-bold text-white flex-shrink-0">{t('slides')}</span>
                <span className="flex items-center gap-2 text-[11px] text-white/40 px-2.5 py-1 rounded-lg border border-white/[0.06] flex-shrink-0" style={{ background: '#14161e' }}>
                  <span className="font-semibold text-white/60">{slides.length}</span> slides
                  <span className="h-3 w-px bg-white/[0.08]" />
                  {/* Progress dots */}
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-12 rounded-full bg-white/[0.08] overflow-hidden">
                      <span
                        className="block h-full rounded-full bg-gradient-to-r from-accent-purple to-accent-cyan transition-all duration-500"
                        style={{ width: `${slides.length ? (imagesReady / slides.length) * 100 : 0}%` }}
                      />
                    </span>
                    <span className="text-[10px] text-white/45 tabular-nums">{imagesReady}/{slides.length}</span>
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden md:flex items-center gap-1 text-[10px] font-medium text-white/30 mr-1">
                  {isGeneratingCarousel || isRegeneratingAll
                    ? <><Loader2 className="h-3 w-3 animate-spin text-accent-cyan" /> gerando…</>
                    : <><Check className="h-3 w-3 text-emerald-400/70" /> salvo automaticamente</>}
                </span>
                <motion.button
                  onClick={handleDownloadAll}
                  disabled={isExportingAll || !readyToPublish}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold border border-white/[0.08] text-white/50 hover:text-white hover:border-white/[0.15] disabled:opacity-35 transition-colors cursor-pointer"
                >
                  {isExportingAll ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                  <span className="hidden sm:inline">{t('downloadImages')}</span>
                </motion.button>
                <motion.button
                  onClick={handleRegenerateAll}
                  disabled={isRegeneratingAll || isGeneratingCarousel}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold border border-white/[0.08] text-white/50 hover:text-accent-purple hover:border-accent-purple/30 disabled:opacity-35 transition-colors cursor-pointer"
                >
                  {isRegeneratingAll ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                  <span className="hidden sm:inline">{t('regenerateAll')}</span>
                </motion.button>
              </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
              {/* ── Mosaico 8 slots fixos ── */}
              <div className="grid grid-cols-4 gap-2.5">
                {Array.from({ length: 8 }, (_, slotIdx) => {
                  const slide      = slides[slotIdx];
                  const isActive   = slotIdx < carouselSlideCount; // dentro do count configurado
                  const isSelected = slotIdx === activeSlideIndex;

                  // Slot inativo (além do count) — expande o carrossel ao clicar
                  if (!isActive) {
                    const isNext = slotIdx === carouselSlideCount; // primeiro slot logo após o count
                    return (
                      <button key={slotIdx}
                        className={`group aspect-[4/5] rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                          isNext
                            ? 'border-dashed border-white/[0.10] hover:border-accent-purple/50 hover:bg-accent-purple/[0.04]'
                            : 'border-white/[0.04] hover:border-white/[0.10]'
                        }`}
                        style={{ background: '#11131b' }}
                        onClick={() => setCarouselSlideCount(slotIdx + 1)}
                        title={`Expandir para ${slotIdx + 1} slides`}
                      >
                        <Plus className={`h-4 w-4 transition-all ${isNext ? 'text-white/25 group-hover:text-accent-purple group-hover:scale-110' : 'text-white/[0.08]'}`} />
                        <span className={`text-[9px] font-bold ${isNext ? 'text-white/25' : 'text-white/[0.08]'}`}>{slotIdx + 1}</span>
                      </button>
                    );
                  }

                  // Slot ativo gerando (skeleton)
                  if (isGeneratingCarousel && !slide) {
                    return (
                      <div key={slotIdx}
                        className="aspect-[4/5] rounded-2xl border border-white/[0.08] overflow-hidden shimmer flex items-center justify-center"
                        style={{ background: '#14161e', animationDelay: `${slotIdx * 80}ms` }}
                      >
                        <span className="text-[9px] font-bold text-white/15 tabular-nums">{slotIdx + 1}</span>
                      </div>
                    );
                  }

                  // Slot ativo mas sem slide ainda — placeholder de adicionar
                  if (!slide) {
                    return (
                      <button key={slotIdx} onClick={handleAddSlide}
                        className="group aspect-[4/5] rounded-2xl border-2 border-dashed border-white/[0.10] hover:border-accent-purple/50 hover:bg-accent-purple/[0.04] flex flex-col items-center justify-center gap-1.5 transition-all text-white/25 hover:text-accent-purple cursor-pointer p-2">
                        <span className="h-7 w-7 rounded-xl border border-white/[0.10] group-hover:border-accent-purple/40 flex items-center justify-center transition-colors">
                          <Plus className="h-4 w-4 group-hover:scale-110 transition-transform" />
                        </span>
                        <span className="text-[9px] font-bold text-center leading-tight">Adicionar<br/>slide {slotIdx + 1}</span>
                      </button>
                    );
                  }

                  // Slide real
                  return (
                    <SlideCard
                      key={slide.id}
                      slide={slide} index={slotIdx} isActive={isSelected} total={carouselSlideCount}
                      isOutdated={outdatedSlideIds.has(slide.id)}
                      canDuplicate={slides.length < 8}
                      onSelect={selectSlide}
                      onDelete={requestDeleteSlide}
                      onDuplicate={duplicateSlideStable}
                      onRegenerate={regenerateSlideStable}
                    />
                  );
                })}
              </div>

            </div>

            {/* ── 4.4 — Editor contextual do slide selecionado ── */}
            {activeSlide && !isGeneratingCarousel && (
              <div className="flex-shrink-0 border-t border-white/[0.06] p-4 space-y-2.5" style={{ background: '#14161e' }}>
                {/* Toolbar */}
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-white/55">
                    <Pencil className="h-3.5 w-3.5 text-accent-purple" />
                    Editando · Slide {activeSlideIndex + 1}<span className="text-white/30">/{carouselSlideCount}</span>
                  </span>
                  <div className="flex items-center gap-1">
                    <button title="Mover para a esquerda" disabled={activeSlideIndex === 0}
                      onClick={() => handleMoveSlide(activeSlideIndex, -1)}
                      className="h-7 w-7 rounded-lg flex items-center justify-center border border-white/[0.08] text-white/45 hover:text-white hover:border-white/[0.18] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer">
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </button>
                    <button title="Mover para a direita" disabled={activeSlideIndex >= carouselSlideCount - 1}
                      onClick={() => handleMoveSlide(activeSlideIndex, 1)}
                      className="h-7 w-7 rounded-lg flex items-center justify-center border border-white/[0.08] text-white/45 hover:text-white hover:border-white/[0.18] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer">
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                    <span className="h-4 w-px bg-white/[0.08] mx-0.5" />
                    <button title="Duplicar slide" disabled={slides.length >= 8}
                      onClick={() => handleDuplicateSlide(activeSlideIndex)}
                      className="h-7 w-7 rounded-lg flex items-center justify-center border border-white/[0.08] text-white/45 hover:text-accent-cyan hover:border-accent-cyan/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer">
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button title="Baixar este slide"
                      onClick={handleDownloadActive}
                      className="h-7 w-7 rounded-lg flex items-center justify-center border border-white/[0.08] text-white/45 hover:text-white hover:border-white/[0.18] transition-colors cursor-pointer">
                      <Download className="h-3.5 w-3.5" />
                    </button>
                    <button title="Excluir slide" disabled={slides.length <= 1}
                      onClick={() => setConfirmDeleteIndex(activeSlideIndex)}
                      className="h-7 w-7 rounded-lg flex items-center justify-center border border-white/[0.08] text-white/45 hover:text-rose-400 hover:border-rose-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Title + subtitle editors */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                  <input
                    value={activeSlide.title}
                    onChange={e => handleUpdateActiveSlide('title', e.target.value)}
                    placeholder={t('titlePlaceholder')}
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2 text-[12px] font-semibold text-white outline-none placeholder:text-white/25 focus:border-accent-purple/40 transition-colors"
                  />
                  <input
                    value={activeSlide.subtitle}
                    onChange={e => handleUpdateActiveSlide('subtitle', e.target.value)}
                    placeholder={t('subtitlePlaceholder')}
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2 text-[12px] text-white/80 outline-none placeholder:text-white/25 focus:border-accent-purple/40 transition-colors"
                  />
                </div>

                {/* Regenerate this slide's image */}
                {activeSlide.imagePrompt && (
                  <motion.button
                    onClick={() => handleRegenerateSlide(activeSlide.id, activeSlide.title, activeSlide.subtitle, activeSlide.imagePrompt || '')}
                    disabled={activeSlide.isGeneratingImage}
                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} transition={spring}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-bold text-white border border-accent-purple/30 bg-accent-purple/[0.08] hover:bg-accent-purple/[0.14] disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    {activeSlide.isGeneratingImage
                      ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Gerando imagem...</>
                      : <><RefreshCw className="h-3.5 w-3.5" />{activeSlide.imageUrl ? 'Regerar imagem deste slide' : 'Gerar imagem deste slide'}</>}
                  </motion.button>
                )}
              </div>
            )}
          </div>
        )}

        {/* old legenda removed — agora está na coluna direita */}
        {false && (
        <div>
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
            <span className="text-[11px] font-bold text-white/50 uppercase tracking-widest">Legenda do post</span>
            {isCarousel && <span className="text-[11px] text-white/25 tabular-nums">{content.length} caracteres</span>}
          </div>
          {isCarousel && (
              <div className="p-4 space-y-3">
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="w-full h-36 bg-transparent outline-none resize-none text-sm text-white/75 leading-relaxed placeholder:text-white/18 font-normal"
                  placeholder={t('captionPlaceholder')}
                />
                <div className="flex items-center gap-2 pt-3 border-t border-white/[0.05]">
                  <motion.button
                    onClick={handleRefineCaption}
                    disabled={isGenerating || !content.trim()}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold text-white bg-gradient-to-r from-accent-purple to-accent-cyan disabled:opacity-40 hover:shadow-[0_0_16px_rgba(139,92,246,0.35)] transition-shadow cursor-pointer"
                  >
                    {isGenerating ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />{t('refining')}</> : <><Wand2 className="h-3.5 w-3.5" />{t('refine')}</>}
                  </motion.button>
                  <motion.button
                    onClick={handleGenerateVariations}
                    disabled={loadingVariations || !slides.length}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold border border-white/[0.08] text-white/45 hover:text-accent-cyan hover:border-accent-cyan/30 disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    {loadingVariations ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                    3 versões
                  </motion.button>
                  <motion.button
                    onClick={handleCopyCaption}
                    disabled={!content.trim()}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold border border-white/[0.08] text-white/45 hover:text-white hover:border-white/[0.15] disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    {copied ? <><Check className="h-3.5 w-3.5 text-emerald-400" />{t('copied')}</> : <><Copy className="h-3.5 w-3.5" />{t('copy')}</>}
                  </motion.button>
                </div>

                {/* Variations */}
                <AnimatePresence>
                  {showVariations && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25, ease }}
                      className="space-y-2 overflow-hidden"
                    >
                      <div className="flex items-center justify-between pt-2 border-t border-white/[0.05]">
                        <span className="text-[11px] font-bold text-accent-cyan">3 variações de legenda</span>
                        <button onClick={() => setShowVariations(false)} className="text-white/30 hover:text-white transition-colors"><X className="h-3.5 w-3.5" /></button>
                      </div>
                      {loadingVariations && <div className="flex justify-center py-3"><Loader2 className="h-5 w-5 animate-spin text-accent-purple" /></div>}
                      {captionVariations.map((v, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.06, ease }}
                          className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-accent-purple/30 cursor-pointer transition-colors space-y-1"
                          onClick={() => { setContent(v.caption); setShowVariations(false); }}
                        >
                          <span className="text-[9px] font-bold text-accent-purple uppercase tracking-wider">{v.angle}</span>
                          <p className="text-[11px] text-white/50 leading-relaxed line-clamp-3">{v.caption}</p>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
          )}
        </div>
        )}

          </div>{/* center column */}

          {/* ── RIGHT column: Legenda (fixo) + Preview (flex-1) + Publicar (fixo) ── */}
          {isCarousel && (
            <div className="flex flex-col gap-3 min-h-0">

              {/* ── 5.1 Legenda do post — editor premium ── */}
              <div className="rounded-3xl border border-white/[0.07] overflow-hidden flex-shrink-0" style={{ background: '#181b25' }}>
                <PanelHeader label="Legenda do post">
                  <span className={`text-[10px] tabular-nums ${content.length > 2200 ? 'text-amber-400' : 'text-white/30'}`}>{content.length} / 2.200</span>
                </PanelHeader>
                <div className="p-3 space-y-3">
                  <div className="rounded-2xl border border-white/[0.06] bg-black/20 focus-within:border-accent-purple/30 transition-colors p-3">
                    <textarea
                      value={content}
                      onChange={e => setContent(e.target.value)}
                      className="w-full h-20 bg-transparent outline-none resize-none text-[13px] text-white/80 leading-relaxed placeholder:text-white/20 font-normal"
                      placeholder={t('captionPlaceholder')}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    {/* 5.2 Refinar — botão dividido com presets */}
                    <div className="relative flex gap-2">
                      <motion.button onClick={() => runRefine()} disabled={isRefining || !content.trim()}
                        whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }} transition={spring}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-bold text-white bg-gradient-to-r from-accent-purple to-accent-cyan disabled:opacity-40 shadow-[0_4px_16px_rgba(139,92,246,0.25)] hover:shadow-[0_6px_24px_rgba(139,92,246,0.45)] transition-shadow cursor-pointer">
                        {isRefining ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />{t('refining')}</> : <><Wand2 className="h-3.5 w-3.5" />{t('refine')}</>}
                      </motion.button>
                      <button onClick={() => setShowRefineMenu(v => !v)} disabled={isRefining || !content.trim()}
                        title="Opções de refinamento"
                        className="px-2.5 rounded-xl border border-accent-purple/30 bg-accent-purple/[0.08] text-white/70 hover:text-white hover:bg-accent-purple/[0.16] disabled:opacity-40 transition-colors cursor-pointer">
                        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showRefineMenu ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {showRefineMenu && (
                          <motion.div
                            initial={{ opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.97 }}
                            transition={{ duration: 0.16, ease }}
                            className="absolute top-full right-0 mt-2 w-52 z-30 rounded-2xl border border-white/[0.10] p-1.5 shadow-[0_20px_48px_-12px_rgba(0,0,0,0.8)] glass-panel-heavy"
                          >
                            <p className="text-[9px] font-bold text-white/35 uppercase tracking-widest px-2.5 py-1.5">Refinar como…</p>
                            {REFINE_PRESETS.map(p => (
                              <button key={p.label} onClick={() => runRefine(p.instruction)}
                                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-[12px] font-semibold text-white/65 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer text-left">
                                <Sparkles className="h-3 w-3 text-accent-purple flex-shrink-0" />{p.label}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* 5.3 Versões + copiar */}
                    <div className="grid grid-cols-2 gap-2">
                      <motion.button onClick={handleGenerateVariations} disabled={loadingVariations || !slides.length}
                        whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }} transition={spring}
                        title="Gera 3 ângulos diferentes da legenda"
                        className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-semibold border border-white/[0.08] text-white/45 hover:text-accent-cyan hover:border-accent-cyan/30 disabled:opacity-40 transition-colors cursor-pointer">
                        {loadingVariations ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                        3 versões
                      </motion.button>
                      <motion.button onClick={handleCopyCaption} disabled={!content.trim()}
                        whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }} transition={spring}
                        className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-semibold border transition-colors disabled:opacity-40 cursor-pointer ${
                          copied ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400' : 'border-white/[0.08] text-white/45 hover:text-white hover:border-white/[0.15]'
                        }`}>
                        {copied ? <><Check className="h-3.5 w-3.5" />{t('copied')}</> : <><Copy className="h-3.5 w-3.5" />{t('copy')}</>}
                      </motion.button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {showVariations && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.22, ease }} className="space-y-2 overflow-hidden">
                        <div className="flex items-center justify-between pt-2 border-t border-white/[0.05]">
                          <span className="text-[10px] font-bold text-accent-cyan flex items-center gap-1.5"><Sparkles className="h-3 w-3" />Escolha uma versão</span>
                          <button onClick={() => setShowVariations(false)} className="text-white/30 hover:text-white transition-colors"><X className="h-3.5 w-3.5" /></button>
                        </div>
                        {loadingVariations && <div className="flex justify-center py-3"><Loader2 className="h-5 w-5 animate-spin text-accent-purple" /></div>}
                        {captionVariations.map((v, i) => (
                          <motion.button key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, ease }}
                            className="w-full text-left p-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-accent-purple/40 hover:bg-accent-purple/[0.04] cursor-pointer transition-colors space-y-0.5 group/var"
                            onClick={() => { setContent(v.caption); setShowVariations(false); toast.success('Versão aplicada'); }}>
                            <span className="text-[9px] font-bold text-accent-purple uppercase tracking-wider flex items-center justify-between">
                              {v.angle}
                              <span className="text-[8px] text-white/30 opacity-0 group-hover/var:opacity-100 transition-opacity">aplicar →</span>
                            </span>
                            <p className="text-[11px] text-white/45 leading-relaxed line-clamp-3">{v.caption}</p>
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* ── Preview de post (flex-1) ── */}
              <div className="flex-1 flex flex-col rounded-3xl border border-white/[0.07] overflow-hidden min-h-0 max-lg:min-h-[420px]" style={{ background: '#181b25' }}>
                <PanelHeader label={`Preview — ${platform === 'instagram' ? 'Instagram' : platform === 'x' ? 'X / Twitter' : 'LinkedIn'}`}>
                  <span className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-400 uppercase tracking-wide">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />ao vivo
                  </span>
                </PanelHeader>
                <div className="flex-1 overflow-y-auto p-3 flex items-start justify-center" style={{ scrollbarWidth: 'thin' }}>
                  {/* Mock post card */}
                  <div className="w-full rounded-2xl border border-white/[0.07] overflow-hidden" style={{ background: '#13151d' }}>
                    {/* Profile header */}
                    <div className="flex items-center gap-2.5 px-3 py-2.5 border-b border-white/[0.05]">
                      {brandKit.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={brandKit.avatarUrl} alt="" className="h-7 w-7 rounded-full object-cover flex-shrink-0 border border-white/[0.1]" />
                      ) : (
                        <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-accent-purple to-accent-cyan flex items-center justify-center flex-shrink-0">
                          <span className="text-[8px] font-bold text-white">{(brandKit.brandName || 'SP').slice(0,2).toUpperCase()}</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-white/80 truncate">{brandKit.brandName || 'Seu Nome'}</p>
                        <p className="text-[9px] text-white/35">{brandKit.brandHandle || '@handle'}</p>
                      </div>
                      <div className="text-white/20">···</div>
                    </div>

                    {/* Image area — mostra o slide selecionado, com navegação */}
                    {(() => {
                      const previewSlide = slides[activeSlideIndex] ?? slides[0];
                      return (
                        <div className="aspect-square w-full relative overflow-hidden group/prev">
                          {/* Loading overlay while this slide's image is being generated */}
                          {previewSlide?.isGeneratingImage && (
                            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-black/55 backdrop-blur-[2px]">
                              <Loader2 className="h-6 w-6 text-accent-purple animate-spin" />
                              <span className="text-[10px] font-semibold text-white/70">Gerando imagem…</span>
                            </div>
                          )}
                          {previewSlide?.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={previewSlide.imageUrl} alt="" className="w-full h-full object-cover" />
                          ) : previewSlide?.background ? (
                            <div className="w-full h-full flex flex-col justify-between p-4" style={{ background: previewSlide.background }}>
                              <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">
                                {brandKit.brandHandle || '@handle'}
                              </span>
                              <div className="space-y-1">
                                <p className="text-[13px] font-black text-white leading-tight line-clamp-3" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.5)' }}>{previewSlide.title || 'Título do slide'}</p>
                                <p className="text-[10px] text-white/75 line-clamp-2">{previewSlide.subtitle}</p>
                              </div>
                            </div>
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-2" style={{ background: '#14161e' }}>
                              <ImageIcon className="h-6 w-6 text-white/15" />
                              <span className="text-[11px] text-white/25">Gere o carrossel para o preview</span>
                            </div>
                          )}

                          {/* Slide counter */}
                          {slides.length > 1 && (
                            <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-sm">
                              <span className="text-[8px] text-white font-bold tabular-nums">{activeSlideIndex + 1}/{slides.length}</span>
                            </div>
                          )}

                          {/* Prev / next navigation */}
                          {slides.length > 1 && (
                            <>
                              <button
                                onClick={() => setActiveSlideIndex(Math.max(activeSlideIndex - 1, 0))}
                                disabled={activeSlideIndex === 0}
                                className="absolute left-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-black/55 backdrop-blur-sm border border-white/15 text-white flex items-center justify-center opacity-0 group-hover/prev:opacity-100 disabled:opacity-0 transition-opacity cursor-pointer"
                              >
                                <ChevronLeft className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setActiveSlideIndex(Math.min(activeSlideIndex + 1, slides.length - 1))}
                                disabled={activeSlideIndex >= slides.length - 1}
                                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-black/55 backdrop-blur-sm border border-white/15 text-white flex items-center justify-center opacity-0 group-hover/prev:opacity-100 disabled:opacity-0 transition-opacity cursor-pointer"
                              >
                                <ChevronRight className="h-4 w-4" />
                              </button>
                            </>
                          )}

                          {/* Dots */}
                          {slides.length > 1 && (
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1">
                              {slides.map((s, i) => (
                                <button key={s.id} onClick={() => setActiveSlideIndex(i)}
                                  className={`h-1.5 rounded-full transition-all ${i === activeSlideIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70'}`} />
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Engagement row — por plataforma */}
                    {platform === 'instagram' ? (
                      <div className="px-3 py-2 space-y-1.5">
                        <div className="flex items-center gap-3 text-white/40">
                          <span className="text-[14px]">♥</span>
                          <span className="text-[14px]">💬</span>
                          <span className="text-[14px]">➤</span>
                          <span className="ml-auto text-[14px]">⊡</span>
                        </div>
                        <p className="text-[10px] font-bold text-white/60">127 curtidas</p>
                        <p className="text-[10px] text-white/50 line-clamp-2 leading-relaxed">
                          <span className="font-bold text-white/70">{brandKit.brandHandle || '@handle'}</span>{' '}
                          {content || 'A legenda aparecerá aqui após gerar...'}
                        </p>
                        {content && <p className="text-[10px] text-white/30">mais</p>}
                      </div>
                    ) : platform === 'x' ? (
                      <div className="px-3 py-2 space-y-1.5">
                        <p className="text-[10px] text-white/55 line-clamp-3 leading-relaxed">
                          {content || 'Texto do tweet aparecerá aqui...'}
                        </p>
                        <div className="flex items-center gap-4 text-white/30 pt-1">
                          <span className="text-[11px]">💬 12</span>
                          <span className="text-[11px]">↻ 34</span>
                          <span className="text-[11px]">♥ 218</span>
                        </div>
                      </div>
                    ) : (
                      <div className="px-3 py-2 space-y-1.5">
                        <p className="text-[10px] text-white/55 line-clamp-3 leading-relaxed">
                          {content || 'Texto do post LinkedIn aparecerá aqui...'}
                        </p>
                        <div className="flex items-center gap-3 pt-1 border-t border-white/[0.05]">
                          <span className="text-[11px]">👍 ❤️</span>
                          <span className="text-[10px] text-white/30">43 reações · 8 comentários</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ── 5.5 Publicar — painel de ação final ── */}
              <div className="rounded-3xl border border-white/[0.07] overflow-hidden flex-shrink-0" style={{ background: '#181b25' }}>
                <PanelHeader icon={<Send className="h-3.5 w-3.5" />} accent="text-accent-cyan" label="Publicar" />

                <div className="p-3 space-y-2.5">
                  {/* Prerequisite alerts */}
                  {slides.length === 0 && (
                    <ContextAlert tone="info">Gere um carrossel para liberar a publicação.</ContextAlert>
                  )}
                  {slides.length > 0 && missingImages > 0 && (
                    <ContextAlert tone="warn">
                      Faltam imagens em <span className="font-bold">{missingImages}</span> {missingImages === 1 ? 'slide' : 'slides'}. Gere as imagens para habilitar a publicação.
                    </ContextAlert>
                  )}
                  {slides.length > 0 && missingImages === 0 && readyToPublish && publishState === 'idle' && (
                    <ContextAlert tone="ok">Tudo pronto! Seu carrossel pode ser publicado ou agendado.</ContextAlert>
                  )}

                  <motion.button onClick={() => setShowSchedule(!showSchedule)} disabled={!readyToPublish}
                    whileHover={readyToPublish ? { scale: 1.01 } : undefined} whileTap={readyToPublish ? { scale: 0.98 } : undefined} transition={spring}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl text-[12px] font-semibold border border-white/[0.08] text-white/55 hover:text-accent-cyan hover:border-accent-cyan/30 disabled:opacity-35 disabled:cursor-not-allowed transition-colors cursor-pointer">
                    <Calendar className="h-3.5 w-3.5 text-accent-cyan" />
                    {scheduleOk ? '✓ Agendado!' : 'Agendar publicação'}
                  </motion.button>
                  <AnimatePresence>
                    {showSchedule && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2, ease }} className="space-y-2 overflow-hidden">
                        <input type="datetime-local" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)}
                          min={new Date().toISOString().slice(0, 16)}
                          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-[12px] text-white outline-none focus:border-accent-cyan/50 transition-all" />
                        <button onClick={handleSchedulePost} disabled={!scheduleDate || schedulingSave}
                          className="w-full py-2 rounded-xl text-[12px] font-bold text-white bg-gradient-to-r from-accent-cyan to-accent-purple disabled:opacity-40 cursor-pointer">
                          {schedulingSave ? <Loader2 className="h-3.5 w-3.5 animate-spin mx-auto" /> : 'Confirmar agendamento'}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <motion.button onClick={handlePublishToInstagram} disabled={publishState === 'publishing' || !readyToPublish}
                    whileHover={readyToPublish ? { scale: 1.01 } : undefined} whileTap={readyToPublish ? { scale: 0.98 } : undefined} transition={spring}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-[12.5px] font-bold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${
                      publishState === 'success' ? 'bg-emerald-500 shadow-[0_0_16px_rgba(16,185,129,0.3)]'
                      : publishState === 'error' ? 'bg-red-500/80'
                      : 'bg-gradient-to-r from-accent-purple to-accent-cyan shadow-[0_4px_16px_rgba(139,92,246,0.25)] hover:shadow-[0_6px_24px_rgba(139,92,246,0.45)]'
                    }`}>
                    {publishState === 'publishing' && <><Loader2 className="h-3.5 w-3.5 animate-spin" />{t('publishing')}</>}
                    {publishState === 'success'    && <><Check className="h-3.5 w-3.5" />{t('published')}</>}
                    {publishState === 'error'      && <><X className="h-3.5 w-3.5" />{t('failed')}</>}
                    {publishState === 'idle'       && <><Send className="h-3.5 w-3.5" />{t('postToInstagram')}</>}
                  </motion.button>
                  {publishState === 'error' && publishError && (
                    <ContextAlert tone="warn">{publishError}</ContextAlert>
                  )}
                  {publishState === 'success' && publishPermalink && (
                    <a href={publishPermalink} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold transition-colors py-1">
                      <ExternalLink className="h-3 w-3" />{t('viewOnInstagram')}
                    </a>
                  )}
                </div>
              </div>

            </div>
          )}

        </div>{/* main grid */}
      </div>{/* outer flex */}

      {/* ── Upgrade modal ── */}
      {(() => {
        const isNoSub = !upgradeReason || upgradeReason === 'subscription_required';
        const used    = subscription?.carousels_used ?? 0;
        const limit   = subscription?.carousel_limit ?? 0;

        const handleCheckout = async (plan: string) => {
          setUpgradeModalOpen(false);
          const res = await fetch('/api/stripe/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ plan }),
          });
          if (res.ok) {
            const { url } = await res.json();
            if (url) window.location.href = url;
          }
        };

        return (
          <Modal
            open={upgradeModalOpen}
            onClose={() => setUpgradeModalOpen(false)}
            size="sm"
            icon={<Zap className="h-5 w-5" />}
            title={isNoSub ? 'Escolha um plano para continuar' : 'Você usou todos os carrosséis do mês'}
            description={isNoSub
              ? 'Para gerar carrosséis com IA você precisa de uma assinatura ativa.'
              : `Você gerou ${used} de ${limit} carrosséis este mês. Faça upgrade para continuar criando.`}
          >
            <div className="space-y-3">
              {/* Pro */}
              <div className="rounded-2xl border border-accent-purple/40 bg-accent-purple/10 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[13px] font-bold text-white">Plano Pro</p>
                  <p className="text-[13px] font-bold text-accent-cyan">R$29,99/mês</p>
                </div>
                {['25 carrosséis por mês', 'Imagens geradas por IA', 'Publicação direta no Instagram', 'Analytics + Calendário'].map(f => (
                  <div key={f} className="flex items-center gap-2 text-[12px] text-white/55">
                    <Check className="h-3 w-3 text-accent-purple flex-shrink-0" />
                    {f}
                  </div>
                ))}
                <button
                  onClick={() => handleCheckout('pro')}
                  className="btn-press w-full mt-2 py-2.5 rounded-xl text-[13px] font-bold text-white bg-gradient-to-r from-accent-purple to-accent-cyan hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all cursor-pointer"
                >
                  Assinar Pro
                </button>
              </div>

              {/* Agency */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[13px] font-bold text-white">Plano Agency</p>
                  <p className="text-[13px] font-bold text-white/40">R$79,99/mês</p>
                </div>
                {['60 carrosséis por mês', 'Tudo do Pro', 'Multi Brand Kits', 'Exportação Figma/PDF'].map(f => (
                  <div key={f} className="flex items-center gap-2 text-[12px] text-white/55">
                    <Check className="h-3 w-3 text-white/40 flex-shrink-0" />
                    {f}
                  </div>
                ))}
                <button
                  onClick={() => handleCheckout('agency')}
                  className="btn-press w-full mt-2 py-2.5 rounded-xl text-[12px] font-bold border border-white/10 text-white/55 hover:text-white hover:border-white/20 transition-all cursor-pointer"
                >
                  Assinar Agency
                </button>
              </div>
            </div>
          </Modal>
        );
      })()}

      {/* ── Confirmação de exclusão de slide ── */}
      <ConfirmDialog
        open={confirmDeleteIndex !== null}
        onClose={() => setConfirmDeleteIndex(null)}
        onConfirm={() => { if (confirmDeleteIndex !== null) { handleDeleteSlide(confirmDeleteIndex); toast.success('Slide excluído'); } }}
        title="Excluir este slide?"
        description="Esta ação não pode ser desfeita. O slide e sua imagem serão removidos do carrossel."
        confirmLabel="Excluir slide"
        cancelLabel="Cancelar"
        danger
      />
    </>
  );
}

// Wrap in Suspense so useSearchParams works in Next.js App Router
import { Suspense } from 'react';
const DashboardPageWithSuspense = () => (
  <Suspense fallback={null}>
    <DashboardPage />
  </Suspense>
);
export { DashboardPageWithSuspense as default };
