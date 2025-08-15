import { baseApiHelper } from "@/utils/axios";

export default {
  /**
   * POST /application/get-list
   * Request body (JSON):
   * {
   *   paged_info: {
   *     page: number,      // 頁碼
   *     page_size: number  // 每頁筆數
   *   },
   *   filter: {
   *     type: 'all' | 'internship' | 'leave' | 'subsidy' | 'other' // 擇一輸入
   *   }
   * }
   * 來源: General > application collection
   * 參考: https://campus-system-dev-749888051547.asia-east1.run.app/swagger/index.html?urls.primaryName=General
   */
  getApplicationList(params) {
    return baseApiHelper.post("/application/get-list", params);
  },
  getCoursesListForLeave() {
    return baseApiHelper.get("/application/leave/courses");
  },
  /**
   * POST /application/internship/apply
   * Request body (JSON):
   * {
   *   organization_name: string,         // 實習機構名稱
   *   organization_address: string,      // 實習機構地址
   *   contact_person_name: string,       // 聯絡人姓名
   *   contact_person_phone: string,      // 聯絡人電話
   *   contact_person_email: string,      // 聯絡人 Email
   *   internship_start_date: string,     // ISO 8601 日期時間，如 2025-09-19T00:00:00.000+08:00
   *   internship_end_date: string,       // ISO 8601 日期時間
   *   internship_hours: number,          // 實習時數
   *   internship_description: string     // 實習概述
   * }
   * 來源: General > Application > /application/internship/apply
   * 參考: https://campus-system-dev-749888051547.asia-east1.run.app/swagger/index.html?urls.primaryName=General
   */
  applyInternship(params) {
    return baseApiHelper.post("/application/internship/apply", params);
  },
  getInternshipDetail(id) {
    return baseApiHelper.get(`/application/internship/detail?internship_application_id=${id}`);
  },
  /**
   * POST /application/leave/apply
   * Request body (JSON):
   * {
   *   applicant_name: string,         // 申請人名稱（必填）
   *   applicant_email: string,        // 申請人 Email（必填）
   *   leave_start_date: string,       // YYYY-MM-DD（必填）
   *   leave_end_date: string,         // YYYY-MM-DD（必填）
   *   reason_for_leave: string,       // 請假原因（必填）
   *   supplementary_materials?: string // 相關附件（可選，逗號分隔檔名或URL）
   * }
   */
  applyLeave(params) {
    return baseApiHelper.post("/application/leave/apply", params);
  },
  getLeaveDetail(id) {
    return baseApiHelper.get(`/application/leave/detail?leave_application_id=${id}`);
  },
  /**
   * POST /application/subsidy/apply
   * Request body (JSON):
   * {
   *   applicant_name: string,           // 申請人名稱（必填）
   *   applicant_email: string,          // 申請人 Email（必填）
   *   subsidy_type: string,             // 補助類型（必填，如: type1/type2...）
   *   subsidy_amount?: number,          // 補助金額（可選）
   *   receipts?: string,                // 收據（可選，逗號分隔檔名或URL）
   *   supporting_documents?: string,    // 證明文件（可選，逗號分隔檔名或URL）
   *   supplementary_materials?: string  // 相關附件（可選，逗號分隔檔名或URL）
   * }
   */
  applySubsidy(params) {
    return baseApiHelper.post("/application/subsidy/apply", params);
  },
  getSubsidyDetail(id) {
    return baseApiHelper.get(`/application/subsidy/detail?subsidy_application_id=${id}`);
  },
  /**
   * POST /application/other/apply
   * Request body (JSON):
   * {
   *   applicant_name: string,          // 申請人名稱（必填）
   *   applicant_email: string,         // 申請人 Email（必填）
   *   title: string,                   // 申請主旨（必填）
   *   content: string,                 // 申請內容（必填）
   *   attachments?: string             // 附件（可選，逗號分隔檔名或URL）
   * }
   */
  applyOthers(params) {
    const { other_application_id, ...rest } = params;
    return baseApiHelper.post(`/application/other/apply?other_application_id=${other_application_id}`, rest);
  },
  getOthersDetail(id) {
    return baseApiHelper.get(`/application/other/detail?other_application_id=${id}`);
  },
  /**
   * POST /application/other/create-one
   * Request body (JSON):
   * {
   *   name: string,             // 項目名稱（必填）
   *   attachments?: string[]    // 附件清單（可選）
   * }
   */
  createOthers(params) {
    return baseApiHelper.post("/application/other/create-one", params);
  },
  getOthersApplicationList() {
    return baseApiHelper.get("/application/other/list");
  },
  /**
   * PUT /application/other/edit-one?other_application_id={id}
   * Request body (JSON):
   * {
   *   name?: string,
   *   attachments?: string[]
   * }
   */
  updateOthersApplication(id, params) {
    return baseApiHelper.put(`/application/other/edit-one?other_application_id=${id}`, params);
  },
  deleteOthersApplication(id) {
    return baseApiHelper.delete(`/application/other/delete-one?other_application_id=${id}`);
  },
  /**
   * POST /application/review?application_id={id}
   * Request body (JSON):
   * {
   *   type: "擇一輸入: ['internship', 'leave', 'subsidy', 'other']",
   *   action: "擇一輸入: ['Approved', 'Rejected']",
   *   note: "一些文字"
   * }
   */
  reviewApplication(id, params) {
    return baseApiHelper.post(`/application/review?application_id=${id}`, params);
  },
  getPendingNotification() {
    return baseApiHelper.get("/application/notification/pending");
  },
  getMyNotification() {
    return baseApiHelper.get(`/application/notification/my`);
  },
  /**
   * POST /application/notification/mark-as-read
   * Request body (JSON):
   * {
   *   ids?: string[] // 可選，若未提供則標記全部為已讀（依照後端設定）
   * }
   */
  markAsRead() {
    return baseApiHelper.post(`/application/notification/mark-as-read`);
  },
};
