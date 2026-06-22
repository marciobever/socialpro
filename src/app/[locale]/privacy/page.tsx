import React from 'react';
import Link from 'next/link';
import { BrainCircuit } from 'lucide-react';

export const metadata = {
  title: 'Política de Privacidade — SocialPro',
  description: 'Saiba como o SocialPro coleta, usa e protege seus dados pessoais.',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-base font-bold text-white">{title}</h2>
      <div className="text-sm text-dark-muted leading-relaxed space-y-2">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
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
            <h1 className="text-3xl font-extrabold text-white">Política de Privacidade</h1>
            <p className="text-sm text-dark-muted">Última atualização: 22 de junho de 2026</p>
          </div>
          <p className="text-sm text-dark-muted leading-relaxed">
            O SocialPro (&quot;nós&quot;, &quot;nosso&quot;) respeita sua privacidade e está comprometido em proteger seus dados pessoais. Esta política descreve como coletamos, usamos e protegemos as informações que você nos fornece ao usar nossa plataforma.
          </p>
        </div>

        <div className="w-full h-px bg-white/5" />

        <div className="space-y-8">

          <Section title="1. Dados que coletamos">
            <p><strong className="text-white">Dados de cadastro:</strong> nome, endereço de e-mail, foto de perfil e handle do Instagram, fornecidos durante o registro ou configuração do Brand Kit.</p>
            <p><strong className="text-white">Dados de uso:</strong> carrosséis gerados, configurações de estilo, tópicos pesquisados e histórico de publicações.</p>
            <p><strong className="text-white">Dados de pagamento:</strong> processados exclusivamente pelo Stripe. O SocialPro não armazena dados de cartão de crédito.</p>
            <p><strong className="text-white">Dados de conexão social:</strong> tokens de acesso do Facebook/Instagram necessários para publicação, armazenados de forma segura no Supabase.</p>
            <p><strong className="text-white">Dados técnicos:</strong> endereço IP, tipo de navegador, dispositivo e dados de sessão para fins de segurança e melhoria do serviço.</p>
          </Section>

          <Section title="2. Como usamos seus dados">
            <p>Utilizamos seus dados para: fornecer e melhorar nossos serviços de geração de conteúdo com IA; processar pagamentos e gerenciar assinaturas; publicar conteúdo no Instagram em seu nome (somente com autorização explícita); enviar comunicações sobre o serviço; e cumprir obrigações legais.</p>
          </Section>

          <Section title="3. Compartilhamento de dados">
            <p>Não vendemos seus dados pessoais. Compartilhamos informações apenas com:</p>
            <p><strong className="text-white">Supabase:</strong> banco de dados e armazenamento de arquivos (servidores na UE/EUA).</p>
            <p><strong className="text-white">Stripe:</strong> processamento de pagamentos (PCI-DSS compliant).</p>
            <p><strong className="text-white">OpenAI:</strong> geração de texto e imagens por IA. Os prompts podem ser processados pelos servidores da OpenAI.</p>
            <p><strong className="text-white">Meta (Facebook/Instagram):</strong> publicação de conteúdo via Instagram Graph API, somente com sua autorização.</p>
            <p><strong className="text-white">Windmill:</strong> processamento assíncrono de geração de imagens.</p>
          </Section>

          <Section title="4. Retenção de dados">
            <p>Mantemos seus dados enquanto sua conta estiver ativa. Após o cancelamento, os dados são excluídos em até 90 dias, exceto quando a retenção for exigida por lei.</p>
          </Section>

          <Section title="5. Segurança">
            <p>Utilizamos criptografia em trânsito (TLS/HTTPS) e em repouso. O acesso ao banco de dados é restrito por políticas de segurança em nível de linha (Row Level Security) do Supabase. Tokens de acesso social são armazenados de forma segura e nunca expostos ao cliente.</p>
          </Section>

          <Section title="6. Seus direitos (LGPD)">
            <p>Nos termos da Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você tem direito a: acessar seus dados; corrigir informações incorretas; solicitar a exclusão dos seus dados; revogar o consentimento a qualquer momento; e solicitar a portabilidade dos seus dados.</p>
            <p>Para exercer qualquer um desses direitos, envie um e-mail para <strong className="text-white">privacidade@socialpro.ai</strong>.</p>
          </Section>

          <Section title="7. Cookies">
            <p>Utilizamos cookies de sessão para autenticação (NextAuth) e cookies de preferências (tema da interface). Não utilizamos cookies de rastreamento ou publicidade de terceiros.</p>
          </Section>

          <Section title="8. Dados de menores">
            <p>O SocialPro não é direcionado a menores de 18 anos e não coleta intencionalmente dados de crianças. Se você acredita que coletamos dados de um menor, entre em contato conosco imediatamente.</p>
          </Section>

          <Section title="9. Alterações nesta política">
            <p>Podemos atualizar esta política periodicamente. Notificaremos usuários sobre mudanças significativas por e-mail ou por aviso na plataforma. O uso continuado após as alterações implica aceitação da nova versão.</p>
          </Section>

          <Section title="10. Contato">
            <p>Dúvidas sobre privacidade? Entre em contato: <strong className="text-white">privacidade@socialpro.ai</strong></p>
            <p>SocialPro AI Inc. — contato@socialpro.ai</p>
          </Section>
        </div>

        <div className="w-full h-px bg-white/5" />
        <div className="flex items-center justify-between text-xs text-dark-muted">
          <Link href="/" className="hover:text-white transition-colors">← Voltar ao início</Link>
          <div className="flex gap-4">
            <Link href="/terms"         className="hover:text-white transition-colors">Termos de Uso</Link>
            <Link href="/data-deletion" className="hover:text-white transition-colors">Exclusão de Dados</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
