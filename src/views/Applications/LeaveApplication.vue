<script setup>
import { ref, reactive } from "vue";
import { UploadOutlined } from "@ant-design/icons-vue";
import { message } from "ant-design-vue";

import { useApplicationStore } from "@/stores/application";
import { useCourseStore } from "../../stores/course";
import ApplicantInfo from "@/components/ApplicantInfo.vue";

const applicationStore = useApplicationStore();
const { applicationForm, leaveApplicationForm, resetForm, submitForm } =
  applicationStore;

const courseStore = useCourseStore();

// 輔助函數來獲取表單欄位
const formField = (fieldName) => {
  return applicationForm[fieldName];
};

const formState = reactive({});

const rangeConfig = {
  rules: [
    {
      type: "array",
      required: true,
      message: "Please select time!",
    },
  ],
};

// 檔案上傳相關
const fileList = ref([]);
const handleFileChange = (info) => {
  let fileList = [...info.fileList];

  // 限制檔案數量
  fileList = fileList.slice(-3);

  // 更新檔案列表
  fileList.value = fileList;

  // 提取上傳檔案名稱並更新表單值
  if (fileList.length > 0) {
    const fileNames = fileList.map((file) => file.name).join(", ");
    formField("supplementaryMaterials").value = fileNames;
  } else {
    formField("supplementaryMaterials").value = "";
  }
};

const handlePreview = (file) => {
  // 實際應用中，這裡可能會開啟檔案預覽
  console.log("Preview file:", file);
};

// 狀態變量
const submitting = ref(false);
const successVisible = ref(false);
const submittedId = ref("");

// 提交表單
const handleSubmit = async () => {
  try {
    submitting.value = true;

    // 調用 store 中的提交函數
    const result = await submitForm("leave");

    // 提交成功處理
    submittedId.value = result.id;
    successVisible.value = true;
  } catch (error) {
    // 提交失敗處理
    message.error(error.message || "表單提交失敗，請檢查填寫內容");
  } finally {
    submitting.value = false;
  }
};

// 重置表單
const handleReset = () => {
  resetForm();
  fileList.value = [];
};

// 成功提示框確認
const handleSuccessOk = () => {
  successVisible.value = false;
};

const filterOption = (input, option) => {
  // Check if option.label exists and is a string before calling toLowerCase
  return (
    option.label &&
    typeof option.label === "string" &&
    option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
  );
};
</script>

<template>
  <div class="u-p-4 u-w-full">
    <div class="u-bg-white u-rounded-lg u-p-6 u-shadow-md">
      <h1 class="u-text-2xl u-font-bold u-mb-6 u-c-blue">請假申請</h1>

      <a-form layout="vertical" :model="applicationForm">

          <ApplicantInfo />


        <a-divider orientation="left">請假資訊</a-divider>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item
              name="range-time-picker"
              label="請假時間"
              v-bind="rangeConfig"
            >
              <a-range-picker
                v-model:value="formState['range-time-picker']"
                show-time
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
                class="u-w-full"
              />
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item label="請假課程" name="prerequisites">
              <a-select
                v-model:value="courseStore.courseForm.prerequisites"
                mode="multiple"
                placeholder="請選擇請假課程"
                :options="courseStore.courseInfos.prerequisites"
                allow-clear
                class="u-w-full"
                :filter-option="filterOption"
              >
                <!-- Optional: Customize tag rendering -->
                <template #tagRender="{ label, closable, onClose }">
                  <a-tag
                    :closable="closable"
                    @close="onClose"
                    style="margin-right: 3px"
                    >{{ label }}</a-tag
                  >
                </template>
              </a-select>
            </a-form-item>
          </a-col>

          <a-col :span="24">
            <a-form-item
              label="請假原因"
              :validateStatus="formField('reasonForLeave').err ? 'error' : ''"
              :help="formField('reasonForLeave').errMsg"
            >
              <a-textarea
                v-model:value="formField('reasonForLeave').value"
                placeholder="請詳述請假原因"
                :rows="4"
              />
            </a-form-item>
          </a-col>

          <a-col :span="24">
            <a-form-item
              label="相關附件"
              :validateStatus="
                formField('supplementaryMaterials').err ? 'error' : ''
              "
              :help="formField('supplementaryMaterials').errMsg"
            >
              <a-upload
                action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                list-type="picture"
                :file-list="fileList"
                @change="handleFileChange"
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
            <a-button type="primary" @click="handleSubmit" :loading="submitting"
              >提交申請</a-button
            >
            <a-button @click="handleReset">重置表單</a-button>
          </a-space>
        </a-form-item>
      </a-form>

      <!-- 成功提示 -->
      <a-modal
        v-model:open="successVisible"
        title="申請提交成功"
        @ok="handleSuccessOk"
      >
        <p>您的請假申請已成功提交，申請編號：{{ submittedId }}</p>
        <p>目前狀態：待審核</p>
      </a-modal>
    </div>
  </div>
</template>
