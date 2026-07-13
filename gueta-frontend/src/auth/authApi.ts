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

export type IncomeType = "salary" | "investments" | "other";
export type ExpenseKind = "debt" | "fixed" | "once";
export type ExpenseRecurrence = "recurring" | "once";
export type CapitalCurrency = "ILS" | "USD" | "EUR";

export interface SpendingCategory {
  id: string;
  name: string;
  color: string;
  isSystem: boolean;
  sortOrder: number;
}

export interface CategoryInput {
  name: string;
  color?: string;
}

export interface CategoryUpdate {
  name?: string;
  color?: string;
}

export interface IncomeInput {
  type: IncomeType;
  source: string;
  description: string;
  amount: number;
  currency?: CapitalCurrency;
}

export interface ExpenseInput {
  recurrence: ExpenseRecurrence;
  kind: ExpenseKind;
  categoryId: string;
  name: string;
  amount: number;
  currency?: CapitalCurrency;
  description: string;
  remainingPayments?: number;
  monthlyCharge?: number;
  billingDate: string;
}

export interface GoalInput {
  description: string;
  targetAmount: number;
  currency?: CapitalCurrency;
  targetDate: string;
}

export interface OnboardingInput {
  availableCash: AvailableCashInput[];
  investments: CapitalInvestmentInput[];
  futureMoney: FutureMoneyInput[];
  incomes: IncomeInput[];
  expenses: ExpenseInput[];
  goals: GoalInput[];
}

