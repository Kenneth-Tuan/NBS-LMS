import { defineStore } from "pinia";
import { ref, reactive, computed } from "vue";
import { message, Modal } from "ant-design-vue";

import userApi from "@/apis/user";
import { initialUserFormState } from "@/schemas/userManagementForm.schema";
import { userService } from "../services/user.service";
import { useUserStore } from "./user";
import { UserRole } from "@/enums/appEnums";
import { UserStatus } from "../enums/appEnums";
import { getRoleText, getStatusText } from "@/utils/mappers";
import { getUserFormRules } from "@/schemas/userManagementForm.schema";

export const useUserManagementStore = defineStore("userManagement", () => {
  // === State ===
  const users = ref([]);
  const loading = ref(false);
  const formLoading = ref(false);

  const pagination = reactive({
    currentPage: 1,
    pageSize: 30,
    total: 0,
  });

  const filters = reactive({
    searchKeyword: null,
    role: null,
    status: UserStatus.Active,
  });

  const selectedRowKeys = ref([]);
  const formVisible = ref(false);
  const formMode = ref("create"); // 'create' or 'edit'
  const userForm = initialUserFormState();
  const formRef = ref(null); // For ant design form instance

  const hasSelected = computed(() => selectedRowKeys.value.length > 0);

  // === Actions ===
  // --- Data Fetching ---
  async function fetchUsers() {
    loading.value = true;
    try {
      const filtersParams = {
        name: filters.searchKeyword || null,
        role: filters.role || null,
        status: filters.status || null,
      };
      const response = await userService.getUserList(pagination, filtersParams);
      users.value = [...response.data.data.users];
      pagination.total = response.data.total_page;
      pagination.pageSize = response.data.page_size;
      pagination.currentPage = response.data.page;
      // Clear selection when data is refreshed
      selectedRowKeys.value = [];
    } catch (error) {
      message.error("獲取用戶列表失敗");
      console.error("Failed to fetch users:", error);
    } finally {
      loading.value = false;
    }
  }

  const formTitle = computed(() =>
    formMode.value === "create" ? "新增使用者" : "編輯使用者"
  );

  const formRules = computed(() => getUserFormRules(userForm, formMode));

  // --- Form Actions ---
  const handleFormSubmit = async () => {
    try {
      await formRef.value.validate(); // Validate Ant Design form
      await submitForm(); // Call store action to submit data
      formRef.value.resetFields(); // Reset fields on success
    } catch (errorInfo) {
      console.log("Form validation failed:", errorInfo);
      // Error message is handled within the store's submitForm action
    }
  };

  const handleFormCancel = () => {
    hideForm();
    formRef.value.resetFields(); // Reset fields on cancel
  };

  // --- Pagination & Filtering ---
  function updatePagination(page, size) {
    pagination.currentPage = page;
    pagination.pageSize = size;
    fetchUsers();
  }

  function applyFilters() {
    pagination.currentPage = 1; // Reset to first page when filters change
    fetchUsers();
  }

  function resetFilters() {
    filters.searchKeyword = null;
    filters.role = null;
    filters.status = UserStatus.Active;
    pagination.currentPage = 1;
    fetchUsers();
  }

  // --- Row Selection ---
  function updateSelectedRowKeys(keys) {
    selectedRowKeys.value = keys;
  }

  // --- Form Management ---
  function showCreateForm() {
    formMode.value = "create";
    userForm.value = initialUserFormState().value; // Reset form to initial state
    formVisible.value = true;
  }

  function showEditForm(userRecord) {
    formMode.value = "edit";
    // Populate form, ensure all fields exist in initial state
    userForm.value = {
      ...initialUserFormState().value, // Start with initial structure
      id: userRecord.id,
      username: userRecord.username,
      name: userRecord.name,
      email: userRecord.email,
      phone: userRecord.phone || "",
      role: userRecord.role,
      status: userRecord.status,
      notes: userRecord.notes || "",
      departments: userRecord.departments || [],
      // Passwords are not pre-filled for edit
    };
    formVisible.value = true;
  }

  function hideForm() {
    formVisible.value = false;
    // Optionally reset form here if desired on cancel
    // userForm.value = initialUserFormState().value;
  }

  async function submitForm() {
    formLoading.value = true;
    try {
      const formData = { ...userForm.value };
      // Remove confirmPassword before sending
      delete formData.confirmPassword;

      if (
        formData.role !== UserRole.Student &&
        formData.departments.length > 0
      ) {
        delete formData.departments;
      }

      if (formMode.value === "create") {
        delete formData.status;
        delete formData.id;
        await userService.createUser(formData);
        message.success("使用者創建成功");
      } else {
        delete formData.password;
        delete formData.confirmPassword;
        delete formData.email;
        await userService.updateUser(formData);
        message.success("使用者更新成功");
      }
      hideForm();
      fetchUsers(); // Refresh list after submit
    } catch (error) {
      const actionText = formMode.value === "create" ? "創建" : "更新";
      message.error(
        `${actionText}使用者失敗: ${error.message || "請檢查輸入"}`
      );
      console.error(`Failed to ${formMode.value} user:`, error);
    } finally {
      formLoading.value = false;
    }
  }

  // --- CRUD Operations ---
  async function deleteUser(userId, userName) {
    try {
      await userService.deleteUser(userId);
      message.success(`使用者 "${userName}" 刪除成功`);
      fetchUsers(); // Refresh list
    } catch (error) {
      message.error("刪除使用者失敗");
      console.error("Failed to delete user:", error);
    }
  }

  // === Initial Fetch ===
  function initialize() {
    fetchUsers();
  }

  // --- Table Columns Definition ---
  const columns = computed(() => [
    // { title: "頭像", dataIndex: "avatar", key: "avatar", width: 80 },
    // { title: "帳號", dataIndex: "username", key: "username" },
    { title: "姓名", dataIndex: "name", key: "name" },
    { title: "電子郵件", dataIndex: "email", key: "email" },
    {
      title: "角色",
      dataIndex: "role",
      key: "role",
      customRender: ({ text }) => getRoleText(text),
    },
    {
      title: "電話",
      dataIndex: "telephone",
      key: "telephone",
      customRender: ({ text }) => (text ? text : "-"),
    },
    {
      title: "狀態",
      dataIndex: "status",
      key: "status",
      customRender: ({ text }) => getStatusText(text),
    },
    // {
    //   title: "最後登入",
    //   dataIndex: "lastLogin",
    //   key: "lastLogin",
    //   customRender: ({ text }) => formatLocaleDateTime(text),
    // },
    { title: "操作", key: "action", fixed: "right", width: 200 },
  ]);

  // --- Event Handlers ---
  const handlePageChange = (pagination, filters, sorter) => {
    // Log filters and sorter for debugging or future implementation
    // console.log('Table Filters:', filters);
    // console.log('Table Sorter:', sorter);

    // Update pagination state using the store action
    updatePagination(pagination.current, pagination.pageSize);
  };

  const handleSearch = () => {
    applyFilters();
  };

  const handleResetFilters = () => {
    resetFilters();
  };

  const handleExportUsers = () => {
    exportUsers();
  };

  // --- Row Selection ---
  const rowSelection = computed(() => ({
    selectedRowKeys: selectedRowKeys.value,
    onChange: (keys) => {
      updateSelectedRowKeys(keys);
    },
  }));

  // --- Bulk Operations Confirmation ---
  const confirmBulkOperation = (operation) => {
    const operationText =
      operation === "delete"
        ? "刪除"
        : operation === "activate"
        ? "啟用"
        : "停用";

    Modal.confirm({
      title: `確認批量${operationText}`,
      content: `確定要${operationText}所選的 ${
        selectedRowKeys.value.length
      } 個用戶嗎？${operation === "delete" ? "此操作不可撤銷。" : ""}`,
      okText: "確認",
      okType: operation === "delete" ? "danger" : "primary",
      cancelText: "取消",
      onOk: async () => {
        await bulkOperation(operation);
      },
    });
  };

  // --- Single Delete Confirmation ---
  const confirmSingleDelete = (record) => {
    Modal.confirm({
      title: "確認刪除",
      content: `確定要刪除使用者 "${record.name}" 嗎？此操作不可撤銷。`,
      okText: "確認",
      okType: "danger",
      cancelText: "取消",
      onOk: async () => {
        await deleteUser(record.id, record.name);
      },
    });
  };

  return {
    // State
    users,
    loading,
    formLoading,
    pagination,
    filters,
    selectedRowKeys,
    formVisible,
    formMode,
    userForm,
    formRef,
    formTitle,
    formRules,
    hasSelected,
    columns,
    rowSelection,

    fetchUsers,
    updatePagination,
    applyFilters,
    resetFilters,
    updateSelectedRowKeys,
    showCreateForm,
    showEditForm,
    hideForm,
    submitForm,
    deleteUser,
    initialize,
    handleFormSubmit,
    handleFormCancel,
    handlePageChange,
    handleSearch,
    handleResetFilters,
    handleExportUsers,
    confirmBulkOperation,
    confirmSingleDelete,
  };
});
