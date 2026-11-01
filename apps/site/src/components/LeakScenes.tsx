import { IsoScene } from '@/components/IsoScene';
import { TypedTag } from '@/components/TypedTag';
import { Box, Line, Plate, offset } from '@/components/isometric';
import { ISO_DETAIL, ISO_GHOST, ISO_LINE_STRONG } from '@/lib/isoStyles';
import { ISO_SCREEN, ISO_SCROLL, ISO_SLOT } from '@/lib/isoStyles';
import { ISO_STEAL, ISO_TAG_FIRST, ISO_TAG_LAST } from '@/lib/isoStyles';
import { LEAK_FIRST_AT, LEAK_LAST_AT } from '@/lib/isoStyles';
import { DESCRIPTION_CLASS, LABEL_CLASS } from '@/lib/styles';

import type { LeakCardProps, LeakScene } from '@/types';
import type { CSSProperties } from 'react';

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
      <Plate at={[-1.5, -1.5, 0]} size={[9, 9]} className={ISO_GHOST} />
      {[0, 1.5, 3].map((z) => (
        <Box key={z} at={[0, 0, z]} size={[6, 6, 1.1]}>
          <Line from={[0.6, 6, z + 0.55]} to={[1.6, 6, z + 0.55]} className={ISO_DETAIL} />
          <Line from={[6, 0.6, z + 0.55]} to={[6, 1.2, z + 0.55]} className={ISO_DETAIL} />
        </Box>
      ))}
      {HANDLE_SLOTS.map(([x, y]) => (
        <Box key={`${x}-${y}`} at={[x, y, 4.1]} size={[1.2, 0.8, 0.25]} />
      ))}
      <Plate at={[2.4, 2.6, 4.1]} size={[1.2, 0.8]} className={ISO_GHOST} />
      <g className={ISO_STEAL} style={moves({ '--to': offset(0, 0, 3.4) })}>
        <Box at={[2.4, 2.6, 4.1]} size={[1.2, 0.8, 0.25]} tone="solid" />
        <TypedTag
          at={[4.2, 2.6, 4.6]}
          text="stolen: kh_9f2c…"
          startsAt={LEAK_FIRST_AT}
          className={ISO_TAG_FIRST}
        />
      </g>
      <TypedTag
        at={[4.2, 2.6, 7.8]}
        text="opens nothing"
        startsAt={LEAK_LAST_AT}
        className={ISO_TAG_LAST}
      />
    </>
  );
}

function LogsScene() {
  return (
    <>
      <Box at={[0, 0, 0]} size={[8, 5.6, 0.8]} />
      <Plate at={[0.5, 0.5, 0.8]} size={[7, 4.6]} className={ISO_SCREEN} />
      <clipPath id="leak-log-screen">
        <Plate at={[0.5, 0.5, 0.8]} size={[7, 4.6]} />
      </clipPath>
      <g clipPath="url(#leak-log-screen)">
        <g
          className={ISO_SCROLL}
          style={moves({ '--step': offset(0, -LOG_LINE_LENGTHS.length * 0.55, 0) })}
        >
          {[...LOG_LINE_LENGTHS, ...LOG_LINE_LENGTHS].map((length, index) => {
            const y = 1 + index * 0.55;
            return (
              <Line key={y} from={[1, y, 0.8]} to={[1 + length, y, 0.8]} className={ISO_DETAIL} />
            );
          })}
        </g>
        <g className={ISO_STEAL} style={moves({ '--to': offset(0, 3.6, 0) })}>
          <Line from={[0.5, 0.8, 0.8]} to={[7.5, 0.8, 0.8]} className={ISO_LINE_STRONG} />
        </g>
      </g>
      <TypedTag
        at={[2.2, -1.4, 0.8]}
        text="looking for keys"
        startsAt={LEAK_FIRST_AT}
        className={ISO_TAG_FIRST}
      />
      <TypedTag
        at={[2.2, -1.4, 0.8]}
        text="0 keys found"
        startsAt={LEAK_LAST_AT}
        className={ISO_TAG_LAST}
      />
    </>
  );
}

function StorageScene() {
  return (
    <>
      <Plate at={[0, 0, 0]} size={[4.4, 4.4]} className={ISO_GHOST} />
      <Box at={[0, 0, 0]} size={[2.2, 4.4, 3]}>
        <Plate at={[0.7, 1.6, 3]} size={[0.8, 1.2]} className={ISO_SLOT} />
      </Box>
      <g className={ISO_STEAL} style={moves({ '--to': offset(2.6, 0, 1.6) })}>
        <Box at={[2.2, 0, 0]} size={[2.2, 4.4, 3]} tone="solid" />
        <TypedTag
          at={[6.2, 2.2, 1]}
          text="stolen: half a key"
          startsAt={LEAK_FIRST_AT}
          className={ISO_TAG_FIRST}
        />
      </g>
      <TypedTag
        at={[6.2, 2.2, 2.6]}
        text="opens nothing"
        startsAt={LEAK_LAST_AT}
        className={ISO_TAG_LAST}
      />
    </>
  );
}

