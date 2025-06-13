import bcrypt from "bcrypt";
import mongoose from "mongoose";

import { AdminUserRequest } from "@/app/api/users/actions/create-admin-account/route";
import dbConnect from "@/server/dbConnect";
import {
  ProgramEnrollmentModel,
  ScheduledMeetingModel,
  UserModel,
} from "@/server/models";
import {
  AdminUser,
  ApiResponse,
  ClientUser,
  ProgramEnrollment,
  ScheduledMeeting,
  User,
} from "@/types";
import authenticateServerFunction from "@/utils/authenticateServerFunction";
import apiErrors from "@/utils/constants/apiErrors";
import dayjsUtil from "@/utils/dayjsUtil";
import { create } from "@/utils/db/create";
import handleMongooseError from "@/utils/db/handleMongooseError";
import { findOneAndUpdate } from "@/utils/db/update";

import { getUserByEmail } from "./queries";

export async function createAdminUser(
  adminUserRequest: AdminUserRequest,
): Promise<ApiResponse<AdminUser>> {
  const [existingUser] = await getUserByEmail(adminUserRequest.email);

  if (existingUser) {
    return [null, apiErrors.duplicate];
  }

  const objectid = new mongoose.Types.ObjectId().toString();
  const user: User = {
    _id: objectid,
    firstName: adminUserRequest.firstName,
    lastName: adminUserRequest.lastName,
    email: adminUserRequest.email,
    phoneNumber: adminUserRequest.phoneNumber,
    password: adminUserRequest.password,
    role: "admin",
    dateCreated: dayjsUtil.utc().toISOString(),
    isEmailVerified: true,
  };

  const hashedPassword = await bcrypt.hash(user.password, 10);
  user.password = hashedPassword;

  user.dateCreated = dayjsUtil.utc().toISOString();

  return (await create(UserModel, user)) as ApiResponse<AdminUser>;
}

export async function createClientUser(
  user: ClientUser,
): Promise<ApiResponse<ClientUser>> {
  const [userInDatabase] = await getUserByEmail(user.email);

  if (userInDatabase) {
    return [null, apiErrors.duplicate];
  }

  const hashedPassword = await bcrypt.hash(user.password, 10);
  user.password = hashedPassword;

  return (await create(UserModel, user)) as ApiResponse<ClientUser>;
}

export async function updateUser(newUser: User): Promise<ApiResponse<User>> {
  return await findOneAndUpdate(UserModel, newUser);
}

export async function changePassword(
  email: string,
  oldPassword: string,
  newPassword: string,
): Promise<ApiResponse<null>> {
  await dbConnect();

  const [session, sessionError] = await authenticateServerFunction();

  if (sessionError !== null) {
    return [null, sessionError];
  }

  if (oldPassword.length < 8 || newPassword.length < 8) {
    return [null, apiErrors.user.userInvalidCredentials];
  }

  if (session.user.email !== email) {
    return [null, apiErrors.user.userInvalidCredentials];
  }

  const [user, userError] = await getUserByEmail(email);

  if (userError !== null) {
    return [null, userError];
  }

  const doesOldPasswordsMatch = await bcrypt.compare(
    oldPassword,
    user.password,
  );

  if (!doesOldPasswordsMatch) {
    return [null, apiErrors.user.userInvalidCredentials];
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;

  await updateUser(user);

  return [null, null];
}

export async function getUsersByProgram(
  programName: string,
): Promise<ApiResponse<User[]>> {
  await dbConnect();

  try {
    // Find program enrollments for the given program and populate the associated users
    const enrollments = await ProgramEnrollmentModel.find({
      program: programName,
      status: "accepted",
    })
      .populate("user")
      .lean()
      .exec();

    const users = enrollments.map(
      (enrollment: ProgramEnrollment) => enrollment.user,
    );

    return [users, null];
  } catch (error) {
    console.error(error);
    return [null, "Error fetching users by program."];
  }
}

export async function getUsersWithMeetingsToday(): Promise<
  ApiResponse<{ user: User; meeting: ScheduledMeeting }[]>
> {
  await dbConnect();

  try {
    const today = dayjsUtil().startOf("day").toISOString();
    const tomorrow = dayjsUtil().add(1, "day").startOf("day").toISOString();

    // Find all meetings scheduled for today
    const meetings = await ScheduledMeetingModel.find({
      date: {
        $gte: today,
        $lt: tomorrow,
      },
    })
      .populate("client")
      .lean()
      .exec();

    // Return both the user and their meeting
    const usersWithMeetings = meetings.map((meeting) => ({
      user: meeting.client,
      meeting,
    }));

    return [usersWithMeetings, null];
  } catch (error) {
    console.error(error);
    return [null, handleMongooseError(error)];
  }
}
