<template>
  <div class="u-p-4 u-w-full">
    <div class="u-bg-white u-rounded-lg u-p-6 u-shadow-md">
      <h1 class="u-text-2xl u-font-bold u-mb-6 u-c-blue">請假申請</h1>

      <a-form layout="vertical" :model="applicationForm">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item
              label="姓名"
              :validateStatus="formField('name').err ? 'error' : ''"
              :help="formField('name').errMsg"
            >
              <a-input
                v-model:value="formField('name').value"
                placeholder="請輸入姓名"
              />
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item
              label="學號"
              :validateStatus="formField('id').err ? 'error' : ''"
              :help="formField('id').errMsg"
            >
              <a-input
                v-model:value="formField('id').value"
                placeholder="請輸入學號"
              />
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item
              label="Email"
              :validateStatus="formField('email').err ? 'error' : ''"
              :help="formField('email').errMsg"
            >
              <a-input
                v-model:value="formField('email').value"
                placeholder="請輸入Email"
              />
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item
              label="電話"
              :validateStatus="formField('tel').err ? 'error' : ''"
              :help="formField('tel').errMsg"
            >
              <a-input
                v-model:value="formField('tel').value"
                placeholder="請輸入電話"
                v-mask="formField('tel').mask"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-divider orientation="left">請假資訊</a-divider>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item
              label="請假開始日期"
              :validateStatus="formField('leaveStartDate').err ? 'error' : ''"
              :help="formField('leaveStartDate').errMsg"
            >
              <a-input
                v-model:value="formField('leaveStartDate').value"
                placeholder="YYYY/MM/DD"
                v-mask="formField('leaveStartDate').mask"
              />
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item
              label="請假結束日期"
              :validateStatus="formField('leaveEndDate').err ? 'error' : ''"
              :help="formField('leaveEndDate').errMsg"
            >
              <a-input
                v-model:value="formField('leaveEndDate').value"
                placeholder="YYYY/MM/DD"
                v-mask="formField('leaveEndDate').mask"
              />
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

<script setup>
import { ref, computed } from "vue";
import { useApplicationStore } from "@/stores/application";
import { message } from "ant-design-vue";
import { UploadOutlined } from "@ant-design/icons-vue";

const applicationStore = useApplicationStore();
const { applicationForm, leaveApplicationForm, resetForm, submitForm } =
  applicationStore;

// 輔助函數來獲取表單欄位
const formField = (fieldName) => {
  return applicationForm[fieldName];
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
</script>

<style scoped>
.u-p-4 {
  padding: 1rem;
}
.u-w-full {
  width: 100%;
}
.u-bg-white {
  background-color: white;
}
.u-rounded-lg {
  border-radius: 0.5rem;
}
.u-p-6 {
  padding: 1.5rem;
}
.u-shadow-md {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
.u-text-2xl {
  font-size: 1.5rem;
}
.u-font-bold {
  font-weight: bold;
}
.u-mb-6 {
  margin-bottom: 1.5rem;
}
</style>
