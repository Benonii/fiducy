import { buttonVariants } from '@/components/ui/button';

export default function HomePage() {
  return (
    <main className="grid gap-4">
      <h1 className="font-bold text-4xl text-foreground tracking-tight">
        Stop storing your users' API keys.
      </h1>
      <p className="max-w-xl text-muted-foreground text-sm">
        Fiducy keeps the keys your users bring in sealed storage. Your app keeps a handle, points
        its AI SDK at the Fiducy gateway, and never sees a plaintext key.
      </p>
      <div className="flex flex-wrap gap-2">
        <a className={buttonVariants()} href="/sign-up">
          Create an account
        </a>
        <a className={buttonVariants({ variant: 'outline' })} href="/sign-in">
          Sign in
        </a>
      </div>
    </main>
  );
}
