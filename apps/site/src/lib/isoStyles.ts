export const ISO_GHOST = 'fill-none stroke-control [stroke-dasharray:3_4]';
export const ISO_SCREEN = 'fill-wash';
export const ISO_SLOT = 'fill-frame';
export const ISO_DETAIL = 'stroke-ink-quiet';
export const ISO_LINE_STRONG = 'stroke-ink stroke-2';
export const ISO_TAG = 'fill-ink stroke-none font-mono text-[10px]';
export const ISO_REVEAL =
  'opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:delay-250 group-focus-visible:opacity-100';
export const ISO_MOVE =
  'transition-transform duration-700 ease-out-expo group-hover:[transform:var(--to)] group-focus-visible:[transform:var(--to)] motion-reduce:transition-none';
export const ISO_LIFT = 'animate-leak-float group-hover:animate-none motion-reduce:animate-none';
export const ISO_SCROLL =
  'animate-leak-scroll group-hover:[animation-duration:5s] motion-reduce:animate-none';
export const ISO_TRY =
  'group-hover:animate-leak-try group-focus-visible:animate-leak-try motion-reduce:animate-none';
export const ISO_FACES = {
  line: { top: 'fill-white', left: 'fill-[#fafafa]', right: 'fill-[#ededed]' },
  solid: { top: 'fill-ink-quiet', left: 'fill-ink-muted', right: 'fill-ink' }
};
