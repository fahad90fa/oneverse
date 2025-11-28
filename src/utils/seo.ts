interface SEOMetadata {
  title: string;
  description: string;
  keywords: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  robotsIndex?: boolean;
  robotsFollow?: boolean;
}

export const updateSEOMetaTags = (metadata: SEOMetadata) => {
  document.title = metadata.title;

  const setOrUpdateMeta = (name: string, content: string, property?: boolean) => {
    let meta = document.querySelector(
      property ? `meta[property="${name}"]` : `meta[name="${name}"]`
    ) as HTMLMetaElement;

    if (!meta) {
      meta = document.createElement('meta');
      if (property) {
        meta.setAttribute('property', name);
      } else {
        meta.setAttribute('name', name);
      }
      document.head.appendChild(meta);
    }
    meta.content = content;
  };

  setOrUpdateMeta('description', metadata.description);
  setOrUpdateMeta('keywords', metadata.keywords);

  if (metadata.canonical) {
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.href = metadata.canonical;
  }

  setOrUpdateMeta('og:title', metadata.ogTitle || metadata.title, true);
  setOrUpdateMeta('og:description', metadata.ogDescription || metadata.description, true);
  setOrUpdateMeta('og:type', metadata.ogType || 'website', true);
  setOrUpdateMeta('og:url', metadata.canonical || 'https://oneverse.site', true);

  if (metadata.ogImage) {
    setOrUpdateMeta('og:image', metadata.ogImage, true);
  }

  setOrUpdateMeta('twitter:card', metadata.twitterCard || 'summary_large_image');
  setOrUpdateMeta('twitter:title', metadata.ogTitle || metadata.title);
  setOrUpdateMeta('twitter:description', metadata.ogDescription || metadata.description);

  if (metadata.ogImage) {
    setOrUpdateMeta('twitter:image', metadata.ogImage);
  }

  const robotsValue = [
    metadata.robotsIndex !== false ? 'index' : 'noindex',
    metadata.robotsFollow !== false ? 'follow' : 'nofollow'
  ].join(', ');
  setOrUpdateMeta('robots', robotsValue);
};

export const seoMetadata = {
  home: {
    title: 'OneVerse – All-In-One Freelance Marketplace | Hire Talent, Sell Products & Courses',
    description: 'OneVerse is your unified platform to hire talented freelancers, sell digital products, create & sell courses, and showcase your portfolio. Join 10K+ active users today.',
    keywords: 'freelance marketplace, hire talent, digital products, online courses, portfolio showcase, all-in-one platform, freelance jobs',
    canonical: 'https://oneverse.site',
    ogType: 'website'
  },
  products: {
    title: 'Buy & Sell Digital Products | OneVerse Marketplace',
    description: 'Discover thousands of high-quality digital products on OneVerse. Sell your own products easily or find exactly what you need. Growing community of creators & buyers.',
    keywords: 'digital products, marketplace, buy products online, sell digital items, e-commerce platform',
    canonical: 'https://oneverse.site/products'
  },
  hire: {
    title: 'Hire Freelancers & Talented Workers | OneVerse',
    description: 'Find and hire top freelancers for any project. Browse verified talent for web design, development, writing, and more. Fast hiring, secure payments.',
    keywords: 'hire freelancers, find contractors, freelance jobs, gig marketplace, hire talent online',
    canonical: 'https://oneverse.site/hire'
  },
  courses: {
    title: 'Learn Freelancing Skills | Online Courses | OneVerse Academy',
    description: 'Master freelancing, digital marketing, web development, and more. Learn from industry experts. Affordable courses to boost your freelance career.',
    keywords: 'online courses, freelance skills, learn freelancing, digital courses, skill development',
    canonical: 'https://oneverse.site/courses'
  },
  blog: {
    title: 'Freelancing Tips & Career Insights | OneVerse Blog',
    description: 'Get expert advice on freelancing, productivity, personal branding, and career growth. Real stories from successful OneVerse community members.',
    keywords: 'freelancing tips, career blog, productivity, business insights, freelancer resources',
    canonical: 'https://oneverse.site/blog'
  },
  careers: {
    title: 'Join Our Team | OneVerse Careers',
    description: 'Join OneVerse and help build the future of freelancing. Explore remote opportunities in engineering, design, marketing, and more.',
    keywords: 'careers, jobs, remote work, hiring, OneVerse jobs',
    canonical: 'https://oneverse.site/careers'
  },
  auth: {
    title: 'Sign In or Create Account | OneVerse',
    description: 'Join OneVerse today. Sign in to your account or create a new one to start hiring, selling, and growing your career.',
    keywords: 'login, signup, create account, authentication',
    robotsIndex: false,
    canonical: 'https://oneverse.site/auth'
  },
  dashboard: {
    title: 'Dashboard | OneVerse',
    description: 'Access your OneVerse dashboard to manage projects, earnings, and profile.',
    robotsIndex: false,
    robotsFollow: false,
    canonical: 'https://oneverse.site/dashboard'
  }
};
