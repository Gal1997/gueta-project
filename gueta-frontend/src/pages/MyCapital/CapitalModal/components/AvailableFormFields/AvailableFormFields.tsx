import { NumberInput, Select, TextInput } from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";
import { AVAILABLE_CASH_TYPES } from "../../../../../finance/capitalConstants";
import { CURRENCY_OPTIONS } from "../../../../../finance/currency";
import { MONEY_DECIMAL_SCALE } from "../../../../../finance/money";
import type { AvailableFormValues } from "../../consts";

type AvailableFormFieldsProps = {
  form: UseFormReturnType<AvailableFormValues>;
};

export function AvailableFormFields({ form }: AvailableFormFieldsProps) {
  return (
    <>
      <Select
        label="סוג"
        placeholder="בחרו"
        data={AVAILABLE_CASH_TYPES}
        {...form.getInputProps("type")}
      />
      <TextInput
        label="תיאור"
        description="אופציונלי"
        placeholder="לדוגמה: חשבון בנק לאומי"
        {...form.getInputProps("description")}
      />
      <Select
        label="מטבע"
        data={[...CURRENCY_OPTIONS]}
        {...form.getInputProps("currency")}
      />
      <NumberInput
        label="סכום"
        placeholder="1000"
        min={0}
        allowNegative={false}
        decimalScale={MONEY_DECIMAL_SCALE}
        thousandSeparator=","
        {...form.getInputProps("amount")}
      />
    </>
  );
}
