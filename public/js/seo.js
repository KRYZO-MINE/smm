(() => {
  const page = document.title || 'SMM Vault Panel';
  const description =
    'SMM Vault is a premium social media marketing panel for reliable campaign delivery, clear pricing, and order control.';
  const canonical = location.origin + (location.pathname === '/' ? '/home' : location.pathname);
  const tags = [
    ['description', description],
    ['og:title', page],
    ['og:description', description],
    ['og:type', 'website'],
    ['og:url', canonical],
    ['og:image', location.origin + '/images/og-image.svg'],
    ['twitter:card', 'summary_large_image'],
    ['twitter:title', page],
    ['twitter:description', description],
    ['twitter:image', location.origin + '/images/og-image.svg'],
  ];
  tags.forEach(([name, content]) => {
    const key = name.startsWith('og:') || name.startsWith('twitter:') ? 'property' : 'name';
    const tag = document.createElement('meta');
    tag.setAttribute(key, name);
    tag.content = content;
    document.head.appendChild(tag);
  });
  const link = document.createElement('link');
  link.rel = 'canonical';
  link.href = canonical;
  document.head.appendChild(link);
})();
