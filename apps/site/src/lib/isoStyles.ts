export const ISO_GHOST = 'fill-none stroke-control [stroke-dasharray:3_4]';
export const ISO_SCREEN = 'fill-wash';
export const ISO_SLOT = 'fill-frame';
export const ISO_DETAIL = 'stroke-ink-quiet';
export const ISO_LINE_STRONG = 'stroke-ink stroke-2';
export const ISO_TAG = 'fill-ink stroke-none font-mono text-[10px]';
export const ISO_SCROLL =
  'animate-leak-scroll group-hover:[animation-duration:5s] motion-reduce:animate-none';
export const ISO_FACES = {
  line: { top: 'fill-white', left: 'fill-[#fafafa]', right: 'fill-[#ededed]' },
  solid: { top: 'fill-ink-quiet', left: 'fill-ink-muted', right: 'fill-ink' }
};
export const ISO_STEAL = 'animate-leak-steal motion-reduce:animate-none';
export const ISO_TAG_FIRST = 'opacity-0 animate-leak-first motion-reduce:animate-none';
export const ISO_TAG_LAST =
  'opacity-0 animate-leak-last motion-reduce:animate-none motion-reduce:opacity-100';
export const LEAK_LOOP_MILLISECONDS = 6000;
export const LEAK_FIRST_AT = 1440;
export const LEAK_LAST_AT = 4200;
