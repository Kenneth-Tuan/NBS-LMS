import axios from "axios";

import { useUserStore } from "@/stores/user";
import { responseHandler, responseErrorHandler } from "@/utils/axios/utils";

const baseURL = import.meta.env.VITE_API_BASE_URL;

const baseApiHelper = axios.create({
  baseURL,
  headers: {
    Accept: "text/plain",
    "Content-Type": "application/json",
  },
});

baseApiHelper.interceptors.request.use(
  function (config) {
    const userStore = useUserStore();
    const { getToken } = userStore;

    const token = getToken();
    config.headers["X-Campus-System-Token"] = token;

    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

baseApiHelper.interceptors.response.use(
  function (response) {
    return responseHandler(response);
  },
  async function (error) {
    return responseErrorHandler(error);
  }
);

const authApiHelper = axios.create({
  baseURL,
});

const fileApiHelper = axios.create({
  baseURL,
  headers: {
    Accept: "text/plain",
    "Content-Type": "multipart/form-data",
  },
});

export { baseApiHelper, authApiHelper, fileApiHelper };
