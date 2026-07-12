import { Button, Group } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { CONTINUE_LABEL } from "../../consts";
import sectionClasses from "./SectionRow.module.css";
import classes from "./SectionFooterActions.module.css";

type SectionFooterActionsProps = {
  onAdd: () => void;
  onContinue: () => void;
};

export function SectionFooterActions({
  onAdd,
  onContinue,
}: SectionFooterActionsProps) {
  return (
    <Group className={classes.footer}>
      <Button
        className={sectionClasses.addButton}
        leftSection={<IconPlus />}
        onClick={onAdd}
      >
        הוסף שורה
      </Button>
      <Button onClick={onContinue}>{CONTINUE_LABEL}</Button>
    </Group>
  );
}
