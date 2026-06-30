<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { UploadOutlined } from "@ant-design/icons-vue";
import { message } from "ant-design-vue";
import { useRouter } from "vue-router";
import dayjs from "dayjs";

import { useApplicationStore } from "@/stores/application";
import { useUserStore } from "@/stores/user";
import ApplicantInfo from "@/components/ApplicantInfo.vue";
import { leaveApplicationSchema } from "@/schemas/leaveApplication.schema";
import applicationApi from "@/apis/application";
import { useFileUpload } from "@/composables/useFileUpload";
import { useFileDownload } from "@/composables/useFileDownload";
import { RouterName } from "@/enums/appEnums";
import {
  DEPARTMENT_OPTIONS,
  DEPARTMENTS_LABEL_MAP,
} from "@/constant/common.constant";

const router = useRouter();
const { userProfile } = useUserStore();

const applicationStore = useApplicationStore();
const { leaveApplicationForm, resetLeaveForm, submitLeaveForm } =
  applicationStore;

const { processFileList } = useFileUpload();
const { downloading, downloadAndOpen } = useFileDownload();

// 表單 Ref
const leaveFormRef = ref(null);

// file upload handled by useFileUpload composable
const handlePreview = async (file) => {
  await downloadAndOpen(file);
};

const customRequest = async () =>
  await processFileList(leaveApplicationForm.attachments);

// 狀態變量
const submitting = ref(false);
const successVisible = ref(false);

// ── 科系選項：從 userProfile.departments 撈取，若為空則顯示全部 ──────────
const departmentOptions = computed(() => {
  const profileDepts = userProfile.departments || [];
  if (profileDepts.length === 0) return DEPARTMENT_OPTIONS;
  return DEPARTMENT_OPTIONS.filter((opt) => profileDepts.includes(opt.value));
});

// ── 課程清單（含 schedule 資訊，用於推算請假時間） ────────────────────────
const courseOptions = ref([]); // [{ label, value, schedule: [{week_day, start_time, end_time}] }]

const fetchCoursesListForLeave = async () => {
  try {
    const {
      data: {
        data: { courses },
      },
    } = await applicationApi.getCoursesListForLeave();
    courseOptions.value = courses.map((course) => ({
      label: course.name,
      value: course.id,
      schedule: course.weekly_schedule || [],
    }));
  } catch (error) {
    console.error("Error fetching courses list:", error);
  }
};

// ── 請假時間推算 ─────────────────────────────────────────────────────────
// 依據課程 weekly_schedule，找到 leave_date 當天的上課時間
const computeLeaveTimes = () => {
  const { course_id, leave_date, leave_periods } = leaveApplicationForm;
  if (!leave_date) return;

  const weekDayNames = [null, "週一", "週二", "週三", "週四", "週五", null];
  const dow = dayjs(leave_date).day(); // 0=Sun, 1=Mon, ..., 6=Sat
  const weekDay = weekDayNames[dow];

  const course = courseOptions.value.find((c) => c.value === course_id);
  let startTime = "08:00"; // 預設

  if (course && weekDay) {
    const slot = course.schedule?.find((s) => s.week_day === weekDay);
    if (slot?.start_time) {
      startTime = slot.start_time.slice(0, 5); // "HH:mm"
    }
  }

  const periods = Number(leave_periods) || 1;
  // 每節 50 分鐘，節間休息 10 分鐘，N 節合計 60N-10 分鐘
  const durationMin = 60 * periods - 10;

  const startDayjs = dayjs(`${leave_date}T${startTime}`);
  const endDayjs = startDayjs.add(durationMin, "minute");

  leaveApplicationForm.leave_start_date = startDayjs.format(
    "YYYY-MM-DDTHH:mm:ssZ",
  );
  leaveApplicationForm.leave_end_date = endDayjs.format("YYYY-MM-DDTHH:mm:ssZ");
};

// 監聽課程、日期、節數，自動計算起訖時間
watch(
  [
    () => leaveApplicationForm.course_id,
    () => leaveApplicationForm.leave_date,
    () => leaveApplicationForm.leave_periods,
  ],
  computeLeaveTimes,
  { immediate: false },
);

// ── 提交表單（a-form finish 事件觸發） ────────────────────────────────────
const handleSubmit = async () => {
  try {
    submitting.value = true;
    await submitLeaveForm();
    successVisible.value = true;
  } catch (error) {
    message.error(error.message || "表單提交失敗，請檢查填寫內容");
  } finally {
    submitting.value = false;
  }
};

// 失敗回傳
const handleFinishFailed = (errorInfo) => {
  console.log("leave form failed:", errorInfo);
};

// 重置表單
const handleReset = () => {
  resetLeaveForm();
  leaveFormRef.value.clearValidate();
};

// 成功提示框確認
const handleSuccessOk = () => {
  successVisible.value = false;
  handleReset();
  router.push({ name: RouterName.ApplicationRecord });
};

// 下拉搜尋
const filterOption = (input, option) => {
  return (
    option.label &&
    typeof option.label === "string" &&
    option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
  );
};

onMounted(async () => {
  await fetchCoursesListForLeave();
});
</script>

