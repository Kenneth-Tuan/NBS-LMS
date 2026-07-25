import { ref, computed } from "vue";
import dayjs from "dayjs";
import * as XLSX from "xlsx";
import { message } from "ant-design-vue";

import courseApi from "../apis/course";
import scoreApi from "../apis/score";
import {
  DEPARTMENT_PASS_SCORE_MAP,
  DEFAULT_PASS_SCORE,
} from "../constant/common.constant";

/**
 * 取得學生所屬科別的及格門檻。
 * @param {string} [department] 科別代碼（非中文標籤）
 * @returns {number} 查無科別時回傳預設門檻
 */
export const getPassScore = (department) =>
  DEPARTMENT_PASS_SCORE_MAP[department] ?? DEFAULT_PASS_SCORE;

/**
 * 解析使用者自由輸入的轉入學分。
 * 轉入學分是自由文字輸入，可能為 ""、"-" 或非數字字串，
 * 未經檢查直接相加會讓總學分變成 NaN 並印上成績單。
 * @param {*} value
 * @returns {number} 無法解析為有限數值時回傳 0
 */
export const parseTransferCredits = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

/**
 * 評估一位學生在單門課程的修課狀態、及格與否與實得學分。
 * 這是成績單所有顯示與計算的唯一判斷來源。
 * @param {Object} student selectedCoursesTranscript 中的一列
 * @param {{ id: string, name?: string, credit?: number }} course 正規化的課程
 * @param {number} passScore 及格門檻
 */
export const evaluateCourse = (student, course, passScore) => {
  const { id, name = "", credit = 0 } = course;

  // 僅在明確標記為 false 時視為未修課，維持既有語意
  const enrolled = student?.course_status?.[id] !== false;
  const score = student?.[id];
  const hasScore = score > 0;
  const passed = enrolled && hasScore && score >= passScore;

  return {
    id,
    name,
    credit,
    score,
    enrolled,
    hasScore,
    passed,
    earnedCredit: passed ? credit : 0,
  };
};

/**
 * 彙總一位學生所有選取課程的評估結果與總學分，供 PDF 與 Excel 共用。
 * 回傳的 courses 包含未修課的課程（enrolled 為 false），由呼叫端自行過濾。
 * @param {Object} student
 * @param {Array<{ id: string, name?: string, credit?: number }>} courseList
 * @param {{ department?: string, transferCredits?: * }} form
 */
export const buildTranscriptSummary = (student, courseList = [], form = {}) => {
  const passScore = getPassScore(form.department);
  const courses = courseList.map((course) =>
    evaluateCourse(student, course, passScore),
  );
  const earnedCredits = courses.reduce((sum, c) => sum + c.earnedCredit, 0);
  const transferCredits = parseTransferCredits(form.transferCredits);

  return {
    passScore,
    courses,
    earnedCredits,
    transferCredits,
    totalCredits: earnedCredits + transferCredits,
  };
};

