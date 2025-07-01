<script setup>
import { ref, onMounted, computed, reactive, unref } from "vue";
import { useRouter } from "vue-router";
import {
  Tag as ATag,
  Table as ATable,
  Space as ASpace,
  Button as AButton,
  Divider as ADivider,
  Alert as AAlert,
  Empty as AEmpty,
} from "ant-design-vue";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

import { RouterName } from "@/enums/appEnums";
import { useUserStore } from "@/stores/user";
import { UserRole } from "@/enums/appEnums";
import CourseFilterBar from "@/components/CourseFilterBar.vue";
import { courseService } from "@/services/course.service";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const router = useRouter();
const userStore = useUserStore();
const loading = ref(false);
const allCourses = ref([]); // Will be populated from dummyCourseData

const currentUser = computed(() => userStore.userProfile);
const isTeacher = computed(
  () => currentUser.value?.userRole === UserRole.Teacher
);
const isStudent = computed(
  () => currentUser.value?.userRole === UserRole.Student
);

const canViewPage = computed(() => isTeacher.value || isStudent.value);

const filteredColumns = computed(() => {
  return [
    {
      title: "課程名稱",
      dataIndex: "course_name",
      key: "course_name",
      ellipsis: true,
      visible: true,
    },
    {
      title: "授課老師名稱",
      dataIndex: "teacher_name",
      key: "teacher_name",
      width: 150,
      visible: unref(isStudent),
    },
    {
      title: "學分",
      dataIndex: "credit",
      key: "credit",
      width: 80,
      sorter: (a, b) => a.credit - b.credit,
      visible: true,
    },
    {
      title: "開課時間",
      dataIndex: "start_date",
      key: "start_date",
      width: 120,
      sorter: (a, b) =>
        dayjs(a.start_date).valueOf() - dayjs(b.start_date).valueOf(),
      visible: false,
    },
    {
      title: "結課時間",
      dataIndex: "end_date",
      key: "end_date",
      width: 120,
      sorter: (a, b) =>
        dayjs(a.end_date).valueOf() - dayjs(b.end_date).valueOf(),
      visible: false,
    },
    {
      title: "上課時間",
      key: "weekly_schedule",
      width: 200,
      customRender: ({ text, record }) => {
        return formatWeeklySchedule(record.weekly_schedule);
      },
      visible: true,
    },
    {
      title: "人數",
      key: "enrollment",
      width: 100,
      customRender: ({ text, record }) => {
        return `${String(record.enrollment_count)} / ${
          record.enrollment_limit
        }`;
      },
      visible: true,
    },
    {
      title: "狀態",
      key: "status",
      width: 100,
      visible: false,
    },
    {
      title: "操作",
      key: "actions",
      width: 200,
      fixed: "right",
      visible: true,
    },
  ].filter((column) => {
    if (column.visible) return true;
    return false;
  });
});

const getCourseStatus = (startDate, endDate) => {
  const now = dayjs();
  const start = dayjs(startDate, "YYYY-MM-DD");
  const end = dayjs(endDate, "YYYY-MM-DD");

  if (!start.isValid() || !end.isValid()) {
    return { text: "日期無效", color: "red" };
  }

  if (now.isBefore(start)) {
    return { text: "尚未開課", color: "cyan" };
  } else if (now.isAfter(end)) {
    return { text: "已結業", color: "blue" };
  } else {
    return { text: "正在進行", color: "green" };
  }
};

const formatWeeklySchedule = (schedule) => {
  if (!schedule || schedule.length === 0) {
    return "未定";
  }
  return schedule
    .map((s) => `${s.week_day} ${s.start_time}-${s.end_time}`)
    .join(", ");
};

const goToCourseManagementHub = (id) => {
  router.push({ name: RouterName.CourseManagementHub, params: { id: id } });
};

const filters = reactive({
  keyword: "",
  teacher: "",
});

const teacherOptions = computed(() => {
  const teachers = new Set();
  allCourses.value.forEach((course) => {
    if (course.teacher_name) {
      teachers.add(course.teacher_name);
    }
  });
  return Array.from(teachers).sort();
});

const handleReset = () => {
  filters.keyword = "";
  filters.teacher = "";
};

const isCourseActive = (course) => {
  const now = dayjs();
  const start = dayjs(course.start_date, "YYYY-MM-DD");
  const end = dayjs(course.end_date, "YYYY-MM-DD");
  return (
    start.isValid() &&
    end.isValid() &&
    now.isSameOrAfter(start, "day") &&
    now.isSameOrBefore(end, "day")
  );
};

const filteredCourses = computed(() => {
  return allCourses.value;
});

onMounted(async () => {
  if (!canViewPage.value) return;

  try {
    loading.value = true;
    const courses = await courseService.getCurrentTermCourses(
      currentUser.value.userRole
    );
    allCourses.value = courses;
    loading.value = false;
  } catch (error) {
    console.error(error);
    loading.value = false;
  }
});
</script>

<template>
  <div class="u-p-4 u-w-full">
    <div v-if="canViewPage" class="u-bg-white u-rounded-16px u-p-6 u-shadow-lg">
      <h1 class="u-text-2xl u-font-bold u-mb-4 u-c-gray-700">本期課程</h1>

      <ADivider class="u-my-4" />

      <CourseFilterBar
        v-model:modelValueKeyword="filters.keyword"
        v-model:modelValueTeacher="filters.teacher"
        :teacher-options="teacherOptions"
      />

      <ATable
        :columns="filteredColumns"
        :data-source="filteredCourses"
        row-key="id"
        :loading="loading"
        :pagination="{ pageSize: 10, hideOnSinglePage: true }"
        bordered
        size="small"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'actions'">
            <ASpace>
              <AButton
                type="primary"
                size="small"
                @click="goToCourseManagementHub(record.course_id)"
              >
                詳細内容
              </AButton>
            </ASpace>
          </template>
          <!-- <template v-else-if="column.key === 'start_date'">
            {{ dayjs(record.start_date).format("YYYY-MM-DD") }}
          </template>
          <template v-else-if="column.key === 'end_date'">
            {{ dayjs(record.end_date).format("YYYY-MM-DD") }}
          </template> -->
          <!-- <template v-else-if="column.key === 'status'">
            <ATag
              :color="getCourseStatus(record.start_date, record.end_date).color"
            >
              {{ getCourseStatus(record.start_date, record.end_date).text }}
            </ATag>
          </template> -->
        </template>
        <template #emptyText>
          <AEmpty description="沒有符合條件的本期課程。" />
        </template>
      </ATable>
    </div>
    <div v-else class="u-p-4">
      <AAlert
        message="權限不足"
        description="您沒有權限查看此頁面。此功能僅供教師、學生及系統建立者使用。"
        type="warning"
        show-icon
      />
    </div>
  </div>
</template>
