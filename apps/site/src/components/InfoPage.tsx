import { SiteFooter } from '@/components/SiteFooter';
import { SiteNav } from '@/components/SiteNav';
import { DESCRIPTION_CLASS, SECTION_CLASS, SECTION_HEAD_CLASS, TITLE_CLASS } from '@/lib/styles';

import type { InfoPageProps, InfoSection } from '@/types';

const SECTION_TITLE_CLASS = 'text-[1.125rem] leading-[1.3] font-semibold tracking-[-0.02em]';
const BODY_CLASS = `${DESCRIPTION_CLASS} max-w-[64ch] text-[0.9375rem] [&_a]:text-ink [&_a]:underline [&_a]:underline-offset-4`;

function Section({ title, body }: InfoSection) {
  return (
    <section className="grid gap-3">
      <h2 className={SECTION_TITLE_CLASS}>{title}</h2>
      <div className={`${BODY_CLASS} grid gap-3`}>{body}</div>
    </section>
  );
}

export function InfoPage({ title, intro, sections }: InfoPageProps) {
  return (
    <div className="square-corners min-h-screen bg-white px-4 font-sans text-ink antialiased selection:bg-ink selection:text-white">
      <div className="mx-auto max-w-[1200px] divide-y divide-dashed divide-frame border-x border-frame">
        <SiteNav />
        <main className={SECTION_CLASS}>
          <div className={SECTION_HEAD_CLASS}>
            <h1 className={TITLE_CLASS}>{title}</h1>
            <p className={BODY_CLASS}>{intro}</p>
          </div>
          <div className="grid max-w-[720px] gap-8">
            {sections.map((section) => (
              <Section key={section.title} {...section} />
            ))}
          </div>
        </main>
        <SiteFooter />
      </div>
    </div>
  );
}
