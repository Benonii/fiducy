import { InfoPage } from '@/components/InfoPage';

import type { Metadata } from '@farm.js/core';

export const metadata: Metadata = {
  title: 'Privacy',
  description:
    'What the Fiducy website collects, where waitlist emails are stored, and how keys are handled.',
  alternates: { canonical: '/privacy' }
};

export default function PrivacyPage() {
  return (
    <InfoPage
      title="Privacy"
      intro="This page covers fiducy.dev, the website. It is short because the site collects very little. Last updated 2 November 2026."
      visual={{ caption: 'never whole outside the enclave' }}
      sections={[
        {
          title: 'What the website collects',
          body: (
            <>
              <p>
                The site uses Google Analytics 4 to count visits, pages viewed, and which buttons
                are used, such as copying the install command or joining the waitlist. Google
                Analytics sets cookies and records a truncated IP address, the browser type and the
                referring page. We use this only to understand how people find the site and what
                they read. No advertising networks run here and we do not sell or share visitor
                data.
              </p>
              <p>
                If you join the managed-service waitlist, we store the email address you typed, the
                page you signed up from, the referring site if your browser sent one, and the time.
                That record lives in a Convex database hosted in the United States. It is used for
                one purpose: to tell you when the managed service opens. We do not add you to a
                newsletter.
              </p>
            </>
          )
        },
        {
          title: 'Your choices',
          body: (
            <p>
              Browser extensions and the Do Not Track setting that block Google Analytics work as
              expected; the site renders fully without it. To remove your email from the waitlist,
              open an issue or a private report from the contact page with the address you used and
              it is deleted within a few days.
            </p>
          )
        },
        {
          title: 'What about the keys',
          body: (
            <p>
              This website never sees a provider key. Keys enter the system only through the Fiducy
              gateway widget inside an app that uses the SDK, where they are split and sealed inside
              an AWS Nitro enclave. The gateway stores sealed records and usage counts, never
              plaintext keys or prompts. Apps that self-host run all of that in their own AWS
              account, so their users are covered by that app’s privacy policy, not this one.
            </p>
          )
        }
      ]}
    />
  );
}
