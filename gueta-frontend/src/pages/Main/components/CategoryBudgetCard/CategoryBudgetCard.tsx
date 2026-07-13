import {
  ActionIcon,
  Box,
  Button,
  Group,
  NumberInput,
  Progress,
  Select,
  Stack,
  Text,
} from "@mantine/core";
import { IconPencil, IconPlus, IconTrash } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import type {
  ExchangeRates,
  SpendingCategory,
  StoredCategoryAllocation,
} from "../../../../auth/authApi";
import {
  createCategoryAllocation,
  deleteCategoryAllocation,
  updateCategoryAllocation,
} from "../../../../auth/authApi";
import { convertToIls, formatMoney } from "../../../../finance/currency";
import { categoriesToSelectData, sortCategoriesForDisplay } from "../../../../finance/categoryUtils";
import { MONEY_DECIMAL_SCALE } from "../../../../finance/money";
import { REQUIRED } from "../../../../finance/constants";
import chartClasses from "../DashboardCharts/DashboardCharts.module.css";
import { DeleteConfirmModal } from "../DeleteConfirmModal/DeleteConfirmModal";
import classes from "./CategoryBudgetCard.module.css";

type CategoryBudgetCardProps = {
  allocations: StoredCategoryAllocation[];
  categories: SpendingCategory[];
  categorySpentMap: Record<string, number>;
  exchangeRates: ExchangeRates;
  onChanged: () => void | Promise<void>;
};

type DraftState = {
  categoryId: string;
  amount: number | string;
};

function formatIls(amount: number): string {
  return formatMoney(amount, "ILS");
}

