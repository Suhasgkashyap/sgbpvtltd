import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { OrdersTable } from "../components/OrdersTable";

type Tab = "pending" | "shipped";

export function ShippingDashboard() {
  const [tab, setTab] = useState<Tab>("pending");
  const pendingOrders = useQuery(api.orders.listByStatus, { status: "shipping" });
  const shippedOrders = useQuery(api.orders.listByStatus, { status: "shipped" });

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
      <div className="bg-white border-b px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800">🚚 Shipping Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Manage shipments and generate tracking IDs</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
            <div className="text-2xl mb-1">⏳</div>
            <div className="text-2xl font-bold text-gray-800">{pendingOrders?.length ?? 0}</div>
            <div className="text-xs text-gray-500 mt-1">Pending Shipment</div>
          </div>
          <div className="bg-green-50 border border-green-100 rounded-xl p-4">
            <div className="text-2xl mb-1">✅</div>
            <div className="text-2xl font-bold text-gray-800">{shippedOrders?.length ?? 0}</div>
            <div className="text-xs text-gray-500 mt-1">Shipped Orders</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border mb-6">
          {[
            { id: "pending" as Tab, label: "Pending Shipment", icon: "⏳" },
            { id: "shipped" as Tab, label: "Shipped Orders", icon: "✅" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t.id ? "bg-purple-600 text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        {tab === "pending" && <OrdersTable status="shipping" role="shipping" />}
        {tab === "shipped" && <OrdersTable status="shipped" role="shipping" />}
      </div>
    </div>
  );
}
