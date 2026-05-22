import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  type AdminUserRow,
  type UserRequestRow,
  apiError,
  fmtDate,
  fmtDateTime,
} from "./adminUserShared";

function TrackingBadge({ label, on }: { label: string; on: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium",
        on ? "bg-[#e8f5ee] text-[#256B4D]" : "bg-gray-100 text-gray-400",
      )}
    >
      {on ? "✓" : "—"} {label}
    </span>
  );
}

export function AdminUserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editPlan, setEditPlan] = useState<"free" | "pro">("free");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-user", userId],
    enabled: !!userId,
    queryFn: async () => {
      const res = await api.get<{ user: AdminUserRow; requests: UserRequestRow[] }>(
        `/admin/users/${userId}`,
      );
      return res.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const res = await api.patch<{ user: AdminUserRow }>(`/admin/users/${userId}`, body);
      return res.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-user", userId] });
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/admin/users/${userId}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      navigate("/admin/users");
    },
  });

  const user = data?.user;
  const requests = data?.requests ?? [];

  function openEdit() {
    if (!user) return;
    setActionError(null);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditPhone(user.phone ?? "");
    setEditPlan(user.effectivePlan);
    setEditOpen(true);
  }

  async function handleSaveEdit() {
    setActionError(null);
    try {
      await updateMutation.mutateAsync({
        name: editName.trim(),
        email: editEmail.trim(),
        phone: editPhone.trim() || null,
        subscriptionPlan: editPlan,
      });
      setEditOpen(false);
    } catch (err) {
      setActionError(apiError(err, "Could not update user."));
    }
  }

  async function handleToggleRestrict() {
    if (!user) return;
    setActionError(null);
    try {
      await updateMutation.mutateAsync({ restricted: !user.restricted });
    } catch (err) {
      setActionError(apiError(err, "Could not update restriction."));
    }
  }

  async function handleDelete() {
    setActionError(null);
    try {
      await deleteMutation.mutateAsync();
      setDeleteOpen(false);
    } catch (err) {
      setActionError(apiError(err, "Could not delete user."));
    }
  }

  if (!userId) {
    return (
      <div className="p-8 text-sm text-red-600">
        Invalid user.{" "}
        <Link to="/admin/users" className="text-[#2E7D5B] hover:underline">
          Back to list
        </Link>
      </div>
    );
  }

  return (
    <section className="flex h-full min-h-0 flex-col gap-5 overflow-hidden">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <Link
              to="/admin/users"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#2E7D5B] hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to users
            </Link>
            {isLoading ? (
              <h1 className="text-2xl font-bold text-gray-900">Loading…</h1>
            ) : isError || !user ? (
              <h1 className="text-2xl font-bold text-gray-900">User not found</h1>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-sm text-gray-600">{user.email}</p>
              </>
            )}
          </div>
          {user ? (
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-lg"
                onClick={openEdit}
              >
                Edit
              </Button>
              <Button
                type="button"
                variant="outline"
                className={cn(
                  "rounded-lg",
                  user.restricted
                    ? "border-[#2E7D5B]/40 text-[#256B4D]"
                    : "border-amber-200 text-amber-800",
                )}
                disabled={updateMutation.isPending}
                onClick={() => void handleToggleRestrict()}
              >
                {user.restricted ? "Unrestrict" : "Restrict"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-lg border-red-200 text-red-700"
                onClick={() => setDeleteOpen(true)}
              >
                Delete
              </Button>
            </div>
          ) : null}
        </div>
        {actionError ? <p className="mt-3 text-sm text-red-600">{actionError}</p> : null}
      </div>

      {user ? (
        <>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Plan</p>
              <p className="mt-1 text-lg font-bold uppercase text-gray-900">{user.effectivePlan}</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Status</p>
              <p className="mt-1 text-lg font-bold text-gray-900">
                {user.restricted ? "Restricted" : "Active"}
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Tracking requests
              </p>
              <p className="mt-1 text-lg font-bold text-gray-900">{user.requestCount}</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Last active
              </p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                {fmtDateTime(user.lastActiveAt)}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900">Profile</h2>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-gray-500">Phone</dt>
                <dd className="font-medium text-gray-900">{user.phone ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Registered</dt>
                <dd className="font-medium text-gray-900">{fmtDateTime(user.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-gray-500">User ID</dt>
                <dd className="font-mono text-xs text-gray-700">{user.id}</dd>
              </div>
            </dl>
          </div>

          <div className="min-h-0 flex-1 rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="text-sm font-bold text-gray-900">
                Tracking requests ({requests.length})
              </h2>
              <p className="text-xs text-gray-500">
                Availability checks submitted by this user (last activity from latest request).
              </p>
            </div>
            {requests.length === 0 ? (
              <p className="p-8 text-sm text-gray-500">No availability requests yet.</p>
            ) : (
              <div className="overflow-auto">
                <table className="min-w-[1000px] w-full text-left">
                  <thead className="bg-gray-50">
                    <tr className="text-xs uppercase tracking-wide text-gray-600">
                      <th className="px-4 py-3">Created</th>
                      <th className="px-4 py-3">Hospital</th>
                      <th className="px-4 py-3">Preferred date</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Notifications</th>
                      <th className="px-4 py-3">Query</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {requests.map((r) => (
                      <tr key={r.id} className="align-top">
                        <td className="px-4 py-4 text-sm text-gray-700">
                          {fmtDateTime(r.createdAt)}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-700">
                          <p className="font-medium text-gray-900">{r.hospitalName ?? "—"}</p>
                          <p className="text-xs text-gray-500">{r.city ?? "—"}</p>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-700">
                          {fmtDate(r.preferredDate)}
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
                            {r.status}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-1">
                            <TrackingBadge label="Email" on={r.notifyEmail} />
                            <TrackingBadge label="Refresh" on={r.notifyFasterRefresh} />
                            <TrackingBadge label="SMS" on={r.notifySms} />
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-700 max-w-xs">
                          <p className="line-clamp-3">{r.query}</p>
                          {r.intent ? (
                            <p className="mt-1 text-xs text-gray-500">{r.intent}</p>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : null}

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit user</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="detail-edit-name">Name</Label>
              <Input
                id="detail-edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="detail-edit-email">Email</Label>
              <Input
                id="detail-edit-email"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="detail-edit-phone">Phone</Label>
              <Input
                id="detail-edit-phone"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Plan</Label>
              <Select value={editPlan} onValueChange={(v) => setEditPlan(v as "free" | "pro")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">FREE</SelectItem>
                  <SelectItem value="pro">PRO</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-[#2E7D5B] hover:bg-[#256B4D]"
              disabled={updateMutation.isPending}
              onClick={() => void handleSaveEdit()}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes {user?.name} ({user?.email}). Their tracking requests will
              remain but will no longer be linked to this account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
              onClick={() => void handleDelete()}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
