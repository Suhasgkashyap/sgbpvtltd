import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";
import { FunctionReturnType } from "convex/server";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";

type Lead = FunctionReturnType<typeof api.leads.list>[number];
type CallStatus = "received" | "not_received" | "switched_off" | "busy" | "not_reachable" | "not_interested" | "booked" | "whatsapp";
type CallAttempt = "1st_attempt" | "2nd_attempt" | "3rd_attempt";

const CALL_STATUSES: { value: CallStatus; label: string; color: string; hex: string }[] = [
  { value: "received",      label: "Received",      color: "bg-green-100 text-green-700",   hex: "#22c55e" },
  { value: "not_received",  label: "Not Received",  color: "bg-red-100 text-red-700",       hex: "#ef4444" },
  { value: "switched_off",  label: "Switched Off",  color: "bg-gray-100 text-gray-700",     hex: "#9ca3af" },
  { value: "busy",          label: "Busy",          color: "bg-yellow-100 text-yellow-700", hex: "#eab308" },
  { value: "not_reachable", label: "Not Reachable", color: "bg-orange-100 text-orange-700", hex: "#f97316" },
  { value: "not_interested",label: "Not Interested",color: "bg-purple-100 text-purple-700", hex: "#a855f7" },
  { value: "booked",        label: "Booked",        color: "bg-blue-100 text-blue-700",     hex: "#3b82f6" },
  { value: "whatsapp",      label: "WhatsApp",      color: "bg-teal-100 text-teal-700",     hex: "#14b8a6" },
];

const CALL_ATTEMPTS: { value: CallAttempt; label: string }[] = [
  { value: "1st_attempt", label: "1st Attempt" },
  { value: "2nd_attempt", label: "2nd Attempt" },
  { value: "3rd_attempt", label: "3rd Attempt" },
];

const NEEDS_ATTEMPT: CallStatus[] = ["not_received", "switched_off", "busy", "not_reachable"];

function statusColor(status?: string) {
  return CALL_STATUSES.find((s) => s.value === status)?.color ?? "bg-gray-100 text-gray-500";
}
function statusLabel(status?: string) {
  return CALL_STATUSES.find((s) => s.value === status)?.label ?? "Pending";
}

interface EditModalProps {
  lead: Lead;
  onClose: () => void;
}

