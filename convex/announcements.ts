import { query } from "./_generated/server";

/**
 * List all live, non-archived announcements.
 * Ordered by created_at descending.
 */
export const listLive = query({
  args: {},
  handler: async (ctx) => {
    const announcements = await ctx.db
      .query("announcements")
      .withIndex("by_live", (q) => q.eq("is_live", true))
      .filter((q) => q.neq(q.field("archived"), true))
      .collect();

    return announcements.sort((a, b) => (b.created_at ?? 0) - (a.created_at ?? 0));
  },
});
