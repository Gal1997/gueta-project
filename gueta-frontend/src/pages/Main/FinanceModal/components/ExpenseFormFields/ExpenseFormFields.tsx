import { Checkbox, Input, NumberInput, Select, Text, TextInput } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import type { UseFormReturnType } from "@mantine/form";
import type { SpendingCategory } from "../../../../../auth/authApi";
import { AmountCurrencyFields } from "../../../../../components/AmountCurrencyFields/AmountCurrencyFields";
import { RemainingPaymentsLabel } from "../../../../../components/RemainingPaymentsLabel/RemainingPaymentsLabel";
import { categoriesToSelectData } from "../../../../../finance/categoryUtils";
import {
  EXPENSE_RECURRENCES,
  EXPENSE_RECURRING_KINDS,
} from "../../../../../finance/constants";
import {
  debtTotalPayments,
  defaultDebtMonthlyCharge,
} from "../../../../../finance/expenseUtils";
import { MONEY_DECIMAL_SCALE } from "../../../../../finance/money";
import type { ExpenseFormValues } from "../../consts";
import classes from "./ExpenseFormFields.module.css";

type DebtMonthlyChargeOverrides = {
  kind?: string;
  amount?: number | string;
  totalPayments?: number | string;
};

function syncDebtMonthlyCharge(
  form: UseFormReturnType<ExpenseFormValues>,
  overrides: DebtMonthlyChargeOverrides = {},
) {
  if (!form.values.monthlyChargeUseDefault) return;

  const kind = overrides.kind ?? form.values.kind;
  const amount = Number(overrides.amount ?? form.values.amount);
  const totalPayments = debtTotalPayments({
    totalPayments: overrides.totalPayments ?? form.values.totalPayments,
    remainingPayments: form.values.remainingPayments,
  });
  if (kind === "debt" && Number.isFinite(amount) && totalPayments > 0) {
    form.setFieldValue(
      "monthlyCharge",
      defaultDebtMonthlyCharge(amount, totalPayments),
    );
  }
}

type ExpenseFormFieldsProps = {
  form: UseFormReturnType<ExpenseFormValues>;
  expenseRecurrence: string;
  isRecurringExpense: boolean;
  mode: "add" | "edit";
  categories: SpendingCategory[];
  onRecurrenceChange: (value: string | null) => void;
  onManageCategories?: () => void;
};

