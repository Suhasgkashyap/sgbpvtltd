import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

interface OrderItem {
  productId: Id<"products">;
  productName: string;
  quantity: number;
  unitPrice: number;
  unit: string;
}

interface Props {
  onSuccess: () => void;
}

export function CreateOrderForm({ onSuccess }: Props) {
  const products = useQuery(api.products.list);
  const createOrder = useMutation(api.orders.create);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [shippingProvider, setShippingProvider] = useState<"sugama" | "vrl" | "indian_post">("sugama");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [paidAmount, setPaidAmount] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "partial" | "paid">("pending");
  const [items, setItems] = useState<OrderItem[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  const addItem = () => {
    if (!products || products.length === 0) return;
    const p = products[0];
    setItems([...items, {
      productId: p._id,
      productName: p.name,
      quantity: 1,
      unitPrice: p.price,
      unit: p.unit,
    }]);
  };

  const updateItem = (idx: number, field: keyof OrderItem, value: string | number | Id<"products">) => {
    const updated = [...items];
    if (field === "productId") {
      const product = products?.find((p) => p._id === value);
      if (product) {
        updated[idx] = {
          ...updated[idx],
          productId: product._id,
          productName: product.name,
          unitPrice: product.price,
          unit: product.unit,
        };
      }
    } else {
      (updated[idx] as Record<string, unknown>)[field] = value;
    }
    setItems(updated);
  };

  const removeItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Please add at least one item");
      return;
    }
    setSubmitting(true);
    try {
      await createOrder({
        customerName,
        customerPhone,
        customerAddress,
        pinCode: pinCode || undefined,
        shippingProvider,
        whatsappNumber: whatsappNumber || undefined,
        notes: notes || undefined,
        paidAmount,
        paymentStatus,
        items,
      });
      toast.success("Order created successfully!");
      onSuccess();
    } catch {
      toast.error("Failed to create order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-lg font-bold text-gray-800 mb-6">Create New Order</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Details */}
        <div>
          <h3 className="font-semibold text-gray-700 mb-3">Customer Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Customer Name *</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Phone *</label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">WhatsApp Number</label>
              <input
                type="tel"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="If different from phone"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Pin Code</label>
              <input
                type="text"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="6-digit pin code"
                maxLength={6}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-1">Address *</label>
              <input
                type="text"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Shipping Provider */}
        <div>
          <h3 className="font-semibold text-gray-700 mb-3">Shipping Provider *</h3>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setShippingProvider("sugama")}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                shippingProvider === "sugama"
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:border-gray-300 text-gray-600"
              }`}
            >
              <span className="text-3xl">🚛</span>
              <span className="text-sm font-medium">Sugama Transport</span>
            </button>
            <button
              type="button"
              onClick={() => setShippingProvider("vrl")}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                shippingProvider === "vrl"
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:border-gray-300 text-gray-600"
              }`}
            >
              <span className="text-3xl">🚚</span>
              <span className="text-sm font-medium">VRL Logistics</span>
            </button>
            <button
              type="button"
              onClick={() => setShippingProvider("indian_post")}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                shippingProvider === "indian_post"
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:border-gray-300 text-gray-600"
              }`}
            >
              <span className="text-3xl">📮</span>
              <span className="text-sm font-medium">Indian Post</span>
            </button>
          </div>
        </div>

        {/* Order Items */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-700">Order Items</h3>
            <button
              type="button"
              onClick={addItem}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Add Item
            </button>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 text-gray-400">
              <p>No items added yet. Click "Add Item" to start.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Product</label>
                      <select
                        value={item.productId}
                        onChange={(e) => updateItem(idx, "productId", e.target.value as Id<"products">)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {products?.map((p) => (
                          <option key={p._id} value={p._id}>{p.name} (₹{p.price}/{p.unit})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(idx, "quantity", Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Unit Price (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(idx, "unitPrice", Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-medium text-gray-700">
                      Subtotal: <span className="text-green-700">₹{(item.quantity * item.unitPrice).toLocaleString()}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {items.length > 0 && (
            <div className="mt-3 p-3 bg-green-50 rounded-xl border border-green-100 text-right">
              <span className="font-bold text-green-700 text-lg">Total: ₹{totalAmount.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Payment */}
        <div>
          <h3 className="font-semibold text-gray-700 mb-3">Payment Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Paid Amount (₹)</label>
              <input
                type="number"
                min="0"
                value={paidAmount}
                onChange={(e) => setPaidAmount(Number(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Payment Status</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as typeof paymentStatus)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="partial">Partial</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Special instructions or notes..."
          />
        </div>

        <button
          type="submit"
          disabled={submitting || items.length === 0}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
        >
          {submitting ? "Creating Order..." : "🧾 Create Order"}
        </button>
      </form>
    </div>
  );
}
