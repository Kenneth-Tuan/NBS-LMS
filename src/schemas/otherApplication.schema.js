/**
 * 其他申請 schema
 *
 * API JSON:
 * {
 *   "attachments": ["string"]
 * }
 */

export const otherApplicationSchema = {
  other_application_id: {
    label: "申請項目",
    rules: [{ required: true, message: "請選擇申請項目" }],
    options: [],
    placeholder: "請選擇申請項目",
  },
  attachments: {
    label: "上傳填寫後表單/其他附件",
    rules: [{ required: true, message: "請上傳相關附件" }],
  },
};

// API -> 表單
export const otherApiToForm = (apiData = {}) => ({
  attachments: Array.isArray(apiData.attachments) ? apiData.attachments : [],
});

// 表單 -> API
export const otherFormToApi = (formData = {}) => ({
  attachments: (formData.attachments || []).filter(Boolean),
});


