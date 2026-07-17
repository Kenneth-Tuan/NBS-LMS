<script setup>
import { onMounted, ref, computed } from "vue";
import {
  Table as ATable,
  RangePicker as ARangePicker,
  Button as AButton,
  Divider as ADivider,
  Tag as ATag,
  Spin as ASpin,
} from "ant-design-vue";
import dayjs from "dayjs";

import useCreateTranscript from "@/composables/useCreateTranscript";

import {
  Form as AForm,
  FormItem as AFormItem,
  Input as AInput,
  Select as ASelect,
  SelectOption as ASelectOption,
  DatePicker as ADatePicker,
  message,
} from "ant-design-vue";
import { useTranscriptPdf } from "@/composables/useTranscriptPdf";
import { userService } from "@/services/user.service";
import { DEPARTMENTS_LABEL_MAP } from "@/constant/common.constant";
import { UserRole } from "../../enums/appEnums";

const {
  getAllCourses,
  generateTranscript,
  exportToExcel,
  dateRange,
  selectedCourses,
  selectedCoursesTranscript,
  filteredCourses,
  loading,
} = useCreateTranscript();

// Course Selection Table Configuration
const courseColumns = [
  {
    title: "課程名稱",
    dataIndex: "name",
    key: "name",
    width: 200,
  },
  {
    title: "授課老師",
    dataIndex: "teacher",
    key: "teacher",
    width: 120,
    customRender: ({ text, record }) =>
      record.instructor_name || record.teacher || "未指定",
  },
  {
    title: "開課日期",
    dataIndex: "start_date",
    key: "start_date",
    width: 120,
    customRender: ({ text }) => (text ? dayjs(text).format("YYYY-MM-DD") : "-"),
  },
  {
    title: "結束日期",
    dataIndex: "end_date",
    key: "end_date",
    width: 120,
    customRender: ({ text }) => (text ? dayjs(text).format("YYYY-MM-DD") : "-"),
  },
];

const rowSelection = computed(() => ({
  selectedRowKeys: selectedCourses.value,
  onChange: (selectedRowKeys) => {
    selectedCourses.value = selectedRowKeys;
  },
}));

// Transcript Table Configuration
const transcriptColumns = computed(() => {
  const baseColumns = [
    {
      title: "學生姓名",
      dataIndex: "student_name",
      key: "student_name",
      width: 150,
      fixed: "left",
    },
  ];

  // Dynamic columns based on selected courses that end up in the transcript
  // We can use selectedCourses to look up names
  // But strictly, we should look at what keys are in selectedCoursesTranscript or use selectedCourses ref map

  if (selectedCourses.value.length === 0) return baseColumns;

  // Map selected course IDs to columns
  const courseCols = selectedCourses.value.map((courseId) => {
    // Find course name from filteredCourses (which is a subset of allCourses usually, but better to rely on what we have)
    // Actually useCreateTranscript should probably expose allCourses if we need robust lookup,
    // but filteredCourses contains what we can select.
    // Let's try to find in filteredCourses.
    const course = filteredCourses.value.find((c) => c.course_id === courseId);
    const courseName = course ? course.name : "未知課程";

    return {
      title: courseName,
      dataIndex: courseId,
      key: courseId,
      width: 150,
      customRender: ({ text, record }) => {
        // Check if student enrolled in this course
        if (record.course_status && record.course_status[courseId] === false) {
          return "未修課";
        }

        // text is the score.
        // Display requirement: "如果學生沒有修這門課或是總分不是大於0的話就顯示 N/A" -> now handled by above + below.
        if (record.course_status[courseId] === true && record[courseId] <= 0) {
          return "-";
        }
        return text;
      },
    };
  });

  return [...baseColumns, ...courseCols];
});

const { previewPdf } = useTranscriptPdf();

// --- Pre-fetch all active students on mount ---
const allStudents = ref([]);

