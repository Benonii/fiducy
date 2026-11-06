const CIPHER_GLYPHS = '0123456789abcdef';

export const CIPHER_FRAME_MILLISECONDS = 40;
export const CIPHER_STEP = 0.125;
export const CIPHER_SETTLED_EVERY = 4;
export const CIPHER_TOUCH_HOLD_MILLISECONDS = 1600;
export const CIPHER_PIXEL_SIZES = [2, 4, 6] as const;

function randomGlyph() {
  return CIPHER_GLYPHS[Math.floor(Math.random() * CIPHER_GLYPHS.length)];
}

export function encipher(word: string, progress: number) {
  const sealedCount = Math.ceil(progress * word.length);
  return Array.from(word, (character, index) =>
    index < sealedCount ? randomGlyph() : character
  ).join('');
}

export function pixelFilterID(progress: number) {
  if (progress >= 1) return 'cipher-pixel-0';
  return progress < 0.5 ? 'cipher-pixel-1' : 'cipher-pixel-2';
}

export function moveToward(progress: number, isSealed: boolean) {
  return isSealed ? Math.min(1, progress + CIPHER_STEP) : Math.max(0, progress - CIPHER_STEP);
}
