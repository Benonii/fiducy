import { ConvexError, v } from 'convex/values';

import { internalMutation, mutation, query } from './_generated/server';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAXIMUM_EMAIL_LENGTH = 254;
const MAXIMUM_SOURCE_LENGTH = 40;
const MAXIMUM_REFERRER_LENGTH = 200;

function normalizeEmail(email: string): string {
  const normalized = email.trim().toLowerCase();
  if (!EMAIL_PATTERN.test(normalized) || normalized.length > MAXIMUM_EMAIL_LENGTH) {
    throw new ConvexError('Enter a valid email address');
  }
  return normalized;
}

export const join = mutation({
  args: { email: v.string(), source: v.string(), referrer: v.optional(v.string()) },
  returns: v.union(v.literal('joined'), v.literal('already_joined')),
  handler: async (context, args) => {
    const email = normalizeEmail(args.email);
    const existing = await context.db
      .query('waitlist')
      .withIndex('by_email', (q) => q.eq('email', email))
      .unique();
    if (existing) return 'already_joined';
    await context.db.insert('waitlist', {
      email,
      source: args.source.slice(0, MAXIMUM_SOURCE_LENGTH),
      referrer: args.referrer?.slice(0, MAXIMUM_REFERRER_LENGTH),
      joinedAt: Date.now()
    });
    return 'joined';
  }
});

export const count = query({
  args: {},
  returns: v.number(),
  handler: async (context) => {
    const entries = await context.db.query('waitlist').collect();
    return entries.length;
  }
});

export const remove = internalMutation({
  args: { email: v.string() },
  returns: v.boolean(),
  handler: async (context, args) => {
    const entry = await context.db
      .query('waitlist')
      .withIndex('by_email', (q) => q.eq('email', args.email.trim().toLowerCase()))
      .unique();
    if (!entry) return false;
    await context.db.delete(entry._id);
    return true;
  }
});
