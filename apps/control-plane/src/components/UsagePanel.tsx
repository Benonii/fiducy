import type { UsageSummary } from '@/lib/types';

interface UsagePanelProps {
  usage: UsageSummary | null;
}

export function UsagePanel({ usage }: UsagePanelProps) {
  if (!usage) return <p className="hint">Loading usage</p>;
  const keyCount = Object.keys(usage.requestsByKey).length;
  return (
    <section className="card stack" aria-label="Usage this month">
      <h2>Usage in {usage.month}</h2>
      <div className="stats">
        <div className="stat">
          <strong data-testid="request-count">{usage.requestCount}</strong>
          <span className="hint">requests</span>
        </div>
        <div className="stat">
          <strong>{usage.inputTokens}</strong>
          <span className="hint">input tokens</span>
        </div>
        <div className="stat">
          <strong>{usage.outputTokens}</strong>
          <span className="hint">output tokens</span>
        </div>
        <div className="stat">
          <strong>{keyCount}</strong>
          <span className="hint">active user keys</span>
        </div>
      </div>
      <p className="hint">Token counts only. Fiducy never stores prompts or replies.</p>
    </section>
  );
}
