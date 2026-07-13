-- Reassign expenses from legacy seeded defaults to אחר, then remove those categories.

UPDATE "Expense" e
SET "categoryId" = other_cat."id"
FROM "SpendingCategory" sc
JOIN "SpendingCategory" other_cat
  ON other_cat."userId" = sc."userId"
  AND other_cat."name" = 'אחר'
WHERE e."categoryId" = sc."id"
  AND sc."name" IN ('אוכל', 'קניות', 'דלק', 'בילויים')
  AND sc."isSystem" = false;

DELETE FROM "SpendingCategory"
WHERE "name" IN ('אוכל', 'קניות', 'דלק', 'בילויים')
  AND "isSystem" = false;
