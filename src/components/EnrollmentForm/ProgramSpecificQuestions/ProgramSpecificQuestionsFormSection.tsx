"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, Snackbar, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import GetPreventativeScreeningsProgramSpecificQuestions from "@/components/EnrollmentForm/ProgramSpecificQuestions/GetPreventativeScreeningsProgramSpecificQuestions";
import HealthyHabitsProgramSpecificQuestions from "@/components/EnrollmentForm/ProgramSpecificQuestions/HealthyHabitsProgramSpecificQuestions";
import RigsWithoutCigsProgramSpecificQuestions from "@/components/EnrollmentForm/ProgramSpecificQuestions/RigsWithoutCigsProgramSpecificQuestions";
import VaccineVoucherProgramSpecificQuestions from "@/components/EnrollmentForm/ProgramSpecificQuestions/VaccineVoucherProgramSpecificQuestions";
import useEnrollmentForm from "@/hooks/useEnrollmentForm";
import { handleEnrollmentFormSubmission } from "@/server/api/enrollment-forms/mutations";
import {
  ProgramSpecificQuestionsSection,
  programSpecificQuestionsSectionValidator,
} from "@/types/EnrollmentForm";
import apiErrors from "@/utils/constants/apiErrors";

export default function ProgramSpecificQuestionsFormSection() {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const {
    enrollmentForm,
    completedSections,
    updateProgramSpecificQuestionsSection,
  } = useEnrollmentForm();

  const router = useRouter();

  // redirect to general information section if missing previous sections
  useEffect(() => {
    if (
      !completedSections.generalInformationSectionCompleted ||
      !completedSections.qualifyingQuestionsSectionCompleted ||
      !completedSections.programSelectionSectionCompleted
    ) {
      router.push("/enrollment-form/general-information");
    }
  }, [
    completedSections.generalInformationSectionCompleted,
    completedSections.programSelectionSectionCompleted,
    completedSections.qualifyingQuestionsSectionCompleted,
    router,
  ]);

  const {
    control,
    handleSubmit,
    formState: { errors, submitCount, isSubmitSuccessful },
  } = useForm<ProgramSpecificQuestionsSection>({
    resolver: zodResolver(programSpecificQuestionsSectionValidator),
    defaultValues: enrollmentForm.programSpecificQuestionsSection,
  });

  const onSubmit = async (data: ProgramSpecificQuestionsSection) => {
    updateProgramSpecificQuestionsSection(data);
  };

  // submit form if all sections are completed
  useEffect(() => {
    const submitForm = async () => {
      if (completedSections.programSpecificQuestionsSectionCompleted) {
        const [, error] = await handleEnrollmentFormSubmission(enrollmentForm);

        if (error === null) {
          setSnackbarMessage("Enrollment form submitted successfully");
          setSnackbarOpen(true);
          router.push("/enrollment-form/submitted");
        } else if (error === apiErrors.user.userAlreadyExists) {
          setSnackbarMessage("You already have an account");
          setSnackbarOpen(true);
        } else if (
          error === apiErrors.enrollmentForm.enrollmentFormAlreadyExists
        ) {
          setSnackbarMessage("You have already submitted this form");
          setSnackbarOpen(true);
        } else {
          setSnackbarMessage("An unknown error occurred");
          setSnackbarOpen(true);
        }
      }
    };

    submitForm();
  }, [
    completedSections.programSpecificQuestionsSectionCompleted,
    enrollmentForm,
    router,
  ]);

  const hasOptedInToHealthyHabits =
    enrollmentForm.programSelectionSection.optedInToHealthyHabits;
  const hasOptedInToDiabetesPrevention =
    enrollmentForm.programSelectionSection.optedInToDiabetesPrevention;
  const hasOptedInToRigsWithoutCigs =
    enrollmentForm.programSelectionSection.optedInToRigsWithoutCigs;
  const hasOptedInToVaccineVoucher =
    enrollmentForm.programSelectionSection.optedInToVaccineVoucher;
  const hasOptedInToGetPreventativeScreenings =
    enrollmentForm.programSelectionSection.optedInToGetPreventativeScreenings;

  return (
    <>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        <Box
          sx={{
            width: "min(90vw, 700px)",
            display: "grid",
            gap: 1.5,
            gridTemplateColumns: "1fr",
          }}
        >
          <Typography variant="h4">Program Specific Questions</Typography>

          {(hasOptedInToHealthyHabits || hasOptedInToDiabetesPrevention) && (
            <HealthyHabitsProgramSpecificQuestions
              control={control}
              errors={errors}
              hasOptedInToHealthyHabits={hasOptedInToHealthyHabits}
              hasOptedInToDiabetesPrevention={hasOptedInToDiabetesPrevention}
            />
          )}

          {hasOptedInToRigsWithoutCigs && (
            <RigsWithoutCigsProgramSpecificQuestions
              control={control}
              errors={errors}
            />
          )}

          {hasOptedInToVaccineVoucher && (
            <VaccineVoucherProgramSpecificQuestions
              control={control}
              errors={errors}
            />
          )}

          {hasOptedInToGetPreventativeScreenings && (
            <GetPreventativeScreeningsProgramSpecificQuestions
              control={control}
              errors={errors}
            />
          )}

          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              width: "100%",
              gap: 2,
            }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={() => router.push("/enrollment-form/program-selection")}
              sx={{ width: "100%" }}
            >
              Back
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ width: "100%" }}
            >
              Submit
            </Button>
          </Box>

          <Typography variant="h6" fontWeight="normal" color="red">
            {submitCount && !isSubmitSuccessful
              ? "Please review all fields before continuing."
              : ""}
          </Typography>
        </Box>
      </form>
    </>
  );
}