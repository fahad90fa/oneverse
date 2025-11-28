export const addJsonLdSchema = (schema: Record<string, any>) => {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);

  return () => {
    script.remove();
  };
};

export const schemas = {
  organization: {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "OneVerse",
    "url": "https://oneverse.site",
    "logo": "https://oneverse.site/public/logo.png",
    "description": "All-in-one freelance marketplace platform for hiring talent, selling products, courses, and showcasing portfolios",
    "sameAs": [
      "https://twitter.com/oneverse",
      "https://facebook.com/oneverse",
      "https://linkedin.com/company/oneverse"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Support",
      "email": "support@oneverse.site"
    }
  },

  website: {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "OneVerse",
    "url": "https://oneverse.site",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://oneverse.site/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  },

  marketplace: {
    "@context": "https://schema.org",
    "@type": "Marketplace",
    "name": "OneVerse",
    "url": "https://oneverse.site",
    "description": "Unified platform for freelancing, digital products, courses, and portfolio showcase",
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    }
  },

  breadcrumbs: (items: Array<{name: string, url: string}>) => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  }),

  product: (product: {name: string, description: string, price: number, image: string, url: string}) => ({
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": product.image,
    "url": product.url,
    "offers": {
      "@type": "Offer",
      "priceCurrency": "USD",
      "price": product.price.toString(),
      "availability": "https://schema.org/InStock"
    }
  }),

  course: (course: {name: string, description: string, instructor: string, url: string}) => ({
    "@context": "https://schema.org",
    "@type": "Course",
    "name": course.name,
    "description": course.description,
    "url": course.url,
    "provider": {
      "@type": "Organization",
      "name": "OneVerse",
      "sameAs": "https://oneverse.site"
    },
    "instructor": {
      "@type": "Person",
      "name": course.instructor
    }
  }),

  article: (article: {headline: string, description: string, image: string, author: string, datePublished: string, url: string}) => ({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": article.headline,
    "description": article.description,
    "image": article.image,
    "author": {
      "@type": "Person",
      "name": article.author
    },
    "datePublished": article.datePublished,
    "mainEntityOfPage": article.url
  })
};
