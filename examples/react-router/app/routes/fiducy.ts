import { toReactRouterHandlers } from '@fiducy/sdk/react-router';

import { fiducy } from '@/lib/fiducy';

export const { loader, action } = toReactRouterHandlers(fiducy);
