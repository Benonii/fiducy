import { InfoPage } from '@/components/InfoPage';
import { GITHUB_URL } from '@/lib/constants';
import { MAINTAINER_CITY, MAINTAINER_NAME, NEW_TAB } from '@/lib/site';

import type { Metadata } from '@farm.js/core';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Who builds Fiducy, why it exists, and how the bring-your-own-key custody layer is run.',
  alternates: { canonical: '/about' }
};

export default function AboutPage() {
  return (
    <InfoPage
      title="About Fiducy"
      intro="Fiducy is a key custody layer for apps where users bring their own AI provider key. Your app keeps a handle, the real key lives sealed inside an enclave, and a breach of your database or logs exposes nothing a thief can use."
      sections={[
        {
          title: 'Who runs it',
          body: (
            <p>
              Fiducy is built and run by {MAINTAINER_NAME}, an independent software engineer based
              in {MAINTAINER_CITY}. The code is open source under the Apache 2.0 license at{' '}
              <a href={GITHUB_URL} {...NEW_TAB}>
                github.com/Benonii/fiducy
              </a>
              , so you can read every line that touches a key before you trust it with one.
            </p>
          )
        },
        {
          title: 'Why it exists',
          body: (
            <>
              <p>
                Bring-your-own-key is the honest way to ship an AI product: users pay their provider
                directly and you never mark up tokens. The catch is custody. Storing user keys in
                your own database turns one leak or one careless log line into every key you hold.
                Fiducy splits each key in two, seals one half in an AWS Nitro enclave that even an
                AWS admin cannot open, and hands your app a handle that is useless on its own.
              </p>
              <p>
                The gateway, the dashboard and the SDK are all free to self-host. A managed version,
                where we run the enclave and the dashboard for you, is on the way; the waitlist on
                the home page is the only place to sign up.
              </p>
            </>
          )
        },
        {
          title: 'How to reach us',
          body: (
            <p>
              Questions, bug reports and feature requests go to the{' '}
              <a href="/contact">contact page</a>, which lists the channels we read. The{' '}
              <a href="/privacy">privacy page</a> explains what this website collects and what
              happens to a key once it enters the system.
            </p>
          )
        }
      ]}
    />
  );
}
