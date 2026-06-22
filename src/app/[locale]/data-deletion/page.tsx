import React from 'react';
import Link from 'next/link';
import { BrainCircuit, Trash2, Mail, Clock, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Exclusão de Dados — SocialPro',
  description: 'Saiba como solicitar a exclusão dos seus dados pessoais no SocialPro.',
};

export default function DataDeletionPage() {
  return (
    <div className="min-h-screen bg-dark-bg text-dark-text">
      <div className="max-w-3xl mx-auto px-6 py-16 space-y-10">

        {/* Header */}
        <div className="space-y-4">
          <Link href="/" className="flex items-center gap-2 w-fit">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-accent-purple to-accent-cyan p-[1px]">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-dark-bg">
                <BrainCircuit className="h-4 w-4 text-accent-cyan" />
              </div>
            </div>
            <span className="font-bold text-white">Social<span className="text-accent-cyan">Pro</span></span>
          </Link>
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold text-white">Exclusão de Dados</h1>
            <p className="text-sm text-dark-muted">Instrução de exclusão de dados — conforme exigência da Meta (Facebook/Instagram)</p>
          </div>
        </div>

        <div className="w-full h-px bg-white/5" />

        {/* Intro */}
        <p className="text-sm text-dark-muted leading-relaxed">
          O SocialPro respeita seu direito à privacidade e ao controle sobre seus dados pessoais. Esta página descreve como solicitar a exclusão completa das informações associadas à sua conta, incluindo dados vinculados à sua conta do Facebook/Instagram.
        </p>

        {/* Steps */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-white">Como solicitar a exclusão dos seus dados</h2>

          {[
            {
              icon: Mail,
              title: 'Opção 1 — Por e-mail (recomendado)',
              desc: 'Envie um e-mail para privacidade@socialpro.ai com o assunto "EXCLUSÃO DE DADOS" e inclua: seu e-mail cadastrado no SocialPro, seu nome completo, e o motivo da solicitação (opcional). Processaremos sua solicitação em até 30 dias úteis.',
            },
            {
              icon: Trash2,
              title: 'Opção 2 — Pela sua conta',
              desc: 'Se você ainda tem acesso à sua conta, acesse Minha Conta → e entre em contato pelo e-mail de suporte. Isso inicia o processo de exclusão imediatamente.',
            },
            {
              icon: ShieldCheck,
              title: 'Opção 3 — Via Meta',
              desc: 'Se você usou o Login com Facebook para acessar o SocialPro, pode iniciar a exclusão de dados diretamente pelo Facebook: Configurações do Facebook → Apps e Sites → SocialPro → Remover. Isso revoga o acesso e dispara nossa rotina de exclusão automaticamente.',
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-4 p-5 glass-panel rounded-2xl border border-white/5">
              <div className="p-2.5 rounded-xl bg-accent-purple/10 border border-accent-purple/20 flex-shrink-0 h-fit">
                <Icon className="h-4 w-4 text-accent-purple" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">{title}</h3>
                <p className="text-xs text-dark-muted leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* What gets deleted */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-white">O que é excluído</h2>
          <div className="glass-panel rounded-2xl border border-white/5 p-5 space-y-3">
            {[
              'Perfil de usuário (nome, e-mail, foto, handle)',
              'Brand Kit e configurações de conta',
              'Histórico de carrosséis gerados',
              'Tokens de acesso ao Facebook/Instagram',
              'Dados de assinatura (mantemos registros financeiros por 5 anos conforme lei fiscal)',
              'Imagens armazenadas no Supabase Storage',
            ].map(item => (
              <div key={item} className="flex items-center gap-2.5 text-xs text-dark-muted">
                <Trash2 className="h-3.5 w-3.5 text-red-400 flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="flex gap-4 p-5 glass-panel rounded-2xl border border-amber-500/20 bg-amber-500/5">
          <Clock className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">Prazo de conclusão</h3>
            <p className="text-xs text-dark-muted leading-relaxed">
              Todas as solicitações de exclusão são processadas em até <strong className="text-white">30 dias corridos</strong>. Você receberá uma confirmação por e-mail quando a exclusão for concluída. Dados de backup podem levar até 90 dias para serem completamente removidos de todos os sistemas.
            </p>
          </div>
        </div>

        {/* Contact */}
        <div className="space-y-2">
          <h2 className="text-base font-bold text-white">Contato para privacidade</h2>
          <p className="text-sm text-dark-muted">
            E-mail: <strong className="text-white">privacidade@socialpro.ai</strong>
          </p>
          <p className="text-sm text-dark-muted">
            SocialPro AI Inc. — Respondemos em até 5 dias úteis.
          </p>
        </div>

        <div className="w-full h-px bg-white/5" />
        <div className="flex items-center justify-between text-xs text-dark-muted">
          <Link href="/" className="hover:text-white transition-colors">← Voltar ao início</Link>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacidade</Link>
            <Link href="/terms"   className="hover:text-white transition-colors">Termos de Uso</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
