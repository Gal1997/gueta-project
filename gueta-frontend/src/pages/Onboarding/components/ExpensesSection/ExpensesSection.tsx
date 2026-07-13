import { useEffect } from "react";
import {
  Accordion,
  ActionIcon,
  Box,
  Checkbox,
  Input,
  NumberInput,
  Select,
  Stack,
  TextInput,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import type { UseFormReturnType } from "@mantine/form";
import { IconTrash } from "@tabler/icons-react";
import type { SpendingCategory } from "../../../../auth/authApi";
import { AmountCurrencyFields } from "../../../../components/AmountCurrencyFields/AmountCurrencyFields";
import { RemainingPaymentsLabel } from "../../../../components/RemainingPaymentsLabel/RemainingPaymentsLabel";
import { ExpenseCategoryPicker } from "../ExpenseCategoryPicker/ExpenseCategoryPicker";
import {
  EXPENSE_RECURRENCES,
  EXPENSE_RECURRING_KINDS,
} from "../../../../finance/constants";
import { findOtherCategory } from "../../../../finance/categoryUtils";
import { debtTotalPayments, defaultDebtMonthlyCharge } from "../../../../finance/expenseUtils";
import { MONEY_DECIMAL_SCALE } from "../../../../finance/money";
import type { ExpenseRow, OnboardingFormValues } from "../../consts";
import sectionClasses from "../shared/SectionRow.module.css";
import { SectionFooterActions } from "../shared/SectionFooterActions";

type ExpensesSectionProps = {
  form: UseFormReturnType<OnboardingFormValues>;
  values: OnboardingFormValues;
  categories: SpendingCategory[];
  makeExpense: () => ExpenseRow;
  bumpFormVersion: () => void;
  onContinue: () => void;
  onListChange: () => void;
  onCategoriesChange: () => void | Promise<void>;
};

export function ExpensesSection({
  form,
  values,
  categories,
  makeExpense,
  bumpFormVersion,
  onContinue,
  onListChange,
  onCategoriesChange,
}: ExpensesSectionProps) {
  useEffect(() => {
    const otherCategory = findOtherCategory(categories);
    if (!otherCategory) return;

    let changed = false;
    form.getValues().expenses.forEach((row, index) => {
      if (!row.categoryId) {
        form.setFieldValue(`expenses.${index}.categoryId`, otherCategory.id);
        changed = true;
      }
    });
    if (changed) {
      bumpFormVersion();
    }
  }, [categories, form, bumpFormVersion]);

  function syncDebtMonthlyCharge(
    index: number,
    overrides: {
      kind?: string;
      amount?: number | string;
      totalPayments?: number | string;
    } = {},
  ) {
    const row = values.expenses[index];
    const kind = overrides.kind ?? row?.kind;
    if (kind !== "debt") return;

    const amount = Number(overrides.amount ?? row?.amount);
    const totalPayments = debtTotalPayments({
      totalPayments: overrides.totalPayments ?? row?.totalPayments,
      remainingPayments: row?.remainingPayments,
    });
    if (Number.isFinite(amount) && totalPayments > 0) {
      form.setFieldValue(
        `expenses.${index}.monthlyCharge`,
        defaultDebtMonthlyCharge(amount, totalPayments),
      );
    }
  }

  return (
    <Accordion.Item value="expenses">
      <Accordion.Control>הוצאות החודש</Accordion.Control>
      <Accordion.Panel>
        <Stack className={sectionClasses.rows}>
          {values.expenses.map((_, index) => {
            const remainingPaymentsProps = form.getInputProps(
              `expenses.${index}.remainingPayments`,
              { withError: false },
            );
            const row = values.expenses[index];
            const isRecurring = row?.recurrence !== "once";
            const isDebtKind = row?.kind === "debt";
            const isFixedKind = row?.kind === "fixed";

            return (
              <Box key={`expenses-${index}`} className={sectionClasses.row}>
                <Box className={sectionClasses.fields}>
                  <Select
                    label="סוג הוצאה"
                    placeholder="בחרו"
                    data={EXPENSE_RECURRENCES}
                    value={row?.recurrence ?? "recurring"}
                    error={form.errors[`expenses.${index}.recurrence`]}
                    onChange={(value) => {
                      const recurrence = value ?? "recurring";
                      form.setFieldValue(
                        `expenses.${index}.recurrence`,
                        recurrence,
                      );
                      form.setFieldValue(
                        `expenses.${index}.kind`,
                        recurrence === "once" ? "once" : "fixed",
                      );
                      form.setFieldValue(
                        `expenses.${index}.remainingPaymentsInfinite`,
                        false,
                      );
                      bumpFormVersion();
                    }}
                  />
                  {isRecurring ? (
                    <Select
                      label="סוג חוזר"
                      placeholder="בחרו"
                      data={EXPENSE_RECURRING_KINDS}
                      {...form.getInputProps(`expenses.${index}.kind`)}
                      onChange={(value) => {
                        form.setFieldValue(`expenses.${index}.kind`, value ?? "");
                        if (value !== "fixed") {
                          form.setFieldValue(
                            `expenses.${index}.remainingPaymentsInfinite`,
                            false,
                          );
                        }
                        if (value === "debt") {
                          form.setFieldValue(
                            `expenses.${index}.totalPayments`,
                            row?.remainingPayments ?? "",
                          );
                          syncDebtMonthlyCharge(index, { kind: value });
                        } else {
                          form.setFieldValue(`expenses.${index}.monthlyCharge`, "");
                          form.setFieldValue(`expenses.${index}.totalPayments`, "");
                        }
                        bumpFormVersion();
                      }}
                    />
                  ) : null}
                  <ExpenseCategoryPicker
                    categories={categories}
                    value={row?.categoryId ?? ""}
                    error={form.errors[`expenses.${index}.categoryId`]}
                    onChange={(categoryId) => {
                      form.setFieldValue(`expenses.${index}.categoryId`, categoryId);
                      form.clearFieldError(`expenses.${index}.categoryId`);
                      bumpFormVersion();
                    }}
                    onCategoriesChange={onCategoriesChange}
                  />
                  <TextInput
                    label="שם"
                    placeholder="משכנתא"
                    {...form.getInputProps(`expenses.${index}.name`)}
                  />
                  <AmountCurrencyFields
                    form={form}
                    currencyField={`expenses.${index}.currency`}
                    amountField={`expenses.${index}.amount`}
                    amountLabel={isDebtKind ? "סך חוב" : "סכום"}
                    onAmountChange={(value) => {
                      if (isDebtKind) {
                        syncDebtMonthlyCharge(index, { amount: value });
                      }
                    }}
                  />
                  <TextInput
                    label="תיאור"
                    placeholder="תשלום חודשי"
                    {...form.getInputProps(`expenses.${index}.description`)}
                  />
                  {isRecurring ? (
                    <>
                      {isFixedKind ? (
                        <Checkbox
                          label="אין סוף"
                          description="הוצאה קבועה ללא יעד סופי (למשל מנוי)"
                          checked={row?.remainingPaymentsInfinite ?? false}
                          onChange={(event) => {
                            const checked = event.currentTarget.checked;
                            form.setFieldValue(
                              `expenses.${index}.remainingPaymentsInfinite`,
                              checked,
                            );
                            if (checked) {
                              form.setFieldValue(
                                `expenses.${index}.remainingPayments`,
                                "",
                              );
                              form.clearFieldError(
                                `expenses.${index}.remainingPayments`,
                              );
                            }
                            bumpFormVersion();
                          }}
                        />
                      ) : null}
                      <Input.Wrapper
                        label={<RemainingPaymentsLabel />}
                        description="כמה חודשים נותרו לשלם"
                        error={form.errors[`expenses.${index}.remainingPayments`]}
                      >
                        <NumberInput
                          placeholder="12"
                          min={0}
                          allowNegative={false}
                          disabled={row?.remainingPaymentsInfinite ?? false}
                          {...remainingPaymentsProps}
                          onChange={(value) => {
                            const next = value ?? "";
                            remainingPaymentsProps.onChange?.(next);
                            form.setFieldValue(
                              `expenses.${index}.totalPayments`,
                              next,
                            );
                            if (isDebtKind) {
                              syncDebtMonthlyCharge(index, { totalPayments: next });
                            }
                          }}
                        />
                      </Input.Wrapper>
                      {isDebtKind ? (
                        <NumberInput
                          label="חיוב החודש"
                          description="ברירת מחדל: סך חוב ÷ תשלומים שנותרו. ניתן לעריכה."
                          placeholder="1000"
                          min={0}
                          allowNegative={false}
                          decimalScale={MONEY_DECIMAL_SCALE}
                          thousandSeparator=","
                          {...form.getInputProps(`expenses.${index}.monthlyCharge`)}
                        />
                      ) : null}
                      <NumberInput
                        label="יום חיוב בחודש"
                        description="באיזה יום בחודש מחויבים"
                        placeholder="9"
                        min={1}
                        max={31}
                        allowDecimal={false}
                        {...form.getInputProps(`expenses.${index}.billingDay`)}
                      />
                    </>
                  ) : (
                    <DatePickerInput
                      label="תאריך הוצאה"
                      placeholder="בחרו תאריך"
                      valueFormat="DD/MM/YYYY"
                      {...form.getInputProps(`expenses.${index}.billingDate`)}
                    />
                  )}
                </Box>
                <ActionIcon
                  aria-label="מחק שורה"
                  className={sectionClasses.deleteButton}
                  disabled={values.expenses.length === 1}
                  onClick={() => {
                    form.removeListItem("expenses", index);
                    onListChange();
                  }}
                >
                  <IconTrash />
                </ActionIcon>
              </Box>
            );
          })}
          <SectionFooterActions
            onAdd={() => {
              const expense = makeExpense();
              const otherCategory = findOtherCategory(categories);
              if (otherCategory) {
                expense.categoryId = otherCategory.id;
              }
              form.insertListItem("expenses", expense);
              onListChange();
            }}
            onContinue={onContinue}
          />
        </Stack>
      </Accordion.Panel>
    </Accordion.Item>
  );
}
