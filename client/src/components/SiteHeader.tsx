import { useEffect, useState } from "react";
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
  const { locale, t } = useLanguage();
  const { pathname } = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const menuToggleLabel =
    locale === "sl" ? "Odpri navigacijski meni" : "Open navigation menu";
  const menuCloseLabel =
    locale === "sl" ? "Zapri navigacijski meni" : "Close navigation menu";
  const menuTitle = locale === "sl" ? "Meni" : "Menu";

  const navClass = (path: string) =>
    cn(
      "text-sm font-medium transition-colors",
      pathname === path ? "text-[#2E7D5B]" : "text-gray-600 hover:text-[#2E7D5B]",
    );

  return (
    <header className={cn("w-full px-6 py-5 md:px-12", borderBottom && "border-b border-gray-100")}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link to="/" className="inline-block">
            <MojTerminLogo />
          </Link>
        </div>
        <nav className="hidden items-center justify-center gap-8 md:flex">
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
        <div className="hidden md:block">
          <LanguageToggle />
        </div>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:text-[#2E7D5B] md:hidden"
          aria-label={menuToggleLabel}
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 7H20" strokeLinecap="round" />
            <path d="M4 12H20" strokeLinecap="round" />
            <path d="M4 17H20" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label={menuTitle}>
          <button
            type="button"
            className="absolute inset-0 bg-black/35"
            onClick={() => setMobileMenuOpen(false)}
            aria-label={menuCloseLabel}
          />
          <aside className="absolute right-0 top-0 flex h-full w-[86vw] max-w-[360px] flex-col border-l border-gray-200 bg-white px-6 py-5 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-sm font-semibold uppercase tracking-wide text-gray-500">{menuTitle}</span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
                aria-label={menuCloseLabel}
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 6L18 18" strokeLinecap="round" />
                  <path d="M18 6L6 18" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <nav className="flex flex-col gap-1">
              <Link to="/" className={cn("rounded-lg px-3 py-3 text-base font-medium", navClass("/"))}>
                {t.navHome}
              </Link>
              <Link to="/privacy" className={cn("rounded-lg px-3 py-3 text-base font-medium", navClass("/privacy"))}>
                {t.navPrivacy}
              </Link>
              <Link to="/about" className={cn("rounded-lg px-3 py-3 text-base font-medium", navClass("/about"))}>
                {t.navAbout}
              </Link>
              <Link to="/contact" className={cn("rounded-lg px-3 py-3 text-base font-medium", navClass("/contact"))}>
                {t.navContact}
              </Link>
            </nav>

            <div className="mt-6 border-t border-gray-100 pt-6">
              <LanguageToggle />
            </div>
          </aside>
        </div>
      ) : null}
    </header>
  );
}
