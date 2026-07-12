import { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { getFinanceData } from "../../auth/authApi";
import type { StoredExpense } from "../../auth/authApi";
import { ERRORS } from "./consts";
import { getInactiveExpenses } from "./utils";

export function useHistory() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<StoredExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getFinanceData()
      .then((result) => {
        if (!active) return;
        setExpenses(getInactiveExpenses(result.expenses));
      })
      .catch(() => {
        if (active) setError(ERRORS.loadFailed);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return {
    user,
    expenses,
    loading,
    error,
  };
}
