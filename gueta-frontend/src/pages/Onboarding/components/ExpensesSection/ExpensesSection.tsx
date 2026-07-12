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
import { AmountCurrencyFields } from "../../../../components/AmountCurrencyFields/AmountCurrencyFields";
import { RemainingPaymentsLabel } from "../../../../components/RemainingPaymentsLabel/RemainingPaymentsLabel";
import {
  categoriesForRecurrence,
  EXPENSE_RECURRENCES,
} from "../../../../finance/constants";
import { debtTotalPayments, defaultDebtMonthlyCharge } from "../../../../finance/expenseUtils";
import { MONEY_DECIMAL_SCALE } from "../../../../finance/money";
import type { ExpenseRow, OnboardingFormValues } from "../../consts";
import sectionClasses from "../shared/SectionRow.module.css";
import { SectionFooterActions } from "../shared/SectionFooterActions";

type ExpensesSectionProps = {
  form: UseFormReturnType<OnboardingFormValues>;
  values: OnboardingFormValues;
  makeExpense: () => ExpenseRow;
  bumpFormVersion: () => void;
  onContinue: () => void;
  onListChange: () => void;
};

export function ExpensesSection({
  form,
  values,
  makeExpense,
  bumpFormVersion,
  onContinue,
  onListChange,
}: ExpensesSectionProps) {
  function syncDebtMonthlyCharge(
    index: number,
    overrides: {
      category?: string;
      amount?: number | string;
      totalPayments?: number | string;
    } = {},
  ) {
    const row = values.expenses[index];
    const category = overrides.category ?? row?.category;
    if (category !== "debt") return;

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

            return (
              <Box key={`expenses-${index}`} className={sectionClasses.row}>
                <Box className={sectionClasses.fields}>
                  <Select
                    label="סוג הוצאה"
                    placeholder="בחרו"
                    data={EXPENSE_RECURRENCES}
                    value={values.expenses[index]?.recurrence ?? "recurring"}
                    error={form.errors[`expenses.${index}.recurrence`]}
                    onChange={(value) => {
                      form.setFieldValue(
                        `expenses.${index}.recurrence`,
                        value ?? "recurring",
                      );
                      form.setFieldValue(`expenses.${index}.category`, "");
                      form.setFieldValue(
                        `expenses.${index}.remainingPaymentsInfinite`,
                        false,
                      );
                      bumpFormVersion();
                    }}
                  />
                  <Select
                    label="קטגוריה"
                    placeholder="בחרו"
                    data={categoriesForRecurrence(
                      values.expenses[index]?.recurrence ?? "recurring",
                    )}
                    {...form.getInputProps(`expenses.${index}.category`)}
                    onChange={(value) => {
                      form.setFieldValue(`expenses.${index}.category`, value ?? "");
                      if (value !== "fixed") {
                        form.setFieldValue(
                          `expenses.${index}.remainingPaymentsInfinite`,
                          false,
                        );
                      }
                      if (value === "debt") {
                        form.setFieldValue(
                          `expenses.${index}.totalPayments`,
                          values.expenses[index]?.remainingPayments ?? "",
                        );
                        syncDebtMonthlyCharge(index, { category: value });
                      } else {
                        form.setFieldValue(`expenses.${index}.monthlyCharge`, "");
                        form.setFieldValue(`expenses.${index}.totalPayments`, "");
                      }
                      bumpFormVersion();
                    }}
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
                    amountLabel={
                      values.expenses[index]?.category === "debt"
                        ? "סך חוב"
                        : "סכום"
                    }
                    onAmountChange={(value) => {
                      if (values.expenses[index]?.category === "debt") {
                        syncDebtMonthlyCharge(index, { amount: value });
                      }
                    }}
                  />
                  <TextInput
                    label="תיאור"
                    placeholder="תשלום חודשי"
                    {...form.getInputProps(`expenses.${index}.description`)}
                  />
                  {values.expenses[index]?.recurrence !== "once" ? (
                    <>
                      {values.expenses[index]?.category === "fixed" ? (
                        <Checkbox
                          label="אין סוף"
                          description="הוצאה קבועה ללא יעד סופי (למשל מנוי)"
                          checked={
                            values.expenses[index]?.remainingPaymentsInfinite ??
                            false
                          }
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
                          disabled={
                            values.expenses[index]?.remainingPaymentsInfinite ??
                            false
                          }
                          {...remainingPaymentsProps}
                          onChange={(value) => {
                            const next = value ?? "";
                            remainingPaymentsProps.onChange?.(next);
                            form.setFieldValue(
                              `expenses.${index}.totalPayments`,
                              next,
                            );
                            if (values.expenses[index]?.category === "debt") {
                              syncDebtMonthlyCharge(index, { totalPayments: next });
                            }
                          }}
                        />
                      </Input.Wrapper>
                      {values.expenses[index]?.category === "debt" ? (
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
              form.insertListItem("expenses", makeExpense());
              onListChange();
            }}
            onContinue={onContinue}
          />
        </Stack>
      </Accordion.Panel>
    </Accordion.Item>
  );
}
