<script setup>
import { ref, onMounted, computed } from "vue";
import { message, Modal } from "ant-design-vue";
import { useUserStore } from "@/stores/user";
import { UserRole } from "@/enums/appEnums";
import userApi from "@/apis/user";

// Data and state
const userStore = useUserStore();
const loading = ref(false);
const users = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const searchKeyword = ref("");
const userRoleFilter = ref(null);
const userStatusFilter = ref(null);

// Form for creating/editing users
const userForm = ref({
  id: "",
  username: "",
  name: "",
  email: "",
  phone: "",
  role: null,
  status: 1,
  password: "",
  confirmPassword: "",
});

const formVisible = ref(false);
const formTitle = ref("新增使用者");
const formMode = ref("create");
const formLoading = ref(false);
const formRules = {
  username: [
    { required: true, message: "請輸入使用者ID/帳號", trigger: "blur" },
  ],
  name: [{ required: true, message: "請輸入姓名", trigger: "blur" }],
  email: [
    { required: true, message: "請輸入電子郵件", trigger: "blur" },
    { type: "email", message: "請輸入有效的電子郵件", trigger: "blur" },
  ],
  role: [{ required: true, message: "請選擇角色", trigger: "change" }],
  password: [
    {
      required: formMode.value === "create",
      message: "請輸入密碼",
      trigger: "blur",
    },
  ],
  confirmPassword: [
    {
      required: formMode.value === "create",
      message: "請確認密碼",
      trigger: "blur",
    },
    { validator: validatePassword, trigger: "blur" },
  ],
};

// Check if current user is admin
const isAdmin = computed(
  () => userStore.userProfile.userType === UserRole.Admin
);

// Role options for dropdown
const roleOptions = [
  { label: "管理員", value: UserRole.Admin },
  { label: "經理", value: UserRole.Manager },
  { label: "教師", value: UserRole.Teacher },
  { label: "學生", value: UserRole.Student },
];

// Status options for dropdown
const statusOptions = [
  { label: "啟用", value: 1 },
  { label: "停用", value: 0 },
];

// Get users on component mount
onMounted(() => {
  if (isAdmin.value) {
    fetchUsers();
  } else {
    message.error("您沒有權限訪問此頁面");
  }
});

// Password validator
function validatePassword(rule, value) {
  if (formMode.value === "create" && !value) {
    return Promise.reject("請確認密碼");
  }

  if (value && value !== userForm.value.password) {
    return Promise.reject("兩次輸入的密碼不一致");
  }

  return Promise.resolve();
}

// Fetch users from API
async function fetchUsers() {
  try {
    loading.value = true;
    const { data } = await userApi.getUsers({
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchKeyword.value,
      role: userRoleFilter.value,
      status: userStatusFilter.value,
    });

    users.value = data.users;
    total.value = data.total;
  } catch (error) {
    message.error("獲取用戶列表失敗");
    console.error(error);
  } finally {
    loading.value = false;
  }
}

// Handle page change
function handlePageChange(page, size) {
  currentPage.value = page;
  pageSize.value = size;
  fetchUsers();
}

// Handle search
function handleSearch() {
  currentPage.value = 1;
  fetchUsers();
}

// Reset search filters
function resetFilters() {
  searchKeyword.value = "";
  userRoleFilter.value = null;
  userStatusFilter.value = null;
  currentPage.value = 1;
  fetchUsers();
}

// Open create user form
function showCreateForm() {
  formMode.value = "create";
  formTitle.value = "新增使用者";
  resetForm();
  formVisible.value = true;
}

// Open edit user form
function showEditForm(record) {
  formMode.value = "edit";
  formTitle.value = "編輯使用者";

  userForm.value = {
    id: record.id,
    username: record.username,
    name: record.name,
    email: record.email,
    phone: record.phone || "",
    role: record.role,
    status: record.status,
    password: "",
    confirmPassword: "",
  };

  formVisible.value = true;
}

// Reset form fields
function resetForm() {
  userForm.value = {
    id: "",
    username: "",
    name: "",
    email: "",
    phone: "",
    role: null,
    status: 1,
    password: "",
    confirmPassword: "",
  };
}

// Handle form cancel
function handleCancel() {
  formVisible.value = false;
  resetForm();
}

// Handle form submit
async function handleSubmit() {
  try {
    formLoading.value = true;

    const formData = {
      username: userForm.value.username,
      name: userForm.value.name,
      email: userForm.value.email,
      phone: userForm.value.phone,
      role: userForm.value.role,
      status: userForm.value.status,
    };

    if (formMode.value === "create") {
      formData.password = userForm.value.password;
      await userApi.createUser(formData);
      message.success("使用者創建成功");
    } else {
      formData.id = userForm.value.id;
      if (userForm.value.password) {
        formData.password = userForm.value.password;
      }
      await userApi.updateUser(formData);
      message.success("使用者更新成功");
    }

    formVisible.value = false;
    resetForm();
    fetchUsers();
  } catch (error) {
    message.error(
      formMode.value === "create" ? "創建使用者失敗" : "更新使用者失敗"
    );
    console.error(error);
  } finally {
    formLoading.value = false;
  }
}

