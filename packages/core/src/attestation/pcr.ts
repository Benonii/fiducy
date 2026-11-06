import { PCR_HEX_PATTERN } from './constants.ts';

export function normalizePCR0(pcr0: string): string {
  return pcr0.trim().toLowerCase();
}

export function isPCR0(pcr0: string): boolean {
  return PCR_HEX_PATTERN.test(normalizePCR0(pcr0));
}

export function parsePCR0List(text: string | undefined): string[] {
  return (text ?? '').split(',').map(normalizePCR0).filter(Boolean);
}
