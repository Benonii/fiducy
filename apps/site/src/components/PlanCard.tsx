import { buttonVariants } from '@/components/ui/button';
import { NEW_TAB } from '@/lib/site';
import { DESCRIPTION_CLASS, TITLE_CLASS } from '@/lib/styles';
import { cn } from '@/lib/utils';

import type { PlanCardProps } from '@/types';

export function PlanCard({
  id,
  title,
  price,
  description,
  linkLabel,
  linkURL,
  action
}: PlanCardProps) {
  return (
    <div id={id} className="grid content-start justify-items-start gap-2.5 px-gutter py-16">
      <h2 className={TITLE_CLASS}>{title}</h2>
      <p className="text-[1.0625rem] font-semibold">{price}</p>
      <p className={DESCRIPTION_CLASS}>{description}</p>
      {action ? <div className="mt-2 w-full">{action}</div> : null}
      {linkURL ? (
        <a
          className={cn(buttonVariants({ variant: 'outline' }), 'mt-2')}
          href={linkURL}
          {...NEW_TAB}
        >
          {linkLabel}
        </a>
      ) : null}
    </div>
  );
}
