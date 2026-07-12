import { NumberInput, Select, TextInput } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import type { UseFormReturnType } from "@mantine/form";
import { CURRENCY_OPTIONS } from "../../../../../finance/currency";
import { MONEY_DECIMAL_SCALE } from "../../../../../finance/money";
import type { FutureFormValues } from "../../consts";

type FutureFormFieldsProps = {
  form: UseFormReturnType<FutureFormValues>;
};

export function FutureFormFields({ form }: FutureFormFieldsProps) {
  return (
    <>
      <TextInput
        label="תיאור"
        placeholder="חוב מדוד"
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
      <DatePickerInput
        label="צפי תשלום"
        placeholder="בחרו תאריך (אופציונלי)"
        valueFormat="DD/MM/YYYY"
        clearable
        {...form.getInputProps("expectedPaymentDate")}
      />
    </>
  );
}
