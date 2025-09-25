<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useRoute } from "vue-router";

import { useUserStore } from "@/stores/user";
import { UserRole } from "@/enums/appEnums";
import { courseService } from "@/services/course.service";

import Announcements from "./Announcements.vue";
import Assignments from "./Assignments.vue";
import Gradebook from "./Gradebook.vue";
import Materials from "./Materials.vue";
import StudentRoster from "./StudentRoster.vue";

const route = useRoute();
const { userProfile } = useUserStore();

const currentCourseId = ref(route.params.id);
const currentCourse = ref(null);
const loading = ref(false);

// --- Role Management ---
const currentUserStudentId = ref(userProfile.value?.id || "s001");
const isTeacherOrCreator = computed(
  () =>
    userProfile.userRole === UserRole.Teacher ||
    userProfile.userRole === UserRole.Creator
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
          (s) => s.assignmentId === assignmentId
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
      err
    );
  }
}

// --- Lifecycle Hooks ---
onMounted(async () => {
  await fetchCourseData();
});
</script>

<template>
  <div class="u-p-4 u-w-full">
    <div class="u-bg-white u-rounded-16px u-p-6 u-shadow-lg">
      <a-spin :spinning="loading">
        <div v-if="currentCourse">
          <h1 class="u-text-2xl u-font-bold u-mb-1 u-c-gray-700">
            課程管理中心
          </h1>
          <h2 class="u-text-xl u-font-semibold u-mb-4 u-c-blue-600">
            {{ currentCourse.title }}
          </h2>
          <p class="u-text-gray-600 u-mb-6">
            {{ currentCourse.description || "-" }}
          </p>

          <a-tabs default-active-key="announcements" type="card">
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
              <StudentRoster :course-info="currentCourse" />
            </a-tab-pane>
          </a-tabs>
        </div>
        <div v-else-if="!loading && !currentCourse">
          <a-empty description="找不到指定的課程資料，或課程ID無效。" />
        </div>
      </a-spin>
    </div>
  </div>
</template>
