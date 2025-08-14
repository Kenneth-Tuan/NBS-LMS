/**
 * 實習申請 schema
 * 依據 API 格式定義欄位、驗證規則與映射函式
 *
 * API JSON:
 * {
 *   "organization_name": "string",
 *   "organization_address": "string",
 *   "contact_person_name": "string",
 *   "contact_person_phone": "string",
 *   "contact_person_email": "string",
 *   "internship_start_date": "2025-09-19T00:00:00.000+08:00",
 *   "internship_end_date": "2026-09-19T00:00:00.000+08:00",
 *   "internship_hours": 0,
 *   "internship_description": "string"
 * }
 */

export const internshipApplicationSchema = {
  organization_name: {
    label: "實習機構名稱",
    rules: [{ required: true, message: "請輸入實習機構名稱" }],
    placeholder: "請輸入實習機構名稱",
  },
  organization_address: {
    label: "實習機構地址",
    rules: [{ required: true, message: "請輸入實習機構地址" }],
    placeholder: "請輸入實習機構地址",
  },
  contact_person_name: {
    label: "聯絡人姓名",
    rules: [{ required: true, message: "請輸入聯絡人姓名" }],
    placeholder: "請輸入聯絡人姓名",
  },
  contact_person_phone: {
    label: "聯絡人電話",
    rules: [
      { required: true, message: "請輸入聯絡人電話" },
      {
        pattern: /^(\d{4}-\d{3}-\d{3}|\d{10})$/,
        message: "格式需為 NNNN-NNN-NNN 或 10 碼數字",
      },
    ],
    placeholder: "例如: 0912-345-678 或 0912345678",
  },
  contact_person_email: {
    label: "聯絡人 Email",
    rules: [
      { required: true, message: "請輸入聯絡人 Email" },
      { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "請輸入有效的 Email" },
    ],
    placeholder: "example@domain.com",
  },
  internship_date_range: {
    label: "實習日期",
    format: "YYYY-MM-DD",
    valueFormat: "YYYY-MM-DD",
    rules: [{ required: true, message: "請選擇實習日期" }],
    placeholder: ["YYYY-MM-DD", "YYYY-MM-DD"],
  },
  internship_start_date: {
    label: "實習開始日期",
    format: "YYYY-MM-DD",
    valueFormat: "YYYY-MM-DD",
    rules: [{ required: true, message: "請選擇實習開始日期" }],
    placeholder: "YYYY-MM-DD",
  },
  internship_end_date: {
    label: "實習結束日期",
    format: "YYYY-MM-DD",
    valueFormat: "YYYY-MM-DD",
    rules: [{ required: true, message: "請選擇實習結束日期" }],
    placeholder: "YYYY-MM-DD",
  },
  internship_hours: {
    label: "實習時數",
    rules: [
      { required: true, message: "請輸入實習時數" },
      { type: "number", min: 0, message: "時數需為非負整數" },
    ],
    placeholder: "請輸入實習總時數",
  },
  internship_description: {
    label: "實習概述",
    rules: [{ required: true, message: "請輸入實習概述" }],
    rows: 4,
    maxlength: 1000,
    placeholder: "請簡述實習內容",
  },
};

// API -> 表單
export const internshipApiToForm = (apiData = {}) => ({
  organization_name: apiData.organization_name || "",
  organization_address: apiData.organization_address || "",
  contact_person_name: apiData.contact_person_name || "",
  contact_person_phone: apiData.contact_person_phone || "",
  contact_person_email: apiData.contact_person_email || "",
  internship_start_date: apiData.internship_start_date || "",
  internship_end_date: apiData.internship_end_date || "",
  internship_hours: apiData.internship_hours ?? 0,
  internship_description: apiData.internship_description || "",
});

// 表單 -> API
export const internshipFormToApi = (formData = {}) => ({
  organization_name: formData.organization_name,
  organization_address: formData.organization_address,
  contact_person_name: formData.contact_person_name,
  contact_person_phone: formData.contact_person_phone,
  contact_person_email: formData.contact_person_email,
  internship_start_date: formData.internship_start_date,
  internship_end_date: formData.internship_end_date,
  internship_hours: Number(formData.internship_hours),
  internship_description: formData.internship_description,
});


