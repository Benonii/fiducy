'use client';

import { Dithering } from '@paper-design/shaders-react';
import { useEffect, useRef, useState } from 'react';

const SHADER_SPEED = 0.35;

const TRACE = [
  { step: 'handle received', detail: 'kh_9f2c…' },
  { step: 'enclave attested', detail: 'PCR0 a41e…' },
  { step: 'key opened', detail: 'in memory' },
  { step: 'openai', detail: '200 · streamed' },
  { step: 'key dropped', detail: 'request ended' }
];

// A still of the product doing its job, sitting on a slow dithered field.
// The shader pauses offscreen and for visitors who prefer reduced motion.
export function Showcase() {
  const frameRef = useRef<HTMLElement>(null);
  const [speed, setSpeed] = useState(0);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const observer = new IntersectionObserver(([entry]) => {
      setSpeed(entry?.isIntersecting && !reducedMotion.matches ? SHADER_SPEED : 0);
    });
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={frameRef} className="showcase" aria-label="Fiducy in a chat app">
      <Dithering
        className="showcase-field"
        colorBack="#ffffff"
        colorFront="#cfcfcf"
        shape="warp"
        type="4x4"
        size={2.5}
        speed={speed}
        scale={1.2}
      />
      <div className="mock">
        <div className="mock-widget">
          <p className="mock-title">Connect your OpenAI key</p>
          <div className="mock-field">
            <span>••••••••••••••••••••XWYZ</span>
            <span className="mock-button">Save key</span>
          </div>
          <p className="mock-note">Acme Chat never sees your key. It is sealed in an enclave.</p>
        </div>
        <div className="mock-chat">
          <p className="mock-bubble mock-user">Summarize this contract in three lines.</p>
          <p className="mock-bubble mock-assistant">
            The vendor licenses the software for 12 months, renews automatically, and either side
            can end it with 30 days notice.
          </p>
          <div className="mock-composer">
            <span>Send a message</span>
            <span className="mock-model">gpt-4o-mini · your key</span>
          </div>
        </div>
        <ol className="mock-trace">
          {TRACE.map((entry) => (
            <li key={entry.step}>
              <span>{entry.step}</span>
              <span>{entry.detail}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
