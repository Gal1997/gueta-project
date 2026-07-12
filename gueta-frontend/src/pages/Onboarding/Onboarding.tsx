import { Accordion, Box, Button, Group, Stack, Text, Title } from "@mantine/core";
import classes from "./Onboarding.module.css";
import { CapitalSection } from "./components/CapitalSection/CapitalSection";
import { ExpensesSection } from "./components/ExpensesSection/ExpensesSection";
import { GoalsSection } from "./components/GoalsSection/GoalsSection";
import { IncomesSection } from "./components/IncomesSection/IncomesSection";
import { useOnboarding } from "./useOnboarding";

export default function Onboarding() {
  const {
    user,
    form,
    values,
    openSections,
    setOpenSections,
    submitting,
    skipping,
    leaving,
    submitError,
    handleFinish,
    handleContinue,
    handleBack,
    handleSkip,
    bumpFormVersion,
    makeIncome,
    makeExpense,
    makeGoal,
    makeAvailableCash,
    makeInvestment,
    makeFutureMoney,
  } = useOnboarding();

  return (
    <Box className={classes.page}>
      <Box className={classes.card}>
        <Group className={classes.escapeActions}>
          <Button
            className={classes.escapeButton}
            variant="default"
            loading={leaving}
            onClick={() => void handleBack()}
          >
            חזרה
          </Button>
          <Button
            className={classes.escapeButton}
            variant="default"
            loading={skipping}
            onClick={() => void handleSkip()}
          >
            דילוג
          </Button>
        </Group>

        <Stack className={classes.header}>
          <Title className={classes.title} order={1}>
            {user ? `שלום ${user.name}` : "ברוכים הבאים"}
          </Title>
          <Text className={classes.subtitle}>
            מלאו לפי הסדר: ההון שלי, הכנסות והוצאות של החודש, ואז מטרות.
          </Text>
        </Stack>

        <Accordion
          multiple
          value={openSections}
          onChange={setOpenSections}
          className={classes.accordion}
        >
          <CapitalSection
            form={form}
            values={values}
            makeAvailableCash={makeAvailableCash}
            makeInvestment={makeInvestment}
            makeFutureMoney={makeFutureMoney}
            onContinue={() => handleContinue("capital")}
            onListChange={bumpFormVersion}
          />
          <IncomesSection
            form={form}
            values={values}
            makeIncome={makeIncome}
            onContinue={() => handleContinue("incomes")}
            onListChange={bumpFormVersion}
          />
          <ExpensesSection
            form={form}
            values={values}
            makeExpense={makeExpense}
            bumpFormVersion={bumpFormVersion}
            onContinue={() => handleContinue("expenses")}
            onListChange={bumpFormVersion}
          />
          <GoalsSection
            form={form}
            values={values}
            makeGoal={makeGoal}
            onContinue={() => handleContinue("goals")}
            onListChange={bumpFormVersion}
          />
        </Accordion>

        {submitError && <Text className={classes.error}>{submitError}</Text>}

        <Button
          className={classes.finishButton}
          loading={submitting}
          onClick={handleFinish}
        >
          סיום
        </Button>
      </Box>
    </Box>
  );
}
