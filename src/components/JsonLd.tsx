// JSON-LD structured data for Google Rich Results
export function OrganizationJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'SocialPro AI',
          url: 'https://socialproai.com',
          logo: 'https://socialproai.com/socialpro-logo-1024.png',
          description: 'Plataforma de criação de carrosséis para Instagram com Inteligência Artificial.',
          contactPoint: {
            '@type': 'ContactPoint',
            email: 'contato@socialproai.com',
            contactType: 'customer support',
            availableLanguage: ['Portuguese', 'English', 'Spanish'],
          },
          sameAs: ['https://instagram.com/socialproai'],
        }),
      }}
    />
  );
}

export function SoftwareApplicationJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'SocialPro',
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'Web',
          url: 'https://socialproai.com',
          description: 'Crie carrosséis cinematográficos para Instagram com IA em segundos. Geração de imagens, texto e publicação automática.',
          offers: [
            {
              '@type': 'Offer',
              price: '29.99',
              priceCurrency: 'BRL',
              name: 'Pro',
              description: '25 carrosséis/mês com IA',
            },
            {
              '@type': 'Offer',
              price: '79.99',
              priceCurrency: 'BRL',
              name: 'Agency',
              description: '60 carrosséis/mês com IA',
            },
          ],
          featureList: [
            'Geração de carrosséis com IA',
            'Imagens geradas por IA (gpt-image-2)',
            'Publicação direta no Instagram',
            'Calendário editorial',
            'Analytics de conteúdo',
            'Brand Kit personalizado',
          ],
        }),
      }}
    />
  );
}

export function WebSiteJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'SocialPro',
          url: 'https://socialproai.com',
          potentialAction: {
            '@type': 'SearchAction',
            target: 'https://socialproai.com/login',
            'query-input': 'required name=search_term_string',
          },
        }),
      }}
    />
  );
}

export function PricingJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: 'SocialPro Pro',
          description: 'Plano Pro do SocialPro — 25 carrosséis/mês com IA, publicação no Instagram e mais.',
          brand: { '@type': 'Brand', name: 'SocialPro AI' },
          offers: {
            '@type': 'Offer',
            price: '29.99',
            priceCurrency: 'BRL',
            priceValidUntil: '2027-12-31',
            availability: 'https://schema.org/InStock',
            url: 'https://socialproai.com/pricing',
          },
        }),
      }}
    />
  );
}
