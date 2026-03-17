import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { AnalyticsView } from "../components/AnalyticsView";
import { OrdersTable } from "../components/OrdersTable";
import { ProductsManager } from "../components/ProductsManager";
import { UsersManager } from "../components/UsersManager";

type Tab = "analytics" | "orders" | "products" | "users";

export function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("analytics");
  const analytics = useQuery(api.orders.getAnalytics);

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "analytics", label: "Analytics", icon: "📊" },
    { id: "orders", label: "All Orders", icon: "📋" },
    { id: "products", label: "Products", icon: "🛒" },
    { id: "users", label: "Users", icon: "👥" },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
      <div className="bg-white border-b px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800">⚙️ Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Complete system overview and management</p>
        </div>
      </div>

      {/* Summary Cards */}
      {analytics && (
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard label="Total Orders" value={analytics.totalOrders} icon="📋" color="blue" />
            <StatCard label="Total Revenue" value={`₹${analytics.totalRevenue.toLocaleString()}`} icon="💰" color="green" />
            <StatCard label="Pending Packing" value={analytics.statusCounts["packing"] || 0} icon="📦" color="yellow" />
            <StatCard label="Shipped" value={analytics.statusCounts["shipped"] || 0} icon="🚚" color="purple" />
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border mb-6 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                tab === t.id ? "bg-green-600 text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        {tab === "analytics" && <AnalyticsView />}
        {tab === "orders" && <OrdersTable showAll />}
        {tab === "products" && <ProductsManager />}
        {tab === "users" && <UsersManager />}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: string; color: string }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 border-blue-100",
    green: "bg-green-50 border-green-100",
    yellow: "bg-yellow-50 border-yellow-100",
    purple: "bg-purple-50 border-purple-100",
  };
  return (
    <div className={`rounded-xl p-4 border ${colors[color]}`}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
}
