import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type AppointmentRow = {
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
};

type UserAppointmentsResponse = {
  stats: { total: number; byStatus: Record<string, number> };
  requests: AppointmentRow[];
};

function statusStyle(status: string) {
  const s = status.toLowerCase();
  if (s === "pending") return "bg-amber-50 text-amber-900 ring-amber-200";
  if (s === "confirmed" || s === "approved") return "bg-emerald-50 text-emerald-900 ring-emerald-200";
  if (s === "rejected" || s === "cancelled") return "bg-red-50 text-red-900 ring-red-200";
  return "bg-gray-50 text-gray-800 ring-gray-200";
}

function preferredDateToDateInput(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getErrorMessage(err: unknown) {
  return (
    (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
    "Something went wrong."
  );
}

export function UserAppointmentsPage() {
  const { t, locale } = useLanguage();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const todayInput = new Date().toISOString().split("T")[0];

  const { data: appointmentData, isLoading } = useQuery({
    queryKey: ["user-appointments"],
    queryFn: async () => {
      const res = await api.get<UserAppointmentsResponse>("/user/appointments");
      return res.data;
    },
    staleTime: 1000 * 30,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, preferredDate }: { id: string; preferredDate: string }) => {
      await api.patch(`/user/appointments/${id}`, { preferredDate });
    },
    onSuccess: () => {
      setActionError(null);
      setEditingId(null);
      void queryClient.invalidateQueries({ queryKey: ["user-appointments"] });
    },
    onError: (err: unknown) => setActionError(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/user/appointments/${id}`);
    },
    onSuccess: () => {
      setActionError(null);
      setDeleteId(null);
      setEditingId(null);
      void queryClient.invalidateQueries({ queryKey: ["user-appointments"] });
    },
    onError: (err: unknown) => setActionError(getErrorMessage(err)),
  });

  const stats = appointmentData?.stats ?? { total: 0, byStatus: {} as Record<string, number> };
  const requests = appointmentData?.requests ?? [];
  const pendingCount = stats.byStatus["pending"] ?? 0;

  function formatIsoDay(iso: string) {
    const d = new Date(iso);
    return Number.isNaN(d.getTime())
      ? iso
      : d.toLocaleDateString(locale === "sl" ? "sl-SI" : "en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
  }

  function startEdit(r: AppointmentRow) {
    setActionError(null);
    setEditingId(r.id);
    setEditDate(preferredDateToDateInput(r.preferredDate));
  }

  function cancelEdit() {
    setEditingId(null);
    setEditDate("");
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
          {t.dashboardHistoryTitle}
        </h1>
        <p className="mt-1 text-sm text-gray-600 md:text-base">{t.dashboardIntro}</p>
      </div>

      {actionError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {actionError}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{t.dashboardCardTotal}</p>
          <p className="mt-1 text-3xl font-bold text-[#2E7D5B]">{isLoading ? "…" : stats.total}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{t.dashboardCardPending}</p>
          <p className="mt-1 text-3xl font-bold text-amber-700">{isLoading ? "…" : pendingCount}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {isLoading ? (
          <p className="p-8 text-center text-sm text-gray-500">…</p>
        ) : requests.length === 0 ? (
          <p className="p-8 text-center text-sm text-gray-500">{t.dashboardEmptyHistory}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  <th className="px-4 py-3 font-semibold text-gray-700">{t.dashboardTableSubmitted}</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">{t.dashboardTableStatus}</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">{t.dashboardTableHospital}</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">{t.dashboardTableNeed}</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">{t.dashboardTableWhen}</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">{t.dashboardTableActions}</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => {
                  const isPending = r.status.toLowerCase() === "pending";
                  const isEditing = editingId === r.id;
                  return (
                    <tr key={r.id} className="border-b border-gray-50 last:border-0">
                      <td className="whitespace-nowrap px-4 py-3 text-gray-600">{formatIsoDay(r.createdAt)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ${statusStyle(r.status)}`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td
                        className="max-w-[10rem] truncate px-4 py-3 text-gray-800"
                        title={r.hospitalName ?? ""}
                      >
                        {r.hospitalName ?? "—"}
                      </td>
                      <td className="max-w-[12rem] truncate px-4 py-3 text-gray-600" title={r.query}>
                        {r.intent || r.query}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {isEditing ? (
                          <input
                            type="date"
                            value={editDate}
                            min={todayInput}
                            onChange={(e) => setEditDate(e.target.value)}
                            className="h-9 w-full min-w-[10.5rem] rounded-lg border border-gray-200 px-2 text-sm outline-none focus:ring-2 focus:ring-[#2E7D5B]/30"
                          />
                        ) : (
                          <span className="whitespace-nowrap">{formatIsoDay(r.preferredDate)}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center justify-end gap-1.5">
                          {isPending && !isEditing ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 gap-1.5 border-gray-200 text-xs"
                              onClick={() => startEdit(r)}
                            >
                              <Pencil className="h-3.5 w-3.5" aria-hidden />
                              {t.dashboardEditPreferredDate}
                            </Button>
                          ) : null}
                          {isPending && isEditing ? (
                            <>
                              <Button
                                type="button"
                                size="sm"
                                className="h-8 bg-[#2E7D5B] px-3 text-xs text-white hover:bg-[#256B4D]"
                                disabled={!editDate || updateMutation.isPending}
                                onClick={() => {
                                  if (!editDate) return;
                                  updateMutation.mutate({ id: r.id, preferredDate: editDate });
                                }}
                              >
                                {updateMutation.isPending ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : null}
                                {t.dashboardSave}
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 text-xs"
                                disabled={updateMutation.isPending}
                                onClick={cancelEdit}
                              >
                                {t.dashboardCancel}
                              </Button>
                            </>
                          ) : null}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1.5 border-red-200 text-xs text-red-700 hover:bg-red-50 hover:text-red-800"
                            onClick={() => {
                              setActionError(null);
                              setDeleteId(r.id);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden />
                            {t.dashboardDelete}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.dashboardDeleteRequestTitle}</AlertDialogTitle>
            <AlertDialogDescription>{t.dashboardDeleteRequestBody}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>{t.dashboardCancel}</AlertDialogCancel>
            <Button
              type="button"
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (deleteId) deleteMutation.mutate(deleteId);
              }}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
              ) : null}
              {t.dashboardConfirmDelete}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
