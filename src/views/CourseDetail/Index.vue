<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { Divider } from "ant-design-vue";

import { dummyCourseData } from "@/data/dummy";

const route = useRoute();
const courseId = route.params.id;

const course = computed(() =>
  dummyCourseData.find((course) => course.id === Number(courseId))
);
</script>

<template>
  <div class="u-p36px u-h100% u-w100% u-flex u-flex-col u-gap-36px">
    <div
      class="u-p24px u-rounded-16px u-shadow u-bg-white u-h100% u-flex u-flex-nowrap u-flex-gap-2rem"
    >
      <div>
        <img
          :src="course.image"
          alt="course image"
          class="u-max-w-200px u-max-h-200px"
        />
      </div>
      <div class="u-flex u-flex-col u-gap-24px u-c-blue">
        <h1 class="u-m0">{{ course.title }}</h1>
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
