const courseSchema = {
  title: {
    label: "課程名稱",
    rules: [{ required: true, message: "請輸入課程名稱" }],
    placeholder: "請輸入課程名稱",
  },
  classMode: {
    label: "上課方式",
    rules: [{ required: true, message: "請輸入上課方式" }],
    placeholder: "請輸入上課方式",
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
    placeholder: "1-999學分",
  },
  duration: {
    label: "課程時數",
    rules: [
      {
        type: "number",
        required: true,
        message: "請輸入課程時數",
      },
      {
        type: "number",
        min: 1,
        max: 999,
        message: "課程時數必須介於 1 到 999 之間",
      },
    ],
    placeholder: "1-999小時",
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
    placeholder: "請輸入授課教師",
  },
  startDate: {
    mask: "YYYY-MM-DD",
    rules: [
      {
        type: "string",
        required: true,
        // validator: (val) => !!val && dayjs(val, "YYYY-MM-DD", true),
        message: "請輸入正確的開課日期",
      },
    ],
    label: "開課日期",
    placeholder: "請輸入開課日期",
  },
  endDate: {
    mask: "YYYY-MM-DD",
    rules: [
      {
        type: "string",
        required: true,
        // validator: (val) => !!val && dayjs(val, "YYYY-MM-DD", true),
        message: "請輸入正確的結課日期",
      },
    ],
    label: "結課日期",
    placeholder: "請輸入結課日期",
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
    placeholder: "1-999人",
  },
  week_day: {
    label: "上課日",
    rules: [
      {
        type: "string",
        required: true,
        message: "請選擇上課日",
      },
    ],
    placeholder: "請選擇上課日",
  },
  start_time: {
    label: "開始時間",
    rules: [
      {
        type: "string",
        required: true,
        message: "請輸入開始時間",
      },
    ],
    placeholder: "請輸入開始時間",
  },
  end_time: {
    label: "結束時間",
    rules: [
      {
        type: "string",
        required: true,
        message: "請輸入結束時間",
      },
    ],
    placeholder: "請輸入結束時間",
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
    placeholder: "請輸入課程簡介",
  },
  prerequisites: {
    label: "先修課程",
    options: [],
    placeholder: "請選擇先修課程 (可多選)",
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
    placeholder: "請上傳課程大綱附件",
  },
};

export { courseSchema };
