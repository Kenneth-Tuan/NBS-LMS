import courseApi from "@/apis/course";

const courseService = {
  getTeachers: async () => {
    return await courseApi.getTeachers();
  },

  getPrerequisites: async () => {
    return await courseApi.getPrerequisites();
  },

  //   {
  //     "name": "資料結構與演算法",
  //     "class_mode": "上課方法",
  //     "duration": 60,
  //     "credit": 3,
  //     "teacher_id": "5f2d73c8e5b4a",
  //     "start_date": "2025-09-01",
  //     "end_date": "2026-01-15",
  //     "enrollment_limit": 60,
  //     "weekly_schedule": [
  //       {
  //         "week_day": "週一",
  //         "start_time": "15:00",
  //         "end_time": "17:00"
  //       }
  //     ],
  //     "prerequisite_course_ids": [],
  //     "description": "課程介紹內容",
  //     "cover_image": null,
  //     "outline_files": []
  //   }
  createCourse: async (params) => {
    return await courseApi.createCourse(params);
  },
};

export default courseService;
