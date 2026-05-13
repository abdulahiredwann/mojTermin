import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
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
import { Checkbox } from "@/components/ui/checkbox";
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
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

type SlovenianLocation = { city: string; region: string };

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
};

type ConfirmRequestSummary = {
  hospitalName: string;
  email: string;
  preferredDateLabel: string;
  notifyWhenAvailable: boolean;
};

function hospitalEstimatedWaitDays(hospital: SearchResult["hospitals"][number]): number | null {
  if (hospital.averageWaitDays != null) return hospital.averageWaitDays;
  const fromService = hospital.services.find((s) => s.estimatedWaitDays != null)?.estimatedWaitDays;
  return fromService ?? null;
}

const MAX_REFERRAL_IMAGES = 15;

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
  const [selectedHospitalId, setSelectedHospitalId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [confirmRequestOpen, setConfirmRequestOpen] = useState(false);
  const [confirmRequestSummary, setConfirmRequestSummary] = useState<ConfirmRequestSummary | null>(
    null,
  );
  const [notifyWhenAvailable, setNotifyWhenAvailable] = useState(false);

  const [selectedLocation, setSelectedLocation] = useState<SlovenianLocation | null>(null);
  const [cityPopoverOpen, setCityPopoverOpen] = useState(false);

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

  const filteredHospitals = useMemo(() => {
    if (!searchResult) return [];
    return searchResult.hospitals;
  }, [searchResult]);

  const selectedHospital = useMemo(() => {
    if (!selectedHospitalId || !searchResult) return null;
    return searchResult.hospitals.find((h) => h.id === selectedHospitalId) || null;
  }, [selectedHospitalId, searchResult]);

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
    setSelectedHospitalId("");
    setSelectedDate("");
    setNotifyWhenAvailable(false);

    try {
      const { data } = await api.post<SearchResult>("/search", {
        query: problem,
        city: selectedLocation.city,
      });
      setSearchResult(data);
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

  function formatDay(date: Date) {
    return date.toLocaleDateString(locale === "sl" ? "sl-SI" : "en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function resetAvailabilitySection() {
    setSearchResult(null);
    setSelectedHospitalId("");
    setSelectedDate("");
    setNotifyWhenAvailable(false);
  }

  function handleConfirmDialogOpenChange(open: boolean) {
    setConfirmRequestOpen(open);
    if (!open) {
      setConfirmRequestSummary(null);
      resetAvailabilitySection();
    }
  }

  async function handleConfirmRequest() {
    if (!searchResult || !selectedHospital || !selectedDate || !user) return;
    setError(null);
    setSubmittingRequest(true);
    const preferredDateLabel = formatDay(new Date(`${selectedDate}T12:00:00`));
    try {
      if (referralFiles.length > 0) {
        const fd = new FormData();
        fd.append("query", problem);
        fd.append("intent", searchResult.intent);
        fd.append("city", selectedHospital.city ?? "");
        fd.append("hospitalId", selectedHospital.id);
        fd.append("hospitalName", selectedHospital.name);
        fd.append("preferredDate", selectedDate);
        fd.append("notifyWhenAvailable", notifyWhenAvailable ? "true" : "false");
        for (const file of referralFiles) {
          fd.append("referralImages", file);
        }
        await api.post<{ request: { id: string } }>("/appointments", fd);
      } else {
        await api.post<{ request: { id: string } }>("/appointments", {
          query: problem,
          intent: searchResult.intent,
          city: selectedHospital.city,
          hospitalId: selectedHospital.id,
          hospitalName: selectedHospital.name,
          preferredDate: selectedDate,
          notifyWhenAvailable,
        });
      }
      setConfirmRequestSummary({
        hospitalName: selectedHospital.name,
        email: user.email.trim(),
        preferredDateLabel,
        notifyWhenAvailable,
      });
      setReferralFiles([]);
      setConfirmRequestOpen(true);
      await queryClient.invalidateQueries({ queryKey: ["user-appointments"] });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        "Failed to submit appointment request.";
      setError(msg);
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
          <div className="rounded-2xl border border-[#2E7D5B]/20 bg-gradient-to-br from-[#f6fbf8] to-white p-4 shadow-sm sm:col-span-1">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2E7D5B]">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
                  <path
                    d="M12 2C8.5 2 3 5 3 12C3 17.5 8 22 12 22C16 22 21 17.5 21 12C21 5 15.5 2 12 2Z"
                    fill="white"
                    opacity="0.9"
                  />
                  <path d="M9 11H15M12 8V14" stroke="#2E7D5B" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-[#2E7D5B]">MojTermin</p>
                <p className="mt-1 text-xs leading-snug text-gray-600">{t.dashboardMarketingBlurb}</p>
                <Link
                  to="/about"
                  className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#2E7D5B] hover:underline"
                >
                  {t.dashboardMarketingCta}
                  <ChevronRight className="h-3 w-3" aria-hidden />
                </Link>
              </div>
            </div>
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
            </div>

            {error ? <p className="text-xs text-red-600">{error}</p> : null}

            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#2E7D5B] py-5 text-sm font-semibold text-white shadow-md shadow-[#2E7D5B]/15 hover:bg-[#256B4D] md:text-base"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {t.analyzing}
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

          {filteredHospitals.length > 0 ? (
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Building2 className="h-4 w-4 text-[#2E7D5B]" />
                {t.dashboardSelectHospital}
              </Label>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {filteredHospitals.map((hospital) => {
                  const waitDays = hospitalEstimatedWaitDays(hospital);
                  const isSelected = selectedHospitalId === hospital.id;
                  return (
                    <button
                      key={hospital.id}
                      type="button"
                      onClick={() => setSelectedHospitalId(hospital.id)}
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
                        {isSelected ? (
                          <CheckCircle2
                            className="h-5 w-5 shrink-0 text-[#2E7D5B]"
                            aria-hidden
                          />
                        ) : null}
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
          ) : null}

          {selectedHospital ? (
            <div className="space-y-4 rounded-xl border border-white bg-white p-4 shadow-sm sm:p-5">
              <div className="flex w-full max-w-md flex-col space-y-5">
                <div className="border-b border-gray-100 pb-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    {t.confirmRequestModalHospital}
                  </p>
                  <p className="mt-1 text-sm font-semibold leading-snug text-gray-900">
                    {selectedHospital.name}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:items-start sm:gap-x-6 sm:gap-y-4">
                  <div className="w-full max-w-[12rem] space-y-1.5">
                    <Label className="flex items-center gap-2 text-xs font-medium text-gray-600 sm:text-sm sm:text-gray-700">
                      <Calendar className="h-3.5 w-3.5 shrink-0 text-[#2E7D5B] sm:h-4 sm:w-4" />
                      {t.dashboardPreferredAppointmentDate}
                    </Label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="h-9 w-full rounded-lg border border-gray-200 bg-white px-2.5 text-sm outline-none focus:ring-2 focus:ring-[#2E7D5B]/25"
                    />
                    {hospitalEstimatedWaitDays(selectedHospital) != null ? (
                      <p className="text-[11px] leading-relaxed text-gray-500">
                        Earliest available:{" "}
                        {formatDay(
                          getEarliestDate(hospitalEstimatedWaitDays(selectedHospital)),
                        )}
                      </p>
                    ) : null}
                  </div>
                  <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 sm:min-w-0">
                    <div className="flex gap-2.5">
                      <Checkbox
                        id="dash-notify"
                        checked={notifyWhenAvailable}
                        onCheckedChange={(v) => setNotifyWhenAvailable(v === true)}
                        className="mt-0.5 shrink-0 border-[#2E7D5B] data-[state=checked]:border-[#2E7D5B] data-[state=checked]:bg-[#2E7D5B]"
                      />
                      <div className="min-w-0 space-y-1">
                        <label
                          htmlFor="dash-notify"
                          className="cursor-pointer text-xs font-medium leading-snug text-gray-800 sm:text-sm"
                        >
                          {t.dashboardNotifyCheckbox}
                        </label>
                        <p className="text-[11px] leading-relaxed text-gray-500 sm:text-xs">
                          {t.dashboardNotifyHint}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] leading-relaxed text-gray-500 sm:text-xs">
                  {t.dashboardEmailNote}
                </p>

                <Button
                  type="button"
                  onClick={handleConfirmRequest}
                  disabled={!selectedDate || submittingRequest}
                  className="h-10 w-full rounded-full bg-[#2E7D5B] px-5 text-sm font-semibold text-white hover:bg-[#256B4D] disabled:opacity-50 sm:h-9 sm:max-w-xs sm:self-start"
                >
                  {submittingRequest ? "Submitting…" : "Confirm Appointment Request"}
                </Button>
              </div>
            </div>
          ) : filteredHospitals.length > 0 ? (
            <p className="text-sm text-gray-500">
              {locale === "sl"
                ? "Izberite zdravstveni zavod za nadaljevanje."
                : "Choose a hospital to continue."}
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
                  {t.confirmRequestModalHospital}
                </p>
                <p className="font-semibold text-gray-900">{confirmRequestSummary.hospitalName}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  {t.confirmRequestModalEmail}
                </p>
                <p className="font-semibold text-gray-900">{confirmRequestSummary.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  {t.confirmRequestModalPreferredDate}
                </p>
                <p className="font-semibold text-gray-900">
                  {confirmRequestSummary.preferredDateLabel}
                </p>
              </div>
              <p className="rounded-lg bg-[#f6fbf8] px-3 py-2 text-gray-700">
                {confirmRequestSummary.notifyWhenAvailable
                  ? t.confirmRequestModalNotifyOn
                  : t.confirmRequestModalNotifyOff}
              </p>
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
