<script setup>
import { onMounted, ref, reactive } from "vue";
import { useUserManagementStore } from "@/stores/userManagement";
import { useUserManagementTable } from "@/composables/useUserManagementTable";
import { useUserManagementForm } from "@/composables/useUserManagementForm";
import { formatLocaleDateTime } from "@/utils/formatters";
import { getRoleText, getStatusText } from "@/utils/mappers";
import {
  PlusOutlined,
  SearchOutlined,
  ClearOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  StopOutlined,
  DownloadOutlined,
} from "@ant-design/icons-vue";
import { UserStatus } from "@/enums/appEnums";
import { message } from "ant-design-vue";
import userApi from "@/apis/user";

// Initialize Store
const store = useUserManagementStore();

// Setup Table Logic
const {
  filteredUsers,
  loading,
  exportLoading,
  pagination,
  filters,
  hasSelected,
  columns,
  rowSelection,
  handlePageChange,
  handleSearch,
  handleResetFilters,
  handleExportUsers,
  showEditForm,
  showCreateForm,
  confirmBulkOperation,
  confirmSingleDelete,
} = useUserManagementTable();

// Setup Form Logic
const {
  userForm,
  formVisible,
  formLoading,
  formTitle,
  formRules,
  roleOptions,
  statusOptions,
  formRef,
  handleFormSubmit,
  handleFormCancel,
} = useUserManagementForm();

// Reset Password Dialog State
const resetPasswordVisible = ref(false);
const resetPasswordLoading = ref(false);
const resetPasswordFormRef = ref();
const selectedUser = ref(null);

const resetPasswordForm = reactive({
  password: "",
  confirmPassword: "",
});

// Password validation rules for reset password
const resetPasswordRules = {
  password: [
    { required: true, message: "請輸入新密碼", trigger: "blur" },
    { min: 6, message: "密碼長度至少6位", trigger: "blur" },
  ],
  confirmPassword: [
    { required: true, message: "請確認密碼", trigger: "blur" },
    {
      validator: (rule, value) => {
        if (value !== resetPasswordForm.password) {
          return Promise.reject("兩次輸入的密碼不一致");
        }
        return Promise.resolve();
      },
      trigger: ["blur", "change"],
    },
  ],
};

// Reset Password Functions
const confirmSingleResetPassword = (record) => {
  selectedUser.value = record;
  resetPasswordForm.password = "";
  resetPasswordForm.confirmPassword = "";
  resetPasswordVisible.value = true;

  // Clear form validation
  setTimeout(() => {
    resetPasswordFormRef.value?.clearValidate();
  }, 0);
};

const handleResetPasswordSubmit = async () => {
  try {
    // Validate form
    await resetPasswordFormRef.value.validateFields();
  } catch (error) {
    console.log("Validation failed:", error);
    return;
  }

  resetPasswordLoading.value = true;
  try {
    await userApi.resetPassword({
      id: selectedUser.value.id,
      password: resetPasswordForm.password,
    });

    message.success(`用戶 "${selectedUser.value.name}" 密碼重設成功`);
    resetPasswordVisible.value = false;

    // Reset form
    resetPasswordForm.password = "";
    resetPasswordForm.confirmPassword = "";
    resetPasswordFormRef.value.resetFields();
  } catch (error) {
    console.error("Reset password failed:", error);
    message.error("密碼重設失敗，請稍後再試");
  } finally {
    resetPasswordLoading.value = false;
  }
};

const handleResetPasswordCancel = () => {
  resetPasswordVisible.value = false;
  resetPasswordForm.password = "";
  resetPasswordForm.confirmPassword = "";
  resetPasswordFormRef.value?.clearValidate();
};

// Fetch initial data on mount
onMounted(() => {
  store.initialize();
});
</script>

