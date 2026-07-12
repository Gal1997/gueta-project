import { Modal, Stack } from "@mantine/core";
import type {
  InvestmentUpdateMode,
  StoredAvailableCash,
  StoredCapitalInvestment,
  StoredFutureMoney,
} from "../../../auth/authApi";
import type { CapitalEntity } from "../consts";
import classes from "./CapitalModal.module.css";
import { AvailableFormFields } from "./components/AvailableFormFields/AvailableFormFields";
import { FutureFormFields } from "./components/FutureFormFields/FutureFormFields";
import { InvestmentFormFields } from "./components/InvestmentFormFields/InvestmentFormFields";
import { ModalFormActions } from "./components/ModalFormActions/ModalFormActions";
import { useCapitalModal } from "./useCapitalModal";

interface CapitalModalProps {
  opened: boolean;
  onClose: () => void;
  entity: CapitalEntity;
  mode: "add" | "edit";
  recordId?: string;
  initialAvailable?: StoredAvailableCash | null;
  initialInvestment?: StoredCapitalInvestment | null;
  investmentUpdateMode?: InvestmentUpdateMode;
  initialFuture?: StoredFutureMoney | null;
  onSaved: () => void;
}

export default function CapitalModal({
  opened,
  onClose,
  entity,
  mode,
  recordId,
  initialAvailable,
  initialInvestment,
  investmentUpdateMode,
  initialFuture,
  onSaved,
}: CapitalModalProps) {
  const {
    title,
    saving,
    error,
    availableForm,
    investmentForm,
    futureForm,
    handleSubmit,
  } = useCapitalModal({
    opened,
    entity,
    mode,
    recordId,
    initialAvailable,
    initialInvestment,
    investmentUpdateMode,
    initialFuture,
    onSaved,
    onClose,
  });

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={title}
      classNames={{ title: classes.modalTitle }}
    >
      <Stack className={classes.form}>
        {entity === "available" && (
          <AvailableFormFields form={availableForm} />
        )}
        {entity === "investment" && (
          <InvestmentFormFields form={investmentForm} mode={mode} />
        )}
        {entity === "future" && <FutureFormFields form={futureForm} />}

        <ModalFormActions
          error={error}
          saving={saving}
          onClose={onClose}
          onSubmit={() => void handleSubmit()}
        />
      </Stack>
    </Modal>
  );
}
