import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { CreateOrderForm } from "../components/CreateOrderForm";
import { OrdersTable } from "../components/OrdersTable";

type Tab = "create" | "pending" | "history";

export function BillingDashboard() {
  const [tab, setTab] = useState<Tab>("pending");
  const pendingOrders = useQuery(api.orders.listByStatus, { status: "billing" });

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
      <div className="bg-white border-b px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800">🧾 Billing Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Create invoices and manage customer orders</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <div className="text-2xl mb-1">🧾</div>
            <div className="text-2xl font-bold text-gray-800">{pendingOrders?.length ?? 0}</div>
            <div className="text-xs text-gray-500 mt-1">Pending Billing</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border mb-6">
          {[
            { id: "pending" as Tab, label: "Pending Orders", icon: "⏳" },
            { id: "create" as Tab, label: "Create New Bill", icon: "➕" },
            { id: "history" as Tab, label: "Billing History", icon: "📜" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t.id ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        {tab === "create" && (
          <>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 text-sm text-blue-800">
              <strong>WhatsApp Orders:</strong> Receive order details from customers on WhatsApp, then create the billing record below with customer details and products.
            </div>
            <CreateOrderForm onSuccess={() => setTab("pending")} />
          </>
        )}
        {tab === "pending" && <OrdersTable status="billing" role="billing" />}
        {tab === "history" && <OrdersTable showAll role="billing" />}
      </div>
    </div>
  );
}
