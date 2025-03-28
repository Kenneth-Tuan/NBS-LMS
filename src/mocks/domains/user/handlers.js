import { http, HttpResponse } from "msw";
import dayjs from "dayjs";

// import { useMockStore } from "@/stores/mock";
import { defaultApiError500 } from "@/mocks/handlers";
import { generateUserprofile } from "../user/model";

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
];
