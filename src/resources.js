// Stub resources for build compatibility

export const baseURL = 'https://example.com';

export const blog = {
  title: 'CHWOne Blog',
  description: 'Latest news and updates from the CHWOne platform',
  path: '/blog'
};

export const person = {
  name: 'CHWOne Team',
  email: 'contact@example.com'
};

export const newsletter = {
  title: 'Subscribe to our newsletter',
  description: 'Get the latest updates delivered to your inbox'
};

export const socialSharing = {
  twitter: {
    url: 'https://twitter.com/intent/tweet',
    label: 'Share on Twitter'
  },
  facebook: {
    url: 'https://www.facebook.com/sharer/sharer.php',
    label: 'Share on Facebook'
  },
  linkedin: {
    url: 'https://www.linkedin.com/sharing/share-offsite/',
    label: 'Share on LinkedIn'
  }
};

export const gallery = {
  title: 'CHWOne Gallery',
  description: 'View our latest images and media',
  items: [
    { id: '1', title: 'Community Health Workshop', image: '/images/placeholder-1.jpg' },
    { id: '2', title: 'Regional Training Event', image: '/images/placeholder-2.jpg' },
    { id: '3', title: 'CHW Certification Ceremony', image: '/images/placeholder-3.jpg' }
  ]
};

export const fonts = {
  sans: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  display: '"Playfair Display", Georgia, serif'
};

export const routes = {
  main: [
    { path: '/', label: 'Home' },
    { path: '/blog', label: 'Blog' },
    { path: '/work', label: 'Work' },
    { path: '/contact', label: 'Contact' }
  ],
  footer: [
    { path: '/privacy', label: 'Privacy Policy' },
    { path: '/terms', label: 'Terms of Service' },
    { path: '/sitemap.xml', label: 'Sitemap' }
  ]
};

export const work = {
  title: 'Our Work',
  description: 'Explore our projects and case studies',
  projects: [
    { id: 'project-1', title: 'Community Health Initiative', slug: 'community-health-initiative' },
    { id: 'project-2', title: 'Rural Healthcare Access', slug: 'rural-healthcare-access' },
    { id: 'project-3', title: 'Urban Wellness Program', slug: 'urban-wellness-program' }
  ]
};

export default {
  baseURL,
  blog,
  person,
  newsletter,
  socialSharing,
  gallery,
  fonts,
  routes,
  work
};
