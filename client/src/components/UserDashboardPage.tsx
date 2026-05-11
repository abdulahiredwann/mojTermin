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
  Search,
  Upload,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { api } from "@/lib/api";

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

type UserAppointmentsResponse = {
  stats: { total: number; byStatus: Record<string, number> };
  requests: unknown[];
};

export function UserDashboardPage() {
  const { t, locale } = useLanguage();
  const { user } = useUserAuth();
  const queryClient = useQueryClient();

  const [problem, setProblem] = useState("");
  const [referralFile, setReferralFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [selectedHospitalId, setSelectedHospitalId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestSavedId, setRequestSavedId] = useState<string | null>(null);

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
      const res = await api.get<UserAppointmentsResponse>("/user/appointments");
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
    setRequestSavedId(null);

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

  async function handleConfirmRequest() {
    if (!searchResult || !selectedHospital || !selectedDate || !user) return;
    setError(null);
    setSubmittingRequest(true);
    setRequestSavedId(null);
    try {
      const { data } = await api.post<{ request: { id: string } }>("/appointments", {
        query: problem,
        intent: searchResult.intent,
        city: selectedHospital.city,
        hospitalId: selectedHospital.id,
        hospitalName: selectedHospital.name,
        preferredDate: selectedDate,
      });
      setRequestSavedId(data.request.id);
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

  function referralFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setReferralFile(file ?? null);
  }

  return (
    <div className="relative mx-auto max-w-3xl">
      <div className="pointer-events-none absolute -right-8 top-0 z-0 hidden h-72 w-72 md:block">
        <svg viewBox="0 0 200 200" className="h-full w-full" fill="none">
          <circle cx="170" cy="40" r="120" fill="#2E7D5B" opacity="0.07" />
        </svg>
      </div>

      <div className="relative z-10 space-y-8">
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
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              {t.dashboardCardPending}
            </p>
            <p className="mt-1 text-2xl font-bold text-amber-700">{pendingCount}</p>
          </div>
          <div className="rounded-2xl border border-[#2E7D5B]/15 bg-white p-4 shadow-sm sm:col-span-1">
            <p className="text-xs font-medium uppercase tracking-wide text-[#2E7D5B]/80">
              {t.dashboardAccountEmail}
            </p>
            <p className="mt-1 truncate text-sm font-semibold text-gray-900">{user?.email}</p>
            <Link
              to="/user/appointments"
              className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[#2E7D5B] hover:underline"
            >
              {t.dashboardHistoryTitle}
              <ChevronRight className="h-3 w-3" aria-hidden />
            </Link>
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
                onChange={referralFileChange}
                className="h-11 cursor-pointer rounded-xl border border-gray-200 bg-white text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[#e8f5ee] file:px-3 file:py-2 file:text-sm file:font-medium file:text-[#2E7D5B]"
              />
              <p className="text-xs text-gray-500">{t.dashboardReferralPhotoHint}</p>
              {referralFile ? (
                <p className="text-xs text-gray-600">
                  Selected: <span className="font-medium">{referralFile.name}</span>
                </p>
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

          {searchResult ? (
            <div className="space-y-5 rounded-2xl border border-[#2E7D5B]/15 bg-[#f6fbf8] p-5 md:p-6">
              <div className="space-y-2">
                <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                  <Search className="h-5 w-5 text-[#2E7D5B]" />
                  {searchResult.intent}
                </h3>
                <p className="text-sm text-gray-600">{searchResult.explanation}</p>
              </div>

              {filteredHospitals.length > 0 && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Building2 className="h-4 w-4 text-[#2E7D5B]" />
                    {t.dashboardSelectHospital}
                  </Label>
                  <Select value={selectedHospitalId} onValueChange={setSelectedHospitalId}>
                    <SelectTrigger className="h-11 rounded-xl border-gray-200 bg-white">
                      <SelectValue placeholder="—" />
                    </SelectTrigger>
                    <SelectContent className="z-[100] max-h-72" position="popper" sideOffset={8}>
                      {filteredHospitals.map((hospital) => (
                        <SelectItem
                          key={hospital.id}
                          value={hospital.id}
                          className="mojtermin-green-option cursor-pointer rounded-lg text-gray-900"
                        >
                          <div className="flex flex-col items-start">
                            <span className="font-medium text-gray-900">{hospital.name}</span>
                            <span className="hospital-meta text-xs text-gray-500">
                              {hospital.city} • {hospital.services[0]?.specialty || "General"}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedHospital && (
                <div className="space-y-3 rounded-xl border border-white bg-white p-4 shadow-sm">
                  <div>
                    <p className="font-semibold text-gray-900">{selectedHospital.name}</p>
                    <p className="text-sm text-gray-500">
                      {selectedHospital.address || selectedHospital.city}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4 text-[#2E7D5B]" />
                    <span>Average wait: {selectedHospital.averageWaitDays ?? "—"} days</span>
                  </div>

                  <div className="space-y-2 border-t border-gray-100 pt-3">
                    <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Calendar className="h-4 w-4 text-[#2E7D5B]" />
                      {t.dashboardPreferredAppointmentDate}
                    </Label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-[#2E7D5B]/30"
                    />
                    {selectedHospital.averageWaitDays != null ? (
                      <p className="text-xs text-gray-500">
                        Earliest available:{" "}
                        {formatDay(getEarliestDate(selectedHospital.averageWaitDays))}
                      </p>
                    ) : null}
                    <p className="text-xs text-gray-500">{t.dashboardEmailNote}</p>
                  </div>

                  {requestSavedId ? (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                      Request submitted. We’ll be in touch by email.
                    </div>
                  ) : null}

                  <Button
                    type="button"
                    onClick={handleConfirmRequest}
                    disabled={!selectedDate || submittingRequest}
                    className="w-full rounded-full bg-[#2E7D5B] py-5 text-sm font-semibold text-white hover:bg-[#256B4D] disabled:opacity-50"
                  >
                    {submittingRequest ? "Submitting…" : "Confirm Appointment Request"}
                  </Button>
                </div>
              )}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
