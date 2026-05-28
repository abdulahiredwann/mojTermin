import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  ChevronDown,
  ChevronRight,
  Clock,
  Loader2,
  MapPin,
  Phone,
  Search,
  Upload,
  X,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TrackingNotificationOptions } from "@/components/TrackingNotificationOptions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@/lib/api";
import { showApiError } from "@/lib/apiError";
import { cn } from "@/lib/utils";

type SlovenianLocation = { city: string; region: string };

type ReferralVisionPayload = {
  headline?: string;
  detailsMarkdown?: string;
  specialtyHints?: string[];
  procedureHints?: string[];
  rawEntities?: string[];
  model?: string;
  imageCount?: number;
  error?: string;
};

type SearchResult = {
  intent: string;
  explanation: string;
  totalHospitals: number;
  filterCity?: string | null;
  cities: Array<{ name: string; country: string; hospitalCount: number }>;
  hospitals: Array<{
    id: string;
    name: string;
    city: string | null;
    country: string;
    address: string | null;
    phone: string | null;
    averageWaitDays: number | null;
    services: Array<{
      id: string;
      specialty: string | null;
      procedureName: string | null;
      estimatedWaitDays: number | null;
    }>;
  }>;
  referralVision?: ReferralVisionPayload | null;
};

type ConfirmRequestSummary = {
  requestCount: number;
  hospitalNames: string[];
  email: string;
  notifyEmail: boolean;
  notifyFasterRefresh: boolean;
  notifySms: boolean;
};

function hospitalEstimatedWaitDays(hospital: SearchResult["hospitals"][number]): number | null {
  if (hospital.averageWaitDays != null) return hospital.averageWaitDays;
  const waits = hospital.services
    .map((s) => s.estimatedWaitDays)
    .filter((v): v is number => v != null);
  if (waits.length === 0) return null;
  return Math.min(...waits);
}

const URGENCY_ORDER = ["Zelo hitro", "Hitro", "Redno"] as const;

function urgencyLabel(urgency: string, locale: string) {
  const normalized = urgency.trim().toLowerCase();
  const isSl = locale === "sl";
  if (normalized === "zelo hitro") return isSl ? "Zelo hitro" : "Very fast";
  if (normalized === "hitro") return isSl ? "Hitro" : "Fast";
  if (normalized === "redno") return isSl ? "Redno" : "Regular";
  return urgency;
}

function urgencyWaitEstimates(hospital: SearchResult["hospitals"][number]) {
  return URGENCY_ORDER.map((urgency) => {
    const waits = hospital.services
      .filter(
        (s) =>
          typeof s.specialty === "string" &&
          s.specialty.toLowerCase() === urgency.toLowerCase() &&
          s.estimatedWaitDays != null,
      )
      .map((s) => s.estimatedWaitDays as number);
    return { urgency, waitDays: waits.length ? Math.min(...waits) : null };
  });
}

const MAX_REFERRAL_IMAGES = 15;
/** Must match server `MAX_SEARCH_REFERRAL_IMAGES` for POST /search */
const MAX_SEARCH_REFERRAL_IMAGES = 8;

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

