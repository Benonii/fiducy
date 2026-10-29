export default function HomePage() {
  return (
    <main className="stack">
      <h1>Stop storing your users' API keys.</h1>
      <p className="hint">
        Fiducy keeps the keys your users bring in sealed storage. Your app keeps a handle, points
        its AI SDK at the Fiducy gateway, and never sees a plaintext key.
      </p>
      <div className="row">
        <a className="button-link" href="/sign-up">
          Create an account
        </a>
        <a className="button-link secondary" href="/sign-in">
          Sign in
        </a>
      </div>
    </main>
  );
}
