import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

const menuItems = [
  { to: "/admin/users", label: "User list" },
  { to: "/admin/appointments", label: "Appointment lists" },
  { to: "/admin/hospitals", label: "Hospitals" },
  { to: "/admin/settings", label: "Setting" },
];

export function AdminLayout() {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen w-full">
        <aside className="flex w-72 flex-col border-r border-gray-200 bg-white p-6">
          <div>
            <Link to="/admin/users" className="text-xl font-bold text-[#2E7D5B]">
              MojTermin Admin
            </Link>
            <p className="mt-1 text-xs text-gray-500">{admin?.email}</p>

            <nav className="mt-8 space-y-2">
              {menuItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "block rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-[#e8f5ee] text-[#2E7D5B]"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-auto w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Logout
          </button>
        </aside>

        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
