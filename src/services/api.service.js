import axios from "axios";

/**
 * API服務 - 負責API通訊與資料格式轉換
 */
export const apiService = {
  /**
   * 發送GET請求
   * @param {string} url - API端點
   * @param {Object} params - 查詢參數
   * @returns {Promise<any>} 轉換後的響應數據
   */
  async get(url, params = {}) {
    try {
      const response = await axios.get(url, { params });
      return this.transformResponse(response);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  },

  /**
   * 發送POST請求
   * @param {string} url - API端點
   * @param {Object} data - 請求數據
   * @returns {Promise<any>} 轉換後的響應數據
   */
  async post(url, data = {}) {
    try {
      const response = await axios.post(url, data);
      return this.transformResponse(response);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  },

  /**
   * 轉換API響應格式
   * @param {Object} response - Axios響應對象
   * @returns {Object} 轉換後的數據
   */
  transformResponse(response) {
    // 在這裡轉換API響應格式
    return response.data;
  },

  /**
   * 處理API錯誤
   * @param {Error} error - 錯誤對象
   */
  handleError(error) {
    if (error.response) {
      console.error("API錯誤:", error.response.status, error.response.data);
    } else {
      console.error("API請求失敗:", error.message);
    }
  },
};
