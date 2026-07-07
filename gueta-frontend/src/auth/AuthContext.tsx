import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import * as authApi from "./authApi";
import type { LoginInput, RegisterInput, User } from "./authApi";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  register: (input: RegisterInput) => Promise<User>;
  login: (input: LoginInput) => Promise<User>;
  loginWithGoogle: (accessToken: string) => Promise<User>;
  logout: () => Promise<void>;
  completeOnboarding: () => Promise<User>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    authApi
      .getCurrentUser()
      .then((current) => {
        if (active) setUser(current);
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const nextUser = await authApi.register(input);
    setUser(nextUser);
    return nextUser;
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    const nextUser = await authApi.login(input);
    setUser(nextUser);
    return nextUser;
  }, []);

  const loginWithGoogle = useCallback(async (accessToken: string) => {
    const nextUser = await authApi.loginWithGoogle(accessToken);
    setUser(nextUser);
    return nextUser;
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
  }, []);

  const completeOnboarding = useCallback(async () => {
    const nextUser = await authApi.completeOnboarding();
    setUser(nextUser);
    return nextUser;
  }, []);

  const value = useMemo(
    () => ({ user, loading, register, login, loginWithGoogle, logout, completeOnboarding }),
    [user, loading, register, login, loginWithGoogle, logout, completeOnboarding],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
