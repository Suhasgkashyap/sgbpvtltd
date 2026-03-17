import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  userProfiles: defineTable({
    userId: v.id("users"),
    name: v.string(),
    role: v.union(
      v.literal("admin"),
      v.literal("billing"),
      v.literal("packing"),
      v.literal("shipping"),
      v.literal("telecaller")
    ),
    phone: v.optional(v.string()),
    isActive: v.boolean(),
  })
    .index("by_userId", ["userId"])
    .index("by_role", ["role"]),

  products: defineTable({
    name: v.string(),
    category: v.string(), // Agro Products, Packaging, Irrigation, Hardware, Farm Equipment
    description: v.string(),
    price: v.number(),
    unit: v.string(),
    stock: v.number(),
    imageUrl: v.optional(v.string()),
    isActive: v.boolean(),
  }).index("by_category", ["category"]),

  orders: defineTable({
    orderNumber: v.string(),
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
    status: v.union(
      v.literal("billing"),
      v.literal("packing"),
      v.literal("shipping"),
      v.literal("shipped"),
      v.literal("delivered"),
      v.literal("cancelled")
    ),
    totalAmount: v.number(),
    paidAmount: v.number(),
    paymentStatus: v.union(
      v.literal("pending"),
      v.literal("partial"),
      v.literal("paid")
    ),
    notes: v.optional(v.string()),
    billedBy: v.optional(v.id("users")),
    packedBy: v.optional(v.id("users")),
    shippedBy: v.optional(v.id("users")),
    billedAt: v.optional(v.number()),
    packedAt: v.optional(v.number()),
    shippedAt: v.optional(v.number()),
  })
    .index("by_status", ["status"])
    .index("by_orderNumber", ["orderNumber"]),

  orderItems: defineTable({
    orderId: v.id("orders"),
    productId: v.id("products"),
    productName: v.string(),
    quantity: v.number(),
    unitPrice: v.number(),
    totalPrice: v.number(),
    unit: v.string(),
  }).index("by_orderId", ["orderId"]),

  shipments: defineTable({
    orderId: v.id("orders"),
    provider: v.union(
      v.literal("sugama"),
      v.literal("vrl"),
      v.literal("indian_post")
    ),
    trackingId: v.string(),
    shippedAt: v.number(),
    estimatedDelivery: v.optional(v.string()),
    notes: v.optional(v.string()),
    shippedBy: v.id("users"),
  })
    .index("by_orderId", ["orderId"])
    .index("by_trackingId", ["trackingId"]),

  leads: defineTable({
    phone: v.string(),
    customerName: v.optional(v.string()),
    addedBy: v.id("users"),
    callStatus: v.optional(v.union(
      v.literal("received"),
      v.literal("not_received"),
      v.literal("switched_off"),
      v.literal("busy"),
      v.literal("not_reachable"),
      v.literal("not_interested"),
      v.literal("booked"),
      v.literal("whatsapp")
    )),
    callAttempt: v.optional(v.union(
      v.literal("1st_attempt"),
      v.literal("2nd_attempt"),
      v.literal("3rd_attempt")
    )),
    nextCallDate: v.optional(v.string()),
    notes: v.optional(v.string()),
    attendedBy: v.optional(v.id("users")),
    isDeleted: v.boolean(),
  })
    .index("by_phone", ["phone"])
    .index("by_addedBy", ["addedBy"])
    .index("by_isDeleted", ["isDeleted"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