export async function submitOnboarding(input: OnboardingInput): Promise<User> {
  const { user } = await request<{ user: User }>("/onboarding", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return user;
}

export interface StoredIncome {
  id: string;
  type: IncomeType;
  source: string;
  description: string;
  amount: number;
  currency: CapitalCurrency;
}

export interface StoredExpense {
  id: string;
  recurrence: ExpenseRecurrence;
  kind: ExpenseKind;
  categoryId: string;
  category: SpendingCategory;
  name: string;
  amount: number;
  currency: CapitalCurrency;
  description: string;
  remainingPayments: number;
  totalPayments: number | null;
  monthlyCharge: number | null;
  billingDate: string;
}

export interface StoredGoal {
  id: string;
  description: string;
  targetAmount: number;
  currency: CapitalCurrency;
  targetDate: string;
}

export interface StoredCategoryAllocation {
  id: string;
  categoryId: string;
  category: SpendingCategory;
  amount: number;
  currency: CapitalCurrency;
}

export interface CategoryAllocationInput {
  categoryId: string;
  amount: number;
  currency?: CapitalCurrency;
}

export interface CategoryAllocationUpdate {
  categoryId?: string;
  amount?: number;
  currency?: CapitalCurrency;
}

export interface FinanceData {
  categories: SpendingCategory[];
  allocations: StoredCategoryAllocation[];
  incomes: StoredIncome[];
  expenses: StoredExpense[];
  goals: StoredGoal[];
  monthlySavings: number;
  accumulatedSavings: number;
  exchangeRates: ExchangeRates;
}

export async function getFinanceData(): Promise<FinanceData> {
  return request<FinanceData>("/finance");
}

export async function getCategories(): Promise<SpendingCategory[]> {
  const { categories } = await request<{ categories: SpendingCategory[] }>(
    "/categories",
  );
  return categories;
}

export async function createCategory(
  input: CategoryInput,
): Promise<SpendingCategory> {
  const { category } = await request<{ category: SpendingCategory }>(
    "/categories",
    { method: "POST", body: JSON.stringify(input) },
  );
  return category;
}

export async function updateCategory(
  id: string,
  input: CategoryUpdate,
): Promise<SpendingCategory> {
  const { category } = await request<{ category: SpendingCategory }>(
    `/categories/${id}`,
    { method: "PATCH", body: JSON.stringify(input) },
  );
  return category;
}

export async function deleteCategory(id: string): Promise<void> {
  await request(`/categories/${id}`, { method: "DELETE" });
}

export async function createIncome(input: IncomeInput): Promise<StoredIncome> {
  const { income } = await request<{ income: StoredIncome }>("/finance/incomes", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return income;
}

export async function updateIncome(
  id: string,
  input: IncomeInput,
): Promise<StoredIncome> {
  const { income } = await request<{ income: StoredIncome }>(
    `/finance/incomes/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );
  return income;
}

export async function deleteIncome(id: string): Promise<void> {
  await request(`/finance/incomes/${id}`, { method: "DELETE" });
}

export async function createExpense(input: ExpenseInput): Promise<StoredExpense> {
  const { expense } = await request<{ expense: StoredExpense }>(
    "/finance/expenses",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
  return expense;
}

export async function updateExpense(
  id: string,
  input: ExpenseInput,
): Promise<StoredExpense> {
  const { expense } = await request<{ expense: StoredExpense }>(
    `/finance/expenses/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );
  return expense;
}

export async function deleteExpense(id: string): Promise<void> {
  await request(`/finance/expenses/${id}`, { method: "DELETE" });
}

export async function createGoal(input: GoalInput): Promise<StoredGoal> {
  const { goal } = await request<{ goal: StoredGoal }>("/finance/goals", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return goal;
}

export async function updateGoal(
  id: string,
  input: GoalInput,
): Promise<StoredGoal> {
  const { goal } = await request<{ goal: StoredGoal }>(`/finance/goals/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return goal;
}

export async function deleteGoal(id: string): Promise<void> {
  await request(`/finance/goals/${id}`, { method: "DELETE" });
}

export async function createCategoryAllocation(
  input: CategoryAllocationInput,
): Promise<StoredCategoryAllocation> {
  const { allocation } = await request<{ allocation: StoredCategoryAllocation }>(
    "/finance/allocations",
    { method: "POST", body: JSON.stringify(input) },
  );
  return allocation;
}

export async function updateCategoryAllocation(
  id: string,
  input: CategoryAllocationUpdate,
): Promise<StoredCategoryAllocation> {
  const { allocation } = await request<{ allocation: StoredCategoryAllocation }>(
    `/finance/allocations/${id}`,
    { method: "PATCH", body: JSON.stringify(input) },
  );
  return allocation;
}

export async function deleteCategoryAllocation(id: string): Promise<void> {
  await request(`/finance/allocations/${id}`, { method: "DELETE" });
}

export type AvailableCashType =
  | "cash"
  | "checking"
  | "bit"
  | "paybox"
  | "daily_deposit"
  | "other";

export type CapitalInvestmentType =
  | "deposit"
  | "investments"
  | "pension_fund"
  | "real_estate"
  | "other";


export interface ExchangeRates {
  toIls: Record<CapitalCurrency, number>;
  source: "google" | "frankfurter";
  updatedAt: string;
}

export interface StoredAvailableCash {
  id: string;
  type: AvailableCashType;
  amount: number;
  currency: CapitalCurrency;
  description: string | null;
  updatedAt: string;
}

export interface StoredCapitalInvestment {
  id: string;
  type: CapitalInvestmentType;
  amount: number;
  principalAmount: number;
  currency: CapitalCurrency;
  url: string | null;
  description: string | null;
  updatedAt: string;
}

export interface StoredFutureMoney {
  id: string;
  description: string;
  amount: number;
  currency: CapitalCurrency;
  expectedPaymentDate: string | null;
  updatedAt: string;
}

export interface AvailableCashInput {
  type: AvailableCashType;
  amount: number;
  currency?: CapitalCurrency;
  description?: string | null;
}

export interface CapitalInvestmentInput {
  type: CapitalInvestmentType;
  amount: number;
  currency?: CapitalCurrency;
  url?: string | null;
  description?: string | null;
}

export type InvestmentUpdateMode = "contribution" | "valuation" | "link" | "description";

export type UpdateCapitalInvestmentInput =
  | { updateMode: "contribution"; contribution: number }
  | { updateMode: "valuation"; amount: number }
  | { updateMode: "link"; url: string | null }
  | { updateMode: "description"; description: string | null };

export interface FutureMoneyInput {
  description: string;
  amount: number;
  currency?: CapitalCurrency;
  expectedPaymentDate?: string | null;
}

export interface CapitalSummary {
  totalCapital: number;
  availableTotal: number;
  investmentTotal: number;
  investmentReturnTotal: number;
  investmentPrincipalTotal: number;
  futureTotal: number;
  lastMonthTotal: number;
  totalDelta: number;
}

export interface CapitalData {
  available: StoredAvailableCash[];
  investments: StoredCapitalInvestment[];
  future: StoredFutureMoney[];
  summary: CapitalSummary;
  exchangeRates: ExchangeRates;
}

export async function getCapitalData(): Promise<CapitalData> {
  return request<CapitalData>("/capital");
}

export async function createAvailableCash(
  input: AvailableCashInput,
): Promise<StoredAvailableCash> {
  const { item } = await request<{ item: StoredAvailableCash }>(
    "/capital/available",
    { method: "POST", body: JSON.stringify(input) },
  );
  return item;
}

export async function updateAvailableCash(
  id: string,
  input: AvailableCashInput,
): Promise<StoredAvailableCash> {
  const { item } = await request<{ item: StoredAvailableCash }>(
    `/capital/available/${id}`,
    { method: "PATCH", body: JSON.stringify(input) },
  );
  return item;
}

export async function deleteAvailableCash(id: string): Promise<void> {
  await request(`/capital/available/${id}`, { method: "DELETE" });
}

export async function createCapitalInvestment(
  input: CapitalInvestmentInput,
): Promise<StoredCapitalInvestment> {
  const { item } = await request<{ item: StoredCapitalInvestment }>(
    "/capital/investments",
    { method: "POST", body: JSON.stringify(input) },
  );
  return item;
}

export async function updateCapitalInvestment(
  id: string,
  input: UpdateCapitalInvestmentInput,
): Promise<StoredCapitalInvestment> {
  const { item } = await request<{ item: StoredCapitalInvestment }>(
    `/capital/investments/${id}`,
    { method: "PATCH", body: JSON.stringify(input) },
  );
  return item;
}

export async function deleteCapitalInvestment(id: string): Promise<void> {
  await request(`/capital/investments/${id}`, { method: "DELETE" });
}

export async function createFutureMoney(
  input: FutureMoneyInput,
): Promise<StoredFutureMoney> {
  const { item } = await request<{ item: StoredFutureMoney }>("/capital/future", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return item;
}

export async function updateFutureMoney(
  id: string,
  input: FutureMoneyInput,
): Promise<StoredFutureMoney> {
  const { item } = await request<{ item: StoredFutureMoney }>(
    `/capital/future/${id}`,
    { method: "PATCH", body: JSON.stringify(input) },
  );
  return item;
}

export async function deleteFutureMoney(id: string): Promise<void> {
  await request(`/capital/future/${id}`, { method: "DELETE" });
}

export async function receiveFutureMoney(id: string): Promise<void> {
  await request(`/capital/future/${id}/receive`, { method: "POST" });
}

export async function withdrawToChecking(
  id: string,
  amount: number,
): Promise<void> {
  await request(`/capital/available/${id}/withdraw-to-checking`, {
    method: "POST",
    body: JSON.stringify({ amount }),
  });
}