const fetchAllStudents = async () => {
  const filter = { role: UserRole.Student, status: "active" };
  const pageSize = 30;
  try {
    const initialRes = await userService.getUserList(
      { currentPage: 1, pageSize },
      filter,
    );
    const firstPage = initialRes.data?.data?.users ?? [];
    const totalPage = initialRes.data?.total_page ?? 1;

    if (totalPage <= 1) {
      allStudents.value = firstPage;
      return;
    }

    const restPages = Array.from({ length: totalPage - 1 }, (_, i) =>
      userService.getUserList({ currentPage: i + 2, pageSize }, filter),
    );
    const responses = await Promise.all(restPages);
    allStudents.value = [
      ...firstPage,
      ...responses.flatMap((res) => res.data?.data?.users ?? []),
    ];
  } catch (e) {
    console.error("Fetch all students failed", e);
  }
};

onMounted(() => {
  getAllCourses().then(() => {
    selectedCourses.value = filteredCourses.value.map((c) => c.course_id);
  });
  fetchAllStudents();
});

// --- Page-level shared academic year / semester ---
const currentYear = dayjs().year();
const academicYears = Array.from({ length: 22 }, (_, i) => currentYear + 1 - i);
const sharedYear = ref(currentYear);
const sharedSemester = ref(1);

// --- Per-student PDF form state ---
const studentPdfForms = ref({}); // { [studentId]: formState & { major } }
const pdfLoadingMap = ref({});   // { [studentId]: boolean }

const createDefaultPdfForm = () => ({
  studentId: "",
  enrollmentDate: null,
  grade: "",
  releaseDate: dayjs(),
  transferCredits: "0",
  practiceNote: "免實習",
  remarks: "",
  leaveHours: "0",
  absentHours: "0",
  major: "-",
});

const initAllStudentPdfForms = (rows) => {
  studentPdfForms.value = {};

  rows.forEach((record) => {
    const form = createDefaultPdfForm();
    const user = allStudents.value.find((u) => u.id === record.student_id);

    if (user) {
      if (user.student_id) form.studentId = user.student_id;
      if (user.admission_time) form.enrollmentDate = dayjs(user.admission_time);
      if (user.departments && user.departments.length > 0) {
        form.major =
          DEPARTMENTS_LABEL_MAP[user.departments[0]] || user.departments[0];
      }
    }

    studentPdfForms.value[record.student_id] = form;
  });
};

const handleGenerateTranscript = async () => {
  await generateTranscript();
  if (selectedCoursesTranscript.value.length > 0) {
    initAllStudentPdfForms(selectedCoursesTranscript.value);
  }
};

const handlePreviewPdf = async (record) => {
  const form = studentPdfForms.value[record.student_id];
  if (!form) {
    message.warning("請先生成成績單");
    return;
  }

  pdfLoadingMap.value[record.student_id] = true;

  try {
    const { enrollmentDate, releaseDate } = form;
    const year = sharedYear.value;
    const semester = sharedSemester.value;
    const semesterStr = semester === 1 ? "第一學期" : "第二學期";
    const semesterEng = semester === 1 ? "First Semester" : "Second Semester";
    const title = `${year}學年度${semesterStr}成績單`;
    const semesterLabel = `${year}學年度${semesterStr} ${semesterEng}`;

    const courses = [];
    let calculatedTotalCredits = 0;

    selectedCourses.value.forEach((courseId) => {
      const courseDef = filteredCourses.value.find(
        (c) => c.course_id === courseId,
      );
      const score = record[courseId];

      if (record.course_status && record.course_status[courseId] === false) {
        return;
      }

      if (courseDef) {
        if (score > 0) {
          calculatedTotalCredits += Number(courseDef.credit) || 0;
        }
        courses.push({
          name: courseDef.name,
          credits: String(courseDef.credit || 0),
          score: score && score > 0 ? String(score) : "---",
          note: "",
        });
      }
    });

    const pdfData = {
      title,
      studentName: record.student_name,
      studentId: form.studentId,
      major: form.major,
      enrollmentDate: enrollmentDate
        ? dayjs(enrollmentDate).format("YYYY.MM")
        : "",
      grade: form.grade,
      releaseDate: releaseDate ? dayjs(releaseDate).format("YYYY.MM.DD") : "",
      transferCredits: form.transferCredits,
      totalCredits: String(calculatedTotalCredits),
      semesterLabel,
      practiceNote: form.practiceNote,
      remarks: form.remarks,
      leaveHours: form.leaveHours,
      absentHours: form.absentHours,
      courses,
    };

    await previewPdf(pdfData);
    message.success("成績單已生成");
  } catch (err) {
    console.error(err);
    message.error("產生失敗");
  } finally {
    pdfLoadingMap.value[record.student_id] = false;
  }
};

