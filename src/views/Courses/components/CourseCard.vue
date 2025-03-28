<template>
  <a-card
    :hoverable="true"
    class="u-w-full u-h-full u-flex u-flex-col"
    @click="handleClick"
  >
    <!-- 課程圖片 -->
    <div class="u-relative u-w-full u-h-48 u-overflow-hidden u-rounded-t-lg">
      <img
        :src="course.image"
        :alt="course.title"
        class="u-w-full u-h-full u-object-cover"
      />
      <div
        class="u-absolute u-top-2 u-right-2 u-px-3 u-py-1 u-rounded-full"
        :class="statusClass"
      >
        {{ course.status }}
      </div>
    </div>

    <!-- 課程內容 -->
    <div class="u-p-4 u-flex u-flex-col u-flex-grow">
      <h3 class="u-text-lg u-font-bold u-mb-2 u-line-clamp-2">
        {{ course.title }}
      </h3>

      <div class="u-flex u-items-center u-mb-2">
        <span class="u-text-sm u-text-gray-500">{{ course.type }}</span>
        <span class="u-mx-2 u-text-gray-300">|</span>
        <span class="u-text-sm u-text-gray-500">{{ course.duration }}</span>
      </div>

      <p class="u-text-sm u-text-gray-600 u-mb-4 u-line-clamp-3">
        {{ course.description }}
      </p>

      <div class="u-mt-auto">
        <div class="u-flex u-items-center u-mb-2">
          <i class="fas fa-user u-text-gray-400 u-mr-2"></i>
          <span class="u-text-sm u-text-gray-600">{{ course.instructor }}</span>
        </div>

        <div class="u-flex u-items-center u-justify-between">
          <div class="u-flex u-items-center">
            <i class="fas fa-calendar u-text-gray-400 u-mr-2"></i>
            <span class="u-text-sm u-text-gray-600">{{
              course.startDate
            }}</span>
          </div>
          <span class="u-text-sm u-text-gray-600">{{ course.classType }}</span>
        </div>
      </div>
    </div>
  </a-card>
</template>

<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";

const props = defineProps({
  course: {
    type: Object,
    required: true,
  },
});

const router = useRouter();

// 根據狀態設置不同的樣式
const statusClass = computed(() => {
  const baseClasses = "u-text-sm u-font-medium";
  switch (props.course.status) {
    case "招生中":
      return `${baseClasses} u-bg-green-100 u-text-green-600`;
    case "即將額滿":
      return `${baseClasses} u-bg-yellow-100 u-text-yellow-600`;
    case "已結束":
      return `${baseClasses} u-bg-gray-100 u-text-gray-600`;
    case "待審核":
      return `${baseClasses} u-bg-blue-100 u-text-blue-600`;
    default:
      return `${baseClasses} u-bg-gray-100 u-text-gray-600`;
  }
});

// 點擊卡片時導航到課程詳情頁
const handleClick = () => {
  router.push(`/courses/${props.course.id}`);
};
</script>
