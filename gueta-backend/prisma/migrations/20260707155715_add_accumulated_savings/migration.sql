-- AlterTable
ALTER TABLE "User" ADD COLUMN     "accumulatedSavings" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "savingsRolledUpThrough" TEXT;
