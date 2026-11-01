import { tokenize } from 'sugar-high/core';

import type { CodeBlockProps } from '@/types';

const TOKEN_CLASSES = [
  'text-ink-body',
  'text-[#6d28d9]',
  'text-[#0f766e]',
  'text-[#b45309]',
  'text-[#1d4ed8]',
  'text-[#b45309]',
  'text-ink-body',
  'text-ink-muted',
  'text-ink-muted italic',
  '',
  ''
];
const KEYWORDS = new Set([
  'async',
  'await',
  'const',
  'export',
  'from',
  'function',
  'if',
  'import',
  'new',
  'return',
  'throw'
]);
const TOKENIZE_OPTIONS = { keywords: KEYWORDS, jsx: true, typescript: true };

export function CodeBlock({ code }: CodeBlockProps) {
  const tokens = tokenize(code, TOKENIZE_OPTIONS);
  return (
    <code>
      {tokens.map(([type, value], index) => (
        <span key={`${index}-${value}`} className={TOKEN_CLASSES[type]}>
          {value}
        </span>
      ))}
    </code>
  );
}
