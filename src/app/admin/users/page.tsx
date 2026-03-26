"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Copy, Plus } from "lucide-react";
import { adminApiRequest } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { CreateUserModal, CreateUserFormState, createDefaultForm } from "@/components/admin/CreateUserModal";
import { UserActionsPanel } from "@/components/admin/UserActionsPanel";
import type { UserRecord } from "@/types/admin-users";

const formatDate = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-KE");
};

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createForm, setCreateForm] = useState<CreateUserFormState>(() => createDefaultForm());
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState<{
    fullName: string;
    accessType: "regular" | "bulk_buyer" | "bulk_seller";
    setupUrl: string;
    expiresAt?: string;
  } | null>(null);

  const handleSearch = async (targetPage = 1) => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append("query", searchQuery.trim());
      if (statusFilter) params.append("status", statusFilter);
      params.append("page", String(targetPage));
      params.append("limit", "20");
      params.append("sortBy", "createdAt");

      const response = await adminApiRequest(`${API_ENDPOINTS.admin.users.search}?${params.toString()}`);
      setUsers(Array.isArray(response?.data) ? response.data : []);
      setTotal(response?.pagination?.total || 0);
      setPage(targetPage);
    } catch (searchError: any) {
      setError(searchError?.message || "Failed to search users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialLoad = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await adminApiRequest(`${API_ENDPOINTS.admin.users.search}?page=1&limit=20&sortBy=createdAt`);
        setUsers(Array.isArray(response?.data) ? response.data : []);
        setTotal(response?.pagination?.total || 0);
        setPage(1);
      } catch (searchError: any) {
        setError(searchError?.message || "Failed to search users.");
      } finally {
        setLoading(false);
      }
    };

    void initialLoad();
  }, []);

  const handleCreateUser = async () => {
    setCreateSubmitting(true);
    setCreateError("");

    try {
      const body: Record<string, unknown> = {
        accessType: createForm.accessType,
        fullName: createForm.fullName.trim(),
        email: createForm.email.trim(),
        phone: createForm.phone.trim(),
      };

      if (createForm.accessType !== "regular") {
        body.organizationName = createForm.organizationName.trim();
        body.institutionType = createForm.institutionType;
        body.county = createForm.county;
        body.constituency = createForm.constituency || undefined;
        body.ward = createForm.ward || undefined;
        body.streetAddress = createForm.streetAddress.trim() || undefined;
        body.products = createForm.productsText.split(",").map((item) => item.trim()).filter(Boolean);
        body.deliveryCoverage = createForm.deliveryCoverage;
        body.notes = createForm.notes.trim() || undefined;

        if (createForm.accessType === "bulk_seller") {
          body.yearsInAgriculture = Number(createForm.yearsInAgriculture || 0);
        }

        if (createForm.accessType === "bulk_buyer") {
          body.procurementFrequency = createForm.procurementFrequency;
          body.monthlyVolume = createForm.monthlyVolume.trim() || undefined;
          body.estimatedBudgetPerOrder = createForm.estimatedBudgetPerOrder.trim() || undefined;
        }
      }

      const response = await adminApiRequest(API_ENDPOINTS.admin.users.create, {
        method: "POST",
        body: JSON.stringify(body),
      });
      const successData = response?.data;
      setCreateSuccess({
        fullName: successData?.user?.fullName || createForm.fullName,
        accessType: successData?.accessType || createForm.accessType,
        setupUrl: successData?.setupUrl || "",
        expiresAt: successData?.expiresAt,
      });
      setCreateForm(createDefaultForm());
      await handleSearch(page);
    } catch (createUserError: any) {
      setCreateError(createUserError?.message || "Unable to create user.");
    } finally {
      setCreateSubmitting(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <div className="ui-page-shell">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="ui-hero-panel p-6 md:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="ui-section-kicker">User management</p>
              <h1 className="mt-4 text-4xl font-bold text-stone-900">
                Search accounts, manage trust, and onboard bulk users
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-stone-600">
                This is the core admin surface for account health, fraud signals, and setup-link onboarding.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setCreateSuccess(null);
                setCreateError("");
                setShowCreateModal(true);
              }}
              className="ui-btn-primary gap-2 px-5 py-2.5"
            >
              <Plus className="h-4 w-4" />
              Create user
            </button>
          </div>
        </section>

        <div className="ui-card p-5">
          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr_auto]">
            <label>
              <span className="ui-label">Search</span>
              <input
                className="ui-input"
                placeholder="Name, email, or phone"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") void handleSearch(1);
                }}
              />
            </label>
            <label>
              <span className="ui-label">Status filter</span>
              <select className="ui-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="">All users</option>
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
                <option value="suspended">Suspended</option>
                <option value="flagged">Flagged</option>
              </select>
            </label>
            <div className="flex items-end">
              <button type="button" onClick={() => void handleSearch(1)} className="ui-btn-primary w-full px-4 py-2.5">
                Apply filters
              </button>
            </div>
          </div>
        </div>

        {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

        <div className="grid gap-4 md:grid-cols-4">
          <div className="ui-card p-4"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Results</p><p className="mt-2 text-2xl font-bold text-stone-900">{total}</p></div>
          <div className="ui-card p-4"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Current page</p><p className="mt-2 text-2xl font-bold text-stone-900">{page}</p></div>
          <div className="ui-card p-4"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Verified on page</p><p className="mt-2 text-2xl font-bold text-stone-900">{users.filter((user) => user.verification?.idVerified).length}</p></div>
          <div className="ui-card p-4"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Flagged on page</p><p className="mt-2 text-2xl font-bold text-stone-900">{users.filter((user) => (user.fraudFlags || 0) > 0).length}</p></div>
        </div>

        <div className="ui-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-stone-200 bg-stone-50">
                <tr>
                  {["User", "Contact", "Type", "Role", "Trust", "Status", "Joined", "Actions"].map((heading) => (
                    <th key={heading} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {loading ? (
                  <tr><td colSpan={8} className="px-4 py-10 text-center text-stone-500">Loading users...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-10 text-center text-stone-500">No users match the current filters.</td></tr>
                ) : (
                  users.map((user) => (
                    <tr key={user._id} className="hover:bg-stone-50">
                      <td className="px-4 py-4"><p className="font-semibold text-stone-900">{user.fullName || user.name || "User"}</p>{typeof user.ratings?.average === "number" ? <p className="mt-1 text-xs text-stone-500">Rating {user.ratings.average.toFixed(1)}</p> : null}</td>
                      <td className="px-4 py-4 text-stone-600"><p>{user.email || "-"}</p><p className="mt-1 text-xs text-stone-500">{user.phone || "No phone"}</p></td>
                      <td className="px-4 py-4 text-stone-600">{user.userType || "regular"}</td>
                      <td className="px-4 py-4 text-stone-600">{user.role || "user"}</td>
                      <td className="px-4 py-4"><div className="flex flex-wrap gap-2"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${user.verification?.idVerified ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"}`}>{user.verification?.idVerified ? "Verified" : "Unverified"}</span>{(user.fraudFlags || 0) > 0 ? <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">{user.fraudFlags} flags</span> : null}</div></td>
                      <td className="px-4 py-4"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${user.accountStatus === "suspended" ? "bg-red-100 text-red-700" : "bg-stone-100 text-stone-700"}`}>{user.accountStatus || "active"}</span></td>
                      <td className="px-4 py-4 text-stone-500">{formatDate(user.createdAt)}</td>
                      <td className="px-4 py-4"><div className="flex flex-wrap gap-2"><Link href={`/admin/users/${user._id}`} className="ui-btn-ghost px-3 py-2">View</Link><button type="button" onClick={() => setSelectedUser(user)} className="ui-btn-secondary px-3 py-2">Manage</button></div></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-stone-500">Showing page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button type="button" disabled={page <= 1} onClick={() => void handleSearch(page - 1)} className="ui-btn-secondary px-4 py-2">Previous</button>
            <button type="button" disabled={page >= totalPages} onClick={() => void handleSearch(page + 1)} className="ui-btn-secondary px-4 py-2">Next</button>
          </div>
        </div>
      </div>

      {showCreateModal ? (
        <CreateUserModal
          form={createForm}
          setForm={setCreateForm}
          createError={createError}
          createSubmitting={createSubmitting}
          createSuccess={createSuccess}
          onClose={() => setShowCreateModal(false)}
          onSubmit={() => void handleCreateUser()}
        />
      ) : null}

      {selectedUser ? (
        <UserActionsPanel user={selectedUser} onClose={() => setSelectedUser(null)} onRefresh={() => handleSearch(page)} setError={setError} />
      ) : null}

      {createSuccess?.setupUrl ? (
        <button
          type="button"
          onClick={() => void navigator.clipboard.writeText(createSuccess.setupUrl)}
          className="fixed bottom-6 right-6 inline-flex items-center gap-2 rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-stone-800"
        >
          <Copy className="h-4 w-4" />
          Copy latest setup link
        </button>
      ) : null}
    </div>
  );
}
