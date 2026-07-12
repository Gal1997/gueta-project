import {
  Accordion,
  ActionIcon,
  Box,
  Select,
  Stack,
  TextInput,
} from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";
import { IconTrash } from "@tabler/icons-react";
import { AmountCurrencyFields } from "../../../../components/AmountCurrencyFields/AmountCurrencyFields";
import { INCOME_TYPES } from "../../../../finance/constants";
import type { IncomeRow, OnboardingFormValues } from "../../consts";
import sectionClasses from "../shared/SectionRow.module.css";
import { SectionFooterActions } from "../shared/SectionFooterActions";

type IncomesSectionProps = {
  form: UseFormReturnType<OnboardingFormValues>;
  values: OnboardingFormValues;
  makeIncome: () => IncomeRow;
  onContinue: () => void;
  onListChange: () => void;
};

export function IncomesSection({
  form,
  values,
  makeIncome,
  onContinue,
  onListChange,
}: IncomesSectionProps) {
  return (
    <Accordion.Item value="incomes">
      <Accordion.Control>הכנסות החודש</Accordion.Control>
      <Accordion.Panel>
        <Stack className={sectionClasses.rows}>
          {values.incomes.map((_, index) => (
            <Box key={`incomes-${index}`} className={sectionClasses.row}>
              <Box className={sectionClasses.fields}>
                <Select
                  label="סוג"
                  placeholder="בחרו"
                  data={INCOME_TYPES}
                  {...form.getInputProps(`incomes.${index}.type`)}
                />
                <TextInput
                  label="מאיפה נכנס הכסף?"
                  placeholder="Nvidia"
                  {...form.getInputProps(`incomes.${index}.source`)}
                />
                <TextInput
                  label="תיאור"
                  placeholder="משכורת חודשית שלי"
                  {...form.getInputProps(`incomes.${index}.description`)}
                />
                <AmountCurrencyFields
                  form={form}
                  currencyField={`incomes.${index}.currency`}
                  amountField={`incomes.${index}.amount`}
                />
              </Box>
              <ActionIcon
                aria-label="מחק שורה"
                className={sectionClasses.deleteButton}
                disabled={values.incomes.length === 1}
                onClick={() => {
                  form.removeListItem("incomes", index);
                  onListChange();
                }}
              >
                <IconTrash />
              </ActionIcon>
            </Box>
          ))}
          <SectionFooterActions
            onAdd={() => {
              form.insertListItem("incomes", makeIncome());
              onListChange();
            }}
            onContinue={onContinue}
          />
        </Stack>
      </Accordion.Panel>
    </Accordion.Item>
  );
}
