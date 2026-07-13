import { IconCheck, IconClock } from "@tabler/icons-react";
import type { StoredExpense } from "../auth/authApi";
import classes from "./ExpenseBillingCell.module.css";
import { formatExpenseBilling, isExpenseBilled } from "./expenseUtils";

type ExpenseBillingCellProps = {
  expense: StoredExpense;
};

export function ExpenseBillingCell({ expense }: ExpenseBillingCellProps) {
  const billed = isExpenseBilled(expense);
  const StatusIcon = billed ? IconCheck : IconClock;

  return (
    <span className={classes.root} title={billed ? "חויב" : "טרם חויב"}>
      <StatusIcon
        className={classes.icon}
        size={14}
        stroke={1.75}
        aria-hidden="true"
      />
      {formatExpenseBilling(expense)}
    </span>
  );
}
