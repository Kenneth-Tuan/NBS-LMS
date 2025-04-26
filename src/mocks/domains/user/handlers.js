import { http, HttpResponse } from "msw";
import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";

// import { useMockStore } from "@/stores/mock";
import { defaultApiError500 } from "@/mocks/handlers";
import { generateUserprofile } from "../user/model";
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

    // Filter users based on query parameters
    let filteredUsers = [...users];

    if (keyword) {
      const lowercaseKeyword = keyword.toLowerCase();
      filteredUsers = filteredUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(lowercaseKeyword) ||
          user.username.toLowerCase().includes(lowercaseKeyword) ||
          user.email.toLowerCase().includes(lowercaseKeyword)
      );
    }

    if (role !== null) {
      filteredUsers = filteredUsers.filter((user) => user.role === role);
    }

    if (status !== null) {
      filteredUsers = filteredUsers.filter((user) => user.status === status);
    }

    // Calculate pagination
    const total = filteredUsers.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedUsers = filteredUsers.slice(start, end);

    return HttpResponse.json({
      data: {
        users: paginatedUsers,
        total: total,
      },
    });
  }),

  http.get("/users/:id", ({ params }) => {
    const { id } = params;
    const user = users.find((user) => user.id === id);

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
    const newUser = {
      id: data.username.startsWith("S")
        ? `S${uuidv4().substring(0, 3)}`
        : data.username.startsWith("T")
        ? `T${uuidv4().substring(0, 3)}`
        : data.username.startsWith("M")
        ? `M${uuidv4().substring(0, 3)}`
        : `A${uuidv4().substring(0, 3)}`,
      username: data.username,
      name: data.name,
      email: data.email,
      phone: data.phone || "",
      role: data.role,
      status: data.status,
      createdAt: now,
      updatedAt: now,
    };

    users.push(newUser);

    return HttpResponse.json(
      {
        data: newUser,
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

    // Check if email is taken by another user
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

    // Update the user
    const updatedUser = {
      ...users[userIndex],
      name: data.name,
      email: data.email,
      phone: data.phone || users[userIndex].phone,
      role: data.role,
      status: data.status,
      updatedAt: new Date().toISOString(),
    };

    users[userIndex] = updatedUser;

    return HttpResponse.json({
      data: updatedUser,
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
