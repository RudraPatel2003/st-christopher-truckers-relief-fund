import { NextRequest } from "next/server";

import { getPaginatedClients } from "@/server/api/users/queries";
import {
  getFailedJsonApiResponse,
  getSuccessfulJsonApiResponse,
} from "@/utils/getJsonApiResponse";
import getUserSession from "@/utils/getUserSession";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const session = await getUserSession();

    if (!session || session.user.role !== "admin") {
      return getFailedJsonApiResponse(401, "Unauthorized");
    }

    const { searchParams } = request.nextUrl;

    // extract query params
    const page = searchParams.get("page") ?? 0;
    const pageSize = searchParams.get("pageSize") ?? 10;
    const search = searchParams.get("search") ?? "";
    const sortField = searchParams.get("sortField") ?? "lastName";
    const sortOrder = searchParams.get("sortOrder") === "desc" ? "desc" : "asc";

    const [response, error] = await getPaginatedClients({
      page: page == 0 ? 0 : parseInt(page),
      pageSize: pageSize == 10 ? 10 : parseInt(pageSize),
      search,
      sortField,
      sortOrder,
      options: {
        populateEnrollmentForm: true,
        populateProgramEnrollments: true,
        populateHealthyHabitsTrackingForms: true,
      },
    });

    if (error !== null) {
      return getFailedJsonApiResponse(500, "Internal server error");
    }

    const [clients, count] = response;

    const responseJson = {
      clients,
      count,
    };

    return getSuccessfulJsonApiResponse(200, responseJson);
  } catch {
    return getFailedJsonApiResponse(500, "Internal server error");
  }
}
