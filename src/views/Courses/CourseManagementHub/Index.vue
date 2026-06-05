<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import dayjs from "dayjs";
import { storeToRefs } from "pinia";

import { useUserStore } from "@/stores/user";
import { UserRole } from "@/enums/appEnums";
import { courseService } from "@/services/course.service";
import { useApplicationStore } from "@/stores/application";

import Announcements from "./Announcements.vue";
import Assignments from "./Assignments.vue";
import Gradebook from "./Gradebook.vue";
import Materials from "./Materials.vue";
import StudentRoster from "./StudentRoster.vue";
import ApplicationList from "../../Applications/components/ApplicationList.vue";

const route = useRoute();
const { userProfile } = useUserStore();

const applicationStore = useApplicationStore();
const { applicationList } = storeToRefs(applicationStore);
const { getApplicationList, getApplicationDetail } = applicationStore;

const currentCourseId = ref(route.params.id);
const currentCourse = ref(null);
const loading = ref(false);

// --- Role Management ---
const currentUserStudentId = ref(userProfile.value?.id || "s001");
const isTeacherOrCreator = computed(
  () =>
    userProfile.userRole === UserRole.Teacher ||
    userProfile.userRole === UserRole.Creator,
);
const isStudent = computed(() => userProfile.userRole === UserRole.Student);

// --- Shared State ---
const announcements = ref([]);
const assignments = ref([]);
const students = ref([]); // Course student roster
const grades = reactive({}); // { studentId: { assignmentId: score } } - Teacher's gradebook data
const currentUserSubmissions = ref([]); // [{ assignmentId, status, fileName, grade }]

// --- Event Handlers ---
const handleAnnouncementsUpdate = (newAnnouncements) => {
  announcements.value = newAnnouncements;
};

const handleAssignmentsUpdate = (updates) => {
  if (updates.assignments !== undefined)
    assignments.value = updates.assignments;
  if (updates.grades !== undefined) Object.assign(grades, updates.grades);
  if (updates.currentUserSubmissions !== undefined) {
    currentUserSubmissions.value = updates.currentUserSubmissions;
  }
};

const handleMaterialsUpdate = () => {
  fetchCourseData();
};

const handleGradesUpdate = (newGrades) => {
  Object.assign(grades, newGrades);
  // Update currentUserSubmissions if student's own grade changed
  if (isStudent.value && currentUserStudentId.value) {
    const studentGrades = newGrades[currentUserStudentId.value];
    if (studentGrades) {
      Object.entries(studentGrades).forEach(([assignmentId, grade]) => {
        const submission = currentUserSubmissions.value.find(
          (s) => s.assignmentId === assignmentId,
        );
        if (submission) {
          submission.grade = grade;
          submission.status = grade !== null ? "GRADED" : submission.status;
        }
      });
    }
  }
};

async function fetchCourseData() {
  // After local dummy data is loaded, try to fetch real course data from API
  try {
    const apiCourse = await courseService.getCourse(currentCourseId.value);
    currentCourse.value = apiCourse;
  } catch (err) {
    // Keep silent failure – fall back to dummy data
    console.error(
      "[CourseManagementHub] Failed to fetch course data from API:",
      err,
    );
  }
}

const specifiedPendingApplications = ref([]);

const getApplicationListWithDetail = async () => {
  try {
    await getApplicationList();
    const getPendingLeaveApplications = applicationList.value.filter(
      (app) => app.status === "Pending" && app.type === "leave",
    );

    specifiedPendingApplications.value = await Promise.all(
      getPendingLeaveApplications.map(async (app) => {
        const appDetail = await getApplicationDetail(
          app.application_id,
          app.type,
        );
        return { ...app, ...appDetail };
      }),
    );
  } catch (error) {
    console.log(error);
  }
};

const filteredApplications = computed(() => {
  return specifiedPendingApplications.value.filter(
    (app) => app.info.course_id === currentCourseId.value,
  );
});

const hasPendingApplications = computed(() => {
  return filteredApplications.value.length > 0;
});

// --- Lifecycle Hooks ---
onMounted(async () => {
  try {
    loading.value = true;
    await getApplicationListWithDetail();
    await fetchCourseData();
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="u-w-full u-bg-white u-rounded-16px u-p-6 u-shadow-lg">
    <a-spin :spinning="loading">
      <div v-if="currentCourse">
        <h1 class="u-text-2xl u-font-bold u-mb-1 u-c-blue">課程管理中心</h1>

        <ADivider class="u-my16px" />

        <h2 class="u-text-xl u-font-semibold u-mb-4 u-c-secondary-500">
          課程名稱： {{ currentCourse.title }}
          <template v-if="currentCourse.code">
            &nbsp;[{{ currentCourse.code }}]
          </template>
        </h2>

        <p class="u-text-gray-600 u-mb-6">
          課程描述： {{ currentCourse.description || "-" }}
        </p>

        <p class="u-text-gray-600 u-mb-6">
          課程時間：
          {{ dayjs(currentCourse.startDate).format("YYYY-MM-DD") }} ~
          {{ dayjs(currentCourse.endDate).format("YYYY-MM-DD") }}
        </p>

        <p class="u-text-gray-600 u-mb-6">
          授課老師：
          {{ currentCourse.teacher_name }}
        </p>

        <p class="u-text-gray-600 u-mb-6">
          授課模式：
          {{ currentCourse.classMode }}
        </p>

        <p class="u-text-gray-600 u-mb-6"></p>

        <a-tabs type="card">
          <!-- Application Tab -->
          <a-tab-pane key="application" tab="請假申請">
            <application-list
              :data="filteredApplications"
              @afterReview="getApplicationListWithDetail"
            />
          </a-tab-pane>

          <!-- Announcements Tab -->
          <a-tab-pane key="announcements" tab="公告/消息">
            <Announcements
              :course-id="currentCourseId"
              :announcements="announcements"
              :is-teacher-or-creator="isTeacherOrCreator"
              @update:announcements="handleAnnouncementsUpdate"
            />
          </a-tab-pane>

          <!-- Assignments Tab -->
          <a-tab-pane key="assignments" tab="作業管理">
            <Assignments
              :current-course-id="currentCourseId"
              :is-teacher-or-creator="isTeacherOrCreator"
              :is-student="isStudent"
              :current-user-student-id="currentUserStudentId"
              :assignments="assignments"
              :students="students"
              :grades="grades"
              :current-user-submissions="currentUserSubmissions"
              @update="handleAssignmentsUpdate"
            />
          </a-tab-pane>

          <!-- Gradebook Tab -->
          <a-tab-pane key="gradebook" tab="成績簿">
            <Gradebook />
          </a-tab-pane>

          <!-- Course Materials Tab -->
          <a-tab-pane key="materials" tab="課程教材/內容">
            <Materials
              :course-id="currentCourseId"
              :materials="currentCourse.outlineFile"
              :current-course="currentCourse"
              :is-teacher-or-creator="isTeacherOrCreator"
              @update="handleMaterialsUpdate"
            />
          </a-tab-pane>

          <!-- Student Roster Tab -->
          <a-tab-pane key="roster" tab="學生名單">
            <StudentRoster
              :is-student="isStudent"
              :course-info="currentCourse"
            />
          </a-tab-pane>
        </a-tabs>
      </div>
      <div v-else-if="!loading && !currentCourse">
        <a-empty description="找不到指定的課程資料，或課程ID無效。" />
      </div>
    </a-spin>
  </div>
</template>
