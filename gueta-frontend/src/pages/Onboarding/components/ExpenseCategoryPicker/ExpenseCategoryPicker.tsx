import {
  Button,
  Group,
  Modal,
  Select,
  Stack,
  TextInput,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useMemo, useState, type ReactNode } from "react";
import { createCategory } from "../../../../auth/authApi";
import type { SpendingCategory } from "../../../../auth/authApi";
import { REQUIRED } from "../../../../finance/constants";
import {
  ADD_ONBOARDING_CATEGORY_VALUE,
  getOnboardingCategorySelectData,
} from "../../../../finance/categoryUtils";

type ExpenseCategoryPickerProps = {
  categories: SpendingCategory[];
  value: string;
  error?: ReactNode;
  onChange: (categoryId: string) => void;
  onCategoriesChange: () => void | Promise<void>;
};

export function ExpenseCategoryPicker({
  categories,
  value,
  error,
  onChange,
  onCategoriesChange,
}: ExpenseCategoryPickerProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [addError, setAddError] = useState("");
  const [saving, setSaving] = useState(false);

  const selectData = useMemo(
    () => getOnboardingCategorySelectData(categories),
    [categories],
  );

  async function handleAddCategory() {
    if (!newName.trim()) {
      setAddError(REQUIRED);
      return;
    }

    setSaving(true);
    setAddError("");
    try {
      const category = await createCategory({ name: newName.trim() });
      await onCategoriesChange();
      onChange(category.id);
      setNewName("");
      setAddOpen(false);
    } catch (createError) {
      setAddError(
        createError instanceof Error ? createError.message : "שמירה נכשלה",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Select
        label="קטגוריה"
        placeholder="בחרו"
        data={selectData}
        value={value || null}
        error={error}
        renderOption={({ option }) =>
          option.value === ADD_ONBOARDING_CATEGORY_VALUE ? (
            <Group gap="xs">
              <IconPlus size={14} />
              <span>{option.label}</span>
            </Group>
          ) : (
            <span>{option.label}</span>
          )
        }
        onChange={(selected) => {
          if (selected === ADD_ONBOARDING_CATEGORY_VALUE) {
            setAddError("");
            setNewName("");
            setAddOpen(true);
            return;
          }
          if (selected) {
            onChange(selected);
          }
        }}
      />

      <Modal
        opened={addOpen}
        onClose={() => setAddOpen(false)}
        title="הוסף קטגוריה"
      >
        <Stack>
          <TextInput
            label="שם קטגוריה"
            placeholder="למשל מסעדות"
            value={newName}
            error={addError || undefined}
            onChange={(event) => setNewName(event.currentTarget.value)}
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setAddOpen(false)}>
              ביטול
            </Button>
            <Button loading={saving} onClick={() => void handleAddCategory()}>
              הוסף
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
