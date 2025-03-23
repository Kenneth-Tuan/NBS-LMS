<script setup>
import { storeToRefs } from "pinia";

import { useCourseStore } from "@/stores/course";
import { RouterName } from "@/enums/appEnums";
const courseStore = useCourseStore();
const { searchCourseCriteria } = courseStore;
const { courseTableColumns, courses } = storeToRefs(courseStore);

function onSearch(value) {
  console.log(value);
}
</script>

<template>
  <div class="u-p36px u-h100% u-w100% u-flex u-flex-col u-gap-36px">
    <div class="u-p24px u-rounded-16px u-shadow u-bg-white u-h100%">
      <h1 class="u-text-24px u-font-bold u-c-blue u-mb1.5rem">最新課程</h1>

      <a-input-search
        v-model:value="searchCourseCriteria.title"
        placeholder="輸入課程關鍵字"
        enter-button
        @search="onSearch"
      />
    </div>

    <a-table
      :columns="courseTableColumns"
      :data-source="courses"
      class="u-rounded-16px u-shadow u-bg-white u-h100% u-p24px"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'title'">
          <router-link
            :to="{ name: RouterName.CourseDetail, params: { id: record.id } }"
            >{{ record.title }}</router-link
          >
        </template>
        <template v-if="column.key === 'image'">
          <img
            :src="record.image"
            :alt="record.title"
            class="u-w100% u-max-w-200px u-aspect-ratio-16/9 u-object-contain u-transition-transform-300 hover:u-scale-110"
          />
        </template>
      </template>
    </a-table>
  </div>
</template>
