-- Remove GBP from Currency enum
ALTER TYPE "Currency" RENAME TO "Currency_old";
CREATE TYPE "Currency" AS ENUM ('ILS', 'USD', 'EUR');

ALTER TABLE "AvailableCash" ALTER COLUMN "currency" DROP DEFAULT;
ALTER TABLE "AvailableCash"
  ALTER COLUMN "currency" TYPE "Currency"
  USING ("currency"::text::"Currency");
ALTER TABLE "AvailableCash" ALTER COLUMN "currency" SET DEFAULT 'ILS';

ALTER TABLE "CapitalInvestment" ALTER COLUMN "currency" DROP DEFAULT;
ALTER TABLE "CapitalInvestment"
  ALTER COLUMN "currency" TYPE "Currency"
  USING ("currency"::text::"Currency");
ALTER TABLE "CapitalInvestment" ALTER COLUMN "currency" SET DEFAULT 'ILS';

ALTER TABLE "FutureMoney" ALTER COLUMN "currency" DROP DEFAULT;
ALTER TABLE "FutureMoney"
  ALTER COLUMN "currency" TYPE "Currency"
  USING ("currency"::text::"Currency");
ALTER TABLE "FutureMoney" ALTER COLUMN "currency" SET DEFAULT 'ILS';

DROP TYPE "Currency_old";
