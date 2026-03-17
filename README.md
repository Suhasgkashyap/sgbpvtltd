# SGB Pvt. Ltd. - Order Management System

A full-stack web application for **SGB Pvt. Ltd.** that manages the entire order workflow from billing to shipping. Role-based management with Admin, Billing, Packing, and Shipping.

---

## 1. Website Overview

Professional website for SGB Pvt. Ltd. selling hardware/agro products.

### Home Page
- Company introduction
- Product categories (Agro, Packaging, Irrigation, Hardware, Farm Equipment)
- Product information from [SGB Agro Industries](https://sgbagroindustries.com/product-category/all-products/)
- About the company
- WhatsApp ordering
- Staff portal login links

**Design:** Modern, responsive, clean professional layout with Tailwind CSS.

---

## 2. User Roles

### Admin
- Manage all users (Billing, Packing, Shipping)
- View all orders and transactions
- Analytics dashboard
- Profit and loss statistics
- Product sales monitoring
- Shipped order tracking
- Product management

**Dashboard:** Graphs (Monthly Revenue, Top Products, Shipping Distribution, Order Completion Rate), P&L cards, Users tab, Products tab, Orders tab.

### Billing
- Receive order details from WhatsApp
- Create billing records
- Enter customer details, select products
- Generate invoice, confirm payment
- Move order to Packing

**Dashboard:** Create New Bill, Pending Orders, Billing History, Send to Packing.

### Packing
- View billed orders
- Confirm product packing
- Update packing status
- Move order to Shipping

**Dashboard:** Pending Packing, Packed Orders, Packing confirmation.

### Shipping
- View packed orders
- Select provider: **Sugama Transport** | **VRL Logistics** | **Indian Post**
- Generate Tracking ID
- Save shipment details
- Mark order as Shipped

**Dashboard:** Pending Shipments, Shipped Orders, Tracking ID generation.

---

## 3. Order Workflow

```
WhatsApp Order → Billing → Packing → Shipping → Shipped/Delivered
```

1. Orders received via WhatsApp
2. Billing creates invoice
3. Billing confirms → Packing
4. Packing confirms packed → Shipping
5. Shipping selects provider, adds Tracking ID
6. Order marked Shipped
7. Shipment details saved in database

---

## 4. Authentication

- **Login** (email + password)
- **Register** (new users set profile + role)
- Role-based access
- Session management (Convex Auth)
- Secure password hashing

### Header Navigation
- Home
- Register
- Billing Login
- Packing Login
- Shipping Login
- Admin Login

---

## 5. Database (Convex)

| Table | Purpose |
|-------|---------|
| users | Auth accounts (Convex Auth) |
| userProfiles | Name, role, phone, isActive |
| products | Name, category, price, stock, etc. |
| orders | Order details, status, amounts |
| orderItems | Line items per order |
| shipments | Provider, Tracking ID, shippedAt |

---

## 6. Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, Vite, Tailwind CSS, Chart.js |
| Backend | Convex (serverless functions) |
| Database | Convex (real-time, cloud) |
| Auth | Convex Auth (email/password) |

Convex provides cloud backend, real-time sync, and auth—similar benefits to Firebase Firestore.

---

## 7. Dashboard Analytics

- Total orders
- Total revenue
- Top selling products
- Pending / packed / shipped counts
- **Charts:** Monthly Revenue, Order Status, Order Completion Rate, Shipping Provider Distribution
- **P&L:** Revenue, Collected, Cancelled (loss), Completion %

---

## 8. Pages

- Home
- Login / Register
- Admin Dashboard (Analytics, Orders, Products, Users)
- Billing Dashboard
- Packing Dashboard
- Shipping Dashboard

---

## 9. Run the App

```bash
npm install
npm run dev
```

Opens frontend at `http://localhost:5173` and Convex backend.

### First-time setup
1. Sign up via Register or any role Login
2. Complete profile (name, role)
3. Admin: Create users, seed products via Products tab

---

## 10. Optional Features (Available)

- Order search (search in OrdersTable)
- Order history (view all orders)
- Product inventory (stock in Products Manager)
- WhatsApp link on Home Page

---

© 2025 SGB Pvt. Ltd. | Hardware & Agro Products
