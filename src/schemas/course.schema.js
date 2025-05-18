import { dummyCourseData } from "@/data/dummy";

const courseSchema = {
  title: {
    label: "課程名稱",
    rules: [{ required: true, message: "請輸入課程名稱" }],
  },
  classMode: {
    label: "上課方式",
    rules: [{ required: true, message: "請輸入上課方式" }],
  },
  credit: {
    label: "學分數",
    rules: [
      {
        type: "number",
        required: true,
        message: "請輸入學分數",
      },
      {
        type: "number",
        min: 1,
        max: 999,
        message: "學分數必須介於 1 到 999 之間",
      },
    ],
  },
  instructor: {
    label: "授課教師",
    options: [],
    rules: [
      {
        type: "string",
        required: true,
        message: "請輸入授課教師",
      },
    ],
  },
  startDate: {
    mask: "YYYY-MM-DD",
    rules: [
      {
        type: "string",
        required: true,
        validator: (val) => !!val && dayjs(val, "YYYY-MM-DD", true),
        message: "請輸入正確的開課日期",
      },
    ],
    label: "開課日期",
  },
  endDate: {
    mask: "YYYY-MM-DD",
    rules: [
      {
        type: "string",
        required: true,
        validator: (val) => !!val && dayjs(val, "YYYY-MM-DD", true),
        message: "請輸入正確的結課日期",
      },
    ],
    label: "結束日期",
  },
  enrollmentLimit: {
    label: "選課人數上限",
    rules: [
      {
        type: "number",
        required: true,
        min: 1,
        max: 999,
        message: "選課人數上限必須介於 1 到 999 之間",
      },
    ],
  },
  weekday: {
    label: "上課日",
    options: [
      { label: "週一", value: "mon" },
      { label: "週二", value: "tue" },
      { label: "週三", value: "wed" },
      { label: "週四", value: "thu" },
      { label: "週五", value: "fri" },
      { label: "週六", value: "sat" },
      { label: "週日", value: "sun" },
    ],
    rules: [
      {
        type: "string",
        required: true,
        message: "請選擇上課日",
      },
    ],
  },
  classTime: {
    label: "上課時段",
    rules: [
      {
        type: "array",
        required: true,
        message: "請輸入上課時段",
      },
    ],
  },
  description: {
    label: "課程簡介",
    rules: [
      {
        type: "string",
        required: true,
        message: "請輸入課程簡介",
      },
    ],
  },
  prerequisites: {
    label: "先修課程",
    options: dummyCourseData.map((course) => ({
      label: course.title,
      value: course.id,
    })),
  },
  outlineFile: {
    label: "課程大綱附件",
    rules: [
      {
        type: "array",
        required: true,
        message: "請上傳課程大綱附件",
      },
    ],
  },
};

export { courseSchema };
