import { GITHUB_URL } from '@/lib/constants';

export const SITE_URL = 'https://fiducy.dev';
export const SITE_NAME = 'Fiducy';
export const SITE_TITLE = 'Fiducy: your users bring the keys, you never hold them';
export const SITE_DESCRIPTION =
  'Let users bring their own AI keys without storing them. A breach of your app leaks no keys.';
export const ISSUES_URL = `${GITHUB_URL}/issues`;
export const MAINTAINER_NAME = 'Benoni Taddesse';
export const MAINTAINER_CITY = 'San Francisco';
export const NEW_TAB = { target: '_blank', rel: 'noopener noreferrer' } as const;

export const ORGANIZATION_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/apple-touch-icon.png`,
  description: SITE_DESCRIPTION,
  founder: { '@type': 'Person', name: MAINTAINER_NAME },
  sameAs: [GITHUB_URL],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    url: `${SITE_URL}/contact`
  },
  address: {
    '@type': 'PostalAddress',
    addressLocality: MAINTAINER_CITY,
    addressRegion: 'CA',
    addressCountry: 'US'
  }
};
