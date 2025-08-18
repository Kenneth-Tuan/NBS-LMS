const timeCourseSettingsSchema = {
  selectableCourses: {
    label: "可選課程",
    rules: [
      {
        type: "array",
        min: 1,
        message: "可選課程最少需要5門",
      },
      {
        type: "array",
        required: true,
        message: "請選擇可選課程",
      },
    ],
  },
  rangeTime: {
    label: "限時選課時間",
    rules: [
      {
        type: "array",
        required: true,
        message: "請選擇限時選課時間",
      },
    ],
  },
  coursesCredit: {
    label: "該學期學分上限",
    rules: [
      {
        type: "number",
        required: true,
        message: "請輸入學分上限",
      },
      { type: "number", min: 1, max: 999, message: "學分上限最少需要1分" },
    ],
  },
};

export { timeCourseSettingsSchema };
