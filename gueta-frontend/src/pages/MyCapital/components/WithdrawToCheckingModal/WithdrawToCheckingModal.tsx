import { Button, Group, Modal, NumberInput, Stack, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import type { CapitalWithdrawState } from "../../consts";
import { formatMoney } from "../../../../finance/currency";
import { MONEY_DECIMAL_SCALE } from "../../../../finance/money";
import classes from "./WithdrawToCheckingModal.module.css";

type WithdrawToCheckingModalProps = {
  withdrawTarget: CapitalWithdrawState | null;
  withdrawing: boolean;
  onClose: () => void;
  onConfirm: (amount: number) => void;
};

export function WithdrawToCheckingModal({
  withdrawTarget,
  withdrawing,
  onClose,
  onConfirm,
}: WithdrawToCheckingModalProps) {
  const [amount, setAmount] = useState<string | number>("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (withdrawTarget) {
      setAmount("");
      setError("");
    }
  }, [withdrawTarget]);

  function handleAmountChange(value: string | number) {
    if (!withdrawTarget) return;

    if (value === "") {
      setAmount("");
      setError("");
      return;
    }

    const numeric = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(numeric)) {
      setAmount(value);
      return;
    }

    const clamped = Math.min(
      Math.max(numeric, 0.01),
      withdrawTarget.maxAmount,
    );
    setAmount(clamped);
    setError("");
  }

  function handleConfirm() {
    if (!withdrawTarget) return;

    const value = typeof amount === "number" ? amount : Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      setError("יש להזין סכום חיובי.");
      return;
    }
    if (value > withdrawTarget.maxAmount) {
      setError(
        `ניתן למשוך עד ${formatMoney(withdrawTarget.maxAmount, withdrawTarget.currency)}.`,
      );
      return;
    }

    setError("");
    onConfirm(value);
  }

  return (
    <Modal
      opened={withdrawTarget !== null}
      onClose={onClose}
      title='משיכה לעו"ש'
      classNames={{ title: classes.modalTitle }}
    >
      <Stack className={classes.dialog}>
        <Text>
          כמה כסף משכת מ{withdrawTarget?.sourceLabel ?? ""} לעו&quot;ש?
        </Text>
        <NumberInput
          label="סכום"
          placeholder="100"
          min={0.01}
          max={withdrawTarget?.maxAmount}
          clampBehavior="strict"
          allowNegative={false}
          decimalScale={MONEY_DECIMAL_SCALE}
          thousandSeparator=","
          value={amount}
          onChange={handleAmountChange}
          error={error}
        />
        {withdrawTarget && (
          <Text className={classes.hint}>
            יתרה זמינה ב{withdrawTarget.sourceLabel}:{" "}
            {formatMoney(withdrawTarget.maxAmount, withdrawTarget.currency)}
          </Text>
        )}
        <Group className={classes.actions}>
          <Button variant="default" onClick={onClose}>
            ביטול
          </Button>
          <Button loading={withdrawing} onClick={handleConfirm}>
            אישור
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
