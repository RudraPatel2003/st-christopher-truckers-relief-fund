import { sendDailyZoomReminderEmail } from "@/server/api/emails/private-mutations";
import { getUsersWithMeetingsToday } from "@/server/api/users/private-mutations";
import {
  getFailedJsonApiResponse,
  getSuccessfulJsonApiResponse,
} from "@/utils/getJsonApiResponse";

export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  try {
    const apiKeyHeader = request.headers.get("x-api-key");

    if (!apiKeyHeader || apiKeyHeader !== process.env.API_KEY) {
      return getFailedJsonApiResponse(401, "Invalid request.");
    }

    const [usersWithMeetings, error] = await getUsersWithMeetingsToday();

    if (error !== null) {
      return getFailedJsonApiResponse(500, "Internal server error.");
    }

    await Promise.allSettled(
      usersWithMeetings.map(({ user, meeting }) =>
        sendDailyZoomReminderEmail(
          user.email,
          new Date(meeting.date).toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
            timeZoneName: "short",
          }),
        ),
      ),
    );

    return getSuccessfulJsonApiResponse(200);
  } catch (error) {
    console.error(error);
    return getFailedJsonApiResponse(500, "Internal server error.");
  }
}
