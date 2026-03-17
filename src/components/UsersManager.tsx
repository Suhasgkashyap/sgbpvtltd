import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

const roleColors: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700",
  billing: "bg-blue-100 text-blue-700",
  packing: "bg-yellow-100 text-yellow-700",
  shipping: "bg-indigo-100 text-indigo-700",
};

export function UsersManager() {
  const users = useQuery(api.users.getAllUsers);
  const updateUserRole = useMutation(api.users.updateUserRole);
  const [search, setSearch] = useState("");

  const filtered = users?.filter((u) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(s) ||
      u.email?.toLowerCase().includes(s) ||
      u.role.toLowerCase().includes(s) ||
      u.phone?.includes(search)
    );
  });

  const handleRoleChange = async (
    profileId: Id<"userProfiles">,
    role: "admin" | "billing" | "packing" | "shipping",
    isActive: boolean
  ) => {
    try {
      await updateUserRole({ profileId, role, isActive });
      toast.success("User updated");
    } catch {
      toast.error("Failed to update user");
    }
  };

  if (users === undefined) {
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
          placeholder="Search by name, email, role, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
        />
      </div>

      {filtered?.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-3">👥</div>
          <p>No users found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered?.map((user) => (
            <div
              key={user._id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-medium text-gray-800">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                  {user.phone && (
                    <div className="text-xs text-gray-400">{user.phone}</div>
                  )}
                  <span
                    className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      user.isActive ? roleColors[user.role] : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {user.role}
                    {!user.isActive && " (inactive)"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <select
                    value={user.role}
                    onChange={(e) =>
                      handleRoleChange(
                        user._id,
                        e.target.value as "admin" | "billing" | "packing" | "shipping",
                        user.isActive
                      )
                    }
                    className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="admin">Admin</option>
                    <option value="billing">Billing</option>
                    <option value="packing">Packing</option>
                    <option value="shipping">Shipping</option>
                  </select>
                  <button
                    onClick={() =>
                      handleRoleChange(
                        user._id,
                        user.role,
                        !user.isActive
                      )
                    }
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      user.isActive
                        ? "bg-red-50 hover:bg-red-100 text-red-600"
                        : "bg-green-50 hover:bg-green-100 text-green-600"
                    }`}
                  >
                    {user.isActive ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
