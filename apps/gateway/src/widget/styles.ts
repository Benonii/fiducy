import { WIDGET_FONT_PATH } from './font';

// Same system as the Fiducy site: white ground, black for what you act on, grays for the rest,
// square corners, hairline gray borders, dashed dividers.
export const WIDGET_STYLES = `
@font-face { font-family: 'Geist'; src: url('${WIDGET_FONT_PATH}') format('woff2'); font-weight: 100 900; font-display: swap; }
:root { color-scheme: light; --ink: #000000; --body: #333333; --muted: #5e5e5e; --line: #d9d9d9; --control: #c4c4c4; --surface: #ffffff; --wash: #f4f4f4; --danger: #a1121b; }
* { box-sizing: border-box; }
body { margin: 0; padding: 16px; font: 14px/1.55 'Geist', system-ui, sans-serif; color: var(--ink); background: var(--surface); }
::selection { background: var(--ink); color: var(--surface); }
form, .saved { display: grid; gap: 10px; }
.heading { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
label, .saved .status { font-size: 15px; font-weight: 700; letter-spacing: -0.01em; }
.badge { font-size: 12px; color: var(--muted); }
.row { display: flex; border: 1px solid var(--control); transition: border-color 150ms cubic-bezier(0.16, 1, 0.3, 1); }
.row:focus-within { border-color: var(--ink); }
.field { flex: 1; min-width: 0; display: flex; }
input { flex: 1; min-width: 0; padding: 10px 12px; border: 0; border-radius: 0; background: transparent; color: var(--ink); font: 13px ui-monospace, 'SFMono-Regular', Menlo, monospace; font-variant-ligatures: none; outline: none; }
input::placeholder { color: var(--muted); }
button { font: inherit; font-weight: 600; padding: 0 16px; border: 0; border-radius: 0; background: var(--ink); color: var(--surface); cursor: pointer; transition: background-color 150ms cubic-bezier(0.16, 1, 0.3, 1), color 150ms cubic-bezier(0.16, 1, 0.3, 1); }
button:hover { background: #262626; }
button.ghost { border-left: 1px dashed var(--control); background: transparent; color: var(--muted); font-weight: 500; font-size: 12px; padding: 0 12px; }
button.ghost:hover { color: var(--ink); background: var(--wash); }
button:focus-visible { outline: 2px solid var(--ink); outline-offset: -4px; }
button:disabled { opacity: 0.6; cursor: wait; }
.note { margin: 0; font-size: 12px; font-weight: 300; color: var(--muted); }
.status { margin: 0; min-height: 1.55em; font-size: 13px; }
.status.error { color: var(--danger); }
.saved { animation: settle 300ms cubic-bezier(0.16, 1, 0.3, 1); }
.footer { margin: 14px 0 0; padding-top: 10px; border-top: 1px dashed var(--line); font-size: 11px; color: var(--muted); }
[hidden] { display: none !important; }
@keyframes settle { from { opacity: 0; transform: translateY(4px); } }
@media (prefers-reduced-motion: reduce) { .saved { animation: none; } }
`;
