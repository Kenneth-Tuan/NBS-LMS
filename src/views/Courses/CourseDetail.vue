<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Divider } from "ant-design-vue";
import { RouterName } from "@/enums/appEnums";

import { dummyCourseData } from "@/data/dummy";
import { courseDetails, formatCourseTime } from "@/data/courseData";

const route = useRoute();
const router = useRouter();
const courseId = route.params.id;

// 從這兩個來源中尋找課程
const course = computed(() => {
  // 如果從課程列表來的，則使用 dummyCourseData
  const dummyCourse = dummyCourseData.find(
    (course) => course.id === Number(courseId)
  );

  if (dummyCourse) {
    // 合併課程詳情
    return {
      ...dummyCourse,
      ...(courseDetails[courseId] || {}),
    };
  }

  // 如果從限時選課或修課記錄來的，直接使用 courseId
  return {
    id: courseId,
    title: courseId, // 這個會被覆蓋
    ...(courseDetails[courseId] || {}),
  };
});

console.log(course.value, dummyCourseData);

const goBack = () => {
  router.go(-1);
};
</script>

<template>
  <div class="u-p4 u-h100% u-w100% u-flex u-flex-col u-gap-4">
    <div
      class="u-p24px u-rounded-16px u-shadow u-bg-white u-h100% u-flex u-flex-nowrap u-flex-gap-2rem"
    >
      <div class="u-flex u-flex-col u-gap-24px u-c-blue u-w-full">
        <div class="u-flex u-items-start u-justify-between">
          <h1 class="u-m0">{{ course.title || course.courseName }}</h1>
          <a-button @click="goBack">
            <template #icon><i class="fas fa-arrow-left"></i></template>
            返回課程列表
          </a-button>
        </div>

        <!-- 課程基本資訊 -->
        <div
          class="u-grid u-grid-cols-2 u-gap-4"
          v-if="course.category || course.teacher"
        >
          <div class="u-flex u-flex-col u-gap-2">
            <div class="u-flex u-gap-2" v-if="course.category">
              <span class="u-font-bold">課程類別:</span>
              <span>{{ course.category }}</span>
            </div>
            <div class="u-flex u-gap-2" v-if="course.credits">
              <span class="u-font-bold">學分數:</span>
              <span>{{ course.credits }}</span>
            </div>
            <div class="u-flex u-gap-2" v-if="course.teacher">
              <span class="u-font-bold">授課教師:</span>
              <span>{{ course.teacher || course.instructor }}</span>
            </div>
          </div>
          <div class="u-flex u-flex-col u-gap-2">
            <div class="u-flex u-gap-2" v-if="course.timeSlots">
              <span class="u-font-bold">上課時間:</span>
              <span>{{ formatCourseTime(course) }}</span>
            </div>
            <div class="u-flex u-gap-2" v-if="course.enrollmentLimit">
              <span class="u-font-bold">選課人數:</span>
              <span
                >{{ course.currentEnrollment }}/{{
                  course.enrollmentLimit
                }}</span
              >
            </div>
            <div class="u-flex u-gap-2" v-if="course.startDate">
              <span class="u-font-bold">開課日期:</span>
              <span>{{ course.startDate }}</span>
            </div>
          </div>
        </div>

        <p>{{ course.description }}</p>
      </div>
    </div>

    <div class="u-p24px u-rounded-16px u-shadow u-bg-white">
      <h1 class="u-text-24px u-font-bold u-c-blue">
        {{ "課程大綱" }}
      </h1>
      <Divider class="u-my8px" />
      <div class="u-c-black" v-html="course.outline"></div>
    </div>

    <div class="u-p24px u-rounded-16px u-shadow u-bg-white">
      <h1 class="u-text-24px u-font-bold u-c-blue">
        {{ "講師簡介" }}
      </h1>
      <Divider class="u-my8px" />
      <div class="u-c-black" v-html="course.teacherInfo"></div>
    </div>
  </div>
</template>

<style scoped>
.u-grid {
  display: grid;
}
.u-grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.u-gap-2 {
  gap: 0.5rem;
}
.u-gap-4 {
  gap: 1rem;
}
.u-font-bold {
  font-weight: bold;
}
.u-w-full {
  width: 100%;
}
</style>
