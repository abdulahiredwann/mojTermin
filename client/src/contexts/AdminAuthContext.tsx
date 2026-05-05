import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { AxiosError } from "axios";
import { api } from "@/lib/api";

type AdminUser = {
  id: string;
  name: string;
  email: string;
};

type AdminAuthContextValue = {
  admin: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshMe = async () => {
    try {
      const { data } = await api.get<{ admin: AdminUser }>("/admin/auth/me");
      setAdmin(data.admin);
    } catch {
      setAdmin(null);
    }
  };

  useEffect(() => {
    refreshMe().finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data } = await api.post<{ admin: AdminUser }>("/admin/auth/login", {
        email,
        password,
      });
      setAdmin(data.admin);
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.error || "Login failed.");
      }
      throw new Error("Login failed.");
    }
  };

  const logout = async () => {
    await api.post("/admin/auth/logout").catch(() => undefined);
    setAdmin(null);
  };

  const value = useMemo(
    () => ({ admin, loading, login, logout, refreshMe }),
    [admin, loading]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return ctx;
}
