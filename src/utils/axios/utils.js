import * as R from "ramda";

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
