import { useState, useRef } from "react";
import { Brain, CalendarCheck, Clock, Cpu, ImagePlus, Loader2, Shield, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FloatingChatDemo } from "@/components/FloatingChatDemo";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Locale } from "@/locales/landing";

function MojTerminLogo() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-10 h-10 rounded-full bg-[#2E7D5B] flex items-center justify-center">
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
          <path
            d="M12 2C8.5 2 3 5 3 12C3 17.5 8 22 12 22C16 22 21 17.5 21 12C21 5 15.5 2 12 2Z"
            fill="white"
            opacity="0.9"
          />
          <path d="M9 11H15M12 8V14" stroke="#2E7D5B" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <span className="text-xl font-bold text-[#2E7D5B]">MojTermin</span>
    </div>
  );
}

function LanguageToggle() {
  const { locale, setLocale, t } = useLanguage();
  return (
    <div
      className="inline-flex rounded-full border border-gray-200 bg-gray-50/80 p-1 text-sm shadow-sm"
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={`rounded-full px-3 py-1.5 font-medium transition-colors ${
          locale === "en" ? "bg-[#2E7D5B] text-white shadow-sm" : "text-gray-600 hover:text-gray-900"
        }`}
      >
        {t.langEnglish}
      </button>
      <button
        type="button"
        onClick={() => setLocale("sl")}
        className={`rounded-full px-3 py-1.5 font-medium transition-colors ${
          locale === "sl" ? "bg-[#2E7D5B] text-white shadow-sm" : "text-gray-600 hover:text-gray-900"
        }`}
      >
        {t.langSlovenian}
      </button>
    </div>
  );
}

function HeroIllustration({ locale }: { locale: Locale }) {
  const monthLabel =
    typeof Intl !== "undefined"
      ? new Date().toLocaleDateString(locale === "sl" ? "sl-SI" : "en-GB", {
          month: "long",
          year: "numeric",
        })
      : "2026";

  return (
    <div className="relative w-full max-w-md mx-auto">
      <svg viewBox="0 0 400 400" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M80 50 C150 20, 350 40, 370 120 C390 200, 380 300, 300 350 C220 400, 100 380, 60 300 C20 220, 10 80, 80 50Z"
          fill="#2E7D5B"
          opacity="0.12"
        />
        <path
          d="M100 80 C160 50, 330 60, 350 130 C370 200, 360 280, 290 330 C220 380, 120 360, 80 290 C40 220, 40 110, 100 80Z"
          fill="#2E7D5B"
          opacity="0.08"
        />

        <g transform="translate(120, 80)">
          <rect x="0" y="0" width="160" height="140" rx="16" fill="white" filter="drop-shadow(0 4px 12px rgba(0,0,0,0.08))" />
          <rect x="0" y="0" width="160" height="36" rx="16" fill="#2E7D5B" />
          <rect x="0" y="18" width="160" height="18" fill="#2E7D5B" />
          <text
            x="80"
            y="24"
            textAnchor="middle"
            fill="white"
            fontSize="11"
            fontWeight="600"
            fontFamily="Inter, sans-serif"
          >
            {monthLabel}
          </text>
          {(locale === "sl" ? ["P", "T", "S", "Č", "P", "S", "N"] : ["M", "T", "W", "T", "F", "S", "S"]).map(
            (d, i) => (
              <text
                key={`day-${i}`}
                x={18 + i * 20}
                y="56"
                textAnchor="middle"
                fill="#999"
                fontSize="8"
                fontFamily="Inter, sans-serif"
              >
                {d}
              </text>
            ),
          )}
          {Array.from({ length: 28 }, (_, i) => {
            const row = Math.floor(i / 7);
            const col = i % 7;
            const isHighlighted = i === 10;
            return (
              <g key={`cal-${i}`}>
                {isHighlighted && <circle cx={18 + col * 20} cy={74 + row * 18} r="8" fill="#2E7D5B" />}
                <text
                  x={18 + col * 20}
                  y={77 + row * 18}
                  textAnchor="middle"
                  fill={isHighlighted ? "white" : "#333"}
                  fontSize="8"
                  fontFamily="Inter, sans-serif"
                >
                  {i + 1}
                </text>
              </g>
            );
          })}
        </g>

        <g transform="translate(290, 60)">
          <circle cx="35" cy="35" r="35" fill="white" filter="drop-shadow(0 4px 12px rgba(0,0,0,0.08))" />
          <circle cx="35" cy="35" r="28" fill="none" stroke="#2E7D5B" strokeWidth="2" />
          <line x1="35" y1="35" x2="35" y2="18" stroke="#2E7D5B" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="35" y1="35" x2="48" y2="35" stroke="#2E7D5B" strokeWidth="2" strokeLinecap="round" />
          <circle cx="35" cy="35" r="3" fill="#2E7D5B" />
        </g>

        <g transform="translate(60, 200)">
          <circle cx="35" cy="35" r="35" fill="white" filter="drop-shadow(0 4px 12px rgba(0,0,0,0.08))" />
          <path
            d="M25 20 L25 35 C25 42 30 48 38 48 C46 48 50 42 50 35 L50 30"
            stroke="#2E7D5B"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="38" cy="48" r="4" fill="#2E7D5B" opacity="0.3" />
          <circle cx="25" cy="18" r="4" fill="#2E7D5B" />
          <circle cx="50" cy="18" r="4" fill="#2E7D5B" />
        </g>

        <g transform="translate(280, 230)">
          <circle cx="30" cy="30" r="30" fill="white" filter="drop-shadow(0 4px 12px rgba(0,0,0,0.08))" />
          <circle cx="30" cy="30" r="20" fill="#2E7D5B" opacity="0.15" />
          <path
            d="M21 30 L27 36 L39 24"
            stroke="#2E7D5B"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </g>

        <circle cx="180" cy="300" r="4" fill="#2E7D5B" opacity="0.2" />
        <circle cx="320" cy="180" r="3" fill="#2E7D5B" opacity="0.15" />
        <circle cx="100" cy="140" r="3" fill="#2E7D5B" opacity="0.2" />
      </svg>
    </div>
  );
}

