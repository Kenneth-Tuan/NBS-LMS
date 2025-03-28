<template>
  <div class="u-p-4 u-w-full">
    <div class="u-bg-white u-rounded-lg u-p-6 u-shadow-md">
      <div class="u-flex u-justify-between u-items-center u-mb-6">
        <h1 class="u-text-2xl u-font-bold">課程列表</h1>
        <a-button
          type="primary"
          @click="router.push('/courses/create')"
          v-if="userStore.userProfile.userType === UserRole.ADMIN"
        >
          新增課程
        </a-button>
      </div>

      <!-- 搜索和篩選 -->
      <div class="u-mb-6">
        <a-row :gutter="16" class="u-mb-4">
          <a-col :span="8">
            <a-input-search
              v-model:value="searchText"
              placeholder="搜索課程名稱或教師"
              @search="handleSearch"
            />
          </a-col>
          <a-col :span="16">
            <a-space>
              <a-select
                v-model:value="filterStatus"
                style="width: 120px"
                placeholder="課程狀態"
              >
                <a-select-option value="">全部狀態</a-select-option>
                <a-select-option value="招生中">招生中</a-select-option>
                <a-select-option value="即將額滿">即將額滿</a-select-option>
                <a-select-option value="已結束">已結束</a-select-option>
                <a-select-option value="待審核">待審核</a-select-option>
              </a-select>

              <a-select
                v-model:value="filterType"
                style="width: 120px"
                placeholder="課程類型"
              >
                <a-select-option value="">全部類型</a-select-option>
                <a-select-option value="新課程">新課程</a-select-option>
                <a-select-option value="重開課程">重開課程</a-select-option>
                <a-select-option value="進階課程">進階課程</a-select-option>
              </a-select>

              <a-select
                v-model:value="filterClassType"
                style="width: 160px"
                placeholder="上課方式"
              >
                <a-select-option value="">全部方式</a-select-option>
                <a-select-option value="六日兩日全天專題班"
                  >六日兩日全天專題班</a-select-option
                >
                <a-select-option value="六日兩日下午專題班"
                  >六日兩日下午專題班</a-select-option
                >
                <a-select-option value="線上遠距課程"
                  >線上遠距課程</a-select-option
                >
              </a-select>
            </a-space>
          </a-col>
        </a-row>
      </div>

      <!-- 課程列表 -->
      <a-spin :spinning="courseStore.loading">
        <div v-if="filteredCourses.length > 0">
          <a-row :gutter="[16, 16]">
            <a-col
              v-for="course in filteredCourses"
              :key="course.id"
              :xs="24"
              :sm="12"
              :md="8"
              :lg="6"
            >
              <course-card :course="course" />
            </a-col>
          </a-row>
        </div>
        <a-empty v-else description="暫無課程" />
      </a-spin>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";

import { useCourseStore } from "@/stores/course";
import { useUserStore } from "@/stores/user";
import { UserRole } from "@/enums/appEnums";
import CourseCard from "./components/CourseCard.vue";

const router = useRouter();
const courseStore = useCourseStore();
const { getCourseList } = courseStore;
const { courseList } = storeToRefs(courseStore);
const userStore = useUserStore();

// 搜索和篩選狀態
const searchText = ref("");
const filterStatus = ref("");
const filterType = ref("");
const filterClassType = ref("");

// 過濾後的課程列表
const filteredCourses = computed(() => {
  return courseList.value.filter((course) => {
    // 搜索文本匹配
    const searchMatch =
      !searchText.value ||
      course.title.toLowerCase().includes(searchText.value.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchText.value.toLowerCase());

    // 狀態篩選
    const statusMatch =
      !filterStatus.value || course.status === filterStatus.value;

    // 類型篩選
    const typeMatch = !filterType.value || course.type === filterType.value;

    // 上課方式篩選
    const classTypeMatch =
      !filterClassType.value || course.classType === filterClassType.value;

    return searchMatch && statusMatch && typeMatch && classTypeMatch;
  });
});

// 處理搜索
const handleSearch = () => {
  // 搜索邏輯已經在 computed 中實現
};

// 初始化時獲取課程列表
onMounted(async () => {
  try {
    await getCourseList();
  } catch (error) {
    console.error("獲取課程列表失敗:", error);
  }
});
</script>
