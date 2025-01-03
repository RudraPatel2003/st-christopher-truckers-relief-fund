"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import LoadingButton from "@mui/lab/LoadingButton";
import {
  Box,
  Divider,
  FormControl,
  FormHelperText,
  InputAdornment,
  Snackbar,
  Typography,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateField } from "@mui/x-date-pickers/DateField";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider/LocalizationProvider";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import ControlledTextField from "@/components/controlled/ControlledTextField";
import { handleHealthyHabitsTrackingFormSubmission } from "@/server/api/healthy-habits-tracking-forms/public-mutations";
import {
  HealthyHabitsFormValues,
  HealthyHabitsTrackingForm,
  healthyHabitsValidator,
} from "@/types/HealthyHabitsTrackingForm";
import dayjsUtil from "@/utils/dayjsUtil";

type HealthyHabitsTrackingFormProps = {
  email: string;
};

export default function HealthyHabitsTracking({
  email,
}: HealthyHabitsTrackingFormProps) {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<HealthyHabitsFormValues>({
    resolver: zodResolver(healthyHabitsValidator),
    defaultValues: {
      submittedDate: dayjsUtil().format("MM/DD/YYYY").toString(),
      healthConditions: "",
      devices: "",
      weight: 0,
      movementMinutes: 0,
      bloodPressure: "",
      bloodGlucose: 0,
      a1c: 0,
      cholesterol: 0,
      qualitativeGoals: "",
    },
  });

  const onSubmit = async (data: HealthyHabitsFormValues) => {
    setIsLoading(true);

    const healthyHabitsTrackingForm: HealthyHabitsTrackingForm = {
      ...data,
      email,
    };
    const [, error] = await handleHealthyHabitsTrackingFormSubmission(
      healthyHabitsTrackingForm,
    );

    if (error === null) {
      setSnackbarMessage("Healthy Habits Tracking Form submitted successfully");
    } else {
      setSnackbarMessage("An unknown error occurred");
    }

    setSnackbarOpen(true);
    setIsLoading(false);
    setDisabled(true);
  };

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
          <Typography variant="h6">Date</Typography>
          <Controller
            name="submittedDate"
            control={control}
            render={({ field }) => (
              <FormControl error={!!errors.submittedDate} fullWidth>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateField
                    {...field}
                    // handle string value correctly
                    value={
                      field.value ? dayjsUtil(field.value, "MM/DD/YYYY") : null
                    }
                    // convert dayjs to string
                    onChange={(date) =>
                      field.onChange(date?.format("MM/DD/YYYY") || "")
                    }
                    label="Date"
                    variant="outlined"
                    format="MM/DD/YYYY"
                    required
                  />
                </LocalizationProvider>
                <FormHelperText>{errors.submittedDate?.message}</FormHelperText>
              </FormControl>
            )}
          />

          {/* Section Title: Account Information */}
          <Typography variant="h6">Account Information</Typography>

          {/* Health Conditions */}
          {/* Pull from user data if applicable in the future. */}
          <ControlledTextField
            control={control}
            name="healthConditions"
            label="Health Conditions"
            variant="outlined"
            error={errors?.healthConditions}
            multiline
            rows={3}
            required
          />

          {/* Medical Devices */}
          {/* Pull from user data if applicable in the future. */}
          <ControlledTextField
            control={control}
            name="devices"
            label="Medical Devices"
            variant="outlined"
            error={errors?.devices}
            required
          />

          <Divider />

          {/* Section Title: Weekly Updates */}
          <Typography variant="h6">Weekly Updates</Typography>

          {/* Weight */}
          <ControlledTextField
            control={control}
            name="weight"
            label="Weight"
            variant="outlined"
            error={errors?.weight}
            type="number"
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">lbs</InputAdornment>
                ),
              },
            }}
            convertToNumber={true}
            required
          />

          {/* Movement Minutes */}
          <ControlledTextField
            control={control}
            name="movementMinutes"
            label="Movement Minutes"
            variant="outlined"
            error={errors?.movementMinutes}
            type="number"
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">minutes</InputAdornment>
                ),
              },
            }}
            convertToNumber={true}
            required
          />

          {/* Blood Pressure */}
          <ControlledTextField
            control={control}
            name="bloodPressure"
            label="Blood Pressure (e.g. 120/80)"
            variant="outlined"
            error={errors?.bloodPressure}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">mmHg</InputAdornment>
                ),
              },
            }}
            required
          />

          {/* Blood Glucose (when fasting) */}
          <ControlledTextField
            control={control}
            name="bloodGlucose"
            label="Blood Glucose (when fasting)"
            variant="outlined"
            error={errors?.bloodGlucose}
            type="number"
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">mg/dL</InputAdornment>
                ),
              },
            }}
            convertToNumber={true}
            required
          />

          {/* A1C */}
          <ControlledTextField
            control={control}
            name="a1c"
            label="A1C"
            variant="outlined"
            error={errors?.a1c}
            type="number"
            slotProps={{
              input: {
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              },
            }}
            convertToNumber={true}
            required
          />

          {/* Cholesterol */}
          <ControlledTextField
            control={control}
            name="cholesterol"
            label="Cholesterol"
            variant="outlined"
            error={errors?.cholesterol}
            type="number"
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">mg/dL</InputAdornment>
                ),
              },
            }}
            convertToNumber={true}
            required
          />

          {/* Qualitative Goals */}
          <ControlledTextField
            control={control}
            name="qualitativeGoals"
            label="Qualitative Goals"
            variant="outlined"
            error={errors?.qualitativeGoals}
            multiline
            rows={3}
            required
          />

          {/* Submit */}
          <LoadingButton
            type="submit"
            variant="contained"
            color="primary"
            loading={isLoading}
            disabled={disabled}
          >
            Submit
          </LoadingButton>

          <Typography variant="h6" fontWeight="normal" color="red">
            {errors.root?.message}
          </Typography>
        </Box>
      </form>
    </>
  );
}
