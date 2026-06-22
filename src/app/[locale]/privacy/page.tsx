"use client";
import React, { useState } from 'react';
import { PublicHeader } from '@/components/PublicHeader';
import { Footer } from '@/components/Footer';
import {
  Shield, Database, Share2, Clock, Lock, UserCheck,
  Cookie, Baby, RefreshCw, Mail, ChevronDown, ChevronUp,
} from 'lucide-react';

const SECTIONS = [
  {
    id: 'coleta', icon: Database, color: 'text-accent-cyan', bg: 'bg-accent-cyan/10 border-accent-cyan/20',
    title: '1. Dados que coletamos',
    items: [
      { label: 'Dados de cadastro', desc: 'Nome, e-mail, foto de perfil e handle do Instagram, fornecidos durante o registro ou configuração do Brand Kit.' },
      { label: 'Dados de uso', desc: 'Carrosséis gerados, configurações de estilo, tópicos pesquisados e histórico de publicações.' },
      { label: 'Dados de pagamento', desc: 'Processados exclusivamente pelo Stripe. O SocialPro não armazena dados de cartão de crédito.' },
      { label: 'Conexão social', desc: 'Tokens de acesso do Facebook/Instagram necessários para publicação, armazenados de forma segura no Supabase.' },
      { label: 'Dados técnicos', desc: 'Endereço IP, tipo de navegador, dispositivo e dados de sessão para fins de segurança.' },
    ],
  },
  {
    id: 'uso', icon: Shield, color: 'text-accent-purple', bg: 'bg-accent-purple/10 border-accent-purple/20',
    title: '2. Como usamos seus dados',
    content: 'Utilizamos seus dados para fornecer e melhorar nossos serviços de geração de conteúdo com IA; processar pagamentos e gerenciar assinaturas; publicar conteúdo no Instagram em seu nome (somente com autorização explícita); enviar comunicações sobre o serviço; e cumprir obrigações legais.',
  },
  {
    id: 'compartilhamento', icon: Share2, color: 'text-accent-orange', bg: 'bg-accent-orange/10 border-accent-orange/20',
    title: '3. Compartilhamento de dados',
    partners: [
      { name: 'Supabase', desc: 'Banco de dados e armazenamento de arquivos (servidores na UE/EUA).' },
      { name: 'Stripe', desc: 'Processamento de pagamentos (PCI-DSS compliant).' },
      { name: 'OpenAI', desc: 'Geração de texto e imagens por IA. Os prompts podem ser processados pelos servidores da OpenAI.' },
      { name: 'Meta (Facebook/Instagram)', desc: 'Publicação de conteúdo via Instagram Graph API, somente com sua autorização.' },
      { name: 'Windmill', desc: 'Processamento assíncrono de geração de imagens.' },
    ],
  },
  {
    id: 'retencao', icon: Clock, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20',
    title: '4. Retenção de dados',
    content: 'Mantemos seus dados enquanto sua conta estiver ativa. Após o cancelamento, os dados são excluídos em até 90 dias, exceto quando a retenção for exigida por lei.',
  },
  {
    id: 'seguranca', icon: Lock, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20',
    title: '5. Segurança',
    content: 'Utilizamos criptografia em trânsito (TLS/HTTPS) e em repouso. O acesso ao banco de dados é restrito por políticas de segurança em nível de linha (Row Level Security) do Supabase. Tokens de acesso social são armazenados de forma segura e nunca expostos ao cliente.',
  },
  {
    id: 'direitos', icon: UserCheck, color: 'text-accent-pink', bg: 'bg-accent-pink/10 border-accent-pink/20',
    title: '6. Seus direitos (LGPD)',
    content: 'Nos termos da Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você tem direito a: acessar seus dados; corrigir informações incorretas; solicitar a exclusão dos seus dados; revogar o consentimento a qualquer momento; e solicitar a portabilidade dos seus dados. Para exercer qualquer um desses direitos, envie um e-mail para privacidade@socialpro.ai.',
  },
  {
    id: 'cookies', icon: Cookie, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20',
    title: '7. Cookies',
    content: 'Utilizamos cookies de sessão para autenticação (NextAuth) e cookies de preferências (tema da interface). Não utilizamos cookies de rastreamento ou publicidade de terceiros.',
  },
  {
    id: 'menores', icon: Baby, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20',
    title: '8. Dados de menores',
    content: 'O SocialPro não é direcionado a menores de 18 anos e não coleta intencionalmente dados de crianças. Se você acredita que coletamos dados de um menor, entre em contato conosco imediatamente.',
  },
  {
    id: 'alteracoes', icon: RefreshCw, color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/20',
    title: '9. Alterações nesta política',
    content: 'Podemos atualizar esta política periodicamente. Notificaremos usuários sobre mudanças significativas por e-mail ou por aviso na plataforma. O uso continuado após as alterações implica aceitação da nova versão.',
  },
  {
    id: 'contato', icon: Mail, color: 'text-accent-cyan', bg: 'bg-accent-cyan/10 border-accent-cyan/20',
    title: '10. Contato',
    content: 'Dúvidas sobre privacidade? Entre em contato: privacidade@socialpro.ai — SocialPro AI Inc.',
  },
];

