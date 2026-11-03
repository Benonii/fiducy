import { InfoPage } from '@/components/InfoPage';
import { GITHUB_URL } from '@/lib/constants';
import { ISSUES_URL, MAINTAINER_CITY, MAINTAINER_NAME, NEW_TAB } from '@/lib/site';

import type { Metadata } from '@farm.js/core';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'How to reach the people behind Fiducy for support, security reports and questions.',
  alternates: { canonical: '/contact' }
};

export default function ContactPage() {
  return (
    <InfoPage
      title="Contact"
      intro={`Fiducy is run by ${MAINTAINER_NAME} from ${MAINTAINER_CITY}. Every channel below is read by a person, usually within a working day.`}
      visual={{ caption: 'half with you, half with us' }}
      sections={[
        {
          title: 'Bugs, questions and feature requests',
          body: (
            <p>
              Open an issue at{' '}
              <a href={ISSUES_URL} {...NEW_TAB}>
                github.com/fiducy-dev/fiducy/issues
              </a>
              . Include the SDK version, the framework you integrate with, and the exact response
              you saw. Pull requests are welcome; the repository README explains how to run the
              gateway and the control plane locally.
            </p>
          )
        },
        {
          title: 'Security reports',
          body: (
            <p>
              If you believe you found a way to recover a user key, bypass attestation, or read
              another app's records, do not post it publicly. Use the private vulnerability report
              form on the{' '}
              <a href={`${GITHUB_URL}/security`} {...NEW_TAB}>
                repository security tab
              </a>
              . You will get an acknowledgement within two days and a fix or a mitigation plan
              before any public disclosure.
            </p>
          )
        },
        {
          title: 'Managed service',
          body: (
            <p>
              The hosted version is not open yet. Leave your email on the{' '}
              <a href="/#managed">waitlist</a> and you hear first; we send one email when it opens
              and nothing else.
            </p>
          )
        }
      ]}
    />
  );
}