export function CategoryBudgetCard({
  allocations,
  categories,
  categorySpentMap,
  exchangeRates,
  onChanged,
}: CategoryBudgetCardProps) {
  const [draft, setDraft] = useState<DraftState | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const sortedCategories = useMemo(
    () => sortCategoriesForDisplay(categories),
    [categories],
  );

  const trackedCategoryIds = useMemo(
    () => new Set(allocations.map((allocation) => allocation.categoryId)),
    [allocations],
  );

  function categoryOptionsFor(excludeAllocationId?: string) {
    const currentCategoryId = excludeAllocationId
      ? allocations.find((allocation) => allocation.id === excludeAllocationId)
          ?.categoryId
      : undefined;

    return categoriesToSelectData(
      sortedCategories.filter(
        (category) =>
          category.id === currentCategoryId ||
          !trackedCategoryIds.has(category.id),
      ),
    );
  }

  function allocatedIls(allocation: StoredCategoryAllocation): number {
    return convertToIls(
      allocation.amount,
      allocation.currency,
      exchangeRates.toIls,
    );
  }

  async function handleSaveDraft() {
    if (!draft?.categoryId) {
      setError(REQUIRED);
      return;
    }
    const amount = Number(draft.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("יש להזין סכום חיובי");
      return;
    }

    setSaving(true);
    setError("");
    try {
      if (editingId) {
        await updateCategoryAllocation(editingId, {
          categoryId: draft.categoryId,
          amount,
          currency: "ILS",
        });
      } else {
        await createCategoryAllocation({
          categoryId: draft.categoryId,
          amount,
          currency: "ILS",
        });
      }
      setDraft(null);
      setEditingId(null);
      await onChanged();
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "שמירה נכשלה",
      );
    } finally {
      setSaving(false);
    }
  }

  const deleteConfirmTarget = useMemo(() => {
    if (!deleteConfirmId) return null;
    const allocation = allocations.find((item) => item.id === deleteConfirmId);
    if (!allocation) return null;
    return {
      entity: "expense" as const,
      recordId: allocation.id,
      label: `מעקב תקציב · ${allocation.category.name}`,
    };
  }, [allocations, deleteConfirmId]);

  async function handleDelete(id: string) {
    setDeletingId(id);
    setError("");
    try {
      await deleteCategoryAllocation(id);
      if (editingId === id) {
        setEditingId(null);
        setDraft(null);
      }
      await onChanged();
      setDeleteConfirmId(null);
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : "מחיקה נכשלה",
      );
    } finally {
      setDeletingId(null);
    }
  }

  function startAdd() {
    setEditingId(null);
    setDraft({ categoryId: "", amount: "" });
    setError("");
  }

  function startEdit(allocation: StoredCategoryAllocation) {
    setEditingId(allocation.id);
    setDraft({
      categoryId: allocation.categoryId,
      amount: allocation.amount,
    });
    setError("");
  }

  function cancelDraft() {
    setDraft(null);
    setEditingId(null);
    setError("");
  }

  return (
    <Box className={chartClasses.chartCard}>
      <Text className={chartClasses.cardTitle}>תקציב לפי קטגוריה</Text>

      <Box className={classes.cardBody}>
      <Stack className={classes.stack}>
        {allocations.length === 0 && !draft ? (
          <Text className={classes.emptyText}>אין מעקב תקציב. הוסיפו מעקב ראשון.</Text>
        ) : null}

        {allocations.map((allocation) => {
          if (editingId === allocation.id && draft) {
            return (
              <Box key={allocation.id} className={classes.editRow}>
                <Select
                  label="קטגוריה"
                  placeholder="בחרו"
                  data={categoryOptionsFor(allocation.id)}
                  value={draft.categoryId || null}
                  onChange={(value) =>
                    setDraft((current) =>
                      current ? { ...current, categoryId: value ?? "" } : current,
                    )
                  }
                />
                <NumberInput
                  label="הקצאה חודשית"
                  placeholder="1000"
                  min={0}
                  allowNegative={false}
                  decimalScale={MONEY_DECIMAL_SCALE}
                  thousandSeparator=","
                  value={draft.amount}
                  onChange={(value) =>
                    setDraft((current) =>
                      current ? { ...current, amount: value ?? "" } : current,
                    )
                  }
                />
                <Group gap="xs">
                  <Button size="xs" loading={saving} onClick={() => void handleSaveDraft()}>
                    שמור
                  </Button>
                  <Button size="xs" variant="default" onClick={cancelDraft}>
                    ביטול
                  </Button>
                </Group>
              </Box>
            );
          }

          const allocated = allocatedIls(allocation);
          const spent = categorySpentMap[allocation.categoryId] ?? 0;
          const remaining = allocated - spent;
          const progress =
            allocated > 0 ? Math.min(100, (spent / allocated) * 100) : 0;
          const overBudget = remaining < 0;

          return (
            <Box key={allocation.id} className={classes.track}>
              <Group className={classes.trackHeader}>
                <Text className={classes.categoryLabel}>
                  <span
                    className={classes.swatch}
                    style={{ backgroundColor: allocation.category.color }}
                    aria-hidden
                  />
                  {allocation.category.name}
                </Text>
                <Group gap="xs">
                  <ActionIcon
                    variant="default"
                    aria-label="ערוך מעקב"
                    onClick={() => startEdit(allocation)}
                  >
                    <IconPencil size={16} />
                  </ActionIcon>
                  <ActionIcon
                    variant="default"
                    color="red"
                    aria-label="מחק מעקב"
                    onClick={() => setDeleteConfirmId(allocation.id)}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Group>

              <Text className={classes.stats}>
                הקצאה: {formatIls(allocated)} | הוצא: {formatIls(spent)} |{" "}
                <span className={overBudget ? classes.overBudget : classes.underBudget}>
                  {overBudget ? "חריגה" : "נותר"}: {formatIls(Math.abs(remaining))}
                </span>
              </Text>

              <Progress
                value={progress}
                color={overBudget ? "red" : "teal"}
                size="md"
                radius="sm"
              />
            </Box>
          );
        })}

        {draft && !editingId ? (
          <Box className={classes.editRow}>
            <Select
              label="קטגוריה"
              placeholder="בחרו"
              data={categoryOptionsFor()}
              value={draft.categoryId || null}
              onChange={(value) =>
                setDraft((current) =>
                  current ? { ...current, categoryId: value ?? "" } : current,
                )
              }
            />
            <NumberInput
              label="הקצאה חודשית"
              placeholder="1000"
              min={0}
              allowNegative={false}
              decimalScale={MONEY_DECIMAL_SCALE}
              thousandSeparator=","
              value={draft.amount}
              onChange={(value) =>
                setDraft((current) =>
                  current ? { ...current, amount: value ?? "" } : current,
                )
              }
            />
            <Group gap="xs">
              <Button size="xs" loading={saving} onClick={() => void handleSaveDraft()}>
                שמור
              </Button>
              <Button size="xs" variant="default" onClick={cancelDraft}>
                ביטול
              </Button>
            </Group>
          </Box>
        ) : null}

        {!draft ? (
          <Button
            className={classes.addButton}
            leftSection={<IconPlus />}
            onClick={startAdd}
            disabled={categoryOptionsFor().length === 0}
          >
            הוסף מעקב
          </Button>
        ) : null}

        {error ? <Text className={classes.error}>{error}</Text> : null}
      </Stack>
      </Box>

      <DeleteConfirmModal
        deleteTarget={deleteConfirmTarget}
        deleting={deletingId !== null}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => {
          if (deleteConfirmId) {
            void handleDelete(deleteConfirmId);
          }
        }}
      />
    </Box>
  );
}
