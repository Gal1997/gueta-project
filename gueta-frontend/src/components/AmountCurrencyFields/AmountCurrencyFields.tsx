import { NumberInput, Select } from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";
import { CURRENCY_OPTIONS } from "../../finance/currency";
import { MONEY_DECIMAL_SCALE } from "../../finance/money";

type AmountCurrencyFieldsProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturnType<any>;
  currencyField: string;
  amountField: string;
  amountLabel?: string;
  amountPlaceholder?: string;
  onAmountChange?: (value: string | number) => void;
};

export function AmountCurrencyFields({
  form,
  currencyField,
  amountField,
  amountLabel = "סכום",
  amountPlaceholder = "1000",
  onAmountChange,
}: AmountCurrencyFieldsProps) {
  const currencyProps = form.getInputProps(currencyField);
  const amountProps = form.getInputProps(amountField);

  return (
    <>
      <Select
        label="מטבע"
        data={[...CURRENCY_OPTIONS]}
        {...currencyProps}
      />
      <NumberInput
        label={amountLabel}
        placeholder={amountPlaceholder}
        min={0}
        allowNegative={false}
        decimalScale={MONEY_DECIMAL_SCALE}
        fixedDecimalScale={false}
        thousandSeparator=","
        {...amountProps}
        onChange={(value) => {
          amountProps.onChange?.(value);
          onAmountChange?.(value ?? "");
        }}
      />
    </>
  );
}
