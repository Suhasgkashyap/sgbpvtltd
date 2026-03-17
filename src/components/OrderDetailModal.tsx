import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface Props {
  orderId: Id<"orders">;
  onClose: () => void;
}

const providerLabels: Record<string, string> = {
  sugama: "Sugama Transport",
  vrl: "VRL Logistics",
  indian_post: "Indian Post",
};

export function OrderDetailModal({ orderId, onClose }: Props) {
  const order = useQuery(api.orders.getById, { orderId });

  if (!order) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 w-full max-w-lg">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Order Details</h2>
            <p className="text-sm font-mono text-gray-500">{order.orderNumber}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer Info */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">Customer Information</h3>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Name:</span><span className="font-medium">{order.customerName}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Phone:</span><span className="font-medium">{order.customerPhone}</span></div>
              {order.whatsappNumber && <div className="flex justify-between"><span className="text-gray-500">WhatsApp:</span><span className="font-medium">{order.whatsappNumber}</span></div>}
              <div className="flex justify-between"><span className="text-gray-500">Address:</span><span className="font-medium text-right max-w-xs">{order.customerAddress}</span></div>
            </div>
          </div>

          {/* Order Status */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">Order Status</h3>
            <div className="flex flex-wrap gap-2">
              {["billing", "packing", "shipping", "shipped", "delivered"].map((s, i) => {
                const statuses = ["billing", "packing", "shipping", "shipped", "delivered", "cancelled"];
                const currentIdx = statuses.indexOf(order.status);
                const stepIdx = statuses.indexOf(s);
                const isDone = currentIdx >= stepIdx && order.status !== "cancelled";
                const isCurrent = order.status === s;
                return (
                  <div key={s} className="flex items-center gap-1">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                      isCurrent ? "bg-green-600 text-white" :
                      isDone ? "bg-green-100 text-green-700" :
                      "bg-gray-100 text-gray-400"
                    }`}>{s}</div>
                    {i < 4 && <span className="text-gray-300">→</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Items */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">Order Items</h3>
            <div className="border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-2 text-gray-500 font-medium">Product</th>
                    <th className="text-right px-4 py-2 text-gray-500 font-medium">Qty</th>
                    <th className="text-right px-4 py-2 text-gray-500 font-medium">Price</th>
                    <th className="text-right px-4 py-2 text-gray-500 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item._id} className="border-t">
                      <td className="px-4 py-2">{item.productName}</td>
                      <td className="px-4 py-2 text-right">{item.quantity} {item.unit}</td>
                      <td className="px-4 py-2 text-right">₹{item.unitPrice.toLocaleString()}</td>
                      <td className="px-4 py-2 text-right font-medium">₹{item.totalPrice.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t">
                  <tr>
                    <td colSpan={3} className="px-4 py-2 text-right font-semibold">Total Amount:</td>
                    <td className="px-4 py-2 text-right font-bold text-green-700">₹{order.totalAmount.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="px-4 py-2 text-right font-semibold">Paid Amount:</td>
                    <td className="px-4 py-2 text-right font-bold text-blue-700">₹{order.paidAmount.toLocaleString()}</td>
                  </tr>
                  {order.totalAmount > order.paidAmount && (
                    <tr>
                      <td colSpan={3} className="px-4 py-2 text-right font-semibold">Balance Due:</td>
                      <td className="px-4 py-2 text-right font-bold text-red-600">₹{(order.totalAmount - order.paidAmount).toLocaleString()}</td>
                    </tr>
                  )}
                </tfoot>
              </table>
            </div>
          </div>

          {/* Shipment Info */}
          {order.shipment && (
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">Shipment Details</h3>
              <div className="bg-purple-50 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Provider:</span><span className="font-medium">{providerLabels[order.shipment.provider]}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Tracking ID:</span><span className="font-mono font-bold text-purple-700">{order.shipment.trackingId}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Shipped At:</span><span className="font-medium">{new Date(order.shipment.shippedAt).toLocaleString()}</span></div>
                {order.shipment.estimatedDelivery && <div className="flex justify-between"><span className="text-gray-500">Est. Delivery:</span><span className="font-medium">{order.shipment.estimatedDelivery}</span></div>}
                {order.shipment.notes && <div className="flex justify-between"><span className="text-gray-500">Notes:</span><span className="font-medium">{order.shipment.notes}</span></div>}
              </div>
            </div>
          )}

          {order.notes && (
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Notes</h3>
              <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