function EditLeadModal({ lead, onClose }: EditModalProps) {
  const updateLead = useMutation(api.leads.updateLead);
  const [customerName, setCustomerName] = useState(lead.customerName ?? "");
  const [callStatus, setCallStatus] = useState<CallStatus | "">(lead.callStatus ?? "");
  const [callAttempt, setCallAttempt] = useState<CallAttempt | "">(lead.callAttempt ?? "");
  const [nextCallDate, setNextCallDate] = useState(lead.nextCallDate ?? "");
  const [notes, setNotes] = useState(lead.notes ?? "");
  const [saving, setSaving] = useState(false);

  const showAttempt = callStatus && NEEDS_ATTEMPT.includes(callStatus as CallStatus);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateLead({
        id: lead._id,
        customerName: customerName || undefined,
        callStatus: callStatus as CallStatus || undefined,
        callAttempt: showAttempt ? (callAttempt as CallAttempt || undefined) : undefined,
        nextCallDate: showAttempt ? (nextCallDate || undefined) : undefined,
        notes: notes || undefined,
      });
      toast.success("Lead updated!");
      onClose();
    } catch {
      toast.error("Failed to update lead");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Update Lead</h2>
            <p className="text-sm text-gray-500">{lead.phone}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              placeholder="Enter customer name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Call Status</label>
            <div className="grid grid-cols-2 gap-2">
              {CALL_STATUSES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setCallStatus(s.value)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border-2 transition-all ${
                    callStatus === s.value
                      ? "border-indigo-500 " + s.color
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          {showAttempt && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Call Attempt</label>
                <div className="flex gap-2">
                  {CALL_ATTEMPTS.map((a) => (
                    <button
                      key={a.value}
                      type="button"
                      onClick={() => setCallAttempt(a.value)}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium border-2 transition-all ${
                        callAttempt === a.value
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Next Call Date</label>
                <input
                  type="date"
                  value={nextCallDate}
                  onChange={(e) => setNextCallDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
              placeholder="Add notes..."
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Analytics Section ──────────────────────────────────────────────────────────
function AnalyticsSection({ leads }: { leads: Lead[] }) {
  const today = new Date().toISOString().split("T")[0];

  const analytics = useMemo(() => {
    const total = leads.length;
    const booked = leads.filter((l) => l.callStatus === "booked").length;
    const conversionRate = total > 0 ? Math.round((booked / total) * 100) : 0;
    const dueToday = leads.filter((l) => l.nextCallDate === today).length;

    // Call status distribution
    const statusMap: Record<string, number> = {};
    leads.forEach((l) => {
      const key = l.callStatus ?? "pending";
      statusMap[key] = (statusMap[key] ?? 0) + 1;
    });
    const statusData = [
      { name: "Pending", value: statusMap["pending"] ?? 0, hex: "#d1d5db" },
      ...CALL_STATUSES.map((s) => ({
        name: s.label,
        value: statusMap[s.value] ?? 0,
        hex: s.hex,
      })),
    ].filter((d) => d.value > 0);

    // Per-telecaller performance
    const callerMap: Record<string, { added: number; attended: number }> = {};
    leads.forEach((l) => {
      const name = l.addedByName ?? "Unknown";
      if (!callerMap[name]) callerMap[name] = { added: 0, attended: 0 };
      callerMap[name].added += 1;
      if (l.attendedByName) {
        const aName = l.attendedByName;
        if (!callerMap[aName]) callerMap[aName] = { added: 0, attended: 0 };
        callerMap[aName].attended += 1;
      }
    });
    const callerData = Object.entries(callerMap).map(([name, v]) => ({
      name,
      Added: v.added,
      Attended: v.attended,
    }));

    // Call attempts breakdown
    const attemptMap: Record<string, number> = {};
    leads.forEach((l) => {
      if (l.callAttempt) {
        attemptMap[l.callAttempt] = (attemptMap[l.callAttempt] ?? 0) + 1;
      }
    });
    const attemptData = CALL_ATTEMPTS.map((a) => ({
      name: a.label,
      value: attemptMap[a.value] ?? 0,
    })).filter((d) => d.value > 0);

    return { total, booked, conversionRate, dueToday, statusData, callerData, attemptData };
  }, [leads, today]);

  return (
    <div className="space-y-4">
      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { label: "Total Leads",    value: analytics.total,              icon: "📋", color: "bg-indigo-50 border-indigo-100" },
          { label: "Pending",        value: leads.filter((l) => !l.callStatus).length, icon: "⏳", color: "bg-yellow-50 border-yellow-100" },
          { label: "Booked",         value: analytics.booked,             icon: "✅", color: "bg-green-50 border-green-100" },
          { label: "Not Interested", value: leads.filter((l) => l.callStatus === "not_interested").length, icon: "❌", color: "bg-red-50 border-red-100" },
          { label: "Conversion",     value: analytics.conversionRate + "%",icon: "🎯", color: "bg-blue-50 border-blue-100" },
          { label: "Due Today",      value: analytics.dueToday,           icon: "📅", color: "bg-orange-50 border-orange-100" },
        ].map((s) => (
          <div key={s.label} className={`${s.color} border rounded-xl p-4`}>
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-2xl font-bold text-gray-800">{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Call Status Pie */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Call Status Distribution</h3>
          {analytics.statusData.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-8">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={analytics.statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {analytics.statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.hex} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [v, "Leads"]} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: "11px" }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Telecaller Performance Bar */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Telecaller Performance</h3>
          {analytics.callerData.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-8">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={analytics.callerData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip />
                <Legend iconSize={10} wrapperStyle={{ fontSize: "11px" }} />
                <Bar dataKey="Added" fill="#6366f1" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Attended" fill="#22c55e" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Call Attempts Bar */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Call Attempts Breakdown</h3>
          {analytics.attemptData.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-8">No attempt data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={analytics.attemptData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip formatter={(v) => [v, "Leads"]} />
                <Bar dataKey="value" fill="#f97316" radius={[3, 3, 0, 0]}>
                  {analytics.attemptData.map((_, i) => (
                    <Cell key={i} fill={["#fbbf24", "#f97316", "#ef4444"][i % 3]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export function LeadDashboard() {
  const leads = useQuery(api.leads.list);
  const addLead = useMutation(api.leads.addLead);
  const deleteLead = useMutation(api.leads.deleteLead);

  const [phone, setPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [showAnalytics, setShowAnalytics] = useState(true);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;
    setAdding(true);
    try {
      await addLead({ phone: phone.trim(), customerName: customerName.trim() || undefined });
      toast.success("Lead added!");
      setPhone("");
      setCustomerName("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add lead");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: Id<"leads">) => {
    if (!confirm("Remove this lead?")) return;
    try {
      await deleteLead({ id });
      toast.success("Lead removed");
    } catch {
      toast.error("Failed to remove lead");
    }
  };

  const filtered = (leads ?? []).filter((l: Lead) => {
    const matchStatus = filterStatus === "all" || l.callStatus === filterStatus || (!l.callStatus && filterStatus === "pending");
    const matchSearch = !search || l.phone.includes(search) || l.customerName?.toLowerCase().includes(search.toLowerCase()) || l.addedByName?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
      <div className="bg-white border-b px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">📞 Lead Management</h1>
            <p className="text-gray-500 text-sm mt-1">Manage customer leads and call tracking</p>
          </div>
          <button
            onClick={() => setShowAnalytics((v) => !v)}
            className="px-4 py-2 text-sm font-medium bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors"
          >
            {showAnalytics ? "Hide Analytics" : "Show Analytics"}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Analytics */}
        {leads !== undefined && showAnalytics && (
          <AnalyticsSection leads={leads} />
        )}

        {/* Add Lead Form */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-base font-semibold text-gray-700 mb-4">Add New Lead</h2>
          <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone number *"
              required
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Customer name (optional)"
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
            <button
              type="submit"
              disabled={adding}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm disabled:opacity-50 whitespace-nowrap"
            >
              {adding ? "Adding..." : "+ Add Lead"}
            </button>
          </form>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by phone, name or telecaller..."
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            {CALL_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* Leads Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {leads === undefined ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-2">📭</div>
              <p>No leads found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Phone</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Attempt</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Next Call</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Added By</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Attended By</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((lead: Lead) => (
                    <tr key={lead._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono font-medium text-gray-800">{lead.phone}</td>
                      <td className="px-4 py-3 text-gray-600">{lead.customerName ?? <span className="text-gray-300">—</span>}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(lead.callStatus)}`}>
                          {statusLabel(lead.callStatus)}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-gray-500 text-xs">
                        {lead.callAttempt ? CALL_ATTEMPTS.find((a) => a.value === lead.callAttempt)?.label : "—"}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-gray-500 text-xs">
                        {lead.nextCallDate ?? "—"}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-gray-500 text-xs">{lead.addedByName}</td>
                      <td className="px-4 py-3 hidden lg:table-cell text-gray-500 text-xs">{lead.attendedByName ?? "—"}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingLead(lead)}
                            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-medium transition-colors"
                          >
                            Update
                          </button>
                          <button
                            onClick={() => handleDelete(lead._id)}
                            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-medium transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {editingLead && (
        <EditLeadModal lead={editingLead} onClose={() => setEditingLead(null)} />
      )}
    </div>
  );
}
