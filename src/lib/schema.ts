const SITE_URL = "https://sharvinshah.com";

export function personSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Sharvin Shah",
    url: SITE_URL,
    image: `${SITE_URL}/og-default.png`,
    jobTitle: "CEO & Chief AI Officer",
    worksFor: {
      "@type": "Organization",
      name: "MTechZilla",
      url: "https://www.mtechzilla.com",
    },
    sameAs: [
      "https://x.com/sharvinshah26",
      "https://www.linkedin.com/in/sharvinshah/",
      "https://github.com/Sharvin26",
    ],
  };
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "MTechZilla",
    url: "https://www.mtechzilla.com",
    founder: {
      "@type": "Person",
      name: "Sharvin Shah",
    },
    sameAs: ["https://www.linkedin.com/in/sharvinshah/"],
  };
}

interface ArticleProps {
  title: string;
  description: string;
  slug: string;
  publishDate: Date;
  updatedDate?: Date;
}

export function articleSchema({ title, description, slug, publishDate, updatedDate }: ArticleProps) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url: `${SITE_URL}/guides/${slug}`,
    datePublished: publishDate.toISOString(),
    dateModified: (updatedDate ?? publishDate).toISOString(),
    author: {
      "@type": "Person",
      name: "Sharvin Shah",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "MTechZilla",
      url: "https://www.mtechzilla.com",
    },
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function faqSchema(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
