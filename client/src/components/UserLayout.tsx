import { useMemo, useState } from "react";
import {
  Bot,
  Building2,
  CalendarCheck,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
} from "lucide-react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUserAuth } from "@/contexts/UserAuthContext";
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

export function UserLayout() {
  const { t } = useLanguage();
  const { user, logout } = useUserAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const items = useMemo(
    () => [
      { to: "/user/dashboard", label: t.authDashboard, Icon: LayoutDashboard },
      { to: "/user/appointments", label: t.userNavMyAppointments, Icon: CalendarCheck },
      { to: "/user/hospitals", label: t.userNavHospitals, Icon: Building2 },
      { to: "/user/ai", label: t.userNavAi, Icon: Bot },
      { to: "/user/settings", label: t.authSettings, Icon: Settings },
    ],
    [t],
  );

  async function handleLogout() {
    setDrawerOpen(false);
    await logout();
    navigate("/", { replace: true });
  }

  function navLinkClass(isActive: boolean) {
    return cn(
      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
      isActive
        ? "bg-[#e8f5ee] text-[#2E7D5B]"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
    );
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#f0f4f2] md:h-[100dvh] md:flex-row md:overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden shrink-0 border-r border-gray-200 bg-white md:flex md:w-60 md:flex-col md:shadow-sm lg:w-64">
        <div className="flex shrink-0 flex-col gap-1 border-b border-gray-100 p-4">
          <Link to="/user/dashboard" className="text-lg font-bold text-[#2E7D5B]">
            MojTermin
          </Link>
          <span className="text-xs font-medium uppercase tracking-wide text-gray-400">{t.userAreaTagline}</span>
          {user ? (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-[#f6fbf8] p-2">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-[#2E7D5B] text-xs font-semibold text-white">
                  {userInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-gray-900">{user.name}</p>
                <p className="truncate text-[11px] text-gray-500">{user.email}</p>
              </div>
            </div>
          ) : null}
        </div>

        <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-3">
          {items.map(({ to, label, Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => navLinkClass(isActive)}>
              <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="shrink-0 space-y-1 border-t border-gray-100 p-3">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          >
            {t.userLayoutBackHome}
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-[18px] w-[18px] shrink-0" aria-hidden />
            {t.authLogout}
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex shrink-0 items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-3 md:hidden">
        <div className="min-w-0">
          <Link to="/user/dashboard" className="truncate text-lg font-bold text-[#2E7D5B]">
            MojTermin
          </Link>
          <p className="truncate text-[11px] text-gray-500">{t.userAreaTagline}</p>
        </div>
        <div className="flex items-center gap-1">
          <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 shadow-sm"
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <SheetContent side="left" className="flex w-[min(100vw-2rem,20rem)] flex-col gap-0 p-0">
              <SheetHeader className="border-b border-gray-100 p-4 text-left">
                <SheetTitle className="text-left text-[#2E7D5B]">MojTermin</SheetTitle>
                <p className="text-xs font-medium text-gray-500">{t.userAreaTagline}</p>
              </SheetHeader>
              <nav className="flex flex-col gap-1 p-3">
                {items.map(({ to, label, Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setDrawerOpen(false)}
                    className={({ isActive }) => cn(navLinkClass(isActive), "py-3")}
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0" />
                    {label}
                  </NavLink>
                ))}
              </nav>
              <div className="mt-auto space-y-1 border-t border-gray-100 p-3">
                <Link
                  to="/"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
                >
                  {t.userLayoutBackHome}
                </Link>
                <button
                  type="button"
                  onClick={() => void handleLogout()}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  {t.authLogout}
                </button>
              </div>
            </SheetContent>
          </Sheet>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D5B]/30"
                  aria-label={t.userMenuAria}
                >
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-[#2E7D5B] text-xs font-semibold text-white">
                      {userInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <span className="block truncate text-sm font-medium">{user.name}</span>
                  <span className="block truncate text-xs text-gray-500">{user.email}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/user/dashboard" className="cursor-pointer">
                    {t.authDashboard}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/user/settings" className="cursor-pointer">
                    {t.authSettings}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700"
                  onSelect={(e) => {
                    e.preventDefault();
                    void handleLogout();
                  }}
                >
                  {t.authLogout}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
      </header>

      {/* Main */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col md:overflow-hidden">
        <main className="min-h-0 flex-1 overflow-y-auto px-4 py-6 pb-[5.25rem] md:px-6 md:py-8 md:pb-8 lg:px-10">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-30 grid grid-cols-5 border-t border-gray-200 bg-white pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-4px_24px_-4px_rgba(0,0,0,0.08)] md:hidden"
        aria-label={t.userAreaTagline}
      >
        {items.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex min-h-[3rem] flex-col items-center justify-center gap-0.5 px-0.5 text-center",
                isActive ? "text-[#2E7D5B]" : "text-gray-500 hover:text-gray-800",
              )
            }
          >
            <Icon className={cn("h-5 w-5 shrink-0", pathname === to && "stroke-[2.5]")} />
            <span className="max-w-full truncate px-0.5 text-[10px] font-medium leading-tight sm:text-[11px]">
              {label}
            </span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
