-- CreateEnum
CREATE TYPE "AvailableCashType" AS ENUM ('cash', 'bit', 'paybox', 'daily_deposit', 'other');

-- CreateEnum
CREATE TYPE "CapitalInvestmentType" AS ENUM ('deposit', 'investments', 'pension_fund', 'real_estate', 'other');

-- CreateTable
CREATE TABLE "AvailableCash" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "AvailableCashType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AvailableCash_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CapitalInvestment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "CapitalInvestmentType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CapitalInvestment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FutureMoney" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FutureMoney_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CapitalMonthlySnapshot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "monthKey" TEXT NOT NULL,
    "totalCapital" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CapitalMonthlySnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AvailableCash_userId_idx" ON "AvailableCash"("userId");

-- CreateIndex
CREATE INDEX "CapitalInvestment_userId_idx" ON "CapitalInvestment"("userId");

-- CreateIndex
CREATE INDEX "FutureMoney_userId_idx" ON "FutureMoney"("userId");

-- CreateIndex
CREATE INDEX "CapitalMonthlySnapshot_userId_idx" ON "CapitalMonthlySnapshot"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CapitalMonthlySnapshot_userId_monthKey_key" ON "CapitalMonthlySnapshot"("userId", "monthKey");

-- AddForeignKey
ALTER TABLE "AvailableCash" ADD CONSTRAINT "AvailableCash_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CapitalInvestment" ADD CONSTRAINT "CapitalInvestment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FutureMoney" ADD CONSTRAINT "FutureMoney_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CapitalMonthlySnapshot" ADD CONSTRAINT "CapitalMonthlySnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
