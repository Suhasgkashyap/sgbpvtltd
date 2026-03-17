import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export function AnalyticsView() {
  const analytics = useQuery(api.orders.getAnalytics);

  if (analytics === undefined) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const monthlyLabels = Object.keys(analytics.monthlyRevenue).sort();
  const monthlyData = monthlyLabels.map((k) => analytics.monthlyRevenue[k]);

  const barData = {
    labels: monthlyLabels,
    datasets: [
      {
        label: "Revenue (₹)",
        data: monthlyData,
        backgroundColor: "rgba(34, 197, 94, 0.5)",
        borderColor: "rgb(34, 197, 94)",
        borderWidth: 1,
      },
    ],
  };

  const statusLabels = Object.keys(analytics.statusCounts);
  const statusData = statusLabels.map((k) => analytics.statusCounts[k]);
  const statusDoughnutData = {
    labels: statusLabels.map((s) => s.charAt(0).toUpperCase() + s.slice(1)),
    datasets: [
      {
        data: statusData,
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)",
          "rgba(234, 179, 8, 0.8)",
          "rgba(139, 92, 246, 0.8)",
          "rgba(34, 197, 94, 0.8)",
          "rgba(16, 185, 129, 0.8)",
          "rgba(239, 68, 68, 0.8)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const providerLabels = Object.keys(analytics.providerCounts);
  const providerData = providerLabels.map((k) => analytics.providerCounts[k]);
  const providerDoughnutData = {
    labels: providerLabels.map((s) =>
      s === "indian_post" ? "Indian Post" : s.toUpperCase()
    ),
    datasets: [
      {
        data: providerData,
        backgroundColor: [
          "rgba(34, 197, 94, 0.8)",
          "rgba(59, 130, 246, 0.8)",
          "rgba(234, 179, 8, 0.8)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" as const },
    },
  };

  // Order completion rate for donut
  const completionData = {
    labels: ["Completed (Shipped/Delivered)", "In Progress"],
    datasets: [
      {
        data: [
          analytics.completedOrders ?? 0,
          Math.max(0, (analytics.totalOrders ?? 0) - (analytics.completedOrders ?? 0) - (analytics.statusCounts?.cancelled ?? 0)),
        ],
        backgroundColor: ["rgba(34, 197, 94, 0.8)", "rgba(234, 179, 8, 0.8)"],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* P&L and Completion Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-green-50 border border-green-100 rounded-xl p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Revenue</div>
          <div className="text-xl font-bold text-green-700">₹{(analytics.totalRevenue ?? 0).toLocaleString()}</div>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Collected</div>
          <div className="text-xl font-bold text-blue-700">₹{(analytics.totalPaid ?? 0).toLocaleString()}</div>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-xl p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Cancelled (Loss)</div>
          <div className="text-xl font-bold text-red-700">₹{(analytics.cancelledRevenue ?? 0).toLocaleString()}</div>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Completion Rate</div>
          <div className="text-xl font-bold text-emerald-700">{(analytics.orderCompletionRate ?? 0)}%</div>
        </div>
      </div>

      {/* Revenue chart */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-4">Monthly Revenue</h3>
        <div className="h-64">
          <Bar data={barData} options={chartOptions} />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Order status distribution */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Orders by Status</h3>
          <div className="h-64">
            <Doughnut data={statusDoughnutData} options={chartOptions} />
          </div>
        </div>

        {/* Order completion rate */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Order Completion Rate</h3>
          <div className="h-64">
            <Doughnut data={completionData} options={chartOptions} />
          </div>
        </div>

        {/* Shipping providers */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Shipping Providers</h3>
          <div className="h-64">
            <Doughnut data={providerDoughnutData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Top products */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-4">Top Products by Revenue</h3>
        {analytics.topProducts.length === 0 ? (
          <p className="text-gray-500 text-sm">No product sales data yet</p>
        ) : (
          <ul className="space-y-2">
            {analytics.topProducts.map((p, i) => (
              <li key={i} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                <span className="font-medium text-gray-700">{p.name}</span>
                <span className="text-sm text-gray-500">
                  {p.qty} sold · ₹{p.revenue.toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
