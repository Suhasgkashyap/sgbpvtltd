import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (role: string) => void;
}

const roleInfo: Record<string, { label: string; icon: string; desc: string }> = {
  billing: { label: "Billing", icon: "🧾", desc: "Create invoices and manage orders" },
  packing: { label: "Packing", icon: "📦", desc: "Confirm packing and prepare orders" },
  shipping: { label: "Shipping", icon: "🚚", desc: "Manage shipments and tracking" },
  admin: { label: "Admin", icon: "⚙️", desc: "Full system access and analytics" },
  telecaller: { label: "Telecaller", icon: "📞", desc: "Manage leads and call tracking" },
};

export function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const { signIn } = useAuthActions();
  const updateMyRole = useMutation(api.users.updateMyRole);
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState("billing");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      formData.set("flow", isRegister ? "signUp" : "signIn");

      // signIn resolves once the session is established
      await signIn("password", formData);

      // Now the session is active — update role in DB
      try {
        await updateMyRole({ role: role as "admin" | "billing" | "packing" | "shipping" | "telecaller" });
      } catch {
        // Role update can fail if profile doesn't exist yet (new user going to SetupProfile)
        // That's fine — SetupProfile will handle it
      }

      toast.success(isRegister ? "Account created!" : "Signed in!");
      onSuccess(role);
      onClose();
    } catch (error) {
      // signIn itself failed — wrong credentials or account doesn't exist
      let errorMessage = "Authentication failed. Please try again.";
      if (error instanceof Error) {
        if (error.message.toLowerCase().includes("invalid") || error.message.toLowerCase().includes("password")) {
          errorMessage = "Invalid email or password.";
        } else if (error.message.toLowerCase().includes("exist") || error.message.toLowerCase().includes("found")) {
          errorMessage = isRegister
            ? "An account with this email already exists. Try signing in."
            : "No account found. Try registering first.";
        } else {
          errorMessage = isRegister
            ? "Could not create account. Try signing in instead."
            : "Could not sign in. Try registering first.";
        }
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
              {isRegister ? "Create Account" : "Sign In"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              aria-label="Close"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Role Info */}
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-100">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-2xl sm:text-3xl">{roleInfo[role].icon}</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base">{roleInfo[role].label} Portal</h3>
                <p className="text-xs text-gray-600 truncate">{roleInfo[role].desc}</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                required
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                placeholder="your@email.com"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                minLength={6}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            {/* Role Dropdown */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Select Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-white"
              >
                <option value="billing">🧾 Billing</option>
                <option value="packing">📦 Packing</option>
                <option value="shipping">🚚 Shipping</option>
                <option value="admin">⚙️ Admin</option>
                <option value="telecaller">📞 Telecaller</option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 sm:py-3 text-sm sm:text-base bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Please wait..." : isRegister ? "Create Account" : "Sign In"}
            </button>
          </form>

          {/* Toggle Register/Login */}
          <div className="mt-4 sm:mt-6 text-center">
            <button
              onClick={() => {
                setIsRegister(!isRegister);
              }}
              className="text-xs sm:text-sm text-green-600 hover:text-green-700 font-medium"
            >
              {isRegister ? "Already have an account? Sign in" : "Don't have an account? Register"}
            </button>
          </div>

          {/* Info */}
          <p className="text-xs text-center text-gray-400 mt-3 sm:mt-4">
            {isRegister 
              ? "You'll set up your profile after registration" 
              : "Access your SGB dashboard with your credentials"}
          </p>
        </div>
      </div>
    </div>
  );
}
