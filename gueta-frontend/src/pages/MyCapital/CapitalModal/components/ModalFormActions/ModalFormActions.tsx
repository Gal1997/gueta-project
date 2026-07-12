import { Button, Group, Text } from "@mantine/core";
import classes from "./ModalFormActions.module.css";

type ModalFormActionsProps = {
  error: string;
  saving: boolean;
  onClose: () => void;
  onSubmit: () => void;
};

export function ModalFormActions({
  error,
  saving,
  onClose,
  onSubmit,
}: ModalFormActionsProps) {
  return (
    <>
      {error && <Text className={classes.error}>{error}</Text>}
      <Group className={classes.actions}>
        <Button variant="default" onClick={onClose}>
          ביטול
        </Button>
        <Button loading={saving} onClick={onSubmit}>
          שמירה
        </Button>
      </Group>
    </>
  );
}
