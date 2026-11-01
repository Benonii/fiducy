import { PROVIDERS } from '@/lib/constants';

const NODE_CLASS = '[&_rect]:fill-white [&_rect]:stroke-control [&_rect]:[stroke-dasharray:3_3]';
const HUB_CLASS = '[&_rect]:fill-wash [&_rect]:stroke-ink';
const LINE_CLASS = 'fill-none stroke-ink stroke-[1.25]';
const HANDLE_LINE_CLASS = 'fill-none stroke-ink-quiet stroke-[1.25] [stroke-dasharray:4_5]';
const NODE_TITLE_CLASS = 'fill-ink text-[15px] font-[650]';
const DETAIL_CLASS = 'fill-ink-muted text-xs font-light';
const PULSE_CLASS = 'fill-ink motion-reduce:hidden';
const HANDLE_PULSE_CLASS = 'fill-ink-quiet motion-reduce:hidden';
const CYCLE_SECONDS = 8;
const PROVIDER_ROWS = [44, 124, 204, 284];

function providerPath(rowTop: number) {
  const y = rowTop + 26;
  return `M580 190 C 660 190, 660 ${y}, 740 ${y}`;
}

function HorizontalFlow() {
  return (
    <svg
      className="h-auto w-full overflow-visible max-md:hidden"
      viewBox="0 0 960 360"
      role="img"
      aria-labelledby="flow-title"
    >
      <title id="flow-title">
        Your app sends a handle to the Fiducy enclave, which opens the key and calls the provider
      </title>
      <path className={HANDLE_LINE_CLASS} d="M240 190 H380" />
      {PROVIDER_ROWS.map((rowTop) => (
        <path key={rowTop} className={LINE_CLASS} d={providerPath(rowTop)} />
      ))}

      <text className={DETAIL_CLASS} x="310" y="176" textAnchor="middle">
        handle
      </text>
      <text className={DETAIL_CLASS} x="660" y="28" textAnchor="middle">
        key, opened for one request
      </text>

      <g className={NODE_CLASS}>
        <rect x="40" y="150" width="200" height="80" />
        <text className={NODE_TITLE_CLASS} x="60" y="184">
          Your app
        </text>
        <text className={DETAIL_CLASS} x="60" y="208">
          stores kh_9f2c…
        </text>
      </g>

      <g className={HUB_CLASS}>
        <rect x="380" y="126" width="200" height="128" />
        <text className={NODE_TITLE_CLASS} x="400" y="168">
          Fiducy enclave
        </text>
        <text className={DETAIL_CLASS} x="400" y="192">
          attested by AWS
        </text>
        <text className={DETAIL_CLASS} x="400" y="212">
          keeps nothing after
        </text>
        <text className={DETAIL_CLASS} x="400" y="232">
          the call ends
        </text>
      </g>

      {PROVIDERS.map((provider, index) => {
        const rowTop = PROVIDER_ROWS[index] ?? 0;
        return (
          <g key={provider} className={NODE_CLASS}>
            <rect x="740" y={rowTop} width="180" height="52" />
            <text className={NODE_TITLE_CLASS} x="760" y={rowTop + 31}>
              {provider}
            </text>
          </g>
        );
      })}

      <circle className={HANDLE_PULSE_CLASS} r="4">
        <animateMotion
          dur={`${CYCLE_SECONDS / 4}s`}
          repeatCount="indefinite"
          path="M240 190 H380"
          keyPoints="0;1;1"
          keyTimes="0;0.55;1"
          calcMode="linear"
        />
      </circle>
      {PROVIDER_ROWS.map((rowTop, index) => (
        <circle key={rowTop} className={PULSE_CLASS} r="4" opacity="0">
          <animateMotion
            dur={`${CYCLE_SECONDS}s`}
            begin={`${index * (CYCLE_SECONDS / 4) + 1.1}s`}
            repeatCount="indefinite"
            path={providerPath(rowTop)}
            keyPoints="0;1;1"
            keyTimes="0;0.11;1"
            calcMode="linear"
          />
          <animate
            attributeName="opacity"
            dur={`${CYCLE_SECONDS}s`}
            begin={`${index * (CYCLE_SECONDS / 4) + 1.1}s`}
            repeatCount="indefinite"
            values="1;1;0;0"
            fill="freeze"
            keyTimes="0;0.11;0.12;1"
          />
        </circle>
      ))}
    </svg>
  );
}

function StackedFlow() {
  return (
    <svg
      className="mx-auto hidden h-auto w-full max-w-[360px] overflow-visible max-md:block"
      viewBox="0 0 360 476"
      role="img"
      aria-labelledby="flow-title-narrow"
    >
      <title id="flow-title-narrow">
        Your app sends a handle to the Fiducy enclave, which opens the key and calls the provider
      </title>
      <path className={HANDLE_LINE_CLASS} d="M180 84 V164" />
      <path className={LINE_CLASS} d="M180 292 V372" />
      <text className={DETAIL_CLASS} x="194" y="128">
        handle
      </text>
      <text className={DETAIL_CLASS} x="194" y="336">
        key, opened for one request
      </text>
      <g className={NODE_CLASS}>
        <rect x="70" y="20" width="220" height="64" />
        <text className={NODE_TITLE_CLASS} x="90" y="48">
          Your app
        </text>
        <text className={DETAIL_CLASS} x="90" y="70">
          stores kh_9f2c…
        </text>
      </g>
      <g className={HUB_CLASS}>
        <rect x="70" y="164" width="220" height="128" />
        <text className={NODE_TITLE_CLASS} x="90" y="202">
          Fiducy enclave
        </text>
        <text className={DETAIL_CLASS} x="90" y="226">
          attested by AWS
        </text>
        <text className={DETAIL_CLASS} x="90" y="246">
          keeps nothing after
        </text>
        <text className={DETAIL_CLASS} x="90" y="266">
          the call ends
        </text>
      </g>
      <g className={NODE_CLASS}>
        <rect x="70" y="372" width="220" height="84" />
        <text className={NODE_TITLE_CLASS} x="90" y="402">
          Your user's provider
        </text>
        <text className={DETAIL_CLASS} x="90" y="424">
          {PROVIDERS.slice(0, 2).join(', ')},
        </text>
        <text className={DETAIL_CLASS} x="90" y="442">
          {PROVIDERS.slice(2).join(', ')}
        </text>
      </g>
      <circle className={PULSE_CLASS} r="4">
        <animateMotion dur="3s" repeatCount="indefinite" path="M180 84 V164 M180 292 V372" />
      </circle>
    </svg>
  );
}

export function KeyFlow() {
  return (
    <figure className="py-2">
      <HorizontalFlow />
      <StackedFlow />
    </figure>
  );
}
