import { query } from "./_generated/server";

/**
 * List all announcements.
 * Filtering by is_live happens on the frontend.
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("announcements").collect();
  },
});

/**
 * List all live, non-archived announcements.
 * Ordered by created_at descending.
 */
export const listLive = query({
  args: {},
  handler: async (ctx) => {
    // We fetch all and filter manually to avoid "Missing Index" server errors
    // on environments that haven't synced the schema yet.
    const all = await ctx.db.query("announcements").collect();
    
    return all
      .filter((a) => a.is_live && !a.archived)
      .sort((a, b) => (b.created_at ?? 0) - (a.created_at ?? 0));
  },
});
