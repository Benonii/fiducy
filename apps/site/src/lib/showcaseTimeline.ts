import { SHOWCASE_ANSWER, SHOWCASE_CODE, SHOWCASE_KEY, SHOWCASE_QUESTION } from '@/lib/constants';

import type { ShowcaseFrame, ShowcaseStep, TypingWindow } from '@/types';

const CODE_TYPING: TypingWindow = { text: SHOWCASE_CODE, startsAt: 300, endsAt: 4600 };
const KEY_TYPING: TypingWindow = { text: SHOWCASE_KEY, startsAt: 6600, endsAt: 8100 };
const QUESTION_TYPING: TypingWindow = { text: SHOWCASE_QUESTION, startsAt: 9300, endsAt: 10800 };
const ANSWER_TYPING: TypingWindow = { text: SHOWCASE_ANSWER, startsAt: 12000, endsAt: 15000 };
const FLIP_TO_APP_AT = 5600;
const KEY_SAVED_AT = 8500;
const QUESTION_SENT_AT = 11100;
const FLIP_TO_CODE_AT = 19000;
const TRACE_TIMES = [KEY_SAVED_AT, 11300, 11600, 11900, 15300];

export const SHOWCASE_LOOP_MILLISECONDS = 20000;
export const SHOWCASE_FINAL_MILLISECONDS = 16000;

function typeOut({ text, startsAt, endsAt }: TypingWindow, elapsed: number): string {
  const progress = (elapsed - startsAt) / (endsAt - startsAt);
  const clamped = Math.min(1, Math.max(0, progress));
  return text.slice(0, Math.round(clamped * text.length));
}

function streamWords({ text, startsAt, endsAt }: TypingWindow, elapsed: number): string {
  const words = text.split(' ');
  const progress = Math.min(1, Math.max(0, (elapsed - startsAt) / (endsAt - startsAt)));
  return words.slice(0, Math.round(progress * words.length)).join(' ');
}

function readActiveStep(elapsed: number): ShowcaseStep | null {
  if (elapsed < FLIP_TO_APP_AT) return null;
  if (elapsed < KEY_SAVED_AT + 500) return 'key';
  if (elapsed < QUESTION_SENT_AT + 500) return 'ask';
  return 'answer';
}

export function readShowcaseFrame(elapsed: number): ShowcaseFrame {
  return {
    isFlipped: elapsed >= FLIP_TO_APP_AT && elapsed < FLIP_TO_CODE_AT,
    code: typeOut(CODE_TYPING, elapsed),
    isCodeTyping: elapsed < CODE_TYPING.endsAt,
    key: typeOut(KEY_TYPING, elapsed),
    isKeySaved: elapsed >= KEY_SAVED_AT,
    question: elapsed >= QUESTION_SENT_AT ? '' : typeOut(QUESTION_TYPING, elapsed),
    isQuestionSent: elapsed >= QUESTION_SENT_AT,
    answer: streamWords(ANSWER_TYPING, elapsed),
    activeStep: readActiveStep(elapsed),
    traceCount: TRACE_TIMES.filter((time) => elapsed >= time).length
  };
}
