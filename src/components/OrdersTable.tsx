import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { OrderDetailModal } from "./OrderDetailModal";
import { ShipOrderModal } from "./ShipOrderModal";
import { Id } from "../../convex/_generated/dataModel";

interface OrdersTableProps {
  status?: "billing" | "packing" | "shipping" | "shipped" | "delivered" | "cancelled";
  role?: "billing" | "packing" | "shipping";
  showAll?: boolean;
}

const statusColors: Record<string, string> = {
  billing: "bg-blue-100 text-blue-700",
  packing: "bg-yellow-100 text-yellow-700",
  shipping: "bg-purple-100 text-purple-700",
  shipped: "bg-green-100 text-green-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

export function OrdersTable({ status, role, showAll }: OrdersTableProps) {
  const allOrders = useQuery(showAll ? api.orders.listAll : api.orders.listAll);
  const statusOrders = useQuery(
    status ? api.orders.listByStatus : api.orders.listAll,
    status ? { status } : {}
  );
  const moveToPacking = useMutation(api.orders.moveToPacking);
  const confirmPacking = useMutation(api.orders.confirmPacking);
  const [selectedOrderId, setSelectedOrderId] = useState<Id<"orders"> | null>(null);
  const [shipOrderId, setShipOrderId] = useState<Id<"orders"> | null>(null);
  const [search, setSearch] = useState("");

  const orders = showAll ? allOrders : statusOrders;

  const filtered = orders?.filter((o) => {
    if (!search) return true;
    return (
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerPhone.includes(search)
    );
  });

  const handleMoveToPacking = async (orderId: Id<"orders">) => {
    try {
      await moveToPacking({ orderId });
      toast.success("Order moved to packing!");
    } catch {
      toast.error("Failed to move order");
    }
  };

  const handleConfirmPacking = async (orderId: Id<"orders">) => {
    try {
      await confirmPacking({ orderId });
      toast.success("Order confirmed as packed and moved to shipping!");
    } catch {
      toast.error("Failed to confirm packing");
    }
  };

  if (orders === undefined) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by order number, customer name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
        />
      </div>

      {filtered?.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-3">📭</div>
          <p>No orders found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered?.map((order) => (
            <div key={order._id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-semibold text-gray-800 text-sm">{order.orderNumber}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[order.status]}`}>
                      {order.status}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      order.paymentStatus === "paid" ? "bg-green-100 text-green-700" :
                      order.paymentStatus === "partial" ? "bg-orange-100 text-orange-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                  <div className="mt-1">
                    <span className="font-medium text-gray-700">{order.customerName}</span>
                    <span className="text-gray-400 text-sm ml-2">{order.customerPhone}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5 truncate">{order.customerAddress}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {order.items.length} item(s) · <span className="font-semibold text-gray-700">₹{order.totalAmount.toLocaleString()}</span>
                    {order.paidAmount > 0 && <span className="text-green-600"> · Paid: ₹{order.paidAmount.toLocaleString()}</span>}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedOrderId(order._id)}
                    className="px-3 py-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  >
                    View Details
                  </button>
                  {role === "billing" && order.status === "billing" && (
                    <button
                      onClick={() => handleMoveToPacking(order._id)}
                      className="px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      → Send to Packing
                    </button>
                  )}
                  {role === "packing" && order.status === "packing" && (
                    <button
                      onClick={() => handleConfirmPacking(order._id)}
                      className="px-3 py-1.5 text-xs font-medium bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors"
                    >
                      ✓ Confirm Packed
                    </button>
                  )}
                  {role === "shipping" && order.status === "shipping" && (
                    <button
                      onClick={() => setShipOrderId(order._id)}
                      className="px-3 py-1.5 text-xs font-medium bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                    >
                      🚚 Ship Order
                    </button>
                  )}
                </div>
              </div>
              <div className="text-xs text-gray-400 mt-2">
                Created: {new Date(order._creationTime).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedOrderId && (
        <OrderDetailModal orderId={selectedOrderId} onClose={() => setSelectedOrderId(null)} />
      )}
      {shipOrderId && (
        <ShipOrderModal orderId={shipOrderId} onClose={() => setShipOrderId(null)} />
      )}
    </div>
  );
}
