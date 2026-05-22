import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Calendar, FileSearch, Loader2, Pencil, Sparkles, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
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

type AppointmentCardLabels = {
  dashboardTableSubmitted: string;
  dashboardTableHospital: string;
  dashboardTableNeed: string;
  dashboardTableWhen: string;
  dashboardReferralAttachedLabel: string;
  dashboardReferralAiDetail: string;
  dashboardReferralRemoveImageAria: string;
  dashboardEditPreferredDate: string;
  dashboardSave: string;
  dashboardCancel: string;
  dashboardDelete: string;
};

function AppointmentRequestCard({
  row,
  labels,
  locale,
  todayInput,
  isEditing,
  editDate,
  removingPath,
  removePending,
  updatePending,
  onEditDateChange,
  onStartEdit,
  onCancelEdit,
  onSaveDate,
  onDelete,
  onRemoveImage,
  onOpenAnalysis,
}: {
  row: AppointmentRow;
  labels: AppointmentCardLabels;
  locale: string;
  todayInput: string;
  isEditing: boolean;
  editDate: string;
  removingPath: string | null;
  removePending: boolean;
  updatePending: boolean;
  onEditDateChange: (value: string) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveDate: () => void;
  onDelete: () => void;
  onRemoveImage: (path: string) => void;
  onOpenAnalysis: () => void;
}) {
  const isPending = row.status.toLowerCase() === "pending";
  const paths = row.referralImagePaths ?? [];
  const need = row.intent || row.query;

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

  return (
    <li className="min-w-0 max-w-full overflow-hidden rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
      <div className="flex min-w-0 items-start justify-between gap-2">
        <div className="min-w-0 flex-1 overflow-hidden">
          <p className="flex min-w-0 items-center gap-1.5 text-sm font-semibold text-gray-900">
            <Building2 className="h-3.5 w-3.5 shrink-0 text-[#2E7D5B]" aria-hidden />
            <span className="min-w-0 truncate" title={row.hospitalName ?? ""}>
              {row.hospitalName ?? "—"}
            </span>
          </p>
          <p className="mt-0.5 line-clamp-2 break-words text-xs text-gray-600" title={row.query}>
            {need}
          </p>
        </div>
        <span
          className={cn(
            "max-w-[42%] shrink-0 truncate rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ring-1",
            statusStyle(row.status),
          )}
          title={row.status}
        >
          {row.status}
        </span>
      </div>

      <dl className="mt-2.5 space-y-2.5 border-t border-gray-100 pt-2.5 text-xs">
        <div className="min-w-0">
          <dt className="text-[11px] font-medium text-gray-500">{labels.dashboardTableSubmitted}</dt>
          <dd className="mt-0.5 break-words font-medium text-gray-800">{formatIsoDay(row.createdAt)}</dd>
        </div>
        <div className="min-w-0">
          <dt className="flex items-center gap-1 text-[11px] font-medium text-gray-500">
            <Calendar className="h-3 w-3 shrink-0 text-[#2E7D5B]" aria-hidden />
            <span className="min-w-0 break-words">{labels.dashboardTableWhen}</span>
          </dt>
          <dd className="mt-0.5 min-w-0 font-medium text-gray-800">
            {isEditing ? (
              <input
                type="date"
                value={editDate}
                min={todayInput}
                onChange={(e) => onEditDateChange(e.target.value)}
                className="box-border h-9 w-full max-w-full rounded-lg border border-gray-200 px-2 text-xs outline-none focus:ring-2 focus:ring-[#2E7D5B]/30"
              />
            ) : (
              <span className="break-words">{formatIsoDay(row.preferredDate)}</span>
            )}
          </dd>
        </div>
      </dl>

      {paths.length > 0 || row.referralAnalysis ? (
        <div className="mt-2.5 min-w-0 space-y-2 border-t border-gray-100 pt-2.5">
          <p className="break-words text-[11px] font-medium text-gray-500">
            {labels.dashboardReferralAttachedLabel}
          </p>
          <div className="flex min-w-0 max-w-full flex-wrap items-center gap-2">
            {paths.length > 0 ? (
              <div className="min-w-0 max-w-full overflow-hidden">
                <ReferralImagesLightbox
                  paths={paths}
                  size="sm"
                  removable={isPending}
                  onRemovePath={onRemoveImage}
                  removingPath={removePending ? removingPath : null}
                  removeImageAriaLabel={labels.dashboardReferralRemoveImageAria}
                />
              </div>
            ) : null}
            {row.referralAnalysis ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 min-w-0 max-w-full gap-1 whitespace-normal border-[#2E7D5B]/35 px-2 text-[11px] text-[#2E7D5B]"
                onClick={onOpenAnalysis}
              >
                <FileSearch className="h-3 w-3 shrink-0" aria-hidden />
                <span className="truncate">{labels.dashboardReferralAiDetail}</span>
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="mt-2.5 flex min-w-0 flex-col gap-1.5 border-t border-gray-100 pt-2.5">
        {isPending && !isEditing ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 min-w-0 w-full max-w-full justify-center gap-1 whitespace-normal border-gray-200 px-2 text-[11px]"
            onClick={onStartEdit}
          >
            <Pencil className="h-3 w-3 shrink-0" aria-hidden />
            <span className="min-w-0 truncate">{labels.dashboardEditPreferredDate}</span>
          </Button>
        ) : null}
        {isPending && isEditing ? (
          <div className="grid min-w-0 grid-cols-2 gap-1.5">
            <Button
              type="button"
              size="sm"
              className="h-8 min-w-0 max-w-full gap-1 whitespace-normal bg-[#2E7D5B] px-2 text-[11px] text-white hover:bg-[#256B4D]"
              disabled={!editDate || updatePending}
              onClick={onSaveDate}
            >
              {updatePending ? <Loader2 className="h-3 w-3 shrink-0 animate-spin" aria-hidden /> : null}
              <span className="min-w-0 truncate">{labels.dashboardSave}</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 min-w-0 max-w-full whitespace-normal px-2 text-[11px]"
              disabled={updatePending}
              onClick={onCancelEdit}
            >
              <span className="min-w-0 truncate">{labels.dashboardCancel}</span>
            </Button>
          </div>
        ) : null}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 min-w-0 w-full max-w-full justify-center gap-1 whitespace-normal border-red-200 px-2 text-[11px] text-red-700 hover:bg-red-50 hover:text-red-800"
          onClick={onDelete}
        >
          <Trash2 className="h-3 w-3 shrink-0" aria-hidden />
          <span className="min-w-0 truncate">{labels.dashboardDelete}</span>
        </Button>
      </div>
    </li>
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

  const cardLabels: AppointmentCardLabels = {
    dashboardTableSubmitted: t.dashboardTableSubmitted,
    dashboardTableHospital: t.dashboardTableHospital,
    dashboardTableNeed: t.dashboardTableNeed,
    dashboardTableWhen: t.dashboardTableWhen,
    dashboardReferralAttachedLabel: t.dashboardReferralAttachedLabel,
    dashboardReferralAiDetail: t.dashboardReferralAiDetail,
    dashboardReferralRemoveImageAria: t.dashboardReferralRemoveImageAria,
    dashboardEditPreferredDate: t.dashboardEditPreferredDate,
    dashboardSave: t.dashboardSave,
    dashboardCancel: t.dashboardCancel,
    dashboardDelete: t.dashboardDelete,
  };

  return (
    <div className="mx-auto min-w-0 w-full max-w-6xl space-y-8">
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
          <ul className="grid min-w-0 grid-cols-1 gap-3 p-3 md:grid-cols-2 md:p-4 [&>li]:min-w-0">
            {requests.map((r) => (
              <AppointmentRequestCard
                key={r.id}
                row={r}
                labels={cardLabels}
                locale={locale}
                todayInput={todayInput}
                isEditing={editingId === r.id}
                editDate={editDate}
                removingPath={removingPath}
                removePending={removeReferralMutation.isPending}
                updatePending={updateMutation.isPending}
                onEditDateChange={setEditDate}
                onStartEdit={() => startEdit(r)}
                onCancelEdit={cancelEdit}
                onSaveDate={() => {
                  if (!editDate) return;
                  updateMutation.mutate({ id: r.id, preferredDate: editDate });
                }}
                onDelete={() => {
                  setActionError(null);
                  setDeleteId(r.id);
                }}
                onRemoveImage={(p) => handleRemoveImage(r.id, p)}
                onOpenAnalysis={() => {
                  setActionError(null);
                  setDetailRow(r);
                }}
              />
            ))}
          </ul>
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