<template>
  <div class="u-w-full u-bg-white u-rounded-0.5rem u-p-1.5rem u-shadow-md">
    <h1 class="u-text-1.5rem u-fw600 u-mb-1.5rem u-c-blue">請假申請</h1>

    <a-form
      ref="leaveFormRef"
      layout="vertical"
      :model="leaveApplicationForm"
      @finish="handleSubmit"
      @finishFailed="handleFinishFailed"
    >
      <ApplicantInfo />

      <!-- <a-divider orientation="left">基本資料</a-divider>

      <a-row :gutter="16">

        <a-col :span="12">
          <a-form-item
            v-bind="leaveApplicationSchema.student_id"
            name="student_id"
          >
            <a-input
              v-model:value="leaveApplicationForm.student_id"
              :placeholder="leaveApplicationSchema.student_id.placeholder"
            />
          </a-form-item>
        </a-col>


        <a-col :span="12">
          <a-form-item
            v-bind="leaveApplicationSchema.department"
            name="department"
          >
            <a-select
              v-model:value="leaveApplicationForm.department"
              :options="departmentOptions"
              :placeholder="leaveApplicationSchema.department.placeholder"
              allow-clear
              class="u-w-full"
            />
          </a-form-item>
        </a-col>
      </a-row> -->

      <a-divider orientation="left">請假資訊</a-divider>

      <a-row :gutter="16">
        <!-- 請假課程 -->
        <a-col :span="12">
          <a-form-item
            v-bind="leaveApplicationSchema.course_id"
            name="course_id"
          >
            <a-select
              v-model:value="leaveApplicationForm.course_id"
              :options="courseOptions"
              :placeholder="leaveApplicationSchema.course_id.placeholder"
              allow-clear
              class="u-w-full"
              :filter-option="filterOption"
              show-search
            />
          </a-form-item>
        </a-col>

        <!-- 假別 -->
        <a-col :span="12">
          <a-form-item
            v-bind="leaveApplicationSchema.leave_type"
            name="leave_type"
          >
            <a-select
              v-model:value="leaveApplicationForm.leave_type"
              :options="leaveApplicationSchema.leave_type.options"
              :placeholder="leaveApplicationSchema.leave_type.placeholder"
              allow-clear
              class="u-w-full"
            />
          </a-form-item>
        </a-col>

        <!-- 請假日期 -->
        <a-col :span="12">
          <a-form-item
            v-bind="leaveApplicationSchema.leave_date"
            name="leave_date"
          >
            <a-date-picker
              v-model:value="leaveApplicationForm.leave_date"
              :format="leaveApplicationSchema.leave_date.format"
              :value-format="leaveApplicationSchema.leave_date.valueFormat"
              :placeholder="leaveApplicationSchema.leave_date.placeholder"
              class="u-w-full"
            />
          </a-form-item>
        </a-col>

        <!-- 請假節數 -->
        <a-col :span="12">
          <a-form-item
            v-bind="leaveApplicationSchema.leave_periods"
            name="leave_periods"
          >
            <a-input-number
              v-model:value="leaveApplicationForm.leave_periods"
              :min="1"
              :placeholder="leaveApplicationSchema.leave_periods.placeholder"
              class="u-w-full"
            />
          </a-form-item>
        </a-col>

        <!-- 請假原因（含字數限制） -->
        <a-col :span="24">
          <a-form-item
            v-bind="leaveApplicationSchema.leave_reason"
            name="leave_reason"
          >
            <a-textarea
              v-model:value="leaveApplicationForm.leave_reason"
              :rows="3"
              :maxlength="leaveApplicationSchema.leave_reason.maxLength"
              :placeholder="leaveApplicationSchema.leave_reason.placeholder"
              show-count
            />
          </a-form-item>
        </a-col>

        <!-- 附件 -->
        <a-col :span="24">
          <a-form-item
            v-bind="leaveApplicationSchema.attachments"
            name="attachments"
          >
            <a-upload
              list-type="picture"
              v-model:file-list="leaveApplicationForm.attachments"
              :customRequest="customRequest"
            >
              <a-button>
                <upload-outlined />
                上傳檔案
              </a-button>
              <template #itemRender="{ file, actions }">
                <span>
                  <a-button type="link" @click="() => handlePreview(file)">
                    {{ file.name }}
                  </a-button>
                </span>
                <span>
                  <a-button type="link" @click="() => actions.remove()">
                    删除
                  </a-button>
                </span>
              </template>
            </a-upload>
          </a-form-item>
        </a-col>
      </a-row>

      <a-form-item>
        <a-space>
          <a-button type="primary" html-type="submit" :loading="submitting"
            >提交申請</a-button
          >
          <a-button @click="handleReset">重置表單</a-button>
        </a-space>
      </a-form-item>
    </a-form>
  </div>

  <!-- 成功提示 -->
  <a-modal
    v-model:open="successVisible"
    title="申請提交成功"
    @ok="handleSuccessOk"
  >
    <p>您的請假申請已成功提交</p>
    <p>目前狀態：待審核</p>
  </a-modal>
</template>

<style scoped>
.u-shadow-md {
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
</style>
