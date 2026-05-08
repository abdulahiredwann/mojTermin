import { useState, useRef, useMemo } from "react";
import { ImagePlus, Loader2, MapPin, Building2, Calendar, Search, Clock } from "lucide-react";
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
import { FloatingChatDemo } from "@/components/FloatingChatDemo";
import { SiteHeader } from "@/components/SiteHeader";
import { useLanguage } from "@/contexts/LanguageContext";
import { api } from "@/lib/api";

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

type SearchResult = {
  intent: string;
  explanation: string;
  totalHospitals: number;
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
};

const ALL_CITIES_VALUE = "__ALL__";

export default function LandingPage() {
  const { t } = useLanguage();
  const [problem, setProblem] = useState("");
  const [referralFile, setReferralFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [selectedCity, setSelectedCity] = useState<string>(ALL_CITIES_VALUE);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestSavedId, setRequestSavedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter hospitals by selected city
  const filteredHospitals = useMemo(() => {
    if (!searchResult) return [];
    if (selectedCity === ALL_CITIES_VALUE) return searchResult.hospitals;
    return searchResult.hospitals.filter((h) => h.city === selectedCity);
  }, [searchResult, selectedCity]);

  // Get selected hospital details
  const selectedHospital = useMemo(() => {
    if (!selectedHospitalId || !searchResult) return null;
    return searchResult.hospitals.find((h) => h.id === selectedHospitalId) || null;
  }, [selectedHospitalId, searchResult]);

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const hasText = problem.trim().length > 0;
    const hasFile = referralFile !== null;
    if (!hasText && !hasFile) {
      setError(t.heroValidationNeedInput);
      return;
    }
    setLoading(true);
    setSearchResult(null);
    setSelectedCity(ALL_CITIES_VALUE);
    setSelectedHospitalId("");
    setSelectedDate("");
    setEmail("");
    setRequestSavedId(null);

    try {
      const { data } = await api.post<SearchResult>("/search", { query: problem });
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
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  async function handleConfirmRequest() {
    if (!searchResult || !selectedHospital || !selectedDate) return;
    setError(null);
    setSubmittingRequest(true);
    setRequestSavedId(null);
    try {
      const { data } = await api.post<{ request: { id: string } }>("/appointments", {
        email,
        query: problem,
        intent: searchResult.intent,
        city: selectedHospital.city,
        hospitalId: selectedHospital.id,
        hospitalName: selectedHospital.name,
        preferredDate: selectedDate,
      });
      setRequestSavedId(data.request.id);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        "Failed to submit appointment request.";
      setError(msg);
    } finally {
      setSubmittingRequest(false);
    }
  }

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
                <h1 className="text-4xl md:text-5xl lg:text-[3.4rem] font-extrabold leading-[1.12] text-gray-900 mb-4">
                  {t.heroTitle}
                </h1>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed max-w-lg">
                  {t.heroSubtitle}
                </p>
              </div>

              <form
                onSubmit={handleAnalyze}
                className="max-w-lg space-y-3 rounded-2xl border border-gray-100 bg-white/90 p-4 shadow-sm backdrop-blur-sm md:p-5"
              >
                <div className="space-y-1.5">
                  <Label htmlFor="problem" className="text-sm text-gray-700">
                    {t.labelProblem}
                  </Label>
                  <div className="relative flex gap-1">
                    <Input
                      id="problem"
                      name="problem"
                      autoComplete="off"
                      placeholder={t.placeholderProblem}
                      value={problem}
                      onChange={(e) => setProblem(e.target.value)}
                      maxLength={180}
                      className="h-11 flex-1 rounded-xl border-gray-200 pr-1 text-[15px] shadow-none focus-visible:ring-[#2E7D5B]/30"
                    />
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="sr-only"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f && !f.type.startsWith("image/")) {
                          setReferralFile(null);
                          return;
                        }
                        setReferralFile(f ?? null);
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      aria-label={t.attachImageAria}
                      title={t.attachImageAria}
                      onClick={() => fileInputRef.current?.click()}
                      className={`h-11 w-11 shrink-0 rounded-xl border-gray-200 ${
                        referralFile
                          ? "border-[#2E7D5B] bg-[#e8f5ee] text-[#2E7D5B]"
                          : "text-gray-500 hover:text-[#2E7D5B]"
                      }`}
                    >
                      <ImagePlus className="h-5 w-5" />
                    </Button>
                  </div>
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
                <div className="max-w-lg space-y-5 rounded-2xl border border-[#2E7D5B]/15 bg-[#f6fbf8] p-6">
                  {/* AI Understanding */}
                  <div className="space-y-2">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <Search className="h-5 w-5 text-[#2E7D5B]" />
                      {searchResult.intent}
                    </h2>
                    <p className="text-sm text-gray-600">{searchResult.explanation}</p>
                    <p className="text-xs text-gray-500">
                      Found {searchResult.totalHospitals} hospitals in {searchResult.cities.length} cities
                    </p>
                  </div>

                  {/* City Selection */}
                  {searchResult.cities.length > 0 && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <MapPin className="h-4 w-4 text-[#2E7D5B]" />
                        Select City
                      </Label>
                      <Select
                        value={selectedCity}
                        onValueChange={(value) => {
                          setSelectedCity(value);
                          setSelectedHospitalId(""); // Reset hospital when city changes
                        }}
                      >
                        <SelectTrigger className="h-11 rounded-xl border-gray-200 bg-white">
                          <SelectValue placeholder="Choose a city..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={ALL_CITIES_VALUE}>All cities</SelectItem>
                          {searchResult.cities.map((city) => (
                            <SelectItem key={city.name} value={city.name}>
                              {city.name} ({city.hospitalCount} hospitals)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Hospital Selection */}
                  {filteredHospitals.length > 0 && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Building2 className="h-4 w-4 text-[#2E7D5B]" />
                        Select Hospital
                      </Label>
                      <Select
                        value={selectedHospitalId}
                        onValueChange={setSelectedHospitalId}
                      >
                        <SelectTrigger className="h-11 rounded-xl border-gray-200 bg-white">
                          <SelectValue placeholder="Choose a hospital..." />
                        </SelectTrigger>
                        <SelectContent className="max-h-72">
                          {filteredHospitals.map((hospital) => (
                            <SelectItem key={hospital.id} value={hospital.id}>
                              <div className="flex flex-col items-start">
                                <span className="font-medium">{hospital.name}</span>
                                <span className="text-xs text-gray-500">
                                  {hospital.city} • {hospital.services[0]?.specialty || "General"}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Selected Hospital Details */}
                  {selectedHospital && (
                    <div className="rounded-xl border border-white bg-white p-4 shadow-sm space-y-3">
                      <div>
                        <p className="font-semibold text-gray-900">{selectedHospital.name}</p>
                        <p className="text-sm text-gray-500">
                          {selectedHospital.address || selectedHospital.city}
                        </p>
                        {selectedHospital.phone && (
                          <p className="text-sm text-gray-500">{selectedHospital.phone}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-[#2E7D5B]" />
                        <span className="text-gray-600">
                          Average wait: {selectedHospital.averageWaitDays || "14"} days
                        </span>
                      </div>

                      {selectedHospital.services.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-gray-700">Available services:</p>
                          <div className="flex flex-wrap gap-1">
                            {selectedHospital.services.map((service) => (
                              <span
                                key={service.id}
                                className="inline-flex rounded-full bg-[#e8f5ee] px-2 py-0.5 text-xs text-[#2E7D5B]"
                              >
                                {service.specialty || service.procedureName || "General"}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Date Selection */}
                      <div className="space-y-2 pt-2 border-t border-gray-100">
                        <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <Calendar className="h-4 w-4 text-[#2E7D5B]" />
                          Preferred Appointment Date
                        </Label>
                        <input
                          type="date"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          min={new Date().toISOString().split("T")[0]}
                          className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-[#2E7D5B]/30"
                        />
                        {selectedHospital.averageWaitDays && (
                          <p className="text-xs text-gray-500">
                            Earliest available: {formatDate(getEarliestDate(selectedHospital.averageWaitDays))}
                          </p>
                        )}

                        <div className="space-y-2 pt-2">
                          <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            Email
                          </Label>
                          <Input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            inputMode="email"
                            autoComplete="email"
                            className="h-11 rounded-xl border-gray-200 bg-white text-[15px] shadow-none focus-visible:ring-[#2E7D5B]/30"
                          />
                          <p className="text-xs text-gray-500">
                            We’ll contact you later with confirmation and next steps.
                          </p>
                        </div>
                      </div>

                      {requestSavedId ? (
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                          Request submitted. We’ll contact you by email soon with confirmation and next steps.
                        </div>
                      ) : null}

                      {/* Confirm Button */}
                      <Button
                        type="button"
                        onClick={handleConfirmRequest}
                        disabled={!selectedDate || !email.trim() || submittingRequest}
                        className="w-full rounded-full bg-[#2E7D5B] py-5 text-sm font-semibold text-white hover:bg-[#256B4D] disabled:opacity-50"
                      >
                        {submittingRequest
                          ? "Submitting…"
                          : !selectedDate
                            ? "Select a date to continue"
                            : !email.trim()
                              ? "Enter your email to continue"
                              : "Confirm Appointment Request"}
                      </Button>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            <div className="relative z-10 hidden md:block md:sticky md:top-24">
              <HeroIllustration />
            </div>
          </div>
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

      <footer className="border-t border-gray-100 py-10">
        <div className="max-w-5xl mx-auto px-6 md:px-12 text-center">
          <nav className="flex flex-wrap justify-center gap-8 mb-6">
            <Link to="/about" className="text-sm text-gray-500 hover:text-[#2E7D5B] transition-colors">
              {t.footerAbout}
            </Link>
            <a href="#" className="text-sm text-gray-500 hover:text-[#2E7D5B] transition-colors">
              {t.footerTerms}
            </a>
            <Link to="/privacy" className="text-sm text-gray-500 hover:text-[#2E7D5B] transition-colors">
              {t.footerPrivacy}
            </Link>
            <Link to="/contact" className="text-sm text-gray-500 hover:text-[#2E7D5B] transition-colors">
              {t.footerContact}
            </Link>
          </nav>
          <p className="text-xs text-gray-400">{t.footerCopyright}</p>
        </div>
      </footer>

      <FloatingChatDemo />
    </div>
  );
}
