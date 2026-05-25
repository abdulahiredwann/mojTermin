import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronDown,
  Loader2,
  MapPin,
  Building2,
  Calendar,
  Search,
  Clock,
  Phone,
  CheckCircle2,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FloatingChatDemo } from "@/components/FloatingChatDemo";
import { SiteHeader } from "@/components/SiteHeader";
import { PricingSection } from "@/components/PricingSection";
import { SiteBottom } from "@/components/app";
import {
  MAX_SEARCH_REFERRAL_IMAGES,
  ReferralImageUploadField,
} from "@/components/ReferralImageUploadField";
import { TrackingNotificationOptions } from "@/components/TrackingNotificationOptions";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { api } from "@/lib/api";
import { showApiError } from "@/lib/apiError";
import { savePendingRequest } from "@/lib/pendingRequest";
import { cn } from "@/lib/utils";

const HERO_KEYWORD_INTERVAL_MS = 3200;

function HeroRotatingKeyword({ words }: { words: readonly [string, string] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % words.length);
    }, HERO_KEYWORD_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [words]);

  const minCh = Math.max(...words.map((w) => w.length));

  return (
    <span
      className="relative inline-grid align-bottom text-gray-900"
      style={{ minWidth: `${minCh}ch` }}
      aria-live="polite"
    >
      {words.map((word, i) => (
        <span
          key={word}
          className={cn(
            "col-start-1 row-start-1 inline-block transition-all duration-700 ease-in-out",
            i === index
              ? "translate-y-0 opacity-100"
              : "pointer-events-none translate-y-[0.4em] opacity-0 select-none",
          )}
          aria-hidden={i !== index}
        >
          {word}
        </span>
      ))}
    </span>
  );
}

function HeroIllustration() {
  return (
    <div className="relative w-full max-w-md mx-auto">
      <img
        src="/Images/hero-illustration.png"
        alt="MojTermin hero illustration"
        className="w-full h-auto object-contain"
      />
    </div>
  );
}

type SlovenianLocation = {
  city: string;
  region: string;
};

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
  cities: Array<{
    name: string;
    country: string;
    hospitalCount: number;
  }>;
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
  hospitalName: string;
  email: string;
  preferredDateLabel: string;
  notifyEmail: boolean;
  notifyFasterRefresh: boolean;
  notifySms: boolean;
};

function hospitalEstimatedWaitDays(hospital: SearchResult["hospitals"][number]): number | null {
  if (hospital.averageWaitDays != null) return hospital.averageWaitDays;
  const fromService = hospital.services.find((s) => s.estimatedWaitDays != null)?.estimatedWaitDays;
  return fromService ?? null;
}

