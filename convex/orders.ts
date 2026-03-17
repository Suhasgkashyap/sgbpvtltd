import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

function generateOrderNumber(): string {
  const now = new Date();
  const y = now.getFullYear().toString().slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `SGB-${y}${m}${d}-${rand}`;
}

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const orders = await ctx.db.query("orders").order("desc").collect();
    return await Promise.all(
      orders.map(async (order) => {
        const items = await ctx.db
          .query("orderItems")
          .withIndex("by_orderId", (q) => q.eq("orderId", order._id))
          .collect();
        return { ...order, items };
      })
    );
  },
});

export const listByStatus = query({
  args: {
    status: v.union(
      v.literal("billing"),
      v.literal("packing"),
      v.literal("shipping"),
      v.literal("shipped"),
      v.literal("delivered"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .order("desc")
      .collect();
    return await Promise.all(
      orders.map(async (order) => {
        const items = await ctx.db
          .query("orderItems")
          .withIndex("by_orderId", (q) => q.eq("orderId", order._id))
          .collect();
        return { ...order, items };
      })
    );
  },
});

export const getById = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) return null;
    const items = await ctx.db
      .query("orderItems")
      .withIndex("by_orderId", (q) => q.eq("orderId", args.orderId))
      .collect();
    const shipment = await ctx.db
      .query("shipments")
      .withIndex("by_orderId", (q) => q.eq("orderId", args.orderId))
      .unique();
    return { ...order, items, shipment };
  },
});

export const create = mutation({
  args: {
    customerName: v.string(),
    customerPhone: v.string(),
    customerAddress: v.string(),
    pinCode: v.optional(v.string()),
    shippingProvider: v.optional(v.union(
      v.literal("sugama"),
      v.literal("vrl"),
      v.literal("indian_post")
    )),
    whatsappNumber: v.optional(v.string()),
    notes: v.optional(v.string()),
    paidAmount: v.number(),
    paymentStatus: v.union(
      v.literal("pending"),
      v.literal("partial"),
      v.literal("paid")
    ),
    items: v.array(
      v.object({
        productId: v.id("products"),
        productName: v.string(),
        quantity: v.number(),
        unitPrice: v.number(),
        unit: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const totalAmount = args.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    const orderNumber = generateOrderNumber();
    const orderId = await ctx.db.insert("orders", {
      orderNumber,
      customerName: args.customerName,
      customerPhone: args.customerPhone,
      customerAddress: args.customerAddress,
      pinCode: args.pinCode,
      shippingProvider: args.shippingProvider,
      whatsappNumber: args.whatsappNumber,
      status: "billing",
      totalAmount,
      paidAmount: args.paidAmount,
      paymentStatus: args.paymentStatus,
      notes: args.notes,
      billedBy: userId,
      billedAt: Date.now(),
    });
    for (const item of args.items) {
      await ctx.db.insert("orderItems", {
        orderId,
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.quantity * item.unitPrice,
        unit: item.unit,
      });
    }
    return orderId;
  },
});

export const moveToPacking = mutation({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await ctx.db.patch(args.orderId, { status: "packing" });
  },
});

export const confirmPacking = mutation({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await ctx.db.patch(args.orderId, {
      status: "shipping",
      packedBy: userId,
      packedAt: Date.now(),
    });
  },
});

export const confirmShipping = mutation({
  args: {
    orderId: v.id("orders"),
    provider: v.union(
      v.literal("sugama"),
      v.literal("vrl"),
      v.literal("indian_post")
    ),
    trackingId: v.string(),
    estimatedDelivery: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await ctx.db.patch(args.orderId, {
      status: "shipped",
      shippedBy: userId,
      shippedAt: Date.now(),
    });
    await ctx.db.insert("shipments", {
      orderId: args.orderId,
      provider: args.provider,
      trackingId: args.trackingId,
      shippedAt: Date.now(),
      estimatedDelivery: args.estimatedDelivery,
      notes: args.notes,
      shippedBy: userId,
    });
  },
});

export const markDelivered = mutation({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await ctx.db.patch(args.orderId, { status: "delivered" });
  },
});

export const cancelOrder = mutation({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await ctx.db.patch(args.orderId, { status: "cancelled" });
  },
});

export const getAnalytics = query({
  args: {},
  handler: async (ctx) => {
    const orders = await ctx.db.query("orders").collect();
    const orderItems = await ctx.db.query("orderItems").collect();
    const shipments = await ctx.db.query("shipments").collect();

    const totalOrders = orders.length;
    const totalRevenue = orders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + o.totalAmount, 0);
    const totalPaid = orders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + o.paidAmount, 0);

    const statusCounts: Record<string, number> = {};
    for (const o of orders) {
      statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
    }

    // Monthly revenue (last 6 months)
    const now = Date.now();
    const monthlyRevenue: Record<string, number> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now);
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthlyRevenue[key] = 0;
    }
    for (const o of orders) {
      if (o.status === "cancelled") continue;
      const d = new Date(o._creationTime);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (key in monthlyRevenue) {
        monthlyRevenue[key] += o.totalAmount;
      }
    }

    // Top products
    const productSales: Record<string, { name: string; qty: number; revenue: number }> = {};
    for (const item of orderItems) {
      const pid = item.productId as string;
      if (!productSales[pid]) {
        productSales[pid] = { name: item.productName, qty: 0, revenue: 0 };
      }
      productSales[pid].qty += item.quantity;
      productSales[pid].revenue += item.totalPrice;
    }
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Shipping provider distribution
    const providerCounts: Record<string, number> = { sugama: 0, vrl: 0, indian_post: 0 };
    for (const s of shipments) {
      providerCounts[s.provider] = (providerCounts[s.provider] || 0) + 1;
    }

    // Order completion rate (shipped + delivered) / total non-cancelled
    const completedOrders =
      (statusCounts["shipped"] || 0) + (statusCounts["delivered"] || 0);
    const nonCancelledOrders = orders.filter((o) => o.status !== "cancelled").length;
    const orderCompletionRate =
      nonCancelledOrders > 0
        ? Math.round((completedOrders / nonCancelledOrders) * 100)
        : 0;

    // P&L: cancelled orders value as loss
    const cancelledRevenue = orders
      .filter((o) => o.status === "cancelled")
      .reduce((sum, o) => sum + o.totalAmount, 0);

    return {
      totalOrders,
      totalRevenue,
      totalPaid,
      statusCounts,
      monthlyRevenue,
      topProducts,
      providerCounts,
      orderCompletionRate,
      completedOrders,
      cancelledRevenue,
    };
  },
});
