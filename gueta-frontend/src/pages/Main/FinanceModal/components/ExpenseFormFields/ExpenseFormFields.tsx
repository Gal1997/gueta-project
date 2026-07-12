import { Checkbox, Input, NumberInput, Select, TextInput } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import type { UseFormReturnType } from "@mantine/form";
import { AmountCurrencyFields } from "../../../../../components/AmountCurrencyFields/AmountCurrencyFields";
import { RemainingPaymentsLabel } from "../../../../../components/RemainingPaymentsLabel/RemainingPaymentsLabel";
import {
  categoriesForRecurrence,
  EXPENSE_RECURRENCES,
} from "../../../../../finance/constants";
import {
  debtTotalPayments,
  defaultDebtMonthlyCharge,
} from "../../../../../finance/expenseUtils";
import { MONEY_DECIMAL_SCALE } from "../../../../../finance/money";
import type { ExpenseFormValues } from "../../consts";
import classes from "./ExpenseFormFields.module.css";

type DebtMonthlyChargeOverrides = {
  category?: string;
  amount?: number | string;
  totalPayments?: number | string;
};

function syncDebtMonthlyCharge(
  form: UseFormReturnType<ExpenseFormValues>,
  overrides: DebtMonthlyChargeOverrides = {},
) {
  if (!form.values.monthlyChargeUseDefault) return;

  const category = overrides.category ?? form.values.category;
  const amount = Number(overrides.amount ?? form.values.amount);
  const totalPayments = debtTotalPayments({
    totalPayments: overrides.totalPayments ?? form.values.totalPayments,
    remainingPayments: form.values.remainingPayments,
  });
  if (
    category === "debt" &&
    Number.isFinite(amount) &&
    totalPayments > 0
  ) {
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
  onRecurrenceChange: (value: string | null) => void;
};

export function ExpenseFormFields({
  form,
  expenseRecurrence,
  isRecurringExpense,
  mode,
  onRecurrenceChange,
}: ExpenseFormFieldsProps) {
  const isFixedCategory = form.values.category === "fixed";
  const isDebtCategory = form.values.category === "debt";

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
      <Select
        label="קטגוריה"
        placeholder="בחרו"
        data={categoriesForRecurrence(expenseRecurrence)}
        {...form.getInputProps("category")}
        onChange={(value) => {
          form.setFieldValue("category", value ?? "");
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
            syncDebtMonthlyCharge(form, { category: value });
          } else {
            form.setFieldValue("monthlyChargeUseDefault", false);
            form.setFieldValue("totalPayments", "");
            form.setFieldValue("monthlyCharge", "");
          }
        }}
      />
      <TextInput
        label="שם"
        placeholder="משכנתא"
        {...form.getInputProps("name")}
      />
      <AmountCurrencyFields
        form={form}
        currencyField="currency"
        amountField="amount"
        amountLabel={isDebtCategory ? "סך חוב" : "סכום"}
        onAmountChange={(value) => {
          if (isDebtCategory) {
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
          {isFixedCategory ? (
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
                if (isDebtCategory && mode === "add") {
                  form.setFieldValue("totalPayments", next);
                  syncDebtMonthlyCharge(form, { totalPayments: next });
                } else if (isDebtCategory) {
                  syncDebtMonthlyCharge(form);
                }
              }}
            />
          </Input.Wrapper>
          {isDebtCategory ? (
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
