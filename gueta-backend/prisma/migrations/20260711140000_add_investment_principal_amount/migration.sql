-- AlterTable
ALTER TABLE "CapitalInvestment" ADD COLUMN "principalAmount" INTEGER;

UPDATE "CapitalInvestment" SET "principalAmount" = "amount" WHERE "principalAmount" IS NULL;

ALTER TABLE "CapitalInvestment" ALTER COLUMN "principalAmount" SET NOT NULL;
