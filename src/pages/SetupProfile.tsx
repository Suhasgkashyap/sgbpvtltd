import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

type Role = "admin" | "billing" | "packing" | "shipping" | "telecaller";
const VALID_ROLES: Role[] = ["admin", "billing", "packing", "shipping", "telecaller"];

function toRole(r: string | null | undefined): Role {
  return r && VALID_ROLES.includes(r as Role) ? (r as Role) : "billing";
}

interface SetupProfileProps {
  defaultRole?: string | null;
}

export function SetupProfile({ defaultRole }: SetupProfileProps = {}) {
  const setupProfile = useMutation(api.users.setupProfile);
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>(() => toRole(defaultRole));
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await setupProfile({ name, role, phone: phone || undefined });
      toast.success("Profile set up successfully!");
    } catch (err) {
      toast.error("Failed to set up profile");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">👤</div>
          <h2 className="text-2xl font-bold text-gray-800">Complete Your Profile</h2>
          <p className="text-gray-500 text-sm mt-1">Set up your account to get started</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter your full name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="admin">Admin</option>
              <option value="billing">Billing</option>
              <option value="packing">Packing</option>
              <option value="shipping">Shipping</option>
              <option value="telecaller">Telecaller</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone (optional)</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="+91 XXXXX XXXXX"
            />
          </div>
          <button
            type="submit"
            disabled={submitting || !name.trim()}
            className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {submitting ? "Setting up..." : "Complete Setup"}
          </button>
        </form>
      </div>
    </div>
  );
}
