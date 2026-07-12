-- Convert existing whole-unit amounts to minor units (agorot/cents).
UPDATE "Income" SET amount = amount * 100;
UPDATE "Expense" SET amount = amount * 100;
UPDATE "Goal" SET "targetAmount" = "targetAmount" * 100;
UPDATE "AvailableCash" SET amount = amount * 100;
UPDATE "CapitalInvestment" SET amount = amount * 100, "principalAmount" = "principalAmount" * 100;
UPDATE "FutureMoney" SET amount = amount * 100;
UPDATE "User" SET "accumulatedSavings" = "accumulatedSavings" * 100;
UPDATE "CapitalMonthlySnapshot" SET "totalCapital" = "totalCapital" * 100;
