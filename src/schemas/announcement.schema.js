/**
 * 課堂公告 schema
 * 定義欄位與驗證規則
 */

export const announcementSchema = {
  title: {
    label: "標題",
    rules: [{ required: true, message: "請輸入標題!" }],
    placeholder: "請輸入公告標題",
  },
  content: {
    label: "內容",
    rules: [{ required: true, message: "請輸入內容!" }],
    placeholder: "請輸入公告內容",
    rows: 5,
  },
};