export function ExpenseFormFields({
  form,
  expenseRecurrence,
  isRecurringExpense,
  mode,
  categories,
  onRecurrenceChange,
  onManageCategories,
}: ExpenseFormFieldsProps) {
  const isFixedKind = form.values.kind === "fixed";
  const isDebtKind = form.values.kind === "debt";
  const categoryOptions = categoriesToSelectData(categories);

  return (
    <>
      <Select
        label="סוג הוצאה"
        placeholder="בחרו"
        data={EXPENSE_RECURRENCES}
        value={expenseRecurrence}
        error={form.errors.recurrence}
        onChange={onRecurrenceChange}
      />
      {isRecurringExpense ? (
        <Select
          label="סוג חוזר"
          placeholder="בחרו"
          data={EXPENSE_RECURRING_KINDS}
          {...form.getInputProps("kind")}
          onChange={(value) => {
            form.setFieldValue("kind", value ?? "");
            if (value !== "fixed") {
              form.setFieldValue("remainingPaymentsInfinite", false);
            }
            if (value === "debt") {
              form.setFieldValue("monthlyChargeUseDefault", true);
              if (mode === "add") {
                form.setFieldValue(
                  "totalPayments",
                  form.values.remainingPayments,
                );
              }
              syncDebtMonthlyCharge(form, { kind: value });
            } else {
              form.setFieldValue("monthlyChargeUseDefault", false);
              form.setFieldValue("totalPayments", "");
              form.setFieldValue("monthlyCharge", "");
            }
          }}
        />
      ) : null}
      <Select
        label="קטגוריה"
        placeholder="בחרו"
        data={categoryOptions}
        searchable
        {...form.getInputProps("categoryId")}
      />
      {onManageCategories ? (
        <Text className={classes.manageLink} onClick={onManageCategories}>
          ניהול קטגוריות
        </Text>
      ) : null}
      <TextInput
        label="שם"
        placeholder="משכנתא"
        {...form.getInputProps("name")}
      />
      <AmountCurrencyFields
        form={form}
        currencyField="currency"
        amountField="amount"
        amountLabel={isDebtKind ? "סך חוב" : "סכום"}
        onAmountChange={(value) => {
          if (isDebtKind) {
            syncDebtMonthlyCharge(form, { amount: value });
          }
        }}
      />
      <TextInput
        label="תיאור"
        placeholder="תשלום חודשי"
        {...form.getInputProps("description")}
      />
      {isRecurringExpense ? (
        <>
          {isFixedKind ? (
            <Checkbox
              label="אין סוף"
              description="הוצאה קבועה ללא יעד סופי (למשל מנוי)"
              checked={form.values.remainingPaymentsInfinite}
              onChange={(event) => {
                const checked = event.currentTarget.checked;
                form.setFieldValue("remainingPaymentsInfinite", checked);
                if (checked) {
                  form.setFieldValue("remainingPayments", "");
                  form.clearFieldError("remainingPayments");
                }
              }}
            />
          ) : null}
          <Input.Wrapper
            label={<RemainingPaymentsLabel />}
            description="כמה חודשים נותרו לשלם"
            error={form.errors.remainingPayments}
          >
            <NumberInput
              placeholder="12"
              min={0}
              allowNegative={false}
              disabled={form.values.remainingPaymentsInfinite}
              {...form.getInputProps("remainingPayments", { withError: false })}
              onChange={(value) => {
                const next = value ?? "";
                form.setFieldValue("remainingPayments", next);
                if (isDebtKind && mode === "add") {
                  form.setFieldValue("totalPayments", next);
                  syncDebtMonthlyCharge(form, { totalPayments: next });
                } else if (isDebtKind) {
                  syncDebtMonthlyCharge(form);
                }
              }}
            />
          </Input.Wrapper>
          {isDebtKind ? (
            <Input.Wrapper
              label="חיוב החודש"
              description={
                form.values.monthlyChargeUseDefault
                  ? "מחושב אוטומטית: סך חוב ÷ סך תשלומים"
                  : "כמה אחויב החודש"
              }
              error={form.errors.monthlyCharge}
            >
              <div className={classes.monthlyChargeRow}>
                <NumberInput
                  className={classes.monthlyChargeInput}
                  placeholder="1000"
                  min={0}
                  allowNegative={false}
                  decimalScale={MONEY_DECIMAL_SCALE}
                  thousandSeparator=","
                  disabled={form.values.monthlyChargeUseDefault}
                  {...form.getInputProps("monthlyCharge", { withError: false })}
                />
                <Checkbox
                  className={classes.monthlyChargeCheckbox}
                  label="השתמש בברירת מחדל"
                  description="סך חוב ÷ סך תשלומים"
                  checked={form.values.monthlyChargeUseDefault}
                  onChange={(event) => {
                    const checked = event.currentTarget.checked;
                    form.setFieldValue("monthlyChargeUseDefault", checked);
                    if (checked) {
                      syncDebtMonthlyCharge(form);
                    }
                    form.clearFieldError("monthlyCharge");
                  }}
                />
              </div>
            </Input.Wrapper>
          ) : null}
          <NumberInput
            label="יום חיוב בחודש"
            description="באיזה יום בחודש מחויבים"
            placeholder="9"
            min={1}
            max={31}
            allowDecimal={false}
            {...form.getInputProps("billingDay")}
          />
        </>
      ) : (
        <DatePickerInput
          label="תאריך הוצאה"
          placeholder="בחרו תאריך"
          valueFormat="DD/MM/YYYY"
          {...form.getInputProps("billingDate")}
        />
      )}
    </>
  );
}
