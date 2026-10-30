import { IsoScene } from './IsoScene';
import { Box, Line, Plate, Tag, offset } from './isometric';

import type { CSSProperties } from 'react';
import type { LeakScene } from '../types';

function moves(variables: Record<string, string>): CSSProperties {
  return variables as CSSProperties;
}

const LOG_LINE_LENGTHS = [5.2, 3.6, 4.4, 2.8, 5.6, 3.2, 4.8, 2.4];
const HANDLE_SLOTS: [number, number][] = [
  [0.6, 0.7],
  [2.4, 0.7],
  [4.2, 0.7],
  [0.6, 2.6],
  [4.2, 2.6],
  [0.6, 4.5],
  [2.4, 4.5],
  [4.2, 4.5]
];

function DatabaseScene() {
  return (
    <>
      <Plate at={[-1.5, -1.5, 0]} size={[9, 9]} className="iso-ghost" />
      {[0, 1.5, 3].map((z) => (
        <Box key={z} at={[0, 0, z]} size={[6, 6, 1.1]}>
          <Line from={[0.6, 6, z + 0.55]} to={[1.6, 6, z + 0.55]} className="iso-detail" />
          <Line from={[6, 0.6, z + 0.55]} to={[6, 1.2, z + 0.55]} className="iso-detail" />
        </Box>
      ))}
      {HANDLE_SLOTS.map(([x, y]) => (
        <Box key={`${x}-${y}`} at={[x, y, 4.1]} size={[1.2, 0.8, 0.25]} />
      ))}
      <g className="leak-move leak-lift" style={moves({ '--to': offset(0, 0, 2.6) })}>
        <Box at={[2.4, 2.6, 4.1]} size={[1.2, 0.8, 0.25]} className="iso-solid" />
        <Tag at={[4.4, 2.6, 4.7]} className="iso-tag leak-reveal">
          kh_9f2c… opens nothing
        </Tag>
      </g>
    </>
  );
}

function LogsScene() {
  return (
    <>
      <Box at={[0, 0, 0]} size={[8, 5.6, 0.8]} />
      <Plate at={[0.5, 0.5, 0.8]} size={[7, 4.6]} className="iso-screen" />
      <clipPath id="leak-log-screen">
        <Plate at={[0.5, 0.5, 0.8]} size={[7, 4.6]} />
      </clipPath>
      <g clipPath="url(#leak-log-screen)">
        <g
          className="leak-scroll"
          style={moves({ '--step': offset(0, -LOG_LINE_LENGTHS.length * 0.55, 0) })}
        >
          {[...LOG_LINE_LENGTHS, ...LOG_LINE_LENGTHS].map((length, index) => {
            const y = 1 + index * 0.55;
            return (
              <Line
                // biome-ignore lint/suspicious/noArrayIndexKey: the list is static
                key={index}
                from={[1, y, 0.8]}
                to={[1 + length, y, 0.8]}
                className={index === 3 ? 'iso-line-strong' : 'iso-line'}
              />
            );
          })}
        </g>
      </g>
      <Tag at={[8.6, 1.8, 0.8]} className="iso-tag leak-reveal">
        POST /api/chat 200
      </Tag>
    </>
  );
}

function StorageScene() {
  return (
    <>
      <Plate at={[0, 0, 0]} size={[4.4, 4.4]} className="iso-ghost" />
      <g className="leak-move" style={moves({ '--to': offset(-1.6, 0, 0) })}>
        <Box at={[0, 0, 0]} size={[2.2, 4.4, 3]}>
          <Plate at={[0.7, 1.6, 3]} size={[0.8, 1.2]} className="iso-slot" />
        </Box>
        <Tag at={[-0.4, -0.6, 3.6]} className="iso-tag leak-reveal">
          in your handle
        </Tag>
      </g>
      <g className="leak-move" style={moves({ '--to': offset(1.6, 0, 0) })}>
        <Box at={[2.2, 0, 0]} size={[2.2, 4.4, 3]}>
          <Plate at={[2.9, 1.6, 3]} size={[0.8, 1.2]} className="iso-slot" />
        </Box>
        <Tag at={[7.4, 2.2, 0]} className="iso-tag leak-reveal">
          in Fiducy storage
        </Tag>
      </g>
    </>
  );
}

function EnclaveScene() {
  return (
    <>
      <Plate at={[-1, -1, 0]} size={[7, 7]} className="iso-ghost" />
      <Box at={[0, 0, 0]} size={[5, 5, 3.2]}>
        <Plate at={[1.8, 2.1, 3.2]} size={[1.4, 0.8]} className="iso-slot" />
        <Line from={[0.5, 5, 2.6]} to={[2, 5, 2.6]} className="iso-detail" />
        <Line from={[5, 0.5, 2.6]} to={[5, 1.4, 2.6]} className="iso-detail" />
      </Box>
      <g className="leak-try" style={moves({ '--to': offset(3.6, 0, -1.2) })}>
        <Box at={[-3.4, 2.25, 4.6]} size={[2.4, 0.5, 0.35]} className="iso-solid" />
        <Box at={[-4.4, 2, 4.55]} size={[1, 1, 0.45]} />
      </g>
      <Tag at={[4.4, 0.2, 5.4]} className="iso-tag leak-reveal">
        KMS: unwrap denied
      </Tag>
    </>
  );
}

const SCENES: LeakScene[] = [
  {
    label: 'Your database',
    hint: 'Point at the database',
    stat: 'kh_9f2c…',
    title: 'A dumped database gets',
    quiet: 'handles that open nothing.',
    description: 'Each handle needs the enclave and your app secret before it opens anything.',
    scene: <DatabaseScene />
  },
  {
    label: 'Your server logs',
    hint: 'Point at the logs',
    stat: '0 keys logged',
    title: 'Your logs hold',
    quiet: 'no keys at all.',
    description: 'Keys go from the widget straight to the enclave and never pass your server.',
    scene: <LogsScene />
  },
  {
    label: "Fiducy's storage",
    hint: 'Point at the record',
    stat: '2 halves',
    title: 'Our storage holds',
    quiet: 'half of each key.',
    description: 'The other half lives only in your handle. Neither half opens anything alone.',
    scene: <StorageScene />
  },
  {
    label: 'An AWS admin',
    hint: 'Point at the enclave',
    stat: 'PCR0 a41e…',
    title: 'An AWS admin gets',
    quiet: 'a refusal from KMS.',
    description: 'KMS unwraps only for the attested enclave image, and nothing is stored open.',
    scene: <EnclaveScene />
  }
];

export function LeakScenes() {
  return (
    <div className="leaks">
      {SCENES.map((leak) => (
        // biome-ignore lint/a11y/noNoninteractiveTabindex: focus plays the same motion as hover
        <article key={leak.label} className="leak" tabIndex={0}>
          <p className="leak-label">{leak.label}</p>
          <IsoScene>{leak.scene}</IsoScene>
          <div className="leak-meta">
            <span>{leak.hint}</span>
            <span>{leak.stat}</span>
          </div>
          <h3>
            {leak.title} <span className="headline-quiet">{leak.quiet}</span>
          </h3>
          <p className="description">{leak.description}</p>
        </article>
      ))}
    </div>
  );
}
