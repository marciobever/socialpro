import React from 'react';
import Link from 'next/link';
import { BrainCircuit } from 'lucide-react';

export const metadata = {
  title: 'Termos de Uso — SocialPro',
  description: 'Termos e condições de uso da plataforma SocialPro.',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-base font-bold text-white">{title}</h2>
      <div className="text-sm text-dark-muted leading-relaxed space-y-2">{children}</div>
    </section>
  );
}

export default function TermsPage() {
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
            <h1 className="text-3xl font-extrabold text-white">Termos de Uso</h1>
            <p className="text-sm text-dark-muted">Última atualização: 22 de junho de 2026</p>
          </div>
          <p className="text-sm text-dark-muted leading-relaxed">
            Ao acessar e usar o SocialPro, você concorda com os seguintes termos e condições. Leia atentamente antes de utilizar a plataforma.
          </p>
        </div>

        <div className="w-full h-px bg-white/5" />

        <div className="space-y-8">

          <Section title="1. Aceitação dos Termos">
            <p>Ao criar uma conta ou usar qualquer funcionalidade do SocialPro, você declara ter lido, compreendido e concordado com estes Termos de Uso e com nossa Política de Privacidade. Se não concordar, não utilize nossos serviços.</p>
          </Section>

          <Section title="2. Descrição do Serviço">
            <p>O SocialPro é uma plataforma SaaS (Software as a Service) que utiliza inteligência artificial para auxiliar criadores de conteúdo na criação, edição e publicação de carrosséis para Instagram e outras redes sociais.</p>
            <p>Os serviços incluem: geração de texto e imagens por IA; ferramentas de agendamento editorial; brand kit personalizado; e integração opcional com Instagram para publicação direta.</p>
          </Section>

          <Section title="3. Elegibilidade">
            <p>Você deve ter pelo menos 18 anos para usar o SocialPro. Ao aceitar estes termos, você declara ter capacidade legal plena para celebrar contratos.</p>
          </Section>

          <Section title="4. Conta de Usuário">
            <p>Você é responsável por manter a confidencialidade de suas credenciais de acesso. Notifique-nos imediatamente caso suspeite de acesso não autorizado à sua conta. O SocialPro não se responsabiliza por perdas decorrentes do uso não autorizado da sua conta.</p>
          </Section>

          <Section title="5. Uso Aceitável">
            <p>É proibido usar o SocialPro para: gerar conteúdo ilegal, difamatório, enganoso ou que viole direitos de terceiros; realizar engenharia reversa ou copiar nossa tecnologia; tentar comprometer a segurança da plataforma; ou violar os Termos de Serviço da Meta, Instagram ou qualquer outra plataforma integrada.</p>
          </Section>

          <Section title="6. Conteúdo Gerado por IA">
            <p>O conteúdo gerado pela IA do SocialPro é de natureza sugestiva e não substitui revisão humana. Você é inteiramente responsável pelo conteúdo que publicar usando nossa plataforma, incluindo sua veracidade, adequação e conformidade com leis aplicáveis.</p>
            <p>O SocialPro não garante que o conteúdo gerado seja livre de erros, viés ou inadequações.</p>
          </Section>

          <Section title="7. Propriedade Intelectual">
            <p><strong className="text-white">Conteúdo do usuário:</strong> Você mantém todos os direitos sobre o conteúdo que criar usando nossa plataforma. Ao usar o SocialPro, você nos concede licença limitada para processar e exibir seu conteúdo exclusivamente para fornecer o serviço.</p>
            <p><strong className="text-white">Nossa propriedade:</strong> O SocialPro, incluindo código, design, marca e tecnologia, é protegido por direitos autorais e outras leis de propriedade intelectual. É proibida qualquer reprodução sem autorização expressa.</p>
          </Section>

          <Section title="8. Pagamentos e Assinaturas">
            <p>Os planos pagos são cobrados mensalmente ou anualmente conforme escolhido. O cancelamento pode ser feito a qualquer momento pelo painel da conta. Não realizamos reembolsos por períodos parcialmente utilizados, exceto quando exigido por lei.</p>
            <p>O SocialPro se reserva o direito de alterar preços com aviso prévio de 30 dias.</p>
          </Section>

          <Section title="9. Limitação de Responsabilidade">
            <p>O SocialPro é fornecido &quot;como está&quot;, sem garantias de disponibilidade ininterrupta ou de resultados específicos. Em nenhuma circunstância nossa responsabilidade excederá o valor pago pelo usuário nos últimos 3 meses de serviço.</p>
          </Section>

          <Section title="10. Encerramento de Conta">
            <p>Você pode encerrar sua conta a qualquer momento. O SocialPro se reserva o direito de suspender ou encerrar contas que violem estes termos, sem aviso prévio em casos graves.</p>
          </Section>

          <Section title="11. Alterações nos Termos">
            <p>Podemos modificar estes termos periodicamente. Notificaremos usuários com pelo menos 15 dias de antecedência sobre alterações relevantes. O uso continuado após as alterações implica aceitação dos novos termos.</p>
          </Section>

          <Section title="12. Lei Aplicável">
            <p>Estes termos são regidos pelas leis da República Federativa do Brasil. O foro da comarca de São Paulo é eleito para dirimir quaisquer controvérsias.</p>
          </Section>

          <Section title="13. Contato">
            <p>Dúvidas sobre estes termos? Entre em contato: <strong className="text-white">contato@socialpro.ai</strong></p>
          </Section>
        </div>

        <div className="w-full h-px bg-white/5" />
        <div className="flex items-center justify-between text-xs text-dark-muted">
          <Link href="/" className="hover:text-white transition-colors">← Voltar ao início</Link>
          <div className="flex gap-4">
            <Link href="/privacy"       className="hover:text-white transition-colors">Privacidade</Link>
            <Link href="/data-deletion" className="hover:text-white transition-colors">Exclusão de Dados</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
