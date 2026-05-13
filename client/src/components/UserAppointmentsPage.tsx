import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileSearch, Loader2, Pencil, Sparkles, Trash2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { api } from "@/lib/api";
import { ReferralImagesLightbox } from "@/components/ReferralImagesLightbox";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export type AppointmentReferralAnalysis = {
  headline: string | null;
  detailsMarkdown: string | null;
  specialtyHints: string[];
  procedureHints: string[];
  rawEntities: string[];
  extractionError: string | null;
};

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
  referralImagePaths?: string[] | null;
  referralAnalysis?: AppointmentReferralAnalysis | null;
};

type UserAppointmentsResponse = {
  stats: { total: number; byStatus: Record<string, number> };
  requests: AppointmentRow[];
};

function renderMarkdownishParagraphs(text: string) {
  if (!text?.trim()) return null;
  return text
    .trim()
    .split(/\n+/)
    .map((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return null;
      const parts = trimmed.split(/(\*\*[^*]+\*\*)/g);
      return (
        <p key={i} className="mb-2 whitespace-pre-wrap text-sm leading-relaxed text-gray-700 last:mb-0">
          {parts.map((part, j) => {
            if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
              return (
                <strong key={j} className="font-semibold text-gray-900">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return <span key={j}>{part}</span>;
          })}
        </p>
      );
    });
}

function statusStyle(status: string) {
  const s = status.toLowerCase();
  if (s === "pending") return "bg-amber-50 text-amber-900 ring-amber-200";
  if (s === "confirmed" || s === "approved") return "bg-emerald-50 text-emerald-900 ring-emerald-200";
  if (s === "rejected" || s === "cancelled") return "bg-red-50 text-red-900 ring-red-200";
  return "bg-gray-50 text-gray-800 ring-gray-200";
}

function referralStoredFilename(path: string) {
  const base = path.split("/").pop() || path;
  return base || path;
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

function ReferralAnalysisDialogContent({
  analysis,
  t,
}: {
  analysis: AppointmentReferralAnalysis;
  t: {
    dashboardReferralAiPanelHint: string;
    dashboardReferralAiError: string;
    dashboardReferralRawMentions: string;
  };
}) {
  return (
    <>
      {analysis.extractionError ? (
        <div className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-950">
          <p className="font-medium">{t.dashboardReferralAiError}</p>
          <p className="mt-1 text-xs">{analysis.extractionError}</p>
        </div>
      ) : null}
      {!analysis.extractionError && analysis.headline ? (
        <p className="text-sm font-semibold text-[#2E7D5B]">{analysis.headline}</p>
      ) : null}
      <p className="text-xs text-gray-500">{t.dashboardReferralAiPanelHint}</p>
      {analysis.detailsMarkdown ? (
        <ScrollArea className="max-h-[min(52vh,24rem)] pr-3">
          <div>{renderMarkdownishParagraphs(analysis.detailsMarkdown)}</div>
        </ScrollArea>
      ) : null}
      {!analysis.extractionError &&
      ((analysis.specialtyHints?.length ?? 0) > 0 || (analysis.procedureHints?.length ?? 0) > 0) ? (
        <div className="flex flex-wrap gap-1 pt-2">
          {[...(analysis.specialtyHints ?? []), ...(analysis.procedureHints ?? [])]
            .slice(0, 16)
            .map((tag, idx) => (
              <span
                key={`${tag}-${idx}`}
                className="inline-flex rounded-full bg-[#f0faf4] px-2 py-0.5 text-[11px] font-medium text-[#256B4D]"
              >
                {tag}
              </span>
            ))}
        </div>
      ) : null}
      {!analysis.extractionError && (analysis.rawEntities?.length ?? 0) > 0 ? (
        <details className="border-t border-gray-100 pt-2">
          <summary className="cursor-pointer text-[11px] font-medium text-gray-600">{t.dashboardReferralRawMentions}</summary>
          <ul className="mt-2 list-inside list-disc space-y-0.5 text-[11px] text-gray-600">
            {(analysis.rawEntities ?? []).slice(0, 25).map((e, i) => (
              <li key={`${e}-${i}`}>{e}</li>
            ))}
          </ul>
        </details>
      ) : null}
    </>
  );
}

export function UserAppointmentsPage() {
  const { t, locale } = useLanguage();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [detailRow, setDetailRow] = useState<AppointmentRow | null>(null);
  const [removingPath, setRemovingPath] = useState<string | null>(null);
  const [removeImageConfirm, setRemoveImageConfirm] = useState<{ id: string; path: string } | null>(null);

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

  const removeReferralMutation = useMutation({
    mutationFn: async ({ id, path }: { id: string; path: string }) => {
      await api.delete(`/user/appointments/${id}/referral-images`, { data: { path } });
    },
    onMutate: ({ path }) => setRemovingPath(path),
    onSettled: () => setRemovingPath(null),
    onSuccess: (_data, variables) => {
      setActionError(null);
      setRemoveImageConfirm(null);
      void queryClient.invalidateQueries({ queryKey: ["user-appointments"] });
      const { id, path } = variables;
      setDetailRow((cur) =>
        cur && cur.id === id
          ? { ...cur, referralImagePaths: (cur.referralImagePaths ?? []).filter((p) => p !== path) }
          : cur,
      );
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
      setDetailRow(null);
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

  function handleRemoveImage(id: string, path: string) {
    setActionError(null);
    setRemoveImageConfirm({ id, path });
  }

  function confirmRemoveImage() {
    if (!removeImageConfirm) return;
    removeReferralMutation.mutate(removeImageConfirm);
  }

  const analysisLabels = {
    dashboardReferralAiPanelHint: t.dashboardReferralAiPanelHint,
    dashboardReferralAiError: t.dashboardReferralAiError,
    dashboardReferralRawMentions: t.dashboardReferralRawMentions,
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
          {t.dashboardHistoryTitle}
        </h1>
        <p className="mt-1 text-sm text-gray-600 md:text-base">{t.dashboardIntro}</p>
      </div>

      {actionError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{actionError}</p>
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
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  <th className="px-4 py-3 font-semibold text-gray-700">{t.dashboardTableSubmitted}</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">{t.dashboardTableStatus}</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">{t.dashboardTableHospital}</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">{t.dashboardReferralAttachedLabel}</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">{t.dashboardTableNeed}</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">{t.dashboardTableWhen}</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">{t.dashboardTableActions}</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => {
                  const isPending = r.status.toLowerCase() === "pending";
                  const isEditing = editingId === r.id;
                  const paths = r.referralImagePaths ?? [];
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
                      <td className="min-w-[11rem] px-4 py-3">
                        <div className="flex flex-col gap-2">
                          <ReferralImagesLightbox
                            paths={paths}
                            size="md"
                            removable={isPending && paths.length > 0}
                            onRemovePath={(p) => handleRemoveImage(r.id, p)}
                            removingPath={removeReferralMutation.isPending ? removingPath : null}
                            removeImageAriaLabel={t.dashboardReferralRemoveImageAria}
                          />
                          {r.referralAnalysis ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 w-fit gap-1.5 border-[#2E7D5B]/35 text-xs text-[#2E7D5B]"
                              onClick={() => {
                                setActionError(null);
                                setDetailRow(r);
                              }}
                            >
                              <FileSearch className="h-3.5 w-3.5 shrink-0" aria-hidden />
                              {t.dashboardReferralAiDetail}
                            </Button>
                          ) : null}
                        </div>
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

      <Dialog open={detailRow !== null} onOpenChange={(open) => !open && setDetailRow(null)}>
        <DialogContent className="max-h-[min(90vh,640px)] max-w-lg overflow-hidden sm:max-w-lg">
          <DialogHeader className="space-y-1 text-left">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-amber-500" aria-hidden />
              {t.dashboardReferralAiDetail}
            </DialogTitle>
          </DialogHeader>
          {detailRow?.referralAnalysis ? (
            <div className="space-y-3 py-2">
              <ReferralAnalysisDialogContent analysis={detailRow.referralAnalysis} t={analysisLabels} />
            </div>
          ) : null}
          <DialogFooter>
            <Button type="button" className="rounded-full bg-[#2E7D5B] text-white" onClick={() => setDetailRow(null)}>
              {t.confirmRequestModalOk}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={removeImageConfirm !== null}
        onOpenChange={(open) => {
          if (!open && !removeReferralMutation.isPending) setRemoveImageConfirm(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.dashboardRemoveReferralImageTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {removeImageConfirm ? (
                <span className="block space-y-1">
                  <span className="block font-medium text-foreground">
                    {referralStoredFilename(removeImageConfirm.path)}
                  </span>
                  <span className="block">{t.dashboardRemoveReferralImageBody}</span>
                </span>
              ) : (
                t.dashboardRemoveReferralImageBody
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removeReferralMutation.isPending}>{t.dashboardCancel}</AlertDialogCancel>
            <Button
              type="button"
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={removeReferralMutation.isPending}
              onClick={confirmRemoveImage}
            >
              {removeReferralMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
              ) : null}
              {t.dashboardConfirmRemoveReferralImage}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
