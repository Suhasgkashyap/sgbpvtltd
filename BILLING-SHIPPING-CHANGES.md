# Billing & Shipping Process Changes

## Summary
Added pin code field and shipping provider selection to the billing process. The shipping provider is now selected during order creation (billing stage) and cannot be changed during the shipping stage.

## Changes Made

### 1. Updated Database Schema
**File:** `convex/schema.ts`

Added two new optional fields to the orders table:
- `pinCode`: Optional string for customer's pin code
- `shippingProvider`: Optional enum for shipping provider (sugama, vrl, indian_post)

```typescript
orders: defineTable({
  // ... existing fields
  pinCode: v.optional(v.string()),
  shippingProvider: v.optional(v.union(
    v.literal("sugama"),
    v.literal("vrl"),
    v.literal("indian_post")
  )),
  // ... rest of fields
})
```

### 2. Updated Order Creation Mutation
**File:** `convex/orders.ts`

Updated the `create` mutation to accept and store the new fields:
- Added `pinCode` parameter
- Added `shippingProvider` parameter
- Both fields are stored in the database when creating an order

### 3. Enhanced Billing Form
**File:** `src/components/CreateOrderForm.tsx`

Added new fields to the order creation form:

#### Pin Code Field:
- Located in the Customer Details section
- Optional field with 6-character limit
- Positioned between WhatsApp Number and Address

#### Shipping Provider Selection:
- New section after Customer Details
- Three provider options with visual buttons:
  - 🚛 Sugama Transport
  - 🚚 VRL Logistics
  - 📮 Indian Post
- Default selection: Sugama Transport
- Visual feedback with blue highlight for selected provider
- Required field (must select one)

### 4. Updated Shipping Modal
**File:** `src/components/ShipOrderModal.tsx`

Major changes to remove provider selection:

#### Removed:
- Provider selection buttons
- `handleProviderChange` function
- Manual provider state management

#### Added:
- Fetches order data using `useQuery(api.orders.getById)`
- Reads `shippingProvider` from order data
- Displays selected provider as read-only
- Auto-generates tracking ID based on provider from billing
- Shows message: "Provider cannot be changed"

#### New Behavior:
- Provider is displayed but not editable
- Tracking ID prefix matches the provider selected during billing
- Shipping staff only needs to:
  1. Verify the provider (already selected)
  2. Enter/generate tracking ID
  3. Set estimated delivery date
  4. Add optional notes

## User Flow

### Billing Stage (Order Creation):
1. Billing staff enters customer details
2. Enters customer name, phone, WhatsApp (optional)
3. **NEW:** Enters pin code (optional)
4. Enters full address
5. **NEW:** Selects shipping provider (Sugama/VRL/Indian Post)
6. Adds order items
7. Sets payment details
8. Creates order

### Packing Stage:
- No changes
- Packing staff confirms items are packed
- Moves order to shipping

### Shipping Stage:
1. Shipping staff opens order
2. **CHANGED:** Sees provider already selected (cannot change)
3. Generates or enters tracking ID
4. Sets estimated delivery date
5. Adds optional notes
6. Confirms shipment

## Benefits

### 1. Better Planning:
- Shipping provider is decided upfront during billing
- Allows better logistics planning
- Packing team knows which provider to prepare for

### 2. Reduced Errors:
- No confusion about which provider to use
- Provider decision made by billing team who knows customer preferences
- Shipping team just executes the plan

### 3. Improved Workflow:
- Shipping process is faster (one less decision to make)
- Clear separation of responsibilities
- Billing decides logistics, shipping executes

### 4. Better Customer Service:
- Pin code helps with accurate delivery
- Provider selection based on customer location/preference
- More accurate delivery estimates

## Data Structure

### Order Object (Updated):
```typescript
{
  orderNumber: "SGB-250314-1234",
  customerName: "John Doe",
  customerPhone: "+91 98765 43210",
  customerAddress: "123 Main Street, City",
  pinCode: "560001",  // NEW
  shippingProvider: "sugama",  // NEW
  whatsappNumber: "+91 98765 43210",
  status: "billing",
  totalAmount: 5000,
  paidAmount: 2000,
  paymentStatus: "partial",
  // ... other fields
}
```

## UI Screenshots Description

### Billing Form - New Sections:

**Pin Code Field:**
- Located after WhatsApp Number
- Placeholder: "6-digit pin code"
- Max length: 6 characters

**Shipping Provider Selection:**
- Three large visual buttons
- Each shows icon and provider name
- Selected button has blue border and background
- Responsive grid layout (3 columns on desktop)

### Shipping Modal - Updated:

**Provider Display:**
- Read-only box with purple border
- Shows provider icon and name
- Message: "Provider cannot be changed"
- Cannot be clicked or modified

## Testing Checklist

✅ Create order with pin code
✅ Create order without pin code (optional)
✅ Select each shipping provider during billing
✅ Verify provider is saved in database
✅ Open order in shipping dashboard
✅ Verify correct provider is displayed
✅ Verify provider cannot be changed
✅ Generate tracking ID with correct prefix
✅ Complete shipment successfully
✅ Verify shipment record has correct provider

## Migration Notes

For existing orders without `pinCode` or `shippingProvider`:
- Both fields are optional in the schema
- Existing orders will have `undefined` for these fields
- Shipping modal will default to "sugama" if no provider is set
- No data migration required
- New orders will have these fields populated

## Future Enhancements

Possible improvements:
1. Add provider-specific delivery time estimates
2. Show provider coverage areas during selection
3. Auto-suggest provider based on pin code
4. Add provider-specific pricing
5. Track provider performance metrics