const useCreateTranscript = () => {
  const allCourses = ref([]);
  const dateRange = ref([]);
  const selectedCourses = ref([]);
  const selectedCoursesTranscript = ref([]);
  const loading = ref(false);

  const getAllCourses = async () => {
    const params = {
      paged_info: {
        page: 1,
        page_size: 999,
      },
      ordering: {
        direction: "desc",
        field: "start_date",
      },
    };

    try {
      loading.value = true;
      const response = await courseApi.getCourses(params);
      allCourses.value = response.data.data.courses;
      return response.data.data.courses;
    } catch (error) {
      console.error(error);
      return [];
    } finally {
      loading.value = false;
    }
  };

  const filteredCourses = computed(() => {
    if (!dateRange.value || dateRange.value.length !== 2) {
      return [];
    }

    const [start, end] = dateRange.value;
    const rangeStart = dayjs(start).startOf("day");
    const rangeEnd = dayjs(end).endOf("day");

    return allCourses.value.filter((course) => {
      const courseStart = dayjs(course.start_date);
      const courseEnd = dayjs(course.end_date);

      // Strict containment:
      // Course Start >= Range Start AND Course End <= Range End
      return (
        (courseStart.isSame(rangeStart) || courseStart.isAfter(rangeStart)) &&
        (courseEnd.isSame(rangeEnd) || courseEnd.isBefore(rangeEnd))
      );
    });
  });

  const generateTranscript = async () => {
    if (selectedCourses.value.length === 0) {
      message.warning("請先選擇課程");
      return;
    }

    loading.value = true;
    selectedCoursesTranscript.value = [];
    const studentMap = new Map();

    try {
      // Create a map of course ID to Course Name for easy lookup
      const courseMap = {};
      selectedCourses.value.forEach((id) => {
        const course = allCourses.value.find((c) => c.course_id === id);
        if (course) {
          courseMap[id] = course.name;
        }
      });

      const promises = selectedCourses.value.map(async (courseId) => {
        try {
          // Get "Total" score item ID ? No, the data_rows already has scores.
          // Wait, the API returns score_items (headers) and data_rows (students).
          // We need to find the "Total" (總分) item ID from the response or just filter by name "總分" ??
          // The user said: "我們只要取每個學生 name === '總分' 的 score 就好。"
          // But data_rows structure is:
          // { student_id, student_name, scores: [ { score_item_id, score } ] }
          // We don't see the score item NAME in data_rows.
          // We also get `score_items` in the response: [ { id, name } ]

          const {
            data: {
              data: { score_items, data_rows },
            },
          } = await scoreApi.getScoreSheet(courseId); // Re-fetching or getting from same response?
          // Usually Axios response has data. Let's optimize.

          // Actually checking the user prompt:
          // "這個 api 回傳的資料格式如下： { data: { score_items: [...], data_rows: [...] } }"
          // So we get both.

          // Process all students in the course to track enrollment
          const totalItem = score_items.find((item) => item.name === "總分");

          data_rows.forEach((row) => {
            const studentId = row.student_id;
            if (!studentMap.has(studentId)) {
              studentMap.set(studentId, {
                student_name: row.student_name,
                scores: {}, // courseId -> score
                enrolled_courses: new Set(), // Track which courses this student is in
              });
            }

            const studentData = studentMap.get(studentId);
            studentData.enrolled_courses.add(courseId);

            // Only try to get score if we found the "Total" item
            if (totalItem) {
              const totalScoreObj = row.scores.find(
                (s) => s.score_item_id === totalItem.id,
              );

              if (totalScoreObj) {
                studentData.scores[courseId] = totalScoreObj.score;
              }
            }
          });
        } catch (err) {
          console.error(`Failed to fetch scores for course ${courseId}`, err);
        }
      });

      await Promise.all(promises);

      // Convert map to array
      selectedCoursesTranscript.value = Array.from(studentMap.entries()).map(
        ([studentId, data]) => {
          // Generate course_status map: { [courseId]: boolean }
          const course_status = {};
          selectedCourses.value.forEach((cid) => {
            course_status[cid] = data.enrolled_courses.has(cid);
          });

          return {
            student_id: studentId,
            student_name: data.student_name,
            course_status,
            ...data.scores,
          };
        },
      );
    } catch (error) {
      console.error("Error generating transcript", error);
      message.error("生成成績單失敗");
    } finally {
      loading.value = false;
    }
  };

  /**
   * @param {Record<string, { studentId?: string, enrollmentDate?: any, major?: string, department?: string, transferCredits?: * }>} [studentPdfForms]
   *   key = student_id，value 為各生 expanded form 內容。
   *   department 為科別代碼（決定及格門檻），major 為對應的中文顯示標籤。
   */
  const exportToExcel = (studentPdfForms = {}) => {
    if (selectedCoursesTranscript.value.length === 0) {
      message.warning("沒有可匯出的資料");
      return;
    }

    // Columns: 學生姓名, 學號, 入學日期, 系所, Course 1, Course 2...
    const courses = selectedCourses.value.map((id) => {
      const c = allCourses.value.find((course) => course.course_id === id);
      return {
        id,
        name: c ? c.name : id,
        credit: c ? Number(c.credit) || 0 : 0,
      };
    });

    const data = selectedCoursesTranscript.value.map((student) => {
      const form = studentPdfForms[student.student_id] || {};

      const summary = buildTranscriptSummary(student, courses, form);

      const row = {
        學生姓名: student.student_name,
        學號: form.studentId || "",
        入學日期: form.enrollmentDate
          ? dayjs(form.enrollmentDate).format("YYYY.MM")
          : "",
        系所: form.major && form.major !== "-" ? form.major : "",
        年級: form.grade && form.grade !== "-" ? form.grade : "",
        轉入學分:
          form.transferCredits && form.transferCredits !== "-"
            ? form.transferCredits
            : "",
        實習備註:
          form.practiceNote && form.practiceNote !== "-"
            ? form.practiceNote
            : "",
        發佈日期: form.releaseDate
          ? dayjs(form.releaseDate).format("YYYY.MM.DD")
          : "",
        備註: form.remarks && form.remarks !== "-" ? form.remarks : "",
        請假時數:
          form.leaveHours && form.leaveHours !== "-" ? form.leaveHours : "",
        曠課時數:
          form.absentHours && form.absentHours !== "-" ? form.absentHours : "",
        所得總學分: summary.totalCredits,
      };
      // 課程欄位維持既有規則：不過濾未修課，無成績一律顯示 "-"
      summary.courses.forEach((course) => {
        row[course.name] = course.hasScore ? course.score : "-";
      });
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transcript");
    XLSX.writeFile(wb, `Transcript_${dayjs().format("YYYYMMDD_HHmm")}.xlsx`);
  };

  return {
    getAllCourses,
    generateTranscript,
    exportToExcel,

    dateRange,
    selectedCourses,
    selectedCoursesTranscript,
    filteredCourses,
    loading,
  };
};

export default useCreateTranscript;
