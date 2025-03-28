import { dummyCourseData } from "@/data/dummy";

// 獲取課程列表
export const getCourseList = () => {
  try {
    // 從 sessionStorage 獲取已保存的課程
    const savedCourses = JSON.parse(
      sessionStorage.getItem("userCourses") || "[]"
    );

    // 合併基本課程數據和已保存的課程
    const allCourses = [...dummyCourseData];

    // 將已保存的課程添加到列表中
    savedCourses.forEach((savedCourse) => {
      const existingIndex = allCourses.findIndex(
        (course) => course.id === savedCourse.id
      );
      if (existingIndex !== -1) {
        allCourses[existingIndex] = savedCourse;
      } else {
        allCourses.push(savedCourse);
      }
    });

    return allCourses;
  } catch (error) {
    console.error("獲取課程列表出錯:", error);
    return dummyCourseData;
  }
};

// 保存新課程
export const saveCourse = (courseData) => {
  try {
    // 獲取已保存的課程
    const savedCourses = JSON.parse(
      sessionStorage.getItem("userCourses") || "[]"
    );

    // 生成新的課程ID
    const newId =
      Math.max(
        ...savedCourses.map((course) => course.id),
        ...dummyCourseData.map((course) => course.id)
      ) + 1;

    // 創建新課程對象
    const newCourse = {
      id: newId,
      ...courseData,
      status: courseData.status || "待審核",
      createdAt: new Date().toISOString(),
    };

    // 添加到已保存的課程列表
    savedCourses.push(newCourse);

    // 保存回 sessionStorage
    sessionStorage.setItem("userCourses", JSON.stringify(savedCourses));

    return newCourse;
  } catch (error) {
    console.error("保存課程出錯:", error);
    throw error;
  }
};

// 更新課程狀態
export const updateCourse = (courseId, newStatus, reviewData = {}) => {
  try {
    // 獲取已保存的課程
    const savedCourses = JSON.parse(
      sessionStorage.getItem("userCourses") || "[]"
    );

    // 尋找要更新的課程
    const courseIndex = savedCourses.findIndex(
      (course) => course.id === courseId
    );

    if (courseIndex === -1) {
      // 從基本數據中尋找
      const allCourses = getCourseList();
      const baseCourse = allCourses.find((course) => course.id === courseId);

      if (!baseCourse) {
        throw new Error(`找不到 ID 為 ${courseId} 的課程`);
      }

      // 更新狀態並加入審核數據
      const updatedCourse = {
        ...baseCourse,
        status: newStatus,
        ...reviewData,
        updatedAt: new Date().toISOString(),
      };

      // 添加到保存的課程中
      savedCourses.push(updatedCourse);
    } else {
      // 更新現有課程
      savedCourses[courseIndex] = {
        ...savedCourses[courseIndex],
        status: newStatus,
        ...reviewData,
        updatedAt: new Date().toISOString(),
      };
    }

    // 保存回 sessionStorage
    sessionStorage.setItem("userCourses", JSON.stringify(savedCourses));

    // 返回更新後的課程列表
    return getCourseList();
  } catch (error) {
    console.error("更新課程狀態出錯:", error);
    throw error;
  }
};
