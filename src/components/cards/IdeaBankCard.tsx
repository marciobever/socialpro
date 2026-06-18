import React, { useState } from 'react';
import { Lightbulb, Check, ArrowRight } from 'lucide-react';

interface IdeaTemplate {
  id: string;
  label: string;
  category: string;
  hook: string;
  structure: string;
}

const TEMPLATES: IdeaTemplate[] = [
  { 
    id: 'contrarian', 
    label: 'Gancho Contrário ao Senso Comum', 
    category: 'Viral',
    hook: 'A maioria dos criadores diz para você postar 3x ao dia. Eles estão errados. Aqui está o porquê de eu postar apenas 1x na semana e ter 5x mais conversões:',
    structure: '1. O Mito Comum\n2. O meu resultado chocante\n3. O Framework do "Menos é Mais"\n4. Como aplicar hoje (Passos 1, 2, 3)\n5. CTA Conclusivo'
  },
  { 
    id: 'growth', 
    label: 'Auditoria de Crescimento / Estudo de Caso', 
    category: 'Autoridade',
    hook: 'Como ajudei uma startup de SaaS a ir de zero a $20k MRR em 45 dias (sem gastar 1 real em anúncios):',
    structure: '1. O Problema Inicial\n2. A Alavanca de Crescimento (O Segredo)\n3. Passo a Passo do Processo\n4. Os Resultados em Números\n5. CTA: Comente "QUERO" para ver o PDF'
  },
  { 
    id: 'mistake', 
    label: 'Os Maiores Erros que Cometi', 
    category: 'Conexão',
    hook: 'Passei 5 anos construindo agências erradas até descobrir esta única regra simples de precificação:',
    structure: '1. A frustração inicial\n2. O erro clássico de cobrar por hora\n3. A virada de chave (Precificação de Valor)\n4. O impacto na minha qualidade de vida\n5. Lição prática'
  },
];

interface IdeaBankCardProps {
  onSelectIdea: (hook: string, structure: string) => void;
}

export const IdeaBankCard: React.FC<IdeaBankCardProps> = ({ onSelectIdea }) => {
  const [selectedId, setSelectedId] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const handleSelect = (template: IdeaTemplate) => {
    setSelectedId(template.id);
    onSelectIdea(template.hook, template.structure);
    
    // Quick copy notification style
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="glass-panel bento-card p-6 rounded-3xl col-span-1 lg:col-span-1 row-span-1 flex flex-col justify-between min-h-[220px]">
      <div className="space-y-4 w-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-accent-orange/10 border border-accent-orange/20 text-accent-orange rounded-xl">
              <Lightbulb className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-white tracking-tight">Banco de Ideias</h3>
              <p className="text-[11px] text-dark-muted">Gatilhos mentais e estruturas virais</p>
            </div>
          </div>

          {copied ? (
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg animate-fade-in">
              <Check className="h-3 w-3" /> Aplicado!
            </span>
          ) : (
            <span className="text-[10px] text-dark-muted font-semibold bg-white/5 border border-white/5 px-2 py-0.5 rounded-lg">
              3 Prontos
            </span>
          )}
        </div>

        {/* Template List */}
        <div className="space-y-2">
          {TEMPLATES.map((tpl) => {
            const isSelected = selectedId === tpl.id;
            return (
              <button
                key={tpl.id}
                onClick={() => handleSelect(tpl)}
                className={`w-full p-2.5 rounded-xl border flex items-center justify-between transition-all text-left ${
                  isSelected 
                    ? 'border-accent-orange bg-accent-orange/5 text-white' 
                    : 'bg-white/5 border-white/5 text-dark-muted hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="overflow-hidden">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                      tpl.category === 'Viral' 
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                        : tpl.category === 'Autoridade'
                        ? 'bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20'
                        : 'bg-accent-purple/10 text-accent-purple border border-accent-purple/20'
                    }`}>
                      {tpl.category}
                    </span>
                    <h4 className="text-xs font-bold truncate max-w-[120px] text-white">
                      {tpl.label}
                    </h4>
                  </div>
                  <p className="text-[10px] text-dark-muted mt-1 truncate max-w-[170px] italic">
                    "{tpl.hook}"
                  </p>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-dark-muted group-hover:translate-x-1 transition-transform" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
