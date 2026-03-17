import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

const callStatusValidator = v.optional(v.union(
  v.literal("received"),
  v.literal("not_received"),
  v.literal("switched_off"),
  v.literal("busy"),
  v.literal("not_reachable"),
  v.literal("not_interested"),
  v.literal("booked"),
  v.literal("whatsapp")
));

const callAttemptValidator = v.optional(v.union(
  v.literal("1st_attempt"),
  v.literal("2nd_attempt"),
  v.literal("3rd_attempt")
));

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const leads = await ctx.db
      .query("leads")
      .withIndex("by_isDeleted", (q) => q.eq("isDeleted", false))
      .order("desc")
      .collect();
    // Attach telecaller name for each lead
    const result = await Promise.all(leads.map(async (lead) => {
      const adderProfile = await ctx.db
        .query("userProfiles")
        .withIndex("by_userId", (q) => q.eq("userId", lead.addedBy))
        .unique();
      const attendedProfile = lead.attendedBy
        ? await ctx.db.query("userProfiles").withIndex("by_userId", (q) => q.eq("userId", lead.attendedBy!)).unique()
        : null;
      return {
        ...lead,
        addedByName: adderProfile?.name ?? "Unknown",
        attendedByName: attendedProfile?.name ?? null,
      };
    }));
    return result;
  },
});

export const addLead = mutation({
  args: {
    phone: v.string(),
    customerName: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    // Check for duplicate phone
    const existing = await ctx.db
      .query("leads")
      .withIndex("by_phone", (q) => q.eq("phone", args.phone))
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .unique();
    if (existing) throw new Error("Phone number already exists");
    return await ctx.db.insert("leads", {
      phone: args.phone,
      customerName: args.customerName,
      addedBy: userId,
      isDeleted: false,
      notes: args.notes,
    });
  },
});

export const updateLead = mutation({
  args: {
    id: v.id("leads"),
    customerName: v.optional(v.string()),
    callStatus: callStatusValidator,
    callAttempt: callAttemptValidator,
    nextCallDate: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const { id, ...rest } = args;
    await ctx.db.patch(id, { ...rest, attendedBy: userId });
  },
});

export const deleteLead = mutation({
  args: { id: v.id("leads") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await ctx.db.patch(args.id, { isDeleted: true });
  },
});