// Delete user
function confirmDelete(record) {
  Modal.confirm({
    title: "確認刪除",
    content: `確定要刪除使用者 "${record.name}" 嗎？此操作不可撤銷。`,
    okText: "確認",
    okType: "danger",
    cancelText: "取消",
    onOk: async () => {
      try {
        await userApi.deleteUser(record.id);
        message.success("使用者刪除成功");
        fetchUsers();
      } catch (error) {
        message.error("刪除使用者失敗");
        console.error(error);
      }
    },
  });
}

// Map role ID to text
function getRoleText(role) {
  const roleOption = roleOptions.find((item) => item.value === role);
  return roleOption ? roleOption.label : "未知";
}

// Map status ID to text
function getStatusText(status) {
  return status === 1 ? "啟用" : "停用";
}
</script>

<template>
  <div class="user-management">
    <a-card title="使用者管理" :bordered="false">
      <template #extra>
        <a-button v-if="isAdmin" type="primary" @click="showCreateForm">
          <template #icon><plus-outlined /></template>
          新增使用者
        </a-button>
      </template>

      <!-- Search and filters -->
      <a-form layout="inline" class="table-filter-form mb-4">
        <a-form-item label="關鍵字">
          <a-input
            v-model:value="searchKeyword"
            placeholder="姓名/帳號/電子郵件"
            allow-clear
          />
        </a-form-item>

        <a-form-item label="角色">
          <a-select
            v-model:value="userRoleFilter"
            placeholder="選擇角色"
            style="width: 120px"
            allow-clear
          >
            <a-select-option
              v-for="option in roleOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="狀態">
          <a-select
            v-model:value="userStatusFilter"
            placeholder="選擇狀態"
            style="width: 120px"
            allow-clear
          >
            <a-select-option
              v-for="option in statusOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item>
          <a-button type="primary" @click="handleSearch">
            <template #icon><search-outlined /></template>
            搜尋
          </a-button>
        </a-form-item>

        <a-form-item>
          <a-button @click="resetFilters">
            <template #icon><clear-outlined /></template>
            重置
          </a-button>
        </a-form-item>
      </a-form>

      <!-- Users table -->
      <a-table
        :columns="[
          { title: '帳號', dataIndex: 'username', key: 'username' },
          { title: '姓名', dataIndex: 'name', key: 'name' },
          { title: '電子郵件', dataIndex: 'email', key: 'email' },
          {
            title: '角色',
            dataIndex: 'role',
            key: 'role',
            customRender: ({ text }) => getRoleText(text),
          },
          {
            title: '狀態',
            dataIndex: 'status',
            key: 'status',
            customRender: ({ text }) => getStatusText(text),
          },
          { title: '操作', key: 'action', fixed: 'right', width: 200 },
        ]"
        :data-source="users"
        :loading="loading"
        :pagination="{
          current: currentPage,
          pageSize: pageSize,
          total: total,
          onChange: handlePageChange,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 條記錄`,
        }"
        :row-key="(record) => record.id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <span>
              <a-button type="link" @click="showEditForm(record)"
                >編輯</a-button
              >
              <a-divider type="vertical" />
              <a-button type="link" danger @click="confirmDelete(record)"
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
      @ok="handleSubmit"
      @cancel="handleCancel"
      width="600px"
    >
      <a-form :model="userForm" :rules="formRules" layout="vertical">
        <a-form-item label="帳號" name="username">
          <a-input
            v-model:value="userForm.username"
            placeholder="請輸入帳號"
            :disabled="formMode === 'edit'"
          />
        </a-form-item>

        <a-form-item label="姓名" name="name">
          <a-input v-model:value="userForm.name" placeholder="請輸入姓名" />
        </a-form-item>

        <a-form-item label="電子郵件" name="email">
          <a-input
            v-model:value="userForm.email"
            placeholder="請輸入電子郵件"
          />
        </a-form-item>

        <a-form-item label="電話" name="phone">
          <a-input
            v-model:value="userForm.phone"
            placeholder="請輸入電話（選填）"
          />
        </a-form-item>

        <a-form-item label="角色" name="role">
          <a-select v-model:value="userForm.role" placeholder="請選擇角色">
            <a-select-option
              v-for="option in roleOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="狀態" name="status">
          <a-select v-model:value="userForm.status" placeholder="請選擇狀態">
            <a-select-option
              v-for="option in statusOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item
          :label="formMode === 'create' ? '密碼' : '新密碼（留空表示不修改）'"
          name="password"
        >
          <a-input-password
            v-model:value="userForm.password"
            placeholder="請輸入密碼"
          />
        </a-form-item>

        <a-form-item
          :label="formMode === 'create' ? '確認密碼' : '確認新密碼'"
          name="confirmPassword"
        >
          <a-input-password
            v-model:value="userForm.confirmPassword"
            placeholder="請再次輸入密碼"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<style scoped>
.user-management {
  padding: 24px;
}

.table-filter-form {
  margin-bottom: 24px;
}

.table-filter-form .ant-form-item {
  margin-bottom: 16px;
  margin-right: 16px;
}
</style>