export default function LandingPage() {
  const { t, locale } = useLanguage();
  const { user } = useUserAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.email) setEmail(user.email);
  }, [user?.email]);

  useEffect(() => {
    if (location.hash !== "#pricing") return;
    const el = document.getElementById("pricing");
    if (!el) return;
    const timer = window.setTimeout(() => {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
    return () => window.clearTimeout(timer);
  }, [location.pathname, location.hash]);
  const [problem, setProblem] = useState("");
  const [referralFiles, setReferralFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [email, setEmail] = useState<string>("");
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

  const { data: locations = [] } = useQuery({
    queryKey: ["slovenian-locations"],
    queryFn: async () => {
      const res = await api.get<{ locations: SlovenianLocation[] }>("/search/locations");
      return res.data.locations;
    },
    staleTime: 1000 * 60 * 60 * 24,
  });

  const filteredHospitals = useMemo(() => {
    if (!searchResult) return [];
    return searchResult.hospitals;
  }, [searchResult]);

  // Get selected hospital details
  const selectedHospital = useMemo(() => {
    if (!selectedHospitalId || !searchResult) return null;
    return searchResult.hospitals.find((h) => h.id === selectedHospitalId) || null;
  }, [selectedHospitalId, searchResult]);

  function buildSearchQuery(): string {
    const text = problem.trim();
    if (text) return text;
    if (referralFiles.length > 0) return "Referral from uploaded image";
    return "";
  }

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const hasImages = referralFiles.length > 0;
    const hasText = problem.trim().length > 0;

    // City is always required
    if (!selectedLocation) {
      setError(t.heroValidationPickCity);
      return;
    }

    // If no images uploaded, "What do you need?" is required
    if (!hasImages && !hasText) {
      setError(t.heroValidationNeedInput);
      return;
    }

    const searchQuery = buildSearchQuery();
    setLoading(true);
    setSearchResult(null);
    setSelectedHospitalId("");
    setSelectedDate("");
    setEmail("");
    setNotifyEmail(true);
    setNotifyFasterRefresh(false);
    setNotifySms(false);

    try {
      const searchFiles = referralFiles.slice(0, MAX_SEARCH_REFERRAL_IMAGES);
      let data: SearchResult;
      if (searchFiles.length > 0) {
        const fd = new FormData();
        fd.append("query", searchQuery);
        fd.append("city", selectedLocation.city);
        for (const f of searchFiles) {
          fd.append("referralImages", f);
        }
        const res = await api.post<SearchResult>("/search", fd);
        data = res.data;
      } else {
        const res = await api.post<SearchResult>("/search", {
          query: searchQuery,
          city: selectedLocation.city,
        });
        data = res.data;
      }
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

  // Calculate earliest available date based on hospital wait days
  const getEarliestDate = (waitDays: number | null) => {
    if (!waitDays) return new Date();
    const date = new Date();
    date.setDate(date.getDate() + waitDays);
    return date;
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString(locale === "sl" ? "sl-SI" : "en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  function resetHeroAvailabilitySection() {
    setSearchResult(null);
    setSelectedHospitalId("");
    setSelectedDate("");
    setEmail("");
    setNotifyEmail(true);
    setNotifyFasterRefresh(false);
    setNotifySms(false);
    setReferralFiles([]);
  }

  function handleConfirmDialogOpenChange(open: boolean) {
    setConfirmRequestOpen(open);
    if (!open) {
      setConfirmRequestSummary(null);
      resetHeroAvailabilitySection();
    }
  }

  async function handleConfirmRequest() {
    if (!searchResult || !selectedHospital || !selectedDate) return;

    const requestEmail = email.trim();
    if (!requestEmail) {
      setError(locale === "sl" ? "Vnesite e-pošto." : "Please enter your email.");
      return;
    }

    // If not logged in, save request and redirect to signup
    if (!user) {
      savePendingRequest({
        email: requestEmail,
        query: problem.trim() || searchResult.intent,
        intent: searchResult.intent,
        city: selectedHospital.city,
        hospitalId: selectedHospital.id,
        hospitalName: selectedHospital.name,
        preferredDate: selectedDate,
        notifyEmail,
      });
      navigate("/signup");
      return;
    }

    setError(null);
    setSubmittingRequest(true);
    const preferredDateLabel = formatDate(new Date(`${selectedDate}T12:00:00`));
    try {
      const payload = {
        email: requestEmail,
        query: problem.trim() || searchResult.intent,
        intent: searchResult.intent,
        city: selectedHospital.city,
        hospitalId: selectedHospital.id,
        hospitalName: selectedHospital.name,
        preferredDate: selectedDate,
        notifyEmail,
        notifyFasterRefresh: false,
        notifySms: false,
      };
      if (referralFiles.length > 0) {
        const fd = new FormData();
        for (const [key, value] of Object.entries(payload)) {
          if (value != null) fd.append(key, String(value));
        }
        for (const file of referralFiles) {
          fd.append("referralImages", file);
        }
        await api.post<{ request: { id: string } }>("/appointments", fd);
      } else {
        await api.post<{ request: { id: string } }>("/appointments", payload);
      }
      setConfirmRequestSummary({
        hospitalName: selectedHospital.name,
        email: requestEmail,
        preferredDateLabel,
        notifyEmail,
        notifyFasterRefresh: false,
        notifySms: false,
      });
      setConfirmRequestOpen(true);
    } catch (err: unknown) {
      setError(showApiError(err, "Failed to submit appointment request."));
    } finally {
      setSubmittingRequest(false);
    }
  }

  const checkAvailabilityButton = (
    <Button
      type="submit"
      disabled={loading}
      className="w-full rounded-full bg-[#2E7D5B] py-3 text-sm font-semibold text-white shadow-md shadow-[#2E7D5B]/15 hover:bg-[#256B4D] md:text-base"
    >
      {loading ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          {referralFiles.length > 0 ? t.analyzeStatusReadingImages : t.analyzing}
        </>
      ) : (
        t.analyzeButton
      )}
    </Button>
  );

  return (
    <div className="relative min-h-screen bg-white overflow-hidden">
      <div className="absolute top-0 right-0 w-1/2 h-[44rem] pointer-events-none z-0">
        <svg
          viewBox="0 0 600 700"
          className="absolute top-0 right-0 h-full w-auto"
          fill="none"
          preserveAspectRatio="xMaxYMin slice"
        >
          <path
            d="M200 0 C400 0, 600 100, 600 250 C600 400, 500 500, 600 700 L600 700 L600 0Z"
            fill="#2E7D5B"
            opacity="0.06"
          />
          <path
            d="M300 0 C450 50, 550 150, 580 300 C600 400, 550 550, 600 700 L600 700 L600 0Z"
            fill="#2E7D5B"
            opacity="0.04"
          />
        </svg>
      </div>

      <SiteHeader borderBottom={false} />

      <section id="home" className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-20">
          <div className="grid md:grid-cols-2 gap-10 items-start">
            <div className="relative z-10 space-y-8">
              <div>
                <h1 className="mb-4 text-4xl font-extrabold leading-[1.12] text-[#2E7D5B] md:text-5xl lg:text-[3.4rem]">
                  {t.heroTitlePrefix}{" "}
                  <HeroRotatingKeyword words={t.heroTitleKeywords} />{" "}
                  {t.heroTitleSuffix}
                </h1>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed max-w-lg">
                  {t.heroSubtitle}
                </p>
              </div>

              <form
                onSubmit={handleAnalyze}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => e.preventDefault()}
                className="max-w-lg space-y-3 rounded-2xl border border-gray-100 bg-white/90 p-4 shadow-sm backdrop-blur-sm md:p-5"
              >
                <ReferralImageUploadField
                  id="landing-referral-images"
                  variant="dropzone"
                  files={referralFiles}
                  onFilesChange={setReferralFiles}
                  actionWhenHasFiles={referralFiles.length > 0 ? checkAvailabilityButton : undefined}
                  labels={{
                    label: t.heroReferralPhoto,
                    dropzoneCta: t.heroReferralDropzoneCta,
                    dropzoneDrag: t.heroReferralDropzoneDrag,
                    photosAdded: t.heroReferralPhotosAdded,
                    removeFromListAria: t.dashboardReferralRemoveFromListAria,
                    searchLimitNote: t.heroReferralSearchLimitNote,
                  }}
                />

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
                          {selectedLocation ? selectedLocation.city : "Choose your city"}
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
                                  setError(null);
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
                    <p className="text-xs text-gray-500">
                      Region: <span className="font-medium text-gray-700">{selectedLocation.region}</span>
                    </p>
                  ) : null}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="problem" className="text-sm text-gray-700">
                    {referralFiles.length > 0 ? t.labelProblemOptional : t.labelProblem}
                  </Label>
                  <Input
                    id="problem"
                    name="problem"
                    autoComplete="off"
                    placeholder={t.placeholderProblem}
                    value={problem}
                    onChange={(e) => setProblem(e.target.value)}
                    maxLength={180}
                    className="h-11 w-full rounded-xl border-gray-200 text-[15px] shadow-none focus-visible:ring-[#2E7D5B]/30"
                  />
                </div>

                {error ? (
                  <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                  </p>
                ) : null}

                {checkAvailabilityButton}
              </form>
            </div>

            <div className="relative z-10 hidden md:block md:sticky md:top-24">
              <HeroIllustration />
            </div>
          </div>

          {searchResult ? (
            <div className="mt-12 w-full space-y-5 rounded-2xl border border-[#2E7D5B]/15 bg-[#f6fbf8] p-6 md:mt-14 md:p-8">
              <div className="space-y-2">
                <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 md:text-xl">
                  <Search className="h-5 w-5 shrink-0 text-[#2E7D5B]" />
                  {searchResult.intent}
                </h2>
                <p className="text-sm text-gray-600 md:text-base">{searchResult.explanation}</p>
                <p className="text-xs text-gray-500">
                  {searchResult.filterCity
                    ? `Found ${searchResult.totalHospitals} hospital${searchResult.totalHospitals === 1 ? "" : "s"} in ${searchResult.filterCity}.`
                    : `Found ${searchResult.totalHospitals} hospital${searchResult.totalHospitals === 1 ? "" : "s"} in ${searchResult.cities.length} cities.`}
                </p>
              </div>

              {filteredHospitals.length > 0 ? (
                <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Building2 className="h-4 w-4 text-[#2E7D5B]" />
                    Select Hospital
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
                <div className="rounded-xl border border-white bg-white p-4 shadow-sm sm:p-5">
                  <div className="flex w-full max-w-md flex-col space-y-4">
                    <div className="border-b border-gray-100 pb-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Request
                      </p>
                      <p className="mt-1 text-sm leading-snug text-gray-600">
                        <span className="text-gray-500">at </span>
                        <span className="font-semibold text-gray-900">{selectedHospital.name}</span>
                      </p>
                    </div>

                    <div className="w-full max-w-[14rem] space-y-1.5">
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
                          {formatDate(
                            getEarliestDate(hospitalEstimatedWaitDays(selectedHospital)),
                          )}
                        </p>
                      ) : null}
                    </div>

                    <div className="space-y-1.5 border-t border-gray-100 pt-4">
                      <Label
                        htmlFor="landing-request-email"
                        className="text-xs font-medium text-gray-700 sm:text-sm"
                      >
                        Email
                      </Label>
                      <Input
                        id="landing-request-email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        inputMode="email"
                        autoComplete="email"
                        className="h-9 w-full max-w-sm rounded-lg border border-gray-200 bg-white text-sm shadow-none focus-visible:ring-[#2E7D5B]/25"
                      />
                    </div>

                    <TrackingNotificationOptions
                      isPro={false}
                      notifyEmail={notifyEmail}
                      onNotifyEmailChange={setNotifyEmail}
                      notifyFasterRefresh={notifyFasterRefresh}
                      onNotifyFasterRefreshChange={setNotifyFasterRefresh}
                      notifySms={notifySms}
                      onNotifySmsChange={setNotifySms}
                    />

                    {error && searchResult ? (
                      <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                        {error}
                      </p>
                    ) : null}

                    <Button
                      type="button"
                      onClick={handleConfirmRequest}
                      disabled={!selectedDate || !email.trim() || submittingRequest}
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
                    ? "Izberite zdravstveni zavod za nadaljevanje."
                    : "Choose a hospital to continue."}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6 md:px-12">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16">
            {t.howTitle}
          </h2>

          <div className="grid gap-12 md:grid-cols-3">
            {[
              {
                title: t.step1Title,
                text: t.step1Body,
                img: "/Images/step-upload.png",
              },
              {
                title: t.step2Title,
                text: t.step2Body,
                img: "/Images/step-ai.png",
              },
              {
                title: t.step3Title,
                text: t.step3Body,
                img: "/Images/step-calendar.png",
              },
            ].map((step, i, arr) => (
              <div
                key={step.title}
                className="relative flex flex-col items-center text-center"
              >
                <div className="flex h-40 w-40 items-center justify-center rounded-full bg-[#e8f5ee]">
                  <img
                    src={step.img}
                    alt=""
                    width={512}
                    height={512}
                    loading="lazy"
                    className="h-24 w-24 object-contain"
                  />
                </div>
                {i < arr.length - 1 ? (
                  <span
                    aria-hidden
                    className="absolute right-[-1.4rem] top-[4.4rem] hidden text-3xl leading-none text-[#2E7D5B]/45 md:block"
                  >
                    →
                  </span>
                ) : null}
                <h3 className="mt-6 text-[1.35rem] font-bold leading-tight text-gray-900">
                  {step.title}
                </h3>
                <p className="mt-2 max-w-[15rem] text-[0.96rem] leading-snug text-gray-500">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <h2 className="text-center text-3xl md:text-4xl font-bold text-gray-900">
            {t.benefitsTitle}
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                title: t.benefit1Title,
                text: t.benefit1Body,
                img: "/Images/feature-clock.png",
              },
              {
                title: t.benefit2Title,
                text: t.benefit2Body,
                img: "/Images/feature-chip.png",
              },
              {
                title: t.benefit3Title,
                text: t.benefit3Body,
                img: "/Images/feature-leaf.png",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-3xl bg-white px-8 py-10 text-center shadow-sm ring-1 ring-[#d7ebdc]"
              >
                <img
                  src={feature.img}
                  alt=""
                  width={512}
                  height={512}
                  loading="lazy"
                  className="mx-auto h-28 w-28 object-contain md:h-32 md:w-32"
                />
                <h3 className="mt-5 text-[1.35rem] font-bold leading-tight text-gray-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-[0.96rem] leading-snug text-gray-500">
                  {feature.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PricingSection />

      <SiteBottom />

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
              <div className="rounded-lg bg-[#f6fbf8] px-3 py-2 text-sm text-gray-700 space-y-1">
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

      <FloatingChatDemo />
    </div>
  );
}
