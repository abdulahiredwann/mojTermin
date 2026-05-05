import { useState, useRef } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FloatingChatDemo } from "@/components/FloatingChatDemo";
import { useLanguage } from "@/contexts/LanguageContext";

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

      <header className="w-full px-6 md:px-12 py-5 flex flex-wrap items-center justify-between gap-4">
        <MojTerminLogo />
        <LanguageToggle />
      </header>

      <section className="relative z-10">
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
              <HeroIllustration />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6 md:px-12">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16">{t.howTitle}</h2>

          <div className="grid gap-12 md:grid-cols-3">
            {[
              { title: t.step1Title, text: t.step1Body, img: "/Images/step-upload.png" },
              { title: t.step2Title, text: t.step2Body, img: "/Images/step-ai.png" },
              { title: t.step3Title, text: t.step3Body, img: "/Images/step-calendar.png" },
            ].map((step, i, arr) => (
              <div key={step.title} className="relative flex flex-col items-center text-center">
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
                <h3 className="mt-6 text-[1.35rem] font-bold leading-tight text-gray-900">{step.title}</h3>
                <p className="mt-2 max-w-[15rem] text-[0.96rem] leading-snug text-gray-500">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <HeartbeatDivider />

      <section className="bg-white py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <h2 className="text-center text-3xl md:text-4xl font-bold text-gray-900">{t.benefitsTitle}</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { title: t.benefit1Title, text: t.benefit1Body, img: "/Images/feature-clock.png" },
              { title: t.benefit2Title, text: t.benefit2Body, img: "/Images/feature-chip.png" },
              { title: t.benefit3Title, text: t.benefit3Body, img: "/Images/feature-leaf.png" },
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
                <h3 className="mt-5 text-[1.35rem] font-bold leading-tight text-gray-900">{feature.title}</h3>
                <p className="mt-2 text-[0.96rem] leading-snug text-gray-500">{feature.text}</p>
              </div>
            ))}
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
