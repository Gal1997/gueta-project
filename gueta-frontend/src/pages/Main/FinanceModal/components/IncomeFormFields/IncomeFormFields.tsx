import { Select, TextInput } from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";
import { AmountCurrencyFields } from "../../../../../components/AmountCurrencyFields/AmountCurrencyFields";
import { INCOME_TYPES } from "../../../../../finance/constants";
import type { IncomeFormValues } from "../../consts";

type IncomeFormFieldsProps = {
  form: UseFormReturnType<IncomeFormValues>;
};

export function IncomeFormFields({ form }: IncomeFormFieldsProps) {
  return (
    <>
      <Select
        label="סוג"
        placeholder="בחרו"
        data={INCOME_TYPES}
        {...form.getInputProps("type")}
      />
      <TextInput
        label="מאיפה נכנס הכסף?"
        placeholder="Nvidia"
        {...form.getInputProps("source")}
      />
      <TextInput
        label="תיאור"
        placeholder="משכורת חודשית שלי"
        {...form.getInputProps("description")}
      />
      <AmountCurrencyFields
        form={form}
        currencyField="currency"
        amountField="amount"
      />
    </>
  );
}
