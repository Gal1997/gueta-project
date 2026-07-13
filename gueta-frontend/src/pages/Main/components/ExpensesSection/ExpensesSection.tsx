import { Box } from "@mantine/core";
import type { ExpenseKind, StoredExpense } from "../../../../auth/authApi";
import type { ExpenseBoxItem } from "../../consts";
import { ExpenseBox } from "../ExpenseBox/ExpenseBox";
import classes from "./ExpensesSection.module.css";

type ExpensesSectionProps = {
  orderedExpenseBoxes: ExpenseBoxItem[];
  boxPlacement: string[];
  onAdd: (preset: ExpenseKind) => void;
  onEdit: (expense: StoredExpense) => void;
  onDelete: (expense: StoredExpense) => void;
};

export function ExpensesSection({
  orderedExpenseBoxes,
  boxPlacement,
  onAdd,
  onEdit,
  onDelete,
}: ExpensesSectionProps) {
  return (
    <Box className={classes.expensesGrid}>
      {orderedExpenseBoxes.map((box, index) => (
        <ExpenseBox
          key={box.key}
          title={box.title}
          expenses={box.expenses}
          variant={box.variant}
          emptyText={box.emptyText}
          showMonthlyCharge={box.showMonthlyCharge}
          className={boxPlacement[index]}
          onAdd={() => onAdd(box.key as ExpenseKind)}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </Box>
  );
}