function AccordionSection({ section }: { section: typeof SECTIONS[0] }) {
  const [open, setOpen] = useState(false);
  const Icon = section.icon;

  return (
    <div className={`glass-panel rounded-2xl border overflow-hidden transition-all duration-300 ${open ? 'border-white/10' : 'border-white/5'}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className={`p-2.5 rounded-xl border flex-shrink-0 ${section.bg}`}>
          <Icon className={`h-4 w-4 ${section.color}`} />
        </div>
        <span className="flex-1 text-sm font-bold text-white">{section.title}</span>
        {open
          ? <ChevronUp className="h-4 w-4 text-dark-muted flex-shrink-0" />
          : <ChevronDown className="h-4 w-4 text-dark-muted flex-shrink-0" />}
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-3 border-t border-white/5 pt-4">
          {section.items && (
            <div className="space-y-3">
              {section.items.map(item => (
                <div key={item.label} className="flex gap-3">
                  <span className={`text-[9px] font-extrabold uppercase tracking-wider mt-1 flex-shrink-0 ${section.color}`}>
                    {item.label}
                  </span>
                  <p className="text-xs text-dark-muted leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          )}
          {section.partners && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {section.partners.map(p => (
                <div key={p.name} className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <p className="text-xs font-bold text-white">{p.name}</p>
                  <p className="text-[11px] text-dark-muted mt-1 leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
          )}
          {section.content && (
            <p className="text-xs text-dark-muted leading-relaxed">{section.content}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-dark-bg text-dark-text flex flex-col">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-accent-purple/8 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-accent-cyan/6 blur-[100px] pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern grid-mask pointer-events-none -z-10" />

      <PublicHeader showBack backLabel="Voltar" backHref="/" />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 md:px-6 py-12 space-y-8">

        {/* Hero */}
        <div className="text-center space-y-4 py-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-purple/10 border border-accent-purple/20 text-xs font-semibold text-accent-purple mx-auto">
            <Shield className="h-3.5 w-3.5" />
            Política de Privacidade
          </div>
          <h1 className="font-display text-4xl font-extrabold text-white tracking-tight">
            Sua privacidade<br />
            <span className="bg-gradient-to-r from-accent-purple to-accent-cyan bg-clip-text text-transparent">
              é nossa prioridade
            </span>
          </h1>
          <p className="text-sm text-dark-muted max-w-lg mx-auto leading-relaxed">
            Saiba como o SocialPro coleta, usa e protege seus dados pessoais em conformidade com a LGPD.
          </p>
          <p className="text-xs text-dark-muted">Última atualização: 22 de junho de 2026</p>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: 'LGPD', label: 'Conformidade total' },
            { value: '90d',  label: 'Exclusão após cancelamento' },
            { value: '0',    label: 'Dados vendidos a terceiros' },
          ].map(({ value, label }) => (
            <div key={label} className="glass-panel rounded-2xl border border-white/5 p-4 text-center">
              <p className="text-xl font-black text-white">{value}</p>
              <p className="text-[10px] text-dark-muted mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Sections */}
        <div className="space-y-3">
          {SECTIONS.map(section => (
            <AccordionSection key={section.id} section={section} />
          ))}
        </div>

        {/* CTA */}
        <div className="glass-panel rounded-2xl border border-accent-purple/20 bg-accent-purple/5 p-6 text-center space-y-3">
          <Mail className="h-6 w-6 text-accent-purple mx-auto" />
          <p className="text-sm font-bold text-white">Dúvidas sobre sua privacidade?</p>
          <a href="mailto:privacidade@socialpro.ai"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-accent-purple to-accent-cyan hover:shadow-[0_0_16px_rgba(139,92,246,0.4)] transition-all">
            privacidade@socialpro.ai
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
}
