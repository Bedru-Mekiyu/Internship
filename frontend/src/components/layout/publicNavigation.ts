export type PublicNavLink = {
  label: string;
  to: string;
};

export type PublicFooterLink = PublicNavLink;

export type PublicFooterColumn = {
  title: string;
  links: PublicFooterLink[];
};

export const publicHeaderLinks: PublicNavLink[] = [
  { label: 'Features', to: '/#features' },
  { label: 'Courses', to: '/courses/explore' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'About', to: '/about' },
];

export const publicFooterColumns: PublicFooterColumn[] = [
  {
    title: 'Product',
    links: [
      { label: 'Features', to: '/#features' },
      { label: 'Courses', to: '/courses/explore' },
      { label: 'Pricing', to: '/pricing' },
      { label: 'Testimonials', to: '/#testimonials' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', to: '/about' },
      { label: 'Careers', to: '/careers' },
      { label: 'Blog', to: '/blog' },
      { label: 'Contact', to: '/contact' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Help Center', to: '/help' },
      { label: 'Docs', to: '/docs' },
      { label: 'Community', to: '/community' },
      { label: 'Status', to: '/status' },
    ],
  },
];

export const publicFooterLegalLinks: PublicFooterLink[] = [
  { label: 'Privacy', to: '/privacy' },
  { label: 'Terms', to: '/terms' },
  { label: 'Cookies', to: '/cookies' },
];

export function isPublicNavActive(currentPath: string, currentHash: string, target: string) {
  if (target.startsWith('/#')) {
    const hash = target.slice(1);
    return currentPath === '/' && currentHash === hash;
  }

  if (target === '/courses/explore' || target === '/courses') {
    return currentPath === '/courses/explore' || currentPath.startsWith('/courses/');
  }

  if (target === '/help') {
    return currentPath === '/help' || currentPath === '/help-center';
  }

  return currentPath === target;
}