<template>
  <div class="user-management u-w100%">
    <a-card title="使用者管理" :bordered="false">
      <template #extra>
        <a-space>
          <a-button :loading="exportLoading" @click="handleExportUsers">
            <template #icon><download-outlined /></template>
            匯出用戶
          </a-button>
          <a-button type="primary" @click="showCreateForm">
            <template #icon><plus-outlined /></template>
            新增使用者
          </a-button>
        </a-space>
      </template>

      <!-- Search and filters -->
      <a-form layout="inline" class="table-filter-form mb-4">
        <a-form-item label="關鍵字">
          <a-input
            v-model:value="filters.searchKeyword"
            placeholder="姓名/帳號/電子郵件"
            allow-clear
          />
        </a-form-item>

        <a-form-item label="角色">
          <a-select
            v-model:value="filters.role"
            placeholder="選擇角色"
            style="width: 120px"
            allow-clear
            :options="roleOptions"
          >
          </a-select>
        </a-form-item>

        <a-form-item label="狀態">
          <a-select
            v-model:value="filters.status"
            placeholder="選擇狀態"
            style="width: 120px"
            allow-clear
            :options="statusOptions"
          >
          </a-select>
        </a-form-item>

        <a-form-item>
          <a-button v-if="false" type="primary" @click="handleSearch">
            <template #icon><search-outlined /></template>
            搜尋
          </a-button>
        </a-form-item>

        <a-form-item>
          <a-button @click="handleResetFilters">
            <template #icon><clear-outlined /></template>
            重置
          </a-button>
        </a-form-item>
      </a-form>

      <!-- Bulk actions -->
      <div class="bulk-actions mb-4" v-if="false">
        <a-space>
          <span v-if="hasSelected"
            >已選擇 {{ store.selectedRowKeys.length }} 項</span
          >
          <a-button
            type="primary"
            :disabled="!hasSelected"
            @click="confirmBulkOperation('activate')"
          >
            <template #icon><check-circle-outlined /></template>
            批量啟用
          </a-button>
          <a-button
            :disabled="!hasSelected"
            @click="confirmBulkOperation('deactivate')"
          >
            <template #icon><stop-outlined /></template>
            批量停用
          </a-button>
          <a-button
            type="danger"
            :disabled="!hasSelected"
            @click="confirmBulkOperation('delete')"
          >
            <template #icon><delete-outlined /></template>
            批量刪除
          </a-button>
        </a-space>
      </div>

      <!-- Users table -->
      <a-table
        :row-selection="rowSelection"
        :columns="columns"
        :data-source="filteredUsers"
        :loading="loading"
        :pagination="{
          current: pagination.currentPage,
          pageSize: pagination.pageSize,
          total: pagination.total * pagination.pageSize,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 條記錄`,
        }"
        :row-key="(record) => record.id"
        @change="handlePageChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'avatar'">
            <a-avatar :src="record.avatar" :alt="record.name" />
          </template>
          <template v-else-if="column.key === 'role'">
            {{ getRoleText(record.role) }}
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag
              :color="record.status === UserStatus.Active ? 'green' : 'red'"
            >
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'lastLogin'">
            {{ formatLocaleDateTime(record.lastLogin) }}
          </template>
          <template v-else-if="column.key === 'action'">
            <span>
              <a-button
                type="link"
                style="padding: 0 0 0 0"
                @click="showEditForm(record)"
                >編輯</a-button
              >
              <a-divider type="vertical" />
              <a-button
                type="link"
                style="padding: 0 0 0 0"
                @click="confirmSingleResetPassword(record)"
                >重設密碼</a-button
              >
              <a-divider type="vertical" />
              <a-button
                type="link"
                style="padding: 0 0 0 0"
                danger
                @click="confirmSingleDelete(record)"
                >刪除</a-button
              >
            </span>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- Create/Edit user form dialog -->
    <a-modal
      :visible="formVisible"
      :title="formTitle"
      :confirm-loading="formLoading"
      @ok="handleFormSubmit"
      @cancel="handleFormCancel"
      width="600px"
      :destroyOnClose="true"
    >
      <a-form
        :model="userForm"
        :rules="formRules"
        layout="vertical"
        ref="formRef"
      >
        <a-form-item label="姓名" name="name">
          <a-input
            v-model:value="userForm.name"
            placeholder="請輸入姓名"
            :disabled="store.formMode === 'edit'"
          />
        </a-form-item>

        <a-form-item label="電子郵件" name="email">
          <a-input
            v-model:value="userForm.email"
            placeholder="請輸入電子郵件"
            :disabled="store.formMode === 'edit'"
          />
        </a-form-item>

        <a-form-item label="電話" name="phone">
          <a-input
            v-model:value="userForm.phone"
            placeholder="請輸入電話（選填）"
            :disabled="store.formMode === 'edit'"
          />
        </a-form-item>

        <a-form-item label="角色" name="role">
          <a-select
            v-model:value="userForm.role"
            placeholder="請選擇角色"
            :options="roleOptions"
          >
          </a-select>
        </a-form-item>

        <a-form-item
          v-if="store.formMode === 'edit'"
          label="狀態"
          name="status"
        >
          <a-select
            v-model:value="userForm.status"
            placeholder="請選擇狀態"
            :options="statusOptions"
          >
          </a-select>
        </a-form-item>

        <template v-if="store.formMode === 'create'">
          <a-form-item
            :label="
              store.formMode === 'create' ? '密碼' : '新密碼（留空表示不修改）'
            "
            name="password"
          >
            <a-input-password
              v-model:value="userForm.password"
              placeholder="請輸入密碼"
            />
          </a-form-item>

          <a-form-item
            :label="store.formMode === 'create' ? '確認密碼' : '確認新密碼'"
            name="confirmPassword"
          >
            <a-input-password
              v-model:value="userForm.confirmPassword"
              placeholder="請再次輸入密碼"
            />
          </a-form-item>
        </template>
      </a-form>
    </a-modal>

    <!-- Reset Password Dialog -->
    <a-modal
      :visible="resetPasswordVisible"
      :title="`重設密碼 - ${selectedUser?.name}`"
      :confirm-loading="resetPasswordLoading"
      @ok="handleResetPasswordSubmit"
      @cancel="handleResetPasswordCancel"
      width="600px"
      :destroyOnClose="true"
    >
      <a-form
        :model="resetPasswordForm"
        :rules="resetPasswordRules"
        layout="vertical"
        ref="resetPasswordFormRef"
      >
        <a-form-item label="新密碼" name="password">
          <a-input-password
            v-model:value="resetPasswordForm.password"
            placeholder="請輸入新密碼"
          />
        </a-form-item>

        <a-form-item label="確認密碼" name="confirmPassword">
          <a-input-password
            v-model:value="resetPasswordForm.confirmPassword"
            placeholder="請再次輸入密碼"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<style scoped>
.user-management {
  padding: 16px;
}

.table-filter-form {
  margin-bottom: 16px;
}

.table-filter-form .ant-form-item {
  margin-bottom: 16px;
  margin-right: 16px;
}

.bulk-actions {
  margin-bottom: 16px;
}

.mb-4 {
  margin-bottom: 16px;
}

/* Ensure table takes full width */
:deep(.ant-card-body) {
  padding: 16px; /* Adjust padding if needed */
}
</style>
