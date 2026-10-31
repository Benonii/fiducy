export const WIDGET_STYLES = `
:root { color-scheme: light dark; --ink: #111111; --muted: #4a4a4a; --line: #d4d4d2; --accent: #111111; --surface: #ffffff; --danger: #a1121b; }
@media (prefers-color-scheme: dark) { :root { --ink: #f2f2f2; --muted: #b4b4b4; --line: #333333; --accent: #f2f2f2; --surface: #0d0d0d; --danger: #ff8a8f; } }
* { box-sizing: border-box; }
body { margin: 0; padding: 16px; font: 14px/1.5 system-ui, -apple-system, 'Segoe UI', sans-serif; color: var(--ink); background: var(--surface); }
form, .saved { display: grid; gap: 10px; }
label { font-weight: 600; }
.row { display: flex; gap: 8px; }
input { flex: 1; min-width: 0; font: 13px ui-monospace, Menlo, monospace; font-variant-ligatures: none; padding: 9px 10px; border: 1px solid var(--line); border-radius: 0; background: transparent; color: var(--ink); }
input:focus-visible, button:focus-visible { outline: 2px solid var(--accent); outline-offset: 1px; }
button { font: inherit; font-weight: 600; padding: 9px 14px; border: 0; border-radius: 0; background: var(--accent); color: var(--surface); cursor: pointer; }
button:disabled { opacity: 0.6; cursor: wait; }
.note { margin: 0; font-size: 12.5px; color: var(--muted); }
.status { margin: 0; font-size: 13px; min-height: 1.5em; }
.status.error { color: var(--danger); }
[hidden] { display: none !important; }
`;
