-- AlterTable
ALTER TABLE "Expense" ADD COLUMN "totalPayments" INTEGER;

-- Backfill debt expenses: best-effort from remaining payments at migration time
UPDATE "Expense"
SET "totalPayments" = "remainingPayments"
WHERE category = 'debt'
  AND recurrence = 'recurring'
  AND "remainingPayments" > 0;
