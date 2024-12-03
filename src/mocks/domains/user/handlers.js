import { rest } from "msw";

import { useMockStore } from "@/stores/mock";
import { defaultApiError500 } from "@/mocks/handlers";
import { generateUserprofile } from "../user/model";

export const handlers = [
  rest.get(
    "https://uat-apigateway.ezbiz.com/dev-glsshoppingapi/v1/parameters/userprofile",
    async (req, res, ctx) => {
      const result = generateUserprofile();

      const {
        apiErr: { glsUserProfile },
      } = useMockStore();
      if (glsUserProfile.value) {
        return res(ctx.status(500), ctx.json(defaultApiError500));
      }

      return res(ctx.json(result));
    }
  ),
  rest.post(
    "https://uat-apigateway.ezbiz.com/dev-ezycargoapi/ezycargo/userprofile",
    async (req, res, ctx) => {
      const result = {};

      const {
        apiErr: { ezycargoUserProfile },
      } = useMockStore();
      if (ezycargoUserProfile.value) {
        return res(ctx.status(500), ctx.json(defaultApiError500));
      }

      return res(ctx.json(result));
    }
  ),
];
