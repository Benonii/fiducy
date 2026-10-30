import { CodeTabs } from '@/components/CodeTabs';
import { HeroStage } from '@/components/HeroStage';
import { InstallCommand } from '@/components/InstallCommand';
import { KeyFlow } from '@/components/KeyFlow';
import { LeakScenes } from '@/components/LeakScenes';
import { PlanCard } from '@/components/PlanCard';
import { ProviderStrip } from '@/components/ProviderStrip';
import { Showcase } from '@/components/Showcase';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteNav } from '@/components/SiteNav';
import { buttonVariants } from '@/components/ui/button';
import { DEMO_URL } from '@/lib/constants';
import { DESCRIPTION_CLASS, SECTION_CLASS, SECTION_HEAD_CLASS } from '@/lib/styles';
import { TITLE_CLASS } from '@/lib/styles';

export default function HomePage() {
  return (
    <div className="square-corners min-h-screen bg-white px-4 font-sans text-ink antialiased selection:bg-ink selection:text-white">
      <div className="mx-auto max-w-[1200px] divide-y divide-dashed divide-frame border-x border-frame">
        <SiteNav />

        <main className="divide-y divide-dashed divide-frame">
          <section className="grid items-center gap-8 px-gutter py-16 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:py-20">
            <div className="grid gap-7">
              <h1 className="grid text-[clamp(2.5rem,4.6vw,4rem)] leading-none font-bold tracking-[-0.05em] text-balance">
                <span className="animate-rise-in text-ink-quiet">Users bring keys.</span>
                <span className="animate-rise-in [animation-delay:120ms]">
                  You never hold them.
                </span>
              </h1>
              <div className="grid gap-6 animate-rise-in [animation-delay:240ms]">
                <p className={`${DESCRIPTION_CLASS} max-w-[46ch] text-[0.9375rem]`}>
                  Fiducy seals the API keys your users paste in, inside an attested AWS Nitro
                  enclave. Your app keeps a handle and calls models as usual.
                </p>
                <div className="flex flex-wrap items-center gap-2.5 sm:flex-nowrap">
                  <a className={buttonVariants({ size: 'lg' })} href="/docs/quickstart">
                    Read the docs
                  </a>
                  <InstallCommand />
                </div>
              </div>
            </div>
            <HeroStage />
          </section>

          <Showcase />
          <ProviderStrip />

          <section className={SECTION_CLASS}>
            <div className={SECTION_HEAD_CLASS}>
              <h2 className={TITLE_CLASS}>The key is only ever open inside the enclave</h2>
              <p className={DESCRIPTION_CLASS}>
                Your server sends a handle with each model call. The enclave rebuilds the key from
                two halves, calls the provider, and drops it when the response ends.
              </p>
            </div>
            <KeyFlow />
          </section>

          <section className={SECTION_CLASS}>
            <div className={SECTION_HEAD_CLASS}>
              <h2 className={TITLE_CLASS}>Four pieces, all in your codebase</h2>
              <p className={DESCRIPTION_CLASS}>
                A server instance, one integration line, the key widget, and provider settings for
                the AI SDK. Sealed records can live in your own database.
              </p>
            </div>
            <CodeTabs />
          </section>

          <section className={`${SECTION_CLASS} pb-0 max-md:pb-0`}>
            <div className={SECTION_HEAD_CLASS}>
              <h2 className={TITLE_CLASS}>What a leak gets an attacker</h2>
              <p className={DESCRIPTION_CLASS}>
                Anyone can check which code is running:{' '}
                <code className="font-mono text-[0.95em] text-ink">GET /attestation</code> returns
                an AWS-signed document with the enclave image hash.{' '}
                <a className="underline underline-offset-4" href="/docs/security">
                  How to verify it
                </a>
              </p>
            </div>
            <LeakScenes />
          </section>

          <section className="grid divide-dashed divide-frame max-md:divide-y md:grid-cols-2 md:divide-x">
            <PlanCard
              title="Self-host"
              price="Free and open source"
              description="Run the enclave, KMS key and storage in your own AWS account with one CloudFormation stack."
              linkLabel="Self-hosting guide"
              linkURL="/docs/self-hosting"
            />
            <PlanCard
              title="Managed"
              price="Coming soon"
              description="We run the enclave, KMS and dashboard. You add the SDK and choose where records live."
              linkLabel="Try the demo"
              linkURL={DEMO_URL}
            />
          </section>
        </main>

        <SiteFooter />
      </div>
    </div>
  );
}
