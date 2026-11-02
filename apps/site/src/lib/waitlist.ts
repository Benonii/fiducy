import { ConvexError } from 'convex/values';

import { api } from '@/lib/convexApi';
import { getConvexClient } from '@/lib/convexClient';

import type { WaitlistJoinInput } from '@/types';

export async function joinWaitlist(input: WaitlistJoinInput): Promise<Response> {
  const client = getConvexClient();
  if (!client) return Response.json({ error: 'The waitlist is not open yet' }, { status: 503 });
  try {
    const status = await client.mutation(api.waitlist.join, input);
    return Response.json({ status });
  } catch (error) {
    const message =
      error instanceof ConvexError && typeof error.data === 'string'
        ? error.data
        : 'Could not join the waitlist';
    return Response.json({ error: message }, { status: 400 });
  }
}
