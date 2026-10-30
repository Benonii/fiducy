'use client';

import { useState } from 'react';

import { cn } from '@/lib/utils';

import { formatCompact, formatDay, formatNumber } from './format';

import type { UsageBarsProps } from './types';

const METRIC_UNITS = {
  requestCount: 'requests',
  inputTokens: 'input tokens',
  outputTokens: 'output tokens'
};

export function UsageBars({ days, metric }: UsageBarsProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const values = days.map((day) => day[metric]);
  const peak = Math.max(1, ...values);
  const total = values.reduce((sum, value) => sum + value, 0);
  const activeDay = activeIndex === null ? null : days[activeIndex];
  const unit = METRIC_UNITS[metric];

  return (
    <div className="grid gap-3">
      <p aria-live="polite" className="flex items-baseline gap-2">
        <span className="font-medium text-2xl text-foreground tabular-nums tracking-tight">
          {formatNumber(activeDay ? activeDay[metric] : total)}
        </span>
        <span className="text-ink-quiet text-xs">
          {activeDay ? `${unit} on ${formatDay(activeDay.date)}` : `${unit} in ${days.length} days`}
        </span>
      </p>
      <div className="relative">
        <div className="pointer-events-none absolute inset-x-0 top-0 border-t border-dashed" />
        <span className="pointer-events-none absolute -top-4 right-0 text-[10px] text-ink-quiet tabular-nums">
          {formatCompact(peak)}
        </span>
        <div
          className="flex h-44 items-end gap-0.5 border-b border-foreground"
          onPointerLeave={() => setActiveIndex(null)}
        >
          {days.map((day, index) => (
            <div
              key={day.date}
              className="flex h-full flex-1 cursor-crosshair items-end justify-center"
              onPointerEnter={() => setActiveIndex(index)}
            >
              <div
                className={cn(
                  'w-full max-w-6 origin-bottom animate-bar-grow transition-colors',
                  activeIndex === null || activeIndex === index ? 'bg-bar' : 'bg-bar-muted'
                )}
                style={{
                  height: `${(day[metric] / peak) * 100}%`,
                  minHeight: day[metric] > 0 ? 2 : 0,
                  animationDelay: `${index * 12}ms`
                }}
              />
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-ink-quiet">
          <span>{days[0] ? formatDay(days[0].date) : ''}</span>
          <span>{days.at(-1) ? formatDay(days.at(-1)?.date ?? '') : ''}</span>
        </div>
      </div>
    </div>
  );
}
