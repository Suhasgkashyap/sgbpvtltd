import { useState } from "react";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Toaster } from "sonner";
import { HomePage } from "./pages/HomePage";
import { AdminDashboard } from "./pages/AdminDashboard";
import { BillingDashboard } from "./pages/BillingDashboard";
import { PackingDashboard } from "./pages/PackingDashboard";
import { ShippingDashboard } from "./pages/ShippingDashboard";
import { LeadDashboard } from "./pages/LeadDashboard";
import { SetupProfile } from "./pages/SetupProfile";
import { AuthPage } from "./pages/AuthPage";
import { Header } from "./components/Header";

export type Page = "home" | "login" | "dashboard";

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [loginRole, setLoginRole] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header page={page} setPage={setPage} setLoginRole={setLoginRole} />
      <main className="flex-1">
        <Unauthenticated>
          {page === "login" ? (
            <AuthPage role={loginRole} onBack={() => setPage("home")} />
          ) : (
            <HomePage setPage={setPage} setLoginRole={setLoginRole} />
          )}
        </Unauthenticated>
        <Authenticated>
          <AuthenticatedContent loginRole={loginRole} setLoginRole={setLoginRole} />
        </Authenticated>
      </main>
      <Toaster richColors position="top-right" />
    </div>
  );
}

function AuthenticatedContent({ loginRole, setLoginRole }: { loginRole: string | null; setLoginRole: (r: string | null) => void }) {
  const profile = useQuery(api.users.getMyProfile);

  if (profile === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return <SetupProfile defaultRole={loginRole} />;
  }

  if (!profile.isActive) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Account Inactive</h2>
          <p className="text-gray-500">Your account has been deactivated. Please contact the admin.</p>
        </div>
      </div>
    );
  }

  // Use loginRole (what user selected at login) if available, otherwise fall back to DB role
  const effectiveRole = loginRole ?? profile.role;

  switch (effectiveRole) {
    case "admin":
      return <AdminDashboard />;
    case "billing":
      return <BillingDashboard />;
    case "packing":
      return <PackingDashboard />;
    case "shipping":
      return <ShippingDashboard />;
    case "telecaller":
      return <LeadDashboard />;
    default:
      return <SetupProfile />;
  }
}
