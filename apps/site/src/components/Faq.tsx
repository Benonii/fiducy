import { FAQ } from '@/lib/faq';
import { DESCRIPTION_CLASS, SECTION_CLASS, SECTION_HEAD_CLASS, TITLE_CLASS } from '@/lib/styles';

const QUESTION_CLASS =
  'text-[1.0625rem] leading-[1.3] font-semibold tracking-[-0.02em] text-balance';

export function Faq() {
  return (
    <section className={SECTION_CLASS} aria-labelledby="faq-title">
      <div className={SECTION_HEAD_CLASS}>
        <h2 id="faq-title" className={TITLE_CLASS}>
          Questions people ask before they ship
        </h2>
        <p className={DESCRIPTION_CLASS}>
          Short answers here. The docs cover each one in depth, with the exact calls and responses.
        </p>
      </div>
      <dl className="grid gap-x-10 gap-y-8 md:grid-cols-2">
        {FAQ.map((item) => (
          <div key={item.question} className="grid content-start gap-2">
            <dt className={QUESTION_CLASS}>{item.question}</dt>
            <dd className={`${DESCRIPTION_CLASS} m-0 max-w-[52ch]`}>{item.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
