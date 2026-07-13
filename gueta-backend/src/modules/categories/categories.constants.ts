export const OTHER_CATEGORY_NAME = "אחר";

export const LEGACY_DEFAULT_CATEGORY_NAMES = [
  "אוכל",
  "קניות",
  "דלק",
  "בילויים",
] as const;

export const OTHER_CATEGORY_DEFAULTS = {
  name: OTHER_CATEGORY_NAME,
  color: "#748ffc",
  isSystem: true,
  sortOrder: 99,
} as const;
