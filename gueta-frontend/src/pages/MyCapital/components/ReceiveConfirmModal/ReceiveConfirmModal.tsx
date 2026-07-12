import { Button, Group, Modal, Stack, Text } from "@mantine/core";
import { formatMoney } from "../../../../finance/currency";
import type { CapitalReceiveState } from "../../consts";
import classes from "./ReceiveConfirmModal.module.css";

type ReceiveConfirmModalProps = {
  receiveTarget: CapitalReceiveState | null;
  receiving: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function ReceiveConfirmModal({
  receiveTarget,
  receiving,
  onClose,
  onConfirm,
}: ReceiveConfirmModalProps) {
  return (
    <Modal
      opened={receiveTarget !== null}
      onClose={onClose}
      title="קבלת כסף"
      classNames={{ title: classes.modalTitle }}
    >
      <Stack className={classes.dialog}>
        <Text>
          קיבלת את הכסף &quot;{receiveTarget?.label}&quot; (
          {receiveTarget
            ? formatMoney(receiveTarget.amount, receiveTarget.currency)
            : ""}
          ) ורוצה להוסיף אותו לעו&quot;ש?
        </Text>
        {receiveTarget && receiveTarget.currency !== "ILS" ? (
          <Text size="sm" c="dimmed">
            הסכום יומר לשקלים לפי שער מעודכן בעת האישור.
          </Text>
        ) : null}
        <Group className={classes.actions}>
          <Button variant="default" onClick={onClose}>
            ביטול
          </Button>
          <Button loading={receiving} onClick={onConfirm}>
            כן
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
