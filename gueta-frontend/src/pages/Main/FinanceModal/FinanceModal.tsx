import { Modal, Stack } from "@mantine/core";
import { useState } from "react";
import type {
  ExpenseKind,
  SpendingCategory,
  StoredExpense,
  StoredGoal,
  StoredIncome,
} from "../../../auth/authApi";
import { CategoryManager } from "../../../components/CategoryManager/CategoryManager";
import classes from "./FinanceModal.module.css";
import { ExpenseFormFields } from "./components/ExpenseFormFields/ExpenseFormFields";
import { GoalFormFields } from "./components/GoalFormFields/GoalFormFields";
import { IncomeFormFields } from "./components/IncomeFormFields/IncomeFormFields";
import { ModalFormActions } from "./components/ModalFormActions/ModalFormActions";
import type { FinanceEntity } from "./consts";
import { useFinanceModal } from "./useFinanceModal";

interface FinanceModalProps {
  opened: boolean;
  onClose: () => void;
  entity: FinanceEntity;
  mode: "add" | "edit";
  recordId?: string;
  expensePreset?: ExpenseKind;
  initialIncome?: StoredIncome | null;
  initialExpense?: StoredExpense | null;
  initialGoal?: StoredGoal | null;
  categories: SpendingCategory[];
  onSaved: () => void;
}

export default function FinanceModal({
  opened,
  onClose,
  entity,
  mode,
  recordId,
  expensePreset,
  initialIncome,
  initialExpense,
  initialGoal,
  categories,
  onSaved,
}: FinanceModalProps) {
  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false);
  const {
    title,
    saving,
    error,
    expenseRecurrence,
    isRecurringExpense,
    incomeForm,
    expenseForm,
    goalForm,
    handleSubmit,
    handleRecurrenceChange,
  } = useFinanceModal({
    opened,
    entity,
    mode,
    recordId,
    expensePreset,
    initialIncome,
    initialExpense,
    initialGoal,
    categories,
    onSaved,
    onClose,
  });

  return (
    <>
      <Modal
        opened={opened}
        onClose={onClose}
        title={title}
        classNames={{ title: classes.modalTitle }}
      >
        <Stack className={classes.form}>
          {entity === "income" && <IncomeFormFields form={incomeForm} />}

          {entity === "expense" && (
            <ExpenseFormFields
              form={expenseForm}
              expenseRecurrence={expenseRecurrence}
              isRecurringExpense={isRecurringExpense}
              mode={mode}
              categories={categories}
              onRecurrenceChange={handleRecurrenceChange}
              onManageCategories={() => setCategoryManagerOpen(true)}
            />
          )}

          {entity === "goal" && <GoalFormFields form={goalForm} />}

          <ModalFormActions
            error={error}
            saving={saving}
            onClose={onClose}
            onSubmit={() => void handleSubmit()}
          />
        </Stack>
      </Modal>

      {entity === "expense" ? (
        <CategoryManager
          opened={categoryManagerOpen}
          onClose={() => setCategoryManagerOpen(false)}
          categories={categories}
          onChanged={onSaved}
        />
      ) : null}
    </>
  );
}

export type { FinanceEntity } from "./consts";
