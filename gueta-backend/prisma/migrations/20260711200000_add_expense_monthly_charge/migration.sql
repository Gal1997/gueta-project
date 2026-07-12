-- AlterTable
ALTER TABLE "Expense" ADD COLUMN "monthlyCharge" INTEGER;

-- Backfill debt monthly charges from total / remaining payments
UPDATE "Expense"
SET "monthlyCharge" = ROUND(amount::numeric / NULLIF("remainingPayments", 0))::integer
WHERE category = 'debt'
  AND recurrence = 'recurring'
  AND "remainingPayments" > 0;
