<template>
  <div class="u-bg-white u-rounded-lg u-p-6 u-shadow-md">
    <h2 class="u-text-xl u-font-bold u-mb-6">課程審核</h2>

    <!-- 課程基本信息 -->
    <a-descriptions :column="2" bordered class="u-mb-6">
      <a-descriptions-item label="課程名稱" :span="2">
        {{ course.title }}
      </a-descriptions-item>
      <a-descriptions-item label="課程類型">
        {{ course.type }}
      </a-descriptions-item>
      <a-descriptions-item label="課程時長">
        {{ course.duration }}
      </a-descriptions-item>
      <a-descriptions-item label="授課教師">
        {{ course.instructor }}
      </a-descriptions-item>
      <a-descriptions-item label="開課日期">
        {{ course.startDate }}
      </a-descriptions-item>
      <a-descriptions-item label="上課方式" :span="2">
        {{ course.classType }}
      </a-descriptions-item>
      <a-descriptions-item label="課程簡介" :span="2">
        {{ course.description }}
      </a-descriptions-item>
    </a-descriptions>

    <!-- 課程大綱 -->
    <div class="u-mb-6">
      <h3 class="u-text-lg u-font-semibold u-mb-4">課程大綱</h3>
      <div class="u-bg-gray-50 u-p-4 u-rounded" v-html="course.outline"></div>
    </div>

    <!-- 教師資訊 -->
    <div class="u-mb-6">
      <h3 class="u-text-lg u-font-semibold u-mb-4">教師資訊</h3>
      <div
        class="u-bg-gray-50 u-p-4 u-rounded"
        v-html="course.teacherInfo"
      ></div>
    </div>

    <!-- 審核表單 -->
    <div v-if="course.status === '待審核'" class="u-border-t u-pt-6">
      <h3 class="u-text-lg u-font-semibold u-mb-4 u-text-blue-600">審核決定</h3>

      <a-form layout="vertical">
        <a-form-item label="審核結果">
          <a-radio-group v-model:value="reviewResult">
            <a-radio value="approve">通過</a-radio>
            <a-radio value="reject">退回</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item label="審核意見" required>
          <a-textarea
            v-model:value="reviewComment"
            :rows="4"
            placeholder="請輸入審核意見"
          />
        </a-form-item>

        <div class="u-flex u-justify-end u-gap-4">
          <a-button @click="handleCancel">取消</a-button>
          <a-button type="primary" :loading="submitting" @click="handleSubmit">
            提交審核
          </a-button>
        </div>
      </a-form>
    </div>

    <!-- 已審核信息 -->
    <div v-else class="u-border-t u-pt-6">
      <h3 class="u-text-lg u-font-semibold u-mb-4">審核記錄</h3>
      <a-descriptions bordered>
        <a-descriptions-item label="審核結果" :span="3">
          <a-tag :color="course.status === '招生中' ? 'success' : 'error'">
            {{ course.status }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="審核人" :span="3">
          {{ course.reviewer }}
        </a-descriptions-item>
        <a-descriptions-item label="審核日期" :span="3">
          {{ course.reviewDate }}
        </a-descriptions-item>
        <a-descriptions-item label="審核意見" :span="3">
          {{ course.reviewComment }}
        </a-descriptions-item>
      </a-descriptions>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { message } from "ant-design-vue";
import { useCourseStore } from "@/stores/course";
import { useUserStore } from "@/stores/user";

const props = defineProps({
  course: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["review-completed"]);

const courseStore = useCourseStore();
const userStore = useUserStore();
const reviewResult = ref("approve");
const reviewComment = ref("");
const submitting = ref(false);

// 提交審核
const handleSubmit = async () => {
  if (!reviewComment.value.trim()) {
    message.error("請輸入審核意見");
    return;
  }

  try {
    submitting.value = true;
    const newStatus = reviewResult.value === "approve" ? "招生中" : "已退回";

    // 準備審核數據
    const reviewData = {
      reviewDate: new Date().toISOString().split("T")[0].replace(/-/g, "/"),
      reviewer: userStore.userProfile.userName,
      reviewComment: reviewComment.value,
    };

    // 更新課程狀態
    await courseStore.updateCourseStatus(
      props.course.id,
      newStatus,
      reviewData
    );

    message.success("審核完成");
    emit("review-completed");
  } catch (error) {
    message.error(error.message || "審核失敗，請重試");
  } finally {
    submitting.value = false;
  }
};

// 取消審核
const handleCancel = () => {
  reviewResult.value = "approve";
  reviewComment.value = "";
  emit("review-completed");
};
</script>
