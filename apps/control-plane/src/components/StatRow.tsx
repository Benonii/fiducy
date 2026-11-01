import type { StatRowProps } from './types';

export function StatRow({ stats }: StatRowProps) {
  return (
    <dl className="grid grid-cols-2 border-t border-l lg:grid-cols-4">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className="grid animate-rise-in content-start gap-2 border-r border-b p-5"
          style={{ animationDelay: `${index * 60}ms` }}
        >
          <dt className="text-muted-foreground text-xs">{stat.label}</dt>
          <dd
            className="font-medium text-3xl text-foreground tabular-nums tracking-tight"
            data-testid={stat.testID}
          >
            {stat.value}
          </dd>
          <dd className="text-ink-quiet text-xs">{stat.detail}</dd>
        </div>
      ))}
    </dl>
  );
}
