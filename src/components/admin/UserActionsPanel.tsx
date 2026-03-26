"use client";

import Link from "next/link";
import { AlertTriangle, Flag, Lock, Mail, Pencil, Phone, ShieldCheck, Trash2, X } from "lucide-react";
import { adminApiRequest } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import type { UserRecord } from "@/types/admin-users";

export function UserActionsPanel({
  user,
  onClose,
  onRefresh,
  setError,
}: {
  user: UserRecord;
  onClose: () => void;
  onRefresh: () => Promise<void>;
  setError: (message: string) => void;
}) {
  const runAction = async (task: () => Promise<void>, fallback: string) => {
    try {
      await task();
      await onRefresh();
      onClose();
    } catch (error: any) {
      setError(error?.message || fallback);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/45">
      <div className="h-full w-full max-w-lg overflow-y-auto bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="ui-section-kicker">User actions</p>
            <h2 className="mt-3 text-2xl font-bold text-stone-900">{user.fullName || user.name || "User"}</h2>
            <p className="mt-2 text-sm text-stone-600">{user.email || user.phone || "No primary contact"}</p>
          </div>
          <button type="button" onClick={onClose} className="ui-btn-ghost px-3 py-2">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="ui-card-soft p-4"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Role</p><p className="mt-2 font-semibold text-stone-900">{user.role || "user"}</p></div>
          <div className="ui-card-soft p-4"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Status</p><p className="mt-2 font-semibold text-stone-900">{user.accountStatus || "active"}</p></div>
          <div className="ui-card-soft p-4"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Fraud flags</p><p className="mt-2 font-semibold text-stone-900">{user.fraudFlags || 0}</p></div>
          <div className="ui-card-soft p-4"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Verification</p><p className="mt-2 font-semibold text-stone-900">{user.verification?.idVerified ? "Verified" : "Unverified"}</p></div>
        </div>

        <div className="mt-6 space-y-3">
          <Link href={`/admin/users/${user._id}`} className="ui-btn-primary w-full gap-2 px-4 py-2.5">
            <ShieldCheck className="h-4 w-4" />
            Open full profile
          </Link>
          <button type="button" className="ui-btn-secondary w-full gap-2 px-4 py-2.5" onClick={() => void runAction(async () => {
            if (user.accountStatus === "suspended") {
              await adminApiRequest(API_ENDPOINTS.admin.users.unsuspend(user._id), { method: "PUT" });
              return;
            }
            const reason = window.prompt("Suspension reason");
            if (!reason || !reason.trim()) return;
            await adminApiRequest(API_ENDPOINTS.admin.users.suspend(user._id), { method: "PUT", body: JSON.stringify({ reason: reason.trim() }) });
          }, "Unable to update account status.")}>
            <Lock className="h-4 w-4" />
            {user.accountStatus === "suspended" ? "Unsuspend account" : "Suspend account"}
          </button>
          <button type="button" className="ui-btn-secondary w-full gap-2 px-4 py-2.5" onClick={() => void runAction(async () => {
            const reason = window.prompt("Fraud flag reason");
            if (!reason || !reason.trim()) return;
            await adminApiRequest(API_ENDPOINTS.admin.users.flag(user._id), { method: "PUT", body: JSON.stringify({ reason: reason.trim() }) });
          }, "Unable to flag the user.")}>
            <Flag className="h-4 w-4" />
            Add fraud flag
          </button>
          <button type="button" className="ui-btn-secondary w-full gap-2 px-4 py-2.5" onClick={() => void runAction(async () => {
            await adminApiRequest(API_ENDPOINTS.admin.users.clearFlags(user._id), { method: "PUT" });
          }, "Unable to clear fraud flags.")}>
            <AlertTriangle className="h-4 w-4" />
            Clear fraud flags
          </button>
          <button type="button" className="ui-btn-secondary w-full gap-2 px-4 py-2.5" onClick={() => void runAction(async () => {
            const email = window.prompt("New email", user.email || "");
            if (!email || !email.trim()) return;
            await adminApiRequest(API_ENDPOINTS.admin.users.updateEmail(user._id), { method: "PUT", body: JSON.stringify({ email: email.trim() }) });
          }, "Unable to update email.")}>
            <Mail className="h-4 w-4" />
            Update email
          </button>
          <button type="button" className="ui-btn-secondary w-full gap-2 px-4 py-2.5" onClick={() => void runAction(async () => {
            const phone = window.prompt("New phone", user.phone || "");
            if (!phone || !phone.trim()) return;
            await adminApiRequest(API_ENDPOINTS.admin.users.updatePhone(user._id), { method: "PUT", body: JSON.stringify({ phone: phone.trim() }) });
          }, "Unable to update phone.")}>
            <Phone className="h-4 w-4" />
            Update phone
          </button>
          <button type="button" className="ui-btn-secondary w-full gap-2 px-4 py-2.5" onClick={() => void runAction(async () => {
            const role = window.prompt("New role", user.role || "user");
            if (!role || !role.trim()) return;
            await adminApiRequest(API_ENDPOINTS.admin.users.updateRole(user._id), { method: "PUT", body: JSON.stringify({ role: role.trim() }) });
          }, "Unable to update role.")}>
            <Pencil className="h-4 w-4" />
            Update role
          </button>
          <button type="button" className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100" onClick={() => {
            if (!window.confirm("Delete this user? This cannot be undone.")) return;
            void runAction(async () => {
              await adminApiRequest(API_ENDPOINTS.admin.users.delete(user._id), { method: "DELETE" });
            }, "Unable to delete user.");
          }}>
            <Trash2 className="h-4 w-4" />
            Delete account
          </button>
        </div>
      </div>
    </div>
  );
}
