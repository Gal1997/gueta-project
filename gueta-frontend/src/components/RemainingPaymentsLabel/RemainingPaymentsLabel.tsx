import { Group, Tooltip } from "@mantine/core";
import { REMAINING_PAYMENTS_INFO } from "../../finance/constants";
import classes from "./RemainingPaymentsLabel.module.css";

export function RemainingPaymentsLabel() {
  return (
    <Group gap={4} wrap="nowrap" component="span">
      <span>תשלומים שנותרו</span>
      <Tooltip
        label={REMAINING_PAYMENTS_INFO}
        multiline
        w={280}
        withArrow
      >
        <span
          className={classes.infoTrigger}
          aria-label="מידע על תשלומים שנותרו"
        >
          <span className={classes.infoMark}>i</span>
        </span>
      </Tooltip>
    </Group>
  );
}
