-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('ILS', 'USD', 'EUR', 'GBP');

-- AlterTable
ALTER TABLE "AvailableCash" ADD COLUMN "currency" "Currency" NOT NULL DEFAULT 'ILS';

-- AlterTable
ALTER TABLE "CapitalInvestment" ADD COLUMN "currency" "Currency" NOT NULL DEFAULT 'ILS';

-- AlterTable
ALTER TABLE "FutureMoney" ADD COLUMN "currency" "Currency" NOT NULL DEFAULT 'ILS';