function EnclaveScene() {
  return (
    <>
      <Plate at={[-1, -1, 0]} size={[7, 7]} className={ISO_GHOST} />
      <Box at={[0, 0, 0]} size={[5, 5, 3.2]}>
        <Plate at={[1.8, 2.1, 3.2]} size={[1.4, 0.8]} className={ISO_SLOT} />
        <Line from={[0.5, 5, 2.6]} to={[2, 5, 2.6]} className={ISO_DETAIL} />
        <Line from={[5, 0.5, 2.6]} to={[5, 1.4, 2.6]} className={ISO_DETAIL} />
      </Box>
      <g className={ISO_STEAL} style={moves({ '--to': offset(3.6, 0, -1.2) })}>
        <Box at={[-3.4, 2.25, 4.6]} size={[2.4, 0.5, 0.35]} tone="solid" />
        <Box at={[-4.4, 2, 4.55]} size={[1, 1, 0.45]} />
      </g>
      <TypedTag
        at={[4.4, 0.2, 5.4]}
        text="admin: decrypt key"
        startsAt={LEAK_FIRST_AT}
        className={ISO_TAG_FIRST}
      />
      <TypedTag
        at={[4.4, 0.2, 5.4]}
        text="KMS: unwrap denied"
        startsAt={LEAK_LAST_AT}
        className={ISO_TAG_LAST}
      />
    </>
  );
}

const SCENES: LeakScene[] = [
  {
    label: 'Your database',
    hint: 'A handle is stolen',
    stat: 'opens nothing',
    title: 'If your database leaks,',
    quiet: 'attackers get handles that open nothing.',
    description: 'Each handle needs the enclave and your app secret before it opens anything.',
    scene: <DatabaseScene />
  },
  {
    label: 'Your server logs',
    hint: 'The logs are searched',
    stat: '0 keys found',
    title: 'If your logs leak,',
    quiet: 'there is no key in them to find.',
    description: 'Keys go from the widget straight to the enclave and never pass your server.',
    scene: <LogsScene />
  },
  {
    label: "Fiducy's storage",
    hint: 'Half a key is stolen',
    stat: 'useless alone',
    title: 'If Fiducy is breached,',
    quiet: 'attackers get half a key. Useless alone.',
    description: 'The other half lives only in your handle. Neither half opens anything alone.',
    scene: <StorageScene />
  },
  {
    label: 'An AWS admin',
    hint: 'An admin tries to decrypt',
    stat: 'unwrap denied',
    title: 'Even an AWS admin',
    quiet: "cannot decrypt your users' keys.",
    description: 'KMS unwraps only for the attested enclave image, and nothing is stored open.',
    scene: <EnclaveScene />
  }
];

function LeakCard({ leak }: LeakCardProps) {
  return (
    <figure className="group m-0 grid content-start gap-3 border-dashed border-frame px-gutter pt-6 pb-8 outline-none max-md:w-[84%] max-md:shrink-0 max-md:snap-start max-md:border-r max-md:last:border-r-0 md:border-b md:odd:border-r md:[&:nth-last-child(-n+2)]:border-b-0">
      <p
        className={`${LABEL_CLASS} flex items-center gap-2.5 before:size-1.5 before:bg-ink group-focus-visible:text-ink group-focus-visible:underline`}
      >
        {leak.label}
      </p>
      <IsoScene>{leak.scene}</IsoScene>
      <div className={`${LABEL_CLASS} flex flex-wrap justify-between gap-x-3 gap-y-1`}>
        <span>{leak.hint}</span>
        <span className="text-ink normal-case">{leak.stat}</span>
      </div>
      <h3 className="text-[clamp(1.25rem,2vw,1.625rem)] leading-[1.2] font-semibold tracking-[-0.035em] text-balance">
        {leak.title} <span className="text-ink-quiet">{leak.quiet}</span>
      </h3>
      <p className={`${DESCRIPTION_CLASS} max-w-[46ch]`}>{leak.description}</p>
    </figure>
  );
}

export function LeakScenes() {
  return (
    <div className="-mx-gutter grid border-t border-dashed border-frame max-md:flex max-md:snap-x max-md:snap-mandatory max-md:overflow-x-auto max-md:[scrollbar-width:none] md:grid-cols-2">
      {SCENES.map((leak) => (
        <LeakCard key={leak.label} leak={leak} />
      ))}
    </div>
  );
}
