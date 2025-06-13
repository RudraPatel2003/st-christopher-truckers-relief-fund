import { Box, Divider, List, ListItem, Typography } from "@mui/material";
import { ReactNode } from "react";

import { User } from "@/types";

import ChangePasswordButton from "../ChangePasswordButton";
import SignOutButton from "../SignOutButton";
import AdminContactInfoAccordion from "./AdminContactInfoAccordion";

type ClientProfileProps = {
  user: User;
};

export default function ClientProfile({
  user,
}: Readonly<ClientProfileProps>): ReactNode {
  if (user.role !== "client") {
    return null;
  }

  return (
    <Box
      sx={{
        width: "min(90vw, 700px)",
        boxShadow: 3,
        borderRadius: 2,
        padding: 4,
      }}
    >
      <Typography variant="h4" textAlign="center">
        Client Profile
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography>
          <strong>Name:</strong> {user.firstName} {user.lastName}
        </Typography>
        <Typography>
          <strong>Email:</strong> {user.email}
        </Typography>
        <Typography>
          <strong>Phone Number:</strong> {user.phoneNumber}
        </Typography>
        <Typography>
          <strong>Date of Birth:</strong> {user.dateOfBirth}
        </Typography>
        <Typography>
          <strong>Goals:</strong> {user.goals}
        </Typography>
      </Box>

      <AdminContactInfoAccordion />

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6">Accepted Programs</Typography>
      <List>
        {user.programEnrollments.map((programEnrollment) =>
          programEnrollment.status === "accepted" ? (
            <ListItem key={programEnrollment._id} disablePadding>
              <Typography>{programEnrollment.program}</Typography>
            </ListItem>
          ) : null,
        )}
      </List>

      <Divider sx={{ my: 3 }} />

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 2,
          mt: 4,
        }}
      >
        <ChangePasswordButton />
        <SignOutButton />
      </Box>
    </Box>
  );
}
