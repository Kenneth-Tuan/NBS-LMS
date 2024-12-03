import { handlers as userHandlers } from "@/mocks/domains/user/handlers";
import { handlers as validateHandlers } from "@/mocks/domains/submit/handlers";
import { handlers as fwbHandlers } from "@/mocks/domains/fwb/handlers";
import { handlers as otherHandlers } from "./domains/other/handlers";
import { handlers as customerHandlers } from "./domains/customer/handlers";
import { handlers as templateHandlers } from "./domains/template/handlers";
import { handlers as shcHandlers } from "./domains/shc/handlers";

export const defaultApiError500 = {
  title: "System Not Available",
  details: [
    {
      message: "Server Busy",
      resource:
        "https://uat-apigateway-ezyonerecord.ezbiz.com/dev-onerecordapi/swagger/index.html",
      id: "30029-02",
      language: "en",
    },
  ],
  id: "500",
  type: "",
  language: "en",
};

export const handlers = [
  ...userHandlers,
  ...validateHandlers,
  ...fwbHandlers,
  ...otherHandlers,
  ...customerHandlers,
  ...templateHandlers,
  ...shcHandlers,
];
