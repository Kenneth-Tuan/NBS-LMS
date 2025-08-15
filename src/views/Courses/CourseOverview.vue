<script setup>
import { ref, onMounted, computed, reactive } from "vue";
import { useRouter } from "vue-router";
import {
  Tag as ATag,
  Table as ATable,
  Space as ASpace,
  Button as AButton,
  Divider as ADivider,
  Modal,
  message,
} from "ant-design-vue";
import dayjs from "dayjs";

import { RouterName, UserRole } from "@/enums/appEnums";
import { useUserStore } from "@/stores/user";
import CourseFilterBar from "@/components/CourseFilterBar.vue";
import { courseService } from "@/services/course.service";

const router = useRouter();
const loading = ref(false);
const userStore = useUserStore();
const courseData = ref([]);

const columns = ref([
  {
    title: "課程名稱",
    dataIndex: "name",
    key: "name",
    ellipsis: {
      showTitle: true,
    },
  },
  {
    title: "授課老師名稱",
    dataIndex: "teacher",
    key: "teacher",
    width: 120,
    customRender: ({ text, record }) => {
      return record.teacher || "未指定";
    },
  },
  {
    title: "學分",
    dataIndex: "credit",
    key: "credit",
    width: 80,
    sorter: (a, b) => a.credit - b.credit,
  },
  {
    title: "開課時間",
    dataIndex: "start_date",
    key: "start_date",
    width: 120,
    customRender: ({ text, record }) => {
      return dayjs(record.start_date).format("YYYY-MM-DD");
    },
    sorter: (a, b) =>
      dayjs(a.start_date).valueOf() - dayjs(b.start_date).valueOf(),
  },
  {
    title: "結課時間",
    dataIndex: "end_date",
    key: "end_date",
    width: 120,
    customRender: ({ text, record }) => {
      return dayjs(record.end_date).format("YYYY-MM-DD");
    },
    sorter: (a, b) => dayjs(a.end_date).valueOf() - dayjs(b.end_date).valueOf(),
  },
  {
    title: "上課時間",
    key: "weekly_schedule",
    width: 200,
    customRender: ({ text, record }) => {
      return formatWeeklySchedule(record.weekly_schedule);
    },
  },
  {
    title: "人數",
    key: "enrollment",
    width: 100,
    customRender: ({ text, record }) => {
      return `${String(record.enrolled_count)} / ${record.enrollment_limit}`;
    },
    // sorter: (a, b) =>
    //   a.enrolled_count / a.enrollment_limit -
    //   b.enrolled_count / b.enrollment_limit,
  },
  {
    title: "狀態",
    key: "status",
    width: 100,
  },
  {
    title: "操作",
    key: "actions",
    width: 200,
    fixed: "right",
  },
]);

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

const goToEditCourse = (id) => {
  router.push({ name: RouterName.UpdateCourse, params: { id } });
};

const pageTitle = computed(() => {
  switch (userStore.userProfile?.userRole) {
    case UserRole.Creator:
    case UserRole.Admin:
    case UserRole.Manager:
      return "課程總覽";
    case UserRole.Teacher:
      return "開課記錄";
    case UserRole.Student:
      return "修課記錄";
    default:
      return "課程列表";
  }
});

const filters = reactive({
  keyword: "",
  teacher: "",
});

const teacherOptions = computed(() => {
  const teachers = new Set();
  courseData.value.forEach((course) => {
    if (course.instructor_name) {
      teachers.add(course.instructor_name);
    }
  });
  return Array.from(teachers).sort();
});

const filteredCourseData = computed(() => {
  return courseData.value.filter((course) => {
    const nameMatch = course.name
      ? course.name.toLowerCase().includes(filters.keyword.toLowerCase())
      : true;
    const teacherMatch = filters.teacher
      ? course.instructor_name === filters.teacher
      : true;
    return nameMatch && teacherMatch;
  });
});

const canDeleteCourse = computed(() => {
  return userStore.userProfile?.userRole === UserRole.Creator || userStore.userProfile?.userRole === UserRole.Admin;
});

const deleteCourseHandler = async (course_id) => {
  Modal.confirm({
    title: '確認刪除',
    content: '刪除後將無法恢復，確認刪除？',
    okText: '刪除',
    cancelText: '取消',
    okType: 'danger',
    onOk: async () => {
      try {
        const success = await courseService.deleteCourse(course_id);
        
        if (success) {
          message.success('課程刪除成功');
          // 重新載入課程資料
          courseData.value = await courseService.getCourses();
        } else {
          message.error('課程刪除失敗');
        }
      } catch (error) {
        console.error('刪除課程時發生錯誤:', error);
        message.error('刪除課程時發生錯誤');
      }
    },
    onCancel() {
      // 取消刪除，不做任何動作
    },
  });
};

onMounted(async () => {
  courseData.value = await courseService.getCourses();
  // Initial sort by start_date if needed
  // courseData.value.sort((a, b) => dayjs(a.start_date).valueOf() - dayjs(b.start_date).valueOf());
});
</script>

<template>
  <div class="u-p-4 u-w-full">
    <div class="u-bg-white u-rounded-16px u-p-6 u-shadow-lg">
      <h1 class="u-text-2xl u-font-bold u-mb-4 u-c-gray-700">
        {{ pageTitle }}
      </h1>

      <ADivider class="u-my-4" />

      <CourseFilterBar
        v-model:modelValueKeyword="filters.keyword"
        v-model:modelValueTeacher="filters.teacher"
        :teacher-options="teacherOptions"
      />

      <ATable
        :columns="columns"
        :data-source="filteredCourseData"
        row-key="id"
        :loading="loading"
        :pagination="{ pageSize: 10, hideOnSinglePage: true }"
        bordered
        size="small"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <ATag
              :color="getCourseStatus(record.start_date, record.end_date).color"
            >
              {{ getCourseStatus(record.start_date, record.end_date).text }}
            </ATag>
          </template>
          <template v-else-if="column.key === 'actions'">
            <ASpace>
              <AButton
                v-if="record.view_permission || true"
                type="primary"
                size="small"
                @click="goToCourseManagementHub(record.course_id)"
              >
                詳細内容
              </AButton>
              <AButton
                v-if="record.edit_permission"
                type="default"
                size="small"
                @click="goToEditCourse(record.course_id)"
              >
                編輯
              </AButton>
              <AButton
                v-if="canDeleteCourse"
                danger
                size="small"
                @click="deleteCourseHandler(record.course_id)"
              >
                刪除
              </AButton>
            </ASpace>
          </template>
        </template>
      </ATable>
    </div>
  </div>
</template>

<style scoped></style>
