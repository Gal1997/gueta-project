import type { CategoryAllocation } from "@prisma/client";
import { prisma } from "../../db/prisma";
import { HttpError } from "../../lib/errors";
import { mapCategoryAllocation } from "../../lib/moneyMappers";
import { assertCategoryBelongsToUser } from "../categories/categories.service";
import type {
  CategoryAllocationInput,
  CategoryAllocationUpdate,
} from "./finance.schemas";

export type MappedCategoryAllocation = ReturnType<typeof mapCategoryAllocation>;

async function assertAllocationOwner(userId: string, id: string) {
  const allocation = await prisma.categoryAllocation.findFirst({
    where: { id, userId },
    include: { category: true },
  });
  if (!allocation) {
    throw new HttpError(404, "מעקב תקציב לא נמצא");
  }
  return allocation;
}

export async function listCategoryAllocations(
  userId: string,
): Promise<MappedCategoryAllocation[]> {
  const allocations = await prisma.categoryAllocation.findMany({
    where: { userId },
    include: { category: true },
    orderBy: [{ category: { sortOrder: "asc" } }, { category: { name: "asc" } }],
  });
  return allocations.map(mapCategoryAllocation);
}

export async function createCategoryAllocation(
  userId: string,
  data: CategoryAllocationInput,
): Promise<MappedCategoryAllocation> {
  await assertCategoryBelongsToUser(userId, data.categoryId);

  const duplicate = await prisma.categoryAllocation.findFirst({
    where: { userId, categoryId: data.categoryId },
  });
  if (duplicate) {
    throw new HttpError(409, "כבר קיים מעקב לקטגוריה זו");
  }

  const allocation = await prisma.categoryAllocation.create({
    data: {
      userId,
      categoryId: data.categoryId,
      amount: data.amount,
      currency: data.currency ?? "ILS",
    },
    include: { category: true },
  });

  return mapCategoryAllocation(allocation);
}

export async function updateCategoryAllocation(
  userId: string,
  id: string,
  data: CategoryAllocationUpdate,
): Promise<MappedCategoryAllocation> {
  const existing = await assertAllocationOwner(userId, id);

  if (data.categoryId && data.categoryId !== existing.categoryId) {
    await assertCategoryBelongsToUser(userId, data.categoryId);
    const duplicate = await prisma.categoryAllocation.findFirst({
      where: { userId, categoryId: data.categoryId, NOT: { id } },
    });
    if (duplicate) {
      throw new HttpError(409, "כבר קיים מעקב לקטגוריה זו");
    }
  }

  const allocation = await prisma.categoryAllocation.update({
    where: { id },
    data: {
      ...(data.categoryId !== undefined ? { categoryId: data.categoryId } : {}),
      ...(data.amount !== undefined ? { amount: data.amount } : {}),
      ...(data.currency !== undefined ? { currency: data.currency } : {}),
    },
    include: { category: true },
  });

  return mapCategoryAllocation(allocation);
}

export async function deleteCategoryAllocation(
  userId: string,
  id: string,
): Promise<void> {
  await assertAllocationOwner(userId, id);
  await prisma.categoryAllocation.delete({ where: { id } });
}
