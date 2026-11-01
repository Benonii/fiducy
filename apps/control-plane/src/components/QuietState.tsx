import type { QuietStateProps } from './types';

export function QuietState({ title, description, action }: QuietStateProps) {
  return (
    <div className="grid justify-items-start gap-1.5 border border-dashed px-5 py-8">
      <p className="font-medium text-foreground text-sm">{title}</p>
      <p className="max-w-sm text-ink-quiet text-xs leading-relaxed">{description}</p>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
