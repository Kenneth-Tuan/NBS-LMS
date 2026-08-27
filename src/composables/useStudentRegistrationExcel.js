import { ref } from "vue";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import * as xlsx from "xlsx";
import courseApi from "@/apis/course";
import { userService } from "@/services/user.service";
import { UserRole, UserStatus } from "@/enums/appEnums";
import { DEPARTMENTS_LABEL_MAP } from "@/constant/common.constant";

dayjs.extend(isBetween);

/**
 * 將科別代碼陣列轉成中文標籤，多科以「、」分隔；查無則回傳 "-"
 * @param {string[]|undefined} departments
 * @returns {string}
 */
const formatDepartments = (departments) => {
  if (!departments || departments.length === 0) return "-";
  return departments
    .map((dep) => DEPARTMENTS_LABEL_MAP[dep] || dep)
    .join("、");
};

/**
 * 分頁撈取全部在學學生，建立 email -> departments 對照
 * @returns {Promise<Record<string, string[]>>}
 */
const fetchStudentDepartmentsByEmail = async () => {
  const filter = {
    role: UserRole.Student,
    status: UserStatus.Active,
  };
  const pageSize = 30;

  const initialResponse = await userService.getUserList(
    { currentPage: 1, pageSize },
    filter,
  );

  const users = [...(initialResponse.data?.data?.users || [])];
  const totalPage = initialResponse.data?.total_page || 1;

  if (totalPage > 1) {
    const promises = [];
    for (let i = 2; i <= totalPage; i++) {
      promises.push(
        userService.getUserList({ currentPage: i, pageSize }, filter),
      );
    }
    const responses = await Promise.all(promises);
    responses.forEach((res) => {
      users.push(...(res.data?.data?.users || []));
    });
  }

  const emailToDepartments = {};
  for (const user of users) {
    if (user.email) {
      emailToDepartments[user.email] = user.departments || [];
    }
  }
  return emailToDepartments;
};

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
              departments: [],
            };
          }
          studentEnrollments[student.email].courses.add(course.course_id);
          studentEnrollments[student.email].credit += course.credit || 0;
        }
      }

      // 4. 用 user list 補科別（email lookup）
      const emailToDepartments = await fetchStudentDepartmentsByEmail();
      for (const student of Object.values(studentEnrollments)) {
        student.departments = emailToDepartments[student.email] || [];
      }

      // 5. 依姓名排序後產出直式五欄
      const studentList = Object.values(studentEnrollments).sort((a, b) =>
        (a.name || "").localeCompare(b.name || "", "zh-Hant"),
      );

      const currentFee = creditFee.value || 0;
      const headers = ["姓名", "科別", "所選課", "總學分", "總學費"];
      const rows = studentList.map((s) => [
        s.name,
        formatDepartments(s.departments),
        filteredCourses
          .filter((c) => s.courses.has(c.course_id))
          .map((c) => c.name)
          .join("、"),
        s.credit,
        s.credit * currentFee,
      ]);

      // 6. 產出 Excel 並自動下載
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
