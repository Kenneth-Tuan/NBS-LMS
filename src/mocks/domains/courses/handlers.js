import { http, HttpResponse } from "msw";
import { getCourseList, updateCourse, saveCourse } from "./model";

export const handlers = [
  // 獲取課程列表
  http.get("/courseList", async ({ request, params, cookies }) => {
    try {
      // 獲取課程列表
      const courses = getCourseList();

      return HttpResponse.json({
        success: true,
        data: courses,
        message: "獲取課程列表成功",
      });
    } catch (error) {
      console.error("Error retrieving course list:", error);

      return new HttpResponse(
        JSON.stringify({
          success: false,
          data: [],
          message: "發生錯誤，無法取得課程列表",
          code: "COURSE_LIST_ERROR",
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

  // 更新課程狀態
  http.post("/updateCourseStatus", async ({ request }) => {
    try {
      // 解析請求數據
      const requestBody = await request.json();
      const { id, status, reviewData } = requestBody;

      if (!id || !status) {
        return new HttpResponse(
          JSON.stringify({
            success: false,
            message: "課程ID或狀態不能為空",
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

      // 更新課程狀態
      const updatedCourses = updateCourse(id, status, reviewData || {});

      return HttpResponse.json({
        success: true,
        data: updatedCourses,
        message: "課程狀態更新成功",
      });
    } catch (error) {
      console.error("Error updating course status:", error);

      return new HttpResponse(
        JSON.stringify({
          success: false,
          message: error.message || "更新課程狀態失敗",
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

  // 創建新課程
  http.post("/createCourse", async ({ request }) => {
    try {
      // 解析請求數據
      const courseData = await request.json();

      // 保存新課程
      const newCourse = await saveCourse(courseData);

      return HttpResponse.json({
        success: true,
        data: newCourse,
        message: "課程創建成功",
      });
    } catch (error) {
      console.error("Error creating course:", error);

      return new HttpResponse(
        JSON.stringify({
          success: false,
          message: error.message || "創建課程失敗",
          code: "CREATE_COURSE_ERROR",
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
