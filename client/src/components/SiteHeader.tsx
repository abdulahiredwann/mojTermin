import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, LayoutDashboard, LogOut, Settings } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

function userInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const a = parts[0][0];
    const b = parts[parts.length - 1][0];
    if (a && b) return `${a}${b}`.toUpperCase();
  }
  const s = name.trim();
  if (s.length >= 2) return s.slice(0, 2).toUpperCase();
  if (s.length === 1) return s.toUpperCase();
  return "?";
}

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
  const { user, loading: userLoading, logout } = useUserAuth();
  const navigate = useNavigate();
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
        <div className="hidden items-center gap-3 md:flex">
          <LanguageToggle />
          {userLoading ? (
            <span className="text-sm text-gray-400">…</span>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex max-w-[min(100%,17rem)] items-center gap-2 rounded-full border border-gray-200 bg-white py-1 pl-1 pr-2.5 text-left shadow-sm outline-none transition hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-[#2E7D5B]/30"
                  aria-label={t.userMenuAria}
                >
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-[#2E7D5B] text-sm font-semibold text-white">
                      {userInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold leading-tight text-gray-900">{user.name}</p>
                    <p className="truncate text-xs leading-tight text-gray-500">{user.email}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56" collisionPadding={12}>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-0.5">
                    <span className="truncate text-sm font-medium text-gray-900">{user.name}</span>
                    <span className="truncate text-xs text-gray-500">{user.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    to="/user/dashboard"
                    className={cn(
                      "flex cursor-pointer items-center gap-2",
                      pathname === "/user/dashboard" && "bg-gray-50",
                    )}
                  >
                    <LayoutDashboard className="h-4 w-4 shrink-0 text-[#2E7D5B]" />
                    {t.authDashboard}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="/user/settings"
                    className={cn(
                      "flex cursor-pointer flex-col gap-0.5 py-2",
                      pathname === "/user/settings" && "bg-gray-50",
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <Settings className="h-4 w-4 shrink-0 text-[#2E7D5B]" />
                      <span>{t.authSettings}</span>
                    </span>
                    <span className="pl-6 text-xs font-normal text-gray-500">{t.comingSoon}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="flex cursor-pointer items-center gap-2 text-red-600 focus:bg-red-50 focus:text-red-700"
                  onSelect={(event) => {
                    event.preventDefault();
                    logout().finally(() => {
                      navigate("/");
                    });
                  }}
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  {t.authLogout}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-full px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:text-[#2E7D5B]"
              >
                {t.authLogin}
              </Link>
              <Link
                to="/signup"
                className="rounded-full bg-[#2E7D5B] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#256B4D]"
              >
                {t.authSignup}
              </Link>
            </>
          )}
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

            <div className="mt-auto flex flex-col gap-3 border-t border-gray-100 pt-6">
              {userLoading ? null : user ? (
                <>
                  <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-3">
                    <Avatar className="h-11 w-11">
                      <AvatarFallback className="bg-[#2E7D5B] text-sm font-semibold text-white">
                        {userInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-gray-900">{user.name}</p>
                      <p className="truncate text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <Link
                    to="/user/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex h-11 items-center gap-2 rounded-xl bg-[#2E7D5B] px-3 text-sm font-medium text-white transition-colors hover:bg-[#256B4D]"
                  >
                    <LayoutDashboard className="h-4 w-4 shrink-0" />
                    {t.authDashboard}
                  </Link>
                  <Link
                    to="/user/settings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex min-h-[2.75rem] flex-col justify-center gap-0.5 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-50"
                  >
                    <span className="flex items-center gap-2">
                      <Settings className="h-4 w-4 shrink-0 text-[#2E7D5B]" />
                      <span>{t.authSettings}</span>
                    </span>
                    <span className="pl-6 text-xs font-normal text-gray-500">{t.comingSoon}</span>
                  </Link>
                  <button
                    type="button"
                    onClick={async () => {
                      await logout();
                      setMobileMenuOpen(false);
                      navigate("/");
                    }}
                    className="flex h-11 items-center gap-2 rounded-xl border border-red-100 bg-red-50/80 px-3 text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4 shrink-0" />
                    {t.authLogout}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="flex h-11 items-center justify-center rounded-xl border border-gray-200 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    {t.authLogin}
                  </Link>
                  <Link
                    to="/signup"
                    className="flex h-11 items-center justify-center rounded-xl bg-[#2E7D5B] text-sm font-medium text-white transition-colors hover:bg-[#256B4D]"
                  >
                    {t.authSignup}
                  </Link>
                </>
              )}
            </div>
          </aside>
        </div>
      ) : null}
    </header>
  );
}
