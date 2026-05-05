import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

function MojTerminLogo() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2E7D5B]">
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
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
        className={cn(
          "rounded-full px-3 py-1.5 font-medium transition-colors",
          locale === "en" ? "bg-[#2E7D5B] text-white shadow-sm" : "text-gray-600 hover:text-gray-900",
        )}
      >
        {t.langEnglish}
      </button>
      <button
        type="button"
        onClick={() => setLocale("sl")}
        className={cn(
          "rounded-full px-3 py-1.5 font-medium transition-colors",
          locale === "sl" ? "bg-[#2E7D5B] text-white shadow-sm" : "text-gray-600 hover:text-gray-900",
        )}
      >
        {t.langSlovenian}
      </button>
    </div>
  );
}

type SiteHeaderProps = { borderBottom?: boolean };

export function SiteHeader({ borderBottom = true }: SiteHeaderProps) {
  const { t } = useLanguage();
  const { pathname } = useLocation();

  const navClass = (path: string) =>
    cn(
      "text-sm font-medium transition-colors",
      pathname === path ? "text-[#2E7D5B]" : "text-gray-600 hover:text-[#2E7D5B]",
    );

  return (
    <header className={cn("w-full px-6 py-5 md:px-12", borderBottom && "border-b border-gray-100")}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:items-center">
        <div className="md:justify-self-start">
          <Link to="/" className="inline-block">
            <MojTerminLogo />
          </Link>
        </div>
        <nav className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
          <Link to="/" className={navClass("/")}>
            {t.navHome}
          </Link>
          <Link to="/privacy" className={navClass("/privacy")}>
            {t.navPrivacy}
          </Link>
          <Link to="/about" className={navClass("/about")}>
            {t.navAbout}
          </Link>
          <Link to="/contact" className={navClass("/contact")}>
            {t.navContact}
          </Link>
        </nav>
        <div className="md:justify-self-end">
          <LanguageToggle />
        </div>
      </div>
    </header>
  );
}
