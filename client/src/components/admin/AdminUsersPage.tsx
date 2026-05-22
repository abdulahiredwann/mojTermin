import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  apiError,
  fmtDateTime,
} from "./adminUserShared";

export function AdminUsersPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [editUser, setEditUser] = useState<AdminUserRow | null>(null);
  const [deleteUser, setDeleteUser] = useState<AdminUserRow | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editPlan, setEditPlan] = useState<"free" | "pro">("free");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-users", page, limit, search],
    queryFn: async () => {
      const res = await api.get<{
        users: AdminUserRow[];
        pagination: { page: number; limit: number; total: number; totalPages: number };
      }>("/admin/users", { params: { page, limit, search: search || undefined } });
      return res.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: {
      userId: string;
      body: Record<string, unknown>;
    }) => {
      const res = await api.patch<{ user: AdminUserRow }>(
        `/admin/users/${payload.userId}`,
        payload.body,
      );
      return res.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      await api.delete(`/admin/users/${userId}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const rows = useMemo(() => data?.users ?? [], [data]);
  const pagination = data?.pagination;

  function openEdit(user: AdminUserRow) {
    setActionError(null);
    setEditUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditPhone(user.phone ?? "");
    setEditPlan(user.effectivePlan);
  }

  async function handleSaveEdit() {
    if (!editUser) return;
    setActionError(null);
    try {
      await updateMutation.mutateAsync({
        userId: editUser.id,
        body: {
          name: editName.trim(),
          email: editEmail.trim(),
          phone: editPhone.trim() || null,
          subscriptionPlan: editPlan,
        },
      });
      setEditUser(null);
    } catch (err) {
      setActionError(apiError(err, "Could not update user."));
    }
  }

  async function handleToggleRestrict(user: AdminUserRow) {
    setActionError(null);
    try {
      await updateMutation.mutateAsync({
        userId: user.id,
        body: { restricted: !user.restricted },
      });
    } catch (err) {
      setActionError(apiError(err, "Could not update restriction."));
    }
  }

  async function handleConfirmDelete() {
    if (!deleteUser) return;
    setActionError(null);
    try {
      await deleteMutation.mutateAsync(deleteUser.id);
      setDeleteUser(null);
    } catch (err) {
      setActionError(apiError(err, "Could not delete user."));
    }
  }

  return (
    <section className="flex h-full min-h-0 flex-col gap-5 overflow-hidden">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Users</h1>
            <p className="text-sm text-gray-600">
              Click a name to open the user profile and request history.
            </p>
          </div>
          <form
            className="flex flex-wrap items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              setPage(1);
              setSearch(searchInput.trim());
            }}
          >
            <div className="space-y-1">
              <Label htmlFor="user-search" className="text-xs text-gray-600">
                Search
              </Label>
              <Input
                id="user-search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Name, email, phone…"
                className="h-9 w-56"
              />
            </div>
            <Button type="submit" variant="outline" className="h-9 rounded-lg">
              Search
            </Button>
          </form>
        </div>
        {actionError ? (
          <p className="mt-3 text-sm text-red-600">{actionError}</p>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 rounded-2xl border border-gray-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="p-8 text-sm text-gray-500">Loading users…</div>
        ) : isError ? (
          <div className="p-8 text-sm text-red-600">Failed to load users.</div>
        ) : (
          <div className="h-full overflow-auto">
            <table className="min-w-[1100px] w-full text-left">
              <thead className="bg-gray-50">
                <tr className="text-xs uppercase tracking-wide text-gray-600">
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Requests</th>
                  <th className="px-4 py-3">Last active</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((u) => (
                  <tr
                    key={u.id}
                    className="align-top cursor-pointer hover:bg-gray-50/80"
                    onClick={() => navigate(`/admin/users/${u.id}`)}
                  >
                    <td className="px-4 py-4">
                      <Link
                        to={`/admin/users/${u.id}`}
                        className="block text-sm font-medium text-[#2E7D5B] hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {u.name}
                      </Link>
                      <p className="text-sm text-gray-600">{u.email}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-1 text-xs font-medium uppercase",
                          u.effectivePlan === "pro"
                            ? "bg-amber-100 text-amber-900"
                            : "bg-[#e8f5ee] text-[#256B4D]",
                        )}
                      >
                        {u.effectivePlan}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">{u.requestCount}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {fmtDateTime(u.lastActiveAt)}
                    </td>
                    <td className="px-4 py-4">
                      {u.restricted ? (
                        <span className="inline-flex rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-800">
                          Restricted
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex flex-wrap gap-1.5">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 rounded-lg text-xs"
                          onClick={() => openEdit(u)}
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className={cn(
                            "h-8 rounded-lg text-xs",
                            u.restricted
                              ? "border-[#2E7D5B]/40 text-[#256B4D]"
                              : "border-amber-200 text-amber-800",
                          )}
                          disabled={updateMutation.isPending}
                          onClick={() => void handleToggleRestrict(u)}
                        >
                          {u.restricted ? "Unrestrict" : "Restrict"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 rounded-lg border-red-200 text-xs text-red-700"
                          onClick={() => setDeleteUser(u)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-sm text-gray-500">
                      No users found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-4">
        <p className="text-sm text-gray-600">
          Page {pagination?.page ?? page} of {pagination?.totalPages ?? 1} ({pagination?.total ?? 0}{" "}
          users)
        </p>
        <div className="flex items-center gap-2">
          <select
            value={limit}
            onChange={(e) => {
              setPage(1);
              setLimit(Number(e.target.value));
            }}
            className="h-9 rounded-md border border-gray-300 bg-white px-2 text-sm"
          >
            {[10, 20, 30, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!pagination || pagination.page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!pagination || pagination.page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit user</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-name">Name</Label>
              <Input id="edit-name" value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
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
            <Button type="button" variant="outline" onClick={() => setEditUser(null)}>
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

      <AlertDialog open={!!deleteUser} onOpenChange={(open) => !open && setDeleteUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes {deleteUser?.name} ({deleteUser?.email}). Their tracking
              requests will remain but will no longer be linked to this account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
              onClick={() => void handleConfirmDelete()}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
