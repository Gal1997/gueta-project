import {
  Accordion,
  ActionIcon,
  Box,
  Stack,
  TextInput,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import type { UseFormReturnType } from "@mantine/form";
import { IconTrash } from "@tabler/icons-react";
import { AmountCurrencyFields } from "../../../../components/AmountCurrencyFields/AmountCurrencyFields";
import type { GoalRow, OnboardingFormValues } from "../../consts";
import sectionClasses from "../shared/SectionRow.module.css";
import { SectionFooterActions } from "../shared/SectionFooterActions";

type GoalsSectionProps = {
  form: UseFormReturnType<OnboardingFormValues>;
  values: OnboardingFormValues;
  makeGoal: () => GoalRow;
  onContinue: () => void;
  onListChange: () => void;
};

export function GoalsSection({
  form,
  values,
  makeGoal,
  onContinue,
  onListChange,
}: GoalsSectionProps) {
  return (
    <Accordion.Item value="goals">
      <Accordion.Control>מטרות</Accordion.Control>
      <Accordion.Panel>
        <Stack className={sectionClasses.rows}>
          {values.goals.map((_, index) => (
            <Box key={`goals-${index}`} className={sectionClasses.row}>
              <Box className={sectionClasses.fields}>
                <TextInput
                  label="תיאור"
                  placeholder="תאילנד"
                  {...form.getInputProps(`goals.${index}.description`)}
                />
                <AmountCurrencyFields
                  form={form}
                  currencyField={`goals.${index}.currency`}
                  amountField={`goals.${index}.targetAmount`}
                  amountLabel="סכום דרוש"
                  amountPlaceholder="20000"
                />
                <DatePickerInput
                  label="תאריך"
                  placeholder="בחרו תאריך"
                  valueFormat="DD/MM/YYYY"
                  {...form.getInputProps(`goals.${index}.targetDate`)}
                />
              </Box>
              <ActionIcon
                aria-label="מחק שורה"
                className={sectionClasses.deleteButton}
                disabled={values.goals.length === 1}
                onClick={() => {
                  form.removeListItem("goals", index);
                  onListChange();
                }}
              >
                <IconTrash />
              </ActionIcon>
            </Box>
          ))}
          <SectionFooterActions
            onAdd={() => {
              form.insertListItem("goals", makeGoal());
              onListChange();
            }}
            onContinue={onContinue}
          />
        </Stack>
      </Accordion.Panel>
    </Accordion.Item>
  );
}
