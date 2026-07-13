import type { SpendingCategory } from "@prisma/client";
import { prisma } from "../../db/prisma";
import { HttpError } from "../../lib/errors";
import {
  LEGACY_DEFAULT_CATEGORY_NAMES,
  OTHER_CATEGORY_DEFAULTS,
  OTHER_CATEGORY_NAME,
} from "./categories.constants";
import type { CategoryInput, CategoryUpdate } from "./categories.schemas";

type DbClient = typeof prisma;

async function ensureOtherCategory(
  userId: string,
  db: DbClient = prisma,
): Promise<SpendingCategory> {
  const existing = await db.spendingCategory.findFirst({
    where: { userId, name: OTHER_CATEGORY_NAME },
  });
  if (existing) {
    return existing;
  }

  return db.spendingCategory.create({
    data: {
      userId,
      name: OTHER_CATEGORY_DEFAULTS.name,
      color: OTHER_CATEGORY_DEFAULTS.color,
      isSystem: OTHER_CATEGORY_DEFAULTS.isSystem,
      sortOrder: OTHER_CATEGORY_DEFAULTS.sortOrder,
    },
  });
}

async function removeLegacyDefaultCategories(
  userId: string,
  db: DbClient = prisma,
): Promise<void> {
  const other = await db.spendingCategory.findFirst({
    where: { userId, name: OTHER_CATEGORY_NAME },
  });
  if (!other) {
    return;
  }

  const legacy = await db.spendingCategory.findMany({
    where: {
      userId,
      isSystem: false,
      name: { in: [...LEGACY_DEFAULT_CATEGORY_NAMES] },
    },
    select: { id: true },
  });
  if (legacy.length === 0) {
    return;
  }

  const legacyIds = legacy.map((category) => category.id);

  await db.$transaction(async (tx) => {
    await tx.expense.updateMany({
      where: { userId, categoryId: { in: legacyIds } },
      data: { categoryId: other.id },
    });
    await tx.spendingCategory.deleteMany({
      where: { id: { in: legacyIds } },
    });
  });
}

export async function seedDefaultCategories(
  userId: string,
  db: DbClient = prisma,
): Promise<SpendingCategory[]> {
  const existing = await db.spendingCategory.count({ where: { userId } });
  if (existing === 0) {
    await db.spendingCategory.create({
      data: {
        userId,
        name: OTHER_CATEGORY_DEFAULTS.name,
        color: OTHER_CATEGORY_DEFAULTS.color,
        isSystem: OTHER_CATEGORY_DEFAULTS.isSystem,
        sortOrder: OTHER_CATEGORY_DEFAULTS.sortOrder,
      },
    });
  }

  await ensureOtherCategory(userId, db);
  await removeLegacyDefaultCategories(userId, db);

  return db.spendingCategory.findMany({
    where: { userId },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function ensureDefaultCategories(
  userId: string,
): Promise<SpendingCategory[]> {
  await ensureOtherCategory(userId);
  await removeLegacyDefaultCategories(userId);
  return prisma.spendingCategory.findMany({
    where: { userId },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function listCategories(
  userId: string,
): Promise<SpendingCategory[]> {
  await ensureDefaultCategories(userId);
  return prisma.spendingCategory.findMany({
    where: { userId },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function getOtherCategoryId(userId: string): Promise<string> {
  await ensureDefaultCategories(userId);
  const other = await prisma.spendingCategory.findFirst({
    where: { userId, name: OTHER_CATEGORY_NAME },
  });
  if (!other) {
    throw new HttpError(500, "Default category missing");
  }
  return other.id;
}

async function assertCategoryOwner(userId: string, id: string) {
  const category = await prisma.spendingCategory.findFirst({
    where: { id, userId },
  });
  if (!category) {
    throw new HttpError(404, "Category not found");
  }
  return category;
}

export async function assertCategoryBelongsToUser(
  userId: string,
  categoryId: string,
): Promise<SpendingCategory> {
  return assertCategoryOwner(userId, categoryId);
}

export async function createCategory(
  userId: string,
  data: CategoryInput,
): Promise<SpendingCategory> {
  await ensureDefaultCategories(userId);

  const duplicate = await prisma.spendingCategory.findFirst({
    where: { userId, name: data.name },
  });
  if (duplicate) {
    throw new HttpError(409, "קטגוריה בשם זה כבר קיימת");
  }

  const maxSort = await prisma.spendingCategory.aggregate({
    where: { userId },
    _max: { sortOrder: true },
  });

  return prisma.spendingCategory.create({
    data: {
      userId,
      name: data.name,
      color: data.color ?? "#748ffc",
      sortOrder: (maxSort._max.sortOrder ?? 0) + 1,
    },
  });
}

export async function updateCategory(
  userId: string,
  id: string,
  data: CategoryUpdate,
): Promise<SpendingCategory> {
  const existing = await assertCategoryOwner(userId, id);

  if (data.name && data.name !== existing.name) {
    const duplicate = await prisma.spendingCategory.findFirst({
      where: { userId, name: data.name, NOT: { id } },
    });
    if (duplicate) {
      throw new HttpError(409, "קטגוריה בשם זה כבר קיימת");
    }
  }

  return prisma.spendingCategory.update({
    where: { id },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.color !== undefined ? { color: data.color } : {}),
    },
  });
}

export async function deleteCategory(
  userId: string,
  id: string,
): Promise<void> {
  const existing = await assertCategoryOwner(userId, id);
  if (existing.isSystem) {
    throw new HttpError(400, "לא ניתן למחוק קטגוריית מערכת");
  }

  const otherId = await getOtherCategoryId(userId);

  await prisma.$transaction(async (tx) => {
    await tx.expense.updateMany({
      where: { userId, categoryId: id },
      data: { categoryId: otherId },
    });
    await tx.spendingCategory.delete({ where: { id } });
  });
}
