/**
 * 補助申請 schema
 *
 * API JSON:
 * {
 *   "subsidy_type": "string",
 *   "attachments": ["string"]
 * }
 */

export const subsidyApplicationSchema = {
  subsidy_type: {
    label: "補助類型",
    rules: [{ required: true, message: "請選擇補助類型" }],
    options: [
      { label: "學費補助", value: "type1" },
      { label: "住宿補助", value: "type2" },
      { label: "交通補助", value: "type3" },
      { label: "其他補助", value: "type4" },
    ],
  },
  attachments: {
    label: "相關附件",
    rules: [{ required: true, message: "請上傳相關附件" }],
  },
};

// API -> 表單
export const subsidyApiToForm = (apiData = {}) => ({
  subsidy_type: apiData.subsidy_type || "",
  attachments: Array.isArray(apiData.attachments) ? apiData.attachments : [],
});

// 表單 -> API
export const subsidyFormToApi = (formData = {}) => ({
  subsidy_type: formData.subsidy_type,
  attachments: (formData.attachments || []).filter(Boolean),
});


