# Role-Based Routing Fix

## Issue
Users were always being routed to the Billing dashboard regardless of which role they selected during login. The role selection in the login modal was only being used for new users during profile setup, but existing users were being routed based on their previously stored role.

## Root Cause
1. The `setupProfile` mutation wasn't updating the role for existing users
2. There was no mechanism to update a user's role when they logged in with a different role selection
3. The role selected in the login modal was only passed to the SetupProfile page, which existing users never see

## Solution

### 1. Updated `setupProfile` Mutation
**File:** `convex/users.ts`

Changed the mutation to update the role even for existing users:

```typescript
if (existing) {
  await ctx.db.patch(existing._id, {
    name: args.name,
    role: args.role,  // Now updates role
    phone: args.phone,
  });
  return existing._id;
}
```

### 2. Added New `updateMyRole` Mutation
**File:** `convex/users.ts`

Created a new mutation that allows users to update their own role:

```typescript
export const updateMyRole = mutation({
  args: {
    role: v.union(
      v.literal("admin"),
      v.literal("billing"),
      v.literal("packing"),
      v.literal("shipping")
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
      await ctx.db.patch(existing._id, {
        role: args.role,
      });
    }
  },
});
```

### 3. Updated LoginModal to Call `updateMyRole`
**File:** `src/components/LoginModal.tsx`

After successful authentication, the modal now updates the user's role:

```typescript
await signIn("password", formData);

// Update the user's role after successful login
await updateMyRole({ role: role as "admin" | "billing" | "packing" | "shipping" });

onSuccess(role);
```

## How It Works Now

### For New Users:
1. User clicks "Login" and selects "Register"
2. Enters email, password, and selects role (e.g., "Admin")
3. After registration, role is updated via `updateMyRole`
4. User is redirected to SetupProfile page
5. Profile is created with the selected role
6. User is redirected to Admin dashboard

### For Existing Users:
1. User clicks "Login"
2. Enters credentials and selects role (e.g., "Shipping")
3. After authentication, `updateMyRole` is called
4. User's role in database is updated to "Shipping"
5. App.tsx reads the updated profile
6. User is redirected to Shipping dashboard

## User Flow Diagram

```
Login Modal
    ↓
Select Role (Admin/Billing/Packing/Shipping)
    ↓
Enter Credentials
    ↓
Click "Sign In"
    ↓
Authentication Success
    ↓
updateMyRole() called with selected role
    ↓
Profile role updated in database
    ↓
App.tsx reads profile
    ↓
Routes to correct dashboard based on role
```

## Dashboard Routing

The routing happens in `App.tsx` in the `AuthenticatedContent` component:

```typescript
switch (profile.role) {
  case "admin":
    return <AdminDashboard />;
  case "billing":
    return <BillingDashboard />;
  case "packing":
    return <PackingDashboard />;
  case "shipping":
    return <ShippingDashboard />;
  default:
    return <SetupProfile />;
}
```

## Testing

To verify the fix works:

1. **Test with existing user:**
   - Login with existing credentials
   - Select "Admin" role
   - Verify you're redirected to Admin Dashboard
   - Logout and login again
   - Select "Billing" role
   - Verify you're redirected to Billing Dashboard

2. **Test with new user:**
   - Register a new account
   - Select "Shipping" role
   - Complete profile setup
   - Verify you're redirected to Shipping Dashboard

3. **Test all roles:**
   - Admin → Admin Dashboard
   - Billing → Billing Dashboard
   - Packing → Packing Dashboard
   - Shipping → Shipping Dashboard

## Security Note

The `updateMyRole` mutation allows users to change their own role. In a production environment, you might want to add restrictions:

- Only allow role changes for certain users
- Require admin approval for role changes
- Log role changes for audit purposes
- Restrict which roles users can switch to

For now, this implementation allows flexible role switching for development and testing purposes.
