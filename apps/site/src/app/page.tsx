import { CodeTabs } from '../components/CodeTabs';
import { InstallCommand } from '../components/InstallCommand';
import { KeyFlow } from '../components/KeyFlow';
import { Showcase } from '../components/Showcase';
import { DEMO_URL, GITHUB_URL, PROVIDERS } from '../lib/constants';

const LEAKS = [
  {
    what: 'Your database',
    result: 'Handles. They open nothing without the enclave and your app secret.'
  },
  {
    what: 'Your server logs',
    result: 'No plaintext key ever passes through your server, so none can be logged.'
  },
  {
    what: "Fiducy's storage",
    result: 'Sealed records. Half of every key lives only in your handle.'
  },
  {
    what: 'An AWS admin on our account',
    result: 'Nothing stored. KMS refuses to unwrap outside the attested enclave image.'
  }
];

export default function HomePage() {
  return (
    <div className="site">
      <div className="site-frame">
        <header className="site-nav">
          <a className="wordmark" href="/">
            Fiducy
          </a>
          <nav aria-label="Main">
            <a href="/docs">Docs</a>
            <a href={DEMO_URL}>Demo</a>
            <a href={GITHUB_URL}>GitHub</a>
          </nav>
        </header>

        <main className="site-main">
          <section className="hero">
            <h1>
              <span className="headline-quiet">Users bring keys.</span> You never hold them.
            </h1>
            <div className="hero-side">
              <p className="description">
                Fiducy seals the API keys your users paste in, inside an attested AWS Nitro enclave.
                Your app keeps a handle and calls models as usual.
              </p>
              <div className="hero-actions">
                <a className="button" href="/docs/quickstart">
                  Read the docs
                </a>
                <InstallCommand />
              </div>
            </div>
          </section>

          <Showcase />

          <dl className="strip">
            <dt>Works with</dt>
            {PROVIDERS.map((provider) => (
              <dd key={provider}>{provider}</dd>
            ))}
            <dt>Runs on</dt>
            <dd>AWS Nitro</dd>
          </dl>

          <section className="section">
            <div className="section-head">
              <h2>The key is only ever open inside the enclave</h2>
              <p className="description">
                Your server sends a handle with each model call. The enclave rebuilds the key from
                two halves, calls the provider, and drops it when the response ends.
              </p>
            </div>
            <KeyFlow />
          </section>

          <section className="section">
            <div className="section-head">
              <h2>Add it like an auth library</h2>
              <p className="description">
                A server instance, one integration line, a component, and settings for the AI SDK.
                Sealed records can live in your own database.
              </p>
            </div>
            <CodeTabs />
          </section>

          <section className="section">
            <div className="section-head">
              <h2>What a leak gets an attacker</h2>
              <p className="description">
                Anyone can check which code is running: <code>GET /attestation</code> returns an
                AWS-signed document with the enclave image hash.{' '}
                <a href="/docs/security">How to verify it</a>
              </p>
            </div>
            <dl className="leaks">
              {LEAKS.map((leak) => (
                <div key={leak.what}>
                  <dt>{leak.what}</dt>
                  <dd>{leak.result}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="section plans">
            <div>
              <h2>Self-host</h2>
              <p className="plan-price">Free and open source</p>
              <p className="description">
                Run the enclave, KMS key and storage in your own AWS account with one CloudFormation
                stack.
              </p>
              <a href="/docs/self-hosting">Self-hosting guide</a>
            </div>
            <div>
              <h2>Managed</h2>
              <p className="plan-price">Coming soon</p>
              <p className="description">
                We run the enclave, KMS and dashboard. You add the SDK and choose where records
                live.
              </p>
              <a href={DEMO_URL}>Try the demo</a>
            </div>
          </section>
        </main>

        <footer className="site-footer">
          <span className="wordmark">Fiducy</span>
          <a href="/docs">Docs</a>
          <a href={GITHUB_URL}>GitHub</a>
          <a href="/llms.txt">llms.txt</a>
        </footer>
      </div>
    </div>
  );
}
