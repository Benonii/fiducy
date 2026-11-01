import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  waitlist: defineTable({
    email: v.string(),
    source: v.string(),
    referrer: v.optional(v.string()),
    joinedAt: v.number()
  }).index('by_email', ['email'])
});
