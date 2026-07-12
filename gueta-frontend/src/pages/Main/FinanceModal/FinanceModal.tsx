import { Modal, Stack } from "@mantine/core";
import type {
  StoredExpense,
  StoredGoal,
  StoredIncome,
} from "../../../auth/authApi";
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
  initialIncome?: StoredIncome | null;
  initialExpense?: StoredExpense | null;
  initialGoal?: StoredGoal | null;
  onSaved: () => void;
}

export default function FinanceModal({
  opened,
  onClose,
  entity,
  mode,
  recordId,
  initialIncome,
  initialExpense,
  initialGoal,
  onSaved,
}: FinanceModalProps) {
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
    initialIncome,
    initialExpense,
    initialGoal,
    onSaved,
    onClose,
  });

  return (
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
            onRecurrenceChange={handleRecurrenceChange}
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
  );
}

export type { FinanceEntity } from "./consts";
