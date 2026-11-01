import { Meter, MeterIndicator, MeterTrack } from '@/components/ui/meter';

import { formatNumber } from './format';

import type { KeyLimitMeterProps } from './types';

export function KeyLimitMeter({ requestCount, monthlyLimit }: KeyLimitMeterProps) {
  const share = Math.min(100, (requestCount / Math.max(1, monthlyLimit)) * 100);
  return (
    <div className="grid min-w-32 gap-1.5">
      <Meter aria-label="Share of the monthly limit" max={100} value={share}>
        <MeterTrack className="h-1 bg-muted">
          <MeterIndicator className={share >= 90 ? 'bg-destructive' : 'bg-foreground'} />
        </MeterTrack>
      </Meter>
      <span className="text-ink-quiet text-xs tabular-nums">
        {formatNumber(requestCount)} of {formatNumber(monthlyLimit)}
      </span>
    </div>
  );
}
