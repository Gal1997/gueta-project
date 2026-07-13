-- CreateEnum
CREATE TYPE "ExpenseKind" AS ENUM ('debt', 'fixed', 'once');

-- CreateTable
CREATE TABLE "SpendingCategory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#748ffc',
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpendingCategory_pkey" PRIMARY KEY ("id")
);

-- Seed default categories per user
INSERT INTO "SpendingCategory" ("id", "userId", "name", "color", "isSystem", "sortOrder", "createdAt", "updatedAt")
SELECT
    ('cat_' || substr(md5(u."id" || defaults.name), 1, 24)),
    u."id",
    defaults.name,
    defaults.color,
    defaults."isSystem",
    defaults."sortOrder",
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "User" u
CROSS JOIN (
    VALUES
        ('אוכל', '#ffa94d', false, 0),
        ('קניות', '#b197fc', false, 1),
        ('דלק', '#22b8cf', false, 2),
        ('בילויים', '#f783ac', false, 3),
        ('אחר', '#748ffc', true, 99)
) AS defaults(name, color, "isSystem", "sortOrder");

-- Add new columns to Expense
ALTER TABLE "Expense" ADD COLUMN "kind" "ExpenseKind";
ALTER TABLE "Expense" ADD COLUMN "categoryId" TEXT;

-- Migrate existing expense rows
UPDATE "Expense" e
SET
    "kind" = CASE
        WHEN e."recurrence" = 'once' THEN 'once'::"ExpenseKind"
        WHEN e."category" = 'debt' THEN 'debt'::"ExpenseKind"
        ELSE 'fixed'::"ExpenseKind"
    END,
    "categoryId" = sc."id"
FROM "SpendingCategory" sc
WHERE sc."userId" = e."userId"
  AND (
    (e."recurrence" = 'once' AND e."category" = 'food' AND sc."name" = 'אוכל')
    OR (e."recurrence" = 'once' AND e."category" = 'shopping' AND sc."name" = 'קניות')
    OR (e."recurrence" = 'once' AND e."category" = 'fuel' AND sc."name" = 'דלק')
    OR (e."recurrence" = 'once' AND e."category" = 'other' AND sc."name" = 'אחר')
    OR (e."recurrence" = 'recurring' AND sc."name" = 'אחר')
  );

-- Fallback any unmigrated rows to אחר
UPDATE "Expense" e
SET
    "kind" = CASE
        WHEN e."recurrence" = 'once' THEN 'once'::"ExpenseKind"
        WHEN e."category" = 'debt' THEN 'debt'::"ExpenseKind"
        ELSE 'fixed'::"ExpenseKind"
    END,
    "categoryId" = sc."id"
FROM "SpendingCategory" sc
WHERE e."categoryId" IS NULL
  AND sc."userId" = e."userId"
  AND sc."name" = 'אחר';

ALTER TABLE "Expense" ALTER COLUMN "kind" SET NOT NULL;
ALTER TABLE "Expense" ALTER COLUMN "categoryId" SET NOT NULL;

-- Drop old category column and enum
ALTER TABLE "Expense" DROP COLUMN "category";
DROP TYPE "ExpenseCategory";

-- CreateIndex
CREATE INDEX "SpendingCategory_userId_idx" ON "SpendingCategory"("userId");
CREATE UNIQUE INDEX "SpendingCategory_userId_name_key" ON "SpendingCategory"("userId", "name");
CREATE INDEX "Expense_categoryId_idx" ON "Expense"("categoryId");

-- AddForeignKey
ALTER TABLE "SpendingCategory" ADD CONSTRAINT "SpendingCategory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "SpendingCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
