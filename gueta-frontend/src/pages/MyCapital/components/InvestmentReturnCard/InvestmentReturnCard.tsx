import { Box, Text } from "@mantine/core";
import {
  INVESTMENT_DEPOSITS_LABEL,
  INVESTMENT_RETURN_LABEL,
} from "../../consts";
import { currency, formatReturn } from "../../utils";
import classes from "./InvestmentReturnCard.module.css";

type InvestmentReturnCardProps = {
  totalReturn: number;
  totalDeposits: number;
};

export function InvestmentReturnCard({
  totalReturn,
  totalDeposits,
}: InvestmentReturnCardProps) {
  const valueClass =
    totalReturn > 0
      ? classes.returnPositive
      : totalReturn < 0
        ? classes.returnNegative
        : classes.returnNeutral;

  return (
    <Box className={classes.statsRow}>
      <Box className={classes.statCard}>
        <Text className={classes.statLabel}>{INVESTMENT_DEPOSITS_LABEL}</Text>
        <Text className={classes.depositsValue}>
          {currency.format(totalDeposits)}
        </Text>
      </Box>
      <Box className={classes.statCard}>
        <Text className={classes.statLabel}>{INVESTMENT_RETURN_LABEL}</Text>
        <Text className={valueClass}>{formatReturn(totalReturn)}</Text>
      </Box>
    </Box>
  );
}
