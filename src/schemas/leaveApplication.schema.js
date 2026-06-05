/**
 * 請假申請 schema
 *
 * API JSON:
 * {
 *   "course_id": "string",
 *   "leave_type": "事假 | 病假 | 公假 | 其他",
 *   "leave_start_date": "2025-09-19T08:00:00.000+08:00",
 *   "leave_end_date": "2025-09-19T08:50:00.000+08:00",
 *   "leave_reason": "請假原因",
 *   "attachments": ["string"],
 *   "student_id": "string",
 *   "department": "master_of_divinity | ...",
 *   "leave_periods": 1
 * }
 */

export const leaveApplicationSchema = {
  // ── 學號 ──────────────────────────────────────────────────────────────
  student_id: {
    label: "學號",
    rules: [{ required: true, message: "請輸入學號" }],
    placeholder: "請輸入學號",
  },

  // ── 科系 ──────────────────────────────────────────────────────────────
  department: {
    label: "科系",
    rules: [{ required: true, message: "請選擇科系" }],
    placeholder: "請選擇科系",
  },

  // ── 請假日期（單日） ───────────────────────────────────────────────────
  leave_date: {
    label: "請假日期",
    format: "YYYY-MM-DD",
    valueFormat: "YYYY-MM-DD",
    rules: [{ required: true, message: "請選擇請假日期" }],
    placeholder: "YYYY-MM-DD",
  },

  // ── 請假節數 ──────────────────────────────────────────────────────────
  leave_periods: {
    label: "請假節數",
    rules: [
      { required: true, message: "請輸入請假節數" },
      { type: "number", min: 1, message: "請假節數至少 1 節" },
    ],
    placeholder: "節數（至少 1）",
  },

  // ── 請假課程 ──────────────────────────────────────────────────────────
  course_id: {
    label: "請假課程",
    rules: [{ required: true, message: "請選擇請假課程" }],
    options: [],
    placeholder: "請選擇請假課程",
  },

  // ── 假別 ──────────────────────────────────────────────────────────────
  leave_type: {
    label: "假別",
    rules: [{ required: true, message: "請選擇假別" }],
    options: [
      { label: "事假", value: "事假" },
      { label: "病假", value: "病假" },
      { label: "公假", value: "公假" },
      { label: "其他", value: "其他" },
    ],
    placeholder: "請選擇假別",
  },

  // ── 請假原因（最多 20 字） ─────────────────────────────────────────────
  leave_reason: {
    label: "請假原因",
    rules: [
      { required: true, message: "請填寫請假原因" },
      { max: 20, message: "請假原因不得超過 20 字" },
    ],
    placeholder: "請詳述請假原因（最多 20 字）",
    maxLength: 20,
  },

  // ── 附件 ──────────────────────────────────────────────────────────────
  attachments: {
    label: "相關附件",
    rules: [{ required: false, message: "請上傳相關附件" }],
  },
};

// API -> 表單
export const leaveApiToForm = (apiData = {}) => ({
  student_id: apiData.student_id || "",
  department: apiData.department || "",
  course_id: apiData.course_id || "",
  leave_type: apiData.leave_type || "",
  leave_date: apiData.leave_start_date
    ? apiData.leave_start_date.split("T")[0]
    : null,
  leave_periods: apiData.leave_periods || 1,
  leave_reason: apiData.leave_reason || "",
  attachments: Array.isArray(apiData.attachments) ? apiData.attachments : [],
});

// 表單 -> API
export const leaveFormToApi = (formData = {}) => ({
  course_id: formData.course_id,
  leave_type: formData.leave_type,
  leave_start_date: formData.leave_start_date || "",
  leave_end_date: formData.leave_end_date || "",
  leave_reason: formData.leave_reason,
  attachments: (formData.attachments || []).filter(Boolean),
  student_id: formData.student_id,
  department: formData.department,
  leave_periods: formData.leave_periods,
});
