import React from 'react';
import type { PlatformType, ToneType } from '../../types';
import { MessageSquareText, Sparkles } from 'lucide-react';
import { Linkedin, Twitter, Instagram } from '../icons';

interface PostStudioCardProps {
  platform: PlatformType;
  tone: ToneType;
  content: string;
  onUpdatePlatform: (platform: PlatformType) => void;
  onUpdateTone: (tone: ToneType) => void;
  onUpdateContent: (content: string) => void;
  onTriggerGenerate: () => void;
  isGenerating: boolean;
}

const TONES: { id: ToneType; label: string; desc: string; emoji: string }[] = [
  { id: 'provocativo', label: 'Provocativo', desc: 'Ganchos fortes e contrários ao senso comum', emoji: '🌶️' },
  { id: 'autoridade', label: 'Autoridade', desc: 'Dados, lições profissionais e valor técnico', emoji: '👔' },
  { id: 'storyteller', label: 'Storyteller', desc: 'Jornada pessoal e conexão emocional', emoji: '📖' },
  { id: 'meme', label: 'Meme/Humor', desc: 'Espirituoso e contextualizado com a cultura web', emoji: '⚡' },
];

export const PostStudioCard: React.FC<PostStudioCardProps> = ({
  platform,
  tone,
  content,
  onUpdatePlatform,
  onUpdateTone,
  onUpdateContent,
  onTriggerGenerate,
  isGenerating,
}) => {
  return (
    <div className="glass-panel bento-card p-6 rounded-3xl col-span-1 lg:col-span-1 row-span-2 flex flex-col justify-between min-h-[460px]">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="p-2 bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan rounded-xl">
            <MessageSquareText className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-white tracking-tight">Postagens Autônomas</h3>
            <p className="text-xs text-dark-muted">Copywriting focado em engajamento rápido</p>
          </div>
        </div>

        {/* Platform Selector */}
        <div className="space-y-2">
          <label className="text-[10px] uppercase font-bold text-dark-muted tracking-wider">Rede Social Alvo</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'linkedin' as PlatformType, name: 'LinkedIn', icon: Linkedin, color: 'hover:text-[#0077b5] hover:bg-[#0077b5]/10', activeClass: 'border-[#0077b5] bg-[#0077b5]/10 text-[#0077b5]' },
              { id: 'x' as PlatformType, name: 'X / Twitter', icon: Twitter, color: 'hover:text-white hover:bg-white/10', activeClass: 'border-white bg-white/10 text-white' },
              { id: 'instagram' as PlatformType, name: 'Instagram', icon: Instagram, color: 'hover:text-[#e1306c] hover:bg-[#e1306c]/10', activeClass: 'border-[#e1306c] bg-[#e1306c]/10 text-[#e1306c]' },
            ].map((p) => {
              const Icon = p.icon;
              const isActive = platform === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => onUpdatePlatform(p.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all ${
                    isActive ? p.activeClass : 'bg-white/5 border-white/5 text-dark-muted ' + p.color
                  }`}
                >
                  <Icon className="h-5 w-5 mb-1.5" />
                  {p.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tone Selector */}
        <div className="space-y-2">
          <label className="text-[10px] uppercase font-bold text-dark-muted tracking-wider">Tom de Voz da IA</label>
          <div className="grid grid-cols-2 gap-2">
            {TONES.map((t) => {
              const isActive = tone === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => onUpdateTone(t.id)}
                  className={`text-left p-3 rounded-xl border transition-all ${
                    isActive 
                      ? 'border-accent-cyan bg-accent-cyan/10 text-white shadow-[0_0_12px_rgba(6,182,212,0.15)]' 
                      : 'bg-white/5 border-white/5 text-dark-muted hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <span>{t.emoji}</span>
                    <span>{t.label}</span>
                  </div>
                  <p className="text-[10px] text-dark-muted leading-tight mt-1 truncate">{t.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Text Input */}
        <div className="space-y-2">
          <label className="text-[10px] uppercase font-bold text-dark-muted tracking-wider">Insira sua Ideia / Assunto</label>
          <textarea
            value={content}
            onChange={(e) => onUpdateContent(e.target.value)}
            className="interactive-input h-28 resize-none py-3"
            placeholder="Ex: Como faturar os primeiros R$ 10k como programador freelancer focado em valor, não em horas..."
          />
        </div>
      </div>

      {/* Footer Generate Action */}
      <div className="pt-4 border-t border-white/5">
        <button
          onClick={onTriggerGenerate}
          disabled={isGenerating || !content.trim()}
          className="relative w-full group overflow-hidden rounded-xl bg-gradient-to-r from-accent-purple to-accent-cyan p-[1px] font-bold text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="bg-dark-bg group-hover:bg-transparent rounded-[11px] py-3 text-center transition-all">
            <span className="flex items-center justify-center gap-2 text-white">
              <Sparkles className={`h-4 w-4 text-accent-cyan group-hover:text-white transition-colors ${isGenerating ? 'animate-spin' : 'group-hover:animate-pulse'}`} />
              {isGenerating ? 'Refinando Copy com IA...' : 'Refinar Conteúdo com IA'}
            </span>
          </div>
          {/* Pulsing button glow */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-accent-purple to-accent-cyan opacity-40 blur-md group-hover:opacity-100 transition-opacity"></div>
        </button>
      </div>
    </div>
  );
};
