import { NumberInput, SegmentedControl, Select, Text, TextInput } from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";
import { CAPITAL_INVESTMENT_TYPES } from "../../../../../finance/capitalConstants";
import { CURRENCY_OPTIONS, formatMoney } from "../../../../../finance/currency";
import { MONEY_DECIMAL_SCALE } from "../../../../../finance/money";
import type { CapitalCurrency } from "../../../../../auth/authApi";
import type { InvestmentFormValues } from "../../consts";
import {
  INVESTMENT_FIELD_LABELS,
  INVESTMENT_UPDATE_MODES,
} from "../../consts";
import classes from "./InvestmentFormFields.module.css";

type InvestmentFormFieldsProps = {
  form: UseFormReturnType<InvestmentFormValues>;
  mode: "add" | "edit";
};

function InvestmentUrlField({
  form,
}: {
  form: UseFormReturnType<InvestmentFormValues>;
}) {
  return (
    <TextInput
      label={INVESTMENT_FIELD_LABELS.url}
      description={INVESTMENT_FIELD_LABELS.urlHint}
      placeholder={INVESTMENT_FIELD_LABELS.urlPlaceholder}
      {...form.getInputProps("url")}
    />
  );
}

function InvestmentDescriptionField({
  form,
}: {
  form: UseFormReturnType<InvestmentFormValues>;
}) {
  return (
    <TextInput
      label={INVESTMENT_FIELD_LABELS.description}
      description={INVESTMENT_FIELD_LABELS.descriptionHint}
      placeholder="לדוגמה: קרן מנורה"
      {...form.getInputProps("description")}
    />
  );
}

export function InvestmentFormFields({ form, mode }: InvestmentFormFieldsProps) {
  const isEdit = mode === "edit";
  const updateMode = form.values.updateMode;
  const showCurrentAmount =
    isEdit && updateMode !== "link" && updateMode !== "description";

  return (
    <>
      <Select
        label="סוג"
        placeholder="בחרו"
        data={CAPITAL_INVESTMENT_TYPES}
        disabled={isEdit}
        {...form.getInputProps("type")}
      />

      {isEdit ? (
        <>
          {showCurrentAmount ? (
            <Text className={classes.currentAmount}>
              {INVESTMENT_FIELD_LABELS.currentAmount}:{" "}
              {formatMoney(
                Number(form.values.amount) || 0,
                (form.values.currency || "ILS") as CapitalCurrency,
              )}
            </Text>
          ) : null}

          {updateMode === "link" ? (
            <InvestmentUrlField form={form} />
          ) : updateMode === "description" ? (
            <InvestmentDescriptionField form={form} />
          ) : (
            <>
              <SegmentedControl
                className={classes.updateMode}
                data={[...INVESTMENT_UPDATE_MODES]}
                {...form.getInputProps("updateMode")}
              />

              {updateMode === "contribution" ? (
                <NumberInput
                  label={INVESTMENT_FIELD_LABELS.contribution}
                  description={INVESTMENT_FIELD_LABELS.contributionHint}
                  placeholder="500 או -200"
                  allowNegative
                  decimalScale={MONEY_DECIMAL_SCALE}
                  thousandSeparator=","
                  {...form.getInputProps("contribution")}
                />
              ) : (
                <NumberInput
                  label={INVESTMENT_FIELD_LABELS.valuationAmount}
                  placeholder="1000"
                  min={0}
                  allowNegative={false}
                  decimalScale={MONEY_DECIMAL_SCALE}
                  thousandSeparator=","
                  {...form.getInputProps("valuationAmount")}
                />
              )}
            </>
          )}
        </>
      ) : (
        <>
          <InvestmentDescriptionField form={form} />
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
          <InvestmentUrlField form={form} />
        </>
      )}
    </>
  );
}