const extendedTranscriptColumns = computed(() => {
  const cols = transcriptColumns.value;
  return [
    ...cols,
    {
      title: "操作",
      key: "action",
      fixed: "right",
      width: 120,
    },
  ];
});
</script>

<template>
  <div
    class="u-w-full u-bg-white u-rounded-16px u-p-6 u-shadow-lg u-overflow-x-hidden"
  >
    <h1 class="u-text-2xl u-font-bold u-mb-4 u-c-gray-700">成績單生成</h1>

    <ADivider class="u-my-4" />

    <!-- Date Filter -->
    <div class="u-mb-4 u-flex u-items-center u-gap-4">
      <span class="u-font-medium u-text-gray-700">選擇日期範圍：</span>
      <ARangePicker v-model:value="dateRange" />
      <span class="u-text-sm u-text-gray-500"
        >（選擇完日期後，下方將顯示符合時間範圍內的課程）</span
      >
    </div>

    <!-- Shared Academic Year / Semester -->
    <div class="u-mb-4 u-flex u-items-center u-gap-4">
      <span class="u-font-medium u-text-gray-700">學年度：</span>
      <ASelect v-model:value="sharedYear" class="u-w-32">
        <ASelectOption v-for="y in academicYears" :key="y" :value="y">{{
          y
        }}</ASelectOption>
      </ASelect>
      <span class="u-font-medium u-text-gray-700">學期：</span>
      <ASelect v-model:value="sharedSemester" class="u-w-36">
        <ASelectOption :value="1">第一學期</ASelectOption>
        <ASelectOption :value="2">第二學期</ASelectOption>
      </ASelect>
      <span class="u-text-sm u-text-gray-500"
        >（套用至本頁所有成績單預覽）</span
      >
    </div>

    <!-- Course List -->
    <div class="u-mb-6 u-w-full">
      <h2 class="u-text-lg u-font-bold u-mb-2 u-c-gray-700">課程列表</h2>

      <div
        v-if="!dateRange || dateRange.length === 0"
        class="u-text-center u-p-8 u-bg-gray-50 u-rounded-xl u-border-dashed u-border-2 u-border-gray-200 u-w-full"
      >
        <div class="u-text-lg u-font-medium u-c-gray-600 u-mb-2">
          尚未選擇日期範圍
        </div>
        <p class="u-text-sm u-c-gray-500">
          請先於上方選擇學期或課程的時間範圍，系統將自動列出符合條件的課程。
        </p>
      </div>

      <ATable
        v-else
        :columns="courseColumns"
        :data-source="filteredCourses"
        :row-selection="rowSelection"
        row-key="course_id"
        :pagination="{ pageSize: 1000, hideOnSinglePage: true }"
        :scroll="{ y: 400 }"
        size="small"
        bordered
      />
    </div>

    <!-- Actions -->
    <div class="u-flex u-justify-center u-mb-6">
      <AButton
        type="primary"
        size="large"
        @click="handleGenerateTranscript"
        :loading="loading"
      >
        生成成績單
      </AButton>
    </div>

    <!-- Transcript Result -->
    <div v-if="selectedCoursesTranscript.length > 0" class="u-mb-6 u-w-full">
      <div class="u-flex u-justify-between u-items-center u-mb-2">
        <h2 class="u-text-lg u-font-bold u-c-gray-700">成績單預覽</h2>
        <AButton
          type="primary"
          ghost
          @click="exportToExcel(studentPdfForms)"
        >
          匯出 Excel
        </AButton>
      </div>

      <!-- Wrapper to constrain table width -->

      <ATable
        :columns="extendedTranscriptColumns"
        :data-source="selectedCoursesTranscript"
        row-key="student_id"
        bordered
        :pagination="false"
        :scroll="{ x: 'max-content' }"
        class="u-max-w-full"
      >
        <template #expandedRowRender="{ record }">
          <div
            v-if="studentPdfForms[record.student_id]"
            class="u-p-4 u-bg-gray-50 u-rounded-lg"
          >
            <AForm layout="vertical">
              <div class="u-grid u-grid-cols-3 u-gap-4">
                <AFormItem label="學生姓名">
                  <AInput :value="record.student_name" disabled />
                </AFormItem>
                <AFormItem label="學號">
                  <AInput
                    v-model:value="studentPdfForms[record.student_id].studentId"
                    placeholder="請輸入學號"
                  />
                </AFormItem>
                <AFormItem label="系所">
                  <AInput
                    :value="studentPdfForms[record.student_id].major"
                    disabled
                  />
                </AFormItem>
              </div>

              <div class="u-grid u-grid-cols-2 u-gap-4">
                <AFormItem label="入學日期">
                  <ADatePicker
                    v-model:value="
                      studentPdfForms[record.student_id].enrollmentDate
                    "
                    picker="month"
                    format="YYYY.MM"
                    class="u-w-full"
                  />
                </AFormItem>
                <AFormItem label="發佈日期">
                  <ADatePicker
                    v-model:value="
                      studentPdfForms[record.student_id].releaseDate
                    "
                    format="YYYY.MM.DD"
                    class="u-w-full"
                  />
                </AFormItem>
              </div>

              <div class="u-grid u-grid-cols-2 u-gap-4">
                <AFormItem label="年級">
                  <AInput
                    v-model:value="studentPdfForms[record.student_id].grade"
                  />
                </AFormItem>
                <AFormItem label="轉入學分">
                  <AInput
                    v-model:value="
                      studentPdfForms[record.student_id].transferCredits
                    "
                  />
                </AFormItem>
              </div>

              <AFormItem label="實習備註">
                <AInput
                  v-model:value="
                    studentPdfForms[record.student_id].practiceNote
                  "
                />
              </AFormItem>
              <AFormItem label="備註">
                <AInput
                  v-model:value="studentPdfForms[record.student_id].remarks"
                />
              </AFormItem>

              <div class="u-grid u-grid-cols-2 u-gap-4">
                <AFormItem label="請假時數">
                  <AInput
                    v-model:value="
                      studentPdfForms[record.student_id].leaveHours
                    "
                  />
                </AFormItem>
                <AFormItem label="曠課時數">
                  <AInput
                    v-model:value="
                      studentPdfForms[record.student_id].absentHours
                    "
                  />
                </AFormItem>
              </div>
            </AForm>
          </div>
          <div v-else class="u-flex u-justify-center u-p-4">
            <ASpin />
          </div>
        </template>

        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <AButton
              type="primary"
              size="small"
              :loading="pdfLoadingMap[record.student_id]"
              :disabled="!studentPdfForms[record.student_id]"
              @click="handlePreviewPdf(record)"
            >
              預覽
            </AButton>
          </template>
        </template>
      </ATable>
    </div>
  </div>
</template>

<style scoped>
/* Reuse styles or add specific overrides if needed */
</style>
