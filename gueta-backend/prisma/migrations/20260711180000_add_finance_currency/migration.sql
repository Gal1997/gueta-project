-- AlterTable
ALTER TABLE "Income" ADD COLUMN "currency" "Currency" NOT NULL DEFAULT 'ILS';

-- AlterTable
ALTER TABLE "Expense" ADD COLUMN "currency" "Currency" NOT NULL DEFAULT 'ILS';

-- AlterTable
ALTER TABLE "Goal" ADD COLUMN "currency" "Currency" NOT NULL DEFAULT 'ILS';
