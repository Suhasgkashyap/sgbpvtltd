import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getMyProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    return profile;
  },
});

export const setupProfile = mutation({
  args: {
    name: v.string(),
    role: v.union(
      v.literal("admin"),
      v.literal("billing"),
      v.literal("packing"),
      v.literal("shipping"),
      v.literal("telecaller")
    ),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        role: args.role,
        phone: args.phone,
      });
      return existing._id;
    }
    return await ctx.db.insert("userProfiles", {
      userId,
      name: args.name,
      role: args.role,
      phone: args.phone,
      isActive: true,
    });
  },
});

export const updateMyRole = mutation({
  args: {
    role: v.union(
      v.literal("admin"),
      v.literal("billing"),
      v.literal("packing"),
      v.literal("shipping"),
      v.literal("telecaller")
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { role: args.role });
    }
    // If no profile exists yet, we return without error — SetupProfile will handle creation
  },
});

export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const myProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!myProfile || myProfile.role !== "admin") return [];
    const profiles = await ctx.db.query("userProfiles").collect();
    const result = await Promise.all(
      profiles.map(async (p) => {
        const user = await ctx.db.get(p.userId);
        return { ...p, email: user?.email ?? "" };
      })
    );
    return result;
  },
});

export const updateUserRole = mutation({
  args: {
    profileId: v.id("userProfiles"),
    role: v.union(
      v.literal("admin"),
      v.literal("billing"),
      v.literal("packing"),
      v.literal("shipping")
    ),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const myProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!myProfile || myProfile.role !== "admin")
      throw new Error("Unauthorized");
    await ctx.db.patch(args.profileId, {
      role: args.role,
      isActive: args.isActive,
    });
  },
});

export const deleteUser = mutation({
  args: { profileId: v.id("userProfiles") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const myProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!myProfile || myProfile.role !== "admin")
      throw new Error("Unauthorized");
    await ctx.db.delete(args.profileId);
  },
});
