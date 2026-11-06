const CIPHER_GLYPHS = '0123456789abcdef';

export const CIPHER_FRAME_MILLISECONDS = 28;
export const CIPHER_STEP = 0.2;
export const CIPHER_SETTLED_EVERY = 5;
export const CIPHER_TOUCH_HOLD_MILLISECONDS = 1400;

function randomGlyph() {
  return CIPHER_GLYPHS[Math.floor(Math.random() * CIPHER_GLYPHS.length)];
}

export function encipher(word: string, progress: number) {
  const sealedCount = Math.ceil(progress * word.length);
  return Array.from(word, (_, index) => (index < sealedCount ? randomGlyph() : ' ')).join('');
}

export function moveToward(progress: number, isSealed: boolean) {
  return isSealed ? Math.min(1, progress + CIPHER_STEP) : Math.max(0, progress - CIPHER_STEP);
}
