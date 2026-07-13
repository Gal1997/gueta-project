import { Button, Group, Modal, Stack, Text, TextInput } from "@mantine/core";
import { useEffect, useMemo, useRef, useState } from "react";
import type { SpendingCategory } from "../../auth/authApi";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "../../auth/authApi";
import { REQUIRED } from "../../finance/constants";
import { sortCategoriesForDisplay } from "../../finance/categoryUtils";
import classes from "./CategoryManager.module.css";

const COLOR_SAVE_DEBOUNCE_MS = 400;

type CategoryManagerProps = {
  opened: boolean;
  onClose: () => void;
  categories: SpendingCategory[];
  onChanged: () => void;
};

export function CategoryManager({
  opened,
  onClose,
  categories,
  onChanged,
}: CategoryManagerProps) {
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingSaving, setEditingSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingColors, setPendingColors] = useState<Record<string, string>>({});
  const colorSaveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>(
    {},
  );

  const sortedCategories = useMemo(
    () => sortCategoriesForDisplay(categories),
    [categories],
  );

  useEffect(() => {
    if (!opened) return;
    setNewName("");
    setEditingId(null);
    setEditingName("");
    setError("");
    setPendingColors({});
    Object.values(colorSaveTimers.current).forEach(clearTimeout);
    colorSaveTimers.current = {};
  }, [opened]);

  useEffect(() => {
    return () => {
      Object.values(colorSaveTimers.current).forEach(clearTimeout);
    };
  }, []);

  async function handleAdd() {
    if (!newName.trim()) {
      setError(REQUIRED);
      return;
    }
    setAdding(true);
    setError("");
    try {
      await createCategory({ name: newName.trim() });
      setNewName("");
      onChanged();
    } catch (addError) {
      setError(
        addError instanceof Error ? addError.message : "שמירה נכשלה",
      );
    } finally {
      setAdding(false);
    }
  }

  async function handleSaveEdit(id: string) {
    if (!editingName.trim()) {
      setError(REQUIRED);
      return;
    }
    setEditingSaving(true);
    setError("");
    try {
      await updateCategory(id, { name: editingName.trim() });
      setEditingId(null);
      setEditingName("");
      onChanged();
    } catch (editError) {
      setError(
        editError instanceof Error ? editError.message : "שמירה נכשלה",
      );
    } finally {
      setEditingSaving(false);
    }
  }

  async function persistColor(id: string, color: string) {
    setError("");
    try {
      await updateCategory(id, { color });
      setPendingColors((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
      onChanged();
    } catch (colorError) {
      setError(
        colorError instanceof Error ? colorError.message : "שמירה נכשלה",
      );
    }
  }

  function handleColorChange(id: string, color: string) {
    setPendingColors((current) => ({ ...current, [id]: color }));

    const existingTimer = colorSaveTimers.current[id];
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    colorSaveTimers.current[id] = setTimeout(() => {
      delete colorSaveTimers.current[id];
      void persistColor(id, color);
    }, COLOR_SAVE_DEBOUNCE_MS);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    setError("");
    try {
      await deleteCategory(id);
      onChanged();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : "מחיקה נכשלה",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <Modal opened={opened} onClose={onClose} title="ניהול קטגוריות">
      <Stack className={classes.stack}>
        <Group className={classes.addRow}>
          <TextInput
            className={classes.addInput}
            placeholder="שם קטגוריה חדשה"
            value={newName}
            onChange={(event) => setNewName(event.currentTarget.value)}
          />
          <Button loading={adding} onClick={() => void handleAdd()}>
            הוסף
          </Button>
        </Group>

        <Stack className={classes.list}>
          {sortedCategories.map((category) => {
            const displayColor = pendingColors[category.id] ?? category.color;

            return (
            <Group key={category.id} className={classes.row}>
              <span
                className={classes.swatch}
                style={{ backgroundColor: displayColor }}
                aria-hidden
              />
              {editingId === category.id ? (
                <>
                  <TextInput
                    className={classes.editInput}
                    value={editingName}
                    onChange={(event) =>
                      setEditingName(event.currentTarget.value)
                    }
                  />
                  <Button
                    size="xs"
                    loading={editingSaving}
                    onClick={() => void handleSaveEdit(category.id)}
                  >
                    שמור
                  </Button>
                  <Button
                    size="xs"
                    variant="default"
                    onClick={() => {
                      setEditingId(null);
                      setEditingName("");
                    }}
                  >
                    ביטול
                  </Button>
                </>
              ) : (
                <>
                  <Text className={classes.name}>{category.name}</Text>
                  <Group className={classes.actions} gap="xs">
                    <input
                      type="color"
                      className={classes.colorInput}
                      value={displayColor}
                      aria-label={`צבע ${category.name}`}
                      onChange={(event) =>
                        handleColorChange(
                          category.id,
                          event.currentTarget.value,
                        )
                      }
                    />
                    <Button
                      size="xs"
                      variant="default"
                      disabled={category.isSystem}
                      onClick={() => {
                        setEditingId(category.id);
                        setEditingName(category.name);
                      }}
                    >
                      ערוך
                    </Button>
                    <Button
                      size="xs"
                      color="red"
                      variant="light"
                      disabled={category.isSystem}
                      loading={deletingId === category.id}
                      onClick={() => void handleDelete(category.id)}
                    >
                      מחק
                    </Button>
                  </Group>
                </>
              )}
            </Group>
            );
          })}
        </Stack>

        {error ? <Text className={classes.error}>{error}</Text> : null}
      </Stack>
    </Modal>
  );
}
