import { Button, Group, Modal, Stack, Text } from "@mantine/core";
import type { CapitalDeleteState } from "../../consts";
import classes from "./DeleteConfirmModal.module.css";

type DeleteConfirmModalProps = {
  deleteTarget: CapitalDeleteState | null;
  deleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function DeleteConfirmModal({
  deleteTarget,
  deleting,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  return (
    <Modal
      opened={deleteTarget !== null}
      onClose={onClose}
      title="מחיקה"
      classNames={{ title: classes.modalTitle }}
    >
      <Stack className={classes.deleteDialog}>
        <Text>למחוק את &quot;{deleteTarget?.label}&quot;?</Text>
        <Group className={classes.deleteActions}>
          <Button variant="default" onClick={onClose}>
            ביטול
          </Button>
          <Button color="red" loading={deleting} onClick={onConfirm}>
            מחק
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
