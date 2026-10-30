'use client';

import { useEffect, useState } from 'react';

import { REQUEST_TRACE } from '../lib/constants';
import { LiquidFormBackground } from '../shaders/liquid-form/LiquidFormBackground';

const TRACE_STEP_MILLISECONDS = 1800;

export function HeroStage() {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reducedMotion.matches) return;
    const timer = window.setInterval(() => {
      setStepIndex((index) => (index + 1) % REQUEST_TRACE.length);
    }, TRACE_STEP_MILLISECONDS);
    return () => window.clearInterval(timer);
  }, []);

  const currentStep = REQUEST_TRACE[stepIndex];

  return (
    <figure className="hero-stage">
      <div className="shader-frame">
        <LiquidFormBackground
          speed={1.0}
          morph={1.0}
          noiseScale={1.0}
          mouseAmount={0.15}
          metal={1.0}
          camera={5.5}
          tintHue={220}
          tintAmount={0.0}
        />
      </div>
      <div className="stage-overlay" aria-hidden="true">
        <span className="stage-corner stage-corner-top-left" />
        <span className="stage-corner stage-corner-top-right" />
        <span className="stage-corner stage-corner-bottom-left" />
        <span className="stage-corner stage-corner-bottom-right" />
        <p className="stage-chip">
          <span className="stage-dot" />
          Nitro enclave · attested
        </p>
        <ol className="stage-trace">
          {REQUEST_TRACE.map((entry, index) => (
            <li key={entry.step} data-state={traceState(index, stepIndex)}>
              <span>{entry.step}</span>
              <span>{entry.detail}</span>
            </li>
          ))}
        </ol>
        <p className="stage-readout" key={currentStep?.step}>
          {currentStep?.detail}
        </p>
      </div>
      <figcaption className="stage-caption">
        <span>A key is opened in here for one request, then dropped.</span>
        <span>Move your pointer over the form</span>
      </figcaption>
    </figure>
  );
}

function traceState(index: number, stepIndex: number): string {
  if (index === stepIndex) return 'current';
  if (index < stepIndex) return 'done';
  return 'waiting';
}
