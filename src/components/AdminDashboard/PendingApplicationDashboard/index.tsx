"use client";

import { Search } from "@mui/icons-material";
import { Box, Snackbar, TextField, Typography } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useState } from "react";

import AcceptPendingApplicationButton from "@/components/AdminDashboard/PendingApplicationDashboard/AcceptPendingApplicationButton";
import PendingApplicationInfoModal from "@/components/AdminDashboard/PendingApplicationDashboard/PendingApplicationInfoModal";
import RejectPendingApplicationButton from "@/components/AdminDashboard/PendingApplicationDashboard/RejectPendingApplicationButton";
import { EnrollmentForm, Program, ProgramEnrollment } from "@/types";

export type Row = {
  id?: string;
  lastName: string;
  firstName: string;
  phoneNumber: string;
  email: string;
  program: Program;
  enrollmentForm: EnrollmentForm;
};

const createRowFromProgramEnrollment = (
  programEnrollment: ProgramEnrollment,
): Row => {
  return {
    id: programEnrollment._id,
    lastName:
      programEnrollment.enrollmentForm.generalInformationSection.lastName,
    firstName:
      programEnrollment.enrollmentForm.generalInformationSection.firstName,
    phoneNumber:
      programEnrollment.enrollmentForm.generalInformationSection.phoneNumber,
    email: programEnrollment.email,
    program: programEnrollment.program,
    enrollmentForm: programEnrollment.enrollmentForm,
  };
};

function getRows(programEnrollments: ProgramEnrollment[]): Row[] {
  return programEnrollments.map(createRowFromProgramEnrollment);
}

type PendingApplicationDashboardProps = {
  programEnrollments: ProgramEnrollment[];
};

export default function PendingApplicationDashboard({
  programEnrollments,
}: PendingApplicationDashboardProps) {
  const [rows, setRows] = useState(getRows(programEnrollments));
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const columns: GridColDef<Row>[] = [
    {
      field: "firstName",
      headerName: "First name",
      width: 150,
    },
    {
      field: "lastName",
      headerName: "Last name",
      width: 150,
    },
    {
      field: "phoneNumber",
      headerName: "Phone Number",
      width: 125,
    },
    {
      field: "email",
      headerName: "Email",
      minWidth: 200,
      flex: 1,
    },
    {
      field: "program",
      headerName: "Program",
      width: 250,
    },
    {
      field: "action",
      headerName: "Actions",
      sortable: false,
      minWidth: 350,
      flex: 1,
      renderCell: (params) => {
        return (
          <>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-around",
                alignItems: "center",
                height: "100%",
              }}
            >
              <AcceptPendingApplicationButton
                email={
                  params.row.enrollmentForm.generalInformationSection.email
                }
                firstName={params.row.firstName}
                program={params.row.program}
                rows={rows}
                setRows={setRows}
                setSnackbarOpen={setSnackbarOpen}
                setSnackbarMessage={setSnackbarMessage}
              />
              <RejectPendingApplicationButton
                email={
                  params.row.enrollmentForm.generalInformationSection.email
                }
                program={params.row.program}
                rows={rows}
                setRows={setRows}
                setSnackbarOpen={setSnackbarOpen}
                setSnackbarMessage={setSnackbarMessage}
              />
              <PendingApplicationInfoModal
                enrollmentForm={params.row.enrollmentForm}
              />
            </Box>
          </>
        );
      },
    },
  ];

  const filteredRows = rows.filter(
    (row) =>
      row.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.phoneNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <>
      <Box sx={{ width: "95%", height: "75%", marginTop: "100px" }}>
        <Typography align="center" variant="h4" sx={{ m: 2 }}>
          Pending Applications
        </Typography>
        <Box display="flex" alignItems="center" sx={{ py: 2 }}>
          <TextField
            id="search-bar"
            className="text"
            onChange={(e) => {
              setSearchQuery(e.target.value);
            }}
            placeholder="Search..."
            size="small"
          />
          <Search sx={{ fontSize: 28, m: 1 }} color="primary" />
        </Box>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          message={snackbarMessage}
          anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
        />
        <DataGrid
          rows={filteredRows}
          columns={columns}
          disableRowSelectionOnClick
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 5,
              },
            },
          }}
          sx={{
            height: "300px",
          }}
        />
      </Box>
    </>
  );
}
