import { handlers as userHandlers } from "./domains/user/handlers";
import { handlers as applicationHandlers } from "./domains/applications/handlers";
import { handlers as courseHandlers } from "./domains/courses/handlers";
// import { handlers as validateHandlers } from "@/mocks/domains/submit/handlers";
// import { handlers as fwbHandlers } from "@/mocks/domains/fwb/handlers";
// import { handlers as otherHandlers } from "./domains/other/handlers";
// import { handlers as customerHandlers } from "./domains/customer/handlers";
// import { handlers as templateHandlers } from "./domains/template/handlers";
// import { handlers as shcHandlers } from "./domains/shc/handlers";

export const defaultApiError500 = {
  code: "API_ERROR_500",
  message: "Something went wrong.",
};

export const handlers = [
  ...userHandlers,
  ...applicationHandlers,
  ...courseHandlers,
  // ...validateHandlers,
  // ...fwbHandlers,
  // ...otherHandlers,
  // ...customerHandlers,
  // ...templateHandlers,
  // ...shcHandlers,
];
