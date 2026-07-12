-- CreateEnum
CREATE TYPE "ExpenseRecurrence" AS ENUM ('recurring', 'once');

-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "recurrence" "ExpenseRecurrence" NOT NULL DEFAULT 'recurring';