function HeartbeatDivider() {
  return (
    <div className="w-full overflow-hidden py-8">
      <svg viewBox="0 0 1200 100" className="w-full h-16" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M0 50 L200 50 L250 50 L280 50 L310 20 L340 80 L370 10 L400 70 L430 30 L460 50 L500 50 L1200 50"
          stroke="#2E7D5B"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.4"
        />
        <path
          d="M0 50 L350 50 L380 50 L410 25 L440 75 L470 15 L500 65 L530 35 L560 50 L600 50 L1200 50"
          stroke="#2E7D5B"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.25"
        />
      </svg>
    </div>
  );
}

function StepIcon({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-20 h-20 rounded-full bg-[#e8f5ee] flex items-center justify-center mx-auto mb-5">{children}</div>
  );
}

function BenefitIcon({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-12 h-12 rounded-full bg-[#e8f5ee] flex items-center justify-center flex-shrink-0">{children}</div>
  );
}

export default function LandingPage() {
  const { locale, t } = useLanguage();
  const [problem, setProblem] = useState("");
  const [referralFile, setReferralFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setShowResults(false);
    await new Promise((r) => setTimeout(r, 1400));
    setShowResults(true);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="w-full px-6 md:px-12 py-5 flex flex-wrap items-center justify-between gap-4">
        <MojTerminLogo />
        <LanguageToggle />
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full pointer-events-none">
          <svg viewBox="0 0 600 700" className="absolute top-0 right-0 h-full w-auto" fill="none" preserveAspectRatio="xMaxYMid slice">
            <path d="M200 0 C400 0, 600 100, 600 250 C600 400, 500 500, 600 700 L600 700 L600 0Z" fill="#2E7D5B" opacity="0.06" />
            <path d="M300 0 C450 50, 550 150, 580 300 C600 400, 550 550, 600 700 L600 700 L600 0Z" fill="#2E7D5B" opacity="0.04" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-20">
          <div className="grid md:grid-cols-2 gap-10 items-start">
            <div className="relative z-10 space-y-8">
              <div>
                <h1 className="text-4xl md:text-5xl lg:text-[3.4rem] font-extrabold leading-[1.12] text-gray-900 mb-4">
                  {t.heroTitle}
                </h1>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed max-w-lg">{t.heroSubtitle}</p>
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
                        referralFile ? "border-[#2E7D5B] bg-[#e8f5ee] text-[#2E7D5B]" : "text-gray-500 hover:text-[#2E7D5B]"
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

              {showResults ? (
                <div className="max-w-lg space-y-4 rounded-2xl border border-[#2E7D5B]/15 bg-[#f6fbf8] p-6">
                  <h2 className="text-lg font-bold text-gray-900">{t.resultsTitle}</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t.resultsMockNote}</p>
                  <ul className="space-y-3">
                    {t.mockSlots.map((slot) => (
                      <li
                        key={slot.provider}
                        className="rounded-xl border border-white bg-white p-4 shadow-sm"
                      >
                        <p className="font-semibold text-gray-900">{slot.provider}</p>
                        <p className="mt-2 text-sm text-gray-600">
                          <span className="font-medium text-[#2E7D5B]">{t.resultWaitLabel}:</span> {slot.wait}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium text-[#2E7D5B]">{t.resultNextLabel}:</span> {slot.next}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>

            <div className="relative z-10 hidden md:block md:sticky md:top-24">
              <HeroIllustration locale={locale} />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6 md:px-12">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16">{t.howTitle}</h2>

          <div className="grid md:grid-cols-3 gap-10 text-center">
            <div>
              <StepIcon>
                <Brain className="w-9 h-9 text-[#2E7D5B]" />
              </StepIcon>
              <h3 className="text-lg font-bold text-gray-900 mb-3">{t.step1Title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{t.step1Body}</p>
            </div>

            <div>
              <StepIcon>
                <Cpu className="w-9 h-9 text-[#2E7D5B]" />
              </StepIcon>
              <h3 className="text-lg font-bold text-gray-900 mb-3">{t.step2Title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{t.step2Body}</p>
            </div>

            <div>
              <StepIcon>
                <CalendarCheck className="w-9 h-9 text-[#2E7D5B]" />
              </StepIcon>
              <h3 className="text-lg font-bold text-gray-900 mb-3">{t.step3Title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{t.step3Body}</p>
            </div>
          </div>
        </div>
      </section>

      <HeartbeatDivider />

      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-12">{t.benefitsTitle}</h2>

          <div className="space-y-8">
            <div className="flex items-start gap-5">
              <BenefitIcon>
                <Clock className="w-6 h-6 text-[#2E7D5B]" />
              </BenefitIcon>
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-1">{t.benefit1Title}</h3>
                <p className="text-gray-500 text-sm">{t.benefit1Body}</p>
              </div>
            </div>

            <div className="flex items-start gap-5">
              <BenefitIcon>
                <Shield className="w-6 h-6 text-[#2E7D5B]" />
              </BenefitIcon>
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-1">{t.benefit2Title}</h3>
                <p className="text-gray-500 text-sm">{t.benefit2Body}</p>
              </div>
            </div>

            <div className="flex items-start gap-5">
              <BenefitIcon>
                <ThumbsUp className="w-6 h-6 text-[#2E7D5B]" />
              </BenefitIcon>
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-1">{t.benefit3Title}</h3>
                <p className="text-gray-500 text-sm">{t.benefit3Body}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-100 py-10">
        <div className="max-w-5xl mx-auto px-6 md:px-12 text-center">
          <nav className="flex flex-wrap justify-center gap-8 mb-6">
            <a href="#" className="text-sm text-gray-500 hover:text-[#2E7D5B] transition-colors">
              {t.footerAbout}
            </a>
            <a href="#" className="text-sm text-gray-500 hover:text-[#2E7D5B] transition-colors">
              {t.footerTerms}
            </a>
            <a href="#" className="text-sm text-gray-500 hover:text-[#2E7D5B] transition-colors">
              {t.footerPrivacy}
            </a>
            <a href="#" className="text-sm text-gray-500 hover:text-[#2E7D5B] transition-colors">
              {t.footerContact}
            </a>
          </nav>
          <p className="text-xs text-gray-400">{t.footerCopyright}</p>
        </div>
      </footer>

      <FloatingChatDemo />
    </div>
  );
}
