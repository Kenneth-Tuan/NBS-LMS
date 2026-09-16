import * as R from "ramda";
import router from "@/router";

export function responseHandler(response) {
  if (R.is(String, response?.data)) {
    try {
      response.data = JSON.parse(response?.data);
    } catch (error) {
      console.error(
        "Response is not in JSON format, Response : " + response?.data
      );
      response.data = {};
    }
  }

  return response;
}

export function responseErrorHandler(error) {
  // TODO：token 過期
  if (error.response) {
    switch (error.response.status) {
      case 401:
      case 403:
      case 500:
      default:
        throw error;
    }
  }
  if (!window.navigator.onLine) {
  }

  return Promise.reject(error);
}

/**
 * 抽出後端錯誤訊息（422/400 等），相容 message / msg 兩種欄位。
 * @param {unknown} error
 * @param {string} [fallback='操作失敗，請稍後重試']
 * @returns {string}
 */
export function getApiErrorMessage(error, fallback = "操作失敗，請稍後重試") {
  const data = error?.response?.data;
  return data?.message || data?.msg || error?.message || fallback;
}
