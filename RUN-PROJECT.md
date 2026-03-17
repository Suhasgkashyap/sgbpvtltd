# How to Run the Project

## Prerequisites
Make sure Node.js and npm are installed and available in your PATH.

## Steps to Run

### Option 1: Run Both Frontend and Backend Together (Recommended)
```bash
npm run dev
```

This will start:
- Vite development server (frontend) on http://localhost:5173
- Convex backend (database and API)

### Option 2: Run Frontend and Backend Separately

**Terminal 1 - Start Convex Backend:**
```bash
npm run dev:backend
```

**Terminal 2 - Start Frontend:**
```bash
npm run dev:frontend
```

## What to Expect

### Convex Backend Output:
```
✔ Convex functions ready!
  https://your-deployment.convex.cloud
```

### Frontend Output:
```
  VITE v6.2.0  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## Accessing the Application

Once both servers are running:
1. Open your browser
2. Go to: http://localhost:5173
3. You should see the SGB Pvt. Ltd. homepage

## Testing the New Features

### 1. Test Login System
- Click "Login" button in header
- Try registering a new account
- Select a role (Admin, Billing, Packing, Shipping)
- Verify you're redirected to the correct dashboard

### 2. Test Billing with New Fields
- Login as Billing user
- Click "Create New Order"
- Fill in customer details including:
  - **Pin Code** (new field)
  - **Shipping Provider** (new section - select Sugama/VRL/Indian Post)
- Add order items
- Create the order

### 3. Test Shipping Process
- Login as Shipping user
- Open an order that's ready for shipping
- Click "Ship Order"
- Verify:
  - Shipping provider is displayed (read-only)
  - Provider matches what was selected during billing
  - Cannot change the provider
  - Tracking ID generates with correct prefix
- Complete the shipment

### 4. Test Product Images
- Go to homepage
- Scroll to "Our Products" section
- Verify product images are displayed
- If images don't show, check `public/products/` folder

## Troubleshooting

### Issue: npm command not found
**Solution:** 
1. Install Node.js from https://nodejs.org/
2. Restart your terminal
3. Verify installation: `node --version` and `npm --version`

### Issue: Port 5173 already in use
**Solution:**
```bash
# Kill the process using port 5173
netstat -ano | findstr :5173
taskkill /PID <PID_NUMBER> /F
```

### Issue: Convex authentication errors
**Solution:**
1. Check `.env.local` file exists
2. Verify Convex deployment URL is correct
3. Run `npx convex dev` to reinitialize

### Issue: Product images not showing
**Solution:**
1. Ensure images are in `public/products/` folder
2. Check filenames match exactly:
   - brush-cutter-trolley.jpg
   - bc-520-brush-cutter.jpg
   - carry-cart.jpg
   - cycle-weeder.jpg
   - g45l-brush-cutter.jpg
   - wheel-barrow.jpg
3. Hard refresh browser (Ctrl+Shift+R)

### Issue: Database schema errors
**Solution:**
```bash
# Clear Convex cache and restart
npx convex dev --clear-cache
```

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Clear Convex cache
npx convex dev --clear-cache
```

## Project Structure

```
sgb-final/
├── convex/              # Backend (Convex functions)
│   ├── auth.ts         # Authentication
│   ├── orders.ts       # Order management
│   ├── products.ts     # Product management
│   ├── users.ts        # User profiles
│   └── schema.ts       # Database schema
├── src/
│   ├── components/     # React components
│   │   ├── CreateOrderForm.tsx  # Billing form (NEW FIELDS)
│   │   ├── ShipOrderModal.tsx   # Shipping modal (UPDATED)
│   │   ├── LoginModal.tsx       # Login modal (NEW)
│   │   └── Header.tsx           # Header with login (UPDATED)
│   ├── pages/          # Page components
│   │   ├── HomePage.tsx
│   │   ├── BillingDashboard.tsx
│   │   ├── PackingDashboard.tsx
│   │   ├── ShippingDashboard.tsx
│   │   └── AdminDashboard.tsx
│   └── App.tsx         # Main app component
├── public/
│   └── products/       # Product images
└── package.json

```

## Recent Changes Summary

### ✅ Login System
- Single "Login" button in header
- Modal with email, password, and role selection
- Automatic routing to role-specific dashboards

### ✅ Billing Form Enhancements
- Added Pin Code field (optional, 6 digits)
- Added Shipping Provider selection (Sugama/VRL/Indian Post)
- Provider is selected during order creation

### ✅ Shipping Process Update
- Shipping provider is now read-only
- Uses provider selected during billing
- Tracking ID auto-generates with correct prefix
- Faster shipping process (one less decision)

### ✅ Product Images
- Support for product images in homepage
- Images stored in `public/products/`
- Automatic fallback to emoji icons if images fail

## Support

If you encounter any issues:
1. Check the browser console (F12) for errors
2. Check the terminal output for backend errors
3. Verify all dependencies are installed: `npm install`
4. Clear browser cache and restart servers

## Next Steps

After running the project:
1. Create test accounts for each role
2. Test the complete order workflow
3. Verify all new features work correctly
4. Add actual product images to `public/products/`
5. Customize branding and content as needed
