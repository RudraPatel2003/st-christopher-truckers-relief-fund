"use client";

import {
  Box,
  Button,
  Checkbox,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { ReactNode, useState } from "react";

import dayjsUtil from "@/utils/dayjsUtil";

export default function DataExport(): ReactNode {
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const handleSelect = (value: string) => (): void => {
    const currentIndex = selected.indexOf(value);
    const newSelected = [...selected];

    if (currentIndex === -1) {
      newSelected.push(value);
    } else {
      newSelected.splice(currentIndex, 1);
    }

    setSelected(newSelected);
  };

  const listItems = [
    {
      name: "Enrollment Forms",
      key: "enrollmentforms",
    },
    {
      name: "Fagerstrom Tests",
      key: "fagerstromtests",
    },
    {
      name: "Feature Flags",
      key: "featureflags",
    },
    {
      name: "Healthy Habits Tracking Forms",
      key: "healthyhabitstrackingforms",
    },
    {
      name: "Program Enrollements",
      key: "programenrollments",
    },
    {
      name: "Scheduled Meetings",
      key: "scheduledmeetings",
    },
    {
      name: "Screening Requests",
      key: "screeningrequests",
    },
    {
      name: "Urgent Meeting Requests",
      key: "urgentmeetingrequests",
    },
    {
      name: "Users",
      key: "users",
    },
    {
      name: "Vaccine Voucher Requests",
      key: "vaccinevoucherrequests",
    },
  ];

  const handleExport = async (): Promise<void> => {
    if (selected.length === 0) {
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/data-export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ collections: selected }),
      });

      if (!response.ok) {
        enqueueSnackbar("Error exporting data.", {
          variant: "error",
        });
        return;
      }

      // Create download link
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      // Create hidden link and click to start download
      const currentDay = dayjsUtil().format("MM_DD_YYYY");
      const a = document.createElement("a");
      a.href = url;
      a.download = `scf_data_export_${currentDay}.xlsx`;
      document.body.appendChild(a);
      a.click();

      // Remove hidden link
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setLoading(false);
    } catch {
      enqueueSnackbar("Error exporting data.", {
        variant: "error",
      });
      setLoading(false);
    }
  };

  return (
    <Box sx={{ marginTop: "100px", p: 4 }}>
      <Typography variant="h6">Data Export</Typography>

      <Typography>Select which database tables to export.</Typography>
      <List>
        {listItems.map((item) => (
          <ListItem
            key={item.key}
            secondaryAction={
              <Checkbox
                edge="end"
                onChange={handleSelect(item.key)}
                checked={selected.includes(item.key)}
              />
            }
            disablePadding
          >
            <ListItemButton onClick={handleSelect(item.key)}>
              <ListItemText id={item.key} primary={item.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Button
        onClick={handleExport}
        loading={loading}
        variant="contained"
        sx={{ width: "100%" }}
      >
        Export
      </Button>
    </Box>
  );
}
