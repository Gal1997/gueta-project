-- Demo data for avi@avi.com (UTF-8)
DELETE FROM "Income" WHERE id LIKE 'cmrdemo%';
DELETE FROM "Expense" WHERE id LIKE 'cmrdemo%';
DELETE FROM "Goal" WHERE id LIKE 'cmrdemo%';

INSERT INTO "Income" (id, "userId", type, source, description, amount, "createdAt") VALUES
  ('cmrdemoinc001', 'cmrappcic0000tz24yrd6kjkw', 'salary', 'חברת הייטק', 'משכורת ראשית', 18500, NOW()),
  ('cmrdemoinc002', 'cmrappcic0000tz24yrd6kjkw', 'other', 'פרילנס', 'פרויקט UI', 3200, NOW()),
  ('cmrdemoinc003', 'cmrappcic0000tz24yrd6kjkw', 'investments', 'דיבידנדים', 'תיק מניות', 850, NOW());

INSERT INTO "Expense" (id, "userId", category, name, amount, description, "remainingPayments", "billingDate", "createdAt") VALUES
  ('cmrdemoexp001', 'cmrappcic0000tz24yrd6kjkw', 'fixed', 'חשמל', 420, 'חשבון חודשי', 1, '2026-08-05', NOW()),
  ('cmrdemoexp002', 'cmrappcic0000tz24yrd6kjkw', 'fixed', 'מים', 110, 'חשבון חודשי', 1, '2026-08-10', NOW()),
  ('cmrdemoexp003', 'cmrappcic0000tz24yrd6kjkw', 'fixed', 'אינטרנט', 190, 'ספק תקשורת', 1, '2026-08-01', NOW()),
  ('cmrdemoexp004', 'cmrappcic0000tz24yrd6kjkw', 'fixed', 'סופרמרקט', 2400, 'קניות שבועיות', 1, '2026-08-12', NOW()),
  ('cmrdemoexp005', 'cmrappcic0000tz24yrd6kjkw', 'fixed', 'תחבורה', 750, 'דלק ורב-קו', 1, '2026-08-15', NOW()),
  ('cmrdemoexp006', 'cmrappcic0000tz24yrd6kjkw', 'fixed', 'ביטוח בריאות', 380, 'פרמיה חודשית', 1, '2026-08-20', NOW()),
  ('cmrdemoexp007', 'cmrappcic0000tz24yrd6kjkw', 'debt', 'הלוואת רכב', 1350, 'תשלום חודשי', 18, '2026-08-25', NOW()),
  ('cmrdemoexp008', 'cmrappcic0000tz24yrd6kjkw', 'debt', 'כרטיס אשראי', 900, 'תשלום מינימום', 6, '2026-08-28', NOW());

INSERT INTO "Goal" (id, "userId", description, "targetAmount", "targetDate", "createdAt") VALUES
  ('cmrdemogoal001', 'cmrappcic0000tz24yrd6kjkw', 'קרן חירום', 30000, '2027-06-01', NOW()),
  ('cmrdemogoal002', 'cmrappcic0000tz24yrd6kjkw', 'רכב חדש', 80000, '2028-12-01', NOW()),
  ('cmrdemogoal003', 'cmrappcic0000tz24yrd6kjkw', 'שיפוץ דירה', 45000, '2027-03-01', NOW());

UPDATE "User"
SET "accumulatedSavings" = 4200,
    "savingsRolledUpThrough" = '2026-07'
WHERE email = 'avi@avi.com';
