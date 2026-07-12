import {
  Accordion,
  ActionIcon,
  Box,
  Button,
  Select,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import type { UseFormReturnType } from "@mantine/form";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { AmountCurrencyFields } from "../../../../components/AmountCurrencyFields/AmountCurrencyFields";
import {
  AVAILABLE_CASH_TYPES,
  CAPITAL_INVESTMENT_TYPES,
} from "../../../../finance/capitalConstants";
import type {
  AvailableCashRow,
  FutureMoneyRow,
  InvestmentRow,
  OnboardingFormValues,
} from "../../consts";
import sectionClasses from "../shared/SectionRow.module.css";
import { SectionFooterActions } from "../shared/SectionFooterActions";
import classes from "./CapitalSection.module.css";

type CapitalSectionProps = {
  form: UseFormReturnType<OnboardingFormValues>;
  values: OnboardingFormValues;
  makeAvailableCash: () => AvailableCashRow;
  makeInvestment: () => InvestmentRow;
  makeFutureMoney: () => FutureMoneyRow;
  onContinue: () => void;
  onListChange: () => void;
};

export function CapitalSection({
  form,
  values,
  makeAvailableCash,
  makeInvestment,
  makeFutureMoney,
  onContinue,
  onListChange,
}: CapitalSectionProps) {
  return (
    <Accordion.Item value="capital">
      <Accordion.Control>ההון שלי</Accordion.Control>
      <Accordion.Panel>
        <Stack className={classes.groups}>
          <Stack className={sectionClasses.rows}>
            <Text className={classes.groupTitle}>כסף זמין</Text>
            {values.availableCash.map((_, index) => (
              <Box
                key={`availableCash-${index}`}
                className={sectionClasses.row}
              >
                <Box className={sectionClasses.fields}>
                  <Select
                    label="סוג"
                    placeholder="בחרו"
                    data={AVAILABLE_CASH_TYPES}
                    {...form.getInputProps(`availableCash.${index}.type`)}
                  />
                  <AmountCurrencyFields
                    form={form}
                    currencyField={`availableCash.${index}.currency`}
                    amountField={`availableCash.${index}.amount`}
                  />
                </Box>
                <ActionIcon
                  aria-label="מחק שורה"
                  className={sectionClasses.deleteButton}
                  disabled={values.availableCash.length === 1}
                  onClick={() => {
                    form.removeListItem("availableCash", index);
                    onListChange();
                  }}
                >
                  <IconTrash />
                </ActionIcon>
              </Box>
            ))}
            <Button
              className={sectionClasses.addButton}
              leftSection={<IconPlus />}
              onClick={() => {
                form.insertListItem("availableCash", makeAvailableCash());
                onListChange();
              }}
            >
              הוסף שורה
            </Button>
          </Stack>

          <Stack className={sectionClasses.rows}>
            <Text className={classes.groupTitle}>השקעות</Text>
            {values.investments.map((_, index) => (
              <Box
                key={`investments-${index}`}
                className={sectionClasses.row}
              >
                <Box className={sectionClasses.fields}>
                  <Select
                    label="סוג"
                    placeholder="בחרו"
                    data={CAPITAL_INVESTMENT_TYPES}
                    {...form.getInputProps(`investments.${index}.type`)}
                  />
                  <AmountCurrencyFields
                    form={form}
                    currencyField={`investments.${index}.currency`}
                    amountField={`investments.${index}.amount`}
                  />
                </Box>
                <ActionIcon
                  aria-label="מחק שורה"
                  className={sectionClasses.deleteButton}
                  disabled={values.investments.length === 1}
                  onClick={() => {
                    form.removeListItem("investments", index);
                    onListChange();
                  }}
                >
                  <IconTrash />
                </ActionIcon>
              </Box>
            ))}
            <Button
              className={sectionClasses.addButton}
              leftSection={<IconPlus />}
              onClick={() => {
                form.insertListItem("investments", makeInvestment());
                onListChange();
              }}
            >
              הוסף שורה
            </Button>
          </Stack>

          <Stack className={sectionClasses.rows}>
            <Text className={classes.groupTitle}>כסף עתידי</Text>
            {values.futureMoney.map((_, index) => (
              <Box
                key={`futureMoney-${index}`}
                className={sectionClasses.row}
              >
                <Box className={sectionClasses.fields}>
                  <TextInput
                    label="תיאור"
                    placeholder="חוב מדוד"
                    {...form.getInputProps(`futureMoney.${index}.description`)}
                  />
                  <AmountCurrencyFields
                    form={form}
                    currencyField={`futureMoney.${index}.currency`}
                    amountField={`futureMoney.${index}.amount`}
                  />
                  <DatePickerInput
                    label="צפי תשלום"
                    placeholder="בחרו תאריך (אופציונלי)"
                    valueFormat="DD/MM/YYYY"
                    clearable
                    {...form.getInputProps(
                      `futureMoney.${index}.expectedPaymentDate`,
                    )}
                  />
                </Box>
                <ActionIcon
                  aria-label="מחק שורה"
                  className={sectionClasses.deleteButton}
                  disabled={values.futureMoney.length === 1}
                  onClick={() => {
                    form.removeListItem("futureMoney", index);
                    onListChange();
                  }}
                >
                  <IconTrash />
                </ActionIcon>
              </Box>
            ))}
          </Stack>
        </Stack>
        <SectionFooterActions
          onAdd={() => {
            form.insertListItem("futureMoney", makeFutureMoney());
            onListChange();
          }}
          onContinue={onContinue}
        />
      </Accordion.Panel>
    </Accordion.Item>
  );
}
