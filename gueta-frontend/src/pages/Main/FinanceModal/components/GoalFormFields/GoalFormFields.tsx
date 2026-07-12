import { TextInput } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import type { UseFormReturnType } from "@mantine/form";
import { AmountCurrencyFields } from "../../../../../components/AmountCurrencyFields/AmountCurrencyFields";
import type { GoalFormValues } from "../../consts";

type GoalFormFieldsProps = {
  form: UseFormReturnType<GoalFormValues>;
};

export function GoalFormFields({ form }: GoalFormFieldsProps) {
  return (
    <>
      <TextInput
        label="תיאור"
        placeholder="תאילנד"
        {...form.getInputProps("description")}
      />
      <AmountCurrencyFields
        form={form}
        currencyField="currency"
        amountField="targetAmount"
        amountLabel="סכום דרוש"
        amountPlaceholder="20000"
      />
      <DatePickerInput
        label="תאריך"
        placeholder="בחרו תאריך"
        valueFormat="DD/MM/YYYY"
        {...form.getInputProps("targetDate")}
      />
    </>
  );
}
