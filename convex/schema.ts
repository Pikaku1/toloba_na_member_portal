import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // -------------------------------------------------------------------------
  // ADMIN-OWNED TABLES (unchanged — do not modify from member portal)
  // -------------------------------------------------------------------------

  announcements: defineTable({
    archived: v.optional(v.boolean()),
    body: v.string(),
    created_at: v.float64(),
    created_by: v.optional(v.string()),
    is_live: v.boolean(),
    title: v.string(),
    updated_at: v.float64(),
  }).index("by_live", ["is_live"]),

  answers: defineTable({
    question_id: v.id("questions"),
    submission_id: v.id("submissions"),
    value: v.string(),
  })
    .index("by_question", ["question_id"])
    .index("by_submission", ["submission_id"]),

  forms: defineTable({
    archived: v.optional(v.boolean()),
    created_at: v.float64(),
    created_by: v.optional(v.string()),
    description: v.optional(v.string()),
    is_live: v.boolean(),
    slug: v.string(),
    title: v.string(),
    updated_at: v.float64(),
  })
    .index("by_created_by", ["created_by"])
    .index("by_slug", ["slug"]),

  hub_collections: defineTable({
    amount_display: v.string(),       // Display string e.g. "$500" — not a numeric goal
    archived: v.optional(v.boolean()),
    created_at: v.float64(),
    created_by: v.optional(v.string()),
    desired_memo: v.string(),         // What members should put in the Zelle memo
    is_live: v.boolean(),
    payment_url: v.string(),          // Zelle link / QR URL shown to members before logging
    slug: v.string(),
    title: v.string(),
    updated_at: v.float64(),
  }).index("by_slug", ["slug"]),

  questions: defineTable({
    form_id: v.id("forms"),
    help_text: v.optional(v.string()),
    label: v.string(),
    options: v.optional(v.array(v.string())),
    order: v.float64(),
    required: v.boolean(),
    type: v.union(
      v.literal("short_text"),
      v.literal("long_text"),
      v.literal("email"),
      v.literal("single_choice"),
      v.literal("multiple_choice"),
      v.literal("dropdown"),
      v.literal("yes_no"),
      v.literal("date"),
      v.literal("number")
    ),
  }).index("by_form", ["form_id"]),

  submissions: defineTable({
    form_id: v.id("forms"),
    respondent_email: v.optional(v.string()),
    submitted_at: v.float64(),
  })
    .index("by_form", ["form_id"])
    .index("by_respondent_email", ["respondent_email"]),

  // -------------------------------------------------------------------------
  // MEMBER PORTAL TABLES
  // -------------------------------------------------------------------------

  /**
   * members
   * Seeded and managed by the dev team directly in Convex.
   * No self-registration. ITS number is the only login credential.
   */
  members: defineTable({
    its_number: v.string(),           // Unique numeric string — the login credential
    name: v.string(),                 // Display name shown in contributor lists
    email: v.optional(v.string()),    // Optional email for survey deduplication
    created_at: v.float64(),
  }).index("by_its_number", ["its_number"]),

  /**
   * hub_contributions
   * Created by members when they log a donation to a hub_collection.
   * Amounts are member-reported (honour system); admins can review via admin console.
   */
  hub_contributions: defineTable({
    collection_id: v.id("hub_collections"),  // Which hub_collection this belongs to
    member_id: v.id("members"),              // Who logged it
    amount: v.float64(),                     // Amount sent (USD)
    note: v.optional(v.string()),            // Member's optional message
    logged_at: v.float64(),
  })
    .index("by_collection", ["collection_id"])
    .index("by_member", ["member_id"])
    .index("by_collection_and_member", ["collection_id", "member_id"]),
});
