"use client";
import React, { useState } from 'react';
import { PublicHeader } from '@/components/PublicHeader';
import { Footer } from '@/components/Footer';
import {
  FileText, UserCheck, Monitor, Shield, Ban, Cpu,
  Copyright, CreditCard, AlertTriangle, LogOut, RefreshCw,
  Scale, Mail, ChevronDown, ChevronUp,
} from 'lucide-react';

const SECTIONS = [
  {
    id: 'aceitacao', icon: FileText, color: 'text-accent-cyan', bg: 'bg-accent-cyan/10 border-accent-cyan/20',
    title: '1. Aceitação dos Termos',
    content: 'Ao criar uma conta ou usar qualquer funcionalidade do SocialPro, você declara ter lido, compreendido e concordado com estes Termos de Uso e com nossa Política de Privacidade. Se não concordar, não utilize nossos serviços.',
  },
  {
    id: 'servico', icon: Monitor, color: 'text-accent-purple', bg: 'bg-accent-purple/10 border-accent-purple/20',
    title: '2. Descrição do Serviço',
    content: 'O SocialPro é uma plataforma SaaS que utiliza inteligência artificial para auxiliar criadores de conteúdo na criação, edição e publicação de carrosséis para Instagram e outras redes sociais. Os serviços incluem: geração de texto e imagens por IA; ferramentas de agendamento editorial; brand kit personalizado; e integração opcional com Instagram para publicação direta.',
  },
  {
    id: 'elegibilidade', icon: UserCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20',
    title: '3. Elegibilidade',
    content: 'Você deve ter pelo menos 18 anos para usar o SocialPro. Ao aceitar estes termos, você declara ter capacidade legal plena para celebrar contratos.',
  },
  {
    id: 'conta', icon: Shield, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20',
    title: '4. Conta de Usuário',
    content: 'Você é responsável por manter a confidencialidade de suas credenciais de acesso. Notifique-nos imediatamente caso suspeite de acesso não autorizado à sua conta. O SocialPro não se responsabiliza por perdas decorrentes do uso não autorizado da sua conta.',
  },
  {
    id: 'uso-aceitavel', icon: Ban, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20',
    title: '5. Uso Aceitável',
    items: [
      'Gerar conteúdo ilegal, difamatório, enganoso ou que viole direitos de terceiros',
      'Realizar engenharia reversa ou copiar nossa tecnologia',
      'Tentar comprometer a segurança da plataforma',
      'Violar os Termos de Serviço da Meta, Instagram ou qualquer outra plataforma integrada',
    ],
    itemsLabel: 'É proibido usar o SocialPro para:',
  },
  {
    id: 'ia', icon: Cpu, color: 'text-accent-orange', bg: 'bg-accent-orange/10 border-accent-orange/20',
    title: '6. Conteúdo Gerado por IA',
    content: 'O conteúdo gerado pela IA do SocialPro é de natureza sugestiva e não substitui revisão humana. Você é inteiramente responsável pelo conteúdo que publicar usando nossa plataforma, incluindo sua veracidade, adequação e conformidade com leis aplicáveis. O SocialPro não garante que o conteúdo gerado seja livre de erros, viés ou inadequações.',
  },
  {
    id: 'propriedade', icon: Copyright, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20',
    title: '7. Propriedade Intelectual',
    partners: [
      { name: 'Conteúdo do usuário', desc: 'Você mantém todos os direitos sobre o conteúdo que criar. Ao usar o SocialPro, você nos concede licença limitada para processar e exibir seu conteúdo exclusivamente para fornecer o serviço.' },
      { name: 'Nossa propriedade', desc: 'O SocialPro, incluindo código, design, marca e tecnologia, é protegido por direitos autorais. É proibida qualquer reprodução sem autorização expressa.' },
    ],
  },
  {
    id: 'pagamentos', icon: CreditCard, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20',
    title: '8. Pagamentos e Assinaturas',
    content: 'Os planos pagos são cobrados mensalmente ou anualmente conforme escolhido. O cancelamento pode ser feito a qualquer momento pelo painel da conta. Não realizamos reembolsos por períodos parcialmente utilizados, exceto quando exigido por lei. O SocialPro se reserva o direito de alterar preços com aviso prévio de 30 dias.',
  },
  {
    id: 'limitacao', icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20',
    title: '9. Limitação de Responsabilidade',
    content: 'O SocialPro é fornecido "como está", sem garantias de disponibilidade ininterrupta ou de resultados específicos. Em nenhuma circunstância nossa responsabilidade excederá o valor pago pelo usuário nos últimos 3 meses de serviço.',
  },
  {
    id: 'encerramento', icon: LogOut, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20',
    title: '10. Encerramento de Conta',
    content: 'Você pode encerrar sua conta a qualquer momento. O SocialPro se reserva o direito de suspender ou encerrar contas que violem estes termos, sem aviso prévio em casos graves.',
  },
  {
    id: 'alteracoes', icon: RefreshCw, color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/20',
    title: '11. Alterações nos Termos',
    content: 'Podemos modificar estes termos periodicamente. Notificaremos usuários com pelo menos 15 dias de antecedência sobre alterações relevantes. O uso continuado após as alterações implica aceitação dos novos termos.',
  },
  {
    id: 'lei', icon: Scale, color: 'text-accent-cyan', bg: 'bg-accent-cyan/10 border-accent-cyan/20',
    title: '12. Lei Aplicável',
    content: 'Estes termos são regidos pelas leis da República Federativa do Brasil. O foro da comarca de São Paulo é eleito para dirimir quaisquer controvérsias.',
  },
  {
    id: 'contato', icon: Mail, color: 'text-accent-purple', bg: 'bg-accent-purple/10 border-accent-purple/20',
    title: '13. Contato',
    content: 'Dúvidas sobre estes termos? Entre em contato: contato@socialpro.ai',
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
          {section.content && <p className="text-xs text-dark-muted leading-relaxed">{section.content}</p>}
          {section.itemsLabel && <p className="text-xs text-dark-muted">{section.itemsLabel}</p>}
          {section.items && (
            <ul className="space-y-2">
              {section.items.map(item => (
                <li key={item} className="flex items-start gap-2.5 text-xs text-dark-muted">
                  <span className="text-red-400 mt-0.5 flex-shrink-0">✕</span>
                  {item}
                </li>
              ))}
            </ul>
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
        </div>
      )}
    </div>
  );
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-dark-bg text-dark-text flex flex-col">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-accent-cyan/8 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-accent-purple/6 blur-[100px] pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern grid-mask pointer-events-none -z-10" />

      <PublicHeader showBack backLabel="Voltar" backHref="/" />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 md:px-6 py-12 space-y-8">

        {/* Hero */}
        <div className="text-center space-y-4 py-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-cyan/10 border border-accent-cyan/20 text-xs font-semibold text-accent-cyan mx-auto">
            <FileText className="h-3.5 w-3.5" />
            Termos de Uso
          </div>
          <h1 className="font-display text-4xl font-extrabold text-white tracking-tight">
            Regras claras para<br />
            <span className="bg-gradient-to-r from-accent-cyan to-accent-purple bg-clip-text text-transparent">
              uma parceria justa
            </span>
          </h1>
          <p className="text-sm text-dark-muted max-w-lg mx-auto leading-relaxed">
            Ao usar o SocialPro, você concorda com estes termos. Leia com calma — redigimos de forma clara e direta.
          </p>
          <p className="text-xs text-dark-muted">Última atualização: 22 de junho de 2026</p>
        </div>

        {/* Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: UserCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', label: 'Você mantém seus direitos', desc: 'Todo conteúdo criado é seu.' },
            { icon: CreditCard, color: 'text-accent-cyan',  bg: 'bg-accent-cyan/10 border-accent-cyan/20',   label: 'Cancele quando quiser', desc: 'Sem fidelidade ou multas.' },
            { icon: Scale,      color: 'text-accent-purple', bg: 'bg-accent-purple/10 border-accent-purple/20', label: 'Lei brasileira', desc: 'Foro em São Paulo / SP.' },
          ].map(({ icon: Icon, color, bg, label, desc }) => (
            <div key={label} className={`glass-panel rounded-2xl border ${bg} p-4 text-center space-y-2`}>
              <div className={`p-2 rounded-xl ${bg} w-fit mx-auto`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <p className="text-xs font-bold text-white">{label}</p>
              <p className="text-[10px] text-dark-muted">{desc}</p>
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
        <div className="glass-panel rounded-2xl border border-white/10 p-6 text-center space-y-3">
          <Mail className="h-6 w-6 text-accent-cyan mx-auto" />
          <p className="text-sm font-bold text-white">Dúvidas sobre os termos?</p>
          <a href="mailto:contato@socialpro.ai"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-accent-cyan to-accent-purple hover:shadow-[0_0_16px_rgba(6,182,212,0.4)] transition-all">
            contato@socialpro.ai
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
}
