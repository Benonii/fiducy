import { buttonVariants } from '@/components/ui/button';
import { DESCRIPTION_CLASS, TITLE_CLASS } from '@/lib/styles';
import { cn } from '@/lib/utils';

import type { PlanCardProps } from '@/types';

export function PlanCard({ title, price, description, linkLabel, linkURL }: PlanCardProps) {
  return (
    <div className="grid content-start justify-items-start gap-2.5 px-gutter py-16">
      <h2 className={TITLE_CLASS}>{title}</h2>
      <p className="text-[1.0625rem] font-semibold">{price}</p>
      <p className={DESCRIPTION_CLASS}>{description}</p>
      <a className={cn(buttonVariants({ variant: 'outline' }), 'mt-2')} href={linkURL}>
        {linkLabel}
      </a>
    </div>
  );
}
