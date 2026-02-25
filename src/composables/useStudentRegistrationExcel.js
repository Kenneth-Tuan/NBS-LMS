import { ref } from "vue";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import * as xlsx from "xlsx";
import courseApi from "@/apis/course";

dayjs.extend(isBetween);

/**
 * 產生學員註冊表 Excel 的 composable
 * @param {import('vue').Ref<number>} creditFee - 系統當前的學分費用，用於計算學費
 * @returns {Object} 包含綁定資料與方法的物件：
 *   - dateRange: ref(Array)，用來綁定 DatePicker 選擇區間
 *   - loading: ref(boolean)，載入狀態
 *   - generateExcel: async function，觸發產生 Excel 的函式
 */
export function useStudentRegistrationExcel(creditFee) {
  const currentYear = dayjs().year();

  // 若今天在 7/1 前，預設範圍會是「去年 7/1 ～ 今年 6/30」
  // 若在 7/1 之後（含），則為「今年 7/1 ～ 明年 6/30」
  const isAfterJulyFirst = dayjs().isAfter(
    dayjs(`${currentYear}-07-01`).subtract(1, "day"),
  );

  const defaultStartDate = isAfterJulyFirst
    ? dayjs(`${currentYear}-07-01`)
    : dayjs(`${currentYear - 1}-07-01`);
  const defaultEndDate = isAfterJulyFirst
    ? dayjs(`${currentYear + 1}-06-30`)
    : dayjs(`${currentYear}-06-30`);

  const dateRange = ref([defaultStartDate, defaultEndDate]);
  const loading = ref(false);

  /**
   * 搜尋該日期區間下的課程並撈取其中的所有學生
   * 結算個別修了哪些課、總學分，並配上傳入的學分費產生 Excel
   */
  const generateExcel = async () => {
    if (!dateRange.value || dateRange.value.length !== 2) return;

    loading.value = true;
    try {
      // 1. 取得所有課程
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

      const response = await courseApi.getCourses(params);
      const allCourses = response.data?.data?.courses || [];

      // 設定搜尋的精確範圍（包含當日起末）
      const startDate = dayjs(dateRange.value[0]).startOf("day");
      const endDate = dayjs(dateRange.value[1]).endOf("day");

      // 2. 篩選符合日期區間的課程
      const filteredCourses = allCourses.filter((course) => {
        const courseStart = dayjs(course.start_date);
        return courseStart.isBetween(startDate, endDate, null, "[]");
      });

      if (filteredCourses.length === 0) {
        alert("該區間無課程");
        return;
      }

      const studentEnrollments = {};

      // 3. 取得每堂篩選出來課程的學生清單
      for (const course of filteredCourses) {
        const res = await courseApi.getStudentList(course.course_id);
        const students = res.data?.data?.students || [];

        for (const student of students) {
          if (!studentEnrollments[student.email]) {
            studentEnrollments[student.email] = {
              name: student.name,
              email: student.email,
              courses: new Set(),
              credit: 0,
            };
          }
          studentEnrollments[student.email].courses.add(course.course_id);
          studentEnrollments[student.email].credit += course.credit || 0;
        }
      }

      const studentList = Object.values(studentEnrollments);

      // 4. 定義 Excel 的表頭列 (Headers)
      const headers = [
        "課程名稱",
        ...studentList.map((s) => `${s.name} (${s.email})`),
      ];

      const rows = [];
      // 5. 逐一加入各個課程修課狀況至列 (Rows)
      for (const course of filteredCourses) {
        const row = [`${course.name} (${course.credit} 學分)`];
        for (const student of studentList) {
          row.push(student.courses.has(course.course_id) ? "V" : "");
        }
        rows.push(row);
      }

      // 6. 加入倒數第二列：計算每位學生的總學分
      const totalCreditRow = ["總學分"];
      for (const student of studentList) {
        totalCreditRow.push(student.credit);
      }
      rows.push(totalCreditRow);

      // 7. 加入最後一列：配上 creditFee 計算每位同學的總學費
      const totalFeeRow = ["總學費"];
      for (const student of studentList) {
        // 解除響應式傳入的 value 或者直接使用若本身就是數字
        const currentFee = creditFee.value || 0;
        totalFeeRow.push(student.credit * currentFee);
      }
      rows.push(totalFeeRow);

      // 8. 產出 Excel 並自動下載
      const wsData = [headers, ...rows];
      const ws = xlsx.utils.aoa_to_sheet(wsData);
      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, ws, "學生註冊表");

      xlsx.writeFile(
        wb,
        `學生註冊表_${startDate.format("YYYYMMDD")}_${endDate.format(
          "YYYYMMDD",
        )}.xlsx`,
      );
    } catch (error) {
      console.error(error);
      alert("生成報表時發生錯誤");
    } finally {
      loading.value = false;
    }
  };

  return {
    dateRange,
    loading,
    generateExcel,
  };
}
