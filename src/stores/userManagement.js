import { defineStore } from "pinia";
import { ref, reactive, computed } from "vue";
import { message } from "ant-design-vue";

import userApi from "@/apis/user";
import { initialUserFormState } from "@/schemas/userManagementForm.schema";
import { userService } from "../services/user.service";
import { useUserStore } from "./user";
import { UserRole } from "@/enums/appEnums";

export const useUserManagementStore = defineStore("userManagement", () => {
  // === State ===
  const users = ref([]);
  const loading = ref(false);
  const formLoading = ref(false);
  const exportLoading = ref(false);

  const pagination = reactive({
    currentPage: 1,
    pageSize: 30,
    total: 0,
  });

  const filters = reactive({
    searchKeyword: null,
    role: null,
    status: null,
  });

  const selectedRowKeys = ref([]);
  const formVisible = ref(false);
  const formMode = ref("create"); // 'create' or 'edit'
  const userForm = initialUserFormState();

  const hasSelected = computed(() => selectedRowKeys.value.length > 0);

  // === Actions ===
  // --- Data Fetching ---
  async function fetchUsers() {
    loading.value = true;
    try {
      const filtersParams = {
        name: filters.searchKeyword,
        role: filters.role,
        status: filters.status,
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
    filters.searchKeyword = "";
    filters.role = null;
    filters.status = null;
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

      if (formMode.value === "create") {
        delete formData.status;
        delete formData.id;
        await userService.createUser(formData);
        message.success("使用者創建成功");
      } else {
        delete formData.password;
        delete formData.confirmPassword;
        delete formData.email;
        delete formData.name;
        delete formData.telephone;
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

  // --- Bulk Operations ---
  async function bulkOperation(operation) {
    const operationText =
      operation === "delete"
        ? "刪除"
        : operation === "activate"
        ? "啟用"
        : "停用";
    try {
      const response = await userApi.bulkOperateUsers(
        operation,
        selectedRowKeys.value
      );
      message.success(response.data.message || `批量${operationText}成功`);
      fetchUsers(); // Refresh list
    } catch (error) {
      message.error(`批量${operationText}失敗`);
      console.error("Bulk operation failed:", error);
    }
  }

  // --- Export ---
  async function exportUsers() {
    exportLoading.value = true;
    try {
      const response = await userApi.exportUsersAsCsv();
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `users_${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url); // Clean up blob URL
      message.success("用戶資料導出成功");
    } catch (error) {
      message.error("導出用戶資料失敗");
      console.error("Failed to export users:", error);
    } finally {
      exportLoading.value = false;
    }
  }

  // === Initial Fetch ===
  function initialize() {
    fetchUsers();
  }

  const filteredUsers = computed(() => {
    const userStore = useUserStore();
    const currentUserRole = userStore.userProfile.userRole;

    return users.value.filter((user) => {
      // 1. 當 userRole 不為 creator 時，過濾掉 creator 角色的用戶
      if (
        currentUserRole !== UserRole.Creator &&
        user.role === UserRole.Creator
      ) {
        return false;
      }

      // 2. 應用關鍵字搜尋過濾條件
      if (filters.searchKeyword && filters.searchKeyword.trim() !== "") {
        const keyword = filters.searchKeyword.toLowerCase();
        const matchesKeyword =
          (user.name && user.name.toLowerCase().includes(keyword)) ||
          (user.username && user.username.toLowerCase().includes(keyword)) ||
          (user.email && user.email.toLowerCase().includes(keyword)) ||
          (user.phone && user.phone.toLowerCase().includes(keyword));

        if (!matchesKeyword) return false;
      }

      // 3. 應用角色過濾條件
      if (filters.role && user.role !== filters.role) {
        return false;
      }

      // 4. 應用狀態過濾條件
      if (filters.status !== null && user.status !== filters.status) {
        return false;
      }

      // 通過所有過濾條件
      return true;
    });
  });

  return {
    // State
    users,
    loading,
    formLoading,
    exportLoading,
    pagination,
    filters,
    selectedRowKeys,
    formVisible,
    formMode,
    userForm,
    // Getters

    hasSelected,
    filteredUsers,
    // Actions
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
    bulkOperation,
    exportUsers,
    initialize,
  };
});