function ReferralVisionPanel({
  data,
  copy,
}: {
  data: ReferralVisionPayload;
  copy: {
    dashboardReferralAiPanelTitle: string;
    dashboardReferralAiPanelHint: string;
    dashboardReferralAiError: string;
    dashboardReferralRawMentions: string;
  };
}) {
  return (
    <aside className="w-full shrink-0 rounded-xl border border-[#2E7D5B]/25 bg-white p-4 shadow-sm lg:sticky lg:top-4 lg:max-w-[min(100%,22rem)] xl:max-w-[min(100%,24rem)]">
      <div className="flex items-start gap-2 border-b border-gray-100 pb-3">
        <Sparkles className="h-5 w-5 shrink-0 text-amber-500" aria-hidden />
        <div className="min-w-0">
          <p className="text-sm font-bold text-gray-900">{copy.dashboardReferralAiPanelTitle}</p>
          <p className="mt-1 text-[11px] leading-snug text-gray-500">
            {copy.dashboardReferralAiPanelHint}
          </p>
        </div>
      </div>
      {data.error ? (
        <div className="mt-3 space-y-1 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-950">
          <p className="font-medium">{copy.dashboardReferralAiError}</p>
          {import.meta.env.DEV ? (
            <p className="break-words font-mono text-[10px] opacity-80">{data.error}</p>
          ) : null}
        </div>
      ) : null}
      {!data.error && data.headline ? (
        <p className="mt-3 text-sm font-semibold leading-snug text-[#2E7D5B]">{data.headline}</p>
      ) : null}
      {!data.error && data.detailsMarkdown ? (
        <ScrollArea className="mt-3 max-h-[min(50vh,24rem)] pr-3">
          <div>{renderMarkdownishParagraphs(data.detailsMarkdown)}</div>
        </ScrollArea>
      ) : null}
      {!data.error &&
      ((data.specialtyHints?.length ?? 0) > 0 || (data.procedureHints?.length ?? 0) > 0) ? (
        <div className="mt-3 flex flex-wrap gap-1 border-t border-gray-100 pt-3">
          {[...(data.specialtyHints ?? []), ...(data.procedureHints ?? [])]
            .slice(0, 14)
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
      {!data.error && (data.rawEntities?.length ?? 0) > 0 ? (
        <details className="mt-3 border-t border-gray-100 pt-2">
          <summary className="cursor-pointer text-[11px] font-medium text-gray-600 hover:text-gray-900">
            {copy.dashboardReferralRawMentions}
          </summary>
          <ul className="mt-2 list-inside list-disc space-y-0.5 text-[11px] text-gray-600">
            {(data.rawEntities ?? []).slice(0, 20).map((e, i) => (
              <li key={`${e}-${i}`}>{e}</li>
            ))}
          </ul>
        </details>
      ) : null}
    </aside>
  );
}

type UserAppointmentStatsPayload = {
  stats: { total: number; byStatus: Record<string, number> };
};

export function UserDashboardPage() {
  const { t, locale } = useLanguage();
  const { user } = useUserAuth();
  const queryClient = useQueryClient();

  const [problem, setProblem] = useState("");
  const [referralFiles, setReferralFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [selectedHospitalIds, setSelectedHospitalIds] = useState<string[]>([]);
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [confirmRequestOpen, setConfirmRequestOpen] = useState(false);
  const [confirmRequestSummary, setConfirmRequestSummary] = useState<ConfirmRequestSummary | null>(
    null,
  );
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyFasterRefresh, setNotifyFasterRefresh] = useState(false);
  const [notifySms, setNotifySms] = useState(false);

  const [selectedLocation, setSelectedLocation] = useState<SlovenianLocation | null>(null);
  const [cityPopoverOpen, setCityPopoverOpen] = useState(false);

  const analyzeStatusMessages = useMemo(
    () =>
      [
        t.analyzeStatusReadingImages,
        t.analyzeStatusFindingHospitals,
        t.analyzeStatusExploring,
        t.analyzeStatusAlmostThere,
      ] as const,
    [
      t.analyzeStatusReadingImages,
      t.analyzeStatusFindingHospitals,
      t.analyzeStatusExploring,
      t.analyzeStatusAlmostThere,
    ],
  );

  const [loadingHintIdx, setLoadingHintIdx] = useState(0);

  useEffect(() => {
    if (!loading) {
      setLoadingHintIdx(0);
      return;
    }
    const id = window.setInterval(() => {
      setLoadingHintIdx((i) => (i + 1) % analyzeStatusMessages.length);
    }, 1750);
    return () => window.clearInterval(id);
  }, [loading, analyzeStatusMessages.length]);

  const { data: locations = [] } = useQuery({
    queryKey: ["slovenian-locations"],
    queryFn: async () => {
      const res = await api.get<{ locations: SlovenianLocation[] }>("/search/locations");
      return res.data.locations;
    },
    staleTime: 1000 * 60 * 60 * 24,
  });

  const { data: appointmentData } = useQuery({
    queryKey: ["user-appointments"],
    queryFn: async () => {
      const res = await api.get<UserAppointmentStatsPayload>("/user/appointments");
      return res.data;
    },
    staleTime: 1000 * 30,
  });

  const stats = appointmentData?.stats ?? { total: 0, byStatus: {} as Record<string, number> };
  const pendingCount = stats.byStatus["pending"] ?? 0;
  const isPro = user?.effectivePlan === "pro";
  const planHighlights = isPro
    ? t.pricingProFeatures.slice(0, 3)
    : t.pricingFreeFeatures.filter((line) => !t.pricingFreeExcluded.includes(line)).slice(0, 3);
  const planStartedLabel = user?.subscriptionStartedAt
    ? new Date(user.subscriptionStartedAt).toLocaleDateString(locale === "sl" ? "sl-SI" : "en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  const filteredHospitals = useMemo(() => {
    if (!searchResult) return [];
    return searchResult.hospitals;
  }, [searchResult]);

  const selectedHospitals = useMemo(() => {
    if (!searchResult || selectedHospitalIds.length === 0) return [];
    const selectedSet = new Set(selectedHospitalIds);
    return searchResult.hospitals.filter((h) => selectedSet.has(h.id));
  }, [selectedHospitalIds, searchResult]);

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!problem.trim()) {
      setError(t.heroValidationNeedInput);
      return;
    }
    if (!selectedLocation) {
      setError(t.heroValidationPickCity);
      return;
    }
    setLoading(true);
    setSearchResult(null);
    setSelectedHospitalIds([]);
    setNotifyEmail(true);
    setNotifyFasterRefresh(false);
    setNotifySms(false);

    try {
      const searchFiles = referralFiles.slice(0, MAX_SEARCH_REFERRAL_IMAGES);
      if (searchFiles.length > 0) {
        const fd = new FormData();
        fd.append("query", problem);
        fd.append("city", selectedLocation.city);
        for (const f of searchFiles) {
          fd.append("referralImages", f);
        }
        const { data } = await api.post<SearchResult>("/search", fd);
        setSearchResult(data);
      } else {
        const { data } = await api.post<SearchResult>("/search", {
          query: problem,
          city: selectedLocation.city,
        });
        setSearchResult(data);
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        "Failed to search. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  function getEarliestDate(waitDays: number | null) {
    if (!waitDays) return new Date();
    const date = new Date();
    date.setDate(date.getDate() + waitDays);
    return date;
  }

  function toDateInputValue(date: Date): string {
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, "0");
    const d = String(date.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function getPreferredDateForHospital(hospital: SearchResult["hospitals"][number]): string {
    const waitDays = hospitalEstimatedWaitDays(hospital);
    return toDateInputValue(getEarliestDate(waitDays));
  }

  function toggleHospitalSelection(hospitalId: string) {
    setSelectedHospitalIds((prev) =>
      prev.includes(hospitalId) ? prev.filter((id) => id !== hospitalId) : [...prev, hospitalId],
    );
  }

  function resetAvailabilitySection() {
    setSearchResult(null);
    setSelectedHospitalIds([]);
    setNotifyEmail(true);
    setNotifyFasterRefresh(false);
    setNotifySms(false);
  }

  function handleConfirmDialogOpenChange(open: boolean) {
    setConfirmRequestOpen(open);
    if (!open) {
      setConfirmRequestSummary(null);
      resetAvailabilitySection();
    }
  }

  async function handleConfirmRequest() {
    if (!searchResult || !user) return;
    if (selectedHospitals.length === 0) {
      setError(locale === "sl" ? "Izberite vsaj en zdravstveni zavod." : "Please select at least one hospital.");
      return;
    }
    setError(null);
    setSubmittingRequest(true);
    const trackingOpts = {
      notifyEmail,
      notifyFasterRefresh: isPro && notifyFasterRefresh,
      notifySms: isPro && notifySms,
    };
    const requestPayloads = selectedHospitals.map((hospital) => ({
      query: problem,
      intent: searchResult.intent,
      city: hospital.city ?? "",
      hospitalId: hospital.id,
      hospitalName: hospital.name,
      preferredDate: getPreferredDateForHospital(hospital),
      ...trackingOpts,
    }));
    try {
      await Promise.all(
        requestPayloads.map(async (payload) => {
          if (referralFiles.length > 0) {
            const fd = new FormData();
            fd.append("query", payload.query);
            fd.append("intent", payload.intent);
            fd.append("city", payload.city);
            fd.append("hospitalId", payload.hospitalId);
            fd.append("hospitalName", payload.hospitalName);
            fd.append("preferredDate", payload.preferredDate);
            fd.append("notifyEmail", payload.notifyEmail ? "true" : "false");
            fd.append(
              "notifyFasterRefresh",
              payload.notifyFasterRefresh ? "true" : "false",
            );
            fd.append("notifySms", payload.notifySms ? "true" : "false");
            for (const file of referralFiles) {
              fd.append("referralImages", file);
            }
            await api.post<{ request: { id: string } }>("/appointments", fd);
            return;
          }
          await api.post<{ request: { id: string } }>("/appointments", payload);
        }),
      );
      setConfirmRequestSummary({
        requestCount: requestPayloads.length,
        hospitalNames: requestPayloads.map((r) => r.hospitalName),
        email: user.email.trim(),
        ...trackingOpts,
      });
      setReferralFiles([]);
      setConfirmRequestOpen(true);
      await queryClient.invalidateQueries({ queryKey: ["user-appointments"] });
    } catch (err: unknown) {
      setError(showApiError(err, "Failed to submit appointment request."));
    } finally {
      setSubmittingRequest(false);
    }
  }

  function referralFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const incoming = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (incoming.length === 0) return;
    setReferralFiles((prev) => {
      const next = [...prev];
      for (const file of incoming) {
        if (next.length >= MAX_REFERRAL_IMAGES) break;
        next.push(file);
      }
      return next;
    });
  }

  function removeReferralFileAt(index: number) {
    setReferralFiles((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <>
      <div className="relative mx-auto w-full max-w-3xl">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 md:text-3xl">
            {t.dashboardPageTitle}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-600 md:text-base">{t.dashboardIntro}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              {t.dashboardCardTotal}
            </p>
            <p className="mt-1 text-2xl font-bold text-[#2E7D5B]">{stats.total}</p>
            <Link
              to="/user/appointments"
              className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[#2E7D5B] hover:underline"
            >
              {t.dashboardHistoryTitle}
              <ChevronRight className="h-3 w-3" aria-hidden />
            </Link>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              {t.dashboardCardPending}
            </p>
            <p className="mt-1 text-2xl font-bold text-amber-700">{pendingCount}</p>
          </div>
          <div
            className={cn(
              "rounded-2xl border bg-gradient-to-br from-[#f6fbf8] to-white p-4 shadow-sm sm:col-span-1",
              isPro ? "border-[#2E7D5B]/30" : "border-[#2E7D5B]/20",
            )}
          >
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              {t.dashboardCardPlan}
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-lg font-bold text-gray-900">
              <span aria-hidden>{isPro ? "🟡" : "🟢"}</span>
              {isPro ? t.userSidebarPlanPro : t.userSidebarPlanFree}
            </p>
            <p className="mt-0.5 text-sm font-semibold text-[#2E7D5B]">
              {isPro ? (
                <>
                  {t.pricingProPrice}
                  <span className="ml-1 text-xs font-normal text-gray-500">{t.pricingProPriceNote}</span>
                </>
              ) : (
                t.pricingFreePrice
              )}
            </p>
            {planStartedLabel ? (
              <p className="mt-1 text-[11px] text-gray-500">
                {t.dashboardCardPlanSince} {planStartedLabel}
              </p>
            ) : null}
            <ul className="mt-3 space-y-1">
              {planHighlights.map((line) => (
                <li
                  key={line}
                  className="flex items-start gap-2 text-[11px] leading-snug text-gray-600"
                >
                  <span className="mt-[0.35rem] h-1 w-1 shrink-0 rounded-full bg-[#2E7D5B]" aria-hidden />
                  {line}
                </li>
              ))}
            </ul>
            {!isPro ? (
              <Link
                to="/#pricing"
                className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#2E7D5B] hover:underline"
              >
                {t.dashboardCardPlanUpgrade}
                <ChevronRight className="h-3 w-3" aria-hidden />
              </Link>
            ) : null}
          </div>
        </div>

        <section className="space-y-5">
          <h2 className="text-lg font-bold text-gray-900">{t.dashboardNewRequestTitle}</h2>
          <form
            onSubmit={handleAnalyze}
            className="space-y-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-5"
          >
            <div className="space-y-1.5">
              <Label htmlFor="dash-problem" className="text-sm text-gray-700">
                {t.labelProblem}
              </Label>
              <Input
                id="dash-problem"
                name="problem"
                autoComplete="off"
                placeholder={t.placeholderProblem}
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                maxLength={180}
                className="h-11 w-full rounded-xl border-gray-200 text-[15px] shadow-none focus-visible:ring-[#2E7D5B]/30"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-2 text-sm text-gray-700">
                <MapPin className="h-4 w-4 text-[#2E7D5B]" />
                {t.dashboardYourCity}
              </Label>
              <Popover open={cityPopoverOpen} onOpenChange={setCityPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={cityPopoverOpen}
                    className="h-11 w-full justify-between rounded-xl border-gray-200 bg-white px-3 text-left font-normal text-[15px] hover:bg-white"
                  >
                    <span className={selectedLocation ? "text-gray-900" : "text-gray-500"}>
                      {selectedLocation ? selectedLocation.city : "—"}
                    </span>
                    <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="z-[100] w-[min(calc(100vw-2rem),28rem)] max-h-[min(420px,70vh)] p-0"
                  align="start"
                  side="bottom"
                  sideOffset={8}
                  collisionPadding={16}
                  avoidCollisions
                >
                  <Command shouldFilter className="rounded-xl border-0">
                    <CommandInput placeholder="Filter cities…" className="h-11" />
                    <CommandList className="max-h-[min(320px,55vh)]">
                      <CommandEmpty>No city found.</CommandEmpty>
                      <CommandGroup>
                        {locations.map((loc) => (
                          <CommandItem
                            key={`${loc.region}-${loc.city}`}
                            value={`${loc.city} ${loc.region}`}
                            className="mojtermin-green-option cursor-pointer rounded-lg text-gray-900"
                            onSelect={() => {
                              setSelectedLocation(loc);
                              setCityPopoverOpen(false);
                            }}
                          >
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-900">{loc.city}</span>
                              <span className="city-region text-xs text-gray-500">{loc.region}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {selectedLocation ? (
                <p className="text-xs text-gray-500">{selectedLocation.region}</p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-2 text-sm text-gray-700">
                <Upload className="h-4 w-4 text-[#2E7D5B]" />
                {t.dashboardReferralPhoto}
              </Label>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={referralFilesChange}
                className="h-11 cursor-pointer rounded-xl border border-gray-200 bg-white text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[#e8f5ee] file:px-3 file:py-2 file:text-sm file:font-medium file:text-[#2E7D5B]"
              />
              <p className="text-xs text-gray-500">{t.dashboardReferralPhotoHint}</p>
              {referralFiles.length > 0 ? (
                <ul className="max-h-32 space-y-1 overflow-y-auto rounded-lg border border-gray-100 bg-gray-50 p-2">
                  {referralFiles.map((f, i) => (
                    <li
                      key={`${f.name}-${f.size}-${f.lastModified}-${i}`}
                      className="flex items-center justify-between gap-2 text-xs text-gray-800"
                    >
                      <span className="min-w-0 truncate font-medium">{f.name}</span>
                      <button
                        type="button"
                        onClick={() => removeReferralFileAt(i)}
                        className="inline-flex shrink-0 items-center justify-center rounded-md border border-transparent p-1 text-gray-500 hover:bg-gray-200 hover:text-gray-900"
                        aria-label={t.dashboardReferralRemoveFromListAria}
                      >
                        <X className="h-3.5 w-3.5" aria-hidden />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
              {referralFiles.length > MAX_SEARCH_REFERRAL_IMAGES ? (
                <p className="text-[11px] leading-snug text-amber-900/90">
                  {t.dashboardReferralSearchLimitNote}
                </p>
              ) : null}
            </div>

            {error ? <p className="text-xs text-red-600">{error}</p> : null}

            <Button
              type="submit"
              disabled={loading}
              className="flex h-auto min-h-[3.25rem] w-full flex-col gap-1 rounded-full bg-[#2E7D5B] py-4 text-sm font-semibold text-white shadow-md shadow-[#2E7D5B]/15 hover:bg-[#256B4D] md:text-base"
            >
              {loading ? (
                <>
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin shrink-0" />
                    <span>{t.analyzing}</span>
                  </span>
                  <span className="text-center text-[11px] font-normal leading-tight text-white/90 md:text-xs">
                    {analyzeStatusMessages[loadingHintIdx % analyzeStatusMessages.length]}
                  </span>
                </>
              ) : (
                t.analyzeButton
              )}
            </Button>
          </form>
        </section>
      </div>
      </div>

      {searchResult ? (
        <div className="mx-auto mt-8 w-full min-w-0 max-w-7xl space-y-5 rounded-2xl border border-[#2E7D5B]/15 bg-[#f6fbf8] p-5 md:p-6 lg:p-8">
          <div className="space-y-2">
            <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 md:text-xl">
              <Search className="h-5 w-5 shrink-0 text-[#2E7D5B]" />
              {searchResult.intent}
            </h3>
            <p className="text-sm text-gray-600 md:text-base">{searchResult.explanation}</p>
          </div>

          {searchResult.referralVision && filteredHospitals.length === 0 ? (
            <ReferralVisionPanel
              data={searchResult.referralVision}
              copy={{
                dashboardReferralAiPanelTitle: t.dashboardReferralAiPanelTitle,
                dashboardReferralAiPanelHint: t.dashboardReferralAiPanelHint,
                dashboardReferralAiError: t.dashboardReferralAiError,
                dashboardReferralRawMentions: t.dashboardReferralRawMentions,
              }}
            />
          ) : null}

          {filteredHospitals.length > 0 ? (
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Building2 className="h-4 w-4 text-[#2E7D5B]" />
                {t.dashboardSelectHospital}
              </Label>
              <div
                className={cn(
                  "flex flex-col gap-5",
                  searchResult.referralVision ? "xl:flex-row xl:items-start xl:gap-6" : "",
                )}
              >
                <div className="min-w-0 flex-1">
                  <div
                    className={cn(
                      "grid gap-3",
                      searchResult.referralVision
                        ? "sm:grid-cols-2"
                        : "sm:grid-cols-2 xl:grid-cols-3",
                    )}
                  >
                    {filteredHospitals.map((hospital) => {
                      const waitDays = hospitalEstimatedWaitDays(hospital);
                      const urgencyEstimates = urgencyWaitEstimates(hospital);
                      const hasUrgencyEstimates = urgencyEstimates.some((item) => item.waitDays != null);
                      const isSelected = selectedHospitalIds.includes(hospital.id);
                      return (
                        <button
                          key={hospital.id}
                          type="button"
                          onClick={() => toggleHospitalSelection(hospital.id)}
                          className={cn(
                            "rounded-xl border bg-white p-4 text-left shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D5B]/40",
                            isSelected
                              ? "border-[#2E7D5B] ring-2 ring-[#2E7D5B]/20"
                              : "border-gray-200 hover:border-[#2E7D5B]/35",
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="min-w-0 font-semibold leading-snug text-gray-900">
                              {hospital.name}
                            </p>
                            <span
                              className={cn(
                                "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border",
                                isSelected
                                  ? "border-[#2E7D5B] bg-[#2E7D5B] text-white"
                                  : "border-gray-300 bg-white text-transparent",
                              )}
                              aria-hidden
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </span>
                          </div>
                          <p className="mt-1.5 text-sm text-gray-500">
                            {[hospital.address, hospital.city].filter(Boolean).join(" · ") ||
                              hospital.city ||
                              hospital.country}
                          </p>
                          {hospital.phone ? (
                            <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                              <Phone className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                              {hospital.phone}
                            </p>
                          ) : null}
                          <div className="mt-3 flex items-center gap-2 rounded-lg bg-[#f6fbf8] px-3 py-2 text-sm text-gray-700">
                            <Clock className="h-4 w-4 shrink-0 text-[#2E7D5B]" />
                            <span>
                              {waitDays != null
                                ? `Est. wait ~${waitDays} days`
                                : "Est. wait not available"}
                            </span>
                          </div>
                          <div className="mt-2 grid grid-cols-1 gap-1 text-xs text-gray-700">
                            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                              {locale === "sl" ? "Stopnje nujnosti" : "Emergency levels"}
                            </p>
                            {urgencyEstimates.map((item) => (
                              <div
                                key={`${hospital.id}-${item.urgency}`}
                                className="flex items-center justify-between rounded-md bg-gray-50 px-2.5 py-1.5"
                              >
                                <span className="font-medium">{urgencyLabel(item.urgency, locale)}</span>
                                <span className="text-gray-600">
                                  {item.waitDays != null ? `~${item.waitDays} days` : "—"}
                                </span>
                              </div>
                            ))}
                            {!hasUrgencyEstimates ? (
                              <p className="text-[11px] text-gray-500">
                                {locale === "sl"
                                  ? "Ocena po stopnji nujnosti trenutno ni na voljo."
                                  : "Urgency-level estimates are not available yet."}
                              </p>
                            ) : null}
                          </div>
                          {hospital.services.length > 0 ? (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {hospital.services.slice(0, 4).map((service) => (
                                <span
                                  key={service.id}
                                  className="inline-flex max-w-full truncate rounded-full bg-[#e8f5ee] px-2 py-0.5 text-xs text-[#2E7D5B]"
                                >
                                  {service.specialty || service.procedureName || "General"}
                                </span>
                              ))}
                              {hospital.services.length > 4 ? (
                                <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                                  +{hospital.services.length - 4}
                                </span>
                              ) : null}
                            </div>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {searchResult.referralVision ? (
                  <ReferralVisionPanel
                    data={searchResult.referralVision}
                    copy={{
                      dashboardReferralAiPanelTitle: t.dashboardReferralAiPanelTitle,
                      dashboardReferralAiPanelHint: t.dashboardReferralAiPanelHint,
                      dashboardReferralAiError: t.dashboardReferralAiError,
                      dashboardReferralRawMentions: t.dashboardReferralRawMentions,
                    }}
                  />
                ) : null}
              </div>
            </div>
          ) : null}

          {selectedHospitals.length > 0 ? (
            <div className="space-y-4 rounded-xl border border-white bg-white p-4 shadow-sm sm:p-5">
              <div className="flex w-full max-w-md flex-col space-y-5">
                <div className="border-b border-gray-100 pb-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    {locale === "sl" ? "Izbranih zavodov" : "Selected hospitals"}
                  </p>
                  <p className="mt-1 text-sm font-semibold leading-snug text-gray-900">
                    {selectedHospitals.length}
                  </p>
                </div>

                <div className="space-y-1">
                  {selectedHospitals.slice(0, 3).map((hospital) => (
                    <p key={hospital.id} className="text-sm text-gray-700">
                      • {hospital.name}
                    </p>
                  ))}
                  {selectedHospitals.length > 3 ? (
                    <p className="text-xs text-gray-500">
                      {locale === "sl"
                        ? `+${selectedHospitals.length - 3} več`
                        : `+${selectedHospitals.length - 3} more`}
                    </p>
                  ) : null}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:items-start sm:gap-x-6 sm:gap-y-4">
                  <div className="w-full">
                    <TrackingNotificationOptions
                      isPro={isPro}
                      notifyEmail={notifyEmail}
                      onNotifyEmailChange={setNotifyEmail}
                      notifyFasterRefresh={notifyFasterRefresh}
                      onNotifyFasterRefreshChange={setNotifyFasterRefresh}
                      notifySms={notifySms}
                      onNotifySmsChange={setNotifySms}
                    />
                  </div>
                </div>

                {error && searchResult ? (
                  <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                  </p>
                ) : null}

                <Button
                  type="button"
                  onClick={handleConfirmRequest}
                  disabled={selectedHospitals.length === 0 || submittingRequest}
                  className="h-10 w-full rounded-full bg-[#2E7D5B] px-5 text-sm font-semibold text-white hover:bg-[#256B4D] disabled:opacity-50 sm:h-9 sm:max-w-xs sm:self-start"
                >
                  {submittingRequest
                    ? t.trackingButtonSubmitting
                    : t.trackingButtonLabel}
                </Button>
              </div>
            </div>
          ) : filteredHospitals.length > 0 ? (
            <p className="text-sm text-gray-500">
              {locale === "sl"
                ? "Izberite vsaj en zdravstveni zavod za nadaljevanje."
                : "Choose at least one hospital to continue."}
            </p>
          ) : null}
        </div>
      ) : null}

      <Dialog open={confirmRequestOpen} onOpenChange={handleConfirmDialogOpenChange}>
        <DialogContent className="border-gray-200 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t.confirmRequestModalTitle}</DialogTitle>
            <DialogDescription>{t.confirmRequestModalDescription}</DialogDescription>
          </DialogHeader>
          {confirmRequestSummary ? (
            <div className="space-y-4 text-sm">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  {locale === "sl" ? "Število zahtev" : "Requests created"}
                </p>
                <p className="font-semibold text-gray-900">{confirmRequestSummary.requestCount}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  {t.confirmRequestModalHospital}
                </p>
                <p className="font-semibold text-gray-900">
                  {confirmRequestSummary.hospitalNames.slice(0, 2).join(", ")}
                  {confirmRequestSummary.hospitalNames.length > 2
                    ? locale === "sl"
                      ? ` +${confirmRequestSummary.hospitalNames.length - 2} več`
                      : ` +${confirmRequestSummary.hospitalNames.length - 2} more`
                    : ""}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  {t.confirmRequestModalEmail}
                </p>
                <p className="font-semibold text-gray-900">{confirmRequestSummary.email}</p>
              </div>
              <div className="space-y-1 rounded-lg bg-[#f6fbf8] px-3 py-2 text-sm text-gray-700">
                <p>
                  {t.trackingEmailCheckbox}:{" "}
                  {confirmRequestSummary.notifyEmail ? "✓" : "—"}
                </p>
                <p>
                  {t.trackingFasterRefreshCheckbox}:{" "}
                  {confirmRequestSummary.notifyFasterRefresh ? "✓" : "—"}
                </p>
                <p>
                  {t.trackingSmsCheckbox}:{" "}
                  {confirmRequestSummary.notifySms ? "✓" : "—"}
                </p>
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              className="w-full rounded-full bg-[#2E7D5B] text-white sm:w-auto"
              onClick={() => handleConfirmDialogOpenChange(false)}
            >
              {t.confirmRequestModalOk}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
