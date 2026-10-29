export const WIDGET_STYLES = `
:root { color-scheme: light dark; --ink: #18202e; --muted: #5d6677; --line: #d5d9e1; --accent: #2f5bd3; --surface: #ffffff; --danger: #b42318; }
@media (prefers-color-scheme: dark) { :root { --ink: #e6e9ef; --muted: #9aa3b4; --line: #343c4a; --accent: #7c9cff; --surface: #181e28; --danger: #f97066; } }
* { box-sizing: border-box; }
body { margin: 0; padding: 16px; font: 14px/1.5 system-ui, -apple-system, 'Segoe UI', sans-serif; color: var(--ink); background: var(--surface); }
form, .saved { display: grid; gap: 10px; }
label { font-weight: 600; }
.row { display: flex; gap: 8px; }
input { flex: 1; min-width: 0; font: 13px ui-monospace, Menlo, monospace; padding: 9px 10px; border: 1px solid var(--line); border-radius: 8px; background: transparent; color: var(--ink); }
input:focus-visible, button:focus-visible { outline: 2px solid var(--accent); outline-offset: 1px; }
button { font: inherit; font-weight: 600; padding: 9px 14px; border: 0; border-radius: 8px; background: var(--accent); color: var(--surface); cursor: pointer; }
button:disabled { opacity: 0.6; cursor: wait; }
.note { margin: 0; font-size: 12.5px; color: var(--muted); }
.status { margin: 0; font-size: 13px; min-height: 1.5em; }
.status.error { color: var(--danger); }
[hidden] { display: none !important; }
`;
