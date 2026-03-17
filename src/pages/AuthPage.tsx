import { SignInForm } from "../SignInForm";

const roleInfo: Record<string, { label: string; color: string; icon: string; desc: string }> = {
  billing: { label: "Billing", color: "blue", icon: "🧾", desc: "Create invoices and manage customer orders" },
  packing: { label: "Packing", color: "yellow", icon: "📦", desc: "Confirm packing and prepare orders for shipping" },
  shipping: { label: "Shipping", color: "purple", icon: "🚚", desc: "Manage shipments and generate tracking IDs" },
  admin: { label: "Admin", color: "green", icon: "⚙️", desc: "Full system access and analytics" },
};

interface AuthPageProps {
  role: string | null;
  onBack: () => void;
}

export function AuthPage({ role, onBack }: AuthPageProps) {
  const info = role ? roleInfo[role] : null;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="w-full max-w-md">
        <button onClick={onBack} className="mb-6 flex items-center gap-2 text-gray-600 hover:text-green-700 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </button>
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {info && (
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">{info.icon}</div>
              <h1 className="text-2xl font-bold text-gray-800">{info.label} Portal</h1>
              <p className="text-gray-500 text-sm mt-1">{info.desc}</p>
            </div>
          )}
          {!info && (
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Sign In</h1>
              <p className="text-gray-500 text-sm mt-1">Access your SGB dashboard</p>
            </div>
          )}
          <SignInForm />
          <p className="text-xs text-center text-gray-400 mt-4">
            New users will set up their profile and role after first sign-in.
          </p>
        </div>
      </div>
    </div>
  );
}
