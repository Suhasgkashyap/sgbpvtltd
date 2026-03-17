import { useState } from "react";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SignOutButton } from "../SignOutButton";
import { LoginModal } from "./LoginModal";
import { Page } from "../App";

interface HeaderProps {
  page: Page;
  setPage: (p: Page) => void;
  setLoginRole: (r: string | null) => void;
}

export function Header({ page, setPage, setLoginRole }: HeaderProps) {
  const { isAuthenticated } = useConvexAuth();
  const profile = useQuery(api.users.getMyProfile);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const handleLoginSuccess = (selectedRole: string) => {
    setLoginRole(selectedRole);
    setPage("home");
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between">
        <button
          onClick={() => setPage("home")}
          className="flex items-center gap-1.5 sm:gap-2 font-bold text-lg sm:text-xl text-green-700"
        >
          <span className="text-xl sm:text-2xl">🌿</span>
          <span className="hidden xs:inline">SGB Pvt. Ltd.</span>
          <span className="xs:hidden">SGB Pvt. Ltd.</span>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {!isAuthenticated && (
            <>
              <button
                onClick={() => { setPage("home"); }}
                className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => setLoginModalOpen(true)}
                className="px-4 py-2 text-sm font-medium bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors"
              >
                Login
              </button>
            </>
          )}
          {isAuthenticated && profile && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">
                <span className="font-semibold text-gray-700">{profile.name}</span>
                <span className="ml-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs capitalize">{profile.role}</span>
              </span>
              <SignOutButton onSignOut={() => setLoginRole(null)} />
            </div>
          )}
        </nav>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-1.5 sm:p-2 rounded text-gray-600 hover:bg-gray-100"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            }
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t px-3 sm:px-4 py-2 sm:py-3 flex flex-col gap-1.5 sm:gap-2">
          {!isAuthenticated && (
            <>
              <button 
                onClick={() => { setPage("home"); setMenuOpen(false); }} 
                className="text-left px-3 py-2 text-sm font-medium text-gray-600 hover:bg-green-50 rounded"
              >
                Home
              </button>
              <button 
                onClick={() => { setLoginModalOpen(true); setMenuOpen(false); }} 
                className="text-left px-3 py-2 text-sm font-medium bg-green-600 text-white hover:bg-green-700 rounded"
              >
                Login
              </button>
            </>
          )}
          {isAuthenticated && profile && (
            <div className="flex items-center justify-between px-2">
              <span className="text-sm font-semibold text-gray-700">
                {profile.name} <span className="text-green-600 capitalize text-xs">({profile.role})</span>
              </span>
              <SignOutButton onSignOut={() => setLoginRole(null)} />
            </div>
          )}
        </div>
      )}

      {/* Login Modal */}
      <LoginModal 
        isOpen={loginModalOpen} 
        onClose={() => setLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />
    </header>
  );
}
