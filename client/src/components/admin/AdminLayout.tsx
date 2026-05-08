import { Building2, CalendarDays, ChevronLeft, ChevronRight, Settings, Users } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

const menuItems = [
  { to: "/admin/users", label: "User list", icon: Users },
  { to: "/admin/appointments", label: "Appointment lists", icon: CalendarDays },
  { to: "/admin/hospitals", label: "Hospitals", icon: Building2 },
  { to: "/admin/settings", label: "Setting", icon: Settings },
];

export function AdminLayout() {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="flex h-screen min-h-0 flex-col overflow-hidden bg-gray-50">
      <div className="flex min-h-0 flex-1">
        <aside
          className={cn(
            "flex h-full min-h-0 shrink-0 flex-col overflow-hidden border-r border-gray-200 bg-white p-4 transition-all duration-200",
            collapsed ? "w-20" : "w-72"
          )}
        >
          <div className="shrink-0">
            <div className={cn("mb-3 flex items-center", collapsed ? "justify-center" : "justify-between")}>
              <Link to="/admin/users" className="text-xl font-bold text-[#2E7D5B]">
                {collapsed ? "MT" : "MojTermin Admin"}
              </Link>
              <button
                type="button"
                onClick={() => setCollapsed((prev) => !prev)}
                className={cn(
                  "rounded-md border border-gray-200 p-1.5 text-gray-600 hover:bg-gray-100",
                  collapsed && "hidden"
                )}
                aria-label="Collapse sidebar"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>

            {collapsed ? (
              <button
                type="button"
                onClick={() => setCollapsed(false)}
                className="mb-3 mx-auto block rounded-md border border-gray-200 p-1.5 text-gray-600 hover:bg-gray-100"
                aria-label="Expand sidebar"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : null}

            {!collapsed ? <p className="mt-1 text-xs text-gray-500">{admin?.email}</p> : null}
          </div>

          <nav className="mt-6 min-h-0 flex-1 space-y-2 overflow-y-auto py-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center rounded-lg py-2 text-sm font-medium transition-colors",
                    collapsed ? "justify-center px-2" : "gap-2 px-3",
                    isActive
                      ? "bg-[#e8f5ee] text-[#2E7D5B]"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )
                }
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed ? item.label : null}
              </NavLink>
            ))}
          </nav>

          <button
            type="button"
            onClick={handleLogout}
            className={cn(
              "mt-auto shrink-0 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100",
              collapsed ? "mx-auto w-10 px-0" : "w-full px-3"
            )}
            title={collapsed ? "Logout" : undefined}
          >
            {collapsed ? "↪" : "Logout"}
          </button>
        </aside>

        <main className="min-h-0 flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
