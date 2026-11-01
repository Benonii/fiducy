import { CodeTabs } from '@/components/CodeTabs';
import { CopyAgentPrompt } from '@/components/CopyAgentPrompt';
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
                  With Fiducy, your app uses your users' AI keys without ever storing or seeing
                  them. Their keys, none of the risk.
                </p>
                <div className="grid gap-3">
                  <div className="flex flex-wrap items-center gap-2.5 max-sm:[&>a]:w-full sm:flex-nowrap">
                    <a className={buttonVariants({ size: 'lg' })} href="/docs/quickstart">
                      Read the docs
                    </a>
                    <InstallCommand />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2 max-sm:[&>button]:w-full">
                    <CopyAgentPrompt />
                    <span className="text-xs text-ink-muted">
                      Your coding agent sets it up. Secrets stay with you.
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <HeroStage />
          </section>

          <Showcase />
          <ProviderStrip />

          <section className={SECTION_CLASS}>
            <div className={SECTION_HEAD_CLASS}>
              <h2 className={TITLE_CLASS}>A breach can't leak what you never stored</h2>
              <p className={DESCRIPTION_CLASS}>
                Your app keeps a handle, not a key. The real key exists for one request inside a
                sealed enclave, then it is gone.
              </p>
            </div>
            <KeyFlow />
          </section>

          <section className={SECTION_CLASS}>
            <div className={SECTION_HEAD_CLASS}>
              <h2 className={TITLE_CLASS}>Ship bring-your-own-key this week</h2>
              <p className={DESCRIPTION_CLASS}>
                No crypto to write and no key vault to run. Four small pieces drop into the app you
                already have, and your model calls look the same as before.
              </p>
              <div className="pt-1 max-sm:[&>button]:w-full">
                <CopyAgentPrompt />
              </div>
            </div>
            <CodeTabs />
          </section>

          <section className={`${SECTION_CLASS} pb-0 max-md:pb-0`}>
            <div className={SECTION_HEAD_CLASS}>
              <h2 className={TITLE_CLASS}>When something leaks, your users' keys don't</h2>
              <p className={DESCRIPTION_CLASS}>
                Users don't have to take your word for it.{' '}
                <code className="font-mono text-[0.95em] text-ink">GET /attestation</code> proves
                which code holds their key, signed by AWS.{' '}
                <a className="underline underline-offset-4" href="/docs/security">
                  How to check it
                </a>
              </p>
            </div>
            <LeakScenes />
          </section>

          <section className="grid divide-dashed divide-frame max-md:divide-y md:grid-cols-2 md:divide-x">
            <PlanCard
              title="Self-host"
              price="Free and open source"
              description="Keep every key in your own AWS account. One CloudFormation stack, and nothing leaves your infrastructure."
              linkLabel="Self-hosting guide"
              linkURL="/docs/self-hosting"
            />
            <PlanCard
              title="Managed"
              price="Coming soon"
              description="Skip the infrastructure. We run the enclave and the dashboard, you add the SDK."
              linkLabel={DEMO_URL ? 'Try the demo' : 'Read the quickstart'}
              linkURL={DEMO_URL ?? '/docs/quickstart'}
            />
          </section>
        </main>

        <SiteFooter />
      </div>
    </div>
  );
}
