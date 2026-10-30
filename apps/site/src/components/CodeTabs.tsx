'use client';

import { useState } from 'react';

import { CODE_SAMPLES } from '@/lib/codeSamples';

export function CodeTabs() {
  const [activeID, setActiveID] = useState(CODE_SAMPLES[0]?.id);
  const active = CODE_SAMPLES.find((sample) => sample.id === activeID) ?? CODE_SAMPLES[0];

  return (
    <div className="code-tabs">
      <div className="code-tabs-list" role="tablist" aria-label="Integration code">
        {CODE_SAMPLES.map((sample) => (
          <button
            key={sample.id}
            type="button"
            role="tab"
            id={`tab-${sample.id}`}
            aria-selected={sample.id === active?.id}
            aria-controls="code-panel"
            onClick={() => setActiveID(sample.id)}
          >
            {sample.label}
          </button>
        ))}
      </div>
      <div
        className="code-panel"
        id="code-panel"
        role="tabpanel"
        aria-labelledby={`tab-${active?.id}`}
      >
        <p className="code-file">{active?.file}</p>
        <pre key={active?.id}>
          <code>{active?.code}</code>
        </pre>
      </div>
    </div>
  );
}
