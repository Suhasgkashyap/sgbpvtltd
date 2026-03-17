import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("products")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("products").collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    category: v.string(),
    description: v.string(),
    price: v.number(),
    unit: v.string(),
    stock: v.number(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.db.insert("products", {
      ...args,
      isActive: true,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("products"),
    name: v.string(),
    category: v.string(),
    description: v.string(),
    price: v.number(),
    unit: v.string(),
    stock: v.number(),
    imageUrl: v.optional(v.string()),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const { id, ...rest } = args;
    await ctx.db.patch(id, rest);
  },
});

export const remove = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await ctx.db.patch(args.id, { isActive: false });
  },
});

// Actual products from SGB Agro Industries - https://sgbagroindustries.com/product-category/all-products/
const ACTUAL_PRODUCTS = [
  {
    name: "SGB Brush Cutter Trolley",
    category: "Farm Equipment",
    description: "Heavy-duty two-wheeled trolley attachment for brush cutters. Makes land clearing easier with smooth mobility.",
    price: 2999,
    unit: "piece",
    stock: 50,
    imageUrl: "/products/brush-cutter-trolley.jpg",
    isActive: true,
  },
  {
    name: "SGB BC-520 Brush Cutter",
    category: "Brush Cutters",
    description: "Professional 52cc brush cutter with long green shaft and ergonomic handles. Perfect for agricultural weed control.",
    price: 13000,
    unit: "piece",
    stock: 40,
    imageUrl: "/products/bc-520-brush-cutter.jpg",
    isActive: true,
  },
  {
    name: "SGB Carry Cart",
    category: "Carts & Barrows",
    description: "Heavy-duty carry cart with large wheels for transporting farm produce, materials, and equipment.",
    price: 50000,
    unit: "piece",
    stock: 25,
    imageUrl: "/products/carry-cart.jpg",
    isActive: true,
  },
  {
    name: "SGB Cycle Weeder",
    category: "Farm Equipment",
    description: "Manual cycle weeder with two large wheels for efficient inter-row weeding. Ergonomic design reduces labor.",
    price: 3499,
    unit: "piece",
    stock: 60,
    imageUrl: "/products/cycle-weeder.jpg",
    isActive: true,
  },
  {
    name: "SGB G45L Brush Cutter",
    category: "Brush Cutters",
    description: "Compact 45cc brush cutter with green shaft. Ideal for small to medium farms and garden maintenance.",
    price: 13000,
    unit: "piece",
    stock: 45,
    imageUrl: "/products/g45l-brush-cutter.jpg",
    isActive: true,
  },
  {
    name: "SGB Wheel Barrow",
    category: "Carts & Barrows",
    description: "Durable metal wheelbarrow with single pneumatic wheel. Essential for farm and construction material transport.",
    price: 6500,
    unit: "piece",
    stock: 70,
    imageUrl: "/products/wheel-barrow.jpg",
    isActive: true,
  },
];

const DUMMY_PRODUCT_NAMES = new Set([
  "Tarpaulin Sheet",
  "HDPE Woven Sack",
  "PP Woven Bag",
  "Silage Film",
  "Mulch Film",
  "Drip Irrigation Pipe",
  "Greenhouse Net",
  "Fertilizer Bag 50kg",
  "Rope (Nylon)",
  "Stretch Wrap Film",
  "Coir Rope",
  "Plastic Crate",
]);

export const seedProducts = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("products").take(1);
    if (existing.length > 0) return;
    for (const p of ACTUAL_PRODUCTS) {
      await ctx.db.insert("products", p);
    }
  },
});

/** Migrates dummy products to actual SGB products. Runs automatically when dummy data is detected. No auth required. */
export const migrateToActualProducts = mutation({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("products").collect();
    const hasDummy = all.some((p) => DUMMY_PRODUCT_NAMES.has(p.name));
    if (!hasDummy) return;
    for (const p of all) {
      await ctx.db.delete(p._id);
    }
    for (const p of ACTUAL_PRODUCTS) {
      await ctx.db.insert("products", p);
    }
  },
});

/** Replace all products with actual SGB Agro Industries products. Admin only. */
export const replaceWithActualProducts = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const myProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!myProfile || myProfile.role !== "admin")
      throw new Error("Only admin can replace products");
    const all = await ctx.db.query("products").collect();
    for (const p of all) {
      await ctx.db.delete(p._id);
    }
    for (const p of ACTUAL_PRODUCTS) {
      await ctx.db.insert("products", p);
    }
  },
});

/** Force refresh all products with images. No auth required - runs on page load. */
export const forceRefreshProducts = mutation({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("products").collect();
    // Check if any product is missing imageUrl
    const needsUpdate = all.some((p) => !p.imageUrl);
    if (!needsUpdate && all.length === ACTUAL_PRODUCTS.length) return;
    
    // Delete all and recreate with images
    for (const p of all) {
      await ctx.db.delete(p._id);
    }
    for (const p of ACTUAL_PRODUCTS) {
      await ctx.db.insert("products", p);
    }
  },
});
