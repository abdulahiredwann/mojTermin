import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Mail, MessageSquare, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/apiError";
import { ReferralImagesLightbox } from "@/components/ReferralImagesLightbox";
import { cn } from "@/lib/utils";

type AppointmentRequestRow = {
  id: string;
  email: string;
  query: string;
  intent: string | null;
  city: string | null;
  hospitalId: string | null;
  hospitalName: string | null;
  preferredDate: string;
  status: string;
  createdAt: string;
  notifyEmail: boolean;
  notifyFasterRefresh: boolean;
  notifySms: boolean;
  referralImagePaths?: string[] | null;
};

function fmtDateTime(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

function fmtDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString();
}

function TrackingBadge({ label, on }: { label: string; on: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium",
        on ? "bg-[#e8f5ee] text-[#256B4D]" : "bg-gray-100 text-gray-400",
      )}
      title={label}
    >
      {on ? "✓" : "—"} {label}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isDone = status.toLowerCase() === "done";
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize",
        isDone ? "bg-[#e8f5ee] text-[#256B4D]" : "bg-amber-100 text-amber-800",
      )}
    >
      {status}
    </span>
  );
}

export function AdminAppointmentsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-appointments", page, limit],
    queryFn: async () => {
      const res = await api.get<{
        requests: AppointmentRequestRow[];
        pagination: { page: number; limit: number; total: number; totalPages: number };
      }>("/appointments", { params: { page, limit } });
      return res.data;
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "pending" | "done" }) => {
      const res = await api.patch<{ request: { id: string; status: string } }>(
        `/appointments/${id}/status`,
        { status },
      );
      return res.data;
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["admin-appointments"] });
      toast.success(
        variables.status === "done" ? "Marked as done." : "Marked as pending.",
      );
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Could not update status."));
    },
    onSettled: () => setStatusUpdatingId(null),
  });

  const rows = useMemo(() => data?.requests ?? [], [data]);
  const pagination = data?.pagination;

  async function handleStatusChange(row: AppointmentRequestRow, next: "pending" | "done") {
    setStatusUpdatingId(row.id);
    statusMutation.mutate({ id: row.id, status: next });
  }

  return (
    <section className="flex h-full min-h-0 flex-col gap-5 overflow-hidden">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
            <p className="text-sm text-gray-600">Incoming appointment requests from the website.</p>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 rounded-2xl border border-gray-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="p-8 text-sm text-gray-500">Loading appointment requests…</div>
        ) : isError ? (
          <div className="p-8 text-sm text-red-600">Failed to load appointment requests.</div>
        ) : (
          <div className="h-full overflow-auto">
            <table className="min-w-[1280px] w-full text-left">
              <thead className="bg-gray-50">
                <tr className="text-xs uppercase tracking-wide text-gray-600">
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Intent</th>
                  <th className="px-4 py-3">Hospital</th>
                  <th className="px-4 py-3">Preferred date</th>
                  <th className="px-4 py-3">Notifications</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Referral</th>
                  <th className="px-4 py-3">Actions</th>
                  <th className="px-4 py-3">User query</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((r) => {
                  const isDone = r.status.toLowerCase() === "done";
                  const busy = statusUpdatingId === r.id && statusMutation.isPending;

                  return (
                    <tr key={r.id} className="align-top">
                      <td className="px-4 py-4 text-sm text-gray-700">
                        {fmtDateTime(r.createdAt)}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">{r.email}</td>
                      <td className="px-4 py-4 text-sm text-gray-700">{r.intent ?? "-"}</td>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        <p className="font-medium text-gray-900">{r.hospitalName ?? "-"}</p>
                        <p className="text-xs text-gray-500">{r.city ?? "-"}</p>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        {fmtDate(r.preferredDate)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex max-w-[11rem] flex-wrap gap-1">
                          <TrackingBadge label="Email" on={r.notifyEmail} />
                          <TrackingBadge label="Refresh" on={r.notifyFasterRefresh} />
                          <TrackingBadge label="SMS" on={r.notifySms} />
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="px-4 py-4">
                        <ReferralImagesLightbox paths={r.referralImagePaths ?? []} size="md" />
                      </td>
                      <td className="px-4 py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={busy}
                              className="h-8 gap-1 rounded-lg border-gray-200 text-xs"
                            >
                              Actions
                              <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              className="cursor-pointer gap-2"
                              onSelect={() =>
                                toast.info("Send SMS — demo only (not wired yet).")
                              }
                            >
                              <MessageSquare className="h-4 w-4 text-gray-500" />
                              Send SMS
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="cursor-pointer gap-2"
                              onSelect={() =>
                                toast.info("Send email — demo only (not wired yet).")
                              }
                            >
                              <Mail className="h-4 w-4 text-gray-500" />
                              Send email
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="cursor-pointer gap-2"
                              onSelect={() =>
                                toast.info("Refresh check — demo only (not wired yet).")
                              }
                            >
                              <RefreshCw className="h-4 w-4 text-gray-500" />
                              Refresh
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {isDone ? (
                              <DropdownMenuItem
                                className="cursor-pointer"
                                disabled={busy}
                                onSelect={() => void handleStatusChange(r, "pending")}
                              >
                                Mark as pending
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                className="cursor-pointer text-[#256B4D] focus:text-[#256B4D]"
                                disabled={busy}
                                onSelect={() => void handleStatusChange(r, "done")}
                              >
                                Done
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">{r.query}</td>
                    </tr>
                  );
                })}
                {rows.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-sm text-gray-500" colSpan={10}>
                      No appointment requests yet.
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
          Showing page {pagination?.page ?? page} of {pagination?.totalPages ?? 1} (
          {pagination?.total ?? rows.length} requests)
        </p>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600" htmlFor="limit">
            Rows:
          </label>
          <select
            id="limit"
            value={limit}
            onChange={(e) => {
              setPage(1);
              setLimit(Number(e.target.value));
            }}
            className="h-9 rounded-md border border-gray-300 bg-white px-2 text-sm"
          >
            {[10, 20, 30, 50].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={!pagination || pagination.page <= 1}
            className="h-9 rounded-md border border-gray-300 px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => setPage((p) => p + 1)}
            disabled={!pagination || pagination.page >= pagination.totalPages}
            className="h-9 rounded-md border border-gray-300 px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}
