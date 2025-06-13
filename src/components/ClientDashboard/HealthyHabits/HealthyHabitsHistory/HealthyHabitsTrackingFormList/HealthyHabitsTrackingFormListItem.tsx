"use client";

import DeleteIcon from "@mui/icons-material/Delete";
import DescriptionIcon from "@mui/icons-material/Description";
import {
  Avatar,
  Box,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";
import { ReactNode } from "react";

import { HealthyHabitsTrackingForm } from "@/types";
import dayjsUtil from "@/utils/dayjsUtil";

import HealthyHabitsTrackingFormModal from "./HealthyHabitsTrackingFormModal";

type HealthyHabitsTrackingFormListItemProps = {
  form: HealthyHabitsTrackingForm;
  handleDelete: (form: HealthyHabitsTrackingForm) => void;
};

export default function HealthyHabitsTrackingFormListItem({
  form,
  handleDelete,
}: Readonly<HealthyHabitsTrackingFormListItemProps>): ReactNode {
  return (
    <ListItem
      secondaryAction={
        <Box sx={{ display: "flex", gap: 2 }}>
          <HealthyHabitsTrackingFormModal form={form} />
          <IconButton edge="end" onClick={() => handleDelete(form)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      }
    >
      <ListItemAvatar>
        <Avatar>
          <DescriptionIcon />
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={`Week of ${dayjsUtil.utc(form.weekOfSubmission).format("MM/DD/YYYY")}`}
      />
    </ListItem>
  );
}
