import axios from "axios";

import { useUserStore } from "@/stores/user";
import { responseHandler, responseErrorHandler } from "@/utils/axios/utils";

const baseURL = import.meta.env.VITE_LMS_BASE_URL;

export const apiHelper = axios.create({
  baseURL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

apiHelper.interceptors.request.use(
  function (config) {
    const userStore = useUserStore();
    const { getToken } = userStore;

    const token = getToken();
    config.headers.Authorization = `Bearer ${token}`;

    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

apiHelper.interceptors.response.use(
  function (response) {
    return responseHandler(response);
  },
  async function (error) {
    return responseErrorHandler(error);
  }
);
