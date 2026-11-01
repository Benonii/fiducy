export function Wordmark() {
  return (
    <a
      className="inline-flex items-center gap-2 font-semibold text-foreground tracking-tight no-underline"
      href="/"
    >
      <span aria-hidden="true" className="grid size-5 place-items-center border border-foreground">
        <span className="size-2 bg-foreground" />
      </span>
      Fiducy
    </a>
  );
}
