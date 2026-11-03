import { Box, Plate } from '@/components/isometric';
import { ISO_SLOT } from '@/lib/isoStyles';

import type { IsoKeyProps } from '@/types';

const BOW_SIZE = 1.6;
const SHAFT_DEPTH = 0.7;
const SHAFT_OFFSET = (BOW_SIZE - SHAFT_DEPTH) / 2;
const SPLIT_AT = 3.2;
const TIP_END = 5;
const THICKNESS = 0.3;

function Bow({ at: [x, y, z], tone }: IsoKeyProps) {
  return (
    <>
      <Box at={[x, y, z]} size={[BOW_SIZE, BOW_SIZE, THICKNESS]} tone={tone}>
        <Plate at={[x + 0.5, y + 0.5, z + THICKNESS]} size={[0.6, 0.6]} className={ISO_SLOT} />
      </Box>
      <Box
        at={[x + BOW_SIZE, y + SHAFT_OFFSET, z]}
        size={[SPLIT_AT - BOW_SIZE, SHAFT_DEPTH, THICKNESS]}
        tone={tone}
      />
    </>
  );
}

function Tip({ at: [x, y, z], tone }: IsoKeyProps) {
  const toothY = y + SHAFT_OFFSET + SHAFT_DEPTH;
  return (
    <>
      <Box
        at={[x + SPLIT_AT, y + SHAFT_OFFSET, z]}
        size={[TIP_END - SPLIT_AT, SHAFT_DEPTH, THICKNESS]}
        tone={tone}
      />
      <Box at={[x + 3.6, toothY, z]} size={[0.45, 0.5, THICKNESS]} tone={tone} />
      <Box at={[x + 4.4, toothY, z]} size={[0.45, 0.75, THICKNESS]} tone={tone} />
    </>
  );
}

export function IsoKey({ at, tone = 'line', part = 'whole' }: IsoKeyProps) {
  return (
    <>
      {part !== 'tip' ? <Bow at={at} tone={tone} /> : null}
      {part !== 'bow' ? <Tip at={at} tone={tone} /> : null}
    </>
  );
}

export const KEY_SPLIT_AT = SPLIT_AT;
export const KEY_TIP_END = TIP_END;
export const KEY_SHAFT_OFFSET = SHAFT_OFFSET;
export const KEY_SHAFT_DEPTH = SHAFT_DEPTH;
