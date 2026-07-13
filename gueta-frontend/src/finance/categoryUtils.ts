import type { SpendingCategory } from "../auth/authApi";

export function findOtherCategory(
  categories: SpendingCategory[],
): SpendingCategory | undefined {
  return categories.find((category) => category.isSystem);
}

export function sortCategoriesForDisplay(
  categories: SpendingCategory[],
): SpendingCategory[] {
  return [...categories].sort((a, b) => {
    if (a.isSystem !== b.isSystem) {
      return a.isSystem ? 1 : -1;
    }
    if (a.sortOrder !== b.sortOrder) {
      return a.sortOrder - b.sortOrder;
    }
    return a.name.localeCompare(b.name, "he");
  });
}

export function getOnboardingCategorySelectData(
  categories: SpendingCategory[],
): { value: string; label: string }[] {
  const other = findOtherCategory(categories);
  const custom = sortCategoriesForDisplay(
    categories.filter((category) => !category.isSystem),
  );

  const options: { value: string; label: string }[] = [];
  if (other) {
    options.push({ value: other.id, label: other.name });
  }
  for (const category of custom) {
    options.push({ value: category.id, label: category.name });
  }
  options.push({
    value: ADD_ONBOARDING_CATEGORY_VALUE,
    label: "הוסף קטגוריה",
  });
  return options;
}

export const ADD_ONBOARDING_CATEGORY_VALUE = "__add_category__";

export function categoriesToSelectData(
  categories: SpendingCategory[],
): { value: string; label: string }[] {
  return categories.map((category) => ({
    value: category.id,
    label: category.name,
  }));
}

export function findCategoryById(
  categories: SpendingCategory[],
  id: string,
): SpendingCategory | undefined {
  return categories.find((category) => category.id === id);
}
