import dbConnect from "@/server/dbConnect";
import { ScreeningRequestModel, UserModel } from "@/server/models";
import { ApiResponse, ScreeningRequest } from "@/types";
import apiErrors from "@/utils/constants/apiErrors";
import handleMongooseError from "@/utils/handleMongooseError";
import { serializeMongooseObject } from "@/utils/serializeMongooseObject";

export async function createScreeningRequest(
  screeningRequest: ScreeningRequest,
): Promise<ApiResponse<ScreeningRequest>> {
  await dbConnect();

  try {
    const newScreeningRequestDocument =
      await ScreeningRequestModel.create(screeningRequest);

    const newScreeningRequest = newScreeningRequestDocument.toObject();

    // add screening request to user
    await UserModel.findByIdAndUpdate(newScreeningRequest.user._id, {
      $push: { screeningRequests: newScreeningRequest._id },
    });

    return [serializeMongooseObject(newScreeningRequest), null];
  } catch (error) {
    console.error(error);
    return [null, handleMongooseError(error)];
  }
}

export async function updateScreeningRequest(
  screeningRequest: ScreeningRequest,
): Promise<ApiResponse<ScreeningRequest>> {
  await dbConnect();

  try {
    const updatedScreeningRequest =
      await ScreeningRequestModel.findOneAndUpdate(
        { _id: screeningRequest._id },
        screeningRequest,
        { new: true, lean: true },
      ).exec();

    if (!updatedScreeningRequest) {
      return [null, apiErrors.screeningRequest.screeningRequestNotFound];
    }

    return [serializeMongooseObject(updatedScreeningRequest), null];
  } catch (error) {
    console.error(error);
    return [null, handleMongooseError(error)];
  }
}

export async function deleteScreeningRequest(
  screeningRequest: ScreeningRequest,
): Promise<ApiResponse<null>> {
  await dbConnect();

  try {
    const deletedScreeningRequest =
      await ScreeningRequestModel.findByIdAndDelete(
        screeningRequest._id,
      ).exec();

    if (!deletedScreeningRequest) {
      return [null, apiErrors.screeningRequest.screeningRequestNotFound];
    }

    // remove screening request from user
    await UserModel.findByIdAndUpdate(screeningRequest.user._id, {
      $pull: { screeningRequests: screeningRequest._id },
    });

    return [null, null];
  } catch (error) {
    console.error(error);
    return [null, handleMongooseError(error)];
  }
}
