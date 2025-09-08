/**
 * 請假申請 schema
 *
 * API JSON:
 * {
 *   "course_id": "string",
 *   "leave_type": "例如: 病假、事假、公假等",
 *   "leave_start_date": "2025-09-19T08:00:00.000+08:00",
 *   "leave_end_date": "2025-09-19T18:00:00.000+08:00",
 *   "leave_reason": "請假原因",
 *   "attachments": ["string"]
 * }
 */

export const leaveApplicationSchema = {
  leave_date_range: {
    label: "請假日期",
    format: "YYYY-MM-DD",
    valueFormat: "YYYY-MM-DD",
    rules: [{ required: true, message: "請選擇請假日期" }],
    placeholder: ["YYYY-MM-DD", "YYYY-MM-DD"],
  },
  course_id: {
    label: "請假課程",
    rules: [{ required: true, message: "請選擇請假課程" }],
    options: [],
    placeholder: "請選擇請假課程",
  },
  leave_type: {
    label: "請假類型",
    rules: [{ required: true, message: "請選擇請假類型" }],
    options: [
      { label: "病假", value: "病假" },
      { label: "事假", value: "事假" },
      { label: "公假", value: "公假" },
      { label: "其他", value: "其他" },
    ],
    placeholder: "請選擇請假類型",
  },
  leave_start_date: {
    label: "開始時間",
    mask: "YYYY-MM-DD",
    rules: [{ required: true, message: "請選擇開始時間" }],
    placeholder: "YYYY-MM-DD",
  },
  leave_end_date: {
    label: "結束時間",
    mask: "YYYY-MM-DD",
    rules: [{ required: true, message: "請選擇結束時間" }],
    placeholder: "YYYY-MM-DD",
  },
  leave_reason: {
    label: "請假原因",
    rules: [{ required: true, message: "請填寫請假原因" }],
    placeholder: "請詳述請假原因",
  },
  attachments: {
    label: "相關附件",
    rules: [{ required: false, message: "請上傳相關附件" }],
  },
};

// API -> 表單
export const leaveApiToForm = (apiData = {}) => ({
  course_id: apiData.course_id || "",
  leave_type: apiData.leave_type || "",
  leave_date_range: apiData.leave_start_date && apiData.leave_end_date ? [apiData.leave_start_date, apiData.leave_end_date] : [],
  leave_start_date: apiData.leave_start_date || "",
  leave_end_date: apiData.leave_end_date || "",
  leave_reason: apiData.leave_reason || "",
  attachments: Array.isArray(apiData.attachments) ? apiData.attachments : [],
});

// 表單 -> API
export const leaveFormToApi = (formData = {}) => ({
  course_id: formData.course_id,
  leave_type: formData.leave_type,
  leave_start_date: Array.isArray(formData.leave_date_range) ? formData.leave_date_range[0] : formData.leave_start_date,
  leave_end_date: Array.isArray(formData.leave_date_range) ? formData.leave_date_range[1] : formData.leave_end_date,
  leave_reason: formData.leave_reason,
  attachments: (formData.attachments || []).filter(Boolean),
});


