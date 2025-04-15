import { ref, computed } from "vue";
import { defineStore } from "pinia";

// 成績等級
export const GradeLevel = {
  A_PLUS: "A+",
  A: "A",
  A_MINUS: "A-",
  B_PLUS: "B+",
  B: "B",
  B_MINUS: "B-",
  C_PLUS: "C+",
  C: "C",
  C_MINUS: "C-",
  F: "F",
};

// Helper function to generate random grade details
const generateGradeDetails = (grade) => {
  // Define base score ranges for each grade level
  const baseScores = {
    "A+": { min: 95, max: 100 },
    A: { min: 90, max: 94 },
    "A-": { min: 85, max: 89 },
    "B+": { min: 80, max: 84 },
    B: { min: 75, max: 79 },
    "B-": { min: 70, max: 74 },
    "C+": { min: 65, max: 69 },
    C: { min: 60, max: 64 },
    "C-": { min: 55, max: 59 },
    F: { min: 0, max: 54 },
  };

  // Calculate a random total score within the grade's range
  const range = baseScores[grade];
  const totalScore =
    Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;

  // Calculate component scores that add up to the total
  // Attendance (total lessons between 12-16, attended lessons proportional to grade)
  const totalLessons = Math.floor(Math.random() * 5) + 12;
  const attendanceRate = Math.min(1, totalScore / 100 + Math.random() * 0.2);
  const attendedLessons = Math.floor(totalLessons * attendanceRate);

  // Generate random scores for other components
  const participationScore =
    Math.floor(Math.random() * 15) + (totalScore >= 70 ? 5 : 0);

  // Adjust midterm and final based on total score target
  const midtermScore =
    Math.floor(Math.random() * 25) + (totalScore >= 70 ? 15 : 5);
  const finalScore =
    Math.floor(Math.random() * 25) + (totalScore >= 70 ? 15 : 5);

  // Quiz scores
  const quizScores = [];
  const quizCount = Math.floor(Math.random() * 3) + 1; // 1-3 quizzes
  for (let i = 0; i < quizCount; i++) {
    quizScores.push(
      Math.floor(Math.random() * 25) + (totalScore >= 70 ? 15 : 5)
    );
  }

  const quizAverage =
    quizScores.reduce((sum, score) => sum + score, 0) / quizScores.length;

  return {
    attendance: {
      totalLessons,
      attendedLessons,
      score: Math.round((attendedLessons / totalLessons) * 20), // 20% of grade
    },
    participation: {
      score: participationScore, // 0-20, 20% of grade
    },
    midterm: {
      score: midtermScore, // 0-40, 30% of grade
    },
    final: {
      score: finalScore, // 0-40, 30% of grade
    },
    quizzes: {
      scores: quizScores,
      average: Math.round(quizAverage),
    },
    total: totalScore,
  };
};

