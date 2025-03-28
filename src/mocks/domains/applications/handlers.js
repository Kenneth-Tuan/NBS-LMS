import { http, HttpResponse } from "msw";
import { getApplicationList, updateApplication } from "./model";

export const handlers = [
  http.get("/api/applicationList", async ({ request, params, cookies }) => {
    try {
      // Get the list of applications
      const applications = getApplicationList();

      return HttpResponse.json({
        success: true,
        data: applications,
        message: "獲取申請列表成功",
      });
    } catch (error) {
      console.error("Error retrieving application list:", error);

      return new HttpResponse(
        JSON.stringify({
          success: false,
          data: [],
          message: "發生錯誤，無法取得申請列表",
          code: "APPLICATION_LIST_ERROR",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
  }),

  http.post("/api/updateApplicationStatus", async ({ request }) => {
    try {
      // Parse request body
      const requestBody = await request.json();
      const { id, status, reviewData } = requestBody;

      if (!id || !status) {
        return new HttpResponse(
          JSON.stringify({
            success: false,
            message: "申請ID或狀態不能為空",
            code: "INVALID_PARAMETERS",
          }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }

      // Update application status
      const updatedApplications = updateApplication(
        id,
        status,
        reviewData || {}
      );

      return HttpResponse.json({
        success: true,
        data: updatedApplications,
        message: "申請狀態更新成功",
      });
    } catch (error) {
      console.error("Error updating application status:", error);

      return new HttpResponse(
        JSON.stringify({
          success: false,
          message: error.message || "更新申請狀態失敗",
          code: "UPDATE_STATUS_ERROR",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
  }),
];
