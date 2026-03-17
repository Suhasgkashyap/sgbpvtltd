import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

interface Props {
  orderId: Id<"orders">;
  onClose: () => void;
}

const providerInfo: Record<string, { label: string; icon: string }> = {
  sugama: { label: "Sugama Transport", icon: "🚛" },
  vrl: { label: "VRL Logistics", icon: "🚚" },
  indian_post: { label: "Indian Post", icon: "📮" },
};

function generateTrackingId(provider: string): string {
  const prefix = provider === "sugama" ? "SGM" : provider === "vrl" ? "VRL" : "IND";
  const rand = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `${prefix}-${rand}`;
}

function buildWhatsAppMessage(
  customerName: string,
  orderNumber: string,
  providerLabel: string,
  trackingId: string,
  estimatedDelivery?: string
): string {
  const lines = [
    `Hello ${customerName}! 🎉`,
    `Your order *${orderNumber}* has been shipped! 🚚`,
    ``,
    `🏢 Shipping Provider: ${providerLabel}`,
    `🔍 Tracking ID: *${trackingId}*`,
    estimatedDelivery ? `📅 Estimated Delivery: ${estimatedDelivery}` : null,
    ``,
    `Thank you for shopping with *SGB Pvt. Ltd.*! 🙏`,
    `For any queries, reply to this message.`,
  ]
    .filter((l) => l !== null)
    .join("\n");
  return lines;
}

function openWhatsApp(phone: string, message: string) {
  // Normalize: remove spaces/dashes, add +91 if no country code
  let number = phone.replace(/[\s\-]/g, "");
  if (!number.startsWith("+")) number = "91" + number;
  else number = number.slice(1); // remove + for wa.me URL
  const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
}

export function ShipOrderModal({ orderId, onClose }: Props) {
  const confirmShipping = useMutation(api.orders.confirmShipping);
  const orderData = useQuery(api.orders.getById, { orderId });
  
  const [provider, setProvider] = useState<"sugama" | "vrl" | "indian_post">("sugama");
  const [trackingId, setTrackingId] = useState("");
  const [estimatedDelivery, setEstimatedDelivery] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (orderData?.shippingProvider) {
      setProvider(orderData.shippingProvider);
      setTrackingId(generateTrackingId(orderData.shippingProvider));
    } else {
      setTrackingId(generateTrackingId("sugama"));
    }
  }, [orderData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId.trim()) return;
    setSubmitting(true);
    try {
      const result = await confirmShipping({
        orderId,
        provider,
        trackingId,
        estimatedDelivery: estimatedDelivery || undefined,
        notes: notes || undefined,
      });

      toast.success("Order shipped successfully!");

      // Open WhatsApp Web with pre-filled message
      if (result?.whatsappNumber) {
        const message = buildWhatsAppMessage(
          result.customerName,
          result.orderNumber,
          providerInfo[provider].label,
          trackingId,
          estimatedDelivery || undefined
        );
        openWhatsApp(result.whatsappNumber, message);
      }

      onClose();
    } catch {
      toast.error("Failed to ship order");
    } finally {
      setSubmitting(false);
    }
  };

  if (!orderData) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">🚚 Ship Order</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Shipping Provider - Display Only */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Provider (Selected during billing)</label>
            <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-purple-200 bg-purple-50">
              <span className="text-3xl">{providerInfo[provider].icon}</span>
              <div>
                <div className="font-semibold text-gray-800">{providerInfo[provider].label}</div>
                <div className="text-xs text-gray-500">Provider cannot be changed</div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tracking ID *</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                required
              />
              <button
                type="button"
                onClick={() => setTrackingId(generateTrackingId(provider))}
                className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
              >
                🔄 Generate
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Delivery</label>
            <input
              type="date"
              value={estimatedDelivery}
              onChange={(e) => setEstimatedDelivery(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              placeholder="Any special instructions..."
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !trackingId.trim()}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {submitting ? "Processing..." : "🚚 Confirm Shipment"}
          </button>
        </form>
      </div>
    </div>
  );
}
