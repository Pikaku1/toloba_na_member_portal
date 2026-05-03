import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * List all forms.
 * Filtering by is_live happens on the frontend.
 */
export const listForms = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("forms").collect();
  },
});

/**
 * List all questions.
 * Filtering by form_id happens on the frontend.
 */
export const listQuestions = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("questions").collect();
  },
});

/**
 * List all live, non-archived forms.
 */
export const listLive = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("forms")
      .filter((q) => q.and(
        q.eq(q.field("is_live"), true),
        q.neq(q.field("archived"), true)
      ))
      .collect();
  },
});

/**
 * Get a survey by its slug.
 */
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const form = await ctx.db
      .query("forms")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (!form || !form.is_live || form.archived) {
      return null;
    }

    return form;
  },
});

/**
 * Get questions for a specific form, ordered by 'order'.
 */
export const getQuestions = query({
  args: { formId: v.id("forms") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("questions")
      .withIndex("by_form", (q) => q.eq("form_id", args.formId))
      .collect()
      .then((qs) => qs.sort((a, b) => a.order - b.order));
  },
});

/**
 * Submit a survey response.
 * Deduplicates by respondent_email.
 */
export const submit = mutation({
  args: {
    formId: v.id("forms"),
    respondent_email: v.optional(v.string()),
    answers: v.array(v.object({
      question_id: v.id("questions"),
      value: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const form = await ctx.db.get(args.formId);
    if (!form || !form.is_live || form.archived) {
      throw new Error("This survey is no longer accepting responses.");
    }

    // Deduplicate by email if provided
    if (args.respondent_email) {
      const existing = await ctx.db
        .query("submissions")
        .withIndex("by_respondent_email", (q) => q.eq("respondent_email", args.respondent_email))
        .filter((q) => q.eq(q.field("form_id"), args.formId))
        .first();

      if (existing) {
        throw new Error("You have already submitted this survey.");
      }
    }

    // Create submission
    const submissionId = await ctx.db.insert("submissions", {
      form_id: args.formId,
      respondent_email: args.respondent_email,
      submitted_at: Date.now(),
    });

    // Create answers
    for (const answer of args.answers) {
      await ctx.db.insert("answers", {
        submission_id: submissionId,
        question_id: answer.question_id,
        value: answer.value,
      });
    }

    return submissionId;
  },
});

/**
 * Get own submission for a specific form.
 */
export const getOwnSubmission = query({
  args: { formId: v.id("forms"), email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("submissions")
      .withIndex("by_respondent_email", (q) => q.eq("respondent_email", args.email))
      .filter((q) => q.eq(q.field("form_id"), args.formId))
      .unique();
  },
});
