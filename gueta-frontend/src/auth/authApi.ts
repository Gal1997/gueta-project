export type AuthProvider = "password" | "google";

export interface User {
  id: string;
  email: string;
  name: string;
  provider: AuthProvider;
  onboarded: boolean;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

const API_BASE = "/api";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method ?? "GET",
    credentials: "include",
    headers: options.body ? { "Content-Type": "application/json" } : undefined,
    body: options.body,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      (data && typeof data.message === "string" && data.message) ||
      "Something went wrong. Please try again.";
    throw new ApiError(response.status, message);
  }

  return data as T;
}

export async function register(input: RegisterInput): Promise<User> {
  const { user } = await request<{ user: User }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return user;
}

export async function login(input: LoginInput): Promise<User> {
  const { user } = await request<{ user: User }>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return user;
}

export async function loginWithGoogle(accessToken: string): Promise<User> {
  const { user } = await request<{ user: User }>("/auth/google", {
    method: "POST",
    body: JSON.stringify({ accessToken }),
  });
  return user;
}

export async function logout(): Promise<void> {
  await request("/auth/logout", { method: "POST" });
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const { user } = await request<{ user: User }>("/auth/me");
    return user;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }
    throw error;
  }
}

export async function completeOnboarding(): Promise<User> {
  const { user } = await request<{ user: User }>("/auth/complete-onboarding", {
    method: "POST",
  });
  return user;
}
