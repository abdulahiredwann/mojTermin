import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AxiosError } from "axios";
import { api } from "@/lib/api";

export type AppUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
};

type RegisterPayload = {
  name: string;
  email: string;
  phone?: string;
  password: string;
};

type UserAuthContextValue = {
  user: AppUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
};

const UserAuthContext = createContext<UserAuthContextValue | null>(null);

export function UserAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshMe = useCallback(async () => {
    try {
      const { data } = await api.get<{ user: AppUser }>("/auth/me");
      setUser(data.user);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refreshMe().finally(() => setLoading(false));
  }, [refreshMe]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const { data } = await api.post<{ user: AppUser }>("/auth/login", {
        email,
        password,
      });
      setUser(data.user);
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.error || "Login failed.");
      }
      throw new Error("Login failed.");
    }
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    try {
      const { data } = await api.post<{ user: AppUser }>("/auth/register", payload);
      setUser(data.user);
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.error || "Could not create account.");
      }
      throw new Error("Could not create account.");
    }
  }, []);

  const logout = useCallback(async () => {
    await api.post("/auth/logout").catch(() => undefined);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refreshMe }),
    [user, loading, login, register, logout, refreshMe],
  );

  return <UserAuthContext.Provider value={value}>{children}</UserAuthContext.Provider>;
}

export function useUserAuth() {
  const ctx = useContext(UserAuthContext);
  if (!ctx) {
    throw new Error("useUserAuth must be used within UserAuthProvider");
  }
  return ctx;
}
