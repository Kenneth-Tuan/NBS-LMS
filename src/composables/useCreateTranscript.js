import { ref, computed } from "vue";
import dayjs from "dayjs";
import * as XLSX from "xlsx";
import { message } from "ant-design-vue";

import courseApi from "../apis/course";
import scoreApi from "../apis/score";

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

  const exportToExcel = () => {
    if (selectedCoursesTranscript.value.length === 0) {
      message.warning("沒有可匯出的資料");
      return;
    }

    // Prepare data for Excel
    // Columns: Student Name, Course 1, Course 2...
    const courses = selectedCourses.value.map((id) => {
      const c = allCourses.value.find((course) => course.course_id === id);
      return { id, name: c ? c.name : id };
    });

    const data = selectedCoursesTranscript.value.map((student) => {
      const row = {
        學生姓名: student.student_name,
      };
      courses.forEach((course) => {
        const score = student[course.id];
        row[course.name] =
          score !== undefined && score !== null && score > 0 ? score : "-";
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
