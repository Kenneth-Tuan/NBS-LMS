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
import * as XLSX from "xlsx";
import dayjs from "dayjs";
import { DEPARTMENTS_LABEL_MAP } from "@/constant/common.constant";

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
      student_id: userRecord.student_id || "",
      admission_time: userRecord.admission_time
        ? userRecord.admission_time.slice(0, 10)
        : null,
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

      if (formData.role !== UserRole.Student) {
        delete formData.departments;
        delete formData.student_id;
        delete formData.admission_time;
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
    // { title: "電子郵件", dataIndex: "email", key: "email" },
    {
      title: "學號",
      dataIndex: "student_id",
      key: "student_id",
      customRender: ({ text }) => text || "-",
    },
    {
      title: "入學時間",
      dataIndex: "admission_time",
      key: "admission_time",
      customRender: ({ text }) => (text ? text.slice(0, 10) : "-"),
    },
    {
      title: "角色/科別",
      dataIndex: "role",
      key: "role",
      customRender: ({ text }) => getRoleText(text),
    },
    // {
    //   title: "電話",
    //   dataIndex: "telephone",
    //   key: "telephone",
    //   customRender: ({ text }) => (text ? text : "-"),
    // },
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

  const exportUsers = async () => {
    try {
      loading.value = true;
      // Fetch all active students
      const filter = {
        role: UserRole.Student,
        status: UserStatus.Active,
      };
      // Use a fixed page size to fetch the first page and determine total pages
      const pageSize = 30;
      const initialResponse = await userService.getUserList(
        { currentPage: 1, pageSize },
        filter
      );
      
      let activeStudents = initialResponse.data?.data?.users || [];
      const totalPage = initialResponse.data?.total_page || 1;

      // Fetch remaining pages if any
      if (totalPage > 1) {
        const promises = [];
        for (let i = 2; i <= totalPage; i++) {
          promises.push(
            userService.getUserList({ currentPage: i, pageSize }, filter)
          );
        }
        
        const responses = await Promise.all(promises);
        responses.forEach((res) => {
          const pageUsers = res.data?.data?.users || [];
          activeStudents.push(...pageUsers);
        });
      }

      if (activeStudents.length === 0) {
        message.warning("沒有找到符合條件的學生資料");
        return;
      }

      // Map data to requested columns
      const data = activeStudents.map((student) => {
        const departments = student.departments
          ? student.departments.map((dep) => DEPARTMENTS_LABEL_MAP[dep] || dep).join(", ")
          : "-";

        return {
          學生姓名: student.name || "-",
          學號: student.student_id || "-",
          入學日期: student.admission_time ? student.admission_time.slice(0, 10) : "-",
          科別: departments,
          電子郵件: student.email || "-",
          電話: student.phone || "-",
        };
      });

      // Generate Excel file
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "學生資料");
      XLSX.writeFile(wb, `學生資料_${dayjs().format("YYYYMMDD_HHmm")}.xlsx`);
      
      message.success("學生資料匯出成功");
    } catch (error) {
      console.error("Export users failed:", error);
      message.error("匯出資料失敗，請稍後再試");
    } finally {
      loading.value = false;
    }
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
    exportUsers,
    confirmBulkOperation,
    confirmSingleDelete,
  };
});
