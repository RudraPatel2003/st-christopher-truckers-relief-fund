import { Box, Typography } from "@mui/material";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

import RigsWithoutCigs from "@/components/ClientDashboard/RigsWithoutCigs";
import { getUserByEmail } from "@/server/api/users/queries";
import getUserSession from "@/utils/getUserSession";
import isUserEnrolledInProgram from "@/utils/isEnrolledInProgram";

export const dynamic = "force-dynamic";

export default async function RigsWithoutCigsPage(): Promise<ReactNode> {
  const session = await getUserSession();

  if (!session) {
    redirect("/");
  }

  const [user, error] = await getUserByEmail(session.user.email, {
    populateProgramEnrollments: true,
    populateEnrollmentForm: true,
    populateFagerstromTests: true,
  });

  if (error !== null) {
    return (
      <Box
        sx={{
          height: "100vh",
          width: "100vw",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography>
          There was an error fetching your rigs without cigs enrollment.
        </Typography>
      </Box>
    );
  }
  if (user.role !== "client") {
    redirect("/dashboard");
  }

  const enrolledInRigsWithoutCigsProgram = isUserEnrolledInProgram(
    user.programEnrollments,
    "Rigs Without Cigs",
  );

  if (!enrolledInRigsWithoutCigsProgram) {
    redirect("/dashboard/client");
  }

  const hasRigsWithoutCigsEnrollmentInformation =
    user.enrollmentForm.programSpecificQuestionsSection
      .hasOptedInToRigsWithoutCigs;

  if (!hasRigsWithoutCigsEnrollmentInformation) {
    redirect("/dashboard/client/rigs-without-cigs/add-information");
  }

  const rigsWithoutCigsEnrollment = user.programEnrollments.find(
    (enrollment) => enrollment.program === "Rigs Without Cigs",
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        marginTop: "100px",
        padding: 1,
      }}
    >
      <RigsWithoutCigs
        user={user}
        programEnrollment={rigsWithoutCigsEnrollment!}
      />
    </Box>
  );
}
