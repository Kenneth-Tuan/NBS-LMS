import { http, HttpResponse } from "msw";
import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";

// import { useMockStore } from "@/stores/mock";
import { defaultApiError500 } from "@/mocks/handlers";
import {
  generateUserprofile,
  getUsersWithPagination,
  getUserById,
  exportUsersAsCsv,
} from "../user/model";
import { mockUsers } from "../user/data";

// Create a mutable copy of the users array for the mock API
let users = [...mockUsers];

export const handlers = [
  http.get("/userprofile", async ({ request, params, cookies }) => {
    const result = generateUserprofile(cookies.ApiToken);

    if (result === false) {
      return new HttpResponse(
        JSON.stringify({
          message: "登入失敗，請確認帳號密碼",
          code: "AUTH_FAILED",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    return HttpResponse.json(result);
  }),

  http.post("/token", async ({ request, params, cookies, body, variables }) => {
    const payload = await request.json();

    const result = {
      access_token: payload.hashedValue,
      refresh_token: payload.hashedValue,
      expires_in: dayjs().add(1000, "s").valueOf(),
    };

    return HttpResponse.json(result);
  }),

  // New endpoint to export users as CSV
  http.get("/users/export/csv", () => {
    const csvContent = exportUsersAsCsv();

    return new HttpResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=users.csv",
      },
    });
  }),

  // New endpoint for bulk operations
  http.post("/users/bulk", async ({ request }) => {
    const { operation, userIds } = await request.json();

    if (!operation || !userIds || !Array.isArray(userIds)) {
      return new HttpResponse(
        JSON.stringify({
          message: "無效的請求格式",
          code: "INVALID_REQUEST",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    let affectedCount = 0;

    if (operation === "delete") {
      // Filter out users that are in the userIds array
      const initialLength = users.length;
      users = users.filter((user) => !userIds.includes(user.id));
      affectedCount = initialLength - users.length;
    } else if (operation === "activate" || operation === "deactivate") {
      const newStatus = operation === "activate" ? 1 : 0;

      users = users.map((user) => {
        if (userIds.includes(user.id)) {
          affectedCount++;
          return {
            ...user,
            status: newStatus,
            updatedAt: new Date().toISOString(),
          };
        }
        return user;
      });
    }

    return HttpResponse.json({
      message: `成功${
        operation === "delete"
          ? "刪除"
          : operation === "activate"
          ? "啟用"
          : "停用"
      } ${affectedCount} 個使用者`,
      affectedCount,
    });
  }),

  // User management API endpoints
  http.get("/users", ({ request }) => {
    const url = new URL(request.url);

    // Get query parameters for filtering and pagination
    const page = parseInt(url.searchParams.get("page")) || 1;
    const pageSize = parseInt(url.searchParams.get("pageSize")) || 10;
    const keyword = url.searchParams.get("keyword") || "";
    const role = url.searchParams.get("role")
      ? parseInt(url.searchParams.get("role"))
      : null;
    const status = url.searchParams.get("status")
      ? parseInt(url.searchParams.get("status"))
      : null;

    // Use our model function to get paginated users
    const result = getUsersWithPagination({
      page,
      pageSize,
      keyword,
      role,
      status,
    });

    return HttpResponse.json({
      users: result.users,
      total: result.total,
    });
  }),

  http.get("/users/:id", ({ params }) => {
    const { id } = params;
    const user = getUserById(id);

    if (!user) {
      return new HttpResponse(
        JSON.stringify({
          message: "使用者不存在",
          code: "USER_NOT_FOUND",
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    return HttpResponse.json({
      data: user,
    });
  }),

  http.post("/users", async ({ request }) => {
    const data = await request.json();

    // Check if username or email already exists
    const usernameExists = users.some(
      (user) => user.username === data.username
    );
    const emailExists = users.some((user) => user.email === data.email);

    if (usernameExists) {
      return new HttpResponse(
        JSON.stringify({
          message: "使用者帳號已存在",
          code: "USERNAME_EXISTS",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (emailExists) {
      return new HttpResponse(
        JSON.stringify({
          message: "電子郵件已存在",
          code: "EMAIL_EXISTS",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Create a new user
    const now = new Date().toISOString();
    const rolePrefix =
      data.role === 1
        ? "A"
        : data.role === 2
        ? "M"
        : data.role === 3
        ? "T"
        : "S";

    const newUser = {
      id: `${rolePrefix}${uuidv4().substring(0, 3)}`,
      username: data.username,
      name: data.name,
      email: data.email,
      phone: data.phone || "",
      role: data.role,
      status: data.status,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.username}`,
      lastLogin: "",
      notes: data.notes || "",
      createdAt: now,
      updatedAt: now,
    };

    users.push(newUser);

    return HttpResponse.json(
      {
        newUser,
      },
      { status: 201 }
    );
  }),

  http.put("/users/:id", async ({ request, params }) => {
    const { id } = params;
    const data = await request.json();

    // Find the user to update
    const userIndex = users.findIndex((user) => user.id === id);

    if (userIndex === -1) {
      return new HttpResponse(
        JSON.stringify({
          message: "使用者不存在",
          code: "USER_NOT_FOUND",
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Check for email uniqueness (excluding the current user)
    const emailExists = users.some(
      (user) => user.email === data.email && user.id !== id
    );

    if (emailExists) {
      return new HttpResponse(
        JSON.stringify({
          message: "電子郵件已存在",
          code: "EMAIL_EXISTS",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Simple update with spread, assuming data doesn't contain password if unchanged
    users[userIndex] = {
      ...users[userIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json({
      data: users[userIndex],
    });
  }),

  http.delete("/users/:id", ({ params }) => {
    const { id } = params;

    // Find the user to delete
    const userIndex = users.findIndex((user) => user.id === id);

    if (userIndex === -1) {
      return new HttpResponse(
        JSON.stringify({
          message: "使用者不存在",
          code: "USER_NOT_FOUND",
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Remove the user from the array
    users.splice(userIndex, 1);

    return HttpResponse.json({
      message: "使用者已成功刪除",
    });
  }),
];