// 課程紀錄假資料
const dummyCourseRecords = [
  {
    id: "1",
    semester: "2023-秋季",
    courseName: "新約概論",
    teacher: "王大明牧師",
    grade: GradeLevel.A,
    gradeDetails: null, // Will be populated
  },
  {
    id: "2",
    semester: "2023-秋季",
    courseName: "舊約歷史書研究",
    teacher: "李文清博士",
    grade: GradeLevel.B_PLUS,
    gradeDetails: null,
  },
  {
    id: "3",
    semester: "2023-秋季",
    courseName: "教會歷史導論",
    teacher: "陳歷史教授",
    grade: GradeLevel.A_MINUS,
    gradeDetails: null,
  },
  {
    id: "4",
    semester: "2023-秋季",
    courseName: "講道學基礎",
    teacher: "張牧師",
    grade: GradeLevel.B,
    gradeDetails: null,
  },
  {
    id: "5",
    semester: "2023-秋季",
    courseName: "系統神學導論",
    teacher: "林博士",
    grade: GradeLevel.A_PLUS,
    gradeDetails: null,
  },
  {
    id: "6",
    semester: "2024-春季",
    courseName: "教牧輔導",
    teacher: "黃心理博士",
    grade: GradeLevel.B_MINUS,
    gradeDetails: null,
  },
  {
    id: "7",
    semester: "2024-春季",
    courseName: "新約希臘文（初級）",
    teacher: "吳語言教授",
    grade: GradeLevel.C_PLUS,
    gradeDetails: null,
  },
  {
    id: "8",
    semester: "2024-春季",
    courseName: "宗教改革史",
    teacher: "陳歷史教授",
    grade: GradeLevel.A,
    gradeDetails: null,
  },
  {
    id: "9",
    semester: "2024-春季",
    courseName: "基督徒靈命塑造",
    teacher: "謝靈修牧師",
    grade: GradeLevel.A_MINUS,
    gradeDetails: null,
  },
  {
    id: "10",
    semester: "2024-春季",
    courseName: "當代神學思潮",
    teacher: "林博士",
    grade: GradeLevel.B_PLUS,
    gradeDetails: null,
  },
  {
    id: "11",
    semester: "2022-秋季",
    courseName: "舊約希伯來文（初級）",
    teacher: "趙語言教授",
    grade: GradeLevel.C,
    gradeDetails: null,
  },
  {
    id: "12",
    semester: "2022-秋季",
    courseName: "基督教倫理學",
    teacher: "林博士",
    grade: GradeLevel.B,
    gradeDetails: null,
  },
  {
    id: "13",
    semester: "2022-秋季",
    courseName: "宣教學導論",
    teacher: "劉宣教牧師",
    grade: GradeLevel.A,
    gradeDetails: null,
  },
  {
    id: "14",
    semester: "2022-秋季",
    courseName: "崇拜學",
    teacher: "王大明牧師",
    grade: GradeLevel.A_MINUS,
    gradeDetails: null,
  },
  {
    id: "15",
    semester: "2022-秋季",
    courseName: "教會管理",
    teacher: "黃心理博士",
    grade: GradeLevel.B_PLUS,
    gradeDetails: null,
  },
  {
    id: "16",
    semester: "2023-春季",
    courseName: "護教學",
    teacher: "李文清博士",
    grade: GradeLevel.A_PLUS,
    gradeDetails: null,
  },
  {
    id: "17",
    semester: "2023-春季",
    courseName: "聖經詮釋學",
    teacher: "王大明牧師",
    grade: GradeLevel.B,
    gradeDetails: null,
  },
  {
    id: "18",
    semester: "2023-春季",
    courseName: "釋經講道",
    teacher: "張牧師",
    grade: GradeLevel.A,
    gradeDetails: null,
  },
  {
    id: "19",
    semester: "2023-春季",
    courseName: "初代教會歷史",
    teacher: "陳歷史教授",
    grade: GradeLevel.C_MINUS,
    gradeDetails: null,
  },
  {
    id: "20",
    semester: "2023-春季",
    courseName: "基督教社會關懷",
    teacher: "劉宣教牧師",
    grade: GradeLevel.B_MINUS,
    gradeDetails: null,
  },
  {
    id: "21",
    semester: "2021-秋季",
    courseName: "青少年事工",
    teacher: "謝靈修牧師",
    grade: GradeLevel.A_MINUS,
    gradeDetails: null,
  },
  {
    id: "22",
    semester: "2021-秋季",
    courseName: "基督教家庭關係",
    teacher: "黃心理博士",
    grade: GradeLevel.B_PLUS,
    gradeDetails: null,
  },
  {
    id: "23",
    semester: "2021-秋季",
    courseName: "研經方法",
    teacher: "王大明牧師",
    grade: GradeLevel.F,
    gradeDetails: null,
  },
  {
    id: "24",
    semester: "2021-秋季",
    courseName: "中國教會史",
    teacher: "陳歷史教授",
    grade: GradeLevel.A,
    gradeDetails: null,
  },
  {
    id: "25",
    semester: "2021-秋季",
    courseName: "屬靈領導學",
    teacher: "謝靈修牧師",
    grade: GradeLevel.B,
    gradeDetails: null,
  },
];

// Generate grade details for each course
dummyCourseRecords.forEach((record) => {
  record.gradeDetails = generateGradeDetails(record.grade);
});

export const useCourseRecordStore = defineStore("courseRecord", () => {
  // 所有課程紀錄
  const courseRecords = ref(dummyCourseRecords);
  const loading = ref(false);
  const error = ref(null);

  // 搜尋條件
  const searchSemester = ref("");
  const searchCourseName = ref("");
  const searchTeacher = ref("");

  // 當前選擇的課程記錄
  const selectedCourseRecord = ref(null);

  // 取得所有學期（年份）列表，用於下拉選單
  const semesterList = computed(() => {
    const semesters = new Set();
    courseRecords.value.forEach((record) => {
      semesters.add(record.semester);
    });
    return Array.from(semesters).sort().reverse();
  });

  // 取得所有教師列表，用於下拉選單
  const teacherList = computed(() => {
    const teachers = new Set();
    courseRecords.value.forEach((record) => {
      teachers.add(record.teacher);
    });
    return Array.from(teachers).sort();
  });

  // 根據搜尋條件過濾課程紀錄
  const filteredCourseRecords = computed(() => {
    return courseRecords.value.filter((record) => {
      const matchSemester =
        !searchSemester.value || record.semester === searchSemester.value;
      const matchCourseName =
        !searchCourseName.value ||
        record.courseName.includes(searchCourseName.value);
      const matchTeacher =
        !searchTeacher.value || record.teacher === searchTeacher.value;

      return matchSemester && matchCourseName && matchTeacher;
    });
  });

  // 取得課程紀錄
  const getCourseRecords = async () => {
    try {
      loading.value = true;
      error.value = null;

      // 在實際應用中，這裡會從 API 獲取資料
      // 此處我們使用模擬資料，所以只是簡單地設置一個延遲
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 資料已在 courseRecords 初始化
    } catch (err) {
      error.value = err.message || "無法獲取課程紀錄";
      console.error("獲取課程紀錄失敗:", err);
    } finally {
      loading.value = false;
    }
  };

  // 根據 ID 獲取特定課程成績詳情
  const getCourseGradeById = (id) => {
    const record = courseRecords.value.find((r) => r.id === id);
    if (record) {
      selectedCourseRecord.value = record;
      return record;
    }
    return null;
  };

  // 重置搜尋條件
  const resetSearch = () => {
    searchSemester.value = "";
    searchCourseName.value = "";
    searchTeacher.value = "";
  };

  return {
    courseRecords,
    loading,
    error,
    searchSemester,
    searchCourseName,
    searchTeacher,
    selectedCourseRecord,
    semesterList,
    teacherList,
    filteredCourseRecords,

    getCourseRecords,
    getCourseGradeById,
    resetSearch,
  };
});
